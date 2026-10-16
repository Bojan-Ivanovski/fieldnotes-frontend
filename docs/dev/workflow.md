# Work workflow

Use GitHub Issues as the durable record of a change. Keep the issue body current
as the work becomes clearer; use comments for short decisions and handoffs, and
link substantial design notes or evidence instead of copying long material into
comments.

## Stages

1. **Propose.** Create a work item or epic from its issue form. Agree on the
   outcome and scope before implementation starts.
2. **Refine.** Inspect the current code and existing issues. Record constraints,
   compatibility concerns, and an agreed approach in the issue. Split work that
   cannot be reviewed as one bounded change into linked issues.
3. **Implement.** Work on a branch associated with the issue. Keep changes within
   its agreed scope. Update the issue when a decision changes the plan or scope.
4. **Review.** Open a pull request that links the issue (for example, `Closes
   #12`). Describe the change and verification in the pull request. Address
   review feedback before merging.
5. **Close out.** Before closing an issue or epic, record what shipped, how it
   was verified, and any follow-up work. A linked closing keyword may close a
   work item when its pull request merges; complete its closeout details before
   merge.

## Branches and commits

The first repository commit is the one exception to the issue-branch workflow:
it establishes the project scaffold and its development process. Stage the
intended files explicitly, inspect the staged changes, and use a title in this
format:

```text
Initial[#<issue-number>]: <short explanation>
```

Always include a body with only a `**Summary**` heading and a short explanation
of why the change was made. The first commit uses the active release epic's
number. For example:

```markdown
**Summary**

Establish the initial frontend and development workflow so release work can
proceed from a consistent, documented baseline.
```

After the initial commit, each work item gets its own branch from the repository's
default branch. Use `<type>/<issue-number>-<short-slug>` (for example,
`feature/12-note-editor`). Keep one issue's work on its branch and use focused
commits with this format:

```text
<Issue Type>[#<issue-number>]: <short explanation>
```

`<Issue Type>` must exactly match the value of the issue's `Type:` label,
including capitalization and wording. For example, an issue labeled `Type: Feature`
uses `Feature[#2]: ...`; `Type: Bug` uses `Bug[#3]: ...`; and
`Type: Documentation` uses `Documentation[#4]: ...`.

Every commit body must contain only a `**Summary**` heading and a short
explanation of why the change was made.

Stage only files belonging to the change, review the staged diff before
committing, and never force-push a shared branch. After pushing a commit, do not
rewrite it unless a maintainer explicitly asks. For an authorized rewrite, use
`--force-with-lease` and stop if the remote has advanced. Push and open a pull
request when the work is ready for review; do not merge without the required
review and checks.

## Labels and project status

Labels describe work; they do not replace the issue body or project board.
Use the repository's configured labels when available. Keep label groups
independent where practical:

- **Type:** `Type: Feature`, `Type: Bug`, `Type: Design Defect`,
  `Type: Refactor`, `Type: Documentation`, or `Type: Incident`.
- **Priority:** `Priority: High`, `Priority: Medium`, or `Priority: Low`.
- **Size:** `Size: Small`, `Size: Medium`, or `Size: Large` as a rough planning
  aid, not a promise.
- **Status:** use the project board for workflow state when one is configured;
  otherwise use `Status: Ready`, `Status: In Progress`, `Status: Blocked`, and
  `Status: In Review` consistently.

Do not invent labels when an appropriate one exists. A blocker should identify
the dependency or decision needed, with a link where possible. Remove the
blocked status once work can continue.

## Dependencies and grouped work

Use GitHub's issue references and task lists to connect related work. An epic
states one outcome and links its child issues in delivery order. Child issues
should be independently reviewable and should not duplicate the epic's whole
description. Mark completed child items in the epic and close it only after its
completion criteria and closeout are satisfied.

## Pull requests

- Use a focused title and explain the change, rationale, and verification.
- Link the work issue with a closing keyword when merging should close it.
- Keep unrelated changes out of the pull request; create another issue when
  needed.
- Do not claim verification that was not run. List relevant checks and manual
  review plainly.
- Merge only after the required checks and review are complete.

## Blocked work

When work is blocked, update the issue with what is blocked, why, and the
specific next action or decision needed. Link the dependency or related issue.
Do not leave a vague `blocked` label without context. Resume by updating the
status and issue plan.
