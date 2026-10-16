# Home and discovery

Issue #3 uses the selected public landing page and dedicated Search route.
The developer explicitly chose reusable mocks while the API is unavailable.
This implementation delivers that preview; it does not provide live discovery
or authentication.

The Home presentation follows an atlas-of-ideas concept: an orbital hero,
floating Folio fragments, and a large interactive Write/Connect/Discover
illustration. The developer requested a more expressive presentation inspired
by GitHub's homepage. Artwork is built with SVG and CSS; no external image or
font requests are needed. The demo supports keyboard tab navigation, motion
respects reduced-motion preferences, and topic illustrations open real mock
searches. Every product illustration remains labeled as illustrative content.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Public product introduction, search entry, illustrative content model |
| `/search?q=notes&type=all` | Search names/descriptions across sample Libraries |
| `/preview/account` | Explicit sample identities and response-scenario controls |
| `/preview/book/:id` | Minimal authorized sample Book destination and visible references |
| `/preview/folio/:id` | Minimal authorized sample Folio destination |

Search type is `all`, `book`, or `folio`. Query length is bounded to 200
characters, surrounding whitespace is trimmed, and unknown types default to
All. An empty query shows guidance. Pagination uses opaque-to-the-UI cursor
strings returned by the service. These parameters survive reload and browser
history; preview identity/scenario choices intentionally do not.

Home and discovery have their own layout and styles. The existing `/notes`,
`/notes/new`, `/favorites`, and `/settings` routes retain the app shell. Hosting
must serve the SPA entry point for direct frontend routes, including `/search`;
Vite provides that fallback locally.

## Source boundaries

- `src/features/discovery/types.ts` defines the UI-facing service/session shapes.
- `src/features/discovery/DiscoveryProvider.tsx` composes the current mock service
  with TanStack Query and subscribes to identity changes.
- Search submits through a shared form; state comes from URL parameters rather
  than an independent copy of query/filter state.
- `src/mocks/` owns the fixture dataset and simulated access behavior. See its
  [guide](../../src/mocks/README.md) for accounts, scenarios, extension, and tests.
- Preview resource routes are review destinations, not a full reader or editor.

## Replacing mocks with a live service

Before live integration, agree on REST endpoints, response validation, session
resolution/change notifications, actual authentication/account URLs, and
Book/Folio reader destinations. No endpoint or reader-path contract is selected
by this preview.

Implement the `DiscoveryService` interface through an adapter, keeping HTTP and
response validation outside route components. Replace the mock composition and
remove preview account/scenario controls and preview-only copy. Do not silently
fall back to mock data when a live service fails.

The adapter must satisfy these requirements:

1. Start with a resolving session and hide results until identity is known. Use
   a new session key whenever identity or effective permissions change. Publish
   session changes before permitting results for a new account, including on
   sign-out, expiry, and cross-tab account changes. During revalidation, hide
   protected content; an unresolved session is not an anonymous session.
2. Authenticate and authorize on the server. Search public resources anonymously;
   include independently authorized private resources for signed-in users.
   Filter before returning metadata, pagination, or counts. Never download
   inaccessible resources for client filtering.
3. Return only safe names/descriptions, readable owning-Library context, type,
   visibility, resource identity, and authorized destinations. Validate runtime
   responses and destinations; TypeScript interfaces do not validate network data.
4. Treat Book and Folio access independently. A public Book cannot disclose
   restricted Folios; a private Book cannot remove a public Folio from global
   discovery. Do not duplicate Folios because several Books reference them.
5. Honor AbortSignal, avoid protected response persistence, and invalidate access
   state on session failures. Keep the provider's request cancellation and cache
   clearing, with session keys on every search/resource request. Do not reuse
   previous-account results as placeholder data.
6. Recheck authorization in the actual reading destination. Search metadata must
   never serve as permission to read a resource. Define unavailable/deleted
   destination behavior separately from search failure.
7. Preserve the loading, no-match, failure/retry, and unavailable distinctions.
   Use authorized server pagination; the mock's offset syntax is not a live
   cursor or ranking decision.

This preview's fixture access lists and identity buttons are demonstrations.
All sample data is bundled into the frontend, including sample private content.
They must never be used to protect real user data.
