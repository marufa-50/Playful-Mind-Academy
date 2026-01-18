/* Simple, humanized progress tracking.
   Data is tiny and saved to localStorage per user.
*/
const k = (s)=>`pa_${window.APP_USER}_${s}`;
const $ = (q)=>document.querySelector(q);
const $$ = (q)=>Array.from(document.querySelectorAll(q));
const snack = (t)=>{ const s=$("#snack"); s.textContent=t; s.classList.add("show"); setTimeout(()=>s.classList.remove("show"),1400); };
const modal = {
  open(title, html, ok="OK", onOk=null, showBack=false, onBack=null){
    $("#mTitle").textContent = title; $("#mBody").innerHTML = html; $("#mOk").textContent = ok;
    $("#modal").classList.add("show");
    $("#mX").onclick = modal.close; $("#mOk").onclick = ()=>{ modal.close(); onOk&&onOk(); };
    $("#mBack").style.display = showBack? "inline-flex":"none"; $("#mBack").onclick = ()=>{ onBack&&onBack(); };
    $("#modal").onclick = (e)=>{ if(e.target.id==="modal") modal.close(); };
  },
  close(){ $("#modal").classList.remove("show"); }
};

// Seed data (short and friendly)
const seed = [
  { id: uid(), name:"Ayaan", score:20, badges:[{id:"focus",name:"Focus Bee"}], days:[], timers:{},
    activities:[
      a("Puzzle Game","Games",10,"🧩"),
      a("Color Flowers","Drawing",12,"🌼"),
      a("Sort laundry (help mom)","Help Mother",8,"🧺"),
      a("Donate a toy","Donation",15,"🎁"),
    ]
  },
  { id: uid(), name:"Maya", score:12, badges:[], days:[], timers:{},
    activities:[ a("Jump & Run","Physical",7,"🏃"), a("Say hello to neighbors","Socialization",5,"👋") ]
  }
];

let state = load() || { children: seed, activeId: seed[0].id };

function uid(){ return Math.random().toString(36).slice(2,9); }
function a(title,cat,pts,icon){ return { id:uid(), title, category:cat, points:pts, icon, minutes:0, status:"pending" }; }
function save(){ localStorage.setItem(k("state"), JSON.stringify(state)); sync(); }
function load(){ try{ return JSON.parse(localStorage.getItem(k("state"))); }catch(e){ return null; } }
function child(){ return state.children.find(c=>c.id===state.activeId); }

// Simple streak: if last completion was yesterday, +1; if gap >1 day, reset to 1.
function addStreakDay(c){
  const today = new Date(); today.setHours(0,0,0,0);
  const y = new Date(today); y.setDate(y.getDate()-1);
  const last = c.days.length ? new Date(c.days[c.days.length-1]) : null;
  if(!last || (today-last>86400000)) c.days.push(today.toISOString());
}
function streakCount(c){
  if(!c.days.length) return 0;
  // count consecutive days from end until a gap
  let count=1;
  for(let i=c.days.length-1;i>0;i--){
    const d1=new Date(c.days[i]), d0=new Date(c.days[i-1]);
    if((d1-d0)/86400000===1) count++; else break;
  }
  // reset visually if last day isn’t today
  const t=new Date(); t.setHours(0,0,0,0);
  const last=new Date(c.days[c.days.length-1]); last.setHours(0,0,0,0);
  if((t-last)/86400000>=1) count=0;
  return count;
}
function level(score){ return score<50?"Newbie 🌱":score<120?"Active ⭐":score<250?"Super 🌟":"Champion 🏆"; }
function levelPct(score){ return Math.min(100, Math.round(score/250*100)); }

