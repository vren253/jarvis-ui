const DEFAULTS = {
  address:"Сэр", theme:"theme-dark",
  orbColor:"#50c8ff", orbIntensity:60, orbSpeed:3, orbSize:180,
  menuAlpha:60, petEnabled:true
};
let state = { ...DEFAULTS, ...JSON.parse(localStorage.getItem("jarvis")||"{}") };
const save = () => localStorage.setItem("jarvis", JSON.stringify(state));

// навигация
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("page-" + btn.dataset.page).classList.add("active");
  });
});

function applyAll() {
  const r = document.documentElement.style;
  r.setProperty("--orb-color", state.orbColor);
  r.setProperty("--orb-intensity", state.orbIntensity/100);
  r.setProperty("--orb-speed", state.orbSpeed + "s");
  r.setProperty("--orb-size", state.orbSize + "px");
  r.setProperty("--menu-alpha", state.menuAlpha/100);
  document.body.className = state.theme;
  document.getElementById("pet-wrap").style.display = state.petEnabled ? "flex" : "none";
}

const $addr=document.getElementById("set-address");
const $theme=document.getElementById("set-theme");
const $color=document.getElementById("set-orb-color");
const $int=document.getElementById("set-orb-intensity");
const $spd=document.getElementById("set-orb-speed");
const $size=document.getElementById("set-orb-size");
const $alpha=document.getElementById("set-menu-alpha");
const $pet=document.getElementById("set-pet");

$color.oninput = e => { state.orbColor=e.target.value; applyAll(); };
$int.oninput = e => { state.orbIntensity=+e.target.value;
  document.getElementById("lbl-intensity").textContent=e.target.value; applyAll(); };
$spd.oninput = e => { state.orbSpeed=+e.target.value;
  document.getElementById("lbl-speed").textContent=e.target.value; applyAll(); };
$size.oninput = e => { state.orbSize=+e.target.value;
  document.getElementById("lbl-size").textContent=e.target.value; applyAll(); };
$alpha.oninput = e => { state.menuAlpha=+e.target.value;
  document.getElementById("lbl-alpha").textContent=e.target.value; applyAll(); };
$theme.onchange = e => { state.theme=e.target.value; applyAll(); };

document.getElementById("save-settings").onclick = () => {
  state.address=$addr.value.trim()||"Сэр";
  state.theme=$theme.value;
  state.petEnabled=$pet.checked;
  save(); applyAll(); renderGreeting();
  const m=document.getElementById("saved-msg");
  m.textContent="Сохранено, "+state.address+".";
  setTimeout(()=>m.textContent="",2000);
};

function renderGreeting() {
  const h=new Date().getHours();
  let t="Добрый день";
  if(h<6) t="Доброй ночи"; else if(h<12) t="Доброе утро";
  else if(h<18) t="Добрый день"; else t="Добрый вечер";
  document.getElementById("greeting").textContent=`${t}, ${state.address}.`;
}

// питомец
const pet=document.getElementById("pet");
if(pet){
  pet.onclick = () => { pet.classList.add("bounce");
    setTimeout(()=>pet.classList.remove("bounce"),400); };
  setInterval(()=>{ pet.classList.add("blink");
    setTimeout(()=>pet.classList.remove("blink"),150); }, 4000 + Math.random()*3000);
}

// фон-частицы (звёзды)
const bg=document.getElementById("bgCanvas");
if(bg){
  const ctx=bg.getContext("2d");
  let W,H,stars=[];
  function resize(){ W=bg.width=window.innerWidth; H=bg.height=window.innerHeight;
    stars=Array.from({length:90},()=>({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.6+.4, s:Math.random()*.3+.05 })); }
  resize(); window.addEventListener("resize",resize);
  (function loop(){ ctx.clearRect(0,0,W,H);
    for(const st of stars){ st.y+=st.s; if(st.y>H){ st.y=0; st.x=Math.random()*W; }
      ctx.beginPath(); ctx.arc(st.x,st.y,st.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(120,200,255,${.3+st.r*.3})`; ctx.fill(); }
    requestAnimationFrame(loop); })();
}

// частицы внутри сферы (3D-иллюзия)
const oc=document.getElementById("orbCanvas");
if(oc){
  const ctx=oc.getContext("2d");
  const W=oc.width=260, H=oc.height=260, cx=W/2, cy=H/2, R=88;
  const parts=Array.from({length:46},()=>({
    a:Math.random()*Math.PI*2, r:R*(.35+Math.random()*.55),
    s:.0015+Math.random()*.004, z:.4+Math.random()*.6 }));
  (function loop(){ ctx.clearRect(0,0,W,H);
    for(const p of parts){ p.a+=p.s;
      const x=cx+Math.cos(p.a)*p.r, y=cy+Math.sin(p.a)*p.r*.5;
      ctx.beginPath(); ctx.arc(x,y,1.5*p.z,0,Math.PI*2);
      ctx.fillStyle=`rgba(120,210,255,${.35+p.z*.5})`; ctx.fill(); }
    requestAnimationFrame(loop); })();
}

// состояния сферы (для будущего голосового контура)
function setOrbState(s){
  document.body.classList.remove("state-listen","state-think","state-speak","state-sleep");
  document.body.classList.add("state-"+s);
  document.getElementById("orb-state").textContent=s;
}

function fillForm() {
  $addr.value=state.address; $theme.value=state.theme;
  $color.value=state.orbColor; $int.value=state.orbIntensity;
  $spd.value=state.orbSpeed; $size.value=state.orbSize;
  $alpha.value=state.menuAlpha; $pet.checked=state.petEnabled;
  document.getElementById("lbl-intensity").textContent=state.orbIntensity;
  document.getElementById("lbl-speed").textContent=state.orbSpeed;
  document.getElementById("lbl-size").textContent=state.orbSize;
  document.getElementById("lbl-alpha").textContent=state.menuAlpha;
}

fillForm(); applyAll(); renderGreeting();
