/* ============================================================
   REBAR — Level Check: the quarterly gauges.
   Peer-reviewed short-form instruments, verbatim items, jobsite
   framing. Instruments (see "Rebar Measurement Plan.html"):
     WHO-5 Well-Being Index · PHQ-2 · GAD-2 · UCLA Loneliness-3 ·
     BRFSS sleep-hours item · FINRA NFCS $2,000 item · AUDIT-C.
   Results are scored with published cutoffs; each amber gauge
   maps to a concrete punchlist fix. Stored on the profile as
   profile.levels[] so change can be tracked over time.
   depends on window.RebarParts (os-app.jsx).
   ============================================================ */
const PLV = window.RebarParts;
const { useState: lvS, useEffect: lvE, useRef: lvR } = React;

const LVTEXT = {
  en: {
    b: "Level check", kick: "Your gauges · every 3 months",
    subDue: "Ten minutes of straight questions, the same standard ones researchers use, so you can read your own gauges.",
    subDone: "Last read {date}. Next check in about {d} days.",
    ctaDue: "Read my gauges →", ctaAgain: "Run it early →",
    introH: "Read your gauges",
    intro1: "Ten minutes. Straight questions, word for word the same standard questions researchers use. That's what makes the reading mean something.",
    intro2: "Answer honestly. Nobody from your job sees this, and your answers stay in your account. Project BUILT only ever sees combined, anonymous numbers, never your name.",
    start: "Start the check", later: "Not now",
    progress: "{a} of {b} answered",
    secWell: "How you've been", secWellSub: "Over the last two weeks…",
    secMood: "The heavy stuff", secMoodSub: "Over the last two weeks, how often have you been bothered by the following?",
    secConn: "Your people", secConnSub: "Straight questions about connection.",
    secSleep: "Sleep", secSleepSub: "One question.",
    secMoney: "Money", secMoneySub: "One question.",
    secDrink: "Drinking", secDrinkSub: "Optional. Skip it if you want, no judgment either way.",
    skip: "Skip this section", next: "Next →", finish: "See my gauges →",
    resultsH: "Your gauges", resultsSub: "Green is holding. Amber is worth a look, and every amber has a move.",
    ok: "Holding", flag: "Worth a look",
    addFix: "+ Put the fix on my list", onList: "✓ On my list",
    crisis: "If the dark days are heavy right now, don't sit on it. Call or text 988. It's free, any hour.",
    call988: "Call or text 988",
    saved: "Saved to your record. Next check in about 3 months. You'll see the trend.",
    close: "Done",
    skipped: "Skipped. That's fine.",
    gWell: "How you've been", gMood: "The dark days", gWorry: "The worry", gConn: "Your people",
    gSleep: "Sleep", gMoney: "The cushion", gDrink: "Drinking",
    secWork: "The work", secWorkSub: "Optional, and it matters: combined and anonymous, these two answers are how we prove that taking care of workers delivers projects. Your employer never sees this.",
    trendH: "The trend", trendBtn: "See the trend →", trendSub: "Same standard questions, every quarter. This is you, over time.",
    trendSpan: "{a} → {b} · {n} reads", back: "Back",
    rWellOk: "Your overall wellbeing is holding.", rWellFlag: "Running lower than it should. Worth working the purpose and people scopes.",
    rMoodOk: "Holding steady.", rMoodFlag: "This reading says the load is real. Talking to a pro is maintenance, not weakness.",
    rWorryOk: "Holding steady.", rWorryFlag: "The worry is running hot. Name your warning signs and catch it early.",
    rConnOk: "You've got people.", rConnFlag: "Reading lonelier than it should. One real connection changes this number.",
    rSleepOk: "You're getting what the body needs.", rSleepFlag: "Under 7 hours, and the body can't rebuild on that. Protect the window.",
    rMoneyOk: "You could take a hit and stay standing.", rMoneyFlag: "A surprise expense would hurt. The cushion is the fix.",
    rDrinkOk: "Nothing flagging here.", rDrinkFlag: "This reading is worth an honest look. No judgment, just a plan.",
    hrs: "hrs"
  },
  es: {
    b: "Chequeo de nivel", kick: "Tus medidores · cada 3 meses",
    subDue: "Diez minutos de preguntas directas, las mismas preguntas estándar que usan los investigadores, para que leas tus propios medidores.",
    subDone: "Última lectura {date}. Próximo chequeo en unos {d} días.",
    ctaDue: "Leer mis medidores →", ctaAgain: "Correrlo antes →",
    introH: "Lee tus medidores",
    intro1: "Diez minutos. Preguntas directas, palabra por palabra las mismas preguntas estándar que usan los investigadores. Eso es lo que hace que la lectura signifique algo.",
    intro2: "Contesta con honestidad. Nadie de tu trabajo ve esto, y tus respuestas quedan en tu cuenta. Project BUILT solo ve números combinados y anónimos, nunca tu nombre.",
    start: "Empezar el chequeo", later: "Ahora no",
    progress: "{a} de {b} contestadas",
    secWell: "Cómo has estado", secWellSub: "En las últimas dos semanas…",
    secMood: "Lo pesado", secMoodSub: "Durante las últimas dos semanas, ¿con qué frecuencia le han molestado los siguientes problemas?",
    secConn: "Tu gente", secConnSub: "Preguntas directas sobre conexión.",
    secSleep: "Sueño", secSleepSub: "Una pregunta.",
    secMoney: "Dinero", secMoneySub: "Una pregunta.",
    secDrink: "Alcohol", secDrinkSub: "Opcional. Sáltala si quieres, sin juicios de ninguna forma.",
    skip: "Saltar esta sección", next: "Siguiente →", finish: "Ver mis medidores →",
    resultsH: "Tus medidores", resultsSub: "Verde aguanta. Ámbar merece una mirada, y cada ámbar tiene un paso.",
    ok: "Aguantando", flag: "Merece una mirada",
    addFix: "+ Poner el arreglo en mi lista", onList: "✓ En mi lista",
    crisis: "Si los días oscuros pesan ahora mismo, no lo cargues solo. Llama o textea al 988. Es gratis, a toda hora.",
    call988: "Llama o textea al 988",
    saved: "Guardado en tu registro. Próximo chequeo en unos 3 meses. Vas a ver la tendencia.",
    close: "Listo",
    skipped: "Saltada. Está bien.",
    gWell: "Cómo has estado", gMood: "Los días oscuros", gWorry: "La preocupación", gConn: "Tu gente",
    gSleep: "Sueño", gMoney: "El colchón", gDrink: "Alcohol",
    secWork: "El trabajo", secWorkSub: "Opcional, y cuenta: combinadas y anónimas, estas dos respuestas son como probamos que cuidar al trabajador entrega proyectos. Tu empleador nunca ve esto.",
    trendH: "La tendencia", trendBtn: "Ver la tendencia →", trendSub: "Las mismas preguntas estándar, cada trimestre. Este eres tú, con el tiempo.",
    trendSpan: "{a} → {b} · {n} lecturas", back: "Volver",
    rWellOk: "Tu bienestar general aguanta.", rWellFlag: "Anda más bajo de lo que debería. Vale trabajar los frentes de propósito y gente.",
    rMoodOk: "Aguantando firme.", rMoodFlag: "Esta lectura dice que la carga es real. Hablar con un profesional es mantenimiento, no debilidad.",
    rWorryOk: "Aguantando firme.", rWorryFlag: "La preocupación anda caliente. Nombra tus señales y atrápala temprano.",
    rConnOk: "Tienes gente.", rConnFlag: "Marca más solo de lo que debería. Una conexión real cambia este número.",
    rSleepOk: "Le das al cuerpo lo que necesita.", rSleepFlag: "Menos de 7 horas, y el cuerpo no se reconstruye con eso. Protege la ventana.",
    rMoneyOk: "Aguantarías un golpe y seguirías de pie.", rMoneyFlag: "Un gasto sorpresa dolería. El colchón es el arreglo.",
    rDrinkOk: "Nada marcando aquí.", rDrinkFlag: "Esta lectura merece una mirada honesta. Sin juicios, solo un plan.",
    hrs: "hrs"
  }
};
function lvLang(){ return (window.I18N && window.I18N.lang === "es") ? "es" : "en"; }
function lt(k, v){ let s = (LVTEXT[lvLang()][k] != null ? LVTEXT[lvLang()][k] : LVTEXT.en[k]) || k;
  if (v) Object.keys(v).forEach(x => { s = s.split("{"+x+"}").join(String(v[x])); }); return s; }

