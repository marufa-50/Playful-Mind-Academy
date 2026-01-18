const S=JSON.parse(localStorage.getItem("filters")||`{"rating":"Kids","safe":1,"sites":["playful.school"],"acts":{"games":1,"drawing":1,"helpMother":1,"donation":1,"physical":1},"streak":0,"kids":[]}`);
const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
const save=()=>localStorage.setItem("filters",JSON.stringify(S));
const fill=()=>qs("#meterFill").style.width=(20+Object.values(S.acts).filter(Boolean).length*12+(S.safe?20:0))+"%";
const summary=()=>qs("#summary").textContent=`Rating: ${S.rating} • Safe: ${S.safe?"On":"Off"} • Sites: ${S.sites.join(", ")||"—"} • Acts: ${Object.keys(S.acts).filter(k=>S.acts[k]).join(", ")||"None"}`;
const renderSites=()=>qs("#whitelist").innerHTML=S.sites.map(s=>`<button class="chip" data-site="${s}">${s} ✕</button>`).join("");
const renderKids=()=>qs("#childList").innerHTML=S.kids.map(k=>`<li>👧 ${k}</li>`).join("");

// header buttons
qs("#btnBack").onclick = () => {
  window.location.href = "index.html";
};

qs("#btnSubscribe").onclick=()=>alert("Subscribed to Playful Mind Academy!");

// rating + safe
qsa('input[name="rating"]').forEach(r=>r.onchange=e=>{S.rating=e.target.value;save();fill();summary()});
qs("#safe").onchange=e=>{S.safe=e.target.checked?1:0;save();fill();summary()};

// whitelist
qs("#addSite").onclick=()=>{const v=qs("#siteInput").value.trim();if(v){S.sites.push(v);qs("#siteInput").value="";save();renderSites();summary()}};
qs("#whitelist").onclick=e=>{const b=e.target.closest(".chip");if(b){S.sites=S.sites.filter(x=>x!==b.dataset.site);save();renderSites();summary()}};

// activities toggle
qs("#acts").onclick=e=>{const b=e.target.closest(".chip");if(!b)return;const k=b.dataset.act;S.acts[k]=S.acts[k]?0:1;b.classList.toggle("on");save();fill();summary()};

// details + complete + ok
qs("#btnDetails").onclick=()=>qs("#details").classList.remove("hide");
qs("#btnCloseDetails").onclick=()=>qs("#details").classList.add("hide");
qs("#btnComplete").onclick=()=>{S.streak++;qs("#streak").textContent=S.streak;save();alert("Task complete! +1 ⭐")};
qs("#btnOK").onclick=()=>alert("Settings saved");

// child add
qs("#addChild").onclick=()=>{const n=qs("#childName").value.trim();if(n){S.kids.push(n);qs("#childName").value="";save();renderKids()}};

// init
qs("#streak").textContent=S.streak;renderSites();renderKids();fill();summary();