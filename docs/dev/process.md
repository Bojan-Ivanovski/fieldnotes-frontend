# GitHub development process

This process explains how work is proposed, refined, implemented, and closed in
the Foltivo repository using GitHub Issues and pull requests. It is intended
to keep each issue focused, make decisions visible, and leave enough context for
someone to resume work later.

These guides and the issue forms record the agreed workflow. Repository agent
instructions in [AGENTS.md](../../AGENTS.md) point future sessions here.

The work item body has exactly five sections: Summary, Scope, Analysis, Solution,
and Details. Codex investigates and attaches proposals; the developer chooses.
Solution stays pending until that choice. Details holds the findings attachment
and two to four key points. Acceptance criteria, Implementation plan, and
Closeout are not work item sections. Delivery and verification belong in the PR.

Place work under its existing delivery group where applicable; independent
release work defaults to #1 unless the developer specifies otherwise. See
[ticket hierarchy and starting order](ticket-hierarchy.md). Use native GitHub
relationships for grouping and blocked-by links for implementation dependencies.
Epics contain only Objective
and use `<version> -- Foltivo Frontend` as their title. Do not repeat parent
relationships in descriptions. Process changes follow the developer's latest
instructions; keep the guides, templates, and agent instructions consistent.

| Guide | Covers |
| --- | --- |
| [Workflow](workflow.md) | Issue stages, ownership, pull requests, and blockers |
| [Issue format](issue-format.md) | What belongs in work items and epics, and when each section is filled |
| [Incidents](incidents.md) | Recording reports separately from the work that responds to them |
| [GitHub CLI](github-cli.md) | Repeatable `gh` commands and issue/PR handling |

The agreed product structure is recorded in [Content model](content-model.md).
The release and integration direction is in [Folio versioning](folio-versioning.md).

GitHub issue forms live in [`.github/ISSUE_TEMPLATE`](../../.github/ISSUE_TEMPLATE).

Source organization follows [Component structure](component-structure.md).

Product identity and intentional legacy identifiers are recorded in
[Branding and compatibility](branding.md).

Code formatting follows [Formatting](formatting.md).
