
'use strict';
// ─────────────────────────────────────────
// STATE
// ─────────────────────────────────────────
const S = {
  phase:'intro', audioOn:true, xp:0, streak:0, badges:[],
  stDone:[false,false,false,false,false],   // 5 stations
  wResults:Array(8).fill(null),
  totalQ:0, totalOk:0,
  activeW:null, wQIdx:0, wAnswers:[], curQ:null,
  hints:0, attempts:0, storyP:0, reflectStep:0,
  usedTypes:[]
};

const PHASES=['intro','wonder','story','simulate','play','reflect'];
const PLABELS=['Welcome','Wonder','Story','Simulate','Practice','Reflect'];
const PICONS=['🏠','🤔','📖','🔬','🏆','🌟'];

// ─────────────────────────────────────────
// FLOATING BACKGROUND
// ─────────────────────────────────────────
(function(){
  const shapes=['◆','▲','⬟','⬡','⬢','◇','▷','□','△','⬠'];
  const c=document.getElementById('fl');
  for(let i=0;i<20;i++){
    const d=document.createElement('div');
    d.className='fl-item';
    d.textContent=shapes[i%shapes.length];
    d.style.left=Math.random()*100+'vw';
    d.style.fontSize=(1.2+Math.random()*2.8)+'rem';
    d.style.animationDuration=(14+Math.random()*16)+'s';
    d.style.animationDelay=-(Math.random()*25)+'s';
    c.appendChild(d);
  }
})();

// ─────────────────────────────────────────
// AUDIO (Web Audio API tones)
// ─────────────────────────────────────────
let actx=null;
function gac(){if(!actx)actx=new(window.AudioContext||window.webkitAudioContext)();return actx;}
function tone(f,t='sine',d=.18,v=.14){
  if(!S.audioOn)return;
  try{const c=gac(),o=c.createOscillator(),g=c.createGain();
    o.connect(g);g.connect(c.destination);o.type=t;o.frequency.value=f;
    g.gain.setValueAtTime(v,c.currentTime);
    g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);
    o.start();o.stop(c.currentTime+d);}catch(e){}
}
let currentAudio = null;
function playVoice(id) {
    if (!S.audioOn) return;
    if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
    currentAudio = new Audio('audio/' + id + '.mp3');
    currentAudio.play().catch(e => console.log('Audio play failed:', e));
}
function sndOk(){tone(880,'sine',.14,.2);setTimeout(()=>tone(1100,'sine',.14,.2),130);}
function sndWrong(){tone(200,'sawtooth',.28,.15); playVoice('feedback_wrong');}
function sndClick(){tone(660,'sine',.07,.1);}
function sndBadge(){[440,550,660,880].forEach((f,i)=>setTimeout(()=>tone(f,'sine',.2,.18),i*110));}
function sndTap(){tone(750,'sine',.06,.08);}

// ─────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────
function confetti(n=60){
  const c=document.getElementById('confetti'); c.innerHTML='';
  const cols=['#ffc107','#4caf50','#7c5cbf','#ef5350','#29b6f6','#ff7043'];
  for(let i=0;i<n;i++){
    const p=document.createElement('div'); p.className='cpiece';
    p.style.left=Math.random()*100+'vw';
    p.style.background=cols[Math.floor(Math.random()*cols.length)];
    p.style.width=(5+Math.random()*8)+'px'; p.style.height=(9+Math.random()*6)+'px';
    p.style.animationDuration=(1.8+Math.random()*2.2)+'s';
    p.style.animationDelay=(Math.random()*.8)+'s';
    c.appendChild(p); setTimeout(()=>p.remove(),5000);
  }
}

// ─────────────────────────────────────────
// XP POPUP + BADGE
// ─────────────────────────────────────────
function xpPop(n){
  const el=document.createElement('div'); el.className='xp-pop';
  el.textContent='+'+n+' XP'; document.body.appendChild(el);
  setTimeout(()=>el.remove(),1600);
}
function badgePop(txt){
  const el=document.createElement('div'); el.className='xp-pop';
  el.style.top='120px'; el.textContent=txt; document.body.appendChild(el);
  setTimeout(()=>el.remove(),2200);
}

