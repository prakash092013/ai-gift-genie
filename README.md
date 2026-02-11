# Gift Genie (AI Gift Recommendation App)

Hi — I’m an **AI Engineer** and this project is a compact, production-minded example of how I build LLM-powered features end-to-end: safe UI rendering, clean API boundaries, and reliability guardrails.

## What this is
**Gift Genie** turns a natural-language prompt into thoughtful, structured gift ideas (Markdown output), via an Express API that calls an LLM provider.

## Engineering highlights (what matters)
- **Secure-by-default key handling**: API keys stay **server-side** (the browser only calls `/api/gift`).
- **Defensive API design**: request validation (required prompt, trimmed, max length) + clear 4xx messages.
- **Abuse/cost control**: **rate limiting** on the AI endpoint to prevent runaway usage.
- **Resilient UX**: `AbortController` cancels in-flight requests to avoid duplicate calls and stale UI updates.
- **Safe rendering**: model output is **Markdown → HTML** and then **sanitized** before injecting into the DOM.
- **Stateless chat payload**: per-request message construction avoids cross-user memory bleed and unbounded growth.

## Tech stack
- **Frontend**: Vite + vanilla JS
- **Backend**: Node.js (ESM) + Express
- **LLM client**: `openai` SDK (configurable base URL + model)
- **Rendering**: `marked` + `dompurify`
- **Ops**: `express-rate-limit`, `.env` support via Node `--env-file`

## Run locally
1. Install dependencies:

```bash
npm install
```

2. Create your env file:

```bash
cp .env.example .env
```

3. Update `.env` with your provider details:
- `AI_KEY`
- `AI_URL`
- `AI_MODEL`

4. Start client + server:

```bash
npm start
```

- Vite dev server runs the UI
- Express API runs on `http://localhost:3001`
- Vite proxies `/api/*` → the Express server (see `vite.config.js`)

## API
- **POST** `/api/gift`
  - Body: `{ "userPrompt": "..." }`
  - Response: `{ "giftSuggestions": "markdown..." }`

## Notes
- `.env` is intentionally ignored by git. Use `.env.example` to document required configuration.
- This repo is intentionally small and readable, but includes the core reliability/security patterns I use in larger AI systems.
