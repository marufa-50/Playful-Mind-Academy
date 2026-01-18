/* Playful Academy — Activity Resources
   Non-academic, fun-first activities; points and streak tracking; parents read-only panel.
   Data is stored in localStorage. Buttons perform actions.
*/

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* ---------- Data ---------- */
const defaultActivities = [
  {
    id: 'game-memory',
    title: 'Memory Match Game',
    category: 'Games',
    format: 'Indoor',
    ageMin: 4, ageMax: 10,
    points: 15,
    desc: 'Flip cards and find pairs. Play solo or with family.',
    steps: [
      'Shuffle and place cards face-down.',
      'Flip two at a time — remember positions.',
      'Match pairs and cheer loudly!'
    ],
    meter: 72
  },
  {
    id: 'drawing-doodle',
    title: 'Creative Doodle',
    category: 'Drawing',
    format: 'Indoor',
    ageMin: 3, ageMax: 12,
    points: 20,
    desc: 'Draw your mood using three colors. Add stickers or glitter.',
    steps: [
      'Pick three favorite colors.',
      'Draw feelings as shapes or lines.',
      'Share your art and name it!'
    ],
    meter: 55
  },
  {
    id: 'task-tidy-room',
    title: 'Tidy My Room',
    category: 'Daily Tasks',
    format: 'Indoor',
    ageMin: 5, ageMax: 14,
    points: 25,
    desc: 'Clean-up sprint! Put toys away, fold clothes, recycle papers.',
    steps: [
      'Set a 10-minute timer.',
      'Pick up toys and books first.',
      'Wipe desk/table and smile at your space.'
    ],
    meter: 40
  },
  {
    id: 'help-mother-set-table',
    title: 'Help Mother: Set the Table',
    category: 'Help Mother',
    format: 'Indoor',
    ageMin: 4, ageMax: 12,
    points: 18,
    desc: 'Be the dinner assistant — napkins, plates, cups, done!',
    steps: ['Wash hands', 'Place napkins', 'Arrange plates & cups'],
    meter: 68
  },
  {
    id: 'donation-share-toy',
    title: 'Donation: Share a Toy',
    category: 'Donation',
    format: 'Community',
    ageMin: 6, ageMax: 14,
    points: 35,
    desc: 'Pick a toy you outgrew and donate to a local charity.',
    steps: ['Choose a toy', 'Clean it gently', 'Pack it nicely'],
    meter: 30
  },
  {
    id: 'physical-nature-walk',
    title: 'Nature Walk Bingo',
    category: 'Physical',
    format: 'Outdoor',
    ageMin: 5, ageMax: 14,
    points: 22,
    desc: 'Walk outside and spot 5 things: bird, cloud, leaf, flower, bug.',
    steps: ['Wear comfy shoes', 'Take water', 'Check 5 nature items'],
    meter: 60
  },
  {
    id: 'social-call-friend',
    title: 'Say Hi to a Friend',
    category: 'Socialization',
    format: 'Community',
    ageMin: 4, ageMax: 14,
    points: 12,
    desc: 'Send a kind note or voice message to a friend or relative.',
    steps: ['Think of a person', 'Share a kind message', 'Smile together'],
    meter: 50
  }
];

const store = {
  get() {
    const raw = localStorage.getItem('playfulAcademy');
    if (!raw) return {
      child: { name: 'Your Child', age: null, avatar: '🧒' },
      points: 0,
      streak: 0,
      lastCompleteDate: null,
      activities: defaultActivities,
      log: []
    };
    try { return JSON.parse(raw); } catch { return this.reset(); }
  },
  set(data) { localStorage.setItem('playfulAcademy', JSON.stringify(data)); },
  reset() {
    const data = {
      child: { name: 'Your Child', age: null, avatar: '🧒' },
      points: 0,
      streak: 0,
      lastCompleteDate: null,
      activities: defaultActivities,
      log: []
    };
    this.set(data);
    return data;
  }
};

let state = store.get();

/* ---------- UI Helpers ---------- */
function toast(msg){
  const el = $('#toast');
  el.textContent = msg;
  el.hidden = false;
  setTimeout(()=>{ el.hidden = true; }, 1800);
}

function levelForPoints(pts){
  if (pts >= 200) return 'Champion 🏆';
  if (pts >= 120) return 'Pro ⭐';
  if (pts >= 60)  return 'Explorer 🚀';
  return 'Seedling 🌱';
}

function updateProgress(){
  $('#pointsLabel').textContent = `${state.points} pts`;
  $('#levelBadge').textContent = levelForPoints(state.points);
  const pct = Math.min(100, Math.round((state.points % 60) / 60 * 100));
  $('#pointsProgress').style.width = `${pct}%`;
  $('#streakCount').textContent = `Streak: ${state.streak} day${state.streak===1?'':'s'}`;
}

