const clockCanvas = document.getElementById('clock');
const clockCtx = clockCanvas.getContext('2d');
const moonCanvas = document.getElementById('moon');
const moonCtx = moonCanvas.getContext('2d');
const swDialCanvas = document.getElementById('swDial');
const swDialCtx = swDialCanvas.getContext('2d');

let clockSize = { w: 0, h: 0 };
let moonSized = false;
let swDialSized = false;

function setupHiDPI(canvas, ctx){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return { w: rect.width, h: rect.height };
}
function resizeAll(){
  clockSize = setupHiDPI(clockCanvas, clockCtx);
  setupHiDPI(moonCanvas, moonCtx); moonSized = true;
  setupHiDPI(swDialCanvas, swDialCtx); swDialSized = true;
}
window.addEventListener('resize', resizeAll, { passive: true });

function colorVar(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* ===== Main clock drawing ===== */
function drawClockFrame(ctx, W, H){
  const cx = W/2, cy = H/2;
  const radius = Math.min(W,H)/2 - 45;

  ctx.clearRect(0,0,W,H);

  ctx.beginPath();
  ctx.arc(cx, cy, radius + 15, 0, Math.PI*2);
  ctx.strokeStyle = colorVar('--ring-1');
  ctx.lineWidth = 1;
  ctx.stroke();

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, '#1a1a3e');
  gradient.addColorStop(0.7, '#0f0f23');
  gradient.addColorStop(1, '#0a0a1a');

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI*2);
  ctx.fillStyle = gradient; ctx.fill();
  ctx.strokeStyle = colorVar('--ring-2'); ctx.lineWidth = 1; ctx.stroke();

  drawLogScaleWithNumerals(ctx, cx, cy, radius);
  drawHourMarks(ctx, cx, cy, radius);
  return { cx, cy, radius };
}

function drawLogScaleWithNumerals(ctx, cx, cy, radius){
  const marks = [0,1,2,5,10,15,20,30,40,50,60];
  marks.forEach(val=>{
    const frac = val===0 ? 0 : Math.log2(val+1)/Math.log2(61);
    const ang  = frac * Math.PI*2 - Math.PI/2;
    const isMain = val % 10 === 0;

    ctx.beginPath();
    ctx.moveTo(cx + (radius+5)*Math.cos(ang), cy + (radius+5)*Math.sin(ang));
    ctx.lineTo(cx + (radius + (isMain?12:8))*Math.cos(ang), cy + (radius + (isMain?12:8))*Math.sin(ang));
    ctx.strokeStyle = isMain ? colorVar('--ring-2') : colorVar('--ring-1');
    ctx.lineWidth = isMain ? 1.5 : 1;
    ctx.stroke();

    if (isMain && val > 0) {
      const rNum = radius + 20;
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = colorVar('--ring-2');
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(val, cx + rNum*Math.cos(ang), cy + rNum*Math.sin(ang));
    }
  });

  for(let i=0;i<=60;i+=5){
    if(!marks.includes(i)){
      const frac = Math.log2(i+1)/Math.log2(61);
      const ang  = frac * Math.PI*2 - Math.PI/2;
      ctx.beginPath();
      ctx.arc(cx + (radius+6)*Math.cos(ang), cy + (radius+6)*Math.sin(ang), 1, 0, Math.PI*2);
      ctx.fillStyle = colorVar('--ring-1'); ctx.fill();
    }
  }
}

function drawHourMarks(ctx, cx, cy, radius){
  for(let i=0;i<=12;i++){
    const logPosition = i===0 ? 0 : Math.log2(i+1)/Math.log2(13);
    const ang = logPosition * Math.PI*2 - Math.PI/2;
    const isMain = i % 3 === 0;
    const innerR = radius - 20;
    const outerR = radius - (isMain ? 8 : 12);

    ctx.beginPath();
    ctx.moveTo(cx + innerR*Math.cos(ang), cy + innerR*Math.sin(ang));
    ctx.lineTo(cx + outerR*Math.cos(ang), cy + outerR*Math.sin(ang));
    ctx.strokeStyle = isMain ? '#64748b' : colorVar('--ring-2');
    ctx.lineWidth = isMain ? 2 : 1; ctx.lineCap = 'round'; ctx.stroke();

    const numR = radius - 35;
    const num = i===0 ? 12 : i;
    ctx.font = isMain ? '14px Inter, sans-serif' : '11px Inter, sans-serif';
    ctx.fillStyle = isMain ? '#64748b' : '#475569';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(num, cx + numR*Math.cos(ang), cy + numR*Math.sin(ang));
  }
}

