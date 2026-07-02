/* ============================================================
   REBAR — home (pulse + rooms), room sheets, app shell
   depends on window.RebarParts (os-app.jsx)
   ============================================================ */
const P = window.RebarParts;
const { useState:uS, useEffect:uE } = React;

// ---------- ICONS (clean line set) ----------
function Ico({ name, size }){
  const paths = {
    connection:<g><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></g>,
    mind:<g><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/></g>,
    recovery:<g><path d="M12 2v6"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></g>,
    body:<g><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></g>,
    work:<g><path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z"/><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><path d="M14 6a6 6 0 0 1 6 6v3"/></g>,
    money:<g><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/></g>,
    travel:<g><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></g>,
    phone:<g><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></g>,
    compass:<g><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/></g>
  };
  return <svg width={size||22} height={size||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">{paths[name]||paths.connection}</svg>;
}

// ---------- PULSE (post-login interlude) ----------
// Project BUILT peer-support (Confyde) — URL to be added later.
const PEER_URL = "";
const PULSE_OPTS = [
  { k:"up", glyph:"\u2191", label:"Good", cls:"up",
    resp:"Great work! Stay strong." },
  { k:"mid", glyph:"\u2013", label:"Getting by", cls:"mid", peer:true,
    resp:"Living the dream isn't going to cut it anymore. We want you thriving. Are you ready to take it to the next level?" },
  { k:"down", glyph:"\u2193", label:"Rough", cls:"down", urgent:true, peer:true,
    resp:"Don't ride this one out alone. Reaching out right now is strength, not weakness." }
];

function firstName(n){ return (n||"").trim().split(/\s+/)[0] || n || ""; }
function Mood({ profile, onDone, onHelp }){
  const [p,setP] = uS(null);
  const name = profile.founders ? "Josh" : firstName(profile.name);
  const greet = name && name!=="there" ? (", "+name) : "";
  return (
    <div className="moodscreen">
      <div className="app-bg"></div>
      <P.Hex size={56} />
      <div className="loadkick"><span className="spinner"></span> Tying your rebar…</div>
      <h1>How are you feeling today{greet}?</h1>
      <div className="msub">Before anything else. Not the job — <i>you</i>. One tap, then we'll open it up.</div>
      <div className="thumbs">
        {PULSE_OPTS.map(o=>(
          <button key={o.k} className={"thumb "+o.cls} onClick={()=>setP(o)}>
            <div className="tg">{o.glyph}</div>
            <b>{o.label}</b>
          </button>
        ))}
      </div>
      {p && (
        <div className="moodresp">
          <div className={"rtext"+(p.urgent?" urgent":"")}>{p.resp}</div>
          {p.urgent && <div className="racts"><a className="minilink solid" href="tel:988">Call or text 988</a><button className="minilink" onClick={onHelp}>More ways to get help</button></div>}
          <div className="racts">
            {p.peer && <a className="btn" style={{flex:"1 1 100%"}} href={PEER_URL||"#"} onClick={e=>{ if(PEER_URL){P.openExt(e,PEER_URL);} else {e.preventDefault();} }}>Connect to someone who's been there</a>}
            <button className={p.peer?"btn line":"btn"} style={p.peer?{flex:"1 1 100%"}:undefined} onClick={()=>onDone(p.k)}>Open my Rebar →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- LIVE CHAT (Connection) ----------
function Chat({ persona, profile }){
  const [msgs,setMsgs] = uS([{ role:"them", text: persona.greeting }]);
  const [val,setVal] = uS("");
  const [busy,setBusy] = uS(false);
  const logRef = React.useRef(null);
  React.useEffect(()=>{ const el=logRef.current; if(el) el.scrollTop = el.scrollHeight; }, [msgs, busy]);
  async function send(e){
    if(e) e.preventDefault();
    const t = val.trim(); if(!t || busy) return;
    const next = [...msgs, { role:"you", text:t }];
    setMsgs(next); setVal(""); setBusy(true);
    try{
      const prompt = P.personaPrompt(persona, profile) +
        "\n\nCONVERSATION SO FAR:\n" + next.map(m=> (m.role==="you"?"THEM: ":(persona.name+": "))+m.text).join("\n") +
        "\n\nWrite your next reply as "+persona.name+" only. One short, warm message. Plain text, no labels.";
      const r = await P.ask(prompt);
      setMsgs(m=>[...m, { role:"them", text:(r||"").trim() || "I'm right here. Say that again for me?" }]);
    }catch(_){ setMsgs(m=>[...m, { role:"them", text:"Lost you for a second there — try me again." }]); }
    setBusy(false);
  }
  return (
    <div className="chat">
      <div className="chathd">
        <div className="chatav">{persona.name[0]}</div>
        <div><b>{persona.name}</b><span>Co-founder, Project BUILT · here with you</span></div>
      </div>
      <div className="chatlog" ref={logRef}>
        {msgs.map((m,i)=>(<div key={i} className={"msg "+m.role}>{m.text}</div>))}
        {busy && <div className="msg them typing"><span></span><span></span><span></span></div>}
      </div>
      <form className="chatform" onSubmit={send}>
        <input value={val} onChange={e=>setVal(e.target.value)} placeholder={"Tell "+persona.name+" what's going on…"} />
        <button className="chatsend" type="submit" disabled={busy || !val.trim()}>Send</button>
      </form>
    </div>
  );
}

// ---------- ROOM SHEET ----------
function ConnectionLive({ profile }){
  const [st,setSt] = uS("idle"); const [d,setD] = uS(null);
  function run(){
    setSt("work");
    const who = (profile.home||[]).join(", ") || "your people";
    const prompt = P.VOICE +
      "PERSON: "+(profile.role||"a construction worker")+", working at "+(profile.site||"a jobsite away from home")+". At home: "+who+".\n\n"+
      "TASK: Give a real, doable plan to stay close to their people THIS WEEK and beat the isolation — a few concrete moves (who / what / when), one simple rhythm to keep going, and the lonely stretch to watch for.\n\n"+
      'Respond ONLY with JSON: {"opener":"<one honest, warm sentence>","moves":[{"who":"<a person or group>","what":"<a concrete reach-out>","when":"<when, e.g. tonight, Sunday>"}],"rhythm":{"what":"<a recurring thing>","cadence":"<e.g. weekly>"},"watch":"<the loneliest stretch to plan for>"}\n3 moves.';
    P.ask(prompt).then(r=>{ const j=P.extractJSON(r); if(!j) throw 0; setD(j); setSt("done"); }).catch(()=>setSt("err"));
  }
  if(st==="idle") return <button className="btn" style={{width:"100%"}} onClick={run}>Make a plan to stay close this week</button>;
  if(st==="work") return <div className="working"><span className="spinner"></span> Putting together a few real moves for you…</div>;
  if(st==="err") return <button className="btn line" style={{width:"100%"}} onClick={run}>Hit a snag — try again</button>;
  return (
    <div>
      <div className="lede warm" style={{marginTop:4}}>{d.opener}</div>
      <div style={{marginTop:8}}>
        {(d.moves||[]).map((m,i)=>(
          <div className="cstep" key={i}><div className="cn">{i+1}</div><div><b>{m.who} — {m.what}</b><span>{m.when}</span></div></div>
        ))}
      </div>
      {d.rhythm && <div className="callout" style={{background:"rgba(109,212,65,.08)",borderLeftColor:"#6dd441",color:"#cfe9bd"}}><b>Keep it going:</b> {d.rhythm.what} · {d.rhythm.cadence}</div>}
      {d.watch && <div className="callout">{d.watch}</div>}
      <button className="minilink" style={{marginTop:13}} onClick={run}>Make a fresh plan</button>
    </div>
  );
}

function RoomSheet({ room, profile, onClose, onHelp, onContact }){
  const r = room;
  const Partner = ({label,name,desc,links}) => (
    <div className="partnerbox">
      <div className="pl">{label||"Real help behind this room"}</div>
      <b>{name}</b>{desc && <p>{desc}</p>}
      {links && <div className="linkrow">{links.map((l,i)=> l.tel
        ? <a className="minilink" key={i} href={"tel:"+l.tel}>{l.t}</a>
        : <a className="minilink" key={i} href={l.u} onClick={e=>P.openExt(e,l.u)}>{l.t}</a>)}</div>}
    </div>
  );
  let body;
  if(r.id==="connection"){
    const persona = profile && profile.builder==="spouse" ? P.PERSONAS.amy : P.PERSONAS.josh;
    body = <React.Fragment>
      <p className="lede">The work pulls you away from the people who keep you whole. Talk it through with {persona.name} — {persona.name==="Josh"?"he's":"she's"} been right where you are — and build your own plan to stay close. Start with the easy win.</p>
      <Chat persona={persona} profile={profile} />
      <Partner label="Go deeper, with people who get it" name="Project BUILT · Family Retreat" desc="A six-day immersive that brings the whole family in to heal together — plus everyday family tools, all from Project BUILT." links={[{t:"Project BUILT",u:"https://getbuilt.org/"}]} />
    </React.Fragment>;
  } else if(r.id==="mind"){
    body = <React.Fragment>
      <p className="lede">A quarter of the trades are carrying a mental-health load right now. You're not soft, and you're not the only one. The lines below are free, confidential, and open any hour.</p>
      <div className="linkrow"><a className="minilink solid" href="tel:988">Call or text 988</a><button className="minilink" onClick={onHelp}>All crisis &amp; support lines</button></div>
      <div className="note">Coming next: daily check-ins, grief &amp; PTSD support, and a warm handoff to a counselor when you want one.</div>
    </React.Fragment>;
  } else if(r.id==="money"){
    body = <React.Fragment>
      <p className="lede">Financial stress is one of the biggest things that takes guys down — especially the cliff when a job ends and the money stops cold. The fix is getting ahead of it.</p>
      <div style={{margin:"4px 0 4px"}}>
        {["The per-diem feast-or-famine, smoothed out","A cushion for the gap between jobs","A plan so the family isn't blindsided in two months","Money talks that don't blow up at the kitchen table"].map((b,i)=>(<div className="cstep" key={i}><div className="cn">✓</div><div><b>{b}</b></div></div>))}
      </div>
      <div className="linkrow"><button className="minilink solid" onClick={onContact}>Tell us you need this</button><button className="minilink" onClick={onHelp}>Need help now?</button></div>
      <div className="note">In the works for the full release — shaped with people who know trades income inside out.</div>
    </React.Fragment>;
  } else if(r.id==="travel"){
    body = <React.Fragment>
      <p className="lede">Headed to the next job? We already built this part — scout the new town, line up the family's whole world, and land soft.</p>
      <a className="btn" style={{width:"100%"}} href="concierge.html" onClick={e=>P.openExt(e,"concierge.html")}>Open the relocation planner</a>
      <Partner label="What it does" name="The Next Spot" desc="Cost-of-living vs. your current town, schools & therapy that transfer, the kids' exact leagues, a sequenced checklist, and staying connected across the miles." />
    </React.Fragment>;
  } else {
    // recovery / body / work teasers
    const teaser = {
      recovery:{ lede:"Drinking and using are how a lot of guys cope with everything else. No judgment here — just real ways to stay clean on the road and people who get it.",
        bullets:["Cravings and the lonely-night plan","Find meetings near the job, anywhere you land","Naloxone on the jobsite — know how","A recovery coach when you want one"],
        links:[{t:"SAMHSA · 1-800-662-4357",tel:"18006624357"}] },
      body:{ lede:"The body breaks down out here — bad sleep, gas-station food, pain you push through until it owns you. This room keeps you standing.",
        bullets:["Sleep you can actually protect on a shift","Eat halfway right with no kitchen and no time","Daily moves to keep the back and knees","On-site recovery you can use on a break"],
        links:[] },
      work:{ lede:"A bad super can end you — your boss is about half of your day-to-day headspace. This room is about the job not eating you alive.",
        bullets:["Handle a toxic foreman without blowing up","Report what's wrong, safely and confidentially","Find your footing and your purpose again","Talk to someone who's been there"],
        links:[] }
    }[r.id];
    body = <React.Fragment>
      <p className="lede">{teaser.lede}</p>
      <div style={{margin:"4px 0 4px"}}>
        {teaser.bullets.map((b,i)=>(<div className="cstep" key={i}><div className="cn">✓</div><div><b>{b}</b></div></div>))}
      </div>
      {teaser.links.length>0 && <div className="linkrow">{teaser.links.map((l,i)=> l.tel
        ? <a className="minilink" key={i} href={"tel:"+l.tel}>{l.t}</a>
        : <a className="minilink" key={i} href={l.u} onClick={e=>P.openExt(e,l.u)}>{l.t}</a>)}</div>}
      <div className="linkrow">
        <button className="minilink solid" onClick={onContact}>Tell us you need this</button>
        <button className="minilink" onClick={onHelp}>Need help now?</button>
      </div>
      <div className="note">In the works for the full release. Telling us you need it helps us build it first — and helps us fund it.</div>
    </React.Fragment>;
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="sh">
          <div><h2>{r.name}</h2><div className="drv">For: {r.driver}</div></div>
          <button className="closex" onClick={onClose}>×</button>
        </div>
        <div className="sbody">{body}</div>
      </div>
    </div>
  );
}

// ---------- FOUNDERS WALKTHROUGH ----------
function Founders({ onClose }){
  const F = P.FOUNDERS;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet foundersheet" onClick={e=>e.stopPropagation()}>
        <div className="sh">
          <div><div className="drv" style={{marginTop:0}}>Founders · Project BUILT</div><h2>Josh &amp; Amy Vitale</h2></div>
          <button className="closex" onClick={onClose}>×</button>
        </div>
        <div className="sbody">
          <p className="lede warm">{F.shortStory}</p>
          <div className="fsnaplabel">What we're navigating right now</div>
          <div className="fsnap">
            {F.snapshot.map((s,i)=>{
              const room = P.ROOMS.find(r=>r.id===s.room) || {};
              return (
                <div className="fsnapitem" key={i}>
                  <div className="fsi"><Ico name={s.room} size={18} /></div>
                  <div className="fsx">
                    <div className="fsr">{room.name}<span className="fst">{s.state}</span></div>
                    <p>{s.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="btn" style={{width:"100%",marginTop:8}} onClick={onClose}>Get back after it →</button>
        </div>
      </div>
    </div>
  );
}

// ---------- HOME ----------
function Home({ profile, onRoom, onHelp, onContact, onFounders }){
  const hour = new Date().getHours();
  const part = hour<12?"Morning":hour<17?"Afternoon":"Evening";
  const name = profile.founders ? "Josh" : firstName(profile.name);
  return (
    <div className="home">
      <div className="app-bg"></div>
      <div className="wrap">
        <div className="greet">
          <h1>{part}, {name}.</h1>
          <p>{profile.founders
            ? profile.story
            : (profile.builder==="spouse"
                ? "You're carrying a lot by setting this up for "+profile.worker+". Open whatever room you both need — you're not doing it alone."
                : "Glad you're here. Open whatever's pulling hardest. You're not doing the hard parts alone.")}</p>
        </div>

        <div className="seclabel"><h2>Your rooms</h2><span>What's pulling at you?</span></div>
        <div className="rooms">
          {["connection","travel","mind","recovery","body","work","money"].map(id=>{
            const r = P.ROOMS.find(x=>x.id===id); if(!r) return null;
            const span = {connection:3,travel:3,mind:2,recovery:2,body:2,work:3,money:3}[id]||2;
            const feat = id==="connection"||id==="travel";
            const badge = r.status==="open"?"open":r.status==="partner"?"partner":"soon";
            const blabel = r.status==="open"?"Open":r.status==="partner"?"Partner":"In the works";
            return (
              <button className={"room s"+span+(feat?" feat":"")} key={r.id} onClick={()=>onRoom(r.id)}>
                <div className="rtop"><div className="ri"><Ico name={r.id} size={feat?24:22} /></div><span className={"badge "+badge}>{blabel}</span></div>
                <h3>{r.name}</h3>
                <p>{r.line}</p>
                <div className="rfoot">Tackles: <b>{r.driver}</b></div>
              </button>
            );
          })}
        </div>

        {!profile.founders && (
          <button className="strip" onClick={onFounders} style={{width:"100%",cursor:"pointer",textAlign:"left"}}>
            <div className="si"><Ico name="compass" size={22} /></div>
            <div className="st"><b>See how the founders are doing it</b><span>Josh &amp; Amy started Project BUILT — and they're in the thick of a move right now too. You're not the only one.</span></div>
            <span className="ar cond" style={{color:"var(--green)",fontSize:22}}>→</span>
          </button>
        )}

        <div className="strip">
          <div className="si"><Ico name="phone" size={22} /></div>
          <div className="st"><b>Talk to a real person</b><span>Project BUILT works with families directly. If you need a hand, reach out — we'll pick up.</span></div>
          <button className="minilink solid" onClick={onContact}>Reach the BUILT team</button>
        </div>
      </div>

      <div className="fund">
        <div className="wrap in">
          <div>
            <img src="assets/built-logo-light.png" alt="Project BUILT" />
            <h3>This is free because someone backed it.</h3>
            <p>Project BUILT confronts addiction, suicide, burnout and isolation in construction by strengthening workers and the families behind them. Rebar is ours — free to every trades family. It runs on people who decide these families are worth it.</p>
            <div className="tl">Together we build · Together we thrive</div>
          </div>
          <div className="acts">
            <a className="primary" href={P.FUND.donate} onClick={e=>P.openExt(e,P.FUND.donate)}><span><b>Back this work</b><span>givebutter.com/ProjectBUILT</span></span><span className="ar">→</span></a>
            <a href={P.FUND.volunteer} onClick={e=>P.openExt(e,P.FUND.volunteer)}><span><b>Volunteer</b><span>getbuilt.org/volunteer</span></span><span className="ar">→</span></a>
          </div>
        </div>
      </div>
      <div className="foot">Rebar gives you a strong starting point, not the last word. Check what matters, and call 911 in an emergency.<br/>A Project BUILT tool · v1 preview</div>
    </div>
  );
}

// ---------- APP ----------
function todayStr(){ return new Date().toISOString().slice(0,10); }
function App(){
  const saved = P.load();
  const isAuthed = !!(saved && saved.email);
  const isComplete = !!(saved && saved.builder);
  const [auth,setAuth] = uS(isAuthed ? saved : null);
  const [profile,setProfile] = uS(isComplete ? saved : null);
  const [builder,setBuilder] = uS(null);
  const [stage,setStage] = uS(!isAuthed ? "auth" : (!isComplete ? "entry" : (saved.pulseDate!==todayStr() ? "mood" : "home")));
  const [room,setRoom] = uS(null);
  const [crisis,setCrisis] = uS(false);
  const [showFounders,setShowFounders] = uS(false);

  function authed(a){ setAuth(a); P.save(a); setStage("entry"); }
  function pick(kind){
    if(kind==="founders"){ setShowFounders(true); return; }
    setBuilder(kind); setStage("profile");
  }
  function doneProfile(p){ setProfile(p); P.save(p); setStage("mood"); }
  function doneMood(k){ const np={...profile, mood:k, pulseDate:todayStr()}; setProfile(np); P.save(np); setStage("home"); }
  function reset(){ try{localStorage.removeItem("rebar:v1");}catch(_){} setProfile(null); setAuth(null); setBuilder(null); setRoom(null); setShowFounders(false); setStage("auth"); }
  function contact(){ P.openExt(null,"https://getbuilt.org/"); }

  const roomObj = room ? P.ROOMS.find(r=>r.id===room) : null;

  return (
    <div>
      <P.Header onHelp={()=>setCrisis(true)} onReset={reset} showReset={stage==="home"} />
      {stage==="auth" && <P.Auth onAuthed={authed} />}
      {stage==="entry" && <P.Entry auth={auth} onPick={pick} />}
      {stage==="profile" && <P.Profile builder={builder} auth={auth} onDone={doneProfile} />}
      {stage==="mood" && profile && <Mood profile={profile} onDone={doneMood} onHelp={()=>setCrisis(true)} />}
      {stage==="home" && profile && <Home profile={profile} onRoom={setRoom} onHelp={()=>setCrisis(true)} onContact={contact} onFounders={()=>setShowFounders(true)} />}
      {roomObj && <RoomSheet room={roomObj} profile={profile} onClose={()=>setRoom(null)} onHelp={()=>{setRoom(null);setCrisis(true);}} onContact={()=>{setRoom(null);contact();}} />}
      {showFounders && <Founders onClose={()=>setShowFounders(false)} />}
      {crisis && <P.Crisis onClose={()=>setCrisis(false)} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
