# Spinal Support: your proof of concept

This package contains a website you can demonstrate now, plus the server code to connect a real LLM, resource database and reviewed email workflow on Vercel. It is an independent demonstration, not an NHS-approved service. The interface banners have been removed for presentation; this does not change the implementation status.

## The quickest way to see it

Unzip the download and double-click **DEMO.html**. It opens in your browser without installing anything. In this standalone version, no LLM runs and no emails are sent. Everything you add stays in that browser, using local storage. Use fictional information only. Browser privacy settings may prevent saving when opening a local file; hosting the website solves this.

Try the complete workflow:

1. Click **Clinician workspace**, enter any password and open the workspace.
2. Add a resource called “Fictional appointment leaflet”. Paste this fictional demonstration text: “For your appointment, write down questions you want to discuss with your clinical team.” Tick the review box and add it.
3. Return to **Patient information**. Ask “What questions should I bring to my appointment?” The demonstration shows matching resource text.
4. Ask “What are the risks of surgery?” This is not covered, so a nurse review form appears. Enter a fictional email address and submit.
5. Return to the clinician workspace and click Refresh. Write a fictional nurse reply and click Save nurse draft.
6. Edit the reply. Optionally tick the reuse checkbox and write a separate anonymous general answer. Click Approve and send. The demo simulates sending and only adds the separately approved reusable text.
7. Ask a question about the new information to demonstrate supervised learning.

Your 11 supplied PDFs are now extracted and staged in Resources awaiting review. Approve the resources you want the chatbot to use; no imported PDF is automatically approved. See RESOURCE-IMPORT.md for extraction details. This first version supports pasted text and .txt files. For a PDF, copy its text into the resource form and check it against the original. Automatic PDF extraction and scanned-PDF OCR are not included.

## What “learning” means

The model is not retrained. Your separately approved general answer is added to the resource library for future retrieval. Nurse drafts, patient email addresses and the original email thread are never deliberately supplied to the LLM. You must remove any identifying details from reusable text. It is safer and easier to audit than automatically learning from every email.

## Put the demonstration on Vercel for free

You need free personal accounts at GitHub and Vercel. You do not need to write code.

1. Create a new **private** GitHub repository called `spinal-support` using the GitHub website.
2. Upload the contents of the `spinal-support` folder, keeping the `api`, `lib` and `tests` folders. Do not upload the zip itself. GitHub's Upload files page supports dragging the folder contents. Confirm that `package.json`, `index.html` and `vercel.json` are at the repository's top level.
3. Sign in at https://vercel.com and choose **Add New → Project**. Import that repository.
4. Choose **Other** as the framework. Leave the root directory as the repository root. Leave the build command empty and output directory empty (or `.` if the interface requests it). No frontend build is needed. Select Node.js 24.x in project settings if a version is requested.
5. Deploy. Open the Vercel address. With no secret settings, the site runs in local workspace mode.

Vercel Hobby is free for personal, non-commercial use. A hospital-operated service may require a different plan. Check eligibility before treating this as an institutional service: https://vercel.com/docs/plans/hobby

Do not expose real patient information in this prototype, even in a private repository. No live deployment has been made for you because this workspace has no access to your Vercel account.

## Connect the real LLM and database

These steps are optional for the workflow-only demonstration, but required for an actual LLM demonstration.

1. Create a Free project at https://supabase.com. In its **SQL Editor**, paste all of `schema.sql` and run it once. This creates the resource library, review queue and request limits. Do not rerun the entire script after it succeeds.
2. In Supabase project settings, find the **Project URL** and the legacy **service_role** API key. The service role key is secret: never put it in HTML, browser code or GitHub.
3. Create a Free account at https://console.groq.com and create an API key. The included model is `openai/gpt-oss-20b`, selected from the current free-plan model list. Free limits and model availability can change. https://console.groq.com/docs/rate-limits
4. In Vercel → your project → **Settings → Environment Variables**, add these for the Production environment:

| Name | Value |
| --- | --- |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your secret service_role key |
| `GROQ_API_KEY` | Your secret Groq API key |
| `GROQ_MODEL` | `openai/gpt-oss-20b` |
| `ADMIN_TOKEN` | A unique random password of at least 32 characters; use your password manager |

5. Redeploy from Vercel's Deployments tab so the new settings take effect.
6. Open the clinician workspace using that password and add reviewed resources. Connected mode starts with an empty database; browser-only demo resources do not transfer automatically.
7. Ask questions answered by the resources and questions outside them. Inspect the cited excerpts and assess answer accuracy.

No API keys need to be shared with ChatGPT. Supabase Free projects can pause after a week of inactivity; restore a paused project before a demonstration. https://supabase.com/pricing

## Connect nurse email replies

Start with your own test inbox in the nurse role. The email integration is implemented, but has not been tested against live accounts here.

