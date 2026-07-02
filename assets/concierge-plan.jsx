/* ============================================================
   PLAN — the living home base (roster, phases, agent grid)
   exports: window.PlanHome, window.FundingBand, window.CrisisModal
   ============================================================ */
(function () {
  const { useState } = React;
  const C = () => window.CONCIERGE;
  const T = (k, v) => window.I18N.t(k, v);

  function PlanHome({ profile, onReset }) {
    window.useLang();
    const phases = C().PHASES;
    const TR = C().TRACK || {};
    const [phase, setPhase] = useState("decide");
    const [track, setTrack] = useState("family");
    const [who, setWho] = useState(null);

    const agentsByPhase = {};
    phases.forEach(ph => agentsByPhase[ph.id] = []);
    Object.values(C().AGENTS).forEach(a => { if (TR[a.id] === "family" && agentsByPhase[a.phase]) agentsByPhase[a.phase].push(a); });
    const workerAgents = (C().WORKER_ORDER || []).map(id => C().AGENTS[id]).filter(Boolean);

    const activeId = phase;
    const list = agentsByPhase[phase] || [];
    const selected = profile.members.find(m => m.id === who);
    const job = profile.job || {};

    return (
      <div>
        <div className="app-bg"></div>

        <div className="planhead">
          <div className="wrap inner">
            <div className="routeline">
              <span className="pin">◇ {profile.from.label}</span>
              <span className="arrow">→──────→</span>
              <span className="pin">◇ {profile.to.label}</span>
              {profile.to.home && <span style={{ color: "var(--muted-2)" }}>· {profile.to.home}</span>}
            </div>
            <h1 className="plan-h1">{T("plan.titlePre", { family: profile.family })} <span className="g">{T("plan.titleHi")}</span></h1>
            <p className="plan-sub">
              {job.role ? <span>{T("plan.jobline", { role: job.role, company: job.company, project: job.project })}</span> : null}
              {T("plan.subStatic")}
            </p>

            {profile.members.length > 0 && (
              <React.Fragment>
                <div className="roster">
                  {profile.members.map(m => (
                    <div key={m.id} className={"person" + (who === m.id ? " on" : "")} onClick={() => setWho(who === m.id ? null : m.id)}>
                      <div className={"ava s-" + m.status}>{m.name[0]}</div>
                      <div>
                        <div className="pn">{m.name}</div>
                        <div className="pr">{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {selected && (
                  <div className="callout g" style={{ marginTop: 14, marginBottom: 0 }}>
                    <b>{selected.name}</b> — {selected.note}.{selected.needs ? " " + selected.needs + "." : ""}
                    {selected.tags && selected.tags.length ? " (" + selected.tags.join(", ") + ")" : ""}
                  </div>
                )}
              </React.Fragment>
            )}
          </div>
        </div>

        <div className="wrap">
          <div className="trackswitch">
            <button className={"trackbtn" + (track === "family" ? " on" : "")} onClick={() => setTrack("family")}>
              <b>{T("track.family")}</b><span>{T("track.familySub")}</span>
            </button>
            <button className={"trackbtn" + (track === "worker" ? " on" : "")} onClick={() => setTrack("worker")}>
              <b>{T("track.worker")}</b><span>{T("track.workerSub")}</span>
            </button>
          </div>

          {track === "family" ? (
            <React.Fragment>
              <div className="phaserail">
                {phases.map((ph, i) => {
                  const cnt = (agentsByPhase[ph.id] || []).length;
                  return (
                    <button key={ph.id} className={"phasetab" + (phase === ph.id ? " on" : "")} onClick={() => setPhase(ph.id)}>
                      <div className="pnum">{T("plan.phaseN", { n: String(i + 1).padStart(2, "0") })}</div>
                      <div className="plab">{T("phase." + ph.id + ".label")}</div>
                      <div className="pbl">{T("phase." + ph.id + ".blurb")}</div>
                      <div className="pdone">{T(cnt === 1 ? "plan.agentReady1" : "plan.agentReadyN", { n: cnt })}</div>
                    </button>
                  );
                })}
              </div>

              <div className="phase-blurb">
                <h2>{T("phase." + activeId + ".label")}</h2>
                <p>{T("phase." + activeId + ".blurb")}</p>
              </div>

              <div className={"agrid" + (list.length === 1 ? " one" : "")}>
                {list.map((a, i) => (
                  <window.AgentCard key={a.id} agent={a} profile={profile} num={String(i + 1).padStart(2, "0")} />
                ))}
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div className="phase-blurb">
                <h2>{T("track.worker")}</h2>
                <p>{T("worker.intro")}</p>
              </div>
              <div className="agrid">
                {workerAgents.map((a, i) => (
                  <window.AgentCard key={a.id} agent={a} profile={profile} num={String(i + 1).padStart(2, "0")} />
                ))}
              </div>
            </React.Fragment>
          )}
        </div>

        <FundingBand />
        <div className="footnote">
          {T("foot.1")}<br />
          {T("foot.2")}<button className="linkreset" onClick={onReset} style={{ background: "none", border: "none", color: "var(--green)", cursor: "pointer", font: "inherit" }}>{T("foot.newplan")}</button>
        </div>
      </div>
    );
  }

  function FundingBand() {
    window.useLang();
    const F = C().FUNDING;
    return (
      <div className="fund">
        <div className="wrap inner">
          <div>
            <img className="logo" src="assets/built-logo.png" alt="Project BUILT" />
            <h3>{T("fund.h3")}</h3>
            <p>{T("fund.p")}</p>
            <div className="tagline">{T("fund.tagline")}</div>
          </div>
          <div className="acts">
            <a className="primary" href={F.donate} target="_blank" rel="noopener noreferrer" onClick={e => window.openExt(e, F.donate)}>
              <span className="l"><b>{T("fund.donate")}</b><span>{T("fund.donateSub")}</span></span><span className="arr">→</span>
            </a>
            <a href={F.volunteer} target="_blank" rel="noopener noreferrer" onClick={e => window.openExt(e, F.volunteer)}>
              <span className="l"><b>{T("fund.volunteer")}</b><span>{T("fund.volunteerSub")}</span></span><span className="arr">→</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  function CrisisModal({ onClose }) {
    window.useLang();
    return (
      <div className="overlay" onClick={onClose}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <button className="closex" onClick={onClose}>×</button>
          <h3>{T("crisis.title")}</h3>
          <p className="ms">{T("crisis.ms")}</p>
          {window.BUILT.CRISIS.lines.map((l, i) => (
            <div className="crow" key={i}>
              <div><div className="cn">{l.name}</div><div className="cnote">{l.note}</div></div>
              {l.tel ? <a href={"tel:" + l.tel}>{l.num}</a> : <a className="txt" href="sms:741741?&body=HOME">{l.num}</a>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  window.PlanHome = PlanHome;
  window.FundingBand = FundingBand;
  window.CrisisModal = CrisisModal;
})();
