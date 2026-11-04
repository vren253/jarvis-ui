const DEFAULTS = {
  address:"Сэр", theme:"theme-dark",
  orbColor:"#50c8ff", orbColor2:"#c04dff",
  orbIntensity:60, orbSpeed:3, orbSize:180,
  menuAlpha:60, petHome:true, soundEnabled:true, mood:100
};
let state = { ...DEFAULTS, ...JSON.parse(localStorage.getItem("jarvis")||"{}") };
const save = () => localStorage.setItem("jarvis", JSON.stringify(state));

// ===== ЗВУК =====
let audioCtx = null;
function unlockAudio(){
  try {
    audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state === "suspended") audioCtx.resume();
  } catch(e){}
}
document.addEventListener("touchstart", unlockAudio, {once:true});
document.addEventListener("click", unlockAudio, {once:true});

function beep(freq=660, dur=0.06, type="sine", vol=0.18){
  if(!state.soundEnabled) return;
  try {
    unlockAudio(); if(!audioCtx) return;
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type=type; o.frequency.value=freq;
    g.gain.value=vol;
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime+dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime+dur);
  } catch(e){}
}

// ===== КУРСОР =====
const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursorRing");
if(cursor && ring){
  document.addEventListener("mousemove", e => {
    cursor.style.left = e.clientX+"px"; cursor.style.top = e.clientY+"px";
    ring.style.left = e.clientX+"px"; ring.style.top = e.clientY+"px";
  });
  document.querySelectorAll("button, a, input, select, .pet-big, .orb-scene").forEach(el => {
    el.addEventListener("mouseenter", () => ring.classList.add("hot"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hot"));
  });
}

// ===== BOOT =====
const boot = document.getElementById("boot");
const bootBar = document.getElementById("bootBar");
const bootText = document.getElementById("bootText");
const bootLines = ["JARVIS", "ЗАГРУЗКА ЯДРА", "СИСТЕМЫ ОНЛАЙН"];
let bi = 0;
if(boot){
  const iv = setInterval(() => {
    bi += 8; bootBar.style.width = Math.min(bi,100) + "%";
    if(bi === 32) bootText.textContent = bootLines[1];
    if(bi === 64) bootText.textContent = bootLines[2];
    if(bi >= 100){ clearInterval(iv);
      setTimeout(() => { boot.classList.add("hide"); beep(880,.1,"triangle",.06); }, 400); }
  }, 60);
}

// ===== НАВИГАЦИЯ =====
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    beep(520,.04);
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("page-" + btn.dataset.page).classList.add("active");
  });
});

function applyAll() {
  const r = document.documentElement.style;
  r.setProperty("--orb-color", state.orbColor);
  r.setProperty("--orb-color2", state.orbColor2);
  r.setProperty("--orb-intensity", state.orbIntensity/100);
  r.setProperty("--orb-speed", state.orbSpeed + "s");
  r.setProperty("--orb-size", state.orbSize + "px");
  r.setProperty("--menu-alpha", state.menuAlpha/100);
  document.body.className = state.theme;
}

const $addr=document.getElementById("set-address");
const $theme=document.getElementById("set-theme");
const $color=document.getElementById("set-orb-color");
const $color2=document.getElementById("set-orb-color2");
const $int=document.getElementById("set-orb-intensity");
const $spd=document.getElementById("set-orb-speed");
const $size=document.getElementById("set-orb-size");
const $alpha=document.getElementById("set-menu-alpha");
const $snd=document.getElementById("set-sound");
const $petHome=document.getElementById("set-pet-home");

$color.oninput = e => { state.orbColor=e.target.value; applyAll(); };
$color2.oninput = e => { state.orbColor2=e.target.value; applyAll(); };
$int.oninput = e => { state.orbIntensity=+e.target.value;
  document.getElementById("lbl-intensity").textContent=e.target.value; applyAll(); };
$spd.oninput = e => { state.orbSpeed=+e.target.value;
  document.getElementById("lbl-speed").textContent=e.target.value; applyAll(); };
