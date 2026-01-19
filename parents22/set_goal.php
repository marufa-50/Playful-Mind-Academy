<?php
// Playful Academy • Minimal API for Set Goal page
// - Uses PDO (SQLite by default). You can switch to MySQL/Postgres by setting env vars below.
// - Provides clean endpoints for children, goals, and day plans (no catalog exposure).
// - Safe prepared statements; CORS enabled for easy local dev.
//
// Configure via environment variables (recommended):
//   DB_DSN="sqlite:/path/to/playful.db"   (default uses ./playful.db)
//   DB_USER="your_user"                   (not needed for SQLite)
//   DB_PASS="your_password"
//
// Example DSNs:
//   SQLite:  sqlite:/var/www/html/playful.db
//   MySQL:   mysql:host=localhost;dbname=playful;charset=utf8mb4
//   PgSQL:   pgsql:host=localhost;port=5432;dbname=playful

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

function respond($data, int $status = 200) {
  http_response_code($status);
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}
function json_input(): array {
  $raw = file_get_contents('php://input');
  if (!$raw) return [];
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}
function env(string $key, $default = null) {
  $v = getenv($key);
  return $v !== false ? $v : $default;
}

$dsn  = env('DB_DSN', 'sqlite:' . __DIR__ . '/playful.db');
$user = env('DB_USER', null);
$pass = env('DB_PASS', null);

try {
  $pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  ]);
} catch (Throwable $e) {
  respond(['ok' => false, 'error' => 'DB connect failed', 'detail' => $e->getMessage()], 500);
}

// Enable FK for SQLite
try { $pdo->exec('PRAGMA foreign_keys = ON'); } catch (Throwable $e) {}

