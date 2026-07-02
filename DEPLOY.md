# Deploying Rebar to Netlify (with working chat)

The chat (Josh / Amy) needs a tiny backend so your Anthropic API key stays
secret. That backend is the Netlify Function in `netlify/functions/chat.js`.
The app automatically uses it once deployed — no code change needed.

## What's in the box
- `rebar.html` + `assets/` — the app (front end)
- `netlify/functions/chat.js` — the secure chat proxy
- `netlify.toml` — tells Netlify where the function lives

## Deploy (recommended: Git or Netlify CLI — NOT plain drag-drop)
Netlify Drop (dragging a folder) does **not** run Functions reliably. Use one of:

### Option A — Netlify CLI (fastest)
1. Install once:  `npm install -g netlify-cli`
2. From this project folder:  `netlify deploy --prod`
3. Follow the prompts to create/link a site.

### Option B — Git
1. Push this folder to a GitHub/GitLab repo.
2. In Netlify: "Add new site" → "Import an existing project" → pick the repo.
3. Build command: leave blank. Publish directory: `.`

## Add your API key (required — do this once)
Netlify → your site → **Site settings → Environment variables** → add:

    ANTHROPIC_API_KEY = sk-ant-...your key...

Redeploy after adding it. That's it — the chat will work at your Netlify URL,
and later at getbuilt.org once you point the domain at this site.

## Local testing
`netlify dev` runs the site + function together at http://localhost:8888

## Notes / before going live on getbuilt.org
- **Set a default landing route** so getbuilt.org/rebar (or a subdomain) opens `rebar.html`.
- **Sensitive data:** check-ins, recovery, and crisis text are health-grade data.
  Before real users, add: auth on the function, rate limiting, a signed BAA with
  the AI vendor, consent + data-deletion, and a privacy/security review.
- **Crisis safety:** keep the 988 / SAMHSA paths prominent and consider
  server-side escalation rules on crisis language.
- The app currently transpiles JSX in the browser (fine for testing). For a
  production launch we'd pre-build it for speed.
