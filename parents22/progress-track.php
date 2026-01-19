<?php
// Playful Mind Academy • Progress Tracking API (SQLite by default)
// This backend is optional — your page works with localStorage.
// Use it if/when you want to persist data on the server.
//
// Endpoints (send JSON for POST/PATCH/DELETE):
//   GET    ?action=ping
//   GET    ?action=listChildren
//   POST   ?action=addChild            {name}
//   PATCH  ?action=updateChild         {id, name?}
//   DELETE ?action=deleteChild         {id}
//
//   GET    ?action=listActivities&childId=ID
//   POST   ?action=addActivity         {childId, title, category, points, icon}
//   PATCH  ?action=updateActivity      {id, title?, category?, points?, icon?, minutes?, status?}
//   PATCH  ?action=completeActivity    {id}      // also adds points to child and updates streak
//   DELETE ?action=removeActivity      {id}
//
// Configure via env vars (for MySQL/PgSQL switch):
//   DB_DSN="sqlite:/path/to/progress.db" (default ./progress.db)
//   DB_USER, DB_PASS (not needed for SQLite)

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

function envv(string $k, $d=null){ $v=getenv($k); return $v===false?$d:$v; }
function out($data, int $code=200){ http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES); exit; }
function injson(){ $raw=file_get_contents('php://input'); if(!$raw) return []; $d=json_decode($raw,true); return is_array($d)?$d:[]; }

$dsn  = envv('DB_DSN', 'sqlite:' . __DIR__ . '/progress.db');
$user = envv('DB_USER');
$pass = envv('DB_PASS');

