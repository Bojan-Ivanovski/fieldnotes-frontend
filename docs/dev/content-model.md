# Foltivo content model

Agreed in [issue #2](https://github.com/Bojan-Ivanovski/foltivo-frontend/issues/2).
Library is the top-level content container, with personal
and organizational ownership.

## Library types

| Type | Ownership and use |
| --- | --- |
| User Library | Owned by an individual. A user can create and publish personal content without joining or creating an organization. |
| Organization Library | Owned by an organization, with shared membership, roles, permissions, and settings. |

Both types can contain private and public content. They use the same Books,
Folios, Directories, and Documents model. Library type describes ownership and
administration; it is not a public/private visibility setting.

Personal work belongs to the user's own Library. It does not require enrollment
in a separate shared Library. Exact provisioning, ownership transfer, and
collaboration rules for User Libraries still need design.

## Ownership and references

- A Library owns Books and Folios. A User Library has an individual owner;
  an Organization Library has organizational membership and administration.
- A Folio is the central working unit for documentation, planning, tasks, and AI
  context. It has one identity and one set of content.
- Books are optional groupings of Folios. A Folio can be referenced by zero,
  one, or multiple Books within its Library.
- Removing a reference or deleting a Book does not delete a Folio or change its
  references in other Books.
- Directories are optional and nest within a Folio. Documents can live at the
  Folio root or within a Directory. Nesting has no fixed product depth.

```text
User Library or Organization Library
├── Folios (owned resources)
│   └── Folio → optional nested Directories → Documents
└── Books (optional collections)
    └── references to Folios in the Library
```

## Access

- Book access and Folio access are independent.
- Book access controls its own name, description, and reference listing.
- Folio access controls its content regardless of Book membership.
- A Book lists a Folio only when the viewer can access both. Hidden Folios must
  not leak names or counts.
- Adding or removing a reference never changes Folio permissions. Public Book
  visibility does not publish its Folios; private Book visibility does not make
  an independently public Folio private.
- Any future bulk sharing action must be explicit and create separate Folio
  grants. It must explain the access being granted; collection membership alone
  cannot grant it. Bulk sharing is not an implemented capability.

## Examples

- A writer creates a Folio in their User Library and publishes personal work
  without joining an organization. The Folio does not need a Book.
- An Organization Library owns a Folio referenced by both a planning Book and
  an onboarding Book. Edits affect the same Folio in both places. Deleting the
  planning Book leaves the Folio and its onboarding reference intact.
- A public Book references a private Folio. A viewer without Folio access sees
  neither its reference nor its name, and it contributes nothing to that
  viewer's displayed reference count.
- A public Folio is referenced by a private Book. Its publication is unchanged;
  viewers without Book access cannot see that Book's listing.

## Use in future pages

Home and subsequent pages should use these entity names and relationships.
Personal creation must not require organization membership or creating a Book.
Book experiences must describe adding and removing Folio references without
implying that either action changes access or deletes the Folio.

The source foundation lives in `src/domain/content/types.ts` and
`src/domain/content/references.ts`. Types describe the entities and their
relationships; immutable helpers add and remove references and remove Books
from a collection. Adding a reference requires the same Library and is
idempotent. Removing a Book never operates on the Library's Folios.

These helpers do not implement authorization. Callers must authorize operations
and filter listings through the eventual resource policy. The types deliberately
omit roles, publication fields, and persistence details pending those decisions.
Directory parent references must remain within their Folio; validation of trees
and document placement belongs to future content editing work.

Existing starter pages remain in place; Home page work follows separately in
#3. Routes, storage schemas, provisioning, and permission controls require their
own design before implementation.

Run `npm test` for the domain behavior checks using Node's built-in TypeScript
support (Node 22.18 or later). Run `npm run build` and `npm run lint` for the
frontend checks.

## Direction requiring further design

[Folio versioning](folio-versioning.md) records the selected release and Book-pin
direction from #4 and its boundary with two-way Git synchronization in #5.

Public/private visibility, inherited restrictions inside Folios, raw Markdown
representations, and authorized agent access remain product requirements. The
exact role matrix, descendant publication behavior, routes, persistence, and
cross-Library references or transfers have not been selected. Earlier proposal
details about these must not be treated as approved implementation contracts.

Human and machine access should use the same resource policy. Documents should
expose their Markdown source; container Markdown representations should be
filtered indexes. These interfaces still need their own design and implementation.

The original Organization → Book → Folio chain is superseded: a Book is not a
mandatory ownership or authorization ancestor of a Folio.
