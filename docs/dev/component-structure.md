# Component, TypeScript and stylesheet structure

Every TSX file with local styles must have its own directory and matching CSS
file. Import the stylesheet directly from the TSX file:

```text
SearchForm/
  SearchForm.tsx
  SearchForm.css
```

```tsx
import './SearchForm.css'
```

Use the component's exact name and capitalization for the directory and both
files. This applies to pages, layouts, illustrations, and ordinary components.
Keep responsive rules, keyframes, and state styles with the component that owns
them. Do not accumulate feature-wide component styling in a single stylesheet.
When moving a component, update its imports and all consumers.

Components that only compose other components and have no local styles do not
need an empty stylesheet or a directory solely for styling. Related TypeScript
modules still follow the grouping rule below. Library-provided
styling remains in the library. `src/index.css` is reserved for application-wide
resets and foundations, not component or page selectors.

Shared layout foundations belong to the layout's stylesheet. Page-specific
customizations belong to the page; reusable components own their base styles.
Avoid relying on accidental stylesheet import order for component overrides.

`npm run check:component-styles` checks directory/file names, direct stylesheet
imports, and orphaned component CSS. It runs as part of `npm run lint`. The check
uses JSX class/style attributes to identify styled TSX files; it does not attempt
to determine ownership of individual CSS selectors. Keep ownership clear during
review as well as satisfying the structural check.

This rule was requested and selected by the developer in
[issue #10](https://github.com/Bojan-Ivanovski/foltivo-frontend/issues/10).

## Related TypeScript files

When a component has related TypeScript implementation files, group them in a
folder named after the component, even when it has no local CSS:

```text
RouteMetadata/
  RouteMetadata.tsx
  route-metadata.ts
AuthProvider/
  AuthProvider.tsx
  context.ts
  runtime.ts
```

Keep component-specific helpers, context, hooks and runtime implementation in
that folder. Import the component and helpers directly from their files; a
barrel file is not required. Shared consumers may import a provider's context
hook without moving the context away from its provider.

Shared API clients, feature-wide types and domain helpers belong at the shared
feature/domain level or in a named concern folder when several related TS files
form a module. Choose the folder by ownership. Standalone files need no empty
companion modules or folders. Update consumers, test imports and documentation
references when moving files.

Code review enforces TypeScript ownership; the automated component-style check
continues to enforce the CSS rules only. This extension was requested by the
developer in [issue #58](https://github.com/Bojan-Ivanovski/foltivo-frontend/issues/58).
