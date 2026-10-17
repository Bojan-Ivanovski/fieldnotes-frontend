# Foltivo repository instructions

Read [the development process](docs/dev/process.md) before creating or updating
tickets, analysing work, implementing changes, or committing. Keep all process
documentation under `docs/dev` and issue forms under `.github/ISSUE_TEMPLATE`.

Read [the agreed content model](docs/dev/content-model.md) for product terminology:
User Libraries support independent personal creation and publication without
organization membership. Organization Libraries support shared organizational
work. Both own Folios; optional Books reference Folios without changing access.
For releases and repository integration, read [Folio versioning](docs/dev/folio-versioning.md):
working revisions, Git commits, and published versions are separate identities.

## Tickets

- Use `gh` with `--repo Bojan-Ivanovski/foltivo-frontend`.
- Place work under its existing delivery-group parent where applicable; use
  epic #1 for independent work unless the developer specifies another parent.
  See [ticket hierarchy and starting order](docs/dev/ticket-hierarchy.md).
  Use native GitHub parent relationships;
  do not duplicate the parent in the issue body.
- Epic title: `<version> -- Foltivo Frontend`. Its body contains only
  `## Objective` and a short explanation of what the release should deliver.
- Work item headings, in order: Summary, Scope, Analysis, Solution, Details.
  Do not add Acceptance criteria, Implementation plan, or Closeout sections.
- Fill Summary and Scope at creation. Fill Analysis and Details after
  investigation. Leave Solution pending until the developer selects an option.
- Details contains the code findings attachment and two to four key points,
  rather than a list of file paths or routes.

## Analysis and decisions

- Codex investigates and discusses possible solutions based on factual findings.
  The developer chooses the solution. A recommendation does not authorize
  implementation of an option.
- Each solution is its own Markdown attachment, named `<N>-solution-<k>.md`.
  Keep findings in `<N>-code-findings.md`. Use `gh-attach` to upload files and
  link the actual attachment URLs in the issue. Verify their contents.
- After selection, tag the chosen attachment **[Selected Solution]** in Analysis.
  Fill Solution with short change bullets, Affected areas, and Why this one.
  Keep full detail in the attachment.
- Use short issue comments for decisions and handoffs. Preserve other issue
  sections when editing the body.

## Commits and delivery

- Wait for the developer to request commits or pushes. Scope each authorization
  to the work requested; it is not permanent permission for future commits.
- First commit: `Initial[#1]: <short explanation>`.
- Other commits: `<Issue Type>[#<number>]: <short explanation>`. Copy the exact
  value of the issue's applied `Type:` label, including capitalization and
  wording: `Type: Feature` becomes `Feature[#2]: ...`.
- Every commit body contains only `**Summary**`, a blank line, and a short
  explanation of why the change was made.
- Start issue branches from `develop` and target PRs to `develop`. For an
  unmerged dependency, use its branch as the base/initial PR target and record
  that dependency. Promote releases from `develop` to `main` through a PR.
  Do not integrate issue work directly into local `develop` or `main`.
- Use issue branches and review staged changes before committing. Rewrite a
  pushed commit only when explicitly requested; use `--force-with-lease`.
- Record delivery and verification in the pull request. The developer merges.

## Component styles

Follow [component structure](docs/dev/component-structure.md): every TSX file
with local styles must be grouped as `Component/Component.tsx` alongside
`Component/Component.css`, imported directly by that TSX file. Keep component
styles, responsive rules, and animations together; global CSS is for resets and
foundations. Run `npm run check:component-styles` (also included in lint).
