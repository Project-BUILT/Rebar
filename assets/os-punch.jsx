/* ============================================================
   REBAR — the live punchlist (dock): a living scorecard of the
   items someone committed to, status tracking, a local "how do
   I do this here", and the PM's job-walk check-in.
   depends on window.RebarParts (os-app.jsx). The Chat component
   is injected as a prop by os-home.jsx to keep load order simple.
   Strings come from the rb.* i18n pack; item text is looked up
   live so the whole list follows the language switch.
   ============================================================ */
const PP = window.RebarParts;
const pt = PP.T;

function punchArray(profile){
  const items = Object.values((profile&&profile.punch)||{});
  const order = {}; PP.ROOMS.forEach((r,i)=>order[r.id]=i);
  return items.sort((a,b)=> (order[a.room]-order[b.room]) || (a.i-b.i));
}
// live text lookup so titles/descriptions follow the current language + role
function punchText(it, role){
  const src = (it.i!=null) ? PP.plItems(it.room, role)[it.i] : null;
  return src || { t:it.t, d:it.d, tag:it.tag };
}
function punchDaysAgo(d){ try{ return Math.max(0, Math.floor((Date.now()-new Date(d+"T12:00").getTime())/86400000)); }catch(_){ return 0; } }
function punchAgoText(n){ return n<=0?pt("rb.dock.agoToday"):(n===1?pt("rb.dock.agoDay"):pt("rb.dock.agoDays",{n})); }

function checkinGreeting(items, role){
  const done=items.filter(i=>i.status==="done"), doing=items.filter(i=>i.status==="doing"), todo=items.filter(i=>i.status==="todo");
  if(!items.length) return pt("rb.dock.none");
  if(!todo.length && !doing.length) return pt("rb.dock.clean");
  const stalled = [...todo].sort((a,b)=>punchDaysAgo(b.added)-punchDaysAgo(a.added))[0];
  let s = pt("rb.dock.status",{d:done.length,g:doing.length,t:todo.length});
  if(stalled) s += pt("rb.dock.stalled",{t:punchText(stalled, role).t,ago:punchAgoText(punchDaysAgo(stalled.added))});
  else if(doing.length) s += pt("rb.dock.doing",{t:punchText(doing[0], role).t});
  return s;
}
function punchContext(items, role){
  if(!items.length) return "";
  const lines = items.map(i=>"- ["+String(i.status||"todo").toUpperCase()+"] "+punchText(i, role).t+" ("+PP.roomName(i.room)+", "+punchAgoText(punchDaysAgo(i.added))+")");
  return "THEIR LIVE PUNCHLIST (items they committed to):\n"+lines.join("\n")+
    "\n\nRun this like a PM's job-walk: one short nod for what's done, then work ONE stalled item at a time — find the blocker, clear it with a concrete move, or point them at the exact resource. Don't recite the whole list back.";
}

const PUNCH_STATUSES = ["todo","doing","done"];

// per-item localized how-to (cached on the item once fetched)
function HowTo({ item, profile, onSave }){
  const { useState } = React;
  const [st,setSt] = useState(item.how?"done":"idle");
  const [how,setHow] = useState(item.how||null);
  function run(){
    setSt("work");
    const tx = punchText(item, profile.builder);
    const prompt = PP.PM_VOICE +
      PP.personLine(profile)+" At home: "+((profile.home||[]).join(", ")||"their people")+".\n\n"+
      "PUNCHLIST ITEM they committed to: \""+tx.t+"\" — "+(tx.d||"")+"\n\n"+
      "TASK: Tell them exactly how to knock this out THIS WEEK, where they are and with the time they actually have.\n"+
      'Respond ONLY with JSON: {"steps":["<concrete step, under 15 words>","<step>","<step>"],"tip":"<one pointer that fits their situation>"}\n2-3 steps.';
    PP.ask(prompt).then(r=>{ const j=PP.extractJSON(r); if(!j||!j.steps) throw 0; setHow(j); setSt("done"); onSave(j); }).catch(()=>setSt("err"));
  }
  if(st==="idle") return <button className="minilink phowbtn" onClick={run}>{pt("rb.dock.how")}</button>;
  if(st==="work") return <div className="working" style={{padding:"10px 0 2px",fontSize:13}}><span className="spinner"></span> {pt("rb.dock.howWork")}</div>;
  if(st==="err") return <button className="minilink phowbtn" onClick={run}>{pt("rb.tryagain")}</button>;
  return (
    <div className="phow">
      {(how.steps||[]).map((s,i)=>(<div className="hstep" key={i}><i>{String(i+1).padStart(2,"0")}</i><span>{s}</span></div>))}
      {how.tip && <div className="htip">{how.tip}</div>}
    </div>
  );
}

function PunchDock({ profile, onClose, onStatus, onRemove, onBrowse, Chat }){
  const { useState } = React;
  const items = punchArray(profile);
  const role = profile && profile.builder;
  const done = items.filter(i=>i.status==="done").length;
  const [chatOpen,setChatOpen] = useState(false);
  return (
    <React.Fragment>
      <div className="dockback" onClick={onClose}></div>
      <div className="dock">
        <div className="dockhd">
          <div><div className="drv" style={{marginTop:0}}>{pt("rb.dock.kick")}</div><h2>{pt("rb.mylist")}</h2></div>
          <button className="closex" onClick={onClose}>×</button>
        </div>
        {items.length>0 && (
          <div className="dockprog">
            <div className="dockbar"><i style={{width:Math.round(done/items.length*100)+"%"}}></i></div>
            <span>{pt("rb.dock.prog",{d:done,n:items.length})}</span>
          </div>
        )}
        <div className="dockbody">
          {items.length===0 ? (
            <div className="dockempty">
              <PP.Hex size={44} />
              <p>{pt("rb.dock.empty1")}<br/>{pt("rb.dock.empty2a")} <b>{pt("rb.pl.add")}</b> {pt("rb.dock.empty2b")}</p>
              <button className="btn line" onClick={onBrowse}>{pt("rb.dock.browse")}</button>
            </div>
          ) : (
            <React.Fragment>
              <div className="dockcheck">
                {!chatOpen && <div className="ptext">{checkinGreeting(items, role)}</div>}
                {chatOpen
                  ? <Chat profile={profile} greeting={checkinGreeting(items, role)} context={punchContext(items, role)} />
                  : <button className="btn" style={{width:"100%",marginTop:10}} onClick={()=>setChatOpen(true)}>{pt("rb.dock.walk")}</button>}
              </div>
              {items.map(it=>{
                const tx = punchText(it, role);
                return (
                  <div className={"pitem"+(it.status==="done"?" done":"")} key={it.key}>
                    <div className="ptop">
                      <span className="pscope">{PP.roomName(it.room)}</span>
                      <button className="px" onClick={()=>onRemove(it.key)} title={pt("rb.dock.remove")}>×</button>
                    </div>
                    <div className="pt">{tx.t}</div>
                    <div className="pstat">
                      {PUNCH_STATUSES.map(s=>(
                        <button key={s} className={it.status===s?("on "+s):""} onClick={()=>onStatus(it.key,{status:s})}>{pt("rb.st."+s)}</button>
                      ))}
                    </div>
                    {it.status!=="done" && <HowTo item={it} profile={profile} onSave={how=>onStatus(it.key,{how})} />}
                  </div>
                );
              })}
            </React.Fragment>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

window.RebarPunch = { PunchDock, punchArray, checkinGreeting, punchContext };
