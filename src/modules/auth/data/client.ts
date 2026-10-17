export interface Account {
  id: string
  email: string
  name: string
  emailVerified: boolean
  libraryId: string
}
export type SessionState =
  'anonymous' | 'verification_required' | 'mfa_required' | 'authenticated'
export interface Session {
  state: SessionState
  user: Account | null
  csrfToken: string
  methods: { password: boolean; totp: boolean; passkey: boolean }
}
export interface Security {
  totpEnabled: boolean
  recoveryCodesRemaining: number
  passkeys: { id: string; name: string; createdAt: string }[]
}
export interface AccountSession {
  id: string
  current: boolean
  createdAt: string
  expiresAt: string
}
export class AuthError extends Error {
  code: string
  status: number
  constructor(message: string, code = 'unavailable', status = 503) {
    super(message)
    this.name = 'AuthError'
    this.code = code
    this.status = status
  }
}
export function safeReturnTo(value: string | null): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    /[\\#]/.test(value) ||
    Array.from(value).some((char) => char.charCodeAt(0) < 32)
  )
    return '/settings'
  try {
    const url = new URL(value, 'https://foltivo.local')
    if (
      url.origin !== 'https://foltivo.local' ||
      /^\/(sign-in|sign-up|verify-email|forgot-password|reset-password|mfa)(\/|$)/i.test(
        decodeURIComponent(url.pathname),
      )
    )
      return '/settings'
    url.searchParams.delete('token')
    return url.pathname + url.search
  } catch {
    return '/settings'
  }
}
type Coordinate = <T>(operation: () => Promise<T>) => Promise<T>
const cookieRequests = new Set([
  '/auth/session',
  '/auth/login',
  '/auth/logout',
  '/auth/mfa/challenge',
  '/auth/passkeys/login/finish',
])
async function coordinateBrowserSession<T>(
  operation: () => Promise<T>,
): Promise<T> {
  if (typeof window === 'undefined') return operation()
  if (!navigator.locks)
    throw new AuthError(
      'This browser cannot safely coordinate account sessions. Use a current browser in a secure context.',
    )
  return navigator.locks.request('foltivo-auth-session', operation)
}
export function createAuthClient(
  fetcher: typeof fetch = fetch,
  coordinate: Coordinate = coordinateBrowserSession,
) {
  async function send<T>(
    path: string,
    options: {
      method?: string
      body?: unknown
      csrfToken?: string
      signal?: AbortSignal
    } = {},
  ): Promise<T> {
    const method = options.method ?? 'GET'
    let response: Response
    try {
      response = await fetcher(`/api/v1${path}`, {
        method,
        credentials: 'include',
        cache: 'no-store',
        signal: options.signal,
        headers: {
          ...(method === 'GET'
            ? {}
            : {
                'Content-Type': 'application/json',
                'X-CSRF-Token': options.csrfToken ?? '',
              }),
        },
        ...(options.body === undefined
          ? {}
          : { body: JSON.stringify(options.body) }),
      })
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw error
      throw new AuthError('Account services are unavailable. Please try again.')
    }
    const data = await response.json().catch(() => null)
    if (!response.ok)
      throw new AuthError(
        data?.error?.message ?? 'The request could not be completed.',
        data?.error?.code ?? 'unavailable',
        response.status,
      )
    if (!data || typeof data !== 'object')
      throw new AuthError('Account services returned an invalid response.')
    return data as T
  }
  return function request<T>(
    path: string,
    options: Parameters<typeof send>[1] = {},
  ): Promise<T> {
    return cookieRequests.has(path) ||
      (options.method === 'DELETE' && path.startsWith('/auth/sessions/'))
      ? coordinate(() => send<T>(path, options))
      : send<T>(path, options)
  }
}
export const authRequest = createAuthClient()
