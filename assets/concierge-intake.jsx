/* ============================================================
   INTAKE — conversation that learns the family, fully localized.
   exports: window.Intake
   ============================================================ */
(function () {
  const { useState, useEffect, useRef } = React;
  const T = (k, v) => window.I18N.t(k, v);

  function Typing() {
    return <div className="bub ai"><span className="typing"><i></i><i></i><i></i></span></div>;
  }

  function blankProfile(basics) {
    return {
      key: "custom_" + Date.now(),
      custom: true,
      family: basics.family || "your",
      from: { label: basics.from, q: basics.from },
      to: { label: basics.to, q: basics.to, home: "" },
      job: { role: basics.role || "construction", company: "their company", project: "the project taking them there" },
      fork: "split",
      timeline: "",
      members: []
    };
  }

  function splitTags(s) {
    return (s || "").split(/,|·|;| and | & |\//i).map(x => x.trim()).filter(Boolean).slice(0, 5);
  }
  function noteFor(who, fork) {
    if (who === "You") return "The one who took the job";
    if (who === "Partner") return fork === "staying" ? "Holding things down back home"
      : fork === "moving" ? "Moving with the family" : "Splitting time between home and the new place";
    if (who === "Child") return fork === "staying" ? "Staying back home for now"
      : fork === "moving" ? "Coming along for the move" : "Back and forth for now";
    return fork === "staying" ? "Staying back home" : "Part of the move";
  }
  function statusFor(who, fork) {
    if (who === "You") return "onsite";
    return fork === "staying" ? "home" : fork === "moving" ? "summer" : "split";
  }
  function toMember(pers, idx, fork, fromLabel) {
    var id = (pers.name || "").toLowerCase().replace(/[^a-z0-9]/g, "") || ("p" + idx);
    var m = {
      id: id,
      name: pers.name || pers.who,
      role: pers.who === "You" ? "You" : pers.who === "Partner" ? "Partner" : pers.who === "Child" ? (pers.age ? "Child · " + pers.age : "Child") : "Family",
      status: statusFor(pers.who, fork),
      note: noteFor(pers.who, fork),
      tags: splitTags(pers.detail)
    };
    if (pers.needs) m.needs = "Receives therapy / special-education support (currently set up in " + (fromLabel || "their home state") + ")";
    return m;
  }
  function timelineFor(basics, fork) {
    var when = basics.when ? ("Timing: " + basics.when + ". ") : "";
    var f = fork === "moving" ? "The whole family is relocating together."
      : fork === "staying" ? "The worker goes ahead; the family holds home for now."
      : "Splitting it: some on-site, some at home, for now.";
    return when + f;
  }

  function Intake({ onDone, onHelp }) {
    window.useLang();
    const [msgs, setMsgs] = useState([]);
    const [typing, setTyping] = useState(false);
    const [step, setStep] = useState("intro");
    const [draft, setDraft] = useState(null);
    const [custom, setCustom] = useState({ family: "", from: "", to: "", when: "", role: "" });
    const [people, setPeople] = useState([]);
    const [pdraft, setPdraft] = useState({ name: "", who: "You", age: "", detail: "", needs: false });
    const bodyRef = useRef(null);
    const queued = useRef(false);

    function aiSay(lines, after) {
      let i = 0;
      const next = () => {
        if (i >= lines.length) { if (after) after(); return; }
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMsgs(m => [...m, { who: "ai", text: lines[i++] }]);
          setTimeout(next, 340);
        }, 540 + lines[i].length * 7);
      };
      next();
    }
    function meSay(text) { setMsgs(m => [...m, { who: "me", text }]); }

    useEffect(() => {
      if (queued.current) return; queued.current = true;
      aiSay([T("intro1"), T("intro2")], () => setStep("who"));
    }, []);

    useEffect(() => { const el = bodyRef.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs, typing, step]);

    function startCustom() {
      meSay(T("custom.me"));
      aiSay([T("custom.ai1"), T("custom.ai2")], () => setStep("custom"));
    }
    function submitBasics(e) {
      e && e.preventDefault();
      if (!custom.from.trim() || !custom.to.trim()) return;
      const fam = custom.family.trim() || "—", from = custom.from.trim(), to = custom.to.trim();
      setDraft(blankProfile({ ...custom, family: custom.family.trim() || "your", from, to }));
      meSay(T("basics.me", { family: fam, from, to }));
      aiSay([T("basics.ai1", { from, to }), T("basics.ai2")], () => setStep("people"));
    }

    function addPerson() {
      if (!pdraft.name.trim() && pdraft.who !== "You") return;
      const entry = { ...pdraft, name: pdraft.name.trim() };
      setPeople(p => [...p, entry]);
      setPdraft({ name: "", who: people.length === 0 ? "Partner" : "Child", age: "", detail: "", needs: false });
    }
    function removePerson(i) { setPeople(p => p.filter((_, idx) => idx !== i)); }

    function finishPeople() {
      if (pdraft.name.trim()) addPerson();
      const count = people.length + (pdraft.name.trim() ? 1 : 0);
      meSay(count ? T("people.meN", { count, ppl: T(count === 1 ? "ppl.one" : "ppl.many") }) : T("people.me0"));
      aiSay([T("people.ai")], () => setStep("fork"));
    }

    function pickFork(fork, meKey) {
      meSay(T(meKey));
      let p;
      if (draft && draft.custom) {
        const members = people.map((pers, idx) => toMember(pers, idx, fork, custom.from.trim()));
        p = { ...draft, fork, members, timeline: timelineFor(custom, fork) };
      } else {
        p = { ...draft, fork };
      }
      setDraft(p);
      aiSay([T("fork." + fork + ".ai"), T("fork.outro")], () => setTimeout(() => onDone(p), 700));
    }

    const whoOpts = ["You", "Partner", "Child", "Other"];

    return (
      <div className="intake">
        <div className="app-bg"></div>
        <BadgeHex className="badge-hex" />
        <h1 className="intake-h1">{T("intake.h1pre")} <span className="g">{T("intake.h1hi")}</span></h1>
        <p className="intake-sub">{T("intake.sub")}</p>

        <div className="chatcard">
          <div className="ctop">
            <div className={"compass-dot" + (typing ? " live" : "")}></div>
            <div><b>Compass</b><span>{T("ctop.sub")}</span></div>
          </div>
          <div className="cbody" ref={bodyRef}>
            {msgs.map((m, i) => (<div key={i} className={"bub " + m.who} dangerouslySetInnerHTML={{ __html: m.text }} />))}
            {typing && <Typing />}
          </div>
          <div className="cfoot">
            {step === "who" && (
              <div className="qchips">
                <button className="qchip" onClick={startCustom}>{T("who.start")}</button>
              </div>
            )}

            {step === "custom" && (
              <form onSubmit={submitBasics} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input placeholder={T("ph.family")} value={custom.family}
                  onChange={e => setCustom({ ...custom, family: e.target.value })} />
                <div className="inrow">
                  <input placeholder={T("ph.from")} value={custom.from}
                    onChange={e => setCustom({ ...custom, from: e.target.value })} />
                  <input placeholder={T("ph.to")} value={custom.to}
                    onChange={e => setCustom({ ...custom, to: e.target.value })} />
                </div>
                <div className="inrow">
                  <input placeholder={T("ph.role")} value={custom.role}
                    onChange={e => setCustom({ ...custom, role: e.target.value })} />
                  <input placeholder={T("ph.when")} value={custom.when}
                    onChange={e => setCustom({ ...custom, when: e.target.value })} />
                </div>
                <button className="btn" type="submit" disabled={!custom.from.trim() || !custom.to.trim()}>{T("btn.next")}</button>
              </form>
            )}

            {step === "people" && (
              <div>
                {people.length > 0 && (
                  <div className="qchips" style={{ marginBottom: 11 }}>
                    {people.map((pp, i) => (
                      <span key={i} className="tagpill" style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                        {pp.name || T("who." + pp.who)}{pp.needs ? " ✦" : ""}
                        <button onClick={() => removePerson(i)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="seg" style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                  {whoOpts.map(o => (
                    <button key={o} className={"qchip" + (pdraft.who === o ? " on" : "")}
                      style={pdraft.who === o ? { borderColor: "var(--green)", color: "var(--green)" } : null}
                      onClick={() => setPdraft({ ...pdraft, who: o })}>{T("who." + o)}</button>
                  ))}
                </div>
                <div className="inrow" style={{ marginBottom: 8 }}>
                  <input placeholder={pdraft.who === "You" ? T("ph.yourname") : T("ph.name")} value={pdraft.name}
                    onChange={e => setPdraft({ ...pdraft, name: e.target.value })} />
                  {pdraft.who === "Child" && (
                    <input placeholder={T("ph.age")} style={{ maxWidth: 130 }} value={pdraft.age}
                      onChange={e => setPdraft({ ...pdraft, age: e.target.value })} />
                  )}
                </div>
                <input style={{ width: "100%", marginBottom: 8 }}
                  placeholder={pdraft.who === "Child" ? T("ph.detailChild") : pdraft.who === "Partner" ? T("ph.detailPartner") : T("ph.detailOther")}
                  value={pdraft.detail} onChange={e => setPdraft({ ...pdraft, detail: e.target.value })} />
                <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, color: "var(--muted)", marginBottom: 11, cursor: "pointer" }}>
                  <input type="checkbox" checked={pdraft.needs} onChange={e => setPdraft({ ...pdraft, needs: e.target.checked })} />
                  {T("needs.label")}
                </label>
                <div className="qchips">
                  <button className="qchip" onClick={addPerson} disabled={!pdraft.name.trim() && pdraft.who !== "You"}>{T("btn.addPerson")}</button>
                  <button className="qchip alt" onClick={finishPeople}>{T("btn.everyone")}</button>
                </div>
              </div>
            )}

            {step === "fork" && (
              <div>
                <div className="eyebrow" style={{ marginBottom: 9 }}>{T("fork.q")}</div>
                <div className="qchips">
                  <button className="qchip" onClick={() => pickFork("moving", "fork.moving.me")}>{T("fork.moving.btn")}</button>
                  <button className="qchip" onClick={() => pickFork("staying", "fork.staying.me")}>{T("fork.staying.btn")}</button>
                  <button className="qchip" onClick={() => pickFork("split", "fork.split.me")}>{T("fork.split.btn")}</button>
                </div>
              </div>
            )}

            {(step === "intro" || step === "loading") && (
              <div className="preload"><span className="spinner"></span> {T("reading")}</div>
            )}
          </div>
        </div>

        <div className="preload" dangerouslySetInnerHTML={{ __html: T("builtby") }} />
      </div>
    );
  }

  function BadgeHex({ className }) {
    return (
      <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,4 91,27 91,73 50,96 9,73 9,27" stroke="#6dd441" strokeWidth="3" />
        <polygon points="50,16 80,33 80,67 50,84 20,67 20,33" stroke="#4a514a" strokeWidth="2.5" />
        <circle cx="50" cy="46" r="9" stroke="#6dd441" strokeWidth="3" />
        <line x1="50" y1="55" x2="50" y2="72" stroke="#6dd441" strokeWidth="3" />
      </svg>
    );
  }

  window.Intake = Intake;
  window.BadgeHex = BadgeHex;
})();
