# Frontend source structure

This is the source structure selected in
[issue #61](https://github.com/Bojan-Ivanovski/foltivo-frontend/issues/61).
This document defines ownership for current and subsequent development.

## Application composition

```text
src/
  app/
    App.tsx
    router/
    config/
  modules/
    auth/
    account/
    discovery/
    workspace/
  shared/
  main.tsx
  index.css
```

`app/` stays minimal. App.tsx composes providers and mounts routing; router/
owns root route composition and route metadata, and config/ owns application
configuration such as branding. Keep page implementations, visual layouts,
components and provider implementations out of app/. Compose those through
imports from their owning modules or shared code. Global resets and foundations
remain in index.css.

The internal application section is the **workspace** module. Its visual shell
is called **WorkspaceLayout**, replacing AppLayout: this shell does not wrap the
entire product. Authentication and public discovery keep their own layouts.

## Module structure

Every module uses these responsibility groups:

```text
modules/discovery/
  pages/
  layout/
    DiscoveryLayout.tsx
    DiscoveryLayout.css
    # helpers used only by this layout, when needed
  components/
  providers/
  data/
  lib/
```

| Directory | Owns |
| --- | --- |
| pages/ | Route page implementations and page-specific companions. |
| layout/ | The module's single layout and helpers used only by that layout. |
| components/ | Reusable UI within the module, including its local styles/helpers. |
| providers/ | Module-owned providers, contexts and associated runtime implementation. |
| data/ | Module contracts, API adapters, service types, fixtures and mock adapters as needed. |
| lib/ | Module-wide nonvisual logic and utilities with no narrower owner. |

Preserve empty module responsibility directories with a `.gitkeep` file so Git
retains the agreed structure. Remove the marker once real files occupy that
directory. A marker does not justify adding unused abstraction layers. Put real
code in the appropriate group.
Each module owns at most one layout; use components for its visual pieces.
A module that needs a shared layout imports it instead of duplicating it.

The layout TSX and matching CSS sit directly in layout/. Helpers belong there
only while they are exclusive to that layout. A helper also used elsewhere in
the module moves to the appropriate module group; cross-module reuse follows
the promotion rules below. Other components and styled pages retain their
component-named folders from [component structure](component-structure.md).

Keep auth flow ownership explicit: dedicated auth pages own their forms and
redirects. Structure changes must preserve the single authoritative session
runtime, cookie/CSRF coordination and separation of real accounts from discovery
preview identities and caches.

## Shared structure

Shared code can use the same groups:

```text
shared/
  pages/
  layout/
    WorkspaceLayout/
      WorkspaceLayout.tsx
      WorkspaceLayout.css
  components/
  providers/
  data/
  lib/
```

Use shared/ only for code genuinely reused between modules. It is not a default
location for code that might someday be useful. Shared pages, layouts,
components, providers, contracts and helpers are all allowed when reuse is real.
Shared layouts use a named folder because multiple distinct shared layouts can
exist; the one-layout limit applies to individual modules.

WorkspaceLayout belongs in shared/layout/WorkspaceLayout/ when workspace and
account both use it. Keep its shared visual pieces beside it if they are private
to that shell; promote independently reusable components to shared/components/.
AuthLayout and DiscoveryLayout remain local while only their own modules use them.

A shared provider's placement does not make its state global by default. App
composition determines lifetime and scope. Do not merge real-account and preview
caches merely because their provider files share a directory category.

## Ownership can change: promotion and demotion

Locations reflect current use and can evolve. A local component is not permanently
bound to its first module. Promote code to shared when another module has a real
need for the same responsibility and behavior.

1. Identify the concrete consumers and the common responsibility.
2. Move the reusable unit to the matching shared group. Move its CSS and owned
   TypeScript companions with it; preserve component names unless their meaning
   changes.
3. Remove assumptions about the original module. Pass module-specific content or
   callbacks from callers, or split a reusable primitive from its local wrapper.
   Shared code must not import its former owning module to keep working.
4. Update all consumers, test imports and maintained source references together.
5. Review dependency direction and state/cache lifetime. A promotion must not
   change product behavior implicitly.

The same rule applies to pages, layouts, providers, data contracts and lib
helpers. Reuse of an idea does not require sharing two pieces of code with
incompatible responsibilities. Move code back into a module when shared reuse
no longer exists and local ownership makes maintenance clearer. Document material
ownership decisions in the relevant ticket/PR; these boundaries are revisable.

## Dependency direction

- app/ composes modules/ and shared/.
- Modules consume shared code and explicitly supported cross-module contracts.
  Account and discovery may consume the auth session contract; they must not
  depend on auth's private runtime internals.
- shared/ must not import app/ or module implementations. Reusable contracts
  belong with shared code when genuinely shared; concrete module adapters remain
  module-owned.
- Module implementations must not import app composition. Avoid circular imports.
- Prefer direct imports; this convention does not require barrel exports or aliases.

## Migration and review

Move existing code mechanically before changing its behavior. Keep current test
roots and runner discovery unless separately agreed. Update imports, documentation
and structural checks together. The component-style checker accepts direct module
layouts, requires matching CSS imports for styled layouts and rejects multiple direct layouts per module.
Shared layouts retain component-named folders.

Use #59's dedicated auth pages as the migration baseline. The separate #60 decision
owns removal or consolidation of currently unused domain scaffolding; avoid
inventing consumers or moving it into shared to justify its existence.
