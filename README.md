# Foltivo

**A home for your thoughts.**

Foltivo is a Markdown-first workspace for writing and organizing knowledge
alongside projects, with thoughtful AI assistance built around your own material.
Documents remain portable Markdown, and assistance should stay transparent and
under the writer's control.

This repository is a fresh starting point for refining Foltivo. The earlier
[Fieldnotes project](https://github.com/Bojan-Ivanovski/fieldnotes) is historical reference
material for product direction and prior implementation, not a requirement to
carry every earlier design or feature forward.

The intended public website is **https://foltivo.com**. This name and domain
decision does not mean deployment, DNS, TLS, or sign-in providers are configured.
The frontend integrates real Go-backed account authentication. Content discovery
remains an explicitly labeled sample preview.

The UI package still uses its original `fieldnotes-ui` identifiers; see the
[branding and compatibility guide](docs/dev/branding.md). The GitHub repository is now `Bojan-Ivanovski/foltivo-frontend`; the historical
predecessor project retains its original name.

## Development

This project currently uses React, TypeScript, and Vite.

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Available checks and build commands:

```sh
npm run lint
npm test
npm run build
npm run preview
```

## Contributing and work tracking

Create work items, epics, and incident reports with the forms under
[`.github/ISSUE_TEMPLATE`](.github/ISSUE_TEMPLATE). The staged issue workflow and
GitHub CLI conventions are documented in [the development process](docs/dev/process.md).
Repository instructions for coding agents are in [AGENTS.md](AGENTS.md).
The agreed [content model](docs/dev/content-model.md) defines User Libraries,
Organization Libraries, and the Books and Folios used by future pages.

## Home and discovery preview

Home and `/search` currently use sample content until the content API is implemented.
Use **Preview controls** in the banner to select anonymous, personal, or team
access and to review loading and failure scenarios. These sample identities are
separate from real sign-in and never authorize live account access.

The reusable [mocks guide](src/modules/discovery/data/mocks/README.md) explains fixtures and scenarios.
[Discovery integration notes](docs/dev/discovery.md) describe the service boundary
and the remaining live API requirements. Run `npm test` for behavior checks and
`npm run test:e2e` for Chromium browser checks.

## Authentication

Start [foltivo-backend](https://github.com/Bojan-Ivanovski/foltivo-backend) with
PostgreSQL, migrations and Mailpit, and set its APP_ORIGIN to the frontend origin
(`http://localhost:5173` normally). Browse localhost for passkey support. Account
creation, email verification/recovery, TOTP, passkeys and protected account
settings use the live Go API; service failures never select a preview account.

See [authentication setup](docs/dev/authentication.md) and
[verification](docs/dev/verification.md) for environment configuration and the
gated full-stack browser test. The existing UI package is vendored so a clean
checkout does not depend on files outside this repository.
