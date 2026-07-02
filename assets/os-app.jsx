/* ============================================================
   REBAR — by Project BUILT. Worker + family OS (v1 teaser).
   Compass is the in-app guide. Live help via window.claude.
   ============================================================ */
const { useState, useEffect, useRef } = React;
const LS = "rebar:v1";

function openExt(e, url){ e&&e.preventDefault(); const w=window.open(url,"_blank","noopener,noreferrer"); if(!w){try{location.assign(url);}catch(_){}} }
function load(){ try{ return JSON.parse(localStorage.getItem(LS))||null; }catch(_){ return null; } }
function save(s){ try{ localStorage.setItem(LS, JSON.stringify(s)); }catch(_){} }

// ---- live helper (no jargon shown to users) ----
function extractJSON(t){ if(!t) return null; t=String(t).trim().replace(/^```(?:json)?/i,"").replace(/```$/i,"").trim(); const s=t.indexOf("{"),e=t.lastIndexOf("}"); if(s<0||e<0) return null; let x=t.slice(s,e+1); try{return JSON.parse(x);}catch(_){} try{return JSON.parse(x.replace(/,\s*([}\]])/g,"$1"));}catch(_){} return null; }
// Uses the in-app helper when running inside the design preview; falls back to
// the Netlify serverless function (/.netlify/functions/chat) once deployed.
async function ask(prompt){
  if (window.claude && typeof window.claude.complete === "function") {
    return window.claude.complete({ messages:[{ role:"user", content:prompt }] });
  }
  const res = await fetch("/.netlify/functions/chat", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!res.ok) throw new Error("chat backend unavailable ("+res.status+")");
  const data = await res.json();
  return data.text || "";
}

const VOICE = "You are Compass, a guide inside Rebar — a tool from Project BUILT for construction workers and their families. " +
  "Your voice is a recovering superintendent's: trades-honest, warm, plainspoken, short sentences. You sit beside people, never talk down. " +
  "Name the hard thing, then give a real next step. Believe: people don't leave jobs they leave people; disconnection is the thread behind the crisis; nobody is a burden; you're not alone. No corporate talk, no fluff, never mention AI.\n\n";

// ---- founder personas for 1:1 chat ----
const PERSONAS = {
  josh:{ name:"Josh",
    who:"Josh Vitale, co-founder of Project BUILT and a senior project superintendent who has spent years on the road, in jobsite hotels, away from his wife Amy and their kids",
    voice:"Trades-honest, warm, plainspoken. Short sentences. You've lived the per-diem life, the isolation, the dark days. You sit beside him, shoulder to shoulder, never above him.",
    greeting:"Glad you're here. I'm Josh — I've spent more nights in a jobsite hotel away from my family than I can count, so I'm not going to feed you anything fake. Real quick: what's the one thing pulling at you hardest right now?" },
  amy:{ name:"Amy",
    who:"Amy Vitale, co-founder of Project BUILT and the partner who holds the family together while Josh is on the road — splitting time across states, raising the kids, keeping the circle alive",
    voice:"Warm, steady, been-there. You speak partner-to-partner. You know the loneliness of holding down the home front and the worry that rides along with loving someone who's always gone.",
    greeting:"Hey — I'm Amy. I've held things together at home with Josh a thousand miles away, so I get this from your side of it. Tell me straight: what's the hardest part for you right now?" }
};
function personaPrompt(p, profile){
  const who = (profile.home||[]).join(", ") || "their people";
  const them = profile.builder==="spouse"
    ? ("someone supporting "+(profile.worker||"their worker")+", a "+(profile.role||"construction worker"))
    : ("a "+(profile.role||"construction worker"));
  return "You are "+p.who+". You are talking one-on-one, inside Rebar, with "+them+" who is "+(profile.site?("working at "+profile.site):"working away from home")+". At home: "+who+".\n\n"+
    "VOICE: "+p.voice+" Believe: people don't leave jobs, they leave people; disconnection is the thread behind the crisis; nobody is a burden; you're not alone. No corporate talk, no fluff. Never say you are an AI — you are "+p.name+".\n\n"+
    "YOUR JOB in this chat: find the LOW-HANGING FRUIT — the single easiest thing pulling at them — then deliver real, concrete solutions. Ask ONE question at a time. Keep every reply short (1-4 sentences, plain text, no labels or markdown). When you have enough, offer 2-3 specific next steps. Name the hard thing, then give the real move.";
}