function drawHand(ctx, cx, cy, frac, len, width, color){
  const ang = frac * Math.PI*2 - Math.PI/2;
  const x = cx + len*Math.cos(ang);
  const y = cy + len*Math.sin(ang);

  ctx.beginPath();
  ctx.moveTo(cx, cy); ctx.lineTo(x, y);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y, width/2, 0, Math.PI*2);
  ctx.fillStyle = color; ctx.fill();
}

function drawCenter(ctx, cx, cy){
  ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI*2);
  const c = ctx.createRadialGradient(cx, cy, 0, cx, cy, 6);
  c.addColorStop(0, colorVar('--fg')); c.addColorStop(1, colorVar('--muted'));
  ctx.fillStyle = c; ctx.fill();
}

/* ===== Calendar / Moon ===== */
function updateCalendar(now){
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('dayName').textContent = days[now.getDay()].toUpperCase();
  document.getElementById('monthName').textContent = months[now.getMonth()];
  document.getElementById('dateNum').textContent = String(now.getDate()).padStart(2,'0');
  document.getElementById('yearNum').textContent = String(now.getFullYear());
}

function phaseName(p){
  if(p<.03||p>.97)return'New Moon';
  if(p<.22)return'Waxing Crescent';
  if(p<.28)return'First Quarter';
  if(p<.47)return'Waxing Gibbous';
  if(p<.53)return'Full Moon';
  if(p<.72)return'Waning Gibbous';
  if(p<.78)return'Last Quarter';
  return'Waning Crescent';
}

function drawMoonphase(now){
  if(!moonSized)return;
  const rect = moonCanvas.getBoundingClientRect();
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  if(moonCanvas.width!==Math.round(rect.width*dpr)||moonCanvas.height!==Math.round(rect.height*dpr)){
    setupHiDPI(moonCanvas, moonCtx);
  }
  const W = rect.width, H = rect.height;
  moonCtx.clearRect(0,0,W,H);

  const x=W*.5,y=H*.5,r=Math.min(W,H)*.28;
  const syn=29.530588853;
  const epoch=Date.UTC(2000,0,6,18,14,0);
  const days=(now.getTime()-epoch)/86400000;
  const age=((days%syn)+syn)%syn;
  const phase=age/syn;
  const illum=.5*(1-Math.cos(2*Math.PI*phase));
  const k=(1-2*illum)*r;

  const sky=moonCtx.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#0c1a33'); sky.addColorStop(1,'#091326');
  moonCtx.fillStyle=sky; moonCtx.fillRect(0,0,W,H);

  moonCtx.save(); moonCtx.beginPath(); moonCtx.arc(x,y,r,0,Math.PI*2); moonCtx.clip();
  moonCtx.fillStyle=colorVar('--fg'); moonCtx.beginPath(); moonCtx.arc(x,y,r,0,Math.PI*2); moonCtx.fill();
  moonCtx.globalCompositeOperation='destination-out';
  moonCtx.beginPath(); moonCtx.ellipse(x+k,y,Math.abs(k),r,0,0,Math.PI*2); moonCtx.fill();
  moonCtx.restore();

  moonCtx.beginPath(); moonCtx.arc(x,y,r,0,Math.PI*2);
  moonCtx.strokeStyle=colorVar('--ring-2'); moonCtx.lineWidth=1; moonCtx.stroke();

  document.getElementById('moonSub').textContent = phaseName(phase);
}

/* ===== Stopwatch ===== */
let swRunning=false, swStartTs=0, swElapsed=0, lastLap=0;
const swTimeEl=document.getElementById('swTime');
const swStartBtn=document.getElementById('swStart');
const swLapBtn=document.getElementById('swLap');
const swResetBtn=document.getElementById('swReset');
const swLapsEl=document.getElementById('swLaps');

