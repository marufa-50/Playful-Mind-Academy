<?php
// Simple mock API to support the demo UI.
// NOTE: This is not production-grade; it's here to provide JSON to the frontend.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$action = $_GET['action'] ?? ($_POST['action'] ?? 'none');

switch ($action) {
  case 'subscribe':
    $plan = $_POST['plan'] ?? 'free';
    echo json_encode([
      'status' => 'ok',
      'plan' => $plan,
      'message' => "Subscribed to plan: " . ucfirst($plan)
    ]);
    break;

  case 'health':
    echo json_encode([
      'child' => ['id'=>1, 'name'=>'Avery', 'age'=>8],
      'records' => [
        ['id'=>11,'type'=>'Immunization','notes'=>'MMR booster completed','createdAt'=>date('c', strtotime('-90 days'))],
        ['id'=>12,'type'=>'Allergy','notes'=>'Peanut allergy — EpiPen carried','createdAt'=>date('c', strtotime('-400 days'))],
        ['id'=>13,'type'=>'Checkup','notes'=>'Annual physical scheduled','createdAt'=>date('c', strtotime('+14 days'))],
      ]
    ]);
    break;

  case 'progress':
    echo json_encode([
      'metrics' => [
        'completedTasks' => 14,
        'scores' => [88, 92, 78, 95, 84],
        'timeOnTask' => 230
      ],
      'badges' => ['Math Star', 'Reading Streak', 'Focus Hero']
    ]);
    break;

  case 'resources':
    echo json_encode([
      'resources' => [
        ['id'=>301,'title'=>'Fractions Basics','subject'=>'Math','duration'=>20,'format'=>'interactive'],
        ['id'=>302,'title'=>'Plant Life Cycle','subject'=>'Science','duration'=>25,'format'=>'video'],
        ['id'=>303,'title'=>'Story Sequencing','subject'=>'Reading','duration'=>15,'format'=>'worksheet']
      ]
    ]);
    break;

  case 'goals':
    echo json_encode([
      'goals' => [
        ['id'=>501,'title'=>'Read 5 chapters','status'=>'in_progress'],
        ['id'=>502,'title'=>'Master 10 new words','status'=>'planned']
      ]
    ]);
    break;

  case 'screen':
    echo json_encode([
      'quotas' => ['daily'=>60, 'weekly'=>420],
      'windows' => ['bedtime'=>'8:00 PM – 7:00 AM'],
      'categoryCaps' => ['video'=>30, 'games'=>40]
    ]);
    break;

  case 'filters':
    echo json_encode([
      'ratings' => 'Family',
      'whitelist' => ['academy.playful.example', 'kids.science.example'],
      'blacklist' => ['adult.example', 'violent.example'],
      'keywords' => ['gambling', 'explicit']
    ]);
    break;

  case 'calendar':
    $day = $_GET['day'] ?? 'Thursday';
    $base = strtotime('next ' . $day);
    echo json_encode([
      'day' => $day,
      'events' => [
        ['title'=>'Math practice','start'=>date('c', $base + 9*3600), 'end'=>date('c', $base + 10*3600)],
        ['title'=>'Reading circle','start'=>date('c', $base + 11*3600), 'end'=>date('c', $base + 12*3600)],
        ['title'=>'Break & games','start'=>date('c', $base + 15*3600), 'end'=>date('c', $base + 16*3600)]
      ]
    ]);
    break;

  case 'games':
    echo json_encode([
      'games' => [
        ['id'=>801,'title'=>'Puzzle Path','skills'=>['Logic','Sequencing'],'guidelines'=>'Read hints, 20-minute sessions'],
        ['id'=>802,'title'=>'Word Builder','skills'=>['Vocabulary','Spelling'],'guidelines'=>'Aim for 15 words per run'],
        ['id'=>803,'title'=>'Number Quest','skills'=>['Arithmetic','Pattern'],'guidelines'=>'Stay within 25 minutes']
      ]
    ]);
    break;

  case 'faqs':
    echo json_encode([
      'faqs' => [
        ['q'=>'How do I set screen time limits?', 'a'=>'Open the Screen Time tile and adjust daily/weekly quotas.'],
        ['q'=>'Can educators add content?', 'a'=>'Yes, via Educational Resources with educator accounts.'],
        ['q'=>'How do I share health records?', 'a'=>'Use View Health Info → Share record to create an expiring link.']
      ]
    ]);
    break;

  default:
    http_response_code(404);
    echo json_encode(['error'=>'Unknown action']);
}