1. Create a Free Resend account at https://resend.com. Its free plan has sending limits; check the current sending and receiving allowances: https://resend.com/pricing
2. Create an API key with the sending and receiving permissions required by this integration.
3. Enable receiving and copy your **Resend-provided inbound address/domain**. You can receive using that address without buying a domain. https://resend.com/docs/receiving
4. Add a webhook pointing to `https://YOUR-VERCEL-ADDRESS/api/service?action=inbound`. Select **email.received**. Copy the signing secret.
5. Add these Vercel environment variables and redeploy:

| Name | Value |
| --- | --- |
| `RESEND_API_KEY` | Your secret Resend API key |
| `EMAIL_FROM` | `Spinal Support <onboarding@resend.dev>` for your own test inbox |
| `NURSE_EMAIL` | Your single test inbox email address |
| `INBOUND_EMAIL` | Your Resend receiving address |
| `RESEND_WEBHOOK_SECRET` | The webhook signing secret beginning `whsec_` |

6. Use the same Resend account-owner email address both as the requesting patient and the nurse test inbox. Resend's default test sender restricts recipients. Ask an unanswered fictional question, request review, and check that the email arrives.
7. Reply **from the exact address in NURSE_EMAIL**. Keep the `[case:...]` subject token and send to the reply-to address. Use a mail provider that authenticates outbound mail with DMARC. The prototype rejects unauthenticated replies and replies from other senders. A verified inbound webhook alone is not proof of the sender's identity.
8. Open the clinician workspace and Refresh. Edit the draft, then approve it. The answer is emailed only after approval. The reusable text is added only if you opt in.

**Sending to actual nurse addresses or other recipients requires a verified sending domain you control.** The Resend-provided receiving domain does not provide unrestricted outgoing email. If you do not already have an authorised domain, keep the proof of concept in test mode; full real-world emailing cannot be promised at zero cost. Do not configure a hospital domain without its owner's authorisation.

A nurse's ordinary email reply is automatically received by the webhook; they do not need a website login. Their reply may contain a quoted thread/signature, so the clinician must edit the patient response and separately curate the reusable text.

If nurse email fails, the clinician queue offers Retry nurse email. If sending an approved patient response fails, it offers approval retry using the original approved answer. No delivery-time promise is shown.

## Limits and next steps before real patient use

This is a small proof of concept, not a clinical deployment. It has a shared clinician password rather than individual accounts, browser-only demo storage, and no comprehensive audit, document withdrawal interface, staff roles, retention automation, robust abuse protection, or clinical safety case. The connected prototype searches up to 100 resources and shows up to 100 recent cases. Keep resources small for evaluation.

The server uses keyword-based retrieval, passes only matching excerpts to the LLM, requires valid source references, and otherwise declines to answer. **A prompt and valid citation numbers cannot guarantee that a generated answer is correct or exclusively supported by the resources.** Test this with your actual leaflets and clinician-reviewed questions; do not claim it eliminates hallucinations. Semantic search, answer-to-source validation and clinical evaluation would be sensible next development work.

Urgent-help signposting is separate from the document answer system, and is not an automated triage service. The prototype intentionally remains labelled as a demonstration and does not use the NHS logo. Before a patient-facing pilot, involve your Trust's clinical safety and information governance teams, agree approved hosting/email providers, individual staff authentication, data handling and monitoring, and obtain permission for NHS branding.

## For a technical helper

No third-party runtime packages are required. Node.js 24 recommended. Run `npm start` inside the project, then open http://localhost:3000. For connected local testing, copy `.env.example` to `.env` and fill it in privately. Run `npm test` for retrieval, citation and webhook checks.

Vercel serves the static frontend and the Node.js API function. Supabase is accessed only by the server's service key. RLS and grants block anonymous/authenticated browser access. Approval plus optional resource publication is atomic in PostgreSQL. The webhook verifies the signed raw payload and timestamp, checks the nurse sender and DMARC, retrieves the email via Resend, and updates only pending cases. Published replies are ignored on later webhook redelivery. API request logs deliberately do not include patient question contents.

For a process crash during delivery, a case may remain in `approved`. Inspect delivery in Resend and reconcile it manually before retrying. Distributed exactly-once delivery and a durable outbox are not implemented. The provider's idempotency key protects short-term retries; consult Resend's retention window before delayed retries.

Verification performed in this workspace is described in VERIFICATION.md. Live provider integrations, SQL execution and Vercel deployment must be validated in your accounts.


## Your uploaded PDFs

Open DEMO.html → Clinician workspace → enter any password → Open workspace. Scroll to Resources awaiting review. Expand a resource, compare and edit its extracted text, tick the review box, then click Approve resource. In the local version, patient chat displays matching excerpts with PDF page numbers; it does not generate LLM answers. Connected mode uses the LLM after the setup above.