try {
  // Schema (id ints are auto increment in SQLite/MySQL; serial in PgSQL works with this too)
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS children (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      ext_id   TEXT,
      name     TEXT NOT NULL,
      color    TEXT,
      emoji    TEXT,
      points   INTEGER DEFAULT 0,
      streak   INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  ");
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS goals (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      ext_id    TEXT,
      child_id  INTEGER NOT NULL,
      title     TEXT NOT NULL,
      category  TEXT,
      specific  TEXT,
      measurable TEXT,
      achievable TEXT,
      relevant  TEXT,
      timebound TEXT,
      reward    TEXT,
      points    INTEGER DEFAULT 10,
      status    TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(child_id) REFERENCES children(id) ON DELETE CASCADE
    );
  ");
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS day_plans (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_date TEXT NOT NULL UNIQUE,
      ext_id    TEXT
    );
  ");
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS plan_items (
      plan_id INTEGER NOT NULL,
      goal_id INTEGER NOT NULL,
      PRIMARY KEY (plan_id, goal_id),
      FOREIGN KEY(plan_id) REFERENCES day_plans(id) ON DELETE CASCADE,
      FOREIGN KEY(goal_id) REFERENCES goals(id) ON DELETE CASCADE
    );
  ");
} catch (Throwable $e) {
  respond(['ok'=>false,'error'=>'Schema init failed','detail'=>$e->getMessage()], 500);
}

function get_param(string $key, $default = null) {
  return $_GET[$key] ?? $_POST[$key] ?? $default;
}
$action = get_param('action');

// Helper fetchers
function childById(PDO $pdo, int $id) {
  $st = $pdo->prepare("SELECT * FROM children WHERE id=?");
  $st->execute([$id]);
  return $st->fetch();
}
function goalById(PDO $pdo, int $id) {
  $st = $pdo->prepare("SELECT * FROM goals WHERE id=?");
  $st->execute([$id]);
  return $st->fetch();
}
function planByDate(PDO $pdo, string $date) {
  $st = $pdo->prepare("SELECT * FROM day_plans WHERE plan_date=?");
  $st->execute([$date]);
  return $st->fetch();
}
function ensurePlan(PDO $pdo, string $date, ?string $extId = null) {
  $plan = planByDate($pdo, $date);
  if ($plan) return $plan;
  $st = $pdo->prepare("INSERT INTO day_plans (plan_date, ext_id) VALUES (?, ?)");
  $st->execute([$date, $extId]);
  $id = (int)$pdo->lastInsertId();
  return ['id'=>$id, 'plan_date'=>$date, 'ext_id'=>$extId];
}

// Router
try {
  switch ($action) {

    // Health check
    case 'ping':
      respond(['ok'=>true, 'message'=>'pong']);

    // ---- Children ----
    case 'listChildren': {
      $st = $pdo->query("SELECT * FROM children ORDER BY created_at DESC");
      respond(['ok'=>true, 'data'=>$st->fetchAll()]);
    }
    case 'addChild': {
      $in = array_merge($_POST, json_input());
      $name = trim((string)($in['name'] ?? ''));
      if ($name === '') respond(['ok'=>false,'error'=>'name required'], 422);
      $st = $pdo->prepare("INSERT INTO children (ext_id, name, color, emoji, points, streak) VALUES (?, ?, ?, ?, ?, ?)");
      $st->execute([
        $in['extId'] ?? null,
        $name,
        $in['color'] ?? null,
        $in['emoji'] ?? null,
        (int)($in['points'] ?? 0),
        (int)($in['streak'] ?? 0),
      ]);
      $id = (int)$pdo->lastInsertId();
      respond(['ok'=>true,'data'=>childById($pdo,$id)]);
    }
    case 'updateChild': {
      $in = array_merge($_POST, json_input());
      $id = (int)($in['id'] ?? 0);
      if (!$id) respond(['ok'=>false,'error'=>'id required'], 422);
      $fields = ['ext_id','name','color','emoji','points','streak'];
      $sets = []; $vals = [];
      foreach ($fields as $f) {
        if (array_key_exists($f==='ext_id'?'extId':$f, $in)) {
          $sets[] = "$f=?";
          $vals[] = ($f==='points' || $f==='streak') ? (int)$in[$f] : ($f==='ext_id' ? $in['extId'] : $in[$f]);
        }
      }
      if (!$sets) respond(['ok'=>false,'error'=>'no fields to update'], 422);
      $vals[] = $id;
      $sql = "UPDATE children SET ".implode(',',$sets)." WHERE id=?";
      $st = $pdo->prepare($sql); $st->execute($vals);
      respond(['ok'=>true,'data'=>childById($pdo,$id)]);
    }

    // ---- Goals ----
    case 'listGoals': {
      $childId = (int) get_param('childId', 0);
      $status  = get_param('status', null);
      $conds = []; $vals = [];
      if ($childId) { $conds[] = 'child_id=?'; $vals[] = $childId; }
      if ($status)  { $conds[] = 'status=?';   $vals[] = $status; }
      $sql = "SELECT * FROM goals".($conds?(' WHERE '.implode(' AND ',$conds)):'')." ORDER BY created_at DESC";
      $st = $pdo->prepare($sql); $st->execute($vals);
      respond(['ok'=>true, 'data'=>$st->fetchAll()]);
    }
    case 'addGoal': {
      $in = array_merge($_POST, json_input());
      $title = trim((string)($in['title'] ?? ''));
      $childId = (int)($in['childId'] ?? 0);
      if ($title === '' || !$childId) respond(['ok'=>false,'error'=>'title and childId required'], 422);
      $st = $pdo->prepare("
        INSERT INTO goals (ext_id, child_id, title, category, specific, measurable, achievable, relevant, timebound, reward, points, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ");
      $st->execute([
        $in['extId'] ?? null, $childId, $title,
        $in['category'] ?? null, $in['specific'] ?? null, $in['measurable'] ?? null, $in['achievable'] ?? null, $in['relevant'] ?? null,
        $in['timebound'] ?? null, $in['reward'] ?? null, (int)($in['points'] ?? 10), $in['status'] ?? 'active'
      ]);
      $id = (int)$pdo->lastInsertId();
      respond(['ok'=>true,'data'=>goalById($pdo,$id)]);
    }
    case 'updateGoal': {
      $in = array_merge($_POST, json_input());
      $id = (int)($in['id'] ?? 0);
      if (!$id) respond(['ok'=>false,'error'=>'id required'], 422);
      $fieldsMap = [
        'ext_id'=>'extId','child_id'=>'childId','title'=>'title','category'=>'category',
        'specific'=>'specific','measurable'=>'measurable','achievable'=>'achievable',
        'relevant'=>'relevant','timebound'=>'timebound','reward'=>'reward',
        'points'=>'points','status'=>'status'
      ];
      $sets = []; $vals = [];
      foreach ($fieldsMap as $col=>$inKey) {
        if (array_key_exists($inKey, $in)) {
          $sets[] = "$col=?"; $vals[] = ($col==='points' ? (int)$in[$inKey] : $in[$inKey]);
        }
      }
      if (!$sets) respond(['ok'=>false,'error'=>'no fields to update'], 422);
      $vals[] = $id;
      $sql = "UPDATE goals SET ".implode(',',$sets)." WHERE id=?";
      $st = $pdo->prepare($sql); $st->execute($vals);
      respond(['ok'=>true,'data'=>goalById($pdo,$id)]);
    }
    case 'deleteGoal': {
      $in = array_merge($_POST, json_input());
      $id = (int)($in['id'] ?? 0);
      if (!$id) respond(['ok'=>false,'error'=>'id required'], 422);
      $st = $pdo->prepare("DELETE FROM goals WHERE id=?"); $st->execute([$id]);
      respond(['ok'=>true,'deletedId'=>$id]);
    }
    case 'completeGoal': {
      $in = array_merge($_POST, json_input());
      $id = (int)($in['id'] ?? 0);
      if (!$id) respond(['ok'=>false,'error'=>'id required'], 422);
      $g = goalById($pdo, $id);
      if (!$g) respond(['ok'=>false,'error'=>'goal not found'], 404);
      $pdo->beginTransaction();
      try {
        $st = $pdo->prepare("UPDATE goals SET status='completed' WHERE id=?");
        $st->execute([$id]);
        $st2 = $pdo->prepare("UPDATE children SET points=points+?, streak=streak+1 WHERE id=?");
        $st2->execute([(int)$g['points'], (int)$g['child_id']]);
        $pdo->commit();
      } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
      }
      respond(['ok'=>true,'data'=>goalById($pdo,$id)]);
    }

    // ---- Day planning ----
    case 'planGoal': {
      $in = array_merge($_POST, json_input());
      $goalId = (int)($in['goalId'] ?? 0);
      $date   = (string)($in['date'] ?? '');
      if (!$goalId || $date==='') respond(['ok'=>false,'error'=>'goalId and date required'], 422);
      $plan = ensurePlan($pdo, $date, $in['extId'] ?? null);
      // Check duplication
      $chk = $pdo->prepare("SELECT 1 FROM plan_items WHERE plan_id=? AND goal_id=?");
      $chk->execute([(int)$plan['id'], $goalId]);
      if (!$chk->fetch()) {
        $st = $pdo->prepare("INSERT INTO plan_items (plan_id, goal_id) VALUES (?, ?)");
        $st->execute([(int)$plan['id'], $goalId]);
      }
      respond(['ok'=>true,'plan'=>['date'=>$date,'extId'=>$plan['ext_id']],'goalId'=>$goalId]);
    }
    case 'unplanGoal': {
      $in = array_merge($_POST, json_input());
      $goalId = (int)($in['goalId'] ?? 0);
      $date   = (string)($in['date'] ?? '');
      if (!$goalId || $date==='') respond(['ok'=>false,'error'=>'goalId and date required'], 422);
      $plan = planByDate($pdo, $date);
      if ($plan) {
        $st = $pdo->prepare("DELETE FROM plan_items WHERE plan_id=? AND goal_id=?");
        $st->execute([(int)$plan['id'], $goalId]);
      }
      respond(['ok'=>true,'removed'=>true]);
    }
    case 'getDayPlan': {
      $date = (string) get_param('date', '');
      if ($date==='') respond(['ok'=>false,'error'=>'date required'], 422);
      $plan = planByDate($pdo, $date);
      if (!$plan) respond(['ok'=>true,'data'=>['date'=>$date,'extId'=>null,'goals'=>[]]]);
      $st = $pdo->prepare("
        SELECT g.* FROM plan_items pi
        JOIN goals g ON g.id = pi.goal_id
        WHERE pi.plan_id = ?
        ORDER BY g.created_at DESC
      ");
      $st->execute([(int)$plan['id']]);
      respond(['ok'=>true,'data'=>['date'=>$date,'extId'=>$plan['ext_id'],'goals'=>$st->fetchAll()]]);
    }
    case 'setPlanMeta': {
      $in = array_merge($_POST, json_input());
      $date = (string)($in['date'] ?? '');
      $extId = (string)($in['extId'] ?? '');
      if ($date==='') respond(['ok'=>false,'error'=>'date required'], 422);
      $plan = ensurePlan($pdo, $date);
      $st = $pdo->prepare("UPDATE day_plans SET ext_id=? WHERE id=?");
      $st->execute([$extId, (int)$plan['id']]);
      respond(['ok'=>true,'data'=>['date'=>$date,'extId'=>$extId]]);
    }

    default:
      respond([
        'ok'=>true,
        'endpoints'=>[
          'GET  ?action=ping',
          'GET  ?action=listChildren',
          'POST ?action=addChild {extId?, name, color?, emoji?, points?, streak?}',
          'POST ?action=updateChild {id, ...fields}',
          'GET  ?action=listGoals&childId?&status?',
          'POST ?action=addGoal {...}',
          'POST ?action=updateGoal {id, ...fields}',
          'POST ?action=deleteGoal {id}',
          'POST ?action=completeGoal {id}',
          'GET  ?action=getDayPlan&date=YYYY-MM-DD',
          'POST ?action=planGoal {goalId, date, extId?}',
          'POST ?action=unplanGoal {goalId, date}',
          'POST ?action=setPlanMeta {date, extId}'
        ],
        'note'=>'Send JSON bodies for POST. This API intentionally exposes no database catalog.'
      ]);
  }
} catch (Throwable $e) {
  respond(['ok'=>false,'error'=>'Unhandled error','detail'=>$e->getMessage()], 500);
}