// ---- crisis (real, national) ----
const CRISIS = [
  { name:"988 Suicide & Crisis Lifeline", num:"988", note:"Call or text, 24/7", tel:"988" },
  { name:"SAMHSA National Helpline", num:"1-800-662-4357", note:"Free treatment referral, 24/7", tel:"18006624357" },
  { name:"Crisis Text Line", num:"Text HOME to 741741", note:"Text-based support, 24/7", tel:"" },
  { name:"Emergency", num:"911", note:"Immediate danger", tel:"911" }
];
const FUND = { donate:"https://givebutter.com/ProjectBUILT", volunteer:"https://getbuilt.org/volunteer/", site:"https://getbuilt.org/" };

// ---- rooms: driver + real partner depth ----
const ROOMS = [
  { id:"connection", glyph:"◇", name:"Connection", driver:"Isolation", status:"open",
    line:"Stay close to your people. Beat the thing that does the real damage.",
    partner:"Project BUILT + Proactive Conversations" },
  { id:"mind", glyph:"~", name:"Your Head", driver:"Mental health", status:"open",
    line:"The stress, the dark days, and real help that's one tap away.",
    partner:"Empower Work · 988" },
  { id:"recovery", glyph:"@", name:"Recovery", driver:"Drinking & using", status:"soon",
    line:"Staying clean on the road. Cravings, meetings, no judgment.",
    partner:"SAFE Project · SAMHSA" },
  { id:"body", glyph:"+", name:"Your Body", driver:"Sleep · pain · burnout", status:"soon",
    line:"Sleep, real food, and not grinding yourself into the ground.",
    partner:"Recharge · Vimocity" },
  { id:"work", glyph:"=", name:"The Job", driver:"Bad bosses · purpose", status:"soon",
    line:"Toxic supers, burnout, and remembering why you do this.",
    partner:"Mission Mindset · Confyde" },
  { id:"money", glyph:"$", name:"The Money", driver:"The cliff", status:"soon",
    line:"Don't get caught flat when the job dries up. Build the cushion.",
    partner:"Flying V Financial" },
  { id:"travel", glyph:">", name:"The Next Spot", driver:"Travel & the move", status:"open",
    line:"Scout the next town and land your family soft. We built this one.",
    partner:"Compass" }
];

// ---- the Vitale founders' story ----
const FOUNDERS = {
  name:"Josh", builder:"worker", founders:true,
  worker:"Josh", role:"Senior Project Superintendent",
  site:"Project Lighthouse — Vantage data center, Port Washington, WI",
  home:["Partner — Amy","Kids — Gavin, Evan, Ryla","Daughter — Kaylyn (20)"],
  story:"We're Josh & Amy Vitale — we started Project BUILT. Right now Josh is on-site in Wisconsin while Amy splits time between here and Arizona, the boys come for the summer, and our oldest holds down the house back home. We're navigating Gavin's therapy across state lines, rebuilding a circle we spent years building, and staying close across a thousand miles. We built Rebar because we needed it. You're not the only one in it.",
  shortStory:"We started Project BUILT, and we're living the same thing you are. Josh is on-site in Wisconsin; Amy splits time with Arizona; the boys come for summers and our oldest, Kaylyn, holds down the house back home. When everything got shaken up, we realized how much help we needed that just wasn't there — so we built Rebar. Here's what we're actually doing, room by room.",
  snapshot:[
    { room:"connection", state:"Every day", note:"A daily video call and texts all day. We alternate who reaches out — some nights Josh calls at his late bedtime, some mornings an early call wakes Amy when he's heading to work — so the strain stays even. We stay honest about the bad days and co-regulate through them; learning to set boundaries has helped, and we're still at it." },
    { room:"travel", state:"Twice a month", note:"Josh flies back for a long weekend twice a month, and Amy and the kids are up in Wisconsin with him for the summer." },
    { room:"mind", state:"The deep work", note:"We're recovering from tough childhoods and generational trauma. It's a ton of work, sometimes ugly — but it's so worth it." },
    { room:"recovery", state:"A lifestyle", note:"We're both in individual therapy and couples therapy, and we do support groups every week or month. Recovery is a lifestyle for us." },
    { room:"body", state:"Getting there", note:"Josh aims for seven hours a night; with a toddler that's harder for Amy, but we're getting better. We do chef-prepared organic meals to lighten the load and actually eat well." },
    { room:"money", state:"Locked in", note:"Maxing out the 401(k) and HSA, keeping a real emergency fund, and working with a money manager so the gap between jobs never blindsides us." }
  ]
};

