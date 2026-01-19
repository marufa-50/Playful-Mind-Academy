/* Playful Academy • Set Goal (Beautiful + DB hooks + Day Planner)
   - Only goal-related features
   - Inputs for child ID & name
   - Optional DB ID fields (goals and day plans) — no catalogs are shown
   - Day Planner to set which goals are planned for a selected date
   - Data persists in localStorage
*/

const LS_KEY = 'playfulAcademyData_v3';

const state = {
  children: [],     // { id: internalKey, extId, name, color, emoji, points, streak }
  goals: [],        // { id, extId?, childId, title, category, specific, measurable, achievable, relevant, timebound, reward, points, status, createdAt }
  dayPlans: {},     // { 'YYYY-MM-DD': { extId?: string, goalIds: [] } }
  subscribed: false
};

/* --- Utilities --- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }
function loadState(){
  const raw = localStorage.getItem(LS_KEY);
  if(!raw){
    // Seed with two children and a goal; plan it for today
    const c1 = { id: uid(), extId:'CH-1001', name:'Ava',  color:'#ff8fb3', emoji:'🎨', points: 20, streak: 2 };
    const c2 = { id: uid(), extId:'CH-1002', name:'Noah', color:'#8fd3ff', emoji:'🧩', points: 14, streak: 1 };
    state.children = [c1, c2];

    const g1 = {
      id: uid(), extId:'GO-2001', childId: c1.id, title: 'Draw a sunny garden',
      category:'Drawing', specific:'Use crayons to draw plants & sunshine',
      measurable:'Upload photo of drawing', achievable:'10 minutes, calm corner',
      relevant:'Creativity & mindfulness', timebound: todayPlus(1),
      reward:'Sticker + 10 points', points:10, status:'active', createdAt: Date.now()
    };
    state.goals = [g1];
    const today = todayPlus(0);
    state.dayPlans[today] = { extId:'PL-'+today.replaceAll('-',''), goalIds:[g1.id] };
    state.subscribed = false;
    saveState();
  }else{
    try{ Object.assign(state, JSON.parse(raw)); }catch(e){}
  }
}

function uid(){ return Math.random().toString(36).slice(2,10); }
function todayPlus(days){
  const d = new Date(); d.setDate(d.getDate()+days);
  return d.toISOString().slice(0,10);
}
function log(msg){
  const li = document.createElement('li');
  const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  li.textContent = `[${time}] ${msg}`;
  $('#actionLog').prepend(li);
  showToast(msg);
}

/* --- Rendering --- */
function renderChildren(){
  const wrap = $('#childrenList');
  wrap.innerHTML = '';
  state.children.forEach(ch=>{
    const chip = document.createElement('div');
    chip.className = 'child-chip';
    chip.innerHTML = `
      <span class="child-dot" style="background:${ch.color}"></span>
      <strong>${ch.emoji || '🌟'} ${ch.name}</strong>
      <span aria-label="points">• ${ch.points} pts</span>
      <span aria-label="streak">• 🔥 ${ch.streak}</span>
      <span class="child-id" title="DB Child ID">• ${ch.extId || 'no-id'}</span>
    `;
    wrap.appendChild(chip);
  });

  // Populate goal form select
  const sel = $('#goalChildSelect');
  sel.innerHTML = state.children.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}

function isPlanned(goalId, date){
  const plan = state.dayPlans[date];
  return !!(plan && plan.goalIds.includes(goalId));
}

function renderGoals(){
  const area = $('#goalList');
  area.innerHTML = '';
  const cat = $('#goalFilterCategory').value;
  const st = $('#goalFilterStatus').value;
  const date = $('#planDate').value || todayPlus(0);

  const goals = state.goals.filter(g=>{
    const byCat = (cat==='All' || g.category===cat);
    const bySt = (st==='All' || g.status===st);
    return byCat && bySt;
  }).sort((a,b)=>b.createdAt-a.createdAt);

  goals.forEach(g=>{
    const child = state.children.find(c=>c.id===g.childId);
    const item = document.createElement('div');
    item.className = 'goal-item';
    const planned = isPlanned(g.id, date);
    item.innerHTML = `
      <div>
        <div class="goal-title">
          ${g.title} ${g.status==='completed' ? '✅' : ''}
          ${planned ? '<span class="planned-badge" title="Planned for selected day">Planned</span>' : ''}
        </div>
        <div class="goal-meta" title="DB Goal ID: ${g.extId || 'n/a'}">
          ${child ? child.emoji+' '+child.name : 'Unknown child'} • ${g.category} • ${g.points} pts • due ${g.timebound}
        </div>
      </div>
      <div class="goal-actions">
        <button class="btn btn-view" data-id="${g.id}">View</button>
        <button class="btn btn-edit" data-id="${g.id}">Edit</button>
        <button class="btn btn-complete" data-id="${g.id}" ${g.status==='completed'?'disabled':''}>Complete</button>
        <button class="btn ${planned ? 'btn-unplan' : 'btn-plan'}" data-id="${g.id}">
          ${planned ? 'Unplan' : 'Plan for Day'}
        </button>
        <button class="btn btn-delete" data-id="${g.id}">Delete</button>
        <button class="btn btn-back" data-id="${g.id}">Back</button>
      </div>
    `;
    area.appendChild(item);
  });
}

