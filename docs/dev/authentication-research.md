# Authentication decisions and historical research

This research began before the Foltivo rebrand, when the product was named
Fieldnotes. The original comparisons below are retained as historical context;
they do not select or configure a provider.

Research prepared 17 October 2026. The selected implementation is now Go-owned
authentication in [foltivo-backend](https://github.com/Bojan-Ivanovski/foltivo-backend),
with frontend integration on `feature/6-authentication`. See the current
[authentication development guide](authentication.md) and the backend's
[API contract](https://github.com/Bojan-Ivanovski/foltivo-backend/blob/develop/docs/api/authentication.md).
Implementation, ticket completion and merging are separate states: the local
implementation does not imply it has been merged into develop or main.

## Related work

- #6: authentication pages and presentation.
- #7: accounts, verification, recovery, and sessions.
- #8: resource authorization.
- #9: MFA, passkeys, and factor recovery.

## Decisions and historical alternatives

| Issue | Historical alternatives | Current decision |
| --- | --- | --- |
| #6 | Quiet atlas split layout or compact centered panel | Quiet atlas layout selected and implemented. |
| #7 | Better Auth or Clerk | Superseded by application-owned Go authentication; no Node authentication service or managed identity provider. |
| #8 | CASL or OpenFGA | Resource authorization remains separate; the Go backend needs its own policy analysis and enforcement. |
| #9 | TOTP-first or passkey-first assurance | TOTP-first enrollment with recovery codes and server-verified discoverable passkeys implemented. |

Go owns password hashing, durable opaque cookie sessions, email verification and
recovery, TOTP and passkeys. PostgreSQL persists identity and assurance; the
frontend consumes the REST contract with CSRF protection and explicit partial
session states. Verified passkeys can satisfy MFA; password reset does not clear
factors. A password plus an unused saved recovery code can authorize explicit
lost-authenticator management. Losing all factors and backup codes has no
automated email-only bypass. Trusted-device exemptions are not implemented.

Frontend #46–#48 cover the client, lifecycle integration and shared runtime;
#51/#52 cover reproducible CI and cross-tab cookie coordination. The settings
foundation is #53. Broader Account Settings #11 remains open for email changes,
provider linking, account closure and notification integration. OAuth and content
resource permissions were not delivered by the authentication foundation.

## Selected visual direction

The selected pages use a quiet Foltivo split layout on desktop: a forest-toned
illustration panel with subtle atlas/folio linework beside a focused form panel. Retain
serif headings, readable sans-serif controls, existing theme tokens, thin borders,
and restrained rounding. Keep the form roughly 400 pixels wide; on mobile place
it first in one column and remove decorative artwork. This direction is
implemented by the auth layout; the development guide records current behavior
and setup.

Use one clear primary action, explicit sign-in/sign-up headings, persistent
labels, password visibility controls, and inline errors plus a focused summary.
Keep social login visually secondary and show only enabled methods. Preserve
public exploration and a validated local return destination. MFA and recovery
reuse the same shell, with a paste-friendly code input rather than separate
mandatory character boxes. No organization enrollment is required for personal
accounts.

The interaction guidance is informed by [W3C accessible authentication](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html)
and [GOV.UK password patterns](https://design-system.service.gov.uk/patterns/passwords/):
support password managers, paste, meaningful labels/autocomplete, and usable
password recovery. The palette and illustration treatment are our design
recommendation; the sources do not prescribe them.

## Historical authentication candidates

| Candidate | Original evaluation | Trade-off |
| --- | --- | --- |
| [Better Auth](https://better-auth.com/docs/introduction) | Self-hosted TypeScript accounts/sessions considered before the Go-only decision. | We operate the backend, database, email delivery, migrations, and security configuration. |
| [Clerk](https://clerk.com/docs/guides/configure/auth-strategies/sign-up-sign-in-options) | Managed identity and supported account/MFA flows with React integration. | External identity service, configuration/plan constraints, and less operational/data independence. Verify current commercial terms before selecting. |

The original comparison of [Better Auth's 2FA plugin](https://better-auth.com/docs/plugins/2fa) covered
TOTP, backup codes, enrollment, and trusted-device support. Its documented default
challenge behavior does not cover every OAuth/passwordless sign-in method.
Enabling passwordless factor management is not equivalent to enforcing MFA on
those methods. Define and test the assurance policy explicitly.

Better Auth offers a [passkey plugin](https://better-auth.com/docs/plugins).
Passkeys and a password-plus-TOTP flow are distinct experiences; user verification
and the selected provider's policy determine whether a passkey satisfies the
required assurance. Do not advertise every passkey as an automatically enforced
second factor. Clerk also documents [MFA recovery](https://clerk.com/docs/guides/secure/mfa-recovery)
and custom factor-management flows.

These links preserve the original comparison and are not current integration
instructions. Neither provider is installed. Any future reconsideration requires
fresh maintenance, API and security research; Go dependency versions are recorded
in the backend go.mod.

## Historical authorization candidates and remaining Go work

Authentication identifies the account. Foltivo authorization decides which
Library, Book, Folio, version, or document it can read or modify.

[CASL](https://github.com/stalniy/casl) is an in-process TypeScript/JavaScript
policy candidate for defining actions, resources, and conditions. It can help
express policy, but database query filtering and server-side enforcement still
need implementation. Browser capability checks are presentation only. The earlier
preference for CASL preceded the Go backend decision. CASL in the
browser cannot enforce the Go API; it is not the selected server policy engine.

[OpenFGA](https://openfga.dev/) is a relationship-based authorization service
candidate if sharing relationships justify a separate policy service. It adds
model/storage/consistency and operational work; adoption still requires Go-aware analysis of
that trade-off. Neither solution should infer Folio access merely from
a Book reference.

An authentication provider's organization plugin is not a complete Foltivo
resource policy. User Libraries must work independently of organization
membership. Repository push permissions remain a separate boundary from both
Foltivo login and Folio editing rights.
