# Fieldnotes repository instructions

Read [the development process](docs/dev/process.md) before working in this repository.

## Component styles

Follow [component structure](docs/dev/component-structure.md): every TSX file
with local styles must be grouped as `Component/Component.tsx` alongside
`Component/Component.css`, imported directly by that TSX file. Keep component
styles, responsive rules, and animations together; global CSS is for resets and
foundations. Run `npm run check:component-styles` (also included in lint).
