# Code formatting

Prettier owns formatting; ESLint checks code quality and React rules.

- Run `npm run format` to format supported repository files.
- Run `npm run format:check` to report formatting drift without changing files.
- CI runs the formatting check before lint, tests and build.
- Editor integrations should use the repository-installed Prettier and `.prettierrc.json`.

Use two spaces, single quotes and no optional JavaScript semicolons. Prettier
handles wrapping and multiline JSX consistently. `.prettierignore` excludes
Markdown prose, vendored/public assets, generated lockfiles and generated output.
Keep that ignore list aligned with these boundaries when adding tools.