$size.oninput = e => { state.orbSize=+e.target.value;
  document.getElementById("lbl-size").textContent=e.target.value; applyAll(); };
$alpha.oninput = e => { state.menuAlpha=+e.target.value;
  document.getElementById("lbl-alpha").textContent=e.target.value; applyAll(); };
$theme.onchange = e => { state.theme=e.target.value; applyAll(); };
$petHome.onchange = e => { state.petHome=e.target.checked; save(); };

document.getElementById("save-settings").onclick = () => {
  state.address=$addr.value.trim()||"Сэр";
  state.theme=$theme.value;
  state.soundEnabled=$snd.checked;
  save(); applyAll(); renderGreeting(); beep(720,.08,"triangle",.06);
  const m=document.getElementById("saved-msg");
  m.textContent="Сохранено, "+state.address+".";
  setTimeout(()=>m.textContent="",2000);
};

// ===== TYPEWRITER =====
function renderGreeting() {
  const h=new Date().getHours();
  let t="Добрый день";
  if(h<6) t="Доброй ночи"; else if(h<12) t="Доброе утро";
  else if(h<18) t="Добрый день"; else t="Добрый вечер";
  const full = `${t}, ${state.address}.`;
  const el = document.getElementById("greeting");
  el.textContent = ""; let i = 0;
  clearInterval(el._tw);
  el._tw = setInterval(() => {
    el.textContent += full[i] || ""; i++;
    if(i > full.length) clearInterval(el._tw);
  }, 45);
}

// ===== ПИТОМЕЦ =====
const petBig=document.getElementById("petBig");
if(petBig){
  petBig.onclick = () => { petBig.classList.add("bounce"); beep(880,.07,"square",.05);
    setTimeout(()=>petBig.classList.remove("bounce"),400); };
  setInterval(()=>{ petBig.classList.add("blink");
    setTimeout(()=>petBig.classList.remove("blink"),150); }, 4000 + Math.random()*3000);

  const moodFill=document.getElementById("moodFill");
  const moodText=document.getElementById("moodText");
  function updateMood(){ state.mood=Math.max(0,Math.min(100,state.mood));
    moodFill.style.width=state.mood+"%"; moodText.textContent=Math.round(state.mood)+"%"; save(); }
  document.getElementById("petFeed").onclick = () => { state.mood+=20; updateMood(); beep(660,.07); };
  document.getElementById("petPlay").onclick = () => { state.mood+=15; updateMood(); beep(780,.07); };
  document.getElementById("petSleep").onclick = () => { state.mood-=5; updateMood(); beep(440,.1); };
  updateMood();
  setInterval(()=>{ state.mood-=2; updateMood(); }, 60000);
}

// ===== ПАРАЛЛАКС + ИСКРЫ =====
const scene=document.getElementById("orbScene");
const orb3d=document.getElementById("orb3d");
if(scene && orb3d){
  scene.addEventListener("mousemove", e => {
    const r=scene.getBoundingClientRect();
    const dx=(e.clientX-r.left-r.width/2)/r.width;
    const dy=(e.clientY-r.top-r.height/2)/r.height;
    orb3d.style.transform=`rotateY(${dx*14}deg) rotateX(${-dy*14}deg)`;
  });
  scene.addEventListener("mouseleave", () => { orb3d.style.transform=""; });
  scene.addEventListener("click", e => { burstSparks(e.clientX, e.clientY); beep(1000,.08,"sine",.05); });
}

// ===== ИСКРЫ =====
const spark = document.createElement("canvas");
spark.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:97;";
document.body.appendChild(spark);
const sctx = spark.getContext("2d");
function resizeSpark(){ spark.width=innerWidth; spark.height=innerHeight; }
resizeSpark(); addEventListener("resize", resizeSpark);
let sparks=[];
function burstSparks(x,y){
  for(let i=0;i<24;i++){
    const a=Math.random()*Math.PI*2, sp=2+Math.random()*4;
    sparks.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,
      color: Math.random()<.5 ? state.orbColor : state.orbColor2});
  }
}
(function sparkLoop(){
  sctx.clearRect(0,0,spark.width,spark.height);
  sparks = sparks.filter(s => s.life > 0);
  for(const s of sparks){
    s.x+=s.vx; s.y+=s.vy; s.vy+=.08; s.life-=.03;
    sctx.beginPath(); sctx.arc(s.x,s.y,2.2*s.life,0,Math.PI*2);
    sctx.fillStyle=s.color; sctx.globalAlpha=s.life;
    sctx.shadowBlur=10; sctx.shadowColor=s.color; sctx.fill(); sctx.globalAlpha=1;
  }
  requestAnimationFrame(sparkLoop);
})();

