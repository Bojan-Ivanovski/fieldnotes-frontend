# Authentication development

The frontend consumes the Go service in
[foltivo-backend](https://github.com/Bojan-Ivanovski/foltivo-backend). The versioned
contract is maintained there in `docs/api/authentication.md`. Go and PostgreSQL
own credentials, email delivery, sessions, assurance and authorization. Browser
route guards only control presentation.

## Local startup

Start PostgreSQL and Mailpit, apply all backend migrations, and run the API using
the backend README. Keep its encryption key persistent and its environment file
ignored. Set backend `APP_ORIGIN=http://localhost:5173` for the normal Vite port;
the hostname is required for local WebAuthn passkeys. Browse the same origin.

From this repository:

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Vite proxies `/api` to `http://127.0.0.1:8080`. Set `FOLTIVO_API_TARGET` when the
backend listens elsewhere. Origin is preserved. Production must route `/api`
through the application's HTTPS origin; the Vite development proxy is not a
production reverse proxy. The backend enforces production cookie, origin,
database TLS and SMTP configuration independently.

## Identity and account flows

`AuthProvider` owns one runtime above routes and a protected query cache.
`client.ts` sends same-origin cookies and the current session CSRF header;
passwords are never trimmed and cookies/tokens are never kept in localStorage.
The cross-tab storage value is an invalidation signal only. Cookie-changing
requests, including current-session revocation, and session reads share a named
Web Lock across tabs. Authentication requires a current browser with Web Locks
in a secure context (HTTPS or localhost); it fails visibly when coordination is
unavailable. A late session response must not overwrite a newer sign-in cookie.
Focus refreshes do not publish the previous actor while identity changes are
in flight. Pending requests and
late responses cannot restore a previous identity. Account changes clear
protected data before consumers are notified. Same-account forms remain mounted
so drafts and one-time recovery-code display survive successful mutations.

The API states are anonymous, verification required, MFA required and
authenticated. The browser also handles resolving and unavailable states. An
outage never becomes mock success. Password submission alone cannot authorize
settings. Registration sends real verification mail without signing in. Email
verification and password reset lead back to sign-in; reset preserves factors.
Fragment tokens are captured in memory and removed from the address bar.

The auth layout provides sign-in, registration, verification/resend, recovery,
reset and MFA/recovery-code pages using the existing UI library. Local return
destinations are validated. Account settings provides profile changes, password
changes, session revocation, TOTP setup with a locally generated QR code, one-time
recovery-code display/download and passkey enrollment/removal. Sensitive actions
require server-verified recent authentication. Use a fresh TOTP code for each
operation; accepted steps cannot be replayed. If the authenticator is lost,
security management accepts the account password and an unused saved recovery
code through an explicit alternate entry mode. A backup remains single use and
recovery revokes other sessions. Passkeys require browser support,
a secure context and server-validated user verification.

Public content discovery remains sample data until its API delivery. The preview
banner and chooser explicitly identify that boundary. A real account is never
fed into sample access lists, and an API failure never selects a preview account.
Organization membership, content permissions, OAuth, email changes and account
closure remain separate product work.

## Verification

```sh
npm run lint
npm test
npm run build
npx playwright test tests/e2e/auth-pages.spec.ts tests/e2e/branding.spec.ts tests/e2e/discovery.spec.ts
```

The live browser test uses actual Go/PostgreSQL/Mailpit services and a Chromium
CTAP2 virtual authenticator. Configure backend `APP_ORIGIN=http://localhost:4173`,
API port 8080, Mailpit SMTP port 1025 and inbox HTTP port 8025, then run:

```sh
FOLTIVO_APP_ORIGIN=http://localhost:4173 FOLTIVO_LIVE_AUTH=1 \
  npx playwright test tests/e2e/auth-live.spec.ts --workers=1
```

Each fresh run creates a disposable verified test account and exercises profile
persistence, MFA/recovery, passkeys, password reset and protected access. Keep
the normal rate limits: frequent reruns can legitimately throttle this dedicated
test database. Never clear production throttles to make tests pass. The optional
existing-email mode only initializes a core account through reset; it does not
remove previously enrolled factors. Live traces are disabled to avoid recording
credentials or recovery material. Offline tests require no live service.