/* ---- verbatim instrument items (validated ES translations) ---- */
const LOPTS = {
  who5: { en: [["All of the time",5],["Most of the time",4],["More than half of the time",3],["Less than half of the time",2],["Some of the time",1],["At no time",0]],
          es: [["Todo el tiempo",5],["La mayor parte del tiempo",4],["Más de la mitad del tiempo",3],["Menos de la mitad del tiempo",2],["De vez en cuando",1],["Nunca",0]] },
  phq:  { en: [["Not at all",0],["Several days",1],["More than half the days",2],["Nearly every day",3]],
          es: [["Ningún día",0],["Varios días",1],["Más de la mitad de los días",2],["Casi todos los días",3]] },
  ucla: { en: [["Hardly ever",1],["Some of the time",2],["Often",3]],
          es: [["Casi nunca",1],["A veces",2],["Con frecuencia",3]] },
  sleep:{ en: [["Less than 5",4],["5",5],["6",6],["7",7],["8",8],["9 or more",9]],
          es: [["Menos de 5",4],["5",5],["6",6],["7",7],["8",8],["9 o más",9]] },
  money:{ en: [["I'm certain I could",0],["I could probably",1],["I probably could not",2],["I'm certain I could not",3]],
          es: [["Estoy seguro de que podría",0],["Probablemente podría",1],["Probablemente no podría",2],["Estoy seguro de que no podría",3]] },
  a1:   { en: [["Never",0],["Monthly or less",1],["2–4 times a month",2],["2–3 times a week",3],["4+ times a week",4]],
          es: [["Nunca",0],["Una vez al mes o menos",1],["2–4 veces al mes",2],["2–3 veces por semana",3],["4+ veces por semana",4]] },
  a2:   { en: [["1–2",0],["3–4",1],["5–6",2],["7–9",3],["10 or more",4]],
          es: [["1–2",0],["3–4",1],["5–6",2],["7–9",3],["10 o más",4]] },
  a3:   { en: [["Never",0],["Less than monthly",1],["Monthly",2],["Weekly",3],["Daily or almost daily",4]],
          es: [["Nunca",0],["Menos de una vez al mes",1],["Cada mes",2],["Cada semana",3],["A diario o casi a diario",4]] },
  days: { en: [["0",0],["1",1],["2",2],["3–5",4],["6 or more",6]],
          es: [["0",0],["1",1],["2",2],["3–5",4],["6 o más",6]] },
  yn:   { en: [["Yes",1],["No",0]],
          es: [["Sí",1],["No",0]] }
};
const LSECTIONS = [
  { id:"well", inst:"WHO-5", h:"secWell", sub:"secWellSub", items:[
    { id:"w1", opts:"who5", en:"I have felt cheerful and in good spirits", es:"Me he sentido alegre y de buen ánimo" },
    { id:"w2", opts:"who5", en:"I have felt calm and relaxed", es:"Me he sentido tranquilo y relajado" },
    { id:"w3", opts:"who5", en:"I have felt active and vigorous", es:"Me he sentido activo y enérgico" },
    { id:"w4", opts:"who5", en:"I woke up feeling fresh and rested", es:"Me he despertado sintiéndome fresco y descansado" },
    { id:"w5", opts:"who5", en:"My daily life has been filled with things that interest me", es:"Mi vida diaria ha estado llena de cosas que me interesan" }
  ]},
  { id:"mood", inst:"PHQ-2 · GAD-2", h:"secMood", sub:"secMoodSub", items:[
    { id:"p1", opts:"phq", en:"Little interest or pleasure in doing things", es:"Poco interés o placer en hacer las cosas" },
    { id:"p2", opts:"phq", en:"Feeling down, depressed, or hopeless", es:"Sentirse decaído(a), deprimido(a) o sin esperanzas" },
    { id:"g1", opts:"phq", en:"Feeling nervous, anxious, or on edge", es:"Sentirse nervioso(a), ansioso(a) o con los nervios de punta" },
    { id:"g2", opts:"phq", en:"Not being able to stop or control worrying", es:"No poder dejar de preocuparse o controlar la preocupación" }
  ]},
  { id:"conn", inst:"UCLA-3", h:"secConn", sub:"secConnSub", items:[
    { id:"u1", opts:"ucla", en:"How often do you feel that you lack companionship?", es:"¿Con qué frecuencia siente que le falta compañía?" },
    { id:"u2", opts:"ucla", en:"How often do you feel left out?", es:"¿Con qué frecuencia se siente excluido(a)?" },
    { id:"u3", opts:"ucla", en:"How often do you feel isolated from others?", es:"¿Con qué frecuencia se siente aislado(a) de los demás?" }
  ]},
  { id:"sleep", inst:"BRFSS", h:"secSleep", sub:"secSleepSub", items:[
    { id:"s1", opts:"sleep", en:"On average, how many hours of sleep do you get in a 24-hour period?", es:"En promedio, ¿cuántas horas duerme en un período de 24 horas?" }
  ]},
  { id:"money", inst:"FINRA NFCS", h:"secMoney", sub:"secMoneySub", items:[
    { id:"m1", opts:"money", en:"How confident are you that you could come up with $2,000 if an unexpected need arose within the next month?", es:"¿Qué tan seguro está de que podría conseguir $2,000 si surgiera una necesidad inesperada durante el próximo mes?" }
  ]},
  { id:"work", inst:"Rebar", h:"secWork", sub:"secWorkSub", optional:true, workerOnly:true, items:[
    { id:"k1", opts:"days", en:"In the last month, how many full workdays did you miss because of how you were feeling, in body or in head?", es:"En el último mes, ¿cuántos días completos de trabajo faltaste por cómo te sentías, del cuerpo o de la cabeza?" },
    { id:"k2", opts:"yn", en:"In the last month, did you have a close call or near miss on the job?", es:"En el último mes, ¿tuviste un susto o casi-accidente en el trabajo?" }
  ]},
  { id:"drink", inst:"AUDIT-C", h:"secDrink", sub:"secDrinkSub", optional:true, items:[
    { id:"a1", opts:"a1", en:"How often do you have a drink containing alcohol?", es:"¿Con qué frecuencia toma alguna bebida que contenga alcohol?" },
    { id:"a2", opts:"a2", en:"How many standard drinks do you have on a typical day when you are drinking?", es:"¿Cuántas bebidas estándar toma en un día típico cuando bebe?" },
    { id:"a3", opts:"a3", en:"How often do you have six or more drinks on one occasion?", es:"¿Con qué frecuencia toma seis o más bebidas en una sola ocasión?" }
  ]}
];
const LV_TOTAL = LSECTIONS.reduce((n,s)=>n+s.items.length,0);