function renderDayPlan(){
  const date = $('#planDate').value || todayPlus(0);
  const plan = state.dayPlans[date] || { extId:'', goalIds:[] };
  $('#planExtId').value = plan.extId || '';
  const wrap = $('#planList');
  wrap.innerHTML = '';

  if(!plan.goalIds.length){
    wrap.innerHTML = `<div class="goal-item"><div>No goals planned for ${date}. Use “Plan for Day” on any goal.</div></div>`;
    return;
  }

  plan.goalIds.forEach(gid=>{
    const g = state.goals.find(x=>x.id===gid);
    if(!g) return;
    const child = state.children.find(c=>c.id===g.childId);
    const item = document.createElement('div');
    item.className = 'goal-item';
    item.innerHTML = `
      <div>
        <div class="goal-title">${g.title} ${g.status==='completed' ? '✅' : ''}</div>
        <div class="goal-meta">
          ${child ? child.emoji+' '+child.name : 'Unknown'} • ${g.category} • ${g.points} pts
        </div>
      </div>
      <div class="goal-actions">
        <button class="btn btn-view" data-id="${g.id}">View</button>
        <button class="btn btn-unplan" data-id="${g.id}">Remove</button>
      </div>
    `;
    wrap.appendChild(item);
  });
}

/* --- Toast --- */
let toastTimer;
function showToast(text){
  const el = $('#toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.hidden = true, 1800);
}

/* --- Modals helpers --- */
function openModal(id){
  $('#modalOverlay').hidden = false;
  const dlg = document.getElementById(id);
  if(typeof dlg.showModal === 'function') dlg.showModal();
  log(`Opened ${id.replace('Modal','').replace('goal','Goal ')} panel`);
}
function closeModal(id){
  const dlg = document.getElementById(id);
  if(dlg?.open) dlg.close();
  $('#modalOverlay').hidden = true;
}

/* --- Planner ops --- */
function ensurePlan(date){
  if(!state.dayPlans[date]) state.dayPlans[date] = { extId: '', goalIds: [] };
  return state.dayPlans[date];
}
function planGoal(goalId, date){
  const plan = ensurePlan(date);
  if(!plan.goalIds.includes(goalId)){
    plan.goalIds.push(goalId);
    saveState();
    renderGoals();
    renderDayPlan();
    log(`Planned goal for ${date}`);
  }
}
function unplanGoal(goalId, date){
  const plan = ensurePlan(date);
  plan.goalIds = plan.goalIds.filter(id=>id!==goalId);
  saveState();
  renderGoals();
  renderDayPlan();
  log(`Removed goal from plan ${date}`);
}

/* --- Event wiring --- */
function wire(){
  // Back button
  $('#backBtn').addEventListener('click', ()=>{
    log('Back button pressed');
    if(history.length > 1){ history.back(); }
    else{ showToast('No previous page.'); }
  });

  // Subscribe
  $('#subscribeBtn').addEventListener('click', ()=>{
    state.subscribed = !state.subscribed;
    saveState();
    $('#subscribeBtn').textContent = state.subscribed ? 'Subscribed ✔' : 'Subscribe';
    log(state.subscribed ? 'Subscribed' : 'Unsubscribed');
  });

  // Open panels
  $('#openGoalForm').addEventListener('click', ()=> openModal('goalFormModal'));
  $('#openGuidelines').addEventListener('click', ()=> openModal('guidelinesModal'));
  $('#openParentView').addEventListener('click', ()=> {
    renderParentView();
    openModal('parentViewModal');
  });

  // Close buttons with data-close
  $$('.icon-btn.close, .modal-footer [data-close]').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.currentTarget.getAttribute('data-close');
      if(id) closeModal(id);
    });
  });

  // Goal form submit
  $('#goalForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const g = {
      id: uid(),
      extId: (fd.get('extId')||'').trim(),
      childId: fd.get('childId'),
      category: fd.get('category'),
      title: fd.get('title'),
      specific: fd.get('specific'),
      measurable: fd.get('measurable'),
      achievable: fd.get('achievable'),
      relevant: fd.get('relevant'),
      timebound: fd.get('timebound'),
      reward: fd.get('reward'),
      points: Number(fd.get('points')||10),
      status:'active',
      createdAt: Date.now()
    };
    state.goals.unshift(g);
    saveState();
    renderGoals();
    closeModal('goalFormModal');
    log(`Goal created: ${g.title} • ${g.points} pts`);
  });

  // Quick goal
  $('#newQuickGoal').addEventListener('click', ()=>{
    const child = state.children[0];
    if(!child){ showToast('Add a child first'); return; }
    const g = {
      id: uid(), extId:'',
      childId: child.id, category:'Games', title:'Quick puzzle round',
      specific:'Play a puzzle for 5 minutes', measurable:'Timer done',
      achievable:'Choose favorite puzzle', relevant:'Fun & focus',
      timebound: todayPlus(1), reward:'High-five + 5 pts', points:5, status:'active', createdAt: Date.now()
    };
    state.goals.unshift(g); saveState(); renderGoals();
    log('Quick goal added');
  });

  // Clear completed
  $('#clearCompleted').addEventListener('click', ()=>{
    const before = state.goals.length;
    state.goals = state.goals.filter(g=>g.status!=='completed');
    saveState(); renderGoals();
    log(`Cleared ${before - state.goals.length} completed goals`);
  });

  // Clear log
  $('#clearLog').addEventListener('click', ()=>{
    $('#actionLog').innerHTML = ''; showToast('Log cleared • OK');
  });

  // Goals actions delegation
  $('#goalList').addEventListener('click', (e)=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const id = btn.getAttribute('data-id');
    const g = state.goals.find(x=>x.id===id); if(!g) return;
    const date = $('#planDate').value || todayPlus(0);

    if(btn.classList.contains('btn-view')){
      showGoalDetails(g);
    }else if(btn.classList.contains('btn-edit')){
      editGoal(g);
    }else if(btn.classList.contains('btn-complete')){
      completeGoal(g);
    }else if(btn.classList.contains('btn-delete')){
      deleteGoal(g);
    }else if(btn.classList.contains('btn-plan')){
      planGoal(g.id, date);
    }else if(btn.classList.contains('btn-unplan')){
      unplanGoal(g.id, date);
    }else if(btn.classList.contains('btn-back')){
      showToast('Back to list');
    }
  });

  // Filters
  $('#goalFilterCategory').addEventListener('change', renderGoals);
  $('#goalFilterStatus').addEventListener('change', renderGoals);

  // Details OK
  $('#detailsOk').addEventListener('click', ()=> closeModal('goalDetailsModal'));

  // Add child modal
  $('#addChildBtn').addEventListener('click', ()=> openModal('addChildModal'));
  $('#addChildForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const extId = $('#childExtId').value.trim();
    const name = $('#childName').value.trim();
    const color = $('#childColor').value || '#ccc';
    const emoji = $('#childEmoji').value || '🌟';
    state.children.push({ id: uid(), extId, name, color, emoji, points:0, streak:0 });
    saveState(); renderChildren(); closeModal('addChildModal');
    log(`Added child: ${name}${extId?` (ID ${extId})`:''}`);
  });

  // Category chips filter
  $$('.chip').forEach(ch=>{
    ch.addEventListener('click', ()=>{
      $$('.chip').forEach(c=>c.classList.remove('active'));
      ch.classList.add('active');
      const cat = ch.getAttribute('data-category');
      $('#goalFilterCategory').value = cat;
      renderGoals();
      log(`Category filter: ${cat}`);
    });
  });

  // Day planner controls
  $('#planDate').addEventListener('change', ()=>{
    renderGoals();
    renderDayPlan();
  });
  $('#planExtId').addEventListener('change', (e)=>{
    const date = $('#planDate').value || todayPlus(0);
    ensurePlan(date).extId = e.target.value.trim();
    saveState();
    log('Updated plan DB ID');
  });
  $('#clearDayPlan').addEventListener('click', ()=>{
    const date = $('#planDate').value || todayPlus(0);
    if(state.dayPlans[date]){ state.dayPlans[date].goalIds = []; }
    saveState(); renderDayPlan(); renderGoals();
    log(`Cleared plan for ${date}`);
  });
  $('#okDayPlan').addEventListener('click', ()=> showToast('Day plan saved • OK'));

  // Parent view interactions handled in renderParentView
}