function fmtMS(ms){
  const total=Math.floor(ms/10);
  const cs=total%100;
  const s=Math.floor(total/100)%60;
  const m=Math.floor(total/6000);
  return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+'.'+String(cs).padStart(2,'0');
}

function drawStopwatchFrame(ctx, W, H){
  const cx = W/2, cy = H/2;
  const radius = Math.min(W,H)/2 - 18;

  ctx.clearRect(0,0,W,H);

  ctx.beginPath();
  ctx.arc(cx, cy, radius + 10, 0, Math.PI*2);
  ctx.strokeStyle = colorVar('--ring-1');
  ctx.lineWidth = 1;
  ctx.stroke();

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, '#131a34');
  grad.addColorStop(0.7, '#0e1328');
  grad.addColorStop(1, '#0a0e1f');

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI*2);
  ctx.fillStyle = grad; ctx.fill();
  ctx.strokeStyle = colorVar('--ring-2'); ctx.lineWidth = 1; ctx.stroke();

  const secMarks = [0,1,2,5,10,15,20,30,40,50,60];
  secMarks.forEach(val=>{
    const frac = val===0 ? 0 : Math.log2(val+1)/Math.log2(61);
    const ang  = frac * Math.PI*2 - Math.PI/2;
    const isMain = val % 10 === 0;

    const inner = radius - (isMain ? 6 : 10);
    const outer = radius - 2;

    ctx.beginPath();
    ctx.moveTo(cx + inner*Math.cos(ang), cy + inner*Math.sin(ang));
    ctx.lineTo(cx + outer*Math.cos(ang), cy + outer*Math.sin(ang));
    ctx.strokeStyle = isMain ? colorVar('--ring-2') : colorVar('--ring-1');
    ctx.lineWidth = isMain ? 1.6 : 1;
    ctx.stroke();

    if (isMain && val > 0){
      const rNum = radius - 16;
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = colorVar('--ring-2');
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(val, cx + rNum*Math.cos(ang), cy + rNum*Math.sin(ang));
    }
  });

  for(let i=0;i<=60;i+=5){
    if(!secMarks.includes(i)){
      const frac = Math.log2(i+1)/Math.log2(61);
      const ang  = frac * Math.PI*2 - Math.PI/2;
      const rDot = radius - 3;
      ctx.beginPath();
      ctx.arc(cx + rDot*Math.cos(ang), cy + rDot*Math.sin(ang), 1, 0, Math.PI*2);
      ctx.fillStyle = colorVar('--ring-1'); ctx.fill();
    }
  }

  const innerR = radius * 0.62;
  for (let val=0; val<=60; val+=5){
    const frac = Math.log2(val+1)/Math.log2(61);
    const ang  = frac * Math.PI*2 - Math.PI/2;
    const isMain = val % 10 === 0;

    const inTick = innerR - (isMain ? 6 : 4);
    const outTick= innerR;

    ctx.beginPath();
    ctx.moveTo(cx + inTick*Math.cos(ang), cy + inTick*Math.sin(ang));
    ctx.lineTo(cx + outTick*Math.cos(ang), cy + outTick*Math.sin(ang));
    ctx.strokeStyle = isMain ? '#64748b' : colorVar('--ring-2');
    ctx.lineWidth = isMain ? 1.4 : 1;
    ctx.stroke();

    if (isMain){
      const rNum = innerR - 14;
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#8aa0bf';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(val, cx + rNum*Math.cos(ang), cy + rNum*Math.sin(ang));
    }
  }

  return { cx, cy, radius, innerR };
}

