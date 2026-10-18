/** Accept only the known provider authorization endpoint returned by our backend. */
export function providerAuthorizationUrl(
  value: string,
  provider: 'github' | 'google',
): string {
  const url = new URL(value)
  const allowed =
    provider === 'github'
      ? url.hostname === 'github.com' &&
        url.pathname === '/login/oauth/authorize'
      : url.hostname === 'accounts.google.com' &&
        url.pathname === '/o/oauth2/v2/auth'
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    !allowed
  )
    throw new Error(
      'The sign-in provider returned an invalid authorization address.',
    )
  return url.href
}
