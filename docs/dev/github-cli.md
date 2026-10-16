# GitHub and `gh` reference

Use `gh` for repeatable issue and pull request operations. Always pass the
repository explicitly when running from a checkout that may have another
`origin`:

```sh
--repo Bojan-Ivanovski/fieldnotes-frontend
```

The GitHub issue body is the durable record. Before editing it, read the current
issue; when replacing the body, provide the complete updated text so existing
sections are preserved.

## Issues

```sh
# List open issues
gh issue list --repo Bojan-Ivanovski/fieldnotes-frontend

# Read the issue before changing it
gh issue view 12 --repo Bojan-Ivanovski/fieldnotes-frontend

# Create from a prepared issue body
gh issue create \
  --repo Bojan-Ivanovski/fieldnotes-frontend \
  --title "<focused outcome>" \
  --body-file /path/to/issue.md

# Replace title/body or add an existing label
gh issue edit 12 \
  --repo Bojan-Ivanovski/fieldnotes-frontend \
  --title "<updated title>" \
  --body-file /path/to/complete-updated-issue.md

# Add a short decision or handoff
gh issue comment 12 \
  --repo Bojan-Ivanovski/fieldnotes-frontend \
  --body "<short update and links>"

# Close only after completing the issue's closeout section
gh issue close 12 --repo Bojan-Ivanovski/fieldnotes-frontend
```

Use the repository's GitHub issue forms when creating a work item, epic, or
incident in the web interface. `gh issue create` accepts a title/body but does
not fill out the form interactively; use a prepared Markdown body that follows
[issue-format.md](issue-format.md).

## Labels

Only apply labels that exist in the repository. `gh issue edit --add-label
"<label>"` adds a label without replacing the current set; `--remove-label` or
`--remove-all-labels` removes labels. Read the issue first and preserve unrelated
labels when changing metadata. The intended label groups and lifecycle are in
[workflow.md](workflow.md#labels-and-project-status).

## Pull requests

```sh
# Open a PR and link the issue so GitHub can close it on merge
gh pr create \
  --repo Bojan-Ivanovski/fieldnotes-frontend \
  --title "<change>" \
  --body-file /path/to/pr-description.md

# Inspect checks and review state before merge
gh pr view <number> --repo Bojan-Ivanovski/fieldnotes-frontend
gh pr checks <number> --repo Bojan-Ivanovski/fieldnotes-frontend
```

The PR body should include `Closes #<issue-number>` when merging it completes
the linked work item. Do not use a closing keyword for an epic until all of its
completion criteria are met. A merge is a human review decision; do not merge
unless the repository's required checks and review are satisfied.