/* --- Goal actions --- */
function showGoalDetails(g){
  const child = state.children.find(c=>c.id===g.childId);
  const html = `
    <div class="goal-title">${g.title}</div>
    <p><strong>Child:</strong> ${child ? `${child.emoji} ${child.name}` : 'Unknown'}</p>
    <p><strong>Category:</strong> ${g.category}</p>
    <p><strong>Reward:</strong> ${g.reward} • ${g.points} pts</p>
    <p><strong>Due:</strong> ${g.timebound}</p>
    <p><strong>DB Goal ID:</strong> ${g.extId || '—'}</p>
    <hr />
    <p><strong>Specific:</strong> ${g.specific}</p>
    <p><strong>Measurable:</strong> ${g.measurable}</p>
    <p><strong>Achievable:</strong> ${g.achievable}</p>
    <p><strong>Relevant:</strong> ${g.relevant}</p>
    <p><em>Status:</em> ${g.status}</p>
  `;
  $('#goalDetailsContent').innerHTML = html;
  openModal('goalDetailsModal');
  log(`Viewing: ${g.title}`);
}

function editGoal(g){
  // Pre-fill form
  $('#goalChildSelect').value = g.childId;
  $('#goalCategory').value = g.category;
  $('#goalTitle').value = g.title;
  $('#goalSpecific').value = g.specific;
  $('#goalMeasurable').value = g.measurable;
  $('#goalAchievable').value = g.achievable;
  $('#goalRelevant').value = g.relevant;
  $('#goalTimebound').value = g.timebound;
  $('#goalReward').value = g.reward;
  $('#goalPoints').value = g.points;
  $('#goalExtId').value = g.extId || '';

  openModal('goalFormModal');

  // On submit, replace original (temporary handler)
  const form = $('#goalForm');
  const handler = (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    g.childId = fd.get('childId');
    g.category = fd.get('category');
    g.title = fd.get('title');
    g.specific = fd.get('specific');
    g.measurable = fd.get('measurable');
    g.achievable = fd.get('achievable');
    g.relevant = fd.get('relevant');
    g.timebound = fd.get('timebound');
    g.reward = fd.get('reward');
    g.points = Number(fd.get('points')||10);
    g.extId = (fd.get('extId')||'').trim();
    saveState(); renderGoals(); closeModal('goalFormModal'); log(`Edited: ${g.title}`);
    form.removeEventListener('submit', handler);
  };
  form.addEventListener('submit', handler, { once:true });
}

