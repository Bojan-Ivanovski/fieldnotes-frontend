# Development stack

This document records the current frontend stack and the decisions made for the Fieldnotes app. It separates packages already in the project from choices reserved for backend integration.

## Current frontend

- **Vite** serves the app during development and builds the production bundle.
- **React 19** and **TypeScript** power the user interface.
- **fieldnotes-ui** supplies the visual theme, controls, and reusable application patterns. The app currently uses its `ThemeProvider`, `ApplicationShell`, `Sidebar`, and core display and button components.
- **React Router 7** handles client-side navigation. The current shell has starter routes for Home, All notes, Favorites, Settings, and New note.
- **ESLint** checks the code, and TypeScript checks types as part of the production build.

## Backend communication

The backend API will use **REST**. Requests can use the browser's built-in `fetch` API.

**TanStack Query** manages discovery request state and cancellation. It is installed and currently calls the mock discovery adapter; live REST integration remains pending. Use it for server request state, caching, refetching, and mutations as other screens gain data. Keep API calls in a small service layer so route components do not need to construct endpoint URLs or handle HTTP details directly.

## Markdown files

The app should support opening a Markdown file directly by URL and returning its raw contents. The delivery path is still to be decided with the backend: a `.md` URL may be served as a static resource or returned by a REST endpoint. The frontend should preserve the raw-file response separately from any future formatted Markdown view.

## Useful commands

```sh
npm run dev
npm run build
npm run lint
npm run preview
```
