# Driving answer and evidence update

Upload the contents of this archive into your existing GitHub repository. Wait for Cloudflare deployment Success and refresh the website. No new secrets or SQL changes are needed.

In Clinician workspace, Resources awaiting review includes two new drafts:
- Patient answer · driving · unknown-operation · draft 1
- Patient answer · driving · single-level · draft 1

Read, edit and approve these drafts against your own clinical guidance. Preserve the first [Reviewed driving answer: ...] line and [Review notes] marker: the text between them is the patient answer. Notes below the second marker are for review only. The general draft is proposed service guidance requiring your approval; it does not assume every operation has the same waiting period. Approved drafts are shown verbatim, bypassing LLM paraphrasing. Nothing is activated without your approval.

Test: How long after spinal surgery can I drive? Then test: When can I drive after single-level spinal fixation? The first should not demand a technical operation name or give a fixed waiting period. It should direct the patient to their own team and offer nurse review. The second should preserve depending on your symptoms and avoid linking the three-month travel advice to all driving conditions.

Other questions still search the full approved resource library. The LLM now selects source quotations; the server checks them against the source and constructs the displayed answer itself. It rejects fabricated quotations. This verifies text identity, not relevance, clinical correctness or completeness. Read returned sources during testing. It does not implement an emergency symptom triage service.

Nurse email is still unconfigured in the current deployment. The review button cannot deliver an email until that integration is configured. Patients should use their existing clinical contact route for advice and should not wait for an email in an urgent situation.