// ===== ФОН-ЗВЁЗДЫ =====
const bg=document.getElementById("bgCanvas");
if(bg){
  const ctx=bg.getContext("2d");
  let W,H,stars=[];
  function resize(){ W=bg.width=innerWidth; H=bg.height=innerHeight;
    stars=Array.from({length:80},()=>({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.6+.3, s:Math.random()*.25+.04, z:.3+Math.random()*.7 })); }
  resize(); addEventListener("resize",resize);
  (function loop(){ ctx.clearRect(0,0,W,H);
    for(const st of stars){ st.y+=st.s; if(st.y>H){ st.y=0; st.x=Math.random()*W; }
      ctx.beginPath(); ctx.arc(st.x,st.y,st.r*st.z,0,Math.PI*2);
      ctx.fillStyle=`rgba(140,210,255,${.2+st.z*.5})`; ctx.fill(); }
    requestAnimationFrame(loop); })();
}

// ===== ЧАСТИЦЫ СФЕРЫ (3D-орбиты) =====
const oc=document.getElementById("orbCanvas");
if(oc){
  const ctx=oc.getContext("2d");
  const W=oc.width=320, H=oc.height=320, cx=W/2, cy=H/2, R=110;
  const parts=Array.from({length:60},()=>({
    a:Math.random()*Math.PI*2, tilt:(Math.random()-.5)*0.9,
    r:R*(.4+Math.random()*.55), s:.001+Math.random()*.0035,
    z:.4+Math.random()*.6, tw:Math.random()*Math.PI*2 }));
  (function loop(){ ctx.clearRect(0,0,W,H);
    for(const p of parts){
      p.a += p.s; p.tw += .03;
      const ex = Math.cos(p.a) * p.r;
      const ey = Math.sin(p.a) * p.r * 0.55;
      const x = cx + ex;
      const y = cy + ey + p.tilt * Math.sin(p.a) * 20;
      const depth = (Math.sin(p.a) + 1) / 2;
      const sz = (1.4 + depth * 2.2) * p.z;
      const alpha = (0.15 + depth * 0.75) * (.6 + .4*Math.sin(p.tw));
      ctx.beginPath(); ctx.arc(x, y, sz, 0, Math.PI*2);
      ctx.fillStyle = `rgba(160,225,255,${alpha})`;
      ctx.shadowBlur = 8 * depth * p.z;
      ctx.shadowColor = "rgba(120,210,255,.9)";
      ctx.fill(); ctx.shadowBlur = 0;
    }
    requestAnimationFrame(loop); })();
}

function setOrbState(s){
  document.body.classList.remove("state-listen","state-think","state-speak","state-sleep");
  document.body.classList.add("state-"+s);
  document.getElementById("orb-state").textContent=s;
}

function fillForm() {
  $addr.value=state.address; $theme.value=state.theme;
  $color.value=state.orbColor; $color2.value=state.orbColor2;
  $int.value=state.orbIntensity; $spd.value=state.orbSpeed;
  $size.value=state.orbSize; $alpha.value=state.menuAlpha;
  $snd.checked=state.soundEnabled; $petHome.checked=state.petHome;
  document.getElementById("lbl-intensity").textContent=state.orbIntensity;
  document.getElementById("lbl-speed").textContent=state.orbSpeed;
  document.getElementById("lbl-size").textContent=state.orbSize;
  document.getElementById("lbl-alpha").textContent=state.menuAlpha;
}

fillForm(); applyAll(); renderGreeting();