function Hex({size,cls}){ return (
  <svg className={cls} width={size} height={size} viewBox="0 0 100 100" fill="none">
    <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" stroke="#6dd441" strokeWidth="3"/>
    <polygon points="50,16 80,33 80,67 50,84 20,67 20,33" stroke="#4a514a" strokeWidth="2.5"/>
    <line x1="50" y1="26" x2="50" y2="74" stroke="#6dd441" strokeWidth="4"/>
    <line x1="33" y1="38" x2="33" y2="62" stroke="#6dd441" strokeWidth="3"/>
    <line x1="67" y1="38" x2="67" y2="62" stroke="#6dd441" strokeWidth="3"/>
  </svg>
); }

function Header({ onHelp, onReset, showReset }){
  return (
    <div className="hdr">
      <div className="lock">
        <img src="assets/built-logo-light.png" alt="Project BUILT" />
        <div className="div"></div>
        <div>
          <div className="wordmark"><span className="r">RE</span>BAR</div>
          <div className="sub">By Project BUILT</div>
        </div>
      </div>
      <div className="right">
        {showReset && <button className="ghost" onClick={onReset}>Start over</button>}
        <button className="helpbtn" onClick={onHelp}><span className="pulse"></span> Get Help Now</button>
      </div>
    </div>
  );
}

