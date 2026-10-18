# Account lifecycle completion

Frontend #11 groups its settings foundation (#53) and four completion slices:
#67 verified email changes, #68 session management, #69 linked providers and
#70 recoverable closure. Backend tickets #9–#12 own the corresponding Go services.
The developer selected GitHub and Google and a 30-day account recovery window.

## Account and email identity

The current email remains the sign-in identity until the new address is verified.
A pending request is bound to the account, target address, expiry and security
version. Replacement/cancellation invalidates earlier requests. Confirmation
requires the matching authenticated account and an explicit submit; visiting an
email link alone does not change identity. Success invalidates sessions and
pending security operations. Existing TOTP, passkeys and linked providers remain
attached to the same immutable account ID. The old address receives a notice.

## Linked providers

GitHub and Google authenticate already-linked accounts. Link/unlink is deliberate
and requires recent account assurance. A matching email from a provider does not
merge accounts or establish ownership. Accounts retain password sign-in; this
work does not introduce provider-only registration. Provider sign-in must still
complete enrolled local MFA. Repository access and Git synchronization require
separate permissions and are not granted by sign-in.

Credentials are server-side configuration: OAUTH_GITHUB_CLIENT_ID,
OAUTH_GITHUB_CLIENT_SECRET, OAUTH_GITHUB_REDIRECT_URL and the corresponding
OAUTH_GOOGLE variables. Each registered callback is the deployment's same-origin
/api/v1/auth/providers/{github|google}/callback. OAuth app registration and valid
credentials are needed to exercise real provider redirects. Absent configuration
is shown honestly rather than simulated as successful sign-in.

## Session controls

Revoking other sessions retains the caller's current session. Individual current
session revocation and sign-out remain explicit. Display bounded browser/activity
metadata as untrusted text; older sessions without observed metadata use an
unknown fallback. Session activity is not proof of a trusted device.

## Recoverable closure

Closing an account requires recent assurance and explicit confirmation. It revokes
sessions and pending security operations immediately, blocks ordinary access and
starts a 30-day recovery interval. A deliberate recovery link plus account
password and enrolled authenticator/recovery proof restores the account before
the deadline. Recovery does not remove MFA, passkeys or linked identities and
does not grant an authenticated session automatically.

After expiry, the backend cleanup worker deletes current account-owned records
transactionally. Restore and purge must lock the same account so they cannot both
win. Records currently persisted are the account, personal Library identity,
sessions, factors, provider identities and email/security lifecycle data. No
organization membership, Folio/Book/Document or shared contribution tables exist
in the current backend; this implementation does not claim to erase content that
is not stored there.

Unresolved organization ownership must block closure. Future organization/content
features must register ownership blockers and define content disposition before
enabling their writes. The blocker registry is not itself organization-membership
implementation. Preserve FK integrity and rollback deletion when unknown dependent
resources prevent safe cleanup. Do not add cascading deletion of shared content
without an explicit product decision.

The selected future direction is deletion of personal Library content after the
recovery window, with organization ownership resolved first. Retention/attribution
for shared contributions needs its own content-feature design; do not promise a
policy through account UI before those resources and rules exist.

## Delivery evidence

Source integration and compilation do not establish successful provider traffic,
email delivery or a 30-day purge cycle. Record actual checks in the delivery PR.
No new automated tests are implied by these notes. Keep #11/#41 open until their
child delivery and required operational verification are recorded.
