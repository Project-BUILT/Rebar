/* ============================================================
   AGENTS UI — dispatch + live result renderers + email drafting
   exports: window.AgentCard, window.EmailSheet
   ============================================================ */
(function () {
  const { useState } = React;
  const T = (k, v) => window.I18N.t(k, v);

  function openExt(e, url) {
    e.preventDefault();
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) { try { window.location.assign(url); } catch (_) {} }
  }
  function mapsURL(q, place) {
    return "https://www.google.com/maps?q=" + encodeURIComponent(q + " " + (place ? place.to.label : ""));
  }
  function searchURL(q, place) {
    return "https://www.google.com/search?q=" + encodeURIComponent(q + " " + (place ? place.to.label : ""));
  }

  function ReconResult({ d, p }) {
    return (
      <div className="res">
        <div className="rlead warm">{d.verdict}</div>
        <div className="cmplist">
          <div className="cmphdr"><span>{T("res.factor")}</span><span>{p.from.label}</span><span>{p.to.label}</span></div>
          {d.rows.map((r, i) => (
            <div className="cmprow" key={i}>
              <span className="factor">{r.factor}</span>
              <span className={"cell" + (r.edge === "from" ? " win" : "")}>{r.from}</span>
              <span className={"cell" + (r.edge === "to" ? " win" : "")}>{r.to}</span>
            </div>
          ))}
        </div>
        {d.watch && <div className="callout">{d.watch}</div>}
      </div>
    );
  }

  function CareResult({ d, p, onEmail }) {
    return (
      <div className="res">
        <div className="rlead warm">{d.reassure}</div>
        <div className="steps">
          {d.steps.map((s, i) => (
            <div className="step" key={i}>
              <div className="sn">{i + 1}</div>
              <div className="sd"><b>{s.do}</b><span>{s.why}</span></div>
            </div>
          ))}
        </div>
        {d.programs && d.programs.length > 0 && (
          <div className="taglist">{d.programs.map((pr, i) => <span className="tagpill" key={i}>{pr}</span>)}</div>
        )}
        {d.watch && <div className="callout">{d.watch}</div>}
        <div className="linkrow" style={{ marginTop: 14 }}>
          <button className="minilink solid" onClick={() => onEmail("school", T("email.school"))}>{T("res.draftSchool")}</button>
          <a className="minilink" href={searchURL("special education early intervention", p)} onClick={e => openExt(e, searchURL("special education early intervention", p))}>{T("res.findOffice")}</a>
        </div>
      </div>
    );
  }

  function PlayResult({ d, p, onEmail }) {
    const city = p.to.label.split(",")[0];
    return (
      <div className="res">
        <div className="finds">
          {d.finds.map((f, i) => (
            <div className="find" key={i}>
              <div className="fh"><span className="fk">{f.kid}</span><span className="fa">{f.activity}</span></div>
              <div className="fw">{f.where}</div>
              {f.how && <div className="fhow">{f.how}</div>}
              <div className="linkrow">
                <a className="minilink" href={mapsURL(f.search || f.activity, p)} onClick={e => openExt(e, mapsURL(f.search || f.activity, p))}>{T("res.findNear", { city })}</a>
              </div>
            </div>
          ))}
        </div>
        <div className="linkrow" style={{ marginTop: 14 }}>
          <button className="minilink solid" onClick={() => onEmail("league", T("email.league"))}>{T("res.draftLeague")}</button>
        </div>
      </div>
    );
  }

  function ChecklistResult({ d }) {
    const [checks, setChecks] = useState({});
    const key = (a, b) => a + ":" + b;
    let total = 0, done = 0;
    d.phases.forEach((ph, pi) => ph.tasks.forEach((t, ti) => { total++; if (checks[key(pi, ti)]) done++; }));
    return (
      <div className="res">
        <div className="callout g" style={{ marginTop: 0, marginBottom: 6 }}>{T("res.checklistStatus", { done, total })}</div>
        {d.phases.map((ph, pi) => (
          <div className="chkphase" key={pi}>
            <div className="cwhen">{ph.when}</div>
            {ph.tasks.map((t, ti) => {
              const on = !!checks[key(pi, ti)];
              return (
                <div className="chkitem" key={ti}>
                  <button className={"chkbox" + (on ? " on" : "")} onClick={() => setChecks(c => ({ ...c, [key(pi, ti)]: !on }))}>{on ? "✓" : ""}</button>
                  <span className={"chktxt" + (on ? " done" : "")}>{t.t}</span>
                  <span className="chkowner">{t.owner}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  function RootsResult({ d, p }) {
    return (
      <div className="res">
        <div className="rlead warm">{d.opener}</div>
        <div className="finds">
          {d.finds.map((f, i) => (
            <div className="find" key={i}>
              <div className="fh"><span className="fk">{f.who}</span></div>
              <div className="fw">{f.what}</div>
              {f.how && <div className="fhow">{f.how}</div>}
            </div>
          ))}
        </div>
        <div className="linkrow" style={{ marginTop: 14 }}>
          <a className="minilink" href={"https://www.meetup.com/find/?location=" + encodeURIComponent(p.to.label)} onClick={e => openExt(e, "https://www.meetup.com/find/?location=" + encodeURIComponent(p.to.label))}>{T("res.meetups")}</a>
          <a className="minilink" href="https://getbuilt.org/" onClick={e => openExt(e, "https://getbuilt.org/")}>{T("res.builtcommunity")}</a>
        </div>
      </div>
    );
  }

  function TiesResult({ d }) {
    const [added, setAdded] = useState(false);
    return (
      <div className="res">
        <div className="rlead warm">{d.opener}</div>
        <div style={{ marginTop: 12 }}>
          {d.rhythms.map((r, i) => (
            <div className="rhythm" key={i}>
              <span className="rc">{r.cadence}</span>
              <div className="rt"><b>{r.title}</b><span>{r.note}</span></div>
            </div>
          ))}
        </div>
        {d.visits && d.visits.length > 0 && (
          <div className="taglist" style={{ marginTop: 13 }}>
            {d.visits.map((v, i) => <span className="tagpill" key={i}>✈ {v.what} · {v.when}</span>)}
          </div>
        )}
        {d.watch && <div className="callout">{d.watch}</div>}
        <div className="linkrow" style={{ marginTop: 14 }}>
          <button className="minilink solid" onClick={() => setAdded(true)}>{added ? T("res.rhythmSet") : T("res.setRhythm")}</button>
        </div>
      </div>
    );
  }

  function BaseResult({ d, p }) {
    const site = (p.job && p.job.site) ? p.job.site : p.to.label;
    const housing = "https://www.google.com/maps?q=" + encodeURIComponent("apartments for rent near " + site);
    return (
      <div className="res">
        <div className="rlead warm">{d.lead}</div>
        <div className="finds">
          {d.picks.map((x, i) => (
            <div className="find" key={i}>
              <div className="fh"><span className="fk">{x.area}</span><span className="fa">{x.drive}</span></div>
              <div className="fw">{x.why}</div>
            </div>
          ))}
        </div>
        {d.day && (d.day.away || d.day.note) && (
          <div className="callout g" style={{ marginTop: 13 }}>
            <b>{T("res.dayAway")}: {d.day.away}</b>{d.day.note ? " — " + d.day.note : ""}
          </div>
        )}
        <div className="linkrow" style={{ marginTop: 14 }}>
          <a className="minilink solid" href={housing} onClick={e => openExt(e, housing)}>{T("res.findHousing")}</a>
        </div>
      </div>
    );
  }

  function DailyResult({ d }) {
    return (
      <div className="res">
        <div className="rlead warm">{d.lead}</div>
        <div className="steps">
          {d.items.map((it, i) => (
            <div className="step" key={i}><div className="sn">{i + 1}</div><div className="sd"><b>{it.title}</b><span>{it.how}</span></div></div>
          ))}
        </div>
        {d.watch && <div className="callout">{d.watch}</div>}
      </div>
    );
  }

  function OffclockResult({ d, p }) {
    const out = "https://www.google.com/maps?q=" + encodeURIComponent("parks and trails near " + ((p.job && p.job.site) || p.to.label));
    const meet = "https://www.meetup.com/find/?location=" + encodeURIComponent(p.to.label);
    return (
      <div className="res">
        <div className="rlead warm">{d.opener}</div>
        <div className="finds">
          {d.finds.map((f, i) => (
            <div className="find" key={i}>
              <div className="fw">{f.what}{f.where ? " — " + f.where : ""}</div>
              {f.how && <div className="fhow">{f.how}</div>}
            </div>
          ))}
        </div>
        {d.watch && <div className="callout">{d.watch}</div>}
        <div className="linkrow" style={{ marginTop: 14 }}>
          <a className="minilink" href={out} onClick={e => openExt(e, out)}>{T("res.outdoors")}</a>
          <a className="minilink" href={meet} onClick={e => openExt(e, meet)}>{T("res.meetups")}</a>
        </div>
      </div>
    );
  }

  const RENDER = { recon: ReconResult, care: CareResult, play: PlayResult, logistics: ChecklistResult, roots: RootsResult, ties: TiesResult, base: BaseResult, daily: DailyResult, offclock: OffclockResult };

  function AgentCard({ agent, profile, num }) {
    window.useLang();
    const [state, setState] = useState("idle");
    const [data, setData] = useState(null);
    const [email, setEmail] = useState(null);

    function dispatch() {
      setState("working");
      window.CONCIERGE.runAgent(agent.id, profile)
        .then(d => { setData(d); setState("done"); })
        .catch(() => setState("error"));
    }
    function onEmail(kind, title) {
      setEmail({ kind, title, loading: true, subject: "", body: "" });
      window.CONCIERGE.draftEmail(profile, kind)
        .then(e => setEmail({ kind, title, loading: false, subject: e.subject, body: e.body }))
        .catch(() => setEmail({ kind, title, loading: false, subject: "—", body: "" }));
    }

    const Result = RENDER[agent.id];
    const astate = state === "done" ? T("astate.done") : state === "working" ? T("astate.working") : state === "error" ? T("astate.retry") : T("astate.standby");
    return (
      <div className="agent">
        <div className="ahead">
          <div className="aicon mono">{num}</div>
          <div className="atitle">
            <div className="an">{T("agent." + agent.id + ".name")}</div>
            <div className="ar">{T("agent." + agent.id + ".role")}</div>
          </div>
          <div className={"astate" + (state === "done" ? " ready" : "")}>{astate}</div>
        </div>

        {state === "working" && (
          <div className="working"><span className="spinner"></span><span className="worklog">{T("worklog." + agent.id)}</span></div>
        )}
        {state === "error" && (
          <div className="working"><span className="worklog">{T("hiccup")}</span><button className="minilink" onClick={dispatch}>{T("btn.tryagain")}</button></div>
        )}
        {state === "done" && data && Result && <Result d={data} p={profile} onEmail={onEmail} />}

        {state !== "done" && (
          <div className="adispatch">
            <button className="btn" onClick={dispatch} disabled={state === "working"}>
              {state === "working" ? T("btn.working") : T("agent." + agent.id + ".cta")}
            </button>
          </div>
        )}
        {state === "done" && (
          <div className="adispatch">
            <button className="btn line" onClick={dispatch} style={{ width: "100%", justifyContent: "center" }}>{T("btn.runagain")}</button>
          </div>
        )}

        {email && <EmailSheet email={email} onClose={() => setEmail(null)} />}
      </div>
    );
  }

  function EmailSheet({ email, onClose }) {
    window.useLang();
    const [copied, setCopied] = useState(false);
    const mailto = "mailto:?subject=" + encodeURIComponent(email.subject || "") + "&body=" + encodeURIComponent(email.body || "");
    function copy() {
      try { navigator.clipboard.writeText((email.subject ? email.subject + "\n\n" : "") + email.body); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch (_) {}
    }
    return (
      <div className="overlay" onClick={onClose}>
        <div className="sheet" onClick={e => e.stopPropagation()}>
          <div className="sh">
            <h3>{email.title}</h3>
            <button className="closex" onClick={onClose}>×</button>
          </div>
          <div className="sbody">
            {email.loading ? (
              <div className="working" style={{ padding: "30px 0" }}><span className="spinner"></span><span className="worklog">{T("email.writing")}</span></div>
            ) : (
              <React.Fragment>
                <div className="emailbox">
                  <div className="esub"><span>{T("email.subject")}</span>{email.subject}</div>
                  <div className="ebd">{email.body}</div>
                </div>
                <div className="sheetfoot">
                  <a className="btn" href={mailto}>{T("email.open")}</a>
                  <button className="btn line" onClick={copy}>{copied ? T("email.copied") : T("email.copy")}</button>
                </div>
                <div className="preload" style={{ marginTop: 14, justifyContent: "flex-start" }}>{T("email.review")}</div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    );
  }

  window.AgentCard = AgentCard;
  window.EmailSheet = EmailSheet;
  window.openExt = openExt;
})();