function lvScore(ans, skippedDrink){
  const g = id => ans[id] != null ? ans[id] : 0;
  const who5 = (g("w1")+g("w2")+g("w3")+g("w4")+g("w5"))*4;
  const phq2 = g("p1")+g("p2"), gad2 = g("g1")+g("g2");
  const ucla3 = g("u1")+g("u2")+g("u3");
  const sleep = ans.s1 != null ? ans.s1 : null;
  const money = ans.m1 != null ? ans.m1 : null;
  const audit = skippedDrink ? null : g("a1")+g("a2")+g("a3");
  return {
    who5, phq2, gad2, ucla3, sleep, money, audit,
    flags: {
      well: who5 <= 50, mood: phq2 >= 3, worry: gad2 >= 3, conn: ucla3 >= 6,
      sleep: sleep != null && sleep < 7, money: money != null && money >= 2,
      drink: audit != null && audit >= 3
    }
  };
}
/* per-role punchlist fix for each amber gauge: [roomId, itemIndex] */
const LV_FIX = {
  well:  { worker:["people",1], spouse:["mind",2] },
  mood:  { worker:["mind",3],  spouse:["mind",1] },
  worry: { worker:["mind",2],  spouse:["mind",3] },
  conn:  { worker:["people",2],spouse:["people",2] },
  sleep: { worker:["body",0],  spouse:["body",2] },
  money: { worker:["money",0], spouse:["money",2] },
  drink: { worker:["recovery",1], spouse:["recovery",1] }
};

