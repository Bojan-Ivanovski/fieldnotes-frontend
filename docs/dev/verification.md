# Frontend verification

Use Node.js 24 and npm from the repository root:

```sh
npm ci
npm run lint
npm test
npm run build
npx playwright install chromium
npx playwright test
```

The Playwright configuration starts the Vite development server on
`127.0.0.1:4173`. The GitHub Actions workflow installs Chromium with system dependencies and
runs these checks on pushes and pull requests. It pins its GitHub Actions by commit SHA and keeps
`FOLTIVO_LIVE_AUTH` disabled.

The live authentication browser flow needs the Go API, SMTP and Mailpit. It is
opt-in and remains a local integration check; hosted CI does not provision those
services or claim that live auth verification passed. Set `FOLTIVO_LIVE_AUTH=1`
only when those local services are configured, then run:

```sh
FOLTIVO_APP_ORIGIN=http://localhost:4173 FOLTIVO_LIVE_AUTH=1 \
  npx playwright test tests/e2e/auth-live.spec.ts --workers=1
```

Use backend `APP_ORIGIN=http://localhost:4173` for the live suite; numeric IPs
cannot act as WebAuthn relying-party IDs. See [authentication](authentication.md).

## UI package provenance

`vendor/fieldnotes-ui-0.4.0.tgz` is the existing Fieldnotes UI package, copied
without modification from the artifact already used by this repository. The
legacy package name is intentional compatibility, as described in branding.md.
The archive includes its MIT license and third-party notices. Its SHA-256 is
`cf0df94681bf231bb8fb12fa087bc0ebb1edf1fdb901e874e8955a73d83da62a`.
Keeping this exact archive in the checkout removes the previous dependency on a
contributor's Downloads directory; it does not upgrade the component library.
