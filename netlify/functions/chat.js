/* ============================================================
   Rebar — chat backend (Netlify Function)
   Proxies the in-app chat to the Anthropic API so the secret
   key never reaches the browser.

   SETUP (one time):
   1. In Netlify: Site settings → Environment variables →
      add  ANTHROPIC_API_KEY = sk-ant-...   (your key)
   2. Deploy. The function lives at /.netlify/functions/chat
   ============================================================ */

// Swap this if you want a different/newer model.
const MODEL = "claude-sonnet-4-5-20250929";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY is not set in Netlify env vars" }) };
  }

  let prompt;
  try { ({ prompt } = JSON.parse(event.body || "{}")); }
  catch (_) { return { statusCode: 400, body: JSON.stringify({ error: "Bad JSON" }) }; }
  if (!prompt || typeof prompt !== "string") {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing prompt" }) };
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const j = await r.json();
    if (!r.ok) {
      return { statusCode: r.status, body: JSON.stringify({ error: (j && j.error && j.error.message) || "Upstream error" }) };
    }
    const text = (j.content && j.content[0] && j.content[0].text) || "";
    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
};