// Render
function renderChildren(){
  const sel=$("#childSel"); sel.innerHTML = state.children.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");
  sel.value = state.activeId;
}
function renderLists(){
  const c = child(), q=$("#q").value.toLowerCase(), cat=$("#cat").value;
  const filt = (x)=> (q==="" || `${x.title} ${x.category}`.toLowerCase().includes(q)) && (cat==="" || x.category===cat);
  const items = c.activities.filter(filt);
  $("#library").innerHTML = items.map(viewItem).join("");
  $("#today").innerHTML   = c.activities.filter(a=>a.status!=="completed").filter(filt).map(viewItem).join("");
  wireItemButtons("#library"); wireItemButtons("#today");
}
function viewItem(a){
  const w = Math.min(100, Math.round(a.minutes/30*100));
  return `
  <div class="item" data-id="${a.id}">
    <div class="icon" style="font-size:22px">${a.icon}</div>
    <div>
      <div class="title">${a.title}</div>
      <div class="meta">${a.category} • ${a.points} pts • ${a.minutes}m • ${a.status}</div>
      <div class="bar"><span style="width:${w}%"></span></div>
    </div>
    <div>
      <button class="btn soft start">Start</button>
      <button class="btn pause">Pause</button>
      <button class="btn green complete">Complete</button>
      <button class="btn outline details">Details</button>
      <button class="btn outline edit">Edit</button>
      <button class="btn red remove">Remove</button>
    </div>
  </div>`;
}
function wireItemButtons(scope){
  $$(scope+" .item").forEach(el=>{
    const id = el.dataset.id;
    el.querySelector(".start").onclick   = ()=>start(id);
    el.querySelector(".pause").onclick   = ()=>pause(id);
    el.querySelector(".complete").onclick= ()=>complete(id);
    el.querySelector(".details").onclick = ()=>details(id);
    el.querySelector(".edit").onclick    = ()=>edit(id);
    el.querySelector(".remove").onclick  = ()=>remove(id);
  });
}
function renderBadges(){
  const c = child();
  $("#badges").innerHTML = c.badges.length ? c.badges.map(b=>`<span class="badge">${b.name}</span>`).join("") : `<span class="meta">No badges yet — complete tasks to unlock!</span>`;
}
function sync(){
  const c=child();
  $("#sScore").textContent = c.score;
  $("#sStreak").textContent = `${streakCount(c)} days 🔥`;
  $("#sTime").textContent   = `${(c.activities.reduce((m,a)=>m+(a.minutesToday||0),0))}m`;
  $("#sLevel").textContent  = level(c.score);
  $("#levelFill").style.width = levelPct(c.score)+"%";
}

// Actions (short and friendly)
function start(id){ child().timers[id] = Date.now(); snack("Timer started"); save(); }
function pause(id){
  const c = child(); const t = c.timers[id]; if(!t){ snack("No timer"); return; }
  const mins = Math.max(0, Math.round((Date.now()-t)/60000));
  const a = c.activities.find(x=>x.id===id); a.minutes += mins; a.minutesToday = (a.minutesToday||0)+mins;
  delete c.timers[id]; snack(`Paused • +${mins}m`); save(); renderLists();
}
function complete(id){
  const c=child(); if(c.timers[id]) pause(id);
  const a=c.activities.find(x=>x.id===id); if(a.status==="completed"){ snack("Already done"); return; }
  a.status="completed"; c.score += a.points; addStreakDay(c); award(c,a); save(); renderLists(); renderBadges(); snack(`Completed • +${a.points} pts`);
}
function details(id){
  const a = child().activities.find(x=>x.id===id);
  modal.open("Activity Details", `
    <p style="margin:0 0 8px">${a.icon} <strong>${a.title}</strong></p>
    <p class="meta">${a.category} • ${a.points} pts • ${a.minutes}m • ${a.status}</p>
    <div class="bar"><span style="width:${Math.min(100,Math.round(a.minutes/30*100))}%"></span></div>
    <div class="row" style="margin-top:8px">
      <button id="dStart" class="btn soft">Start</button>
      <button id="dPause" class="btn">Pause</button>
      <button id="dComplete" class="btn green">Complete</button>
      <button id="dBack" class="btn">Back</button>
      <button id="dRemove" class="btn red">Remove</button>
    </div>
  `,"Close");
  $("#dStart").onclick=()=>start(id); $("#dPause").onclick=()=>pause(id); $("#dComplete").onclick=()=>complete(id);
  $("#dBack").onclick=()=>modal.close(); $("#dRemove").onclick=()=>{ remove(id); modal.close(); };
}
function edit(id){
  const a = child().activities.find(x=>x.id===id);
  const title = prompt("Title", a.title) ?? a.title;
  const points = parseInt(prompt("Points", a.points) ?? a.points,10) || a.points;
  const cat = prompt("Category (Games, Drawing, Help Mother, Donation, Physical, Socialization)", a.category) ?? a.category;
  const icon = prompt("Icon (emoji)", a.icon) ?? a.icon;
  Object.assign(a,{title, points, category:cat, icon});
  save(); renderLists(); snack("Updated");
}
function remove(id){
  const c = child();
  if(!confirm("Remove this activity?")) return;
  c.activities = c.activities.filter(x=>x.id!==id); delete c.timers[id];
  save(); renderLists(); snack("Removed");
}
function addActivity(){
  const title = prompt("Activity title (e.g., Build block tower)") || "New Activity";
  const cat = prompt("Category (Games, Drawing, Help Mother, Donation, Physical, Socialization)","Games") || "Games";
  const pts = parseInt(prompt("Points","10")||"10",10);
  const icon = prompt("Icon (emoji)","🎯") || "🎯";
  child().activities.push(a(title,cat,pts,icon)); save(); renderLists(); snack("Added");
}
function addChild(){
  const name = prompt("Child name") || "New Child";
  const c = { id:uid(), name, score:0, badges:[], days:[], timers:{}, activities:[] };
  state.children.push(c); state.activeId=c.id; save(); renderChildren(); renderLists(); renderBadges(); snack("Child added");
}

