/* ============================================================
   BUILT COMPASS — shared engine
   Real geocoding (OpenStreetMap/Nominatim) + live Claude lookups,
   one compact call per category, streamed in parallel.
   Exposes window.BUILT
   ============================================================ */
(function () {
  "use strict";

  // ---- Crisis / national resources (stable, always-available) ----
  const CRISIS = {
    lines: [
      { name: "988 Suicide & Crisis Lifeline", num: "988", note: "Call or text, 24/7", tel: "988" },
      { name: "SAMHSA National Helpline", num: "1-800-662-4357", note: "Free, confidential treatment referral, 24/7", tel: "18006624357" },
      { name: "Crisis Text Line", num: "Text HOME to 741741", note: "Text-based support, 24/7", tel: "" },
      { name: "Emergency", num: "911", note: "Immediate danger", tel: "911" }
    ]
  };

  // ---- Category catalog ----
  // guide = what the model should focus on for THIS place.
  const CATEGORIES = [
    { id: "hazards", label: "Local Hazards", glyph: "!", priority: 1,
      guide: "Region-specific natural & seasonal hazards a newcomer should know: ticks/Lyme, venomous snakes, extreme heat/cold, wildfire smoke, flooding, tornado/hurricane risk, air quality, valley fever, etc. Each item: what it is, WHEN it's worst (season/months), and one concrete way to avoid or prepare. Be specific to this region's actual risk profile." },
    { id: "health", label: "Health & Hospitals", glyph: "+", priority: 1,
      guide: "Nearest hospitals, ERs, and urgent care for this area, plus how far the nearest major trauma/ER is. Name real, well-known facilities only if confident; otherwise describe the closest options and distance honestly." },
    { id: "mental", label: "Mental Health", glyph: "~", priority: 1,
      guide: "Mental health support relevant to construction workers and families here: county behavioral-health access, sliding-scale/community clinics, and the national crisis lines (always include 988). Plainspoken, no stigma." },
    { id: "recovery", label: "Recovery & Meetings", glyph: "@", priority: 1,
      guide: "Addiction recovery support near here: AA/NA meeting availability, how to find local meetings, MAT/treatment access, and SAMHSA 1-800-662-4357. Encouraging, judgment-free." },
    { id: "childcare", label: "Childcare", glyph: "*", priority: 2,
      guide: "Childcare options for a relocating/traveling family here: types available, typical wait/cost reality, and how to find licensed care (state referral / Child Care Aware). Honest about availability." },
    { id: "schools", label: "Schools", glyph: "#", priority: 2,
      guide: "Public school picture for this area: which districts/schools are well-regarded, any to research carefully, and how enrollment works for a mid-year move. Frame as 'research these' rather than absolute judgments." },
    { id: "housing", label: "Housing & Rentals", glyph: "^", priority: 2,
      guide: "Rental reality here: typical rent range, what's available (short-term, RV/extended-stay for traveling workers, family rentals), tight or loose market, and where to look." },
    { id: "groceries", label: "Groceries & Essentials", glyph: "=", priority: 3,
      guide: "Where to get groceries and everyday essentials here: major chains present, distance if rural, and any notable local option. Practical." },
    { id: "furniture", label: "Getting Set Up", glyph: "[]", priority: 3,
      guide: "Furnishing a place fast on a budget here: furniture/secondhand options, where families find free/cheap furniture (Buy Nothing, marketplace, thrift), and quick setup tips for a temporary or new home." },
    { id: "recreation", label: "Things To Do", glyph: ">", priority: 3,
      guide: "What there is to do here for workers and families: outdoors, parks, notable nearby recreation, and the kind of weekend this area offers. Real and specific to the geography." },
    { id: "community", label: "Community & Meetups", glyph: "o", priority: 3,
      guide: "How a newcomer plugs in here: trades/union halls, churches and community centers, rec leagues, family meetups, and online local groups. Concrete ways to not be isolated." },
    { id: "cost", label: "Cost & Wages", glyph: "$", priority: 3,
      guide: "Cost-of-living and trade-wage reality here vs. national: is it cheaper or pricier, typical construction-trade pay in this market, and what a paycheck stretches to. Ballpark and honest." }
  ];

  // ---- JSON shape we ask every category to return ----
  const SHAPE =
    'Respond with ONLY valid JSON, no markdown, no commentary, in EXACTLY this shape:\n' +
    '{"headline":"<plainspoken takeaway, max 12 words>",' +
    '"items":[{"title":"<short: the NAME of a place/service, or a key point>",' +
    '"detail":"<one tight sentence>",' +
    '"meta":"<MAX 3 WORDS: a season, distance, or cost. Empty if none>",' +
    '"phone":"<a phone number ONLY if you are confident it is correct, else empty>",' +
    '"place":<true ONLY if title names a real findable place/business/facility that maps could locate, else false>}],' +
    '"callout":"<single most important tip or warning, or empty>"}\n' +
    'Give 3 items (2 minimum, 4 max). Keep meta to 3 words MAX. Never invent phone numbers. No placeholders like "N/A".';

  // ---- robust JSON extraction ----
  function extractJSON(text) {
    if (!text) return null;
    let t = String(text).trim();
    // strip code fences
    t = t.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const start = t.indexOf("{");
    const end = t.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;
    let slice = t.slice(start, end + 1);
    try { return JSON.parse(slice); } catch (e) {}
    // light repair: remove trailing commas
    try { return JSON.parse(slice.replace(/,\s*([}\]])/g, "$1")); } catch (e) {}
    return null;
  }

  // ---- cache (memory + localStorage) ----
  const mem = new Map();
  function cacheKey(placeKey, catId) { return "built2:" + placeKey + ":" + catId; }
  function readCache(placeKey, catId) {
    const k = cacheKey(placeKey, catId);
    if (mem.has(k)) return mem.get(k);
    try {
      const raw = localStorage.getItem(k);
      if (raw) { const v = JSON.parse(raw); mem.set(k, v); return v; }
    } catch (e) {}
    return null;
  }
  function writeCache(placeKey, catId, val) {
    const k = cacheKey(placeKey, catId);
    mem.set(k, val);
    try { localStorage.setItem(k, JSON.stringify(val)); } catch (e) {}
  }

  // ---- geocoding via Nominatim (real, no key) ----
  async function geocode(query) {
    const url = "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=us&q=" +
      encodeURIComponent(query);
    try {
      const res = await fetch(url, { headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error("geocode " + res.status);
      const data = await res.json();
      if (!data || !data.length) return null;
      const r = data[0];
      const a = r.address || {};
      const city = a.city || a.town || a.village || a.hamlet || a.county || r.name || "";
      const state = a.state || "";
      const county = a.county || "";
      const zip = a.postcode || "";
      const label = [city, state].filter(Boolean).join(", ") || r.display_name;
      return {
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        city, state, county, zip,
        label,
        display: r.display_name,
        placeKey: (zip || (city + state)).toLowerCase().replace(/[^a-z0-9]/g, "")
      };
    } catch (e) {
      return null;
    }
  }

  // ---- one category lookup ----
  async function lookupCategory(place, cat) {
    const cached = readCache(place.placeKey, cat.id);
    if (cached) return cached;

    const ctx = [
      place.city && ("City/area: " + place.city),
      place.county && ("County: " + place.county),
      place.state && ("State: " + place.state),
      place.zip && ("ZIP: " + place.zip)
    ].filter(Boolean).join("; ");

    const prompt =
      "You are a knowledgeable local guide helping a construction worker and their family who are traveling to, working in, or relocating to a U.S. location. " +
      "Be honest, practical, plainspoken (trades voice — direct, warm, no fluff). It is fine to say when something is limited or far. " +
      "Do NOT invent specific business names you are not confident about; describe options and what to look for instead.\n\n" +
      "LOCATION: " + ctx + ".\n\n" +
      "TOPIC: " + cat.label + ". Focus: " + cat.guide + "\n\n" +
      SHAPE;

    try {
      const raw = await window.claude.complete({ messages: [{ role: "user", content: prompt }] });
      const parsed = extractJSON(raw);
      if (!parsed || !Array.isArray(parsed.items)) throw new Error("bad json");
      // normalize
      const out = {
        headline: String(parsed.headline || "").trim(),
        callout: String(parsed.callout || "").trim(),
        items: parsed.items.slice(0, 4).map(function (it) {
          var detail = String(it.detail || "").trim();
          var meta = String(it.meta || "").trim();
          var phone = String(it.phone || "").trim();
          // fallback: pull a phone out of detail/meta if model put it there
          if (!phone) {
            var m = (detail + " " + meta).match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{3}\b(?=\s|$)/);
            // only accept full 10-digit style to avoid garbage; ignore lone 3-digit
            var m2 = (detail + " " + meta).match(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
            if (m2) phone = m2[0].trim();
          }
          return {
            title: String(it.title || "").trim(),
            detail: detail,
            meta: meta,
            phone: phone,
            place: it.place === true || it.place === "true"
          };
        }).filter(function (it) { return it.title || it.detail; })
      };
      writeCache(place.placeKey, cat.id, out);
      return out;
    } catch (e) {
      return { error: true, headline: "", items: [], callout: "" };
    }
  }

  // ---- run all categories with limited concurrency, streaming via onResult ----
  async function lookupAll(place, opts) {
    opts = opts || {};
    const onResult = opts.onResult || function () {};
    const concurrency = opts.concurrency || 3;
    const cats = CATEGORIES.slice();
    let i = 0;
    async function worker() {
      while (i < cats.length) {
        const cat = cats[i++];
        const data = await lookupCategory(place, cat);
        onResult(cat, data);
      }
    }
    const workers = [];
    for (let w = 0; w < concurrency; w++) workers.push(worker());
    await Promise.all(workers);
  }

  // ---- actionable links ----------------------------------------
  // Build a real, working link for an individual result item.
  function itemLinks(item, place) {
    var links = [];
    var loc = [place.city, place.state].filter(Boolean).join(", ");
    if (item.phone) {
      links.push({ label: "Call " + item.phone, tel: item.phone.replace(/[^0-9+]/g, ""), kind: "call" });
    }
    if (item.place && item.title) {
      links.push({
        label: "Get directions",
        url: "https://www.google.com/maps?q=" + encodeURIComponent(item.title + " " + loc),
        kind: "map"
      });
    }
    return links;
  }

  // Authoritative, location-aware "jump to a real service" buttons per category.
  function categoryActions(catId, place) {
    var loc = [place.city, place.state].filter(Boolean).join(", ");
    var enc = encodeURIComponent(loc);
    function maps(q) { return "https://www.google.com/maps?q=" + encodeURIComponent(q + " " + loc); }
    function search(q) { return "https://www.google.com/search?q=" + encodeURIComponent(q + " " + loc); }
    switch (catId) {
      case "hazards":
        return [{ label: "Weather & alerts", url: "https://forecast.weather.gov/" },
                { label: "Tick & pest safety (CDC)", url: "https://www.cdc.gov/ticks/" }];
      case "health":
        return [{ label: "Hospitals near here", url: maps("hospital") },
                { label: "Urgent care", url: maps("urgent care") }];
      case "mental":
        return [{ label: "Call or text 988", tel: "988" },
                { label: "Find treatment", url: "https://findtreatment.gov/" }];
      case "recovery":
        return [{ label: "Find AA meetings", url: "https://www.aa.org/find-aa" },
                { label: "Find NA meetings", url: "https://virtual-na.org/meetings/" },
                { label: "SAMHSA helpline", tel: "18006624357" }];
      case "childcare":
        return [{ label: "Find licensed care", url: "https://childcare.gov/state-resources" },
                { label: "Dial 211", tel: "211" }];
      case "schools":
        return [{ label: "Compare schools", url: "https://www.greatschools.org/search/search.page?q=" + enc },
                { label: "Schools nearby", url: maps("public school") }];
      case "housing":
        return [{ label: "Rentals nearby", url: maps("apartments and homes for rent") },
                { label: "Search rentals", url: search("apartments for rent") }];
      case "groceries":
        return [{ label: "Grocery stores", url: maps("grocery store") },
                { label: "Food assistance (211)", tel: "211" }];
      case "furniture":
        return [{ label: "Marketplace", url: "https://www.facebook.com/marketplace/" },
                { label: "Buy Nothing group", url: "https://buynothingproject.org/find-a-group" },
                { label: "Thrift nearby", url: maps("thrift store furniture") }];
      case "recreation":
        return [{ label: "Things to do", url: maps("things to do") },
                { label: "Parks & trails", url: maps("park trail") }];
      case "community":
        return [{ label: "Local meetups", url: "https://www.meetup.com/find/?location=" + enc },
                { label: "Community info (211)", tel: "211" }];
      case "cost":
        return [{ label: "Cost of living", url: "https://www.bestplaces.net/cost_of_living/" },
                { label: "Trade wages (BLS)", url: "https://www.bls.gov/oes/current/oes_47Co00.htm" }];
      default:
        return [];
    }
  }

  window.BUILT = {
    CATEGORIES: CATEGORIES,
    CRISIS: CRISIS,
    geocode: geocode,
    lookupCategory: lookupCategory,
    lookupAll: lookupAll,
    itemLinks: itemLinks,
    categoryActions: categoryActions,
    // a few real construction boom / project towns to seed exploration
    QUICK: [
      { label: "Williston, ND", q: "Williston, North Dakota" },
      { label: "Midland, TX", q: "Midland, Texas" },
      { label: "Bakersfield, CA", q: "Bakersfield, California" },
      { label: "Casper, WY", q: "Casper, Wyoming" },
      { label: "Mobile, AL", q: "Mobile, Alabama" }
    ]
  };
})();