// ─────────────────────────────────────────
// JOURNEY BAR
// ─────────────────────────────────────────
function journeyBar(){
  const pi=PHASES.indexOf(S.phase); if(pi===0)return '';
  let h='<div class="journey-bar">';
  for(let i=1;i<PHASES.length;i++){
    const on=pi===i, dn=pi>i;
    h+=`<div class="jstep ${on?'active':''} ${dn?'done':''}">
      <div class="jdot">${dn?'✓':PICONS[i]}</div>
      <span class="jlabel">${PLABELS[i]}</span></div>`;
    if(i<PHASES.length-1)h+=`<div class="jconn ${dn?'done':''}"></div>`;
  }
  return h+'</div>';
}
function homeBtn(){
  if(S.phase==='intro')return '';
  return `<button class="home-btn" onclick="goHome()">🏠 Home</button>`;
}
function audioBtn(){
  return `<button class="audio-btn" onclick="toggleAudio()">${S.audioOn?'🔊':'🔇'}</button>`;
}
function goHome(){if(confirm('Return to Welcome?')){S.phase='intro';render();}}
function toggleAudio(){
  sndClick();
  S.audioOn=!S.audioOn;
  const btn = document.querySelector('.audio-btn');
  if(btn) btn.textContent = S.audioOn?'🔊':'🔇';
  if(!S.audioOn && currentAudio) {
    currentAudio.pause();
  } else if (S.audioOn) {
    replayCurrentPhaseAudio();
  }
}
function replayCurrentPhaseAudio() {
    switch (S.phase) {
        case 'intro': playVoice('welcome_intro'); break;
        case 'wonder': playVoice('wonder_' + (S.wonderP || 1)); break;
        case 'story': playVoice('story_' + (S.storyP + 1)); break;
        case 'simulate': playVoice('sim_' + simSt.st); break;
        case 'play': playVoice('practice_intro'); break;
        case 'reflect': playVoice('reflect_intro'); break;
    }
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function rnd(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function shuffle(a){const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;}
function distractors(c,mn,mx,ct=3){
  const d=new Set(),offs=shuffle([-30,-20,-15,-10,-5,5,10,15,20,30]);
  for(const o of offs){const v=c+o;if(v>=mn&&v<=mx&&v!==c&&!d.has(v))d.add(v);if(d.size>=ct)break;}
  while(d.size<ct){const v=rnd(mn,mx);if(v!==c)d.add(v);}
  return shuffle([c,...d]).slice(0,4);
}

// ─────────────────────────────────────────
// PHASES RENDER
// ─────────────────────────────────────────
function render(){
  const app=document.getElementById('app');
  let h=journeyBar()+homeBtn()+audioBtn();
  switch(S.phase){
    case 'intro':    h+=renderIntro();    break;
    case 'wonder':   h+=renderWonder();   setTimeout(doRevealWonder,120); break;
    case 'story':    h+=renderStory();    setTimeout(revealStoryText,80); break;
    case 'simulate': h+=renderSimulate(); break;
    case 'play':     h+=renderPlay();     break;
    case 'reflect':  h+=renderReflect();  break;
  }
  app.innerHTML=h;
}

// ═══════════════════════════════════════════
// INTRO
// ═══════════════════════════════════════════
function renderIntro(){
  return `<div class="intro-wrap">
    <div class="intro-badge">🌍 Intellia SG · Grade 7</div>
    <div class="mascot-row"><div class="mascot lg happy">🤖</div></div>
    <h1 class="intro-h1">Quadrilaterals from<br/>Triangles &amp; Polygons</h1>
    <p class="intro-sub">Discover how every quadrilateral is secretly made of two triangles — and how that one idea unlocks the angle secrets of <em>any</em> polygon!</p>
    ${!S.introStarted 
      ? `<button class="btn btn-gold btn-lg" style="margin-top:6px;animation:bounceIn .6s" onclick="startIntroVoice()">🚀 Start Learning</button>`
      : `<button class="btn btn-violet btn-lg" style="margin-top:6px;animation:bounceIn .6s" onclick="goWonder()">✨ Begin Your Journey</button>`}
    <div class="journey-strip">
      <div class="jmap-title">Your Learning Journey</div>
      <div class="jmap-steps">
        ${[['🤔','Wonder','The big question'],['📖','Story','5 panels · real discovery'],['🔬','Simulate','5 interactive stations'],['🏆','Practice','8 worlds · 10 Qs each'],['🌟','Reflect','Earn your certificate']].map((s,i,a)=>`
          <div class="jmap-step"><div class="jmap-icon">${s[0]}</div><div><div class="jmap-label">${s[1]}</div><div class="jmap-desc">${s[2]}</div></div></div>
          ${i<a.length-1?'<div class="jmap-arrow">→</div>':''}`).join('')}
      </div>
    </div>
    <div class="feat-row">
      ${[['🧩','Interactive Simulations'],['🎮','Gamified Practice'],['🏅','8 Badges to Earn'],['📱','Mobile & Tablet Ready']].map(f=>`<div class="feat-card"><div class="feat-icon">${f[0]}</div><div class="feat-label">${f[1]}</div></div>`).join('')}
    </div>
  </div>`;
}
function startIntroVoice(){sndClick(); S.introStarted=true; playVoice('welcome_intro'); render();}
function goWonder(){sndClick();S.phase='wonder';S.wonderP=1; playVoice('wonder_1'); render();}

// ═══════════════════════════════════════════
// WONDER
// ═══════════════════════════════════════════
function renderWonder(){
  if (S.wonderP === 1) {
    return `<div class="wonder-wrap">
      <div class="wonder-ball show" id="wball"><div class="wonder-glow"></div><div class="wonder-qmark">?</div></div>
      <div class="wonder-card show" id="wcard">
        <div class="wonder-emoji">🪁</div>
        <div class="wonder-qtext">Sarah is building a kite frame in her backyard. John and Mike are helping hold the fabric.</div>
      </div>
      <div class="wonder-btn-wrap show" id="wbtnw">
        <button class="btn btn-violet btn-lg" onclick="nextWonder()">Next →</button>
      </div>
    </div>`;
  } else {
    return `<div class="wonder-wrap">
      <div class="wonder-ball show" id="wball"><div class="wonder-glow"></div><div class="wonder-qmark">?</div></div>
      <div class="wonder-card show" id="wcard">
        <div class="wonder-emoji">🤔</div>
        <div class="wonder-qtext">Mike looks at the four corners and asks:<br/><br/><em>"How do you know all four corners will fit the frame exactly — no matter what shape we make it?"</em></div>
        <div class="wonder-sub">💭 Think about it before we explore...</div>
      </div>
      <div class="mascot-row"><div class="mascot lg think">🤖</div><div class="speech-bubble">What do you know about triangles? 🤔</div></div>
      <div class="wonder-btn-wrap show" id="wbtnw">
        <button class="btn btn-gold btn-lg" onclick="goStory()">✨ Let's find out!</button>
      </div>
    </div>`;
  }
}
function nextWonder(){sndClick();S.wonderP=2; playVoice('wonder_2'); render();}
function doRevealWonder(){} // No longer needed
function goStory(){sndClick();S.phase='story';S.storyP=0; playVoice('story_1'); render();}

// ═══════════════════════════════════════════
// STORY (5 panels)
// ═══════════════════════════════════════════
const PANELS=[
  {title:'Panel 1 — The Kite Problem',img:'images/story_1.png',
   body:`Sarah is building a diamond-shaped kite frame in her backyard. John and Mike are helping hold the fabric. Mike looks at the four corners and asks: <em>"How do you know all four corners will fit the frame exactly — no matter what shape we make it?"</em><br/><br/>Sarah smiles: <em>"Let's find out — starting with something we already know about triangles."</em>`,
   hl:'💡 Key Question: Do the four angles of ANY quadrilateral always add up to the same total?',
   mascot:'🤔',say:'Great question, Mike! Let\'s investigate!'},
  {title:'Panel 2 — The Triangle Secret',img:'images/story_2.png',
   body:`John grabs a piece of paper and draws a triangle. He tears off all three corners and lines them up, edge to edge, along a ruler. They form a <strong>perfectly straight line</strong>!<br/><br/><em>"See?"</em> says John. <em>"However we draw the triangle — big or small, wide or thin — the three corners ALWAYS make a straight line. That's 180° every time!"</em>`,
   hl:'📐 Triangle Angle Sum: ∠A + ∠B + ∠C = 180° — always, for any triangle!',
   mascot:'😮',say:'Try it with ANY triangle — it always works!'},
  {title:'Panel 3 — The Diagonal Discovery',img:'images/story_3.png',
   body:`Back at the kite, Sarah folds the fabric along its diagonal — the line joining two opposite corners. The kite splits into <strong>TWO perfect triangles</strong>!<br/><br/>Sarah exclaims: <em>"If each triangle gives 180°, and the kite is just two triangles stuck together… 180° + 180° = 360°! That's why the four corners always total the same!"</em> Mike's jaw drops.`,
   hl:'🔺 + 🔺 = Quadrilateral: 180° + 180° = 360° — every time, for any quadrilateral!',
   mascot:'🤩',say:'One diagonal splits any quad into 2 triangles — that\'s the big idea!'},
  {title:'Panel 4 — Any Polygon!',img:'images/story_4.png',
   body:`Mike is now building a <strong>hexagonal (6-sided)</strong> skateboard ramp base. He asks: <em>"What about shapes with even MORE sides?"</em><br/><br/>Sarah draws diagonals from just <strong>one corner</strong> of the hexagon, splitting it into 4 triangles: <em>"A hexagon → 4 triangles → 4 × 180° = 720°. For any n-sided polygon: (n − 2) × 180°!"</em>`,
   hl:'🔢 General Formula: Angle Sum of any polygon = (n − 2) × 180°',
   mascot:'🧮',say:'Hexagon: (6−2)×180° = 720°. Pentagon: (5−2)×180° = 540°!'},
  {title:'Panel 5 — The Quadrilateral Family',img:'images/story_5.png',
   body:`The three friends lay out all their pieces: John's <strong>rectangle</strong>, Sarah's <strong>rhombus</strong>-tiled path, Mike's <strong>kite</strong>, and a <strong>trapezoid</strong> they found. Mike notices they all have four sides but look so different.<br/><br/>Sarah explains: <em>"A square has all equal sides AND all right angles — it's a rectangle AND a rhombus. A kite has two pairs of adjacent equal sides. A trapezoid has exactly one pair of parallel sides."</em>`,
   hl:'🏠 Quad Family: Trapezoid → Parallelogram → Rectangle / Rhombus → Square',
   mascot:'👨‍🏫',say:'A square IS a rectangle AND a rhombus — it fits both families!'},
];

function renderStory(){
  const p=S.storyP, pan=PANELS[p], pct=p/PANELS.length*100;
  return `<div class="story-wrap">
    <div class="story-pbar-row">
      <div class="story-pbar-track"><div class="story-pbar-fill" style="width:${pct}%"></div></div>
      <span style="color:var(--text-muted);font-size:.78rem;white-space:nowrap">Panel ${p+1}/${PANELS.length}</span>
    </div>
    <div class="story-card" id="scard">
      <div class="story-flex">
        <div class="story-img-col">
          <img class="story-img" src="${pan.img}" alt="Story panel ${p+1}" loading="eager"/>
        </div>
        <div class="story-txt-col">
          <div class="story-ptitle">${pan.title}</div>
          <div class="story-body" id="sbody">${pan.body}</div>
          <div class="story-hl" id="shl"><span class="story-hl-text">${pan.hl}</span></div>
          <div class="mascot-row" style="margin-top:10px;justify-content:flex-start">
            <div class="mascot sm">${pan.mascot}</div>
            <div class="speech-bubble" style="font-size:.82rem;max-width:180px">${pan.say}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="story-nav-row">
      <button class="btn btn-outline btn-sm" onclick="storyPrev()" ${p===0?'disabled':''}>← Back</button>
      <div class="story-dots">
        ${PANELS.map((_,i)=>`<div class="sdot ${i===p?'on':i<p?'done':''}" onclick="goPanel(${i})"></div>`).join('')}
      </div>
      ${p<PANELS.length-1
        ?`<button class="btn btn-gold btn-sm" onclick="storyNext()">Next →</button>`
        :`<button class="btn btn-green btn-sm" onclick="goSimulate()">🔬 Simulate!</button>`}
    </div>
  </div>`;
}
function revealStoryText(){
  setTimeout(()=>{const e=document.getElementById('sbody');if(e)e.classList.add('show');},100);
  setTimeout(()=>{const e=document.getElementById('shl');if(e)e.classList.add('show');},500);
}
function storyNext(){sndClick();flip(()=>{S.storyP=Math.min(S.storyP+1,PANELS.length-1); playVoice('story_'+(S.storyP+1)); render();});}
function storyPrev(){sndClick();flip(()=>{S.storyP=Math.max(S.storyP-1,0); playVoice('story_'+(S.storyP+1)); render();});}
function goPanel(i){sndClick();flip(()=>{S.storyP=i; playVoice('story_'+(S.storyP+1)); render();});}
function flip(cb){const c=document.getElementById('scard');if(c)c.classList.add('flip');setTimeout(cb,280);}
function goSimulate(){sndClick();S.phase='simulate';simSt.st=0; playVoice('sim_0'); render();}

// ═══════════════════════════════════════════
// SIMULATE (5 stations)
// ═══════════════════════════════════════════
const STNS=[
  {id:0,name:'Corner Tear-Up',icon:'✂️',sub:'Triangle Machine'},
  {id:1,name:'Diagonal Split',icon:'📐',sub:'Quadrilaterals from Triangles'},
  {id:2,name:'Polygon Builder',icon:'🔢',sub:'From Triangles to Any Shape'},
  {id:3,name:'Shape Sorter',icon:'🃏',sub:'Quadrilateral Family Tree'},
  {id:4,name:'Exterior Angles',icon:'🔄',sub:'360° Always!'},
];

const simSt={
  st:0,
  triA:[60,70,50],triRound:0,triShown:false,
  quadA:[90,80,110,80],quadSplit:false,quadRound:0,
  polyN:5,polyTri:false,
  shapes:[],placed:{},selShape:null,doneD:false,
  extN:6,extDone:false,
};

function initD(){
  const raw=[
    {id:'trap',name:'Trapezoid',icon:'🔷',zones:['quad']},
    {id:'kite',name:'Kite',icon:'🪁',zones:['quad']},
    {id:'para',name:'Parallelogram',icon:'▱',zones:['para','quad']},
    {id:'rect',name:'Rectangle',icon:'▬',zones:['rect','para','quad']},
    {id:'rhom',name:'Rhombus',icon:'💠',zones:['rhom','para','quad']},
    {id:'sq',  name:'Square',   icon:'⬜',zones:['sq','rect','rhom','para','quad']},
  ];
  simSt.shapes=shuffle(raw); simSt.placed={}; simSt.selShape=null; simSt.doneD=false;
}
initD();

function resetA(){const a=rnd(30,80),b=rnd(30,80),c=180-a-b;simSt.triA=[a,b,c];simSt.triShown=false;}
function resetB(){const a=rnd(70,110),b=rnd(70,110),c=rnd(70,110),d=360-a-b-c;simSt.quadA=(d>40&&d<170)?[a,b,c,d]:[90,80,100,90];simSt.quadSplit=false;}

function renderSimulate(){
  return `<div class="sim-wrap">
    <div class="sim-hdr"><div class="sim-label">🔬 Simulation Lab</div><div class="sim-sub">Complete all 5 stations to unlock Practice!</div></div>
    <div class="station-tabs">${STNS.map((s,i)=>`<button class="stab ${i===simSt.st?'on':''} ${S.stDone[i]?'done':''}" onclick="switchStn(${i})">${s.icon} ${s.name}${S.stDone[i]?' ✓':''}</button>`).join('')}</div>
    <div class="scard">
      <div class="scard-title">${STNS[simSt.st].icon} ${STNS[simSt.st].name}</div>
      <div class="scard-sub">${STNS[simSt.st].sub}</div>
      ${renderStn(simSt.st)}
    </div>
    ${S.stDone[4]?`<button class="btn btn-green btn-lg" style="margin-top:18px" onclick="goPlay()">🏆 Go to Practice!</button>`:''}
  </div>`;
}

function switchStn(i){sndTap();simSt.st=i; playVoice('sim_'+i); render();}

function renderStn(i){
  switch(i){case 0:return stnA();case 1:return stnB();case 2:return stnC();case 3:return stnD();case 4:return stnE();}
  return '';
}

function tearA(){sndTap();simSt.triShown=true;sndOk();setTimeout(()=>sndOk(),300);render();}
function newA(){sndTap();if(simSt.triShown)simSt.triRound=Math.min(simSt.triRound+1,2);resetA();render();}

/* ── STATION A: Corner Tear-Up ─── */
function stnA(){
  const [a,b,c] = simSt.triA;
  const ts = simSt.triShown;
  return `
  <div class="instr">✂️ Tear off the corners of any triangle and line them up. What do you notice about the angles?</div>
  <div class="step-chips">
    <div class="schip ${!ts?'active':'done'}">1 · View Triangle</div>
    <div class="schip ${ts?'active':''}">2 · Tear & Line Up</div>
  </div>
  <div class="sim-canvas" style="min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden">
    ${ts ? `
      <div style="font-family:var(--font-display);color:var(--text-muted);margin-bottom:20px;animation:fadeIn .5s">The three corners form a straight line!</div>
      <div style="display:flex;align-items:flex-end;border-bottom:4px solid rgba(255,255,255,.2);padding-bottom:2px;animation:slideUp .5s">
        <div style="width:60px;height:60px;background:var(--purple-light);border-radius:0 100% 0 0;display:flex;align-items:end;justify-content:start;padding:8px;font-family:var(--font-display);font-weight:700">${a}°</div>
        <div style="width:60px;height:60px;background:var(--gold-dark);border-radius:100% 100% 0 0;display:flex;align-items:end;justify-content:center;padding:8px;font-family:var(--font-display);font-weight:700">${b}°</div>
        <div style="width:60px;height:60px;background:var(--coral);border-radius:100% 0 0 0;display:flex;align-items:end;justify-content:end;padding:8px;font-family:var(--font-display);font-weight:700">${c}°</div>
      </div>
      <div class="total-box" style="margin-top:20px;background:rgba(76,175,80,.18);border:2px solid var(--green);animation:popIn .4s .3s backwards">
        <div class="tb-val" style="color:var(--green)">180°</div>
        <div class="tb-lbl">Straight Line</div>
      </div>
    ` : `
      <svg width="220" height="180" viewBox="0 0 220 180" style="max-width:100%">
        <polygon points="10,170 210,170 110,10" fill="rgba(99,102,241,.18)" stroke="#8b5cf6" stroke-width="3"/>
        <text x="30" y="160" fill="var(--purple-light)" font-family="Fredoka" font-size="16" font-weight="600">${a}°</text>
        <text x="175" y="160" fill="var(--coral)" font-family="Fredoka" font-size="16" font-weight="600">${c}°</text>
        <text x="105" y="45" fill="var(--gold-dark)" font-family="Fredoka" font-size="16" font-weight="600">${b}°</text>
      </svg>
    `}
  </div>
  <div style="text-align:center;margin-top:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
    <button class="sbtn sbtn-g" onclick="tearA()" ${ts?'disabled style="opacity:.55"':''}>${ts?'✅ Torn & Lined Up':'✂️ Tear Corners'}</button>
    <button class="sbtn sbtn-s" onclick="newA()">🔀 New Triangle (Round ${simSt.triRound+1}/3)</button>
  </div>
  ${ts ? `
    <div style="text-align:center;margin-top:14px">
      <div style="color:var(--text-secondary);font-size:.85rem;font-family:var(--font-display);margin-bottom:8px">💡 Any triangle always adds up to exactly 180°!</div>
      <button class="sbtn sbtn-g" onclick="doneStn(0)">✅ Next Station →</button>
    </div>
  ` : ''}
  `;
}

/* ── STATION B: Diagonal Split (ENHANCED) ─── */
function stnB(){
  const [a,b,c,d]=simSt.quadA;
  const sp=simSt.quadSplit;
  // quad shape: 4 vertices as irregular quadrilateral
  const pts=[[55,24],[282,46],[275,172],[28,162]];
  const polyStr=pts.map(p=>p.join(',')).join(' ');
  const t1=[pts[0],pts[1],pts[2]]; // tri 1: top-left, top-right, bottom-right
  const t2=[pts[0],pts[2],pts[3]]; // tri 2: top-left, bottom-right, bottom-left
  return `
  <div class="instr">📐 Tap <strong>"Draw Diagonal"</strong> to split the quad into 2 triangles — proving 180°+180°=360°!</div>
  <div class="step-chips">
    <div class="schip ${!sp?'active':'done'}">1 · See the 4 angles</div>
    <div class="schip ${sp?'active':''}">2 · Split with diagonal</div>
    <div class="schip ${sp&&simSt.quadRound>=1?'active':''}">3 · Try another shape</div>
  </div>
  <div class="sim-canvas">
    <div class="diag-wrap" style="position:relative">
      <svg width="320" height="210" viewBox="0 0 320 210" class="diag-svg" style="max-width:100%;display:block;margin:0 auto">
        <defs>
          <linearGradient id="qgA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1" stop-opacity=".55"/>
            <stop offset="100%" stop-color="#818cf8" stop-opacity=".25"/>
          </linearGradient>
          <linearGradient id="qgB" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity=".55"/>
            <stop offset="100%" stop-color="#fcd34d" stop-opacity=".25"/>
          </linearGradient>
        </defs>
        ${sp?`
          <!-- Triangle 1 (violet) -->
          <polygon points="${t1.map(p=>p.join(',')).join(' ')}" fill="url(#qgA)" stroke="#818cf8" stroke-width="2"/>
          <!-- Triangle 2 (amber) -->
          <polygon points="${t2.map(p=>p.join(',')).join(' ')}" fill="url(#qgB)" stroke="#fbbf24" stroke-width="2"/>
          <!-- Animated diagonal -->
          <line x1="${pts[0][0]}" y1="${pts[0][1]}" x2="${pts[2][0]}" y2="${pts[2][1]}" stroke="#4caf50" stroke-width="3" stroke-dasharray="260" stroke-dashoffset="0" style="animation:dashDraw .7s ease-out"/>
          <!-- Diagonal arrowheads -->
          <circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="5" fill="#4caf50"/>
          <circle cx="${pts[2][0]}" cy="${pts[2][1]}" r="5" fill="#4caf50"/>
          <!-- Tri 1 centre label -->
          <text x="185" y="98" fill="#c4b5fd" font-family="Fredoka" font-size="17" font-weight="600" text-anchor="middle">🔺 180°</text>
          <!-- Tri 2 centre label -->
          <text x="100" y="138" fill="#fde68a" font-family="Fredoka" font-size="17" font-weight="600" text-anchor="middle">🔺 180°</text>
          <!-- Angle labels (original corners) -->
          <text x="72" y="44" fill="#c4b5fd" font-family="Fredoka" font-size="12">${a}°</text>
          <text x="255" y="62" fill="#c4b5fd" font-family="Fredoka" font-size="12">${b}°</text>
          <text x="252" y="165" fill="#fde68a" font-family="Fredoka" font-size="12">${c}°</text>
          <text x="35" y="156" fill="#fde68a" font-family="Fredoka" font-size="12">${d}°</text>
        `:`
          <!-- Plain quad -->
          <polygon points="${polyStr}" fill="rgba(99,102,241,.18)" stroke="#8b5cf6" stroke-width="2.5"/>
          <!-- Corner circles -->
          ${pts.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#a78bfa" opacity=".85"/>`).join('')}
          <!-- Angle labels -->
          <text x="72" y="44" fill="#ffd54f" font-family="Fredoka" font-size="14" font-weight="600">${a}°</text>
          <text x="255" y="62" fill="#ffd54f" font-family="Fredoka" font-size="14" font-weight="600">${b}°</text>
          <text x="252" y="165" fill="#ffd54f" font-family="Fredoka" font-size="14" font-weight="600">${c}°</text>
          <text x="35" y="156" fill="#ffd54f" font-family="Fredoka" font-size="14" font-weight="600">${d}°</text>
          <!-- Center instruction -->
          <text x="160" y="108" fill="rgba(255,255,255,.3)" font-family="Fredoka" font-size="14" text-anchor="middle">Tap "Draw Diagonal" →</text>
        `}
      </svg>
    </div>

    <!-- Angle chips (before split) -->
    ${!sp?`<div class="quad-info-row">
      ${[{v:a,l:'∠A',c:'#a78bfa'},{v:b,l:'∠B',c:'#a78bfa'},{v:c,l:'∠C',c:'#fde68a'},{v:d,l:'∠D',c:'#fde68a'}].map(x=>`
      <div class="qangle-chip"><div class="qac-val" style="color:${x.c}">${x.v}°</div><div class="qac-lbl">${x.l}</div></div>`).join('')}
      <div class="qangle-chip"><div class="qac-val" style="color:var(--green)">${a+b+c+d}°</div><div class="qac-lbl">Total</div></div>
    </div>`:''}

    <!-- Equation after split -->
    ${sp?`<div class="angle-sum-row" style="animation:slideUp .4s">
      <div class="tri-sum-box" style="background:rgba(99,102,241,.18);border-color:#818cf8">
        <div class="tsb-val" style="color:#c4b5fd">180°</div>
        <div class="tsb-lbl">🔺 Triangle 1</div>
      </div>
      <div class="plus-sep">+</div>
      <div class="tri-sum-box" style="background:rgba(245,158,11,.18);border-color:#fbbf24">
        <div class="tsb-val" style="color:#fde68a">180°</div>
        <div class="tsb-lbl">🔺 Triangle 2</div>
      </div>
      <div class="eq-sep">=</div>
      <div class="total-box">
        <div class="tb-val">360°</div>
        <div class="tb-lbl">🎉 Always!</div>
      </div>
    </div>`:''}
  </div>

  <div style="text-align:center;margin-top:12px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
    <button class="sbtn sbtn-g" onclick="doSplitB()" ${sp?'disabled style="opacity:.55"':''}>${sp?'✅ Diagonal Drawn!':'📐 Draw Diagonal'}</button>
    <button class="sbtn sbtn-s" onclick="newB()">🔀 New Shape (Round ${simSt.quadRound+1}/3)</button>
  </div>
  ${sp?`<div style="text-align:center;margin-top:14px">
    <div style="color:var(--text-secondary);font-size:.85rem;font-family:var(--font-display);margin-bottom:8px">💡 One diagonal always splits any quad into exactly 2 triangles!</div>
    <button class="sbtn sbtn-g" onclick="doneStn(1)">✅ I understand! Next Station →</button>
  </div>`:''}`;
}
function doSplitB(){sndTap();simSt.quadSplit=true;sndOk();setTimeout(()=>sndOk(),350);render();}
function newB(){sndTap();if(simSt.quadSplit)simSt.quadRound=Math.min(simSt.quadRound+1,2);resetB();render();}


const SHAPE_INFO={
  trap:{name:'Trapezoid',icon:'🔷',hint:'1 pair of parallel sides',desc:'Exactly one pair of parallel sides. Could be right-angled or isosceles.',color:'#60a5fa'},
  kite:{name:'Kite',icon:'🪁',hint:'2 pairs of adjacent equal sides',desc:'Two pairs of consecutive equal sides. Diagonals meet at right angles.',color:'#f87171'},
  para:{name:'Parallelogram',icon:'▱',hint:'2 pairs of parallel sides',desc:'Both pairs of opposite sides are parallel and equal.',color:'#a78bfa'},
  rect:{name:'Rectangle',icon:'▬',hint:'Parallelogram + all right angles',desc:'All four angles are 90°. Opposite sides equal and parallel.',color:'#34d399'},
  rhom:{name:'Rhombus',icon:'💠',hint:'Parallelogram + all equal sides',desc:'All four sides equal. Opposite angles equal. Diagonals bisect at 90°.',color:'#fb923c'},
  sq:  {name:'Square',icon:'⬜',hint:'Rectangle + Rhombus combined!',desc:'All sides equal AND all angles 90°. The most special quadrilateral!',color:'#fbbf24'},
};
// ═══════════════════════════════════════════
// SHAPE SORTER – Investigation & Classify Mode
// ═══════════════════════════════════════════
const SHAPE_DATA = [
  {
    id:'sq', name:'Square', emoji:'⬜', color:'#fbbf24',
    sides:4, allEqual:true, allRight:true, parallelPairs:2,
    facts:[
      {q:'All 4 sides equal?', a:'Yes — all sides are exactly equal!', yes:true},
      {q:'All angles 90°?',    a:'Yes — all 4 corners are right angles!', yes:true},
      {q:'Diagonals bisect at 90°?', a:'Yes — diagonals cross at right angles!', yes:true},
    ],
    classifyAs:['Parallelogram','Rectangle','Rhombus','Square'],
    funFact:'A square is the MOST special quad — it is a rectangle AND a rhombus!',
    svgPath:'M 70,70 L 190,70 L 190,190 L 70,190 Z',
    angleMarks:[[70,70],[190,70],[190,190],[70,190]],
    diag:'M 70,70 L 190,190 M 190,70 L 70,190',
  },
  {
    id:'rect', name:'Rectangle', emoji:'▬', color:'#34d399',
    sides:4, allEqual:false, allRight:true, parallelPairs:2,
    facts:[
      {q:'All 4 sides equal?', a:'No — opposite sides are equal, but not all 4!', yes:false},
      {q:'All angles 90°?',    a:'Yes — all 4 corners are right angles!', yes:true},
      {q:'Both pairs of opposite sides parallel?', a:'Yes — it IS a parallelogram!', yes:true},
    ],
    classifyAs:['Parallelogram','Rectangle'],
    funFact:'Every rectangle is a parallelogram, but NOT every parallelogram is a rectangle!',
    svgPath:'M 50,85 L 210,85 L 210,175 L 50,175 Z',
    angleMarks:[[50,85],[210,85],[210,175],[50,175]],
    diag:'M 50,85 L 210,175 M 210,85 L 50,175',
  },
  {
    id:'rhom', name:'Rhombus', emoji:'💠', color:'#fb923c',
    sides:4, allEqual:true, allRight:false, parallelPairs:2,
    facts:[
      {q:'All 4 sides equal?', a:'Yes — all 4 sides are the same length!', yes:true},
      {q:'All angles 90°?',    a:'No — angles are NOT 90° (unless it is a square)!', yes:false},
      {q:'Diagonals bisect at 90°?', a:'Yes — diagonals cross at right angles!', yes:true},
    ],
    classifyAs:['Parallelogram','Rhombus'],
    funFact:'A rhombus looks like a tilted square. Its diagonals always meet at 90°!',
    svgPath:'M 130,55 L 205,130 L 130,205 L 55,130 Z',
    angleMarks:[[130,55],[205,130],[130,205],[55,130]],
    diag:'M 130,55 L 130,205 M 55,130 L 205,130',
  },
  {
    id:'para', name:'Parallelogram', emoji:'▱', color:'#a78bfa',
    sides:4, allEqual:false, allRight:false, parallelPairs:2,
    facts:[
      {q:'Both pairs of opposite sides parallel?', a:'Yes — both pairs of opposite sides are parallel!', yes:true},
      {q:'All angles 90°?',    a:'No — opposite angles are equal but not 90°!', yes:false},
      {q:'All 4 sides equal?', a:'No — opposite sides are equal, not all 4!', yes:false},
    ],
    classifyAs:['Parallelogram'],
    funFact:'Parallelograms have 2 pairs of parallel sides. Rectangles and rhombuses are special parallelograms!',
    svgPath:'M 85,175 L 50,85 L 175,85 L 210,175 Z',
    angleMarks:[[85,175],[50,85],[175,85],[210,175]],
    diag:'M 85,175 L 175,85 M 50,85 L 210,175',
  },
  {
    id:'trap', name:'Trapezoid', emoji:'🔷', color:'#60a5fa',
    sides:4, allEqual:false, allRight:false, parallelPairs:1,
    facts:[
      {q:'At least one pair of parallel sides?', a:'Yes — exactly ONE pair of parallel sides!', yes:true},
      {q:'Both pairs of opposite sides parallel?', a:'No — only ONE pair is parallel (not a parallelogram)!', yes:false},
      {q:'All angles 90°?', a:'No — only right-angled trapezoid has one 90° angle!', yes:false},
    ],
    classifyAs:['Trapezoid'],
    funFact:'A trapezoid has exactly one pair of parallel sides. The parallel sides are called bases!',
    svgPath:'M 80,175 L 50,85 L 210,85 L 180,175 Z',
    angleMarks:[[80,175],[50,85],[210,85],[180,175]],
    diag:'M 80,175 L 210,85 M 50,85 L 180,175',
  },
  {
    id:'kite', name:'Kite', emoji:'🪁', color:'#f87171',
    sides:4, allEqual:false, allRight:false, parallelPairs:0,
    facts:[
      {q:'Two pairs of adjacent equal sides?', a:'Yes — two pairs of ADJACENT (next-to-each-other) sides are equal!', yes:true},
      {q:'Any parallel sides?', a:'No — a kite has NO parallel sides!', yes:false},
      {q:'Diagonals bisect at 90°?', a:'Yes — the diagonals always meet at right angles!', yes:true},
    ],
    classifyAs:['Kite'],
    funFact:'A kite looks like the kites we fly! Its two diagonals are always perpendicular to each other.',
    svgPath:'M 130,50 L 195,130 L 130,210 L 65,130 Z',
    angleMarks:[[130,50],[195,130],[130,210],[65,130]],
    diag:'M 130,50 L 130,210 M 65,130 L 195,130',
  },
];

const FAMILY_CLASSES = ['Trapezoid','Parallelogram','Rectangle','Rhombus','Square','Kite'];

// track per-shape investigation progress
if(!simSt.sortInv) simSt.sortInv = {}; // {shapeId: {revealedProps:[],classified:null}}
if(simSt.sortCur===undefined) simSt.sortCur = 0;

function getSortInv(id){
  if(!simSt.sortInv[id]) simSt.sortInv[id]={revealedProps:[],classified:null,showDiag:false};
  return simSt.sortInv[id];
}

function drawShapeSVG(sd, inv){
  const col = sd.color;
  // angle mark squares
  const angleSquareSize = 12;
  const angleMarks = (sd.allRight ? sd.angleMarks : []).map(([x,y])=>{
    // determine offset direction per corner based on position relative to center (130,130)
    const dx = x < 130 ? 1 : -1;
    const dy = y < 130 ? 1 : -1;
    const ax = dx>0 ? x : x - angleSquareSize;
    const ay = dy>0 ? y : y - angleSquareSize;
    return `<rect x="${ax}" y="${ay}" width="${angleSquareSize}" height="${angleSquareSize}" fill="none" stroke="${col}" stroke-width="1.5" opacity=".7"/>`;
  }).join('');
  // parallel side arrows
  let parallelArrows = '';
  if(sd.parallelPairs >= 1){
    // top side arrow
    parallelArrows += `<path d="M 100,78 L 118,78 M 112,72 L 118,78 L 112,84" stroke="${col}" stroke-width="2" fill="none" opacity=".8"/>`;
    parallelArrows += `<path d="M 95,182 L 113,182 M 107,176 L 113,182 L 107,188" stroke="${col}" stroke-width="2" fill="none" opacity=".8"/>`;
  }
  if(sd.parallelPairs >= 2){
    parallelArrows += `<path d="M 48,110 L 48,128 M 42,122 L 48,128 L 54,122" stroke="#818cf8" stroke-width="2" fill="none" opacity=".8"/>`;
    parallelArrows += `<path d="M 208,110 L 208,128 M 202,122 L 208,128 L 214,122" stroke="#818cf8" stroke-width="2" fill="none" opacity=".8"/>`;
  }
  const diagSvg = inv.showDiag ? `<path d="${sd.diag}" stroke="#4caf50" stroke-width="2" stroke-dasharray="6,3" fill="none" opacity=".85"/>` : '';
  return `<svg width="260" height="260" viewBox="0 0 260 260" style="max-width:100%;display:block;margin:0 auto">
    <defs>
      <filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <path d="${sd.svgPath}" fill="${col}22" stroke="${col}" stroke-width="3" filter="url(#glow)"/>
    ${angleMarks}
    ${parallelArrows}
    ${diagSvg}
    <text x="130" y="240" fill="${col}" font-family="Fredoka" font-size="14" font-weight="700" text-anchor="middle">${sd.name}</text>
  </svg>`;
}

function stnD(){
  const cur = SHAPE_DATA[simSt.sortCur];
  const inv = getSortInv(cur.id);
  const allClassified = SHAPE_DATA.every(sd => getSortInv(sd.id).classified !== null);
  const doneCount = SHAPE_DATA.filter(sd => getSortInv(sd.id).classified !== null).length;

  const navBtns = SHAPE_DATA.map((sd,i)=>{
    const inv2 = getSortInv(sd.id);
    const done = inv2.classified !== null;
    return `<button class="shape-nav-btn ${i===simSt.sortCur?'snb-active':''} ${done?'snb-done':''}" onclick="switchSortShape(${i})">${sd.emoji} ${sd.name}${done?' ✓':''}</button>`;
  }).join('');

  const propCards = cur.facts.map((f,i)=>{
    const revealed = inv.revealedProps.includes(i);
    return `<div class="prop-card ${revealed?(f.yes?'pc-revealed':'pc-revealed pc-no'):''}" onclick="revealProp(${i})">
      <div class="prop-q">🔍 ${f.q}</div>
      <div class="prop-a">${f.yes?'✅':'❌'} ${f.a}</div>
      ${!revealed?'<div style="color:var(--text-muted);font-size:.78rem;margin-top:5px">Tap to investigate →</div>':''}
    </div>`;
  }).join('');

  const allRevealed = inv.revealedProps.length >= cur.facts.length;

  const classifySection = allRevealed && !inv.classified ? `
    <div class="sorter-classify">
      <div class="classify-q">🏷️ Based on your investigation, this shape belongs in which category?</div>
      <div class="classify-opts">
        ${FAMILY_CLASSES.map(c=>{
          const isCorrect = cur.classifyAs.includes(c);
          return `<button class="copt" onclick="classifyShape('${c}',${isCorrect})">${c}</button>`;
        }).join('')}
      </div>
    </div>` : '';

  const classifiedResult = inv.classified ? `
    <div style="margin-top:12px;padding:12px;background:rgba(76,175,80,.1);border:2px solid var(--green);border-radius:var(--radius-lg);text-align:center">
      <div style="font-family:var(--font-display);color:var(--green);font-size:1rem;font-weight:700">✅ Classified! ${cur.classifyAs.join(' + ')}</div>
      <div style="color:var(--gold-light);font-size:.82rem;margin-top:6px">💡 ${cur.funFact}</div>
      ${simSt.sortCur < SHAPE_DATA.length-1 ? `<button class="sbtn sbtn-g" style="margin-top:10px" onclick="nextSortShape()">Next Shape →</button>`:''}
    </div>` : '';

  return `
  <div class="instr">🔬 <strong>Investigation Lab</strong> — Explore each shape's properties, then classify it in the Quadrilateral Family!</div>

  <!-- Shape navigation tabs -->
  <div class="sorter-shape-nav">${navBtns}</div>
  <div style="text-align:center;color:var(--text-muted);font-size:.8rem;margin-bottom:8px">Investigated ${doneCount}/${SHAPE_DATA.length} shapes</div>

  <div class="sorter-stage">
    <!-- Left: Shape Canvas -->
    <div class="sorter-canvas-box">
      <div style="font-family:var(--font-display);color:${cur.color};font-size:1.1rem;font-weight:700">${cur.emoji} ${cur.name}</div>
      ${drawShapeSVG(cur, inv)}
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
        <button class="sbtn sbtn-s" style="font-size:.78rem;padding:6px 14px" onclick="toggleSortDiag()">${inv.showDiag?'🟢 Hide Diagonals':'📐 Show Diagonals'}</button>
      </div>
      <div style="text-align:center;font-size:.78rem;color:var(--text-muted);margin-top:4px">
        Sides: <strong style="color:${cur.color}">${cur.sides}</strong> · 
        Angle Sum: <strong style="color:var(--gold)">360°</strong>
      </div>
    </div>

    <!-- Right: Properties Investigation -->
    <div class="sorter-props">
      <div style="font-family:var(--font-display);font-size:.9rem;color:var(--text-muted);margin-bottom:4px">🧪 Tap each property to reveal it:</div>
      ${propCards}
      ${classifySection}
      ${classifiedResult}
    </div>
  </div>

  ${allClassified && simSt.doneD ? `
  <div style="text-align:center;margin-top:18px;padding:16px;background:rgba(255,193,7,.06);border:2px solid var(--gold);border-radius:var(--radius-lg)">
    <div style="font-family:var(--font-display);color:var(--gold);font-size:1.15rem;font-weight:700;margin-bottom:6px">🏆 Quadrilateral Family Mastered!</div>
    <div style="color:var(--text-secondary);font-size:.85rem;margin-bottom:12px">You have correctly classified all 6 quadrilateral types. A square IS a rectangle AND a rhombus AND a parallelogram!</div>
    <button class="sbtn sbtn-g" onclick="doneStn(3)">✅ Mastered! Next Station →</button>
  </div>` : ''}`;  
}

function switchSortShape(i){sndTap();simSt.sortCur=i;render();}
function nextSortShape(){sndTap();simSt.sortCur=Math.min(simSt.sortCur+1,SHAPE_DATA.length-1);render();}
function toggleSortDiag(){sndTap();const inv=getSortInv(SHAPE_DATA[simSt.sortCur].id);inv.showDiag=!inv.showDiag;render();}
function revealProp(i){
  sndTap();
  const cur=SHAPE_DATA[simSt.sortCur];
  const inv=getSortInv(cur.id);
  if(!inv.revealedProps.includes(i)){inv.revealedProps.push(i);}
  render();
}
function classifyShape(cls,isCorrect){
  sndTap();
  const cur=SHAPE_DATA[simSt.sortCur];
  const inv=getSortInv(cur.id);
  if(isCorrect){
    inv.classified=cls;
    sndOk();
    const allDone=SHAPE_DATA.every(sd=>getSortInv(sd.id).classified!==null);
    if(allDone){simSt.doneD=true;confetti(60);checkBadge('eagle_sorter');sndBadge();}
  } else {
    sndWrong();
    const btn=event.target;
    btn.classList.add('co-no');
    setTimeout(()=>btn.classList.remove('co-no'),700);
    const hint=document.createElement('div');hint.className='xp-pop';
    hint.style.cssText='top:auto;bottom:80px;right:20px;background:rgba(239,83,80,.9);color:#fff;font-size:.85rem;max-width:240px;text-align:center;border-radius:12px;padding:10px 16px;z-index:999';
    hint.textContent='❌ Hint: '+SHAPE_DATA[simSt.sortCur].facts.find(f=>f)?.a;
    document.body.appendChild(hint);
    setTimeout(()=>hint.remove(),2500);
  }
  render();
}

/* ── STATION C: Polygon Builder ─── */
function stnC(){

  const n=simSt.polyN, sum=(n-2)*180, each=Math.round(sum/n);
  return `<div class="instr">🔢 Drag the slider to change the number of sides, then <strong>"Fan Triangulate"</strong> to see the formula!</div>
  <div style="padding:0 8px">
    <label style="font-family:var(--font-display);color:var(--gold);font-size:1.05rem">Sides: <strong>${n}</strong></label>
    <input type="range" min="3" max="10" value="${n}" class="poly-slider" oninput="chgN(this.value)"/>
  </div>
  <div class="sim-canvas">
    <svg width="270" height="230" viewBox="0 0 270 230" style="max-width:100%;display:block;margin:0 auto">${polysvg(n,simSt.polyTri)}</svg>
    <div class="formula-box">(${n} − 2) × 180° = <span style="color:var(--green)">${sum}°</span>${simSt.polyTri?` ✓ (${n-2} triangles)`:''}</div>
    <div style="color:var(--text-secondary);font-size:.88rem;text-align:center">Each interior angle (regular): <strong style="color:var(--gold)">${each}°</strong></div>
  </div>
  <div style="text-align:center;margin-top:10px">
    <button class="sbtn sbtn-g" onclick="doTriC()">${simSt.polyTri?'✅ Triangulated!':'🔺 Fan Triangulate'}</button>
    <button class="sbtn sbtn-s" onclick="resetC()">🔄 Reset</button>
  </div>
  ${simSt.polyTri?`<div style="text-align:center;margin-top:10px"><button class="sbtn sbtn-g" onclick="doneStn(2)">✅ Got it! Next Station →</button></div>`:''}`;
}
function polysvg(n,tri){
  const cx=135,cy=115,r=94,pts=[];
  for(let i=0;i<n;i++){const a=(i/n)*2*Math.PI-Math.PI/2;pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}
  const ps=pts.map(p=>p.join(',')).join(' ');
  let s=`<polygon points="${ps}" fill="rgba(99,102,241,.18)" stroke="#8b5cf6" stroke-width="2"/>`;
  if(tri){
    const cols=['rgba(255,193,7,.28)','rgba(76,175,80,.28)','rgba(239,83,80,.26)','rgba(41,182,246,.26)','rgba(255,112,67,.26)','rgba(171,71,188,.26)','rgba(255,238,88,.26)','rgba(102,187,106,.26)'];
    for(let i=1;i<n-1;i++){
      const p0=pts[0],p1=pts[i],p2=pts[i+1];
      s+=`<polygon points="${p0},${p1},${p2}" fill="${cols[(i-1)%cols.length]}" stroke="#4caf50" stroke-width="1.5"/>`;
      s+=`<line x1="${p0[0]}" y1="${p0[1]}" x2="${p2[0]}" y2="${p2[1]}" stroke="#4caf50" stroke-width="1.5" stroke-dasharray="5,3"/>`;
    }
  }
  return s;
}

function chgN(v){simSt.polyN=parseInt(v);simSt.polyTri=false;sndTap();render();}
function doTriC(){sndTap();simSt.polyTri=true;sndOk();setTimeout(()=>sndOk(),350);render();}
function resetC(){sndTap();simSt.polyN=rnd(5,9);simSt.polyTri=false;render();}

/* ── STATION E: Exterior Angles ─── */
function stnE(){
  const n=simSt.extN, ea=Math.round(360/n);
  return `<div class="instr">🔄 The <strong>exterior angles</strong> of any convex polygon always total 360°. Adjust the sides and watch the walker turn!</div>
  <div style="padding:0 8px">
    <label style="font-family:var(--font-display);color:var(--gold);font-size:1.05rem">Sides: <strong>${n}</strong></label>
    <input type="range" min="3" max="10" value="${n}" class="poly-slider" oninput="chgExt(this.value)"/>
  </div>
  <div class="sim-canvas">
    <svg width="270" height="215" viewBox="0 0 270 215" style="max-width:100%;display:block;margin:0 auto">${polysvg(n,false)}</svg>
    <div class="formula-box">Each exterior angle: <span style="color:var(--gold)">${ea}°</span> × ${n} turns = <span style="color:${simSt.extDone?'var(--green)':'var(--text-muted)'}">${simSt.extDone?'360° ✓':'?'}</span></div>
  </div>
  <div style="text-align:center;margin-top:10px">
    <button class="sbtn sbtn-g" onclick="walkExt()">${simSt.extDone?'🚶 Walker completed 360°!':'🚶 Start Walking!'}</button>
    <button class="sbtn sbtn-s" onclick="chgExt(${n})">🔄 Reset</button>
  </div>
  ${simSt.extDone?`<div style="text-align:center;margin-top:10px"><button class="sbtn sbtn-g" onclick="doneStn(4); setTimeout(goPlay, 100)">✅ Go to Practice →</button></div>`:''}`;
}
function chgExt(v){sndTap();simSt.extN=parseInt(v);simSt.extDone=false;render();}
function walkExt(){sndTap();simSt.extDone=true;sndOk();render();}

function doneStn(i){
  sndOk(); playVoice('feedback_good'); S.stDone[i]=true;
  if(S.stDone.every(Boolean)){checkBadge('shape_shifter');sndBadge();}
  simSt.st=Math.min(i+1,4); render();
}

function goPlay(){sndClick();S.phase='play';S.activeW=null;render();}

// ═══════════════════════════════════════════
// PLAY / PRACTICE (8 worlds × 10 questions)
// ═══════════════════════════════════════════
const WORLDS=[
  {id:0,name:'Cairo Pyramid Plateau',icon:'🔺',desc:'Triangle angle basics',col:'#ef5350',types:[1],diff:'Easy'},
  {id:1,name:'Athens Column Court',icon:'🏛️',desc:'Exterior angles',col:'#ab47bc',types:[2],diff:'Easy'},
  {id:2,name:'Tokyo Origami Studio',icon:'🎏',desc:'Quadrilateral angles',col:'#29b6f6',types:[3],diff:'Medium'},
  {id:3,name:'Rio Kite Festival',icon:'🪁',desc:'Quad family sort',col:'#ff7043',types:[9],diff:'Medium'},
  {id:4,name:'Marrakech Mosaic Market',icon:'🕌',desc:'Polygon angle sum',col:'#ffc107',types:[4],diff:'Medium'},
  {id:5,name:'Mumbai Stepwell Steps',icon:'🏯',desc:'Regular polygon angles',col:'#4caf50',types:[6],diff:'Hard'},
  {id:6,name:'Reykjavik Ice Dome',icon:'❄️',desc:'Sides from sum & diagonals',col:'#80deea',types:[5,7],diff:'Hard'},
  {id:7,name:'Nairobi Star Compass',icon:'🌍',desc:'All types · final boss!',col:'#ffd54f',types:[1,2,3,4,5,6,7,8,9,10],diff:'Hardest'},
];

const NAMES=['John','Mike','Sarah','Priya','Yuki','Omar','Carlos','Fatima','Wei','Liam','Aisha','Elena','Diego','Mei','Kwame','Sofia','Hassan','Noah','Olivia','Arjun','Lucas','Emma'];
const OBJECTS=['kite frame','garden trellis','skateboard ramp','roof truss','stop sign','floor tile','picture frame','solar panel','drone wing','treehouse window','mosaic tile','bridge truss','umbrella panel','sail panel'];
const PNAMES={5:'pentagon',6:'hexagon',7:'heptagon',8:'octagon',9:'nonagon',10:'decagon',11:'hendecagon',12:'dodecagon'};

/* Question generators — 10 types, all procedural, no repeats */
function genQ(type){
  switch(type){
    case 1:{// missing triangle angle
      const a=rnd(30,80),b=rnd(30,80),c=180-a-b;
      return{text:`A triangle has angles ${a}° and ${b}°. What is the third angle?`,opts:distractors(c,10,140),cor:c,hint:'Triangle angles sum to 180°.',ex:`180° − ${a}° − ${b}° = ${c}°.`};}
    case 2:{// exterior angle
      const r1=rnd(30,70),r2=rnd(30,70),ext=r1+r2;
      return{text:`An exterior angle of a triangle has remote interior angles ${r1}° and ${r2}°. Find the exterior angle.`,opts:distractors(ext,50,160),cor:ext,hint:'Exterior angle = sum of the two remote interior angles.',ex:`${r1}° + ${r2}° = ${ext}°.`};}
    case 3:{// quadrilateral missing angle
      const a=rnd(70,110),b=rnd(70,110),c=rnd(60,110),d=360-a-b-c;
      if(d<30||d>170)return genQ(3);
      return{text:`A quadrilateral has angles ${a}°, ${b}°, and ${c}°. Find the fourth angle.`,opts:distractors(d,20,170),cor:d,hint:'Quadrilateral angles sum to 360°.',ex:`360° − ${a}° − ${b}° − ${c}° = ${d}°.`};}
    case 4:{// polygon angle sum
      const n=rnd(5,12),sum=(n-2)*180;
      return{text:`Find the sum of interior angles of a ${PNAMES[n]||n+'-gon'} (${n} sides).`,opts:distractors(sum,180,1800),cor:sum,hint:'Use (n − 2) × 180°.',ex:`(${n} − 2) × 180° = ${n-2} × 180° = ${sum}°.`};}
    case 5:{// sides from sum
      const n=rnd(5,10),sum=(n-2)*180;
      return{text:`A polygon's interior angles sum to ${sum}°. How many sides does it have?`,opts:distractors(n,3,14),cor:n,hint:`Rearrange (n − 2) × 180° = ${sum}°.`,ex:`${sum} ÷ 180 + 2 = ${n}.`};}
    case 6:{// regular polygon each angle
      const n=rnd(5,10),each=Math.round(((n-2)*180)/n);
      return{text:`Find each interior angle of a regular ${PNAMES[n]||n+'-gon'}.`,opts:distractors(each,60,170),cor:each,hint:'[(n − 2) × 180°] ÷ n',ex:`[(${n}−2)×180] ÷ ${n} = ${each}°.`};}
    case 7:{// diagonals
      const n=rnd(5,10),d=n*(n-3)/2;
      return{text:`How many diagonals does a ${PNAMES[n]||n+'-gon'} (${n} sides) have?`,opts:distractors(d,0,35),cor:d,hint:'n(n − 3) ÷ 2',ex:`${n}×${n-3}÷2 = ${d}.`};}
    case 8:{// word problem
      const nm=pick(NAMES),ob=pick(OBJECTS),a=rnd(35,75),b=rnd(35,75),c=180-a-b;
      return{text:`${nm} is building a ${ob} shaped like a triangle. Two angles measure ${a}° and ${b}°. What is the third angle?`,opts:distractors(c,10,140),cor:c,hint:'Triangle angle sum = 180°.',ex:`180° − ${a}° − ${b}° = ${c}°.`};}
    case 9:{// classification
      const cls=[
        {q:'has all four sides equal but no right angles',a:'Rhombus'},
        {q:'has all right angles and opposite sides equal',a:'Rectangle'},
        {q:'has all sides equal AND all right angles',a:'Square'},
        {q:'has two pairs of adjacent equal sides',a:'Kite'},
        {q:'has two pairs of parallel sides',a:'Parallelogram'},
        {q:'has exactly one pair of parallel sides',a:'Trapezoid'},
      ];
      const s=pick(cls);
      const wr=shuffle(cls.filter(x=>x.a!==s.a)).slice(0,3).map(x=>x.a);
      return{text:`A quadrilateral that ${s.q}. What type is it?`,opts:shuffle([s.a,...wr]),cor:s.a,hint:'Think about parallel sides, equal sides, and right angles.',ex:`A shape that ${s.q} is a ${s.a}.`};}
    case 10:{// true/false
      const stmts=[
        {t:'The exterior angles of any convex polygon always sum to 360°.',c:'True',e:'Yes! Always 360° for any n.'},
        {t:'A square is a type of rectangle.',c:'True',e:'A square has right angles and equal opposite sides — it is a rectangle.'},
        {t:'A rectangle is always a rhombus.',c:'False',e:'A rectangle\'s sides are not necessarily all equal.'},
        {t:`The interior angles of a hexagon sum to 720°.`,c:'True',e:'(6−2)×180° = 720°. ✓'},
        {t:`The interior angles of a pentagon sum to 900°.`,c:'False',e:'(5−2)×180° = 540°, not 900°.'},
        {t:'A parallelogram always has all right angles.',c:'False',e:'Only a rectangle (a special parallelogram) has right angles.'},
        {t:'All quadrilaterals have an angle sum of 360°.',c:'True',e:'2 triangles × 180° = 360° for any quadrilateral.'},
        {t:'A kite has two pairs of parallel sides.',c:'False',e:'A kite has two pairs of adjacent equal sides, NOT parallel.'},
        {t:'The diagonal count of a hexagon is 9.',c:'True',e:'6×(6−3)÷2 = 9.'},
        {t:'A rhombus is always a square.',c:'False',e:'A rhombus has equal sides but not necessarily right angles.'},
      ];
      const s=pick(stmts);
      return{text:s.t,opts:shuffle(['True','False',`${rnd(180,720)}°`,'Cannot determine']).slice(0,4).map(x=>(x===s.c?x:x)),cor:s.c,hint:'Think carefully about definitions.',ex:s.e};}
    default:return genQ(1);
  }
}

function nextQ(wid){
  const types=WORLDS[wid].types;
  // Avoid repeating last 2 types
  const recent=S.usedTypes.slice(-2);
  const avail=types.filter(t=>!recent.includes(t));
  const t=pick(avail.length?avail:types);
  S.usedTypes.push(t); if(S.usedTypes.length>20)S.usedTypes.shift();
  return genQ(t);
}
function stars(sc){return sc>=9?3:sc>=7?2:sc>=5?1:0;}

function renderPlay(){
  if(S.activeW!==null&&S.wQIdx<10)return renderQ();
  if(S.activeW!==null&&S.wQIdx>=10)return renderWDone();
  return renderMap();
}

function renderMap(){
  return `<div class="play-wrap">
    <div class="play-hdr">
      <div class="play-title">🗺️ Practice Worlds</div>
      <div class="play-sub">Choose a world · Score ≥6/10 to unlock the next!</div>
      <div class="xp-badge">⭐ ${S.xp} XP earned</div>
    </div>
    <div class="world-map">
      ${WORLDS.map((w,i)=>{
        const res=S.wResults[i];
        const unlocked=i===0||(S.wResults[i-1]&&S.wResults[i-1].score>=6);
        const completed=res&&res.score>=0;
        const st=completed?stars(res.score):0;
        return `<div class="wcard ${unlocked?'open':'locked'} ${completed?'completed':''}" onclick="${unlocked?`startW(${i})`:'null'}" style="border-color:${completed?'var(--green)':unlocked?'rgba(255,255,255,.12)':'rgba(255,255,255,.06)'}">
          <div class="wicon">${w.icon}</div>
          <div class="winfo">
            <div class="wname">${w.name}</div>
            <div class="wdesc">${w.desc} · ${w.diff}</div>
            ${completed?`<div class="wstars">${'⭐'.repeat(st)}${'☆'.repeat(3-st)} ${res.score}/10</div>`:''}
          </div>
          ${!unlocked?'<div class="wlock">🔒</div>':completed?'<div style="color:var(--green)">✓</div>':''}
        </div>`;
      }).join('')}
    </div>
    ${S.wResults.every(r=>r&&r.score>=5)?`<button class="btn btn-green btn-lg" style="margin-top:20px" onclick="goReflect()">🌟 Reflect & Earn Your Certificate!</button>`:''}
  </div>`;
}

function startW(wid){sndClick();S.activeW=wid;S.wQIdx=0;S.wAnswers=[];S.usedTypes=[];S.curQ=nextQ(wid);S.attempts=0;S.hints=0;render();}

function renderQ(){
  const q=S.curQ, w=WORLDS[S.activeW], xpNow=S.attempts===0?10:S.hints>0?5:7;
  return `<div class="play-wrap">
    <div class="hud">
      <div class="hud-chip">${w.icon} ${w.name}</div>
      <div class="hud-chip">🔥 ${S.streak}</div>
      <div class="hud-chip">⭐ ${S.xp} XP</div>
    </div>
    <div class="pbar-wrap">
      <div class="pbar-labels"><span>Q${S.wQIdx+1}/10</span><span>+${xpNow} XP if correct now</span></div>
      <div class="pbar-track"><div class="pbar-fill" style="width:${S.wQIdx/10*100}%"></div></div>
    </div>
    <div class="qcard">
      <div style="font-size:.8rem;color:var(--text-muted);margin-bottom:8px">${w.icon} ${w.name}</div>
      <div class="qtext">${q.text}</div>
      <div class="opts-grid" id="og">
        ${q.opts.map((o,i)=>`<button class="opt-btn" id="o${i}" onclick="ans('${String(o).replace(/'/g,"\\'")}',this)">${o}</button>`).join('')}
      </div>
      ${S.hints>0?`<div class="hint-line">💡 ${q.hint}</div>`:''}
    </div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;margin-top:12px">
      ${S.hints===0?`<button class="btn btn-outline btn-sm" onclick="showHint()">💡 Hint</button>`:''}
      <button class="btn btn-outline btn-sm" onclick="skipQ()">⏭ Skip</button>
    </div>
    <div style="margin-top:6px;color:var(--text-muted);font-size:.78rem;text-align:center">${S.wAnswers.filter(Boolean).length} correct so far</div>
  </div>`;
}

function ans(chosen,btn){
  sndTap();
  const q=S.curQ; S.attempts++;
  const ok=String(chosen)===String(q.cor);
  document.querySelectorAll('.opt-btn').forEach(b=>b.classList.add('dis'));
  btn.classList.add(ok?'correct':'wrong');
  if(ok){
    sndOk();
    const xp=S.attempts===1?10:S.hints>0?5:7;
    const sb=S.streak>=4?5:0, tot=xp+sb;
    S.xp+=tot; S.streak++; S.totalOk++; S.wAnswers.push(true);
    xpPop(tot); showFB(true,q.ex,tot);
  } else {
    sndWrong(); S.streak=0;
    if(S.attempts>=2){
      document.querySelectorAll('.opt-btn').forEach(b=>{if(b.textContent.trim()===String(q.cor))b.classList.add('correct');});
      S.wAnswers.push(false); showFB(false,q.ex,0);
    }
  }
}

function showHint(){sndTap();S.hints++;render();}
function skipQ(){sndTap();S.wAnswers.push(false);advQ();}

function showFB(ok,ex,xp){
  const el=document.createElement('div'); el.className='fb-overlay';
  el.innerHTML=`<div class="fb-box ${ok?'ok':'no'}">
    <div class="fb-emoji">${ok?'🎉':'😕'}</div>
    <div class="fb-title">${ok?'Excellent!':'Not quite...'}</div>
    <div class="fb-sub">${ex}</div>
    ${ok?`<div style="color:var(--gold-light);font-weight:700;margin-top:8px">+${xp} XP</div>`:''}
  </div>`;
  document.body.appendChild(el);
  setTimeout(()=>{el.remove();advQ();},2100);
}

function advQ(){
  S.totalQ++; S.wQIdx++;
  if(S.wQIdx>=10){
    const sc=S.wAnswers.filter(Boolean).length;
    S.wResults[S.activeW]={score:sc};
    if(S.streak>=10)checkBadge('diagonal_streak');
    if(sc===10)checkBadge('perfect_vertex');
    checkBadge('polygon_pro');
    render(); return;
  }
  S.curQ=nextQ(S.activeW); S.attempts=0; S.hints=0; render();
}

function renderWDone(){
  const wid=S.activeW, res=S.wResults[wid], sc=res?.score||0, st=stars(sc), w=WORLDS[wid];
  const msgs=['Keep trying! You need 6+ to unlock the next world.','Good effort! Keep going!','Well done!','Almost perfect!','Perfect score! 🌟'];
  const msg=sc>=9?msgs[4]:sc>=7?msgs[2]:sc>=5?msgs[2]:msgs[0];
  return `<div class="play-wrap" style="justify-content:center">
    <div class="wcomplete-card">
      <div class="wc-icon">${w.icon}</div>
      <div class="wc-title">${w.name}</div>
      <div class="wc-score">${sc}/10</div>
      <div class="wc-stars">${[0,1,2].map(i=>`<span class="wstar ${i<st?'lit':''}" style="animation-delay:${i*.18}s">⭐</span>`).join('')}</div>
      <div style="color:var(--text-secondary);margin-bottom:20px">${msg}</div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" onclick="retryW(${wid})">🔄 Retry</button>
        <button class="btn btn-gold btn-sm" onclick="backMap()">🗺️ World Map</button>
      </div>
    </div>
  </div>`;
}
function retryW(id){sndClick();startW(id);}
function backMap(){sndClick();S.activeW=null;render();}
function goReflect(){sndClick();checkBadge('globe_trotter');S.phase='reflect';S.reflectStep=0;render();}

// ═══════════════════════════════════════════
// REFLECT (6th phase)
// ═══════════════════════════════════════════
const RQUES=[
  {q:"Why do a quadrilateral's interior angles always sum to 360°?",opts:[
    {t:'Because it can be split into 2 triangles by a diagonal (2 × 180° = 360°)',ok:true},
    {t:'Because all quadrilaterals have 4 right angles',ok:false},
    {t:'Because 4 × 90° = 360°',ok:false},
    {t:'It depends on the shape of the quadrilateral',ok:false},
  ]},
  {q:"What is the interior angle sum of a pentagon (5 sides)?",opts:[
    {t:'(5 − 2) × 180° = 540°',ok:true},
    {t:'5 × 180° = 900°',ok:false},
    {t:'(5 + 2) × 180° = 1260°',ok:false},
    {t:'360°',ok:false},
  ]},
  {q:"Which statement about quadrilateral families is TRUE?",opts:[
    {t:'A square is both a rectangle AND a rhombus',ok:true},
    {t:'A rectangle is always a rhombus',ok:false},
    {t:'A kite has two pairs of parallel sides',ok:false},
    {t:'A trapezoid has two pairs of parallel sides',ok:false},
  ]},
];

function renderReflect(){
  const step=S.reflectStep;
  if(step<RQUES.length)return renderRQ(step);
  if(step===RQUES.length)return renderConf();
  return renderCert();
}

function renderRQ(idx){
  const q=RQUES[idx];
  return `<div class="reflect-wrap">
    <div style="text-align:center;margin-bottom:18px">
      <div style="font-family:var(--font-display);color:var(--gold);font-size:1.05rem">🌟 Reflect & Check</div>
      <div style="color:var(--text-muted);font-size:.82rem">Question ${idx+1} of ${RQUES.length}</div>
    </div>
    <div class="rcard">
      <div class="rcard-title">${q.q}</div>
      <div class="ropts" id="ropts">
        ${shuffle(q.opts).map((o,i)=>`<button class="ropt" onclick="ansR(this,${o.ok})">
          <span style="font-size:1.3rem">${o.ok?'💡':'🤔'}</span><span>${o.t}</span></button>`).join('')}
      </div>
    </div>
    <div class="dots" style="margin-top:14px">
      ${RQUES.map((_,i)=>`<div class="dot ${i===idx?'on':i<idx?'done':''}"></div>`).join('')}
    </div>
  </div>`;
}

function ansR(btn,ok){
  sndTap();
  document.querySelectorAll('.ropt').forEach(b=>b.disabled=true);
  btn.classList.add(ok?'ok':'no'); if(ok)sndOk(); else sndWrong();
  if(!ok)document.querySelectorAll('.ropt').forEach(b=>{if(b.classList.contains('ropt')&&!b.classList.contains('no'))b.classList.add('ok');});
  setTimeout(()=>{S.reflectStep++;render();},1700);
}

function renderConf(){
  return `<div class="reflect-wrap">
    <div style="text-align:center;margin-bottom:18px">
      <div style="font-family:var(--font-display);color:var(--gold);font-size:1.05rem">🌟 Confidence Check</div>
    </div>
    <div class="rcard">
      <div class="rcard-title">How confident do you feel?</div>
      <div class="mascot-row"><div class="mascot lg happy">🤖</div></div>
      <div class="conf-grid">
        <button class="conf-btn" onclick="pickConf()"><span style="font-size:1.9rem">🚀</span><span style="font-weight:700">Super confident! I could teach this!</span></button>
        <button class="conf-btn" onclick="pickConf()"><span style="font-size:1.9rem">👍</span><span style="font-weight:700">I understand the main ideas</span></button>
        <button class="conf-btn" onclick="pickConf()"><span style="font-size:1.9rem">🤔</span><span style="font-weight:700">I need a bit more practice</span></button>
      </div>
    </div>
  </div>`;
}

function pickConf(){sndClick();checkBadge('world_geometer');sndBadge();confetti(90);S.reflectStep++;render();}

function renderCert(){
  const acc=S.totalQ>0?Math.round(S.totalOk/S.totalQ*100):0;
  const cw=S.wResults.filter(Boolean).length;
  return `<div class="reflect-wrap">
    <div class="cert-card">
      <span class="cert-badge">🏆</span>
      <div class="cert-title">Lesson Complete!</div>
      <div class="cert-sub">Quadrilaterals from Triangles &amp; Polygons · Grade 7</div>
      <div class="cert-stats">
        <div class="cstat"><div class="cstat-val" style="color:var(--gold)">${S.xp}</div><div class="cstat-lbl">XP Earned</div></div>
        <div class="cstat"><div class="cstat-val" style="color:var(--green)">${acc}%</div><div class="cstat-lbl">Accuracy</div></div>
        <div class="cstat"><div class="cstat-val" style="color:var(--purple-light)">${cw}/8</div><div class="cstat-lbl">Worlds Done</div></div>
      </div>
      <div style="margin:10px 0;color:var(--gold-light);font-family:var(--font-display);font-size:1rem">🏅 Badges Earned</div>
      <div class="badges-row">
        ${S.badges.length?S.badges.map(b=>`<div class="badge-chip">${BMETA[b]?.ic||'🏅'} ${BMETA[b]?.nm||b}</div>`).join(''):'<span style="color:var(--text-muted)">Keep practicing to earn badges!</span>'}
      </div>
      <button class="btn btn-gold" style="margin-top:18px" onclick="restart()">🔄 Restart Module</button>
    </div>
  </div>`;
}

function restart(){sndClick();Object.assign(S,{phase:'intro',audioOn:S.audioOn,xp:0,streak:0,badges:[],stDone:[false,false,false,false,false],wResults:Array(8).fill(null),totalQ:0,totalOk:0,activeW:null,wQIdx:0,wAnswers:[],curQ:null,hints:0,attempts:0,storyP:0,reflectStep:0,usedTypes:[]});initD();render();}

// ═══════════════════════════════════════════
// BADGES
// ═══════════════════════════════════════════
const BMETA={
  angle_sum_ace: {ic:'🔺',nm:'Angle Sum Ace'},
  shape_shifter:  {ic:'📐',nm:'Shape Shifter'},
  polygon_pro:    {ic:'🏆',nm:'Polygon Pro'},
  perfect_vertex: {ic:'💎',nm:'Perfect Vertex'},
  diagonal_streak:{ic:'🔥',nm:'Diagonal Streak'},
  world_geometer: {ic:'🌍',nm:'World Geometer'},
  eagle_sorter:   {ic:'👁️',nm:'Eagle-Eyed Sorter'},
  globe_trotter:  {ic:'🗺️',nm:'Globe Trotter'},
};
const BCOND={
  angle_sum_ace:  ()=>true,
  shape_shifter:  ()=>S.stDone.every(Boolean),
  polygon_pro:    ()=>{const r=S.wResults.filter(Boolean);return r.length>0&&r.reduce((a,b)=>a+b.score,0)/r.length>=8;},
  perfect_vertex: ()=>S.wResults.some(r=>r&&r.score===10),
  diagonal_streak:()=>S.streak>=10,
  world_geometer: ()=>S.reflectStep>=RQUES.length,
  eagle_sorter:   ()=>simSt.doneD,
  globe_trotter:  ()=>S.wResults.every(r=>r&&r.score>=5),
};
function checkBadge(id){
  if(!S.badges.includes(id)&&BCOND[id]&&BCOND[id]()){
    S.badges.push(id);sndBadge();
    badgePop((BMETA[id]?.ic||'🏅')+' Badge: '+(BMETA[id]?.nm||id)+'!');
  }
}

// ─────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────
render();
