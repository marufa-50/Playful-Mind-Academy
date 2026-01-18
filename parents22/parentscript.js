/* Playful Academy • Screen Time Limit
   - Student-focused fun activities with streak points
   - Parents can view rules & timing (read-only panel)
   - LocalStorage per child/day
*/

(function(){
  const todayKey = () => new Date().toISOString().slice(0,10);

  const DEFAULT_ACTIVITIES = [
    { id:'games', name:'Games', emoji:'🎮', color:'#4c9aef' },
    { id:'drawing', name:'Drawing', emoji:'🎨', color:'#ff9f43' },
    { id:'learning', name:'Learning Bits', emoji:'📚', color:'#ffd95a' }, // tiny playful bits, not academic heavy
    { id:'help_mom', name:'Help Mother', emoji:'🧹', color:'#49c27b' },
    { id:'donation', name:'Donation', emoji:'💝', color:'#ff7fb4' },
    { id:'social', name:'Friends & Chat', emoji:'🧑‍🤝‍🧑', color:'#9b78ff' },
    { id:'puzzles', name:'Puzzles', emoji:'🧩', color:'#7ecb5a' },
    { id:'music', name:'Music', emoji:'🎵', color:'#b76cff' },
  ];

  // Elements
  const els = {
    quota: document.getElementById('dailyQuota'),
    quotaLabel: document.getElementById('quotaLabel'),
    usedToday: document.getElementById('usedToday'),
    remainingToday: document.getElementById('remainingToday'),
    quotaRing: document.getElementById('quotaRing'),
    bedStart: document.getElementById('bedStart'),
    bedEnd: document.getElementById('bedEnd'),
    overrideToday: document.getElementById('overrideToday'),
    btnEditRules: document.getElementById('btnEditRules'),
    btnSaveRules: document.getElementById('btnSaveRules'),
    btnResetToday: document.getElementById('btnResetToday'),
    activityGrid: document.getElementById('activityGrid'),
    currentActivity: document.getElementById('currentActivity'),
    manualMinutes: document.getElementById('manualMinutes'),
    btnStart: document.getElementById('btnStart'),
    btnComplete: document.getElementById('btnComplete'),
    btnLogManual: document.getElementById('btnLogManual'),
    timerStatus: document.getElementById('timerStatus'),
    barChart: document.getElementById('barChart'),
    donutChart: document.getElementById('donutChart'),
    toast: document.getElementById('toast'),
    logTable: document.getElementById('logTable').querySelector('tbody'),
    btnClearLog: document.getElementById('btnClearLog'),
    btnDetailsAll: document.getElementById('btnDetailsAll'),
    btnRefreshCharts: document.getElementById('btnRefreshCharts'),
    // header
    btnBack: document.getElementById('btnBack'),
    btnSubscribe: document.getElementById('btnSubscribe'),
    btnParentPanel: document.getElementById('btnParentPanel'),
    // parent modal
    parentModal: document.getElementById('parentModal'),
    pLimit: document.getElementById('pLimit'),
    pUsed: document.getElementById('pUsed'),
    pRemain: document.getElementById('pRemain'),
    parentDonut: document.getElementById('parentDonut'),
    parentLogTable: document.getElementById('parentLog').querySelector('tbody'),
    btnParentOk: document.getElementById('btnParentOk'),
    btnParentClose: document.getElementById('btnParentClose'),
    btnParentBack: document.getElementById('btnParentBack'),
    // generic modal
    genericModal: document.getElementById('genericModal'),
    genericTitle: document.getElementById('genericTitle'),
    genericBody: document.getElementById('genericBody'),
    btnGenericOk: document.getElementById('btnGenericOk'),
    btnGenericClose: document.getElementById('btnGenericClose'),
    // child
    currentChildName: document.getElementById('currentChildName'),
    streakPoints: document.getElementById('streakPoints'),
    btnAddChild: document.getElementById('btnAddChild'),
    btnSwitchChild: document.getElementById('btnSwitchChild'),
  };

  // App state
  let activeChildId = getChildrenList()[0]?.id || createChild('Guest Kid', 8).id;
  let session = null; // {activityId, startTime}

  // ----- Storage helpers -----
  function getChildrenList(){
    const raw = localStorage.getItem('children:list');
    return raw ? JSON.parse(raw) : [];
  }
  function setChildrenList(list){
    localStorage.setItem('children:list', JSON.stringify(list));
  }
  function createChild(name, age){
    const id = 'child_' + Math.random().toString(36).slice(2,8);
    const child = { id, name, age };
    const list = getChildrenList();
    list.push(child); setChildrenList(list);
    const day = todayKey();
    const data = {
      name, age,
      dailyLimit: 120, bedStart:'21:00', bedEnd:'07:00', override:false,
      streak: 0,
      activities: DEFAULT_ACTIVITIES.map(a => ({ ...a, sessions: {} })), // sessions[YYYY-MM-DD] = [{minutes, timestamp}]
      log: { [day]: [] }, // [{time, action, activity, minutes}]
    };
    setChildData(id, data);
    return child;
  }
  function getChildData(id){
    const raw = localStorage.getItem('screenTimeData_'+id);
    return raw ? JSON.parse(raw) : null;
  }
  function setChildData(id, data){
    localStorage.setItem('screenTimeData_'+id, JSON.stringify(data));
  }

  // ----- UI Building -----
  function buildActivityCards(){
    const data = getChildData(activeChildId);
    els.activityGrid.innerHTML = '';
    els.currentActivity.innerHTML = '';
    data.activities.forEach(a => {
      const used = sumToday(a.sessions);
      const card = document.createElement('div');
      card.className = 'activity-card';
      card.innerHTML = `
        <div class="activity-emoji">${a.emoji}</div>
        <div class="activity-name">${a.name}</div>
        <div class="activity-min">Today: <strong>${used}</strong> min</div>
        <div class="activity-actions">
          <button class="btn small start" data-id="${a.id}">Start</button>
          <button class="btn small complete" data-id="${a.id}">Complete</button>
          <button class="btn small subtle details" data-id="${a.id}">Details</button>
        </div>
      `;
      els.activityGrid.appendChild(card);

      const opt = document.createElement('option');
      opt.value = a.id; opt.textContent = a.name;
      els.currentActivity.appendChild(opt);
    });
  }

  function sumToday(sessionsMap){
    const day = todayKey();
    const list = sessionsMap?.[day] || [];
    return list.reduce((acc, s)=> acc + (s.minutes||0), 0);
  }

  function usedTodayTotal(){
    const data = getChildData(activeChildId);
    return data.activities.reduce((acc,a)=> acc + sumToday(a.sessions), 0);
  }

  function updateQuotaUI(){
    const data = getChildData(activeChildId);
    els.quota.value = data.dailyLimit;
    els.quotaLabel.textContent = data.dailyLimit;
    const used = usedTodayTotal();
    els.usedToday.textContent = used;
    els.remainingToday.textContent = Math.max(0, data.dailyLimit - used);

    drawQuotaRing(els.quotaRing, used, data.dailyLimit);
  }

  function drawQuotaRing(canvas, used, limit){
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    const cx = w/2, cy = h/2, r = Math.min(w,h)/2 - 12;
    const start = -Math.PI/2;
    const end = start + 2*Math.PI;
    // background ring
    ctx.lineWidth = 18;
    ctx.strokeStyle = '#eef5ff';
    ctx.beginPath();
    ctx.arc(cx,cy,r,start,end);
    ctx.stroke();
    // progress
    const pct = Math.min(1, used/Math.max(1,limit));
    ctx.strokeStyle = '#4c9aef';
    ctx.beginPath();
    ctx.arc(cx,cy,r,start,start + pct*2*Math.PI);
    ctx.stroke();
    // text
    ctx.fillStyle = '#383838';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${used} / ${limit} min`, cx, cy+6);
  }

  function drawBarChart(){
    const data = getChildData(activeChildId);
    const ctx = els.barChart.getContext('2d');
    const w = els.barChart.width, h = els.barChart.height;
    ctx.clearRect(0,0,w,h);
    const labels = data.activities.map(a=>a.name);
    const values = data.activities.map(a=>sumToday(a.sessions));
    const maxV = Math.max(60, ...values);
    const barW = Math.max(20, (w - 60) / values.length - 12);
    // axes
    ctx.strokeStyle = '#ddd';
    ctx.beginPath(); ctx.moveTo(50,20); ctx.lineTo(50,h-40); ctx.lineTo(w-10,h-40); ctx.stroke();
    // bars
    values.forEach((v, i)=>{
      const x = 60 + i*(barW+12);
      const y = (h-40) - (v/maxV)*(h-80);
      ctx.fillStyle = data.activities[i].color;
      ctx.fillRect(x, y, barW, (h-40)-y);
      // label
      ctx.fillStyle = '#444'; ctx.font = '12px sans-serif'; ctx.textAlign='center';
      const label = labels[i].length>8 ? labels[i].slice(0,8)+'…' : labels[i];
      ctx.fillText(label, x+barW/2, h-22);
      ctx.fillText(v+'m', x+barW/2, y-6);
    });
    ctx.fillStyle = '#777'; ctx.font = '12px sans-serif';
    ctx.fillText('Minutes per activity (today)', 60, 14);
  }

  function drawDonut(canvasId){
    const canvas = typeof canvasId==='string' ? document.getElementById(canvasId) : canvasId;
    const data = getChildData(activeChildId);
    const ctx = canvas.getContext('2d');
    const w=canvas.width, h=canvas.height, cx=w/2, cy=h/2, r=Math.min(w,h)/2 - 16;
    ctx.clearRect(0,0,w,h);
    const values = data.activities.map(a=>sumToday(a.sessions));
    const total = values.reduce((a,b)=>a+b,0);
    let angle = -Math.PI/2;
    values.forEach((v,i)=>{
      const seg = total ? (v/total)*2*Math.PI : 0.0001;
      ctx.beginPath();
      ctx.arc(cx,cy,r,angle,angle+seg);
      ctx.lineWidth = 24;
      ctx.strokeStyle = data.activities[i].color;
      ctx.stroke();
      angle += seg;
    });
    // center text
    ctx.fillStyle='#333'; ctx.font='14px sans-serif'; ctx.textAlign='center';
    ctx.fillText('Share today', cx, cy+6);
  }

  function toast(msg){
    els.toast.textContent = msg;
    els.toast.classList.add('show');
    setTimeout(()=> els.toast.classList.remove('show'), 1600);
  }

  // ----- Event wiring -----
  function enableRuleInputs(enabled){
    [els.quota, els.bedStart, els.bedEnd, els.overrideToday].forEach(el=>{
      el.disabled = !enabled;
    });
  }

  function wireEvents(){
    // Header
    els.btnBack.onclick = ()=> toast('Back');
    els.btnSubscribe.onclick = ()=> showGeneric('Subscription', `<p>Subscribe to unlock stickers, avatars and party mode themes 🌈🌟.</p>`);
    els.btnParentPanel.onclick = openParentPanel;

    // Rules
    els.btnEditRules.onclick = ()=>{ enableRuleInputs(true); toast('Editing rules'); };
    els.btnSaveRules.onclick = ()=>{
      const data = getChildData(activeChildId);
      data.dailyLimit = Number(els.quota.value);
      data.bedStart = els.bedStart.value;
      data.bedEnd = els.bedEnd.value;
      data.override = !!els.overrideToday.checked;
      setChildData(activeChildId, data);
      enableRuleInputs(false);
      updateQuotaUI(); drawBarChart(); drawDonut(els.donutChart);
      toast('Saved');
    };
    els.btnResetToday.onclick = ()=>{
      const data = getChildData(activeChildId);
      const day = todayKey();
      data.activities.forEach(a=>{ a.sessions[day] = []; });
      data.log[day] = [];
      setChildData(activeChildId, data);
      refreshAll();
      toast('Today reset');
    };
    els.quota.oninput = ()=> els.quotaLabel.textContent = els.quota.value;

    // Activity grid delegated
    els.activityGrid.addEventListener('click', (e)=>{
      const btn = e.target.closest('button'); if(!btn) return;
      const id = btn.dataset.id;
      if(btn.classList.contains('start')) startActivity(id);
      if(btn.classList.contains('complete')) completeActivity(id);
      if(btn.classList.contains('details')) showActivityDetails(id);
    });

    // Session controls
    els.btnStart.onclick = ()=> startActivity(els.currentActivity.value);
    els.btnComplete.onclick = ()=> completeActivity(els.currentActivity.value);
    els.btnLogManual.onclick = ()=> logManual(els.currentActivity.value, Number(els.manualMinutes.value));

    // Charts & logs
    els.btnRefreshCharts.onclick = ()=>{ drawBarChart(); drawDonut(els.donutChart); updateQuotaUI(); };
    els.btnClearLog.onclick = ()=>{
      const data = getChildData(activeChildId);
      data.log[todayKey()] = [];
      setChildData(activeChildId, data);
      renderLog();
      toast('Cleared log');
    };
    els.btnDetailsAll.onclick = ()=> showAllDetails();

    // Parent modal
    els.btnParentOk.onclick = closeParentPanel;
    els.btnParentClose.onclick = closeParentPanel;
    els.btnParentBack.onclick = closeParentPanel;

    // Generic modal
    els.btnGenericOk.onclick = closeGeneric;
    els.btnGenericClose.onclick = closeGeneric;

    // Children
    els.btnAddChild.onclick = ()=>{
      showGeneric('Add Child', `
        <div class="grid two">
          <div><label>Name</label><input id="gc_name" type="text" value="New Kid"></div>
          <div><label>Age</label><input id="gc_age" type="number" min="3" max="15" value="8"></div>
        </div>
        <div style="margin-top:8px">
          <button class="btn" id="gc_create">Create</button>
        </div>
      `);
      setTimeout(()=>{
        document.getElementById('gc_create').onclick = ()=>{
          const name = document.getElementById('gc_name').value.trim() || 'New Kid';
          const age = Number(document.getElementById('gc_age').value) || 8;
          const child = createChild(name, age);
          activeChildId = child.id;
          closeGeneric();
          toast('Child added');
          refreshAll();
        };
      }, 0);
    };
    els.btnSwitchChild.onclick = ()=>{
      const list = getChildrenList();
      const options = list.map(c=> `<option value="${c.id}" ${c.id===activeChildId?'selected':''}>${c.name} (${c.age})</option>`).join('');
      showGeneric('Switch Child', `
        <label>Choose profile</label>
        <select id="gc_switch">${options}</select>
        <div style="margin-top:8px"><button class="btn" id="gc_apply">OK</button></div>
      `);
      setTimeout(()=>{
        document.getElementById('gc_apply').onclick = ()=>{
          activeChildId = document.getElementById('gc_switch').value;
          closeGeneric(); refreshAll(); toast('Switched');
        };
      },0);
    };

    enableRuleInputs(false);
  }

  // ----- Actions -----
  function startActivity(activityId){
    const data = getChildData(activeChildId);
    const now = new Date();
    // bedtime block if not override
    if(!data.override && isBedtime(now, data.bedStart, data.bedEnd)){
      toast('Bedtime: screen paused 🌙'); return;
    }
    session = { activityId, startTime: now.getTime() };
    els.timerStatus.textContent = `Started ${nameById(activityId)} at ${timeStr(now)}…`;
    addLog('Start', activityId, 0);
  }

  function completeActivity(activityId){
    if(!session || session.activityId !== activityId){
      toast('No active session'); return;
    }
    const end = new Date();
    const minutes = Math.max(1, Math.round((end.getTime() - session.startTime)/60000));
    recordSession(activityId, minutes);
    awardStreak(minutes);
    session = null;
    els.timerStatus.textContent = `Completed ${nameById(activityId)} (+${minutes}m)`;
    addLog('Complete', activityId, minutes);
    refreshAll();
  }

  function logManual(activityId, minutes){
    if(minutes<=0) return toast('Enter minutes > 0');
    recordSession(activityId, minutes);
    awardStreak(minutes);
    addLog('Manual log', activityId, minutes);
    refreshAll();
    toast(`Logged ${minutes}m ${nameById(activityId)}`);
  }

  function recordSession(activityId, minutes){
    const data = getChildData(activeChildId);
    const day = todayKey();
    const activity = data.activities.find(a=>a.id===activityId);
    if(!activity.sessions[day]) activity.sessions[day] = [];
    activity.sessions[day].push({ minutes, timestamp: Date.now() });
    setChildData(activeChildId, data);
  }

  function awardStreak(minutes){
    const data = getChildData(activeChildId);
    const gain = Math.max(1, Math.round(minutes/10)); // 1 point per 10 minutes
    data.streak += gain;
    setChildData(activeChildId, data);
  }

  function addLog(action, activityId, minutes){
    const data = getChildData(activeChildId);
    const day = todayKey();
    if(!data.log[day]) data.log[day] = [];
    data.log[day].push({
      time: timeStr(new Date()),
      action, activity: nameById(activityId), minutes
    });
    setChildData(activeChildId, data);
    renderLog();
  }

  function renderLog(){
    const data = getChildData(activeChildId);
    const day = todayKey();
    const rows = (data.log[day]||[]).map(r=>`
      <tr>
        <td>${r.time}</td>
        <td>${r.action}</td>
        <td>${r.activity}</td>
        <td>${r.minutes||0}</td>
      </tr>
    `).join('');
    els.logTable.innerHTML = rows || `<tr><td colspan="4">No actions yet</td></tr>`;
  }

  // ----- Helper UI -----
  function nameById(id){
    const data = getChildData(activeChildId);
    return data.activities.find(a=>a.id===id)?.name || id;
  }
  function timeStr(d){ return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }

  function isBedtime(now, start, end){
    // treat times as today HH:MM; if end < start, wraps overnight
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const s = sh*60 + sm, e = eh*60 + em;
    const m = now.getHours()*60 + now.getMinutes();
    if(e > s) return (m >= s && m < e);
    return (m >= s || m < e);
  }

  // ----- Modals -----
  function openParentPanel(){
    const data = getChildData(activeChildId);
    els.pLimit.textContent = data.dailyLimit;
    const used = usedTodayTotal();
    els.pUsed.textContent = used;
    els.pRemain.textContent = Math.max(0, data.dailyLimit - used);
    // parent donut
    drawDonut(els.parentDonut);
    // parent log
    const day = todayKey();
    const rows = (data.log[day]||[]).map(r=>`<tr><td>${r.time}</td><td>${r.activity}</td><td>${r.minutes||0}</td></tr>`).join('');
    els.parentLogTable.innerHTML = rows || `<tr><td colspan="3">No sessions today</td></tr>`;
    els.parentModal.classList.add('show');
  }
  function closeParentPanel(){ els.parentModal.classList.remove('show'); }

  function showGeneric(title, html){
    els.genericTitle.textContent = title;
    els.genericBody.innerHTML = html;
    els.genericModal.classList.add('show');
  }
  function closeGeneric(){ els.genericModal.classList.remove('show'); }

  function showActivityDetails(activityId){
    const data = getChildData(activeChildId);
    const day = todayKey();
    const a = data.activities.find(x=>x.id===activityId);
    const sessions = a.sessions[day] || [];
    if(!sessions.length){
      showGeneric(`${a.name} • Details`, `<p>No sessions logged today.</p>`);
      return;
    }
    const list = sessions.map(s=> `<li>${new Date(s.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} — ${s.minutes}m</li>`).join('');
    showGeneric(`${a.name} • Details`, `<ul style="padding-left:18px">${list}</ul>`);
  }

  function showAllDetails(){
    const data = getChildData(activeChildId);
    const day = todayKey();
    const blocks = data.activities.map(a=>{
      const list = (a.sessions[day]||[]).map(s=> `<li>${new Date(s.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} — ${s.minutes}m</li>`).join('');
      return `<h4>${a.emoji} ${a.name}</h4><ul style="padding-left:18px">${list || '<li>No sessions</li>'}</ul>`;
    }).join('');
    showGeneric('All Activities • Today', blocks);
  }

  // ----- Refresh -----
  function refreshAll(){
    const data = getChildData(activeChildId);
    els.currentChildName.textContent = data.name;
    els.streakPoints.textContent = data.streak;
    els.bedStart.value = data.bedStart;
    els.bedEnd.value = data.bedEnd;
    els.overrideToday.checked = !!data.override;
    buildActivityCards();
    renderLog();
    updateQuotaUI();
    drawBarChart(); drawDonut(els.donutChart);
  }

  // First‑time boot
  wireEvents();
  refreshAll();

})();