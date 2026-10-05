# Verification

Fifteen automated checks passed using Node.js 24:

- Empty and unrelated resources do not produce an answer.
- Source citation numbers must refer to retrieved excerpts.
- Clinician token comparison fails closed.
- Modified and stale webhook payloads fail signature validation.
- Unauthenticated admin requests make no database calls.
- Empty library requests stop before calling the LLM.
- Failed nurse email delivery is saved and reported as failed.
- Invalid webhook requests do not retrieve email.
- Mocked approval calls the atomic database approval operation before emailing the answer.

Both frontend and API JavaScript passed syntax checks. Connected API tests use mocked external services; they do not verify actual Supabase SQL execution, Groq outputs, Resend delivery or Vercel deployment.

Full browser interaction and visual QA could not be completed because the browser executable was unavailable and its download failed. Responsive CSS has been implemented but must be checked in Safari/Chrome and on a phone before presenting. The standalone demo and connected integrations must be tested in your environment using START-HERE.md.

All 11 uploaded PDFs were extracted into 18 review parts, with nonempty text, unique resource identifiers, page markers, and part sizes below 100,000 characters. PDF page reference retrieval is covered by an automated check. The staging UI has not had browser visual QA in this environment.

Driving-question regression checks passed: drive/driving matching, excluding generic surgery-only text, asking for the operation when unspecified, and preventing single-level questions from selecting the multi-level leaflet. These are retrieval checks, not clinical validation.

Cloudflare adapter tests passed for binding-based secret configuration, status output without keys, static asset handling, security headers, and blocking project-source paths. Static asset preparation succeeded. Tests ran in Node.js, not the actual Cloudflare Workers runtime; live deployment and real provider calls remain unverified.
