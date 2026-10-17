# Development stack

This document records the current frontend stack and the decisions made for the Foltivo app. It separates packages already in the project from choices reserved for backend integration.

## Current frontend

- **Vite** serves the app during development and builds the production bundle.
- **React 19** and **TypeScript** power the user interface.
- **fieldnotes-ui** supplies the visual theme, controls, and reusable application patterns. The app currently uses its `ThemeProvider`, `ApplicationShell`, `Sidebar`, and core display and button components.
- **React Router 7** handles client-side navigation. Routes include public discovery, authentication flows and protected Account Settings; the notes/favorites screens remain starter routes.
- **ESLint** checks the code, and TypeScript checks types as part of the production build.

## Backend communication

The Go backend exposes **REST**. The frontend uses the browser's built-in `fetch` API.

**TanStack Query** manages discovery request state and cancellation. It is installed and currently calls the mock discovery adapter; content REST integration remains pending. Live authentication uses a separate
shared session runtime and protected QueryClient above routes. Use it for server request state, caching, refetching, and mutations as other screens gain data. Keep API calls in a small service layer so route components do not need to construct endpoint URLs or handle HTTP details directly.

## Markdown files

The app should support opening a Markdown file directly by URL and returning its raw contents. The delivery path is still to be decided with the backend: a `.md` URL may be served as a static resource or returned by a REST endpoint. The frontend should preserve the raw-file response separately from any future formatted Markdown view.

## Useful commands

```sh
npm run dev
npm run build
npm run lint
npm run preview
```

## Live account authentication

Go owns credentials and durable cookie sessions. The frontend uses its typed
same-origin fetch/CSRF client, Web Locks for cross-tab cookie coordination and
TanStack Query for protected account state. Authentication pages and settings
reuse fieldnotes-ui; qrcode renders enrollment QR images locally. See
[authentication](authentication.md) for setup, assurance states and boundaries.
The UI tarball is tracked under vendor for reproducible npm installs.

Earlier Better Auth/Clerk comparisons are preserved as
[historical research](authentication-research.md); they do not describe the
selected provider. Go uses PostgreSQL/pgx, Goose, Argon2id, pquerna/otp and
go-webauthn/webauthn. Resource authorization, OAuth, email changes and account
closure remain separate deliveries. Frontend #53 delivers only the supported
profile/security/session settings foundation under #11.