function drawStopwatchAnalog(){
  if(!swDialSized)return;
  const rect = swDialCanvas.getBoundingClientRect();
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  if(swDialCanvas.width!==Math.round(rect.width*dpr)||swDialCanvas.height!==Math.round(rect.height*dpr)){
    setupHiDPI(swDialCanvas, swDialCtx);
  }
  const W=rect.width,H=rect.height;
  const {cx,cy,radius,innerR} = drawStopwatchFrame(swDialCtx, W, H);

  const nowPerf = performance.now();
  const elapsed = swRunning ? swElapsed + (nowPerf - swStartTs) : swElapsed;

  const totalCs = Math.floor(elapsed/10);
  const cs = totalCs % 100;
  const s  = Math.floor(totalCs/100) % 60;
  const m  = Math.floor(totalCs/6000) % 60;

  const sFloat = s + cs/100;
  const mFloat = m + sFloat/60;

  const secondValue = Math.log2(sFloat + 1) / Math.log2(61);
  const minuteValue = Math.log2(mFloat + 1) / Math.log2(61);
  const centiValue  = Math.log2(cs + 1) / Math.log2(101);

  drawHand(swDialCtx, cx, cy, minuteValue, innerR * 0.9, 3.4, colorVar('--hand'));
  drawHand(swDialCtx, cx, cy, secondValue, radius * 0.86, 2.0, colorVar('--accent'));
  drawHand(swDialCtx, cx, cy, centiValue,  innerR * 0.55, 1.1, colorVar('--muted'));
  drawCenter(swDialCtx, cx, cy);
}

function updateStopwatch(){
  if(swRunning){
    const now=performance.now();
    const elapsed=swElapsed+(now-swStartTs);
    swTimeEl.textContent=fmtMS(elapsed);
  }
  drawStopwatchAnalog();
}

function startStopwatch(){
  if(swRunning){ pauseStopwatch(); return; }
  swRunning=true; swStartTs=performance.now();
  swStartBtn.textContent='Pause'; swLapBtn.disabled=false; swResetBtn.disabled=false;
}
function pauseStopwatch(){
  if(!swRunning)return;
  swElapsed+=performance.now()-swStartTs;
  swRunning=false; swStartBtn.textContent='Start';
}
function resetStopwatch(){
  swRunning=false; swElapsed=0; lastLap=0;
  swStartBtn.textContent='Start'; swLapBtn.disabled=true; swResetBtn.disabled=true;
  swTimeEl.textContent='00:00.00'; swLapsEl.innerHTML='';
}
function lapStopwatch(){
  const now=swRunning?swElapsed+(performance.now()-swStartTs):swElapsed;
  const lapTime=now-lastLap; lastLap=now;
  const li=document.createElement('li');
  const n=swLapsEl.children.length+1;
  li.textContent='Lap '+String(n).padStart(2,'0')+' — '+fmtMS(lapTime)+'  (total '+fmtMS(now)+')';
  swLapsEl.prepend(li);
}
document.getElementById('swStart').addEventListener('click', startStopwatch);
document.getElementById('swReset').addEventListener('click', resetStopwatch);
document.getElementById('swLap').addEventListener('click', lapStopwatch);

/* ===== Loop ===== */
function tick(){
  const {w:W,h:H}=clockSize;
  const frame=drawClockFrame(clockCtx,W,H);

  const now=new Date();
  const h=now.getHours();
  const sFloat=now.getSeconds()+now.getMilliseconds()/1000;
  const mFloat=now.getMinutes()+sFloat/60;

  document.getElementById('hours').textContent=String(h).padStart(2,'0');
  document.getElementById('minutes').textContent=String(now.getMinutes()).padStart(2,'0');
  document.getElementById('seconds').textContent=String(now.getSeconds()).padStart(2,'0');

  updateCalendar(now);
  drawMoonphase(now);

  const hourValue   = Math.log2((h%12)+1 + mFloat/60)/Math.log2(13);
  const minuteValue = Math.log2(mFloat + 1)/Math.log2(61);
  const secondValue = Math.log2(sFloat + 1)/Math.log2(61);

  drawHand(clockCtx, frame.cx, frame.cy, hourValue,   frame.radius*0.5, 5,   colorVar('--hand'));
  drawHand(clockCtx, frame.cx, frame.cy, minuteValue, frame.radius*0.7, 3.5, colorVar('--hand'));
  drawHand(clockCtx, frame.cx, frame.cy, secondValue, frame.radius*0.85,2,   colorVar('--accent'));
  drawCenter(clockCtx, frame.cx, frame.cy);

  updateStopwatch();
  requestAnimationFrame(tick);
}

function boot(){
  resizeAll();
  requestAnimationFrame(tick);
}
boot();
