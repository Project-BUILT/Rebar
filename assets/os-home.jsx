/* ============================================================
   REBAR — the punchlist (home), scope sheets, PM chat, app shell
   depends on window.RebarParts (os-app.jsx). All static strings
   come from the rb.* i18n pack; App re-renders on langchange.
   ============================================================ */
const P = window.RebarParts;
const { useState:uS, useEffect:uE } = React;
const t = P.T;

// ---------- ICONS (clean line set) ----------
function Ico({ name, size }){
  const paths = {
    people:<g><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></g>,
    mind:<g><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/></g>,
    recovery:<g><path d="M12 2v6"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/></g>,
    body:<g><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></g>,
    money:<g><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/></g>,
    travel:<g><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></g>,
    phone:<g><path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"/></g>,
    list:<g><path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/></g>
  };
  return <svg width={size||22} height={size||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">{paths[name]||paths.people}</svg>;
}

// ---------- PULSE (post-login interlude) ----------
// Project BUILT peer-support (Confyde) — URL to be added later.
const PEER_URL = "";
const PULSE_OPTS = [
  { k:"up", glyph:"\u2191", cls:"up" },
  { k:"mid", glyph:"\u2013", cls:"mid", peer:true },
  { k:"down", glyph:"\u2193", cls:"down", urgent:true, peer:true }
];
const PULSE_KEY = { up:"rb.pulse.up", mid:"rb.pulse.mid", down:"rb.pulse.down" };

function firstName(n){ return (n||"").trim().split(/\s+/)[0] || n || ""; }
function Mood({ profile, onDone, onHelp }){
  const [p,setP] = uS(null);
  const name = firstName(profile.name);
  const greet = name && name!=="there" ? (", "+name) : "";
  return (
    <div className="moodscreen">
      <div className="app-bg"></div>
      <P.Hex size={56} />
      <div className="loadkick"><span className="spinner"></span> {t("rb.mood.kick")}</div>
      <h1>{t("rb.mood.h1",{greet})}</h1>
      <div className="msub">{t("rb.mood.sub")}</div>
      <div className="thumbs">
        {PULSE_OPTS.map(o=>(
          <button key={o.k} className={"thumb "+o.cls} onClick={()=>setP(o)}>
            <div className="tg">{o.glyph}</div>
            <b>{t("rb.pulse."+o.k)}</b>
          </button>
        ))}
      </div>
      {p ? (
        <div className="moodresp">
          <div className={"rtext"+(p.urgent?" urgent":"")}>{t("rb.pulse."+p.k+"Resp")}</div>
          {p.urgent && <div className="racts"><a className="minilink solid" href="tel:988">{t("rb.call988")}</a><button className="minilink" onClick={onHelp}>{t("rb.moreHelp")}</button></div>}
          <div className="racts">
            {p.peer && <a className="btn" style={{flex:"1 1 100%"}} href={PEER_URL||"#"} onClick={e=>{ if(PEER_URL){P.openExt(e,PEER_URL);} else {e.preventDefault();} }}>{t("rb.peer")}</a>}
            <button className={p.peer?"btn line":"btn"} style={p.peer?{flex:"1 1 100%"}:undefined} onClick={()=>onDone(p.k)}>{t("rb.continue")}</button>
          </div>
        </div>
      ) : (
        <button className="authback" style={{marginTop:24}} onClick={()=>onDone(null)}>{t("rb.skip")}</button>
      )}
    </div>
  );
}

// ---------- PM CHAT (honest tool, every turn ends with a move) ----------
function Chat({ profile, context, greeting }){
  const [msgs,setMsgs] = uS([{ role:"them", text: greeting || P.pmGreeting(profile) }]);
  const [val,setVal] = uS("");
  const [busy,setBusy] = uS(false);
  const logRef = React.useRef(null);
  React.useEffect(()=>{ const el=logRef.current; if(el) el.scrollTop = el.scrollHeight; }, [msgs, busy]);
  async function send(e){
    if(e) e.preventDefault();
    const tx = val.trim(); if(!tx || busy) return;
    const next = [...msgs, { role:"you", text:tx }];
    setMsgs(next); setVal(""); setBusy(true);
    try{
      const prompt = P.pmPrompt(profile) + (context ? ("\n\n"+context) : "") +
        "\n\nCONVERSATION SO FAR:\n" + next.map(m=> (m.role==="you"?"THEM: ":"PM: ")+m.text).join("\n") +
        "\n\nWrite your next reply as the PM only. Short, plain text, no labels.";
      const r = await P.ask(prompt);
      setMsgs(m=>[...m, { role:"them", text:(r||"").trim() || t("rb.chat.again") }]);
    }catch(_){ setMsgs(m=>[...m, { role:"them", text:t("rb.chat.lost") }]); }
    setBusy(false);
  }
  return (
    <div className="chat">
      <div className="chathd">
        <div className="chatav" style={{fontSize:14}}>PM</div>
        <div><b>{t("rb.pm.name")}</b><span>{t("rb.pm.sub")}</span></div>
      </div>
      <div className="chatlog" ref={logRef}>
        {msgs.map((m,i)=>(<div key={i} className={"msg "+m.role}>{m.text}</div>))}
        {busy && <div className="msg them typing"><span></span><span></span><span></span></div>}
      </div>
      <form className="chatform" onSubmit={send}>
        <input value={val} onChange={e=>setVal(e.target.value)} placeholder={t("rb.chat.ph")} />
        <button className="chatsend" type="submit" disabled={busy || !val.trim()}>{t("rb.chat.send")}</button>
      </form>
    </div>
  );
}

// ---------- PUNCHLIST (BUILT best practice, per scope) ----------
// onToggle present -> each item gets a "+ My list" commit button that feeds
// the living scorecard (the dock).
function Punchlist({ id, punch, onToggle, role }){
  const items = P.plItems(id, role);
  return (
    <React.Fragment>
      <div className="fsnaplabel">{t("rb.pl.label")}</div>
      <div className="fsnap">
        {items.map((it,i)=>{
          const on = !!(punch && punch[id+":"+i]);
          return (
            <div className="fsnapitem" key={i}>
              <div className="fsi mono" style={{fontSize:11}}>{String(i+1).padStart(2,"0")}</div>
              <div className="fsx">
                <div className="fsr">{it.t}<span className="fst">{it.tag}</span>
                  {onToggle && <button className={"pladd"+(on?" on":"")} onClick={()=>onToggle(id,i)}>{on?t("rb.pl.on"):t("rb.pl.add")}</button>}
                </div>
                <p>{it.d}</p>
              </div>
            </div>
          );
        })}
      </div>
    </React.Fragment>
  );
}

// ---------- BODY: quick yes/no check → punchlist ----------
function BodyCheck({ profile, onAdd, onOpenDock }){
  const role = profile.builder;
  const S = role==="spouse" ? "S" : "";
  const QS = [0,1,2,3].map(i=>({ q:t("rb.bc.q"+i+S), bad:(role!=="spouse"&&i===3)?"yes":"no", item:i }));
  const [ans,setAns] = uS({});
  const punch = profile.punch||{};
  function answer(i,val){
    if(ans[i]!=null) return;
    setAns(a=>({...a,[i]:val}));
    if(val===QS[i].bad && !punch["body:"+QS[i].item]) onAdd("body", QS[i].item);
  }
  const n = Object.keys(ans).length;
  const misses = QS.filter((q,i)=>ans[i]===q.bad).length;
  return (
    <div>
      <div className="fsnaplabel" style={{marginTop:4}}>{t("rb.bc.title")}</div>
      <p style={{color:"var(--muted)",fontSize:13.5,lineHeight:1.5,margin:"0 0 10px"}}>{t("rb.bc.sub")}</p>
      {QS.map((q,i)=>(
        <div className="bcrow" key={i}>
          <div className="bq">{q.q}</div>
          {ans[i]===q.bad && <span className="fst" style={{flex:"none"}}>{t("rb.pl.on")}</span>}
          <div className="bopts">
            {["yes","no"].map(v=>(
              <button key={v} className={"chip"+(ans[i]===v?" on":"")} onClick={()=>answer(i,v)}>{t("rb.bc."+v)}</button>
            ))}
          </div>
        </div>
      ))}
      {n===4 && (
        <div className="presp" style={{marginTop:6}}>
          {misses===0 ? t("rb.bc.done0") : t("rb.bc.done",{n:misses})}
          {misses>0 && <div className="pacts"><button className="minilink solid" onClick={onOpenDock}>{t("rb.bc.open")}</button></div>}
        </div>
      )}
    </div>
  );
}

// ---------- BODY: live day plan (fuel + moves + sleep) ----------
function BodyPlan({ profile }){
  const [st,setSt] = uS("idle"); const [d,setD] = uS(null);
  function run(){
    setSt("work");
    const task = profile.builder==="spouse"
      ? "TASK: Build TODAY'S plan for a solo parent holding the home front: 3 realistic food moves that feed the family AND them (minimal prep, real life, kids in the mix), 3 short mobility moves for a body that hauls kids, groceries and laundry, and one concrete sleep anchor for tonight."
      : (profile.travels===false
        ? "TASK: Build TODAY'S body plan for a long shift and a commute: what to actually eat (realistic — lunchbox, gas station, whatever's on the route), 3 short mobility moves for a trades body, and one concrete sleep anchor for tonight."
        : "TASK: Build TODAY'S body plan for a long shift with no kitchen and little time: what to actually eat (realistic — gas station, cooler, hotel options), 3 short mobility moves for a trades body, and one concrete sleep anchor for tonight.");
    const prompt = P.PM_VOICE +
      P.personLine(profile)+"\n\n"+ task +"\n\n"+
      'Respond ONLY with JSON: {"opener":"<one honest, warm sentence>","meals":[{"when":"<when>","what":"<a realistic food move>"}],"moves":[{"name":"<the move>","why":"<what it protects>","mins":"<minutes>"}],"sleep":"<one concrete sleep anchor for tonight>"}\n3 meals, 3 moves.';
    P.ask(prompt).then(r=>{ const j=P.extractJSON(r); if(!j) throw 0; setD(j); setSt("done"); }).catch(()=>setSt("err"));
  }
  if(st==="idle") return <button className="btn" style={{width:"100%"}} onClick={run}>{t("rb.body.build")}</button>;
  if(st==="work") return <div className="working"><span className="spinner"></span> {t("rb.body.working")}</div>;
  if(st==="err") return <button className="btn line" style={{width:"100%"}} onClick={run}>{t("rb.tryagain")}</button>;
  return (
    <div>
      <div className="lede warm" style={{marginTop:4}}>{d.opener}</div>
      <div className="fsnaplabel">{t("rb.body.fuel")}</div>
      <div>
        {(d.meals||[]).map((m,i)=>(
          <div className="cstep" key={i}><div className="cn">{i+1}</div><div><b>{m.when} — {m.what}</b></div></div>
        ))}
      </div>
      <div className="fsnaplabel">{t("rb.body.moves")}</div>
      <div>
        {(d.moves||[]).map((m,i)=>(
          <div className="cstep" key={i}><div className="cn">▸</div><div><b>{m.name} · {m.mins} min</b><span>{m.why}</span></div></div>
        ))}
      </div>
      {d.sleep && <div className="callout" style={{background:"rgb(from var(--green) r g b / .08)",borderLeftColor:"var(--green)",color:"#cfe9bd"}}><b>{t("rb.body.tonight")}</b> {d.sleep}</div>}
      <button className="minilink" style={{marginTop:13}} onClick={run}>{t("rb.body.fresh")}</button>
    </div>
  );
}

// ---------- MONEY: the cushion, in weeks ----------
function fmtMoney(n){ try{ return "$"+Math.round(n).toLocaleString("en-US"); }catch(_){ return "$"+Math.round(n); } }
function MoneyRunway({ profile, onPatch, onAdd }){
  const c = (profile&&profile.cushion)||{};
  const [take,setTake] = uS(c.take||"");
  const [bills,setBills] = uS(c.bills||"");
  const [save,setSave] = uS(c.save||"");
  const [out,setOut] = uS(c.w!=null ? c : null);
  const punch = (profile&&profile.punch)||{};
  const onList = !!punch["money:0"];
  function run(e){
    e.preventDefault();
    const b = parseFloat(bills), s = parseFloat(save)||0;
    if(!(b>0)) return;
    const w = Math.max(0, Math.floor(s/(b/4.33)));
    const rec = { take, bills, save, w };
    setOut(rec); onPatch && onPatch({ cushion: rec });
  }
  if(out){
    const b = parseFloat(out.bills)||0;
    const w = out.w;
    return (
      <div>
        <div className="fsnaplabel" style={{marginTop:4}}>{t("rb.money.calcT")}</div>
        <div className="presp" style={{marginTop:0}}>
          {w<=0 ? t("rb.money.runway0") : w===1 ? t("rb.money.runway1") : t("rb.money.runway",{w})}
          {b>0 && w<12 && <div style={{marginTop:8,fontSize:13.5,color:"var(--muted)"}}>{t("rb.money.goal",{amt:fmtMoney(b/4.33*4)})}</div>}
          <div className="pacts">
            {w<12 && <button className={"pladd"+(onList?" on":"")} style={{marginLeft:0}} disabled={onList} onClick={()=>{ if(!onList) onAdd("money",0); }}>{onList?t("rb.money.onlist"):t("rb.money.addfix")}</button>}
            <button className="minilink" onClick={()=>setOut(null)}>{t("rb.money.edit")}</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <form onSubmit={run}>
      <div className="fsnaplabel" style={{marginTop:4}}>{t("rb.money.calcT")}</div>
      <p style={{color:"var(--muted)",fontSize:13.5,lineHeight:1.5,margin:"0 0 10px"}}>{t("rb.money.calcSub")}</p>
      <div className="fld"><label>{t("rb.money.take")}</label><input type="number" inputMode="decimal" min="0" value={take} onChange={e=>setTake(e.target.value)} placeholder="$" /></div>
      <div className="fld"><label>{t("rb.money.bills")}</label><input type="number" inputMode="decimal" min="0" value={bills} onChange={e=>setBills(e.target.value)} placeholder="$" /></div>
      <div className="fld"><label>{t("rb.money.save")}</label><input type="number" inputMode="decimal" min="0" value={save} onChange={e=>setSave(e.target.value)} placeholder="$" /></div>
      <button className="btn" type="submit" style={{width:"100%"}} disabled={!(parseFloat(bills)>0)}>{t("rb.money.run")}</button>
    </form>
  );
}

// ---------- RECOVERY: real doors, tonight ----------
const REC_FINDERS = [
  { t:"FindTreatment.gov", u:"https://findtreatment.gov/" },
  { t:"AA meetings", u:"https://www.aa.org/find-aa" },
  { t:"NA meetings", u:"https://www.na.org/meetingsearch/" },
  { t:"SMART Recovery", u:"https://meetings.smartrecovery.org/meetings/" }
];
function RecoveryFinders(){
  return (
    <div>
      <div className="fsnaplabel">{t("rb.rec.findT")}</div>
      <p style={{color:"var(--muted)",fontSize:13.5,lineHeight:1.5,margin:"0 0 10px"}}>{t("rb.rec.findSub")}</p>
      <div className="linkrow" style={{marginTop:0}}>
        {REC_FINDERS.map((l,i)=>(<a className="minilink" key={i} href={l.u} onClick={e=>P.openExt(e,l.u)}>{l.t}</a>))}
        <a className="minilink" href="https://www.intherooms.com/" onClick={e=>P.openExt(e,"https://www.intherooms.com/")}>{t("rb.rec.online")} · In The Rooms</a>
      </div>
    </div>
  );
}

// ---------- SCOPE SHEET ----------
function RoomSheet({ room, profile, onClose, onHelp, onContact, onTogglePunch, onOpenDock, onPatch }){
  const r = room;
  const role = profile && profile.builder;
  const punch = (profile&&profile.punch)||{};
  const PL = ({id}) => <Punchlist id={id} punch={punch} onToggle={onTogglePunch} role={role} />;
  const lede = id => P.sheetLede(id, role);
  const Partner = ({label,name,desc,links}) => (
    <div className="partnerbox">
      <div className="pl">{label||t("rb.sheet.partnerLabel")}</div>
      <b>{name}</b>{desc && <p>{desc}</p>}
      {links && <div className="linkrow">{links.map((l,i)=> l.tel
        ? <a className="minilink" key={i} href={"tel:"+l.tel}>{l.t}</a>
        : <a className="minilink" key={i} href={l.u} onClick={e=>P.openExt(e,l.u)}>{l.t}</a>)}</div>}
    </div>
  );
  let body;
  if(r.id==="people"){
    body = <React.Fragment>
      <p className="lede">{lede("people")}</p>
      <Chat profile={profile} />
      <PL id="people" />
      <Partner label={t("rb.sheet.people.plabel")} name={t("rb.sheet.people.pname")} desc={t("rb.sheet.people.pdesc")} links={[{t:t("rb.retreat.cta"),u:P.FUND.apply}]} />
    </React.Fragment>;
  } else if(r.id==="travel"){
    body = <React.Fragment>
      <p className="lede">{lede("travel")}</p>
      <a className="btn" style={{width:"100%"}} href="concierge.html">{t("rb.sheet.travel.btn")}</a>
      <PL id="travel" />
      <Partner label={t("rb.sheet.travel.plabel")} name="BUILT Compass" desc={t("rb.sheet.travel.pdesc")} />
    </React.Fragment>;
  } else if(r.id==="body"){
    body = <React.Fragment>
      <p className="lede">{lede("body")}</p>
      <BodyCheck profile={profile} onAdd={onTogglePunch} onOpenDock={onOpenDock} />
      <BodyPlan profile={profile} />
      <PL id="body" />
      <Partner label={t("rb.sheet.body.plabel")} name={t("rb.sheet.body.pname")} desc={t("rb.sheet.body.pdesc")} />
      <div className="vidgrid">
        <div className="vidslot"><span>{t("rb.vid.1")}</span></div>
        <div className="vidslot"><span>{t("rb.vid.2")}</span></div>
        <div className="vidslot"><span>{t("rb.vid.3")}</span></div>
      </div>
      <div className="note">{t("rb.sheet.body.note")}</div>
    </React.Fragment>;
  } else if(r.id==="mind"){
    body = <React.Fragment>
      <p className="lede">{lede("mind")}</p>
      <div className="linkrow"><a className="minilink solid" href="tel:988">{t("rb.call988")}</a><button className="minilink" onClick={onHelp}>{t("rb.mind.all")}</button></div>
      <PL id="mind" />
      <div className="note">{t("rb.sheet.mind.note")}</div>
    </React.Fragment>;
  } else if(r.id==="money"){
    body = <React.Fragment>
      <p className="lede">{lede("money")}</p>
      <MoneyRunway profile={profile} onPatch={onPatch} onAdd={onTogglePunch} />
      <PL id="money" />
      <div className="linkrow"><button className="minilink solid" onClick={onContact}>{t("rb.needthis")}</button><button className="minilink" onClick={onHelp}>{t("rb.helpnow")}</button></div>
      <div className="note">{t("rb.sheet.money.note")}</div>
    </React.Fragment>;
  } else {
    // recovery
    body = <React.Fragment>
      <p className="lede">{lede("recovery")}</p>
      <RecoveryFinders />
      <PL id="recovery" />
      <div className="linkrow"><a className="minilink solid" href="tel:18006624357">SAMHSA · 1-800-662-4357</a><button className="minilink" onClick={onContact}>{t("rb.needthis")}</button></div>
      <div className="note">{t("rb.sheet.recovery.note")}</div>
    </React.Fragment>;
  }
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="sh">
          <div><h2>{P.roomName(r.id)}</h2><div className="drv">{t("rb.sheet.scope")}: {P.roomDriver(r.id, role)}</div></div>
          <button className="closex" onClick={onClose}>×</button>
        </div>
        <div className="sbody">{body}</div>
      </div>
    </div>
  );
}

// ---------- DISCOVERY (scoping the job) ----------
const TRADE_OPTS = ["carp","elec","pipe","iron","lab","op","conc","super","oth"];
const YEARS_OPTS = ["y0","y3","y10","y20"];
const PROJ_OPTS = ["data","mfg","com","ind","infra","res"];
function ChipRow({ opts, prefix, value, onPick }){
  return (
    <div className="chips">
      {opts.map(o=>(
        <button key={o} className={"chip"+(value===o?" on":"")} onClick={()=>onPick(value===o?null:o)}>{t(prefix+o)}</button>
      ))}
    </div>
  );
}
function Discovery({ profile, onDone, onHelp }){
  const [role,setRole] = uS(null); // worker | spouse
  const [travels,setTravels] = uS(null);
  const [trade,setTrade] = uS(null);
  const [yearsIn,setYearsIn] = uS(null);
  const [proj,setProj] = uS(null);
  const wp = { ...profile, builder: role, travels, trade, yearsIn, proj };
  return (
    <div className="discover">
      <div className="app-bg"></div>
      <div className="dwrap">
        {!role ? (
          <div className="dintro">
            <P.Hex size={48} />
            <h1>{t("rb.disc.h1")}</h1>
            <p className="dsub">{t("rb.disc.sub")}</p>
            <div className="choices">
              <button className="choice" onClick={()=>setRole("worker")}>
                <div className="ci">I</div>
                <div><b>{t("rb.disc.worker")}</b><span>{t("rb.disc.workerSub")}</span></div>
              </button>
              <button className="choice" onClick={()=>setRole("spouse")}>
                <div className="ci">♥</div>
                <div><b>{t("rb.disc.spouse")}</b><span>{t("rb.disc.spouseSub")}</span></div>
              </button>
            </div>
          </div>
        ) : (
          <div className="dchat">
            <div className="dchathd">
              <div>
                <div className="dkick">{t("rb.disc.kick")}</div>
                <h1>{t("rb.disc.h2")}</h1>
                <p className="dsub">{t("rb.disc.sub2")}</p>
              </div>
              <button className="btn" onClick={()=>onDone({ builder: role, travels, trade, yearsIn, proj })}>{t("rb.disc.go")}</button>
            </div>
            <div className="fld" style={{margin:"0 0 14px"}}>
              <label>{t(role==="spouse"?"rb.disc.travelQS":"rb.disc.travelQ")}</label>
              <div className="chips">
                <button className={"chip"+(travels===true?" on":"")} onClick={()=>setTravels(true)}>{t("rb.disc.travelYes")}</button>
                <button className={"chip"+(travels===false?" on":"")} onClick={()=>setTravels(false)}>{t("rb.disc.travelNo")}</button>
              </div>
            </div>
            <div className="fld" style={{margin:"0 0 8px"}}>
              <label>{t(role==="spouse"?"rb.disc.tradeQS":"rb.disc.tradeQ")} · {t("rb.disc.opt")}</label>
              <ChipRow opts={TRADE_OPTS} prefix="rb.tr." value={trade} onPick={setTrade} />
            </div>
            <div className="fld" style={{margin:"0 0 8px"}}>
              <label>{t("rb.disc.yearsQ")} · {t("rb.disc.opt")}</label>
              <ChipRow opts={YEARS_OPTS} prefix="rb.yr." value={yearsIn} onPick={setYearsIn} />
            </div>
            <div className="fld" style={{margin:"0 0 6px"}}>
              <label>{t("rb.disc.projQ")} · {t("rb.disc.opt")}</label>
              <ChipRow opts={PROJ_OPTS} prefix="rb.pj." value={proj} onPick={setProj} />
            </div>
            <p className="note" style={{margin:"0 0 14px"}}>{t("rb.disc.workWhy")}</p>
            <Chat profile={wp} />
            <button className="minilink" style={{marginTop:6}} onClick={()=>setRole(null)}>{t("rb.disc.back")}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- THE BUILT PUNCHLIST (best practice, replaces founder chat) ----------
function BuiltList({ onClose, onRoom, role }){
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet foundersheet" onClick={e=>e.stopPropagation()}>
        <div className="sh">
          <div><div className="drv" style={{marginTop:0}}>{t("rb.list.kick")}</div><h2>{t("rb.list.h2")}</h2></div>
          <button className="closex" onClick={onClose}>×</button>
        </div>
        <div className="sbody">
          <p className="lede warm">{t("rb.list.lede")}</p>
          <div className="fsnaplabel">{t("rb.list.label")}</div>
          <div className="fsnap">
            {P.ROOMS.map(room=>{
              const items = P.plItems(room.id, role);
              const tops = items.slice(0,2).map(i=>i.t).join(" · ");
              return (
                <button className="fsnapitem" key={room.id} onClick={()=>onRoom(room.id)}>
                  <div className="fsi"><Ico name={room.id} size={18} /></div>
                  <div className="fsx">
                    <div className="fsr">{P.roomName(room.id)}<span className="fst">{t("rb.list.items",{n:items.length})}</span></div>
                    <p>{tops}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="note">{t("rb.list.note")}</div>
          <button className="btn" style={{width:"100%",marginTop:8}} onClick={onClose}>{t("rb.list.cta")}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- PM SHEET (always one tap away) ----------
function PMSheet({ profile, onClose }){
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="sh">
          <div><h2>{t("rb.pm.sheetTitle")}</h2><div className="drv">{t("rb.pm.sheetSub")}</div></div>
          <button className="closex" onClick={onClose}>×</button>
        </div>
        <div className="sbody"><Chat profile={profile} /></div>
      </div>
    </div>
  );
}

// ---------- HOME (the punchlist board) ----------
function hmDaysAgo(d){ try{ return Math.max(0, Math.floor((Date.now()-new Date(d+"T12:00").getTime())/86400000)); }catch(_){ return 0; } }
function hmAgo(n){ return n<=0?t("rb.dock.agoToday"):(n===1?t("rb.dock.agoDay"):t("rb.dock.agoDays",{n})); }
function hmItemTitle(it, role){ const src = (it.i!=null) ? P.plItems(it.room, role)[it.i] : null; return (src&&src.t)||it.t; }
// the PM strip reads the actual state of the job: stalled item > item in motion > amber gauge > check due > default
function smartPmSub(profile){
  const role = profile.builder;
  const items = Object.values(profile.punch||{});
  const stalled = items.filter(i=>i.status==="todo" && hmDaysAgo(i.added)>=3).sort((a,b)=>hmDaysAgo(b.added)-hmDaysAgo(a.added))[0];
  if(stalled) return t("rb.pm.smart.stalled",{t:hmItemTitle(stalled,role), ago:hmAgo(hmDaysAgo(stalled.added))});
  const doing = items.find(i=>i.status==="doing");
  if(doing) return t("rb.pm.smart.doing",{t:hmItemTitle(doing,role)});
  const last = RebarLevel.lvLast(profile);
  if(last && last.flags && last.flags.length) return t("rb.pm.smart.amber",{g:RebarLevel.lvGaugeName(last.flags[0])});
  if(RebarLevel.lvDue(profile)) return t("rb.pm.smart.due");
  return t("rb.strip.pm.sub");
}
function Home({ profile, onRoom, onHelp, onContact, onList, onPM, onLevel }){
  const hour = new Date().getHours();
  const part = t(hour<12?"rb.greet.morning":hour<17?"rb.greet.afternoon":"rb.greet.evening");
  const name = firstName(profile.name) || "";
  const role = profile.builder;
  const items = Object.values(profile.punch||{});
  const doneN = items.filter(i=>i.status==="done").length;
  const last = RebarLevel.lvLast(profile);
  const due = RebarLevel.lvDue(profile);
  const statBits = [];
  if(items.length) statBits.push(t("rb.stat.list",{n:items.length,d:doneN}));
  statBits.push(due ? t("rb.stat.due") : t("rb.stat.days",{k:Math.max(0,90-hmDaysAgo(last.date))}));
  return (
    <div className="home">
      <div className="app-bg"></div>
      <div className="wrap">
        <div className="greet">
          <h1>{part}{name?(", "+name):""}.</h1>
          <p>{profile.builder==="spouse"
            ? t("rb.home.spouse",{worker:(profile.worker||"")})
            : t("rb.home.worker")}</p>
          <div className="sitestat">{statBits.join(" · ")}</div>
        </div>

        <button className="strip" onClick={onPM} style={{width:"100%",cursor:"pointer",textAlign:"left",marginTop:16,marginBottom:20}}>
          <div className="si" style={{background:"var(--green)",color:"var(--green-ink)",border:"none",fontSize:17}}>PM</div>
          <div className="st"><b>{t("rb.strip.pm.b")}</b><span>{smartPmSub(profile)}</span></div>
          <span className="ar cond" style={{color:"var(--green)",fontSize:22}}>→</span>
        </button>

        <div className="seclabel"><h2>{t("rb.home.h2")}</h2><span>{t("rb.home.h2sub")}</span></div>
        <div className="rooms">
          {P.ROOMS.map(r=>{
            const feat = r.id==="people"||(r.id==="travel"&&profile.travels!==false);
            const badge = r.status==="open"?"open":r.status==="partner"?"partner":"soon";
            const mine = Object.values(profile.punch||{}).filter(p=>p.room===r.id);
            const mdone = mine.filter(p=>p.status==="done").length;
            return (
              <button className={"room s3"+(feat?" feat":"")} key={r.id} onClick={()=>onRoom(r.id)}>
                <div className="rtop"><div className="ri"><Ico name={r.id} size={feat?24:22} /></div><span className={"badge "+badge}>{t("rb.badge."+badge)}</span></div>
                <h3>{P.roomName(r.id)}</h3>
                <p>{P.roomLine(r.id, role)}</p>
                <div className="rfoot">{mine.length>0
                  ? <React.Fragment>{t("rb.home.onlist",{d:mdone,n:mine.length})}</React.Fragment>
                  : <React.Fragment>{t("rb.home.scope")}: <b>{P.roomDriver(r.id, role)}</b></React.Fragment>}</div>
              </button>
            );
          })}
        </div>

        <RebarLevel.LevelStrip profile={profile} onOpen={onLevel} />

        <div className="pulsecard" style={{marginTop:24}}>
          <div className="pq">{t("rb.retreat.b")}</div>
          <p className="psub" style={{maxWidth:"72ch",fontSize:14.5,lineHeight:1.55,marginBottom:18}}>{t("rb.retreat.sub")}</p>
          <a className="btn" href={P.FUND.apply} onClick={e=>P.openExt(e,P.FUND.apply)}>{t("rb.retreat.cta")} →</a>
        </div>
      </div>

      <div className="fund">
        <div className="wrap in">
          <div>
            <img src="assets/built-logo-light.png" alt="Project BUILT" />
            <h3>{t("rb.fund.h3")}</h3>
            <p>{t("rb.fund.p")}</p>
            <div className="tl">{t("rb.fund.tl")}</div>
          </div>
          <div className="acts">
            <a className="primary" href={P.FUND.donate} onClick={e=>P.openExt(e,P.FUND.donate)}><span><b>{t("rb.fund.donate")}</b><span>givebutter.com/ProjectBUILT</span></span><span className="ar">→</span></a>
            <a href={P.FUND.volunteer} onClick={e=>P.openExt(e,P.FUND.volunteer)}><span><b>{t("rb.fund.vol")}</b><span>getbuilt.org/volunteer</span></span><span className="ar">→</span></a>
            <a href={P.FUND.site} onClick={e=>P.openExt(e,P.FUND.site)}><span><b>{t("rb.fund.person")}</b><span>{t("rb.fund.personSub")}</span></span><span className="ar">→</span></a>
          </div>
        </div>
      </div>
      <div className="foot">{t("rb.foot")}<br/>{t("rb.foot2")}</div>
    </div>
  );
}

// ---------- TWEAKS: expressive feel controls ----------
// palette = accent identity (recolors every hex, glow, border, button).
// surface = cut-steel ↔ milled/soft. charge = how hot the accent burns.
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#6dd441","#7ee84d","#4ea52d"],
  "surface": "raw",
  "charge": "steady"
}/*EDITMODE-END*/;
// on-accent ink (dark text that sits on a filled accent button), keyed by hero hex
const PAL_INK = { "#6dd441":"#0c1a06", "#ff9a34":"#231001", "#4fb3ff":"#04121f", "#ff5f4d":"#210603" };
const PAL_OPTS = [
  ["#6dd441","#7ee84d","#4ea52d"],  // Safety green
  ["#ff9a34","#ffb257","#d97016"],  // Hi-vis amber
  ["#4fb3ff","#79c6ff","#2b82d8"],  // Steel blue
  ["#ff5f4d","#ff8070","#d63a29"]   // Torch
];

function Tweaks({ t:tw, setTweak }){
  uE(()=>{ const r=document.documentElement.style; const [b,g2,deep]=tw.palette||PAL_OPTS[0];
    r.setProperty("--green",b); r.setProperty("--green-2",g2); r.setProperty("--green-deep",deep);
    r.setProperty("--green-ink", PAL_INK[b]||"#0c1a06"); }, [tw.palette]);
  uE(()=>{ document.documentElement.dataset.surface = tw.surface||"raw"; }, [tw.surface]);
  uE(()=>{ document.documentElement.dataset.charge = tw.charge||"steady"; }, [tw.charge]);
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Site palette" />
      <TweakColor label="Accent" value={tw.palette} options={PAL_OPTS}
                  onChange={v=>setTweak("palette",v)} />
      <TweakSection label="Surface" />
      <TweakRadio label="Finish" value={tw.surface}
                  options={[{value:"raw",label:"Raw steel"},{value:"soft",label:"Softened"}]}
                  onChange={v=>setTweak("surface",v)} />
      <TweakSection label="Charge" />
      <TweakRadio label="Energy" value={tw.charge}
                  options={[{value:"calm",label:"Calm"},{value:"steady",label:"Steady"},{value:"charged",label:"Charged"}]}
                  onChange={v=>setTweak("charge",v)} />
    </TweaksPanel>
  );
}

// ---------- APP ----------
function todayStr(){ return new Date().toISOString().slice(0,10); }
function App(){
  window.useLang(); // re-render everything on language change
  const [tw,setTweak] = useTweaks(TWEAK_DEFAULTS);
  const saved = P.load();
  const isAuthed = !!(saved && saved.email);
  const [profile,setProfile] = uS(saved);
  const [stage,setStage] = uS(
    !isAuthed ? "auth"
    : (!saved.builder ? "mood" : (saved.pulseDate!==todayStr() ? "mood" : "home"))
  );
  const [room,setRoom] = uS(null);
  const [crisis,setCrisis] = uS(false);
  const [showList,setShowList] = uS(false);
  const [dock,setDock] = uS(false);
  const [pm,setPm] = uS(false);
  const [level,setLevel] = uS(false);
  const autoDock = React.useRef(false);

  // Returning users with a live list land on their scorecard.
  uE(()=>{
    if(stage==="home" && !autoDock.current && profile && profile.punch && Object.keys(profile.punch).length){
      autoDock.current = true;
      let seen = false;
      try{ seen = sessionStorage.getItem("rebar:dock-auto")==="1"; }catch(_){}
      if(!seen){ setDock(true); try{ sessionStorage.setItem("rebar:dock-auto","1"); }catch(_){} }
    }
  },[stage, profile]);

  // ---- live punchlist ops (persisted with the profile) ----
  function togglePunch(roomId, idx){
    const items = {...((profile&&profile.punch)||{})};
    const key = roomId+":"+idx;
    if(items[key]){ delete items[key]; }
    else {
      if(idx==null || idx<0 || idx>=(P.PL_COUNT[roomId]||0)) return;
      const src = P.plItems(roomId, profile&&profile.builder)[idx];
      items[key] = { key, room:roomId, i:idx, t:src.t, d:src.d, tag:src.tag, status:"todo", added:todayStr() };
    }
    const np = {...profile, punch:items}; setProfile(np); P.save(np);
  }
  function patchPunch(key, patch){
    const items = {...((profile&&profile.punch)||{})};
    if(!items[key]) return;
    items[key] = {...items[key], ...patch};
    const np = {...profile, punch:items}; setProfile(np); P.save(np);
  }
  function removePunch(key){
    const items = {...((profile&&profile.punch)||{})};
    delete items[key];
    const np = {...profile, punch:items}; setProfile(np); P.save(np);
  }

  function authed(a){ const np={...a}; setProfile(np); P.save(np); setStage("mood"); }
  function patchProfile(patch){ const np={...profile, ...patch}; setProfile(np); P.save(np); }
  function saveLevel(rec){ const levels=[...((profile&&profile.levels)||[]), rec]; const np={...profile, levels}; setProfile(np); P.save(np); }
  function doneMood(k){ const np={...profile, mood:k, pulseDate:todayStr()}; setProfile(np); P.save(np); setStage(np.builder ? "home" : "discovery"); }
  function doneDiscovery(patch){ const np={...profile, ...patch}; setProfile(np); P.save(np); setStage("home"); }
  function reset(){ try{localStorage.removeItem("rebar:v2");}catch(_){} setProfile(null); setRoom(null); setShowList(false); setDock(false); setPm(false); setLevel(false); setStage("auth"); }
  function contact(){ P.openExt(null,"https://getbuilt.org/"); }

  const roomObj = room ? P.ROOMS.find(r=>r.id===room) : null;
  const punchCount = Object.keys((profile&&profile.punch)||{}).length;

  return (
    <div>
      <P.Header onHelp={()=>setCrisis(true)} onReset={reset} showReset={stage==="home"}
                onPM={stage==="home" ? ()=>setPm(true) : null}
                onPunch={stage==="home" ? ()=>setDock(true) : null} punchCount={punchCount} />
      {stage==="auth" && <P.Auth onAuthed={authed} />}
      {stage==="mood" && profile && <Mood profile={profile} onDone={doneMood} onHelp={()=>setCrisis(true)} />}
      {stage==="discovery" && profile && <Discovery profile={profile} onDone={doneDiscovery} onHelp={()=>setCrisis(true)} />}
      {stage==="home" && profile && <Home profile={profile} onRoom={setRoom} onHelp={()=>setCrisis(true)} onContact={contact} onList={()=>setShowList(true)} onPM={()=>setPm(true)} onLevel={()=>setLevel(true)} />}
      {roomObj && <RoomSheet room={roomObj} profile={profile} onClose={()=>setRoom(null)} onHelp={()=>{setRoom(null);setCrisis(true);}} onContact={()=>{setRoom(null);contact();}} onTogglePunch={togglePunch} onOpenDock={()=>{setRoom(null);setDock(true);}} onPatch={patchProfile} />}
      {showList && <BuiltList onClose={()=>setShowList(false)} onRoom={id=>{setShowList(false);setRoom(id);}} role={profile&&profile.builder} />}
      {pm && profile && <PMSheet profile={profile} onClose={()=>setPm(false)} />}
      {level && profile && <RebarLevel.LevelCheck profile={profile} onClose={()=>setLevel(false)} onSave={saveLevel} onAdd={togglePunch} onHelp={()=>setCrisis(true)} />}
      {dock && stage==="home" && <RebarPunch.PunchDock profile={profile} Chat={Chat}
        onClose={()=>setDock(false)} onStatus={patchPunch} onRemove={removePunch}
        onBrowse={()=>{setDock(false);setShowList(true);}} />}
      {crisis && <P.Crisis onClose={()=>setCrisis(false)} />}
      <Tweaks t={tw} setTweak={setTweak} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
