# Issue format

The issue body is the shared record of why work exists, what it includes, and
how completion will be judged. Keep it short enough to scan. Put larger research
or design material in a linked document; comments should remain brief.

## Work items

Use the **Work item** form for one bounded change.

| Section | When to fill it | Purpose |
| --- | --- | --- |
| Summary | At creation | State the current situation or user need, expected outcome, and who benefits. |
| Scope | At creation | Name affected area and what is in and out. |
| Analysis | During refinement | Record current behavior, cause when relevant, constraints, compatibility, and viable options. |
| Implementation plan | After approach is agreed | State the chosen approach and affected areas in a few bullets. |
| References and details | As needed | Link findings, related issues, and supporting material. |
| Closeout | Before closing | Record what shipped, verification performed, and follow-up issues. |

For a defect, describe what happens and what should happen without presuming a
cause. For new work, describe the user need and the result. Keep `In scope` and
`Out of scope` explicit. Avoid unresolved questions in an issue marked ready to
implement; resolve them during refinement or create a discovery issue.

## Epics

Use the **Epic** form only when several related issues are needed to achieve one
bounded outcome. It is not a roadmap or a description of the whole product.

| Stage | Fill in |
| --- | --- |
| At kickoff | One user outcome, boundaries, and completion criteria. |
| During delivery | Child issue links and order, decisions or agreed scope changes, risks, and dependencies. |
| At closeout | Delivered result, verification against criteria, incomplete items, and follow-up issue links. |

Keep the epic focused on the result. Put implementation tasks in child issues;
do not turn the epic body into a long speculative checklist. If scope changes,
record the decision and revise the outcome or criteria so the final closeout is
measurable.

## Notes, attachments, and links

- Use comments for concise decisions, questions, and handoffs; update the body
  when the issue's agreed scope or plan changes.
- Link long design notes and investigation findings instead of pasting them in
  full. Keep sensitive data, credentials, and private user information out of
  issues and attachments.
- Link dependencies and related work with `#<issue-number>` references.
- Pull requests should state what changed and how it was checked; the issue
  closeout can summarize the result and link the PR.
