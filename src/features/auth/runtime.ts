import { AuthError, authRequest } from './client.ts'
import type { Session } from './client.ts'
export interface AuthSnapshot { status: 'resolving' | 'ready' | 'unavailable'; session: Session | null; generation: number }
export function validSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<Session>
  if (!['anonymous', 'verification_required', 'mfa_required', 'authenticated'].includes(session.state ?? '') || typeof session.csrfToken !== 'string' || !session.csrfToken) return false
  if (!session.methods || ['password', 'totp', 'passkey'].some(method => typeof session.methods?.[method as keyof Session['methods']] !== 'boolean')) return false
  if (session.state === 'anonymous') return session.user === null
  const user = session.user
  if (!user || ['id', 'email', 'name', 'libraryId'].some(key => typeof user[key as keyof typeof user] !== 'string') || !user.id || !user.libraryId || !user.email || typeof user.emailVerified !== 'boolean') return false
  return session.state === 'verification_required' ? !user.emailVerified : user.emailVerified
}
const identityMutations = new Set(['/auth/login', '/auth/logout', '/auth/password/reset', '/auth/mfa/challenge', '/auth/passkeys/login/finish'])
export function createAuthRuntime(request = authRequest, clearProtected = () => {}) {
  let snapshot: AuthSnapshot = { status: 'resolving', session: null, generation: 0 }
  let requestGeneration = 0
  let identityEpoch = 0
  let identityInFlight = false
  let actorKey = ''
  let controller: AbortController | null = null
  const listeners = new Set<() => void>()
  function publish(next: Omit<AuthSnapshot, 'generation'>) {
    const key = `${next.status}:${next.session?.state}:${next.session?.user?.id}`
    if (actorKey !== key) { clearProtected(); actorKey = key }
    snapshot = { ...next, generation: snapshot.generation + 1 }
    listeners.forEach(listener => listener())
  }
  function invalidate() {
    ++identityEpoch; ++requestGeneration; controller?.abort()
    publish({ status: 'resolving', session: null })
  }
  async function refresh(invalidateIdentity = false) {
    if (invalidateIdentity) invalidate()
    if (identityInFlight) return
    const generation = ++requestGeneration
    controller?.abort()
    controller = new AbortController()
    try {
      const session = await request<Session>('/auth/session', { signal: controller.signal })
      if (!validSession(session)) throw new AuthError('Account services returned an invalid session.')
      if (generation === requestGeneration) {
        if (snapshot.session && (snapshot.session.user?.id !== session.user?.id || snapshot.session.state !== session.state)) ++identityEpoch
        publish({ status: 'ready', session })
      }
    } catch (error) {
      if (generation === requestGeneration && !(error instanceof Error && error.name === 'AbortError')) { ++identityEpoch; publish({ status: 'unavailable', session: null }) }
    }
  }
  async function mutate<T>(path: string, body: unknown = {}, method = 'POST'): Promise<T> {
    if (snapshot.status !== 'ready' || !snapshot.session) throw new AuthError('Your session must be checked before continuing.')
    const csrfToken = snapshot.session.csrfToken
    const changesIdentity = identityMutations.has(path) || (method === 'DELETE' && path.startsWith('/auth/sessions/'))
    if (changesIdentity) { identityInFlight = true; invalidate() }
    else { ++requestGeneration; controller?.abort(); clearProtected() }
    const epoch = identityEpoch
    try {
      const result = await request<T>(path, { method, body: method === 'DELETE' ? undefined : body, csrfToken })
      if (epoch !== identityEpoch) throw new AuthError('Your account changed. Please retry from your current account.', 'session_changed', 409)
      return result
    } finally {
      // Account reads may have completed with pre-mutation values while the
      // write was pending. Discard them again before publishing fresh state.
      if (epoch === identityEpoch) clearProtected()
      // A response from the previous actor cannot refresh or overwrite the new actor.
      if (changesIdentity) {
        identityInFlight = false
        await refresh(epoch !== identityEpoch)
      } else if (epoch === identityEpoch) await refresh()
    }
  }
  return { getSnapshot: () => snapshot, subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } }, refresh, mutate,
    dispose() { ++identityEpoch; ++requestGeneration; controller?.abort() }, }
}