function Crisis({ onClose }){
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>You're not alone on this</h3>
        <p className="ms">If you or someone with you is struggling, reach out right now. Free, confidential, built for people in the trades — any hour.</p>
        {CRISIS.map((l,i)=>(
          <div className="crow" key={i}>
            <div><div className="cn">{l.name}</div><div className="cnote">{l.note}</div></div>
            {l.tel ? <a href={"tel:"+l.tel}>{l.num}</a> : <a className="txt" href="sms:741741?&body=HOME">{l.num}</a>}
          </div>
        ))}
        <div style={{padding:"6px 22px 18px"}}><button className="btn line" style={{width:"100%"}} onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

// ---------- AUTH (sign in / sign up) ----------
const SOCIALS = [
  { id:"google", brand:"Google", mark:"G", mock:{ name:"Mike Sandoval", email:"mike.sandoval@gmail.com" } },
  { id:"apple", brand:"Apple", mark:"\uF8FF", mock:{ name:"Mike Sandoval", email:"m.sandoval@icloud.com" } },
  { id:"facebook", brand:"Facebook", mark:"f", mock:{ name:"Mike Sandoval", email:"mike.s@fb.com" } }
];
function Auth({ onAuthed }){
  const [busy,setBusy] = useState(null);
  const [mode,setMode] = useState("choose"); // choose | email
  const [email,setEmail] = useState(""); const [pw,setPw] = useState("");
  function social(s){
    if(busy) return; setBusy(s.id);
    setTimeout(()=>{ onAuthed({ provider:s.brand, email:s.mock.email, name:s.mock.name, pulled:true }); }, 1000);
  }
  function emailSubmit(e){ e.preventDefault(); if(!email.trim()||!pw.trim()) return; onAuthed({ provider:"email", email:email.trim(), name:"", pulled:false }); }
  return (
    <div className="auth">
      <div className="app-bg"></div>
      <img src="assets/built-badge.png" alt="Project BUILT" className="authbadge" />
      <h1 className="authwm"><span className="r">RE</span>BAR</h1>
      <div className="authtag">The steel inside.</div>
      <p className="authlede">Make an account so your plans, your people, and your progress are saved and here every time you come back.</p>
      {mode==="choose" ? (
        <div className="authbox">
          {SOCIALS.map(s=>(
            <button key={s.id} className="sbtn" onClick={()=>social(s)} disabled={!!busy}>
              {busy===s.id ? <span className="spinner"></span> : <span className="smk">{s.mark}</span>}
              <span>{busy===s.id ? ("Connecting to "+s.brand+"\u2026") : ("Continue with "+s.brand)}</span>
            </button>
          ))}
          <div className="author"><span>or</span></div>
          <button className="sbtn" onClick={()=>setMode("email")} disabled={!!busy}><span className="smk">@</span><span>Continue with email</span></button>
          <p className="authnote">We pull only your name &amp; email to set you up faster — you fill in the rest, and you control it. Nothing is ever shared or sold.</p>
        </div>
      ) : (
        <form className="authbox" onSubmit={emailSubmit}>
          <div className="fld"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" autoFocus /></div>
          <div className="fld"><label>Password</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Create a password" /></div>
          <button className="btn" type="submit" style={{width:"100%"}}>Create account &amp; continue</button>
          <button type="button" className="authback" onClick={()=>setMode("choose")}>← Back to all options</button>
        </form>
      )}
    </div>
  );
}

// ---------- ENTRY ----------
function Entry({ onPick, auth }){
  return (
    <div className="entry">
      <div className="app-bg"></div>
      <img src="assets/built-badge.png" alt="Project BUILT" className="bighex" />
      <div className="kicker">{auth ? "You're signed in · Free, always" : "A Project BUILT tool · Free, always"}</div>
      <h1><span className="r">RE</span>BAR</h1>
      <div className="tag">The steel inside.</div>
      <p className="lede">{auth ? "You're in. Now — who are we setting this up for?" : "One place for the worker and the family behind them — to stay connected, stay standing, and not do the hard parts alone."}</p>
      <div className="choices">
        <button className="choice" onClick={()=>onPick("worker")}>
          <div className="ci">I</div>
          <div><b>I'm the worker</b><span>Set up for yourself — your people, your days, your head.</span></div>
        </button>
        <button className="choice" onClick={()=>onPick("spouse")}>
          <div className="ci">♥</div>
          <div><b>I'm building this for someone I love</b><span>Set it up for the worker in your life.</span></div>
        </button>
        <button className="choice alt" onClick={()=>onPick("founders")}>
          <div className="ci">★</div>
          <div><b>See how the founders are doing it</b><span>Walk through what Josh &amp; Amy are navigating right now.</span></div>
        </button>
      </div>
      <div className="foot">Built by <b>Project BUILT</b> · Together we build · Together we thrive</div>
    </div>
  );
}

// ---------- PROFILE ----------
const HOME_OPTS = ["Just me","A partner","Kids at home","A parent","Someone in recovery with me"];
const HOME_OPTS_SPOUSE = ["Just me","Our kids","A parent I care for","Someone in recovery with us"];
function Profile({ builder, auth, onDone }){
  const worker = builder==="worker";
  const homeOpts = worker ? HOME_OPTS : HOME_OPTS_SPOUSE;
  const homeLabel = worker ? "Who's at home?" : "Who's home while they're on the road?";
  const [f,setF] = useState({ name:(auth&&auth.name)||"", worker:"", role:"", site:"", home:[] });
  function tog(o){ setF(s=>({ ...s, home: s.home.includes(o)? s.home.filter(x=>x!==o): [...s.home,o] })); }
  function submit(e){ e.preventDefault();
    const profile = {
      ...(auth||{}),
      builder, founders:false,
      name: f.name.trim() || "there",
      worker: worker ? (f.name.trim()||"you") : (f.worker.trim()||"your worker"),
      role: f.role.trim(), site: f.site.trim(),
      home: f.home.length? f.home : ["Just me"]
    };
    onDone(profile);
  }
  return (
    <div className="formwrap">
      <div className="app-bg"></div>
      <form className="formcard" onSubmit={submit}>
        <h2>{worker ? "Let's get you set up" : "Let's set them up"}</h2>
        <p className="h2sub">{worker ? "Just enough so we can actually be useful — not a form for its own sake." : "A few things about the worker in your life, and you, so the help is real."}</p>
        {auth && auth.pulled && <div className="pulled">Connected via {auth.provider}. We filled in what we could — fix anything that's off.</div>}
        <div className="fld"><label>{worker?"Your name":"Your name"}</label><input value={f.name} onChange={e=>setF({...f,name:e.target.value})} placeholder={worker?"First name":"Your first name"} autoFocus /></div>
        {!worker && <div className="fld"><label>Their name</label><input value={f.worker} onChange={e=>setF({...f,worker:e.target.value})} placeholder="The worker's first name" /></div>}
        <div className="fld"><label>{worker?"Your trade / role":"Their trade / role"}</label><input value={f.role} onChange={e=>setF({...f,role:e.target.value})} placeholder="e.g. Superintendent, electrician, operator" /></div>
        <div className="fld"><label>Where's the work right now?</label><input value={f.site} onChange={e=>setF({...f,site:e.target.value})} placeholder="Jobsite, town, or 'home for now'" /></div>
        <div className="fld"><label>{homeLabel}</label><div className="chips">{homeOpts.map(o=>(<button type="button" key={o} className={"chip"+(f.home.includes(o)?" on":"")} onClick={()=>tog(o)}>{o}</button>))}</div></div>
        <button className="btn" type="submit" style={{width:"100%",marginTop:6}}>Open my Rebar</button>
      </form>
    </div>
  );
}

window.RebarParts = { openExt, ask, extractJSON, VOICE, PERSONAS, personaPrompt, CRISIS, FUND, ROOMS, FOUNDERS, Hex, Header, Crisis, Auth, Entry, Profile, load, save };