/* ---------- Render Activities ---------- */
function renderActivities(){
  const grid = $('#activityGrid');
  grid.innerHTML = '';

  const ageFocus = Number($('#ageRange').value);
  const activeCat = [...$$('.chip[data-category]')].find(c=>c.classList.contains('active')).dataset.category;
  const activeFormat = [...$$('.chip[data-format]')].find(c=>c.classList.contains('active')).dataset.format;
  const q = $('#searchBox').value.trim().toLowerCase();

  state.activities
    .filter(a => (
      (!state.child.age || (a.ageMin <= ageFocus && a.ageMax >= ageFocus)) &&
      (activeCat === 'All' || a.category === activeCat) &&
      (activeFormat === 'Any' || a.format === activeFormat) &&
      (q === '' || a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q))
    ))
    .forEach(a=>{
      const card = document.createElement('div');
      card.className = 'card activity-card';

      const title = document.createElement('h3');
      title.textContent = a.title;

      const kicker = document.createElement('div');
      kicker.className = 'kicker';
      kicker.textContent = `${a.category} • ${a.format} • Ages ${a.ageMin}-${a.ageMax}`;

      const bar = document.createElement('div');
      bar.className = 'progress-bar';
      const fill = document.createElement('div');
      fill.className = 'progress-fill';
      fill.style.width = `${a.meter}%`;
      bar.appendChild(fill);

      const actions = document.createElement('div');
      actions.className = 'card-actions';
      actions.innerHTML = `
        <button class="btn pill ghost" data-act="open">Open</button>
        <button class="btn pill secondary" data-act="start">Start</button>
        <button class="btn pill success" data-act="complete">Complete</button>
        <button class="btn pill" data-act="edit">Edit</button>
      `;

      actions.addEventListener('click', e=>{
        const act = e.target.dataset.act;
        if (!act) return;
        if (act === 'open') openActivity(a.id);
        if (act === 'start') startActivity(a.id);
        if (act === 'complete') completeActivity(a.id);
        if (act === 'edit') editActivity(a.id);
      });

      card.append(title, kicker, bar, actions);
      grid.appendChild(card);
    });
}

/* ---------- Activity actions ---------- */
let currentActivityId = null;

function openActivity(id){
  const a = state.activities.find(x=>x.id===id);
  if (!a) return;
  currentActivityId = id;

  $('#modalTitle').textContent = a.title;
  $('#modalCategory').textContent = `${a.category} • ${a.format} • Ages ${a.ageMin}-${a.ageMax}`;
  $('#modalDesc').textContent = a.desc;
  $('#modalPoints').textContent = `+${a.points} pts`;
  $('#modalFormat').textContent = a.format;
  const steps = $('#modalSteps');
  steps.innerHTML = '';
  a.steps.forEach(s=>{
    const li = document.createElement('li');
    li.textContent = s;
    steps.appendChild(li);
  });

  showModal('#activityModal');
}

function startActivity(id){
  const a = state.activities.find(x=>x.id===id);
  if (!a) return;
  const startTime = new Date().toISOString();
  state.log.unshift({ type:'start', id, title: a.title, at: startTime });
  store.set(state);
  toast(`Started: ${a.title}`);
}

function completeActivity(id){
  const a = state.activities.find(x=>x.id===id);
  if (!a) return;
  const completeDate = new Date();
  state.points += a.points;

  // Streak: if lastCompleteDate is yesterday, +1; if today, keep; else reset to 1
  const last = state.lastCompleteDate ? new Date(state.lastCompleteDate) : null;
  const daysBetween = last ? Math.floor((truncateDate(completeDate) - truncateDate(last)) / (1000*60*60*24)) : null;
  if (daysBetween === 1) state.streak += 1;
  else if (daysBetween === 0) state.streak = state.streak; // same day, unchanged
  else state.streak = 1;
  state.lastCompleteDate = truncateDate(completeDate).toISOString();

  state.log.unshift({ type:'complete', id, title: a.title, at: completeDate.toISOString(), points: a.points });
  store.set(state);
  updateProgress();
  renderActivities();
  toast(`Completed: ${a.title} (+${a.points} pts)`);
}