try{
  $pdo=new PDO($dsn,$user,$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
}catch(Throwable $e){ out(['ok'=>false,'error'=>'DB connect failed','detail'=>$e->getMessage()],500); }

// SQLite FK on
try{ $pdo->exec('PRAGMA foreign_keys = ON'); }catch(Throwable $e){}

try{
  $pdo->exec("CREATE TABLE IF NOT EXISTS children(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    days  TEXT DEFAULT '[]',  -- ISO dates as JSON array for streaks
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )");
  $pdo->exec("CREATE TABLE IF NOT EXISTS activities(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    child_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT,
    points INTEGER DEFAULT 10,
    icon TEXT,
    minutes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending/completed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(child_id) REFERENCES children(id) ON DELETE CASCADE
  )");
}catch(Throwable $e){ out(['ok'=>false,'error'=>'Schema init failed','detail'=>$e->getMessage()],500); }

$action = $_GET['action'] ?? '';

function childById(PDO $pdo,int $id){ $s=$pdo->prepare("SELECT * FROM children WHERE id=?"); $s->execute([$id]); return $s->fetch(); }
function actById(PDO $pdo,int $id){ $s=$pdo->prepare("SELECT * FROM activities WHERE id=?"); $s->execute([$id]); return $s->fetch(); }
function json_days_push(array $days): array {
  $today = new DateTime('today');
  if (!$days) $days=[];
  $last = end($days);
  if (!$last || (new DateTime($last)) < $today) $days[] = $today->format('Y-m-d');
  return array_values($days);
}

try{
  switch($action){

    case 'ping': out(['ok'=>true,'message'=>'pong']);

    // Children
    case 'listChildren':
      $st=$pdo->query("SELECT * FROM children ORDER BY created_at DESC");
      out(['ok'=>true,'data'=>$st->fetchAll()]);

    case 'addChild': {
      $in=array_merge($_POST,injson());
      $name=trim($in['name']??'');
      if($name==='') out(['ok'=>false,'error'=>'name required'],422);
      $st=$pdo->prepare("INSERT INTO children(name,score,days) VALUES(?,0,'[]')"); $st->execute([$name]);
      $id=(int)$pdo->lastInsertId(); out(['ok'=>true,'data'=>childById($pdo,$id)]);
    }

    case 'updateChild': {
      $in=injson();
      $id=(int)($in['id']??0); if(!$id) out(['ok'=>false,'error'=>'id required'],422);
      $sets=[]; $vals=[];
      if(isset($in['name'])) { $sets[]='name=?'; $vals[]=$in['name']; }
      if(isset($in['score'])){ $sets[]='score=?'; $vals[]=(int)$in['score']; }
      if(isset($in['days'])) { $sets[]='days=?'; $vals[]=json_encode($in['days']); }
      if(!$sets) out(['ok'=>false,'error'=>'no fields'],422);
      $vals[]=$id; $sql="UPDATE children SET ".implode(',',$sets)." WHERE id=?";
      $st=$pdo->prepare($sql); $st->execute($vals);
      out(['ok'=>true,'data'=>childById($pdo,$id)]);
    }

    case 'deleteChild': {
      $in=injson(); $id=(int)($in['id']??0); if(!$id) out(['ok'=>false,'error'=>'id required'],422);
      $st=$pdo->prepare("DELETE FROM children WHERE id=?"); $st->execute([$id]);
      out(['ok'=>true,'deletedId'=>$id]);
    }

    // Activities
    case 'listActivities': {
      $childId=(int)($_GET['childId']??0); if(!$childId) out(['ok'=>false,'error'=>'childId required'],422);
      $s=$pdo->prepare("SELECT * FROM activities WHERE child_id=? ORDER BY created_at DESC"); $s->execute([$childId]);
      out(['ok'=>true,'data'=>$s->fetchAll()]);
    }

    case 'addActivity': {
      $in=injson();
      $childId=(int)($in['childId']??0); $title=trim($in['title']??'');
      if(!$childId || $title==='') out(['ok'=>false,'error'=>'childId and title required'],422);
      $s=$pdo->prepare("INSERT INTO activities(child_id,title,category,points,icon,minutes,status) VALUES(?,?,?,?,?,0,'pending')");
      $s->execute([$childId,$title,$in['category']??null,(int)($in['points']??10),$in['icon']??'🎯']);
      $id=(int)$pdo->lastInsertId(); out(['ok'=>true,'data'=>actById($pdo,$id)]);
    }

    case 'updateActivity': {
      $in=injson(); $id=(int)($in['id']??0); if(!$id) out(['ok'=>false,'error'=>'id required'],422);
      $map=['title','category','icon','status']; $sets=[]; $vals=[];
      foreach($map as $k){ if(array_key_exists($k,$in)){ $sets[]="$k=?"; $vals[]=$in[$k]; } }
      if(array_key_exists('points',$in)){ $sets[]='points=?'; $vals[]=(int)$in['points']; }
      if(array_key_exists('minutes',$in)){ $sets[]='minutes=?'; $vals[]=(int)$in['minutes']; }
      if(!$sets) out(['ok'=>false,'error'=>'no fields'],422);
      $vals[]=$id; $sql="UPDATE activities SET ".implode(',',$sets)." WHERE id=?";
      $s=$pdo->prepare($sql); $s->execute($vals);
      out(['ok'=>true,'data'=>actById($pdo,$id)]);
    }

    case 'removeActivity': {
      $in=injson(); $id=(int)($in['id']??0); if(!$id) out(['ok'=>false,'error'=>'id required'],422);
      $s=$pdo->prepare("DELETE FROM activities WHERE id=?"); $s->execute([$id]);
      out(['ok'=>true,'deletedId'=>$id]);
    }

    case 'completeActivity': {
      $in=injson(); $id=(int)($in['id']??0); if(!$id) out(['ok'=>false,'error'=>'id required'],422);
      $a=actById($pdo,$id); if(!$a) out(['ok'=>false,'error'=>'activity not found'],404);
      $c=childById($pdo,(int)$a['child_id']); if(!$c) out(['ok'=>false,'error'=>'child not found'],404);

      $pdo->beginTransaction();
      try{
        $s=$pdo->prepare("UPDATE activities SET status='completed' WHERE id=?"); $s->execute([$id]);

        // bump score and streak day
        $score=(int)$c['score'] + (int)$a['points'];
        $days=json_decode((string)$c['days'], true) ?: [];
        $days = json_days_push($days);
        $s=$pdo->prepare("UPDATE children SET score=?, days=? WHERE id=?");
        $s->execute([$score, json_encode($days), (int)$c['id']]);

        $pdo->commit();
      }catch(Throwable $e){ $pdo->rollBack(); throw $e; }

      out(['ok'=>true,'activity'=>actById($pdo,$id),'child'=>childById($pdo,(int)$c['id'])]);
    }

    default:
      out([
        'ok'=>true,
        'endpoints'=>[
          'GET  ?action=ping',
          'GET  ?action=listChildren',
          'POST ?action=addChild {name}',
          'PATCH ?action=updateChild {id, name?}',
          'DELETE ?action=deleteChild {id}',
          'GET  ?action=listActivities&childId=ID',
          'POST ?action=addActivity {childId,title,category?,points?,icon?}',
          'PATCH ?action=updateActivity {id, fields...}',
          'PATCH ?action=completeActivity {id}',
          'DELETE ?action=removeActivity {id}'
        ]
      ]);
  }
}catch(Throwable $e){
  out(['ok'=>false,'error'=>'Unhandled','detail'=>$e->getMessage()],500);
}