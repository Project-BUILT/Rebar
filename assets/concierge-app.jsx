/* ============================================================
   APP — intake ↔ plan, header, persistence
   ============================================================ */
(function () {
  const { useState, useEffect } = React;
  const KEY = "concierge:profile:v1";

  function App() {
    const lang = window.useLang();
    const t = window.I18N.t;
    const [profile, setProfile] = useState(() => {
      try { const r = localStorage.getItem(KEY); if (r) return JSON.parse(r); } catch (_) {}
      return null;
    });
    const [crisis, setCrisis] = useState(false);

    useEffect(() => {
      try { if (profile) localStorage.setItem(KEY, JSON.stringify(profile)); } catch (_) {}
    }, [profile]);

    function reset() {
      try { localStorage.removeItem(KEY); } catch (_) {}
      setProfile(null);
    }

    return (
      <div>
        <div className="hdr">
          <div className="lockup">
            <img className="logo" src="assets/built-logo.png" alt="Project BUILT" />
            <div className="divider"></div>
            <div className="product">
              <b>Compass</b>
              <span>{t("product.sub")}</span>
            </div>
          </div>
          <div className="right">
            <select className="langsel" value={lang} onChange={e => window.I18N.setLang(e.target.value)} aria-label="Language">
              {window.I18N.LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            {profile && <button className="ghostbtn" onClick={reset}>{t("nav.newplan")}</button>}
            <button className="helpbtn" onClick={() => setCrisis(true)}><span className="pulse"></span> {t("nav.help")}</button>
          </div>
        </div>

        {!profile
          ? <window.Intake onDone={setProfile} onHelp={() => setCrisis(true)} />
          : <window.PlanHome profile={profile} onReset={reset} />}

        {crisis && <window.CrisisModal onClose={() => setCrisis(false)} />}
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
