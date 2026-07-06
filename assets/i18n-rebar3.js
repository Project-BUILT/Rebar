/* ============================================================
   i18n-rebar3 — strings for the "fresh look" pass:
   auth preview skip, state-aware home, cushion calculator,
   recovery meeting finders, work-context discovery chips.
   Loaded after i18n-rebar2.js; merges into window.I18N.
   ============================================================ */
(function () {
  "use strict";
  if (!window.I18N || !window.I18N.add) return;

  window.I18N.add({
    en: {
      /* auth */
      "rb.auth.demo": "Just looking? Skip sign-in for now",

      /* home: quiet status line */
      "rb.stat.list": "{n} on your list · {d} done",
      "rb.stat.due": "level check due",
      "rb.stat.days": "next level check in {k} days",

      /* home: state-aware PM strip */
      "rb.pm.smart.stalled": "\u201C{t}\u201D has been sitting {ago}. Bring it in, we'll clear the blocker.",
      "rb.pm.smart.doing": "You've got \u201C{t}\u201D in motion. Anything in the way?",
      "rb.pm.smart.amber": "Last level check flagged {g}. There's a move for it when you're ready.",
      "rb.pm.smart.due": "It's level check season. Ten minutes and you'll have fresh gauges.",

      /* money: the cushion, in weeks */
      "rb.money.calcT": "The cushion, in weeks",
      "rb.money.calcSub": "Three honest numbers. They stay on your phone, nothing gets sent anywhere.",
      "rb.money.take": "Take-home in a normal week",
      "rb.money.bills": "Must-pay bills each month (rent, truck, phone, food)",
      "rb.money.save": "What you could pull together today",
      "rb.money.run": "Run it",
      "rb.money.runway": "If the work stopped cold, the bills keep coming for about {w} weeks before the cushion runs out.",
      "rb.money.runway1": "If the work stopped cold, you'd have about a week. Tight, but you're not starting from zero.",
      "rb.money.runway0": "If the work stopped cold today, there's nothing to catch you. No shame in it, most of the industry lives there. It just means the cushion is job one.",
      "rb.money.goal": "First target: {amt} set aside. That's four weeks of bills. Then build toward twelve.",
      "rb.money.addfix": "+ Put the cushion on my list",
      "rb.money.onlist": "\u2713 On my list",
      "rb.money.edit": "Change the numbers",

      /* recovery: find a meeting */
      "rb.rec.findT": "Find a meeting near the job",
      "rb.rec.findSub": "Tonight, wherever the work has you. Any door works, there's no wrong one.",
      "rb.rec.online": "Online, any hour",

      /* discovery: about the work (optional) */
      "rb.disc.opt": "optional",
      "rb.disc.tradeQ": "What's your trade?",
      "rb.disc.tradeQS": "What's their trade?",
      "rb.disc.yearsQ": "Years in the industry",
      "rb.disc.projQ": "The project right now",
      "rb.disc.workWhy": "This part is optional. Combined and anonymous, it's how we prove that taking care of workers delivers projects. Your employer never sees any of it.",
      "rb.tr.carp": "Carpenter", "rb.tr.elec": "Electrician", "rb.tr.pipe": "Pipes & plumbing",
      "rb.tr.iron": "Ironwork", "rb.tr.lab": "Laborer", "rb.tr.op": "Operator",
      "rb.tr.conc": "Concrete", "rb.tr.super": "Super / PM", "rb.tr.oth": "Other trade",
      "rb.yr.y0": "Under 3", "rb.yr.y3": "3\u20139", "rb.yr.y10": "10\u201319", "rb.yr.y20": "20+",
      "rb.pj.data": "Data center", "rb.pj.mfg": "Manufacturing plant", "rb.pj.com": "Commercial",
      "rb.pj.ind": "Industrial & energy", "rb.pj.infra": "Roads & infrastructure", "rb.pj.res": "Residential",

      /* fund footer: real person */
      "rb.fund.person": "Talk to a real person",
      "rb.fund.personSub": "getbuilt.org \u00b7 we answer"
    },

    es: {
      /* auth */
      "rb.auth.demo": "\u00bfSolo mirando? Salta el registro por ahora",

      /* home: quiet status line */
      "rb.stat.list": "{n} en tu lista \u00b7 {d} hechos",
      "rb.stat.due": "chequeo de nivel pendiente",
      "rb.stat.days": "pr\u00f3ximo chequeo en {k} d\u00edas",

      /* home: state-aware PM strip */
      "rb.pm.smart.stalled": "\u201C{t}\u201D lleva {ago} esperando. Tr\u00e1elo, quitamos el estorbo.",
      "rb.pm.smart.doing": "Traes \u201C{t}\u201D en marcha. \u00bfAlgo en el camino?",
      "rb.pm.smart.amber": "El \u00faltimo chequeo marc\u00f3 {g}. Hay un paso para eso cuando quieras.",
      "rb.pm.smart.due": "Toca el chequeo de nivel. Diez minutos y tienes medidores frescos.",

      /* money */
      "rb.money.calcT": "El colch\u00f3n, en semanas",
      "rb.money.calcSub": "Tres n\u00fameros honestos. Se quedan en tu tel\u00e9fono, no se env\u00eda nada.",
      "rb.money.take": "Lo que te queda en una semana normal",
      "rb.money.bills": "Gastos fijos al mes (renta, troca, tel\u00e9fono, comida)",
      "rb.money.save": "Lo que podr\u00edas juntar hoy",
      "rb.money.run": "C\u00f3rrelo",
      "rb.money.runway": "Si el trabajo parara en seco, los gastos siguen unas {w} semanas antes de que el colch\u00f3n se acabe.",
      "rb.money.runway1": "Si el trabajo parara en seco, tendr\u00edas como una semana. Apretado, pero no empiezas de cero.",
      "rb.money.runway0": "Si el trabajo parara en seco hoy, no hay nada que te agarre. Sin pena, ah\u00ed vive media industria. Solo significa que el colch\u00f3n es la tarea uno.",
      "rb.money.goal": "Primera meta: {amt} guardados. Son cuatro semanas de gastos. Luego construye hacia doce.",
      "rb.money.addfix": "+ Poner el colch\u00f3n en mi lista",
      "rb.money.onlist": "\u2713 En mi lista",
      "rb.money.edit": "Cambiar los n\u00fameros",

      /* recovery */
      "rb.rec.findT": "Encuentra una reuni\u00f3n cerca del trabajo",
      "rb.rec.findSub": "Hoy en la noche, donde sea que est\u00e9s. Cualquier puerta sirve, no hay una equivocada.",
      "rb.rec.online": "En l\u00ednea, a toda hora",

      /* discovery */
      "rb.disc.opt": "opcional",
      "rb.disc.tradeQ": "\u00bfCu\u00e1l es tu oficio?",
      "rb.disc.tradeQS": "\u00bfCu\u00e1l es su oficio?",
      "rb.disc.yearsQ": "A\u00f1os en la industria",
      "rb.disc.projQ": "El proyecto de ahora",
      "rb.disc.workWhy": "Esta parte es opcional. Combinada y an\u00f3nima, es como probamos que cuidar al trabajador entrega proyectos. Tu empleador nunca ve nada de esto.",
      "rb.tr.carp": "Carpinter\u00eda", "rb.tr.elec": "Electricista", "rb.tr.pipe": "Tuber\u00eda y plomer\u00eda",
      "rb.tr.iron": "Fierro estructural", "rb.tr.lab": "Obrero general", "rb.tr.op": "Operador",
      "rb.tr.conc": "Concreto", "rb.tr.super": "S\u00faper / PM", "rb.tr.oth": "Otro oficio",
      "rb.yr.y0": "Menos de 3", "rb.yr.y3": "3\u20139", "rb.yr.y10": "10\u201319", "rb.yr.y20": "20+",
      "rb.pj.data": "Centro de datos", "rb.pj.mfg": "Planta de manufactura", "rb.pj.com": "Comercial",
      "rb.pj.ind": "Industrial y energ\u00eda", "rb.pj.infra": "Carreteras e infraestructura", "rb.pj.res": "Residencial",

      /* fund footer */
      "rb.fund.person": "Habla con una persona real",
      "rb.fund.personSub": "getbuilt.org \u00b7 contestamos"
    }
  });
})();
