import assert from 'node:assert/strict'
import test from 'node:test'
import { AuthError, createAuthClient, safeReturnTo } from '../src/features/auth/client.ts'
import type { Session } from '../src/features/auth/client.ts'
import { createAuthRuntime } from '../src/features/auth/runtime.ts'
const anonymous: Session = { state: 'anonymous', user: null, csrfToken: 'csrf-a', methods: { password: true, totp: true, passkey: true } }
const authenticated: Session = { ...anonymous, state: 'authenticated', user: { id: 'alice', email: 'alice@example.test', name: 'Alice', emailVerified: true, libraryId: 'library-a' } }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
test('return destinations remain local and cannot carry link tokens or auth loops', () => {
  for (const url of [null, '', '//evil.test', 'https://evil.test', '/\\evil.test', '/sign-in?returnTo=/settings', '/mfa', '/SIGN-IN', '/%73ign-in', '/path#token=secret', '/\t/evil']) assert.equal(safeReturnTo(url), '/settings')
  assert.equal(safeReturnTo('/search?q=notes&token=secret'), '/search?q=notes')
  assert.equal(safeReturnTo('/settings'), '/settings')
})
test('typed API transport includes credentials, CSRF and exact JSON without altering passwords', async () => {
  let request: RequestInit | undefined
  let url: RequestInfo | URL | undefined
  const client = createAuthClient(async (input, init) => { url = input; request = init; return json(anonymous) })
  await client('/auth/login', { method: 'POST', body: { password: ' a long password ' }, csrfToken: 'csrf-a' })
  assert.equal(url, '/api/v1/auth/login')
  assert.equal(request?.credentials, 'include')
  assert.equal(request?.cache, 'no-store')
  assert.equal(new Headers(request?.headers).get('X-CSRF-Token'), 'csrf-a')
  assert.deepEqual(JSON.parse(String(request?.body)), { password: ' a long password ' })
})
test('API errors stay errors and malformed/unavailable responses never become anonymous', async () => {
  const denied = createAuthClient(async () => json({ error: { code: 'mfa_required', message: 'Verify your factor.' } }, 403))
  await assert.rejects(denied('/me'), (error: unknown) => error instanceof AuthError && error.code === 'mfa_required' && error.status === 403)
  const outage = createAuthClient(async () => { throw new Error('network') })
  await assert.rejects(outage('/auth/session'), AuthError)
  const invalid = createAuthClient(async () => new Response('<html>gateway failure</html>', { status: 200 }))
  await assert.rejects(invalid('/auth/session'), AuthError)
})
test('obsolete session responses cannot restore a previous actor', async () => {
  const resolvers: ((value: Response) => void)[] = []
  const client = createAuthClient(() => new Promise(resolve => resolvers.push(resolve)))
  let clears = 0
  const runtime = createAuthRuntime(client, () => { clears++ })
  const first = runtime.refresh()
  const second = runtime.refresh()
  resolvers[1](json(anonymous)); await second
  resolvers[0](json(authenticated)); await first
  assert.equal(runtime.getSnapshot().session?.state, 'anonymous')
  assert.equal(clears, 1)
})
test('mutations rotate CSRF state and clear protected data before notifying a changed actor', async () => {
  let csrf = ''
  let next = authenticated
  const events: string[] = []
  const client = createAuthClient(async (url, init) => {
    if (String(url).endsWith('/auth/logout')) { csrf = new Headers(init?.headers).get('X-CSRF-Token') ?? ''; next = { ...anonymous, csrfToken: 'csrf-b' }; return json(next) }
    return json(next)
  })
  const runtime = createAuthRuntime(client, () => events.push('clear'))
  runtime.subscribe(() => events.push(`notify:${runtime.getSnapshot().session?.state}`))
  await runtime.refresh()
  await runtime.mutate('/auth/logout')
  assert.equal(csrf, 'csrf-a')
  assert.equal(runtime.getSnapshot().session?.csrfToken, 'csrf-b')
  assert.equal(events.at(-2), 'clear')
  assert.equal(events.at(-1), 'notify:anonymous')
})
test('session outage clears protected account state and rejects mutations until resolution', async () => {
  let failure = false
  const client = createAuthClient(async () => { if (failure) throw new Error('offline'); return json(authenticated) })
  const runtime = createAuthRuntime(client)
  await runtime.refresh(); failure = true; await runtime.refresh()
  assert.equal(runtime.getSnapshot().status, 'unavailable')
  assert.equal(runtime.getSnapshot().session, null)
  await assert.rejects(runtime.mutate('/auth/logout'), AuthError)
})
test('logout and external account changes synchronously hide protected identity before their response', async () => {
  let response: ((value: Response) => void) | undefined
  let delayed = false
  const runtime = createAuthRuntime(createAuthClient(async () => delayed ? new Promise(resolve => { response = resolve }) : json(authenticated)))
  await runtime.refresh(); delayed = true
  const logout = runtime.mutate('/auth/logout')
  assert.equal(runtime.getSnapshot().status, 'resolving')
  assert.equal(runtime.getSnapshot().session, null)
  delayed = false; response!(json(anonymous)); await logout
  delayed = true
  const external = runtime.refresh(true)
  assert.equal(runtime.getSnapshot().status, 'resolving')
  assert.equal(runtime.getSnapshot().session, null)
  response!(json(authenticated)); await external
})
test('profile drafts stay mounted during same-account requests; stale mutation result is rejected after external switch', async () => {
  let response: ((value: Response) => void) | undefined
  const client = createAuthClient(async url => String(url).endsWith('/auth/profile') ? new Promise(resolve => { response = resolve }) : json(authenticated))
  const runtime = createAuthRuntime(client)
  await runtime.refresh()
  const mutation = runtime.mutate('/auth/profile', { name: 'Draft' }, 'PATCH')
  assert.equal(runtime.getSnapshot().status, 'ready')
  await runtime.refresh(true)
  response!(json({ user: authenticated.user }))
  await assert.rejects(mutation, (error: unknown) => error instanceof AuthError && error.code === 'session_changed')
})
test('malformed users, methods and inconsistent assurance never authenticate a browser', async () => {
  for (const session of [
    { ...authenticated, user: { ...authenticated.user, id: undefined } },
    { ...authenticated, user: { ...authenticated.user, emailVerified: false } },
    { ...authenticated, methods: { password: true, totp: 'yes', passkey: true } },
    { ...anonymous, user: authenticated.user },
    { ...authenticated, state: 'verification_required' },
  ]) {
    const runtime = createAuthRuntime(createAuthClient(async () => json(session)))
    await runtime.refresh()
    assert.equal(runtime.getSnapshot().status, 'unavailable')
    assert.equal(runtime.getSnapshot().session, null)
  }
})
