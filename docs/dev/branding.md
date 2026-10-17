# Foltivo branding and compatibility

The selected product identity in
[issue #39](https://github.com/Bojan-Ivanovski/foltivo-frontend/issues/39)
is **Foltivo**, the private root package is `foltivo`, and the intended public
website origin is **https://foltivo.com**. This is a product identity decision;
no deployment, DNS, TLS, domain purchase, or provider migration is implied or
performed. The developer separately renamed the GitHub repository to
`Bojan-Ivanovski/foltivo-frontend`; the local origin and maintained links use
that confirmed name.

## Application-owned identity

Use Foltivo in current UI copy, accessible names, page titles and maintained
product prose. Use `foltivo-home` for the app-owned landing-page selector.
`src/app/brand.ts` records the display name, intended origin and shared product
positioning. Keep names of sample people, Libraries, Books and Folios, resource
IDs, routes, and content/access behavior unchanged.

The favicon at `/favicon.svg` is an original SVG F mark in the current green and
violet palette. It replaces the starter favicon without external imagery or
fonts. Touch icons, raster fallbacks, a manifest, social artwork, and any wider
asset/attribution policy remain coordinated follow-up work in #37.

## Route metadata

| Route | Canonical and Open Graph URL | Indexing |
| --- | --- | --- |
| Home `/` | `https://foltivo.com/` | Index, follow |
| Search `/search` | `https://foltivo.com/search`; excludes query, filter, and cursor | No index, follow |
| Preview/account/resource routes | Omitted | No index, no follow |
| Notes, favorites, settings, unknown routes | Omitted | No index, no follow |

The static SPA shell has no canonical or Open Graph URL and starts with indexing
disabled. The shared route metadata component sets public URLs only after the
route is known and removes them when leaving public routes. Titles and share
metadata never include search terms, sample-account identity, or private resource
names. Browser history, direct route entry, and transitions into the legacy app
shell use the same policy. Metadata is not authorization. Public URLs describe
the intended origin, not an active hosting configuration.

## Intentional technical and historical exceptions

- The installed `fieldnotes-ui` package and `fieldnotes-ui/styles.css` imports,
  the local `fieldnotes-ui-0.4.0.tgz` archive reference, the `fieldnotes-dark`
  theme, `.fn-*` CSS classes and `--fn-*` tokens remain the working UI contract.
  Consume renamed identifiers only when an actual compatible UI release exists.
- `Bojan-Ivanovski/foltivo-frontend` is the renamed GitHub repository. Use it
  for issue links and `gh --repo` arguments. The local origin is
  `git@github.com:Bojan-Ivanovski/foltivo-frontend.git`. Historical records are
  not rewritten.
- The predecessor Fieldnotes project, historical commits, uploaded attachments,
  cited evidence, and original attribution remain historical records.
- Local development/test origins, third-party URLs, dependency resolution and
  integrity values remain unchanged. No invented API host or contact address is
  introduced. Root package and root lock metadata are the only package-name edits.

Future epic titles use `<version> -- Foltivo Frontend`. Existing release issue
renaming and the proposed AI handle in #24 need separate coordinated updates;
this implementation edits only issue #39. Actual hosting, authentication
callbacks/origins in #6/#7 and the UI library's own
rebrand require their own implementation and authorization.
