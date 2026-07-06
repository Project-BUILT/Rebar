/* ============================================================
   BUILT COMPASS — CONCIERGE ENGINE
   The agentic layer on top of built-core.js.
   - A family profile model (defaults to the real Vitale story)
   - Named "agents" that each run ONE focused live Claude call
   - Compact JSON shapes (output is capped ~1024 tokens)
   Exposes window.CONCIERGE
   ============================================================ */
(function () {
  "use strict";

  // ---- JSON extraction (shared pattern with built-core) ----
  function extractJSON(text) {
    if (!text) return null;
    var t = String(text).trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    var s = t.indexOf("{"), e = t.lastIndexOf("}");
    if (s === -1 || e === -1 || e <= s) return null;
    var slice = t.slice(s, e + 1);
    try { return JSON.parse(slice); } catch (_) {}
    try { return JSON.parse(slice.replace(/,\s*([}\]])/g, "$1")); } catch (_) {}
    return null;
  }

  function ask(prompt) {
    var lang = (window.I18N && window.I18N.aiLang) ? window.I18N.aiLang() : "English";
    var note = (lang === "English") ? "" :
      ("\n\nIMPORTANT: Write ALL human-readable text in your JSON response in " + lang +
       " — natural, native " + lang + " as a real person from the trades would say it, NOT a stiff translation. " +
       "Keep the JSON keys in English, and keep any \"edge\" field value as exactly from|to|even.");
    return window.claude.complete({ messages: [{ role: "user", content: prompt + note }] });
  }

  // ---- cache so a re-demo of the same agent is instant ----
  var mem = new Map();
  function ck(profileKey, id) { return "concierge1:" + profileKey + ":" + id; }
  function readCache(pk, id) {
    var k = ck(pk, id);
    if (mem.has(k)) return mem.get(k);
    try { var r = localStorage.getItem(k); if (r) { var v = JSON.parse(r); mem.set(k, v); return v; } } catch (_) {}
    return null;
  }
  function writeCache(pk, id, v) {
    mem.set(ck(pk, id), v);
    try { localStorage.setItem(ck(pk, id), JSON.stringify(v)); } catch (_) {}
  }

  // ---- The default profile: the REAL Vitale story ----
  var DEFAULT_PROFILE = {
    key: "vitale",
    family: "Vitale",
    from: { label: "Queen Creek, AZ", q: "Queen Creek, Arizona" },
    to: { label: "Port Washington, WI", q: "Port Washington, Wisconsin", home: "2-bed condo in Thiensville, WI" },
    job: { role: "Senior Project Superintendent", company: "Weitz", project: "Project Lighthouse — a Vantage data center (Oracle/OpenAI)", site: "Vantage data center campus, Port Washington, WI" },
    fork: "split", // moving | staying | split
    timeline: "Josh on-site since March · Amy & Ryla out now → back to AZ for the school year mid-Aug · boys come for the summer mid-July · Fargo tournament in Aug",
    members: [
      { id: "josh", name: "Josh", role: "Dad", status: "onsite",
        note: "On the job in Wisconsin since early March", here: "Wisconsin",
        tags: ["Recovery & support groups", "Coffee club"] },
      { id: "amy", name: "Amy", role: "Mom", status: "split",
        note: "In WI now → back to AZ for the school year", here: "Splitting AZ ↔ WI",
        tags: ["Runs a microschool from home", "Mom's groups", "Women's groups"] },
      { id: "kaylyn", name: "Kaylyn", role: "Daughter · 20", status: "home",
        note: "Holding down the fort in AZ; visiting with her boyfriend", here: "Arizona",
        tags: ["Independent", "Visiting"] },
      { id: "gavin", name: "Gavin", role: "Son", status: "summer",
        note: "At his dad's → WI for the summer (mid-July)", here: "AZ → WI for summer",
        needs: "PT, OT & speech therapy — currently state-funded in AZ",
        tags: ["Special needs", "Boffer league", "Soccer", "Football"] },
      { id: "evan", name: "Evan", role: "Son", status: "summer",
        note: "At his dad's → WI for the summer (mid-July)", here: "AZ → WI for summer",
        tags: ["Archery", "Boffer league", "Golf"] },
      { id: "ryla", name: "Ryla", role: "Daughter · 2", status: "split",
        note: "Out in WI now with Amy", here: "With Amy",
        tags: ["Just turned 2"] }
    ]
  };

  function profileContext(p) {
    var kids = p.members.filter(function (m) { return /son|daughter/i.test(m.role); });
    var lines = p.members.map(function (m) {
      return "- " + m.name + " (" + m.role + "): " + m.note +
        (m.needs ? " NEEDS: " + m.needs + "." : "") +
        (m.tags && m.tags.length ? " Cares about: " + m.tags.join(", ") + "." : "");
    });
    return "FAMILY: The " + p.family + " family, a construction family on the move.\n" +
      "MOVE: from " + p.from.label + " to " + p.to.label + " (" + (p.to.home || "") + ").\n" +
      "JOB: " + p.job.role + " with " + p.job.company + " on " + p.job.project + ".\n" +
      (p.job.site ? "JOBSITE: " + p.job.site + ".\n" : "") +
      "SITUATION: " + p.timeline + "\n" +
      "MEMBERS:\n" + lines.join("\n");
  }

  var VOICE = "You are 'Compass', a BUILT concierge. Your voice is Josh Vitale's — a recovering superintendent who's run the big jobs and done the inner work. " +
    "Trades-honest, warm, plainspoken. You SIT BESIDE people, you don't talk down to them — like a good foreman who pulls up a chair instead of barking an answer. Short sentences. Never use em dashes in anything you write. " +
    "You name the hard thing straight instead of dancing around it, then you stay in it with them and give a real next step. You speak TO this family by name. " +
    "Things you believe, and let show without ever preaching: people don't leave jobs, they leave people; the disconnection from family is the thread behind the whole crisis; nobody is a burden; you are not alone in this. " +
    "Never corporate, never saccharine, no toxic positivity, no lectures. Be specific and real; it's fine to say when something is hard, far, or limited. " +
    "Never invent phone numbers or program names you aren't sure of.\n\n";

  // ---- AGENTS ----
  // Each: id, name, role(one-line), phase, the_action (what it produces), build(profile,places)->prompt, parse(json)
  var AGENTS = {

    recon: {
      id: "recon", name: "Recon", phase: "decide",
      role: "Puts your old town and the new one side by side",
      cta: "Run the comparison",
      build: function (p) {
        return VOICE + profileContext(p) +
          "\n\nTASK: Help them DECIDE. Compare " + p.from.label + " (home) vs " + p.to.label + " (new) " +
          "across the things this family actually feels: cost of living, weather/seasons, pace & vibe, kid-friendliness, schools at a glance. " +
          "Be honest about trade-offs in both directions.\n\n" +
          'Respond ONLY with JSON: {"verdict":"<one warm, honest sentence to a spouse on the fence, max 22 words>",' +
          '"rows":[{"factor":"<e.g. Cost of living>","from":"<short, about ' + p.from.label + '>","to":"<short, about ' + p.to.label + '>","edge":"<from|to|even>"}],' +
          '"watch":"<the single biggest thing to weigh, one sentence>"}\n' +
          "Give 5 rows. Keep every from/to under 9 words.";
      },
      parse: function (j) {
        return { verdict: str(j.verdict), watch: str(j.watch),
          rows: arr(j.rows).slice(0, 6).map(function (r) {
            return { factor: str(r.factor), from: str(r.from), to: str(r.to),
              edge: (/from|to|even/.test(String(r.edge)) ? String(r.edge) : "even") }; }) };
      }
    },

    care: {
      id: "care", name: "Care Transfer", phase: "prepare",
      role: "Moves Gavin's therapy & school supports across state lines",
      cta: "Map the transfer",
      build: function (p) {
        var gavin = p.members.find(function (m) { return m.needs; });
        var who = gavin ? gavin.name : "your child";
        return VOICE + profileContext(p) +
          "\n\nTASK: " + who + " gets state-funded PT, OT & speech in " + stateOf(p.from.label) + ". " +
          "Moving to " + stateOf(p.to.label) + " breaks that — these supports are STATE-specific (Medicaid waivers, early intervention, IEPs don't auto-transfer). " +
          "Explain in plain English what actually happens and the exact steps to keep " + who + "'s services going, naming the real " + stateOf(p.to.label) + " programs to ask for.\n\n" +
          'Respond ONLY with JSON: {"reassure":"<one calm, honest sentence to a worried parent>",' +
          '"steps":[{"do":"<concrete action, imperative>","why":"<short why / who to call>"}],' +
          '"programs":["<real ' + stateOf(p.to.label) + ' program names to ask for>"],' +
          '"watch":"<the deadline or gotcha that bites people>"}\n' +
          "Give 4 steps, 2-3 programs. Be specific to " + stateOf(p.to.label) + ".";
      },
      parse: function (j) {
        return { reassure: str(j.reassure), watch: str(j.watch),
          programs: arr(j.programs).slice(0, 4).map(str),
          steps: arr(j.steps).slice(0, 5).map(function (s) { return { do: str(s.do), why: str(s.why) }; }) };
      }
    },

    play: {
      id: "play", name: "Activities Scout", phase: "land",
      role: "Finds each kid's exact sport or league near the new place",
      cta: "Scout the leagues",
      build: function (p, places) {
        var kids = p.members.filter(function (m) { return m.tags && m.tags.some(isActivity); });
        var ask2 = kids.map(function (k) {
          return k.name + " does: " + k.tags.filter(isActivity).join(", ");
        }).join("; ");
        return VOICE + profileContext(p) +
          "\n\nTASK: Near " + p.to.label + ", find where each kid can keep doing their thing so they don't lose it in the move. " +
          ask2 + ". Include niche ones (Boffer / foam-combat / HEMA, archery) honestly — say how to find them if unsure.\n\n" +
          'Respond ONLY with JSON: {"finds":[{"kid":"<name>","activity":"<the activity>",' +
          '"where":"<a real org/league/club type to look for near ' + p.to.label + ', or how to find it>",' +
          '"how":"<one line: how to sign up / who to contact>","search":"<2-4 word maps/web search query>"}]}\n' +
          "One entry per kid-activity, max 6. Be specific to the " + p.to.label + " area.";
      },
      parse: function (j) {
        return { finds: arr(j.finds).slice(0, 6).map(function (f) {
          return { kid: str(f.kid), activity: str(f.activity), where: str(f.where), how: str(f.how), search: str(f.search) }; }) };
      }
    },

    logistics: {
      id: "logistics", name: "Logistics", phase: "prepare",
      role: "Builds the time-sequenced checklist so nothing slips",
      cta: "Build the checklist",
      build: function (p) {
        return VOICE + profileContext(p) +
          "\n\nTASK: Build a time-sequenced moving checklist tailored to THIS split situation (worker already on-site, family coming for summer then back, special-needs supports, kids' school records). " +
          "Group by when it has to happen.\n\n" +
          'Respond ONLY with JSON: {"phases":[{"when":"<e.g. 6+ weeks out | This month | First 2 weeks>","tasks":[{"t":"<task>","owner":"<Josh|Amy|Both>","done":false}]}]}\n' +
          "3 time-groups, 3 tasks each. Specific to this family, not generic.";
      },
      parse: function (j) {
        return { phases: arr(j.phases).slice(0, 4).map(function (ph) {
          return { when: str(ph.when), tasks: arr(ph.tasks).slice(0, 5).map(function (t) {
            return { t: str(t.t), owner: str(t.owner) || "Both", done: false }; }) }; }) };
      }
    },

    roots: {
      id: "roots", name: "Roots", phase: "belong",
      role: "Rebuilds the circle for Amy, the kids, and you",
      cta: "Find the people",
      build: function (p) {
        var names = p.members.map(function (m) { return m.name; }).filter(Boolean).join(", ");
        return VOICE + profileContext(p) +
          "\n\nTASK: This family is leaving a circle they spent years building — friends, groups, the kids' teams, the people who show up. " +
          "Near " + p.to.label + ", show concrete ways for EACH person above to find their people again and not be isolated, using what each one actually cares about. This is the heart of what BUILT exists to fight.\n\n" +
          'Respond ONLY with JSON: {"opener":"<one real sentence naming the loss + the hope>",' +
          '"finds":[{"who":"<a specific person by name from the list, or \'The kids\' / \'All\'>","what":"<a specific kind of group/place near ' + p.to.label + '>","how":"<one line to plug in>"}]}\n' +
          "4-5 finds, tied to specific people by name where you can" + (names ? " (" + names + ")" : "") + ". Always include construction-trade community, and recovery/peer support for the worker. Warm, specific.";
      },
      parse: function (j) {
        return { opener: str(j.opener), finds: arr(j.finds).slice(0, 6).map(function (f) {
          return { who: str(f.who), what: str(f.what), how: str(f.how) }; }) };
      }
    },

    ties: {
      id: "ties", name: "Ties", phase: "belong",
      role: "Keeps the family connected across the miles",
      cta: "Plan the connection",
      build: function (p) {
        var spread = p.fork === "staying" ? " — the worker on-site, everyone else back home"
          : p.fork === "split" ? " — some on-site, some back home, going back and forth"
          : " — together now, but the job will pull at everyone";
        return VOICE + profileContext(p) +
          "\n\nTASK: With this move the family is spread across distance" + spread + ". " +
          "Distance is exactly what wrecks construction families. Build a realistic rhythm to stay close: visits, calls, traditions, and watch-outs for the lonely stretches. Tie it to their actual people and timeline.\n\n" +
          'Respond ONLY with JSON: {"opener":"<one honest sentence about the distance>",' +
          '"rhythms":[{"title":"<a recurring thing, e.g. Sunday call>","cadence":"<e.g. Weekly>","note":"<one line>"}],' +
          '"visits":[{"what":"<a planned visit / trip>","when":"<rough timing>"}],' +
          '"watch":"<the loneliest stretch to plan for, one sentence>"}\n' +
          "3 rhythms, 2 visits. Tie to their real timeline.";
      },
      parse: function (j) {
        return { opener: str(j.opener), watch: str(j.watch),
          rhythms: arr(j.rhythms).slice(0, 4).map(function (r) { return { title: str(r.title), cadence: str(r.cadence), note: str(r.note) }; }),
          visits: arr(j.visits).slice(0, 4).map(function (v) { return { what: str(v.what), when: str(v.when) }; }) };
      }
    },

    base: {
      id: "base", phase: "land",
      build: function (p) {
        var site = p.job && p.job.site ? p.job.site : ("the jobsite near " + p.to.label);
        return VOICE + profileContext(p) +
          "\n\nTASK: Help the worker find a place to crash close to the job so the commute doesn't eat their life. " +
          "Anchor on the jobsite: " + site + ". Name 2-3 real areas/towns within about a 15-minute drive to look for a room, apartment, or RV/extended-stay spot — with an honest feel for rent and the drive time. " +
          "Then lay the day out straight: roughly how many hours they're out of the house once you add the commute to a long construction shift, and what that leaves.\n\n" +
          'Respond ONLY with JSON: {"lead":"<one plainspoken sentence>",' +
          '"picks":[{"area":"<neighborhood/town>","why":"<short, honest>","drive":"<e.g. ~10 min>"}],' +
          '"day":{"away":"<total hours out of the house, e.g. ~13 hrs>","note":"<one honest line about what that leaves for everything else>"}}\n' +
          "Give 3 picks. Be specific to this area.";
      },
      parse: function (j) {
        var day = j.day || {};
        return { lead: str(j.lead),
          picks: arr(j.picks).slice(0, 4).map(function (x) { return { area: str(x.area), why: str(x.why), drive: str(x.drive) }; }),
          day: { away: str(day.away), note: str(day.note) } };
      }
    },

    daily: {
      id: "daily", phase: "land",
      build: function (p) {
        return VOICE + profileContext(p) +
          "\n\nTASK: A worker out here alone burns out fast on gas-station food, no sleep, and laundry piling up. " +
          "Give the few real things that keep a body standing on a long job: handling laundry, eating halfway decent without much kitchen or time, and protecting sleep around the shift. Concrete, no lecture.\n\n" +
          'Respond ONLY with JSON: {"lead":"<one sentence>",' +
          '"items":[{"title":"<Laundry | Food | Sleep | etc.>","how":"<one concrete line>"}],' +
          '"watch":"<the trap that quietly gets guys out here, one line>"}\n' +
          "Give 3-4 items.";
      },
      parse: function (j) {
        return { lead: str(j.lead), watch: str(j.watch),
          items: arr(j.items).slice(0, 5).map(function (x) { return { title: str(x.title), how: str(x.how) }; }) };
      }
    },

    offclock: {
      id: "offclock", phase: "belong",
      build: function (p) {
        var site = p.job && p.job.site ? p.job.site : p.to.label;
        return VOICE + profileContext(p) +
          "\n\nTASK: The real danger out here is it becomes just work and the bar. Near " + site + ", give honest ways to actually refill off the clock: getting outside in nature, meeting real people, and finding recovery or peer support if that's part of the picture — so the off-hours build him back up instead of draining him.\n\n" +
          'Respond ONLY with JSON: {"opener":"<one honest sentence about not letting it be just work and drinking>",' +
          '"finds":[{"what":"<a nature spot | a way to meet people | recovery/peer support>","where":"<near where, specific>","how":"<one line to take the first step>"}],' +
          '"watch":"<one honest line about the lonely nights>"}\n' +
          "Give 4 finds. Specific to this area; include the outdoors and at least one way to meet people.";
      },
      parse: function (j) {
        return { opener: str(j.opener), watch: str(j.watch),
          finds: arr(j.finds).slice(0, 6).map(function (f) { return { what: str(f.what), where: str(f.where), how: str(f.how) }; }) };
      }
    }
  };

  // which track each helper belongs to: the family's journey, or the worker themselves
  var TRACK = {
    recon: "family", care: "family", play: "family", logistics: "family", roots: "family", ties: "family",
    base: "worker", daily: "worker", offclock: "worker"
  };

  // ---- email drafter (used by Care + Play actions) ----
  function draftEmail(profile, kind) {
    var p = profile;
    var prompts = {
      school: "Draft a short, warm but professional email from " + parentName(p) + " to the " + stateOf(p.to.label) +
        " school district / special-education office near " + p.to.label + ", introducing the family, explaining they're relocating from " +
        stateOf(p.from.label) + ", that their son currently receives state-funded PT, OT and speech services on an IEP, and asking what's needed to continue evaluations and services. Ask for next steps and a contact.",
      league: "Draft a short, friendly email from " + parentName(p) + " to a youth sports/recreation league near " + p.to.label +
        ", saying the family is moving to the area for a work project this summer, listing the kids' sports (Boffer/foam-combat, soccer, football, archery, golf), and asking about summer signup, ages, schedules and cost."
    };
    return ask(VOICE + profileContext(p) + "\n\nTASK: " + (prompts[kind] || prompts.school) +
      '\n\nRespond ONLY with JSON: {"subject":"<subject line>","body":"<the email body, real line breaks as \\n, signed from ' + parentName(p) + '>"}')
      .then(function (raw) {
        var j = extractJSON(raw) || {};
        return { subject: str(j.subject) || "Introducing our family, relocating to your area",
          body: str(j.body) || "" };
      });
  }

  // ---- runner ----
  function runAgent(agentId, profile, places) {
    var ag = AGENTS[agentId];
    if (!ag) return Promise.reject(new Error("no agent " + agentId));
    var cached = readCache(profile.key, agentId);
    if (cached) return Promise.resolve(cached);
    return ask(ag.build(profile, places || {})).then(function (raw) {
      var j = extractJSON(raw);
      if (!j) throw new Error("bad json");
      var out = ag.parse(j);
      writeCache(profile.key, agentId, out);
      return out;
    });
  }

  // ---- helpers ----
  function str(v) { return v == null ? "" : String(v).trim(); }
  function arr(v) { return Array.isArray(v) ? v : []; }
  function isActivity(tag) {
    return !/special needs|microschool|mom|women|recovery|support|coffee|independent|visiting|just turned/i.test(tag);
  }
  function stateOf(label) {
    var m = String(label).split(",");
    var st = (m[1] || "").trim();
    var map = { AZ: "Arizona", WI: "Wisconsin", ND: "North Dakota", TX: "Texas", CA: "California", WY: "Wyoming", AL: "Alabama", IL: "Illinois" };
    return map[st] || st || label;
  }
  function parentName(p) {
    var a = p.members.find(function (m) { return m.id === "amy"; });
    var j = p.members.find(function (m) { return m.id === "josh"; });
    return [ (j && j.name), (a && a.name) ].filter(Boolean).join(" & ") || ("The " + p.family + "s");
  }

  window.CONCIERGE = {
    DEFAULT_PROFILE: DEFAULT_PROFILE,
    AGENTS: AGENTS,
    TRACK: TRACK,
    PHASES: [
      { id: "decide", label: "Decide", blurb: "Is this even the right call for us?" },
      { id: "prepare", label: "Prepare", blurb: "We said yes. Now what, before we go?" },
      { id: "land", label: "Land", blurb: "First two weeks on the ground." },
      { id: "belong", label: "Belong", blurb: "Build a life here, stay close to home." }
    ],
    WORKER_ORDER: ["base", "daily", "offclock"],
    runAgent: runAgent,
    draftEmail: draftEmail,
    profileContext: profileContext,
    stateOf: stateOf,
    parentName: parentName,
    FUNDING: {
      volunteer: "https://getbuilt.org/volunteer/",
      donate: "https://givebutter.com/ProjectBUILT",
      site: "https://getbuilt.org/"
    }
  };
})();
