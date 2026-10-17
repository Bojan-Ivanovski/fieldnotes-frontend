# Ticket hierarchy and starting order

GitHub native parent relationships group outcomes. Native blocked-by links record
implementation prerequisites. Grouping is not a provider or architecture choice.
The release epic #1 retains its Objective-only body; ordinary group parents use
the five-section work-item template. Do not duplicate a ticket's parent in its
description.

## Delivery groups

| Parent | Children | Starting point |
| --- | --- | --- |
| #41 Account access and management | #7 account services, #6 auth pages, #9 MFA, #11 settings | Go authentication, auth pages and MFA are implemented; continue the remaining #11 scope and #8 resource policy. |
| #7 Account authentication and sessions | #46 Go client/session contract, #47 lifecycle integration, #48 shared frontend session, #51 CI, #52 cross-tab coordination | Implemented against the Go-owned REST/session contract; preserve one authoritative runtime. |
| #11 Personal Account Settings | #53 authenticated profile/security/session settings | #53 is implemented; email changes, provider linking, closure and notifications remain broader parent work. |
| #42 Library and collection navigation | #12 Library, #13 Folio, #15 Book, #28 scoped search | #12 overview decision and authorized contracts; #13/#15 destinations, then #28. |
| #43 Markdown authoring | #14 workspace, #18 editor views, #21 media, #22 modules, #25 passage links, #26 backlinks, #29 recovery/history, #34 live coediting | #14 persistence/revision and #18 editor analysis; define #25 references early. |
| #44 Review and discussions | #19 Notes/Comments, #20 Threads, #27 inbox, #30 suggestions | #19/#20 contracts with #25 anchors and #8 policy. |
| #45 Grounded AI assistance | #23 chat, #24 invoked assistance | #23 shared retrieval/provider/citation analysis; #24 also needs discussion contracts. |
| #4 Folio release foundation | #17 release/history and Book version UI | Preserve the selected release model in #4, then integrate #17. |

The groups sit under #1. Authorization #8, sharing #16, Git integration #5,
friends #31, organization membership #32 and notification delivery #33 remain
independent work because they cross group boundaries. Repository readiness #37,
rebranding #39 and SEO #40 remain independent. Optional exploration #38 does not
block the existing model. The historical #1 → #2 → #3 relationship is retained.

## Delivered account foundation and next dependencies

The selected architecture is application-owned Go authentication, coordinated
with [backend #3](https://github.com/Bojan-Ivanovski/foltivo-backend/issues/3).
Frontend #6/#7/#9 and #46–#48/#51–#53 have implementation and verification records.
The frontend implementation lives on `feature/6-authentication`; those delivery
records do not themselves establish a merge into develop or main.

1. Reuse the shared cookie/CSRF client and session runtime for new account flows.
   Do not reopen the superseded Better Auth/Clerk choice implicitly.
2. Complete Go-aware resource authorization analysis in #8 before connecting
   private content APIs. Browser route guards are presentation only; sample
   discovery identities cannot authorize live content.
3. Continue the remaining Account Settings #11 scope separately from #53's
   delivered profile, password, factor and session controls.
4. Progress authorized Library navigation #12 and the #14/#18 writing loop
   against selected persistence, revision and API contracts. Establish #25
   passage identity before dependent review/citation features finalize anchors.

Native dependencies gate integrated implementation. A basic writing slice need
not wait for optional coediting, and human suggestions need not wait for AI.
Closing a child does not complete its delivery group while agreed parent scope
remains open. GitHub is the authoritative current state; update this guide as
delivery groups or dependencies change.

## Maintaining the structure

- Reuse an existing parent where the outcome belongs; use #1 for independent
  release work and follow explicit developer overrides.
- Create a child only for work with a distinct deliverable and review boundary.
  Split further during analysis if a child remains too large.
- Preserve existing issue numbers, attachments and decisions when moving work.
- Use blocked-by links for real prerequisites, not every related issue. Remove
  obsolete dependencies when a selected solution changes the contract.
- Keep GitHub as the current relationship record; update this guide when the
  major grouping or starting sequence changes.
