# Fieldnotes

**A home for your thoughts.**

Fieldnotes is a Markdown-first workspace for writing and organizing knowledge
alongside projects, with thoughtful AI assistance built around your own material.
Documents remain portable Markdown, and assistance should stay transparent and
under the writer's control.

This repository is a fresh starting point for refining the product. The existing
[Fieldnotes project](https://github.com/Bojan-Ivanovski/fieldnotes) is reference
material for product direction and prior implementation, not a requirement to
carry every earlier design or feature forward.

## Development

This project currently uses React, TypeScript, and Vite.

```sh
npm install
npm run dev
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

Home and `/search` currently use sample content while the API is unavailable.
Use **Preview controls** in the banner to select anonymous, personal, or team
access and to review loading and failure scenarios. No real sign-in or account
creation takes place.

The reusable [mocks guide](src/mocks/README.md) explains fixtures and scenarios.
[Discovery integration notes](docs/dev/discovery.md) describe the service boundary
and the remaining live API requirements. Run `npm test` for behavior checks and
`npm run test:e2e` for Chromium browser checks.
