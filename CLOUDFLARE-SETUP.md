# Connect your real chatbot using Cloudflare

The website is prepared for Cloudflare Workers with static assets. It retains Vercel support too. It is not online yet: the account setup and deployment below are still needed. The offline DEMO.html remains an excerpt-search demonstration and cannot securely store a hosted LLM API key.

## 1. Create your free LLM account

Open https://console.groq.com and create an account. Open API Keys and create a key called Spinal Support. Keep it privately in your password manager; do not send it in chat or put it in a source file. Choose the Free plan and stay within its limits. https://console.groq.com/docs/quickstart

## 2. Create the resource database

Create a Free Supabase project at https://supabase.com. Choose a suitable region for your evaluation. Open SQL Editor and run the contents of schema.sql once. Do not repeat it if it has already succeeded. Keep the Project URL and legacy service_role API key privately for the next steps. Your browser demo approvals have not yet been saved to this new database.

## 3. Put the project on GitHub

Create a private GitHub repository. Upload the contents of this project folder, keeping the folders. The repository root must contain package.json, worker.js, wrangler.jsonc, index.html, resources.js, api/, lib/ and scripts/. Never upload filled-in .env or .dev.vars files.

## 4. Connect Cloudflare

Create a Free Cloudflare account at https://dash.cloudflare.com. In Workers & Pages, create a Worker by importing the GitHub repository. Select this repository as the project root and set:

- Build command: npm run build:cloudflare
- Deploy command: npx wrangler@4 deploy
- Worker name: spinal-support (must match wrangler.jsonc)

This is a Workers project with static assets, not a Pages static-only project. If the interface names differ, use the Workers Git repository import option. No custom domain is required; Cloudflare provides a workers.dev address. The first deployment can run before adding secrets, but it will remain in local workspace mode.

## 5. Add server secrets

Open the Worker's Settings → Variables and Secrets. Add each of the following as a Secret, not a public frontend value. Save and deploy the configuration change. The exact dashboard wording may vary.

| Name | Value |
| --- | --- |
| GROQ_API_KEY | Your Groq key |
| SUPABASE_URL | Your Supabase Project URL |
| SUPABASE_SERVICE_ROLE_KEY | Your secret legacy service_role key |
| ADMIN_TOKEN | A unique random password of at least 32 characters |

GROQ_MODEL is already configured as openai/gpt-oss-20b in wrangler.jsonc. No key is needed in the downloadable demo or browser. Cloudflare passes secrets directly to the server handler.

## 6. Approve sources and test

Open the workers.dev address. The navigation should say Connected. Open the clinician workspace with your ADMIN_TOKEN password. Your PDFs appear in Resources awaiting review. Approve the source text again here so it is stored in Supabase, rather than only in the old browser demonstration. Then ask a fictional question from the patient screen. Supported questions will receive an LLM-generated answer plus the retrieved source excerpts. General driving-after-surgery questions still ask which operation you mean.

If the source text does not support an answer, the chatbot declines to answer. Valid citations and retrieval do not guarantee correctness; assess the generated answers yourself. We have not tested the LLM or deployed Worker with real provider accounts in this workspace.

## Email comes afterwards

First get document chat working. Nurse email settings can be added later using the Resend instructions in START-HERE.md, substituting Cloudflare secrets for Vercel environment variables and using your workers.dev address in the webhook URL. A verified sending domain is still required for unrestricted outgoing emails.

## Alternative: deploy from your Mac

If guided deployment from the dashboard is inconvenient, run the following inside this project after Node.js is installed:

```
npm run build:cloudflare
npx wrangler@4 login
npx wrangler@4 deploy
npx wrangler@4 secret put GROQ_API_KEY
npx wrangler@4 secret put SUPABASE_URL
npx wrangler@4 secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler@4 secret put ADMIN_TOKEN
```

Each secret command asks for its value privately. Do not paste keys into the command itself. For local Cloudflare testing, use private .dev.vars and npx wrangler@4 dev after building. Do not upload .dev.vars.

Reference: https://developers.cloudflare.com/workers/static-assets/