// Badges (short rules)
function award(c,a){
  if(a.minutes>=20 && !c.badges.find(b=>b.id==="focus")) c.badges.push({id:"focus",name:"Focus Bee"});         // 20m focus
  const helps = c.activities.filter(x=>x.category==="Help Mother" && x.status==="completed").length;
  if(helps>=3 && !c.badges.find(b=>b.id==="helper")) c.badges.push({id:"helper",name:"Helper Star"});
  const dons = c.activities.filter(x=>x.category==="Donation" && x.status==="completed").length;
  if(dons>=3 && !c.badges.find(b=>b.id==="kind")) c.badges.push({id:"kind",name:"Kind Heart"});
  if(streakCount(c)>=5 && !c.badges.find(b=>b.id==="streak")) c.badges.push({id:"streak",name:"Sunny Streak"});
}

// Views
function parentsView(){
  const c = child();
  modal.open("Parents View (read-only)", `
    <div class="pill">
      <div><small>Score</small><strong>${c.score}</strong></div>
      <div><small>Streak</small><strong>${streakCount(c)} days 🔥</strong></div>
      <div><small>Level</small><strong>${level(c.score)}</strong></div>
      <div><small>Badges</small><strong>${c.badges.length}</strong></div>
    </div>
    <h4>Rules & Guidelines</h4>
    <ul>
      <li>Fun first — no tests, only playful activities.</li>
      <li>Kindness counts — helping and donating earn extra points.</li>
      <li>Short sessions — 10–20 min bursts work best.</li>
      <li>Ask a parent before donating items.</li>
      <li>Balance screens with drawing and outdoor play.</li>
    </ul>
    <h4>Recent activities</h4>
    ${c.activities.slice(-5).map(x=>`<div class="item"><div>${x.icon}</div><div><div class="title">${x.title}</div><div class="meta">${x.category} • ${x.points} pts • ${x.status}</div></div><button class="btn" disabled>View only</button></div>`).join("")}
  `,"Close");
}
function badgeInfo(){
  modal.open("Badge Info", `
    <ul>
      <li>Focus Bee 🐝 — 20+ minutes focused on one activity.</li>
      <li>Helper Star ⭐ — Help Mother 3 times.</li>
      <li>Kind Heart 💝 — Complete 3 donation activities.</li>
      <li>Sunny Streak 🌞 — Playfully active 5 days in a row.</li>
    </ul>
  `,"OK");
}
function ranking(){
  const c = child(); modal.open("Level Ranking", `
    <p>Your level: <strong>${level(c.score)}</strong></p>
    <div class="barline"><span style="width:${levelPct(c.score)}%"></span></div>
    <p>Next milestones around 50 / 120 / 250 points.</p>
  `,"OK");
}
function progress(){
  const c = child();
  modal.open("Progress Overview", `
    <div class="pill">
      <div><small>Score</small><strong>${c.score}</strong></div>
      <div><small>Streak</small><strong>${streakCount(c)} days 🔥</strong></div>
      <div><small>Time today</small><strong>${(c.activities.reduce((m,a)=>m+(a.minutesToday||0),0))}m</strong></div>
    </div>
    <div class="badges">${c.badges.length?c.badges.map(b=>`<span class="badge">${b.name}</span>`).join(""):"No badges yet"}</div>
  `,"OK");
}
function subscribe(){ modal.open("Subscribe", `<p>Thanks for supporting Playful Academy! Extra themes and badge packs unlock.</p>`,"OK"); }
function back(){ history.length>1 ? history.back() : snack("No previous page"); }

// Wire
function wire(){
  $("#childSel").onchange = (e)=>{ state.activeId = e.target.value; save(); renderLists(); renderBadges(); };
  $("#q").oninput = renderLists; $("#cat").onchange = renderLists;
  $("#bAdd").onclick = addActivity; $("#bAddChild").onclick = addChild;

  $("#bGuidelines").onclick = ()=>badgeInfo(); // keep it light; parents read only
  $("#bBadgeInfo").onclick = badgeInfo; $("#bRank").onclick = ranking; $("#bProgress").onclick = progress;

  $("#bParents").onclick = parentsView; $("#bSubscribe").onclick = subscribe; $("#bBack").onclick = back;
}

// Init
function init(){ renderChildren(); renderLists(); renderBadges(); sync(); wire(); }
document.addEventListener("DOMContentLoaded", init);