function completeGoal(g){
  if(g.status==='completed') return;
  g.status='completed';
  const child = state.children.find(c=>c.id===g.childId);
  if(child){
    child.points += g.points;
    child.streak += 1;
  }
  saveState(); renderGoals(); renderDayPlan();
  log(`Completed: ${g.title} • +${g.points} pts • Streak +1`);
}

function deleteGoal(g){
  // Remove from lists and any day plans
  state.goals = state.goals.filter(x=>x.id!==g.id);
  Object.values(state.dayPlans).forEach(p=>{
    p.goalIds = p.goalIds.filter(id=>id!==g.id);
  });
  saveState(); renderGoals(); renderDayPlan();
  log(`Deleted: ${g.title}`);
}

/* --- Parent View (read-only goals) --- */
function renderParentView(){
  const wrap = $('#parentGoals');
  wrap.innerHTML = '';
  state.goals.forEach(g=>{
    const child = state.children.find(c=>c.id===g.childId);
    const item = document.createElement('div');
    item.className = 'goal-item';
    item.innerHTML = `
      <div>
        <div class="goal-title">${g.title} ${g.status==='completed' ? '✅' : ''}</div>
        <div class="goal-meta">
          ${child ? child.emoji+' '+child.name : 'Unknown'} • ${g.category} • ${g.points} pts • due ${g.timebound}
        </div>
      </div>
      <div class="goal-actions">
        <button class="btn btn-view" data-id="${g.id}">View</button>
        <button class="btn btn-back">Back</button>
      </div>
    `;
    wrap.appendChild(item);
  });

  // Only allow view/back in parent modal
  wrap.addEventListener('click', (e)=>{
    const btn = e.target.closest('button'); if(!btn) return;
    if(btn.classList.contains('btn-view')){
      const id = btn.getAttribute('data-id');
      const g = state.goals.find(x=>x.id===id);
      if(g) showGoalDetails(g);
    }else if(btn.classList.contains('btn-back')){
      closeModal('parentViewModal');
    }
  }, { once:true });
}

/* --- Init --- */
document.addEventListener('DOMContentLoaded', ()=>{
  loadState();
  // Set default planner date to today
  $('#planDate').value = todayPlus(0);
  renderChildren();
  renderGoals();
  renderDayPlan();
  wire();
});