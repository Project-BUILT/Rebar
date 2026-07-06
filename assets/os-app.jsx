/* ============================================================
   REBAR — by Project BUILT. The PM for the job that matters most.
   Shared data + shell components. Bilingual via window.I18N
   (assets/i18n.js + i18n-extra.js) — static strings come from
   the rb.* pack; live PM output follows I18N.aiLang().
   ============================================================ */
const { useState, useEffect, useRef } = React;
const LS = "rebar:v2";
const T = (k,v)=>window.I18N.t(k,v);

function openExt(e, url){ e&&e.preventDefault(); const w=window.open(url,"_blank","noopener,noreferrer"); if(!w){try{location.assign(url);}catch(_){}} }
function load(){ try{ return JSON.parse(localStorage.getItem(LS))||null; }catch(_){ return null; } }
function save(s){ try{ localStorage.setItem(LS, JSON.stringify(s)); }catch(_){} }

// ---- live helper (no jargon shown to users) ----
function extractJSON(t){ if(!t) return null; t=String(t).trim().replace(/^```(?:json)?/i,"").replace(/```$/i,"").trim(); const s=t.indexOf("{"),e=t.lastIndexOf("}"); if(s<0||e<0) return null; let x=t.slice(s,e+1); try{return JSON.parse(x);}catch(_){} try{return JSON.parse(x.replace(/,\s*([}\]])/g,"$1"));}catch(_){} return null; }
// Uses the in-app helper when running inside the design preview; falls back to
// the Netlify serverless function (/.netlify/functions/chat) once deployed.
// Every prompt picks up the user's language so live output matches the UI.
async function ask(prompt){
  if (window.I18N && window.I18N.lang !== "en") {
    prompt += "\n\nIMPORTANT: Write every user-facing string of your response in " + window.I18N.aiLang() + " — plainspoken, trades voice. If responding in JSON, keep the JSON keys in English.";
  }
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

// ---- THE PM: one honest voice for the whole tool ----
const PM_VOICE = "You are the PM inside Rebar — a free tool from Project BUILT for construction workers and their families. " +
  "You are a tool built by people who live this life. If anyone asks what you are, say it straight: 'I'm the PM — the part of Rebar that works your list.' Never claim to be a person. Never mention AI. " +
  "VOICE: a warm, plainspoken project manager who came up through the trades. Conversational, like a good friend who happens to run jobs. Use contractions and an easy rhythm. Zero corporate talk, zero lectures, zero therapy-speak. Never use em dashes. You sit on the same side of the table. " +
  "BELIEFS: people don't leave jobs, they leave people; disconnection is the thread behind the crisis; nobody is a burden; every problem has a next move.\n\n";

function pmGreeting(profile){
  return (profile && profile.builder==="spouse") ? T("rb.pm.greetSpouse") : T("rb.pm.greetWorker");
}
function pmPrompt(profile){
  const who = (profile.home||[]).join(", ") || "their people";
  const them = profile.builder==="spouse"
    ? ("someone holding the home front for "+(profile.worker||"a worker")+" in construction")
    : ("a construction worker"+(profile.role?(" — "+profile.role):""));
  const away = profile.travels===true ? " The work takes them away from home." : (profile.travels===false ? " They're home most nights." : "");
  return PM_VOICE +
    "You're in a one-on-one with "+them+(profile.site?(", work is at "+profile.site):"")+"."+away+" At home: "+who+".\n\n"+
    "YOUR JOB in this chat: work like a good PM. Find the LOW-HANGING FRUIT — the single easiest thing to take off their back — across purpose, people, the job itself, a rough boss or coworker, money, the body. NEVER assume a problem they haven't named — follow what THEY bring up. " +
    "Keep every reply short: 1-4 sentences, plain text, no labels, no markdown. Give the concrete move FIRST when you have one, then at most ONE sharp practical question if you need more. Never ask how something makes them feel. " +
    "When it's beyond the tool, refer without drama: 988 for crisis (say it like a jobsite number, not a warning), SAMHSA 1-800-662-4357 for drinking or using, Project BUILT for family support. Every reply ends with a move.";
}

// ---- crisis (real, national) ----
const CRISIS = [
  { id:"c988", name:"988 Suicide & Crisis Lifeline", num:"988", tel:"988" },
  { id:"csam", name:"SAMHSA National Helpline", num:"1-800-662-4357", tel:"18006624357" },
  { id:"ctext", name:"Crisis Text Line", num:"Text HOME to 741741", tel:"" },
  { id:"c911", name:"Emergency", num:"911", tel:"911" }
];
const FUND = { donate:"https://givebutter.com/ProjectBUILT", volunteer:"https://getbuilt.org/volunteer/", site:"https://getbuilt.org/", apply:"https://getbuilt.org/apply/" };

// ---- the punchlist: six scopes, practical first ----
// Display strings live in i18n (rb.room.* / rb.pl.*); this holds structure.
const ROOMS = [
  { id:"people", status:"open", partner:"Your PM · Project BUILT" },
  { id:"travel", status:"open", partner:"BUILT Compass" },
  { id:"body", status:"partner", partner:"Vimocity" },
  { id:"money", status:"soon", partner:"Flying V Financial" },
  { id:"mind", status:"open", partner:"Empower Work · 988" },
  { id:"recovery", status:"soon", partner:"SAFE Project · SAMHSA" }
];
const PL_COUNT = { people:4, body:4, mind:4, money:4, recovery:4, travel:3 };
// spouse/home-front sees its own copy for every scope (rb.*S / rb.pls.*)
function sfx(role){ return role==="spouse" ? "S" : ""; }
function roomName(id){ return T("rb.room."+id+".name"); }
function roomDriver(id, role){ return T("rb.room."+id+".driver"+sfx(role)); }
function roomLine(id, role){ return T("rb.room."+id+".line"+sfx(role)); }
function sheetLede(id, role){ return T("rb.sheet."+id+".lede"+sfx(role)); }
// per-scope best-practice items, in the current language, for the current role
function plItems(id, role){
  const p = role==="spouse" ? "rb.pls." : "rb.pl.";
  const n = PL_COUNT[id]||0; const out=[];
  for(let i=0;i<n;i++) out.push({ t:T(p+id+"."+i+".t"), d:T(p+id+"."+i+".d"), tag:T(p+id+"."+i+".tag") });
  return out;
}
// who the PM is helping, for live prompts (day plans, how-tos)
function tradeLine(profile){
  if(!profile) return "";
  const bits = [];
  if(profile.trade) bits.push("Trade: "+T("rb.tr."+profile.trade));
  if(profile.yearsIn) bits.push(T("rb.yr."+profile.yearsIn)+" years in");
  if(profile.proj) bits.push("current project: "+T("rb.pj."+profile.proj));
  return bits.length ? " "+bits.join(", ")+"." : "";
}
function personLine(profile){
  return profile.builder==="spouse"
    ? ("PERSON: the partner holding the home front while "+(profile.worker||"a construction worker")+" is away for work. At home with them: "+((profile.home||[]).join(", ")||"the family")+"."+tradeLine(profile))
    : ("PERSON: "+(profile.role||"a construction worker")+", working at "+(profile.site||"the jobsite")+"."+(profile.travels===true?" The work takes them away from home.":profile.travels===false?" They're home most nights.":"")+tradeLine(profile));
}

function Hex({size,cls}){ return (
  <svg className={cls} width={size} height={size} viewBox="0 0 100 100" fill="none">
    <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" stroke="var(--green)" strokeWidth="3"/>
    <polygon points="50,16 80,33 80,67 50,84 20,67 20,33" stroke="#4a514a" strokeWidth="2.5"/>
    <line x1="50" y1="26" x2="50" y2="74" stroke="var(--green)" strokeWidth="4"/>
    <line x1="33" y1="38" x2="33" y2="62" stroke="var(--green)" strokeWidth="3"/>
    <line x1="67" y1="38" x2="67" y2="62" stroke="var(--green)" strokeWidth="3"/>
  </svg>
); }

function Header({ onHelp, onReset, showReset, punchCount, onPunch, onPM }){
  return (
    <div className="hdr">
      <div className="lock">
        <img src="assets/built-logo-light.png" alt="Project BUILT" />
      </div>
      <div className="right">
        <select className="langsel" value={window.I18N.lang} onChange={e=>window.I18N.setLang(e.target.value)} aria-label="Language">
          {window.I18N.LANGS.filter(l=>l.code==="en"||l.code==="es").map(l=><option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        {showReset && <button className="ghost" onClick={onReset}>{T("rb.startover")}</button>}
        {onPM && <button className="ghost" onClick={onPM}>{T("rb.pm.name")}</button>}
        {onPunch && <button className="ghost punchbtn" onClick={onPunch}>{T("rb.mylist")}{punchCount>0 && <span className="pcount">{punchCount}</span>}</button>}
        <button className="helpbtn" onClick={onHelp}><span className="pulse"></span> {T("rb.help")}</button>
      </div>
    </div>
  );
}

function Crisis({ onClose }){
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>{T("rb.crisis.title")}</h3>
        <p className="ms">{T("rb.crisis.ms")}</p>
        {CRISIS.map((l,i)=>(
          <div className="crow" key={i}>
            <div><div className="cn">{l.name}</div><div className="cnote">{T("rb.crisis.note."+l.id)}</div></div>
            {l.tel ? <a href={"tel:"+l.tel}>{l.num}</a> : <a className="txt" href="sms:741741?&body=HOME">{l.num}</a>}
          </div>
        ))}
        <div style={{padding:"6px 22px 18px"}}><button className="btn line" style={{width:"100%"}} onClick={onClose}>{T("rb.close")}</button></div>
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
      <div className="authtag">{T("rb.tag")}</div>
      <p className="authlede">{T("rb.auth.lede")}</p>
      {mode==="choose" ? (
        <div className="authbox">
          {SOCIALS.map(s=>(
            <button key={s.id} className="sbtn" onClick={()=>social(s)} disabled={!!busy}>
              {busy===s.id ? <span className="spinner"></span> : <span className="smk">{s.mark}</span>}
              <span>{busy===s.id ? T("rb.auth.connecting",{brand:s.brand}) : T("rb.auth.continue",{brand:s.brand})}</span>
            </button>
          ))}
          <div className="author"><span>{T("rb.auth.or")}</span></div>
          <button className="sbtn" onClick={()=>setMode("email")} disabled={!!busy}><span className="smk">@</span><span>{T("rb.auth.email")}</span></button>
          <p className="authnote">{T("rb.auth.note")}</p>
          <button type="button" className="authback" onClick={()=>onAuthed({ provider:"preview", email:"preview@rebar", name:"", pulled:false })}>{T("rb.auth.demo")} →</button>
        </div>
      ) : (
        <form className="authbox" onSubmit={emailSubmit}>
          <div className="fld"><label>{T("rb.auth.emailLabel")}</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={T("rb.auth.phEmail")} autoFocus /></div>
          <div className="fld"><label>{T("rb.auth.pw")}</label><input type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder={T("rb.auth.phPw")} /></div>
          <button className="btn" type="submit" style={{width:"100%"}}>{T("rb.auth.create")}</button>
          <button type="button" className="authback" onClick={()=>setMode("choose")}>{T("rb.auth.back")}</button>
        </form>
      )}
    </div>
  );
}

window.RebarParts = { openExt, ask, extractJSON, PM_VOICE, pmGreeting, pmPrompt, personLine, CRISIS, FUND, ROOMS, PL_COUNT, plItems, roomName, roomDriver, roomLine, sheetLede, Hex, Header, Crisis, Auth, load, save, T };