function truncateDate(d){
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/* ---------- Edit ---------- */
function editActivity(id){
  const a = state.activities.find(x=>x.id===id);
  if (!a) return;
  currentActivityId = id;

  $('#editTitle').value = a.title;
  $('#editPoints').value = a.points;
  $('#editDesc').value = a.desc;

  showModal('#editModal');
}

/* ---------- Child & Parent ---------- */
function saveChild(){
  const name = $('#childNameInput').value.trim() || 'Your Child';
  const age = Number($('#childAgeInput').value || '0') || null;
  const avatar = $('#childAvatarInput').value || '🧒';
  state.child = { name, age, avatar };
  store.set(state);
  updateChildBar();
  toast('Child profile saved');
}

function updateChildBar(){
  $('#childName').textContent = state.child.name || 'Your Child';
  $('#childAge').textContent = state.child.age ? `Age: ${state.child.age}` : 'Age: —';
  $('#childAvatar').textContent = state.child.avatar || '🧒';
}

function unlockParent(){
  const pin = $('#parentPin').value.trim();
  if (pin === '1234'){
    $('#parentContent').hidden = false;
    renderParentLog();
    toast('Parents panel unlocked');
  } else {
    toast('Incorrect PIN');
  }
}

function renderParentLog(){
  const ul = $('#parentLog');
  ul.innerHTML = '';
  if (!state.log.length){
    const li = document.createElement('li');
    li.textContent = 'No activity yet.';
    ul.appendChild(li);
    return;
  }
  state.log.slice(0, 10).forEach(item=>{
    const li = document.createElement('li');
    const when = new Date(item.at).toLocaleString();
    if (item.type === 'start') li.textContent = `Started • ${item.title} • ${when}`;
    if (item.type === 'complete') li.textContent = `Completed • ${item.title} (+${item.points} pts) • ${when}`;
    ul.appendChild(li);
  });
}

/* ---------- Modals ---------- */
function showModal(sel){
  $('#modalOverlay').hidden = false;
  const dlg = $(sel);
  if (!dlg.open) dlg.showModal();
}

function closeModals(){
  $('#modalOverlay').hidden = true;
  document.querySelectorAll('dialog').forEach(d=>{ if (d.open) d.close(); });
}

/* ---------- Event wiring ---------- */
function wire(){
  // App bar
  $('#btnBack').addEventListener('click', ()=> toast('Back pressed'));
  $('#btnSubscribe').addEventListener('click', ()=> toast('Subscription info coming soon'));

  // Tabs (visual only)
  $$('.pill-tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('.pill-tab').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      toast(`${btn.textContent} tab`);
    });
  });

  // Filters
  $('#ageRange').addEventListener('input', e=>{
    $('#ageValue').textContent = e.target.value;
    renderActivities();
  });
  $('#searchBox').addEventListener('input', renderActivities);
  $$('.chip[data-category]').forEach(ch=>{
    ch.addEventListener('click', ()=>{
      $$('.chip[data-category]').forEach(c=>c.classList.remove('active'));
      ch.classList.add('active');
      renderActivities();
    });
  });
  $$('.chip[data-format]').forEach(ch=>{
    ch.addEventListener('click', ()=>{
      $$('.chip[data-format]').forEach(c=>c.classList.remove('active'));
      ch.classList.add('active');
      renderActivities();
    });
  });

  // Activity modal actions
  $('#btnModalStart').addEventListener('click', ()=> {
    if (!currentActivityId) return;
    startActivity(currentActivityId);
  });
  $('#btnModalComplete').addEventListener('click', ()=> {
    if (!currentActivityId) return;
    completeActivity(currentActivityId);
  });
  $('#btnModalBack').addEventListener('click', ()=> {
    closeModals();
    toast('Back');
  });

  // Edit modal
  $('#btnEditSave').addEventListener('click', ()=>{
    if (!currentActivityId) return;
    const a = state.activities.find(x=>x.id===currentActivityId);
    if (!a) return;
    a.title = $('#editTitle').value.trim() || a.title;
    a.points = Number($('#editPoints').value || a.points);
    a.desc = $('#editDesc').value.trim() || a.desc;
    store.set(state);
    renderActivities();
    toast('Activity updated');
    closeModals();
  });

  // Child modal
  $('#btnAddChild').addEventListener('click', ()=> showModal('#childModal'));
  $('#btnChildSave').addEventListener('click', saveChild);

  // Parents panel
  $('#btnParentPanel').addEventListener('click', ()=> showModal('#parentModal'));
  $('#btnParentUnlock').addEventListener('click', unlockParent);
  $('#btnParentBack').addEventListener('click', ()=> { closeModals(); toast('Back'); });

  // Overlay click closes all
  $('#modalOverlay').addEventListener('click', closeModals);

  // Activity log button
  $('#btnViewLog').addEventListener('click', ()=>{
    showModal('#parentModal');
    $('#parentContent').hidden = false; // show log read-only
    renderParentLog();
  });

  // Close buttons inside dialogs close overlay too
  document.querySelectorAll('dialog form').forEach(form=>{
    form.addEventListener('submit', (e)=> {
      e.preventDefault();
      closeModals();
    });
  });
}

/* ---------- Init ---------- */
function init(){
  updateChildBar();
  updateProgress();
  renderActivities();
  wire();
}

document.addEventListener('DOMContentLoaded', init);