function lvDaysSince(dateStr){ try{ return Math.floor((Date.now()-new Date(dateStr+"T12:00").getTime())/86400000); }catch(_){ return 9999; } }
function lvLast(profile){ const a=(profile&&profile.levels)||[]; return a.length?a[a.length-1]:null; }
function lvDue(profile){ const last=lvLast(profile); return !last || lvDaysSince(last.date)>=90; }
const LV_FLAG_LABEL = { well:"gWell", mood:"gMood", worry:"gWorry", conn:"gConn", sleep:"gSleep", money:"gMoney", drink:"gDrink" };
function lvGaugeName(flag){ return lt(LV_FLAG_LABEL[flag]||flag); }

/* ---- the trend: same gauges, over time ---- */
const LV_METRICS = [
  { k:"who5", g:"gWell", lo:0, hi:100, goodHigh:true,  flag:v=>v<=50, fmt:v=>v+"/100" },
  { k:"phq2", g:"gMood", lo:0, hi:6,  goodHigh:false, flag:v=>v>=3,  fmt:v=>v+"/6" },
  { k:"gad2", g:"gWorry",lo:0, hi:6,  goodHigh:false, flag:v=>v>=3,  fmt:v=>v+"/6" },
  { k:"ucla3",g:"gConn", lo:3, hi:9,  goodHigh:false, flag:v=>v>=6,  fmt:v=>v+"/9" },
  { k:"sleep",g:"gSleep",lo:4, hi:9,  goodHigh:true,  flag:v=>v<7,   fmt:v=>v+" "+lt("hrs") },
  { k:"money",g:"gMoney",lo:0, hi:3,  goodHigh:true,  inv:3,  flag:v=>v<=1,  fmt:v=>v+"/3" },
  { k:"audit",g:"gDrink",lo:0, hi:12, goodHigh:false, flag:v=>v>=3,  fmt:v=>v+"/12" }
];
function mval(m, r){ const v = r[m.k]; return v==null ? null : (m.inv!=null ? m.inv-v : v); }
function LvSpark({ recs, m }){
  const W=110,H=26,pad=4,n=recs.length;
  const pts = recs.map((r,i)=>({i, v:mval(m,r)})).filter(p=>p.v!=null);
  if(!pts.length) return <svg width={W} height={H}></svg>;
  const x = i => n<=1 ? W/2 : pad + i/(n-1)*(W-2*pad);
  const y = v => H-pad - Math.max(0,Math.min(1,(v-m.lo)/(m.hi-m.lo)))*(H-2*pad);
  return (
    <svg width={W} height={H} style={{flex:"none"}}>
      {pts.length>1 && <polyline points={pts.map(p=>x(p.i)+","+y(p.v)).join(" ")} fill="none" stroke="var(--line-2)" strokeWidth="1.5" />}
      {pts.map(p=>(<circle key={p.i} cx={x(p.i)} cy={y(p.v)} r="3" fill={m.flag(p.v)?"var(--amber)":"var(--green)"} />))}
    </svg>
  );
}
function lvDelta(m, recs){
  const vals = recs.map(r=>mval(m,r)).filter(v=>v!=null);
  if(vals.length<2) return null;
  const d = vals[vals.length-1]-vals[vals.length-2];
  if(d===0) return { s:"—", cls:"flat" };
  const good = m.goodHigh ? d>0 : d<0;
  return { s:(d>0?"▲":"▼")+Math.abs(d), cls:(good?"good":"bad") };
}
function LevelTrend({ profile }){
  const recs = ((profile&&profile.levels)||[]).slice(-6);
  if(!recs.length) return null;
  return (
    <div>
      <p className="lede" style={{color:"var(--muted)",fontSize:14}}>{lt("trendSub")}</p>
      <div className="fsnaplabel" style={{marginTop:0}}>{lt("trendSpan",{a:recs[0].date, b:recs[recs.length-1].date, n:recs.length})}</div>
      {LV_METRICS.map(m=>{
        const vals = recs.map(r=>mval(m,r)).filter(v=>v!=null);
        if(!vals.length) return null;
        const d = lvDelta(m, recs);
        return (
          <div className="trow" key={m.k}>
            <b>{lt(m.g)}</b>
            <LvSpark recs={recs} m={m} />
            <span className="tv">{m.fmt(vals[vals.length-1])}</span>
            {d && <span className={"td "+d.cls}>{d.s}</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ---- home entry point ---- */
function LevelStrip({ profile, onOpen }){
  const last = lvLast(profile);
  const due = lvDue(profile);
  return (
    <button className="strip" onClick={onOpen} style={{width:"100%",cursor:"pointer",textAlign:"left"}}>
      <div className="si">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
          <path d="M4 15a8 8 0 0 1 16 0"/><line x1="12" y1="15" x2="16" y2="9"/><circle cx="12" cy="15" r="1.6"/>
        </svg>
      </div>
      <div className="st">
        <b>{lt("b")}</b>
        <span>{due ? lt("subDue") : lt("subDone",{date:last.date, d:Math.max(0,90-lvDaysSince(last.date))})}</span>
      </div>
      <span className="ar cond" style={{color:"var(--green)",fontSize:16,fontWeight:700,textTransform:"uppercase",letterSpacing:".04em",flex:"none"}}>{due?lt("ctaDue"):lt("ctaAgain")}</span>
    </button>
  );
}

/* ---- the check overlay ---- */
function LevelCheck({ profile, onClose, onSave, onAdd, onHelp }){
  const [stage,setStage] = lvS(-1); // -1 intro · 0..sections · 99 results · 100 trend
  const [ans,setAns] = lvS({});
  const [skipped,setSkipped] = lvS({});
  const savedRef = lvR(false);
  const prevRef = lvR(lvLast(profile)); // the read BEFORE this run, for deltas
  const role = (profile && profile.builder)==="spouse" ? "spouse" : "worker";
  const SECS = role==="spouse" ? LSECTIONS.filter(s=>!s.workerOnly) : LSECTIONS;
  const total = SECS.reduce((n,s)=>n+s.items.length,0);
  const hasHist = ((profile&&profile.levels)||[]).length>0;
  const answered = Object.keys(ans).length;
  const res = stage===99 ? lvScore(ans, !!skipped.drink) : null;

  lvE(()=>{
    if(stage===99 && !savedRef.current && res){
      savedRef.current = true;
      const flags = Object.keys(res.flags).filter(k=>res.flags[k]);
      onSave({ date:new Date().toISOString().slice(0,10), who5:res.who5, phq2:res.phq2, gad2:res.gad2,
               ucla3:res.ucla3, sleep:res.sleep, money:res.money, audit:res.audit, flags,
               missed:(ans.k1!=null?ans.k1:null), near:(ans.k2!=null?ans.k2:null),
               trade:profile.trade||null, yearsIn:profile.yearsIn||null, proj:profile.proj||null });
    }
  },[stage]);

  function pick(id,v){ setAns(a=>({...a,[id]:v})); }
  function nextFrom(i){
    if(i+1 < SECS.length) setStage(i+1); else setStage(99);
  }
  function skipSec(sec, i){ setSkipped(s=>({...s,[sec.id]:true})); nextFrom(i); }

  const punch = (profile&&profile.punch)||{};
  function FixBtn({ gauge }){
    const fx = LV_FIX[gauge] && LV_FIX[gauge][role]; if(!fx) return null;
    const key = fx[0]+":"+fx[1];
    const on = !!punch[key];
    return <button className={"pladd"+(on?" on":"")} style={{marginLeft:0,marginTop:8}} disabled={on}
      onClick={()=>{ if(!on) onAdd(fx[0], fx[1]); }}>{on?lt("onList"):lt("addFix")}</button>;
  }
  function Gauge({ id, label, ok, value, okText, flagText, dlt, children }){
    return (
      <div className="gaugerow">
        <span className="gd" style={{background: ok ? "var(--green)" : "var(--amber)"}}></span>
        <div style={{flex:1,minWidth:0}}>
          <b>{lt(label)}</b>
          <p>{ok ? lt(okText) : lt(flagText)}</p>
          {!ok && <FixBtn gauge={id} />}
          {children}
        </div>
        <span className="gs">{value}{dlt && <span className={"td "+dlt.cls} style={{marginLeft:6}}>{dlt.s}</span>}</span>
      </div>
    );
  }
  const prevRec = prevRef.current;
  function gdlt(mk){
    if(!prevRec || !res || prevRec[mk]==null || res[mk]==null) return null;
    const m = LV_METRICS.find(x=>x.k===mk);
    const d = mval(m,res)-mval(m,prevRec);
    if(d===0) return { s:"—", cls:"flat" };
    const good = m.goodHigh ? d>0 : d<0;
    return { s:(d>0?"▲":"▼")+Math.abs(d), cls:(good?"good":"bad") };
  }

  let body;
  if(stage===-1){
    body = (
      <div className="sbody">
        <p className="lede warm">{lt("intro1")}</p>
        <p className="lede" style={{color:"var(--muted)",fontSize:14}}>{lt("intro2")}</p>
        <button className="btn" style={{width:"100%"}} onClick={()=>setStage(0)}>{lt("start")}</button>
        {hasHist && <button className="btn line" style={{width:"100%",marginTop:9}} onClick={()=>setStage(100)}>{lt("trendBtn")}</button>}
        <button className="authback" style={{width:"100%",marginTop:6}} onClick={onClose}>{lt("later")}</button>
      </div>
    );
  } else if(stage>=0 && stage<SECS.length){
    const sec = SECS[stage];
    const lang = lvLang();
    const done = sec.items.every(it=>ans[it.id]!=null);
    body = (
      <div className="sbody lvlsec">
        <div className="fsnaplabel" style={{marginTop:4}}>{lt(sec.h)} <span style={{color:"var(--muted-2)"}}>· {sec.inst}</span></div>
        <p className="lede" style={{color:"var(--muted)",fontSize:14,margin:"0 0 4px"}}>{lt(sec.sub)}</p>
        {sec.items.map(it=>(
          <div key={it.id}>
            <div className="lvlq">{it[lang]||it.en}</div>
            <div className="lvlopts">
              {LOPTS[it.opts][lang].map(([l,v])=>(
                <button key={l} className={"chip"+(ans[it.id]===v?" on":"")} onClick={()=>pick(it.id,v)}>{l}</button>
              ))}
            </div>
          </div>
        ))}
        <div style={{display:"flex",gap:9,marginTop:20}}>
          {sec.optional && <button className="btn line" style={{flex:1}} onClick={()=>skipSec(sec,stage)}>{lt("skip")}</button>}
          <button className="btn" style={{flex:2}} disabled={!done} onClick={()=>nextFrom(stage)}>
            {stage===SECS.length-1 ? lt("finish") : lt("next")}
          </button>
        </div>
      </div>
    );
  } else if(stage===100){
    body = (
      <div className="sbody">
        <LevelTrend profile={profile} />
        <button className="btn" style={{width:"100%",marginTop:12}} onClick={onClose}>{lt("close")}</button>
      </div>
    );
  } else {
    const f = res.flags;
    body = (
      <div className="sbody">
        <p className="lede" style={{color:"var(--muted)",fontSize:14}}>{lt("resultsSub")}</p>
        <Gauge id="well" label="gWell" ok={!f.well} value={res.who5+"/100"} dlt={gdlt("who5")} okText="rWellOk" flagText="rWellFlag" />
        <Gauge id="mood" label="gMood" ok={!f.mood} value={res.phq2+"/6"} dlt={gdlt("phq2")} okText="rMoodOk" flagText="rMoodFlag">
          {f.mood && <div className="callout" style={{marginTop:9}}>{lt("crisis")} <a className="minilink solid" style={{marginLeft:6,minHeight:32,padding:"5px 10px"}} href="tel:988">{lt("call988")}</a></div>}
        </Gauge>
        <Gauge id="worry" label="gWorry" ok={!f.worry} value={res.gad2+"/6"} dlt={gdlt("gad2")} okText="rWorryOk" flagText="rWorryFlag" />
        <Gauge id="conn" label="gConn" ok={!f.conn} value={res.ucla3+"/9"} dlt={gdlt("ucla3")} okText="rConnOk" flagText="rConnFlag" />
        <Gauge id="sleep" label="gSleep" ok={!f.sleep} value={res.sleep+" "+lt("hrs")} dlt={gdlt("sleep")} okText="rSleepOk" flagText="rSleepFlag" />
        <Gauge id="money" label="gMoney" ok={!f.money} value={(3-res.money)+"/3"} dlt={gdlt("money")} okText="rMoneyOk" flagText="rMoneyFlag" />
        {res.audit!=null
          ? <Gauge id="drink" label="gDrink" ok={!f.drink} value={res.audit+"/12"} dlt={gdlt("audit")} okText="rDrinkOk" flagText="rDrinkFlag" />
          : <div className="gaugerow"><span className="gd" style={{background:"var(--line-2)"}}></span><div style={{flex:1}}><b>{lt("gDrink")}</b><p>{lt("skipped")}</p></div></div>}
        <div className="note">{lt("saved")}</div>
        {prevRec && <button className="btn line" style={{width:"100%",marginTop:12}} onClick={()=>setStage(100)}>{lt("trendBtn")}</button>}
        <button className="btn" style={{width:"100%",marginTop:prevRec?9:12}} onClick={onClose}>{lt("close")}</button>
      </div>
    );
  }

  return (
    <div className="overlay" onClick={stage===-1?onClose:undefined}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="sh">
          <div>
            <h2>{stage===99 ? lt("resultsH") : stage===100 ? lt("trendH") : lt("introH")}</h2>
            <div className="drv">{lt("kick")}</div>
          </div>
          <button className="closex" onClick={onClose}>×</button>
        </div>
        {stage>=0 && stage<SECS.length && (
          <div className="dockprog" style={{margin:"0 22px",border:"1px solid var(--line)"}}>
            <div className="dockbar"><i style={{width:Math.round(answered/total*100)+"%"}}></i></div>
            <span>{lt("progress",{a:answered,b:total})}</span>
          </div>
        )}
        {body}
      </div>
    </div>
  );
}

window.RebarLevel = { LevelCheck, LevelStrip, LevelTrend, lvDue, lvLast, lvGaugeName };
