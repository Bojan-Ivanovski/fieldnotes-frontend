# Folio versioning and Git integration

Solution 2 is selected in [#4](https://github.com/Bojan-Ivanovski/foltivo-frontend/issues/4):
explicit immutable Folio releases. Two-way Git synchronization is separate work
in [#5](https://github.com/Bojan-Ivanovski/foltivo-frontend/issues/5).

## Three distinct identities

| Identity | Meaning |
| --- | --- |
| Working revision | Editable Folio state and concurrency token. |
| Source Git commit | Optional repository-qualified source/synchronization identity. |
| Published Folio version | Explicit immutable snapshot consumed by Book references. |

Sync does not automatically publish, and publication does not automatically
push a commit. A standalone Folio needs no repository. Source provenance must
distinguish an exact synchronized commit from a base commit with local changes.

## Published versions and references

A published version captures consistent Directory structure, Document placement,
and exact Markdown. Books follow latest published or pin a version. A pin changes
only through an explicit update; it never silently falls back to another version.

Source ownership and current authorization remain effective. Withdrawal, deletion,
or revocation may make referenced versions unavailable. Pinning is not permanent
access or a consumer-owned backup. Source storage and access enforcement still
need backend implementation; domain helpers alone cannot guarantee them.

## Two-way synchronization

The integration direction is an optional Folio connection to a GitHub/GitLab
repository, branch, and path, reading and writing managed `.md` files only.
Track the last synchronized commit, review outgoing changes, and reconcile
upstream/local conflicts without silent overwrites. Provider push permissions
remain independent of Foltivo editing permissions.

The concrete connector, credentials, branch/PR/MR workflow, and behavior after
repository deletion or disconnection remain pending analysis and selection in
#5. Imported Git content is stored in Foltivo, so its retention must not be
inferred from the rules for Books referencing externally owned Folios.
