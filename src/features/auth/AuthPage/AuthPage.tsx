import './AuthPage.css'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Alert, Button, Field, Input } from 'fieldnotes-ui'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { safeReturnTo } from '../client.ts'
import { useAuth } from '../context.ts'
import { PasswordField } from '../PasswordField/PasswordField.tsx'
import { passkeysSupported, authenticatePasskey } from '../passkeys.ts'
type Page =
  | 'sign-in'
  | 'sign-up'
  | 'verify-email'
  | 'forgot-password'
  | 'reset-password'
  | 'mfa'
const titles: Record<Page, string> = {
  'sign-in': 'Welcome back.',
  'sign-up': 'Make room for your ideas.',
  'verify-email': 'Check your email.',
  'forgot-password': 'Find your way back.',
  'reset-password': 'Choose a new password.',
  mfa: 'One more step.',
}
const descriptions: Record<Page, string> = {
  'sign-in': 'Sign in to your personal Library.',
  'sign-up': 'Create your personal Library. No organization required.',
  'verify-email':
    'Open the verification link in your email, or request another below.',
  'forgot-password':
    'We’ll email you a link to reset your password if an account is eligible.',
  'reset-password':
    'Your new password will sign out existing sessions. Your security factors stay enabled.',
  mfa: 'Enter a code from your authenticator app or a single-use recovery code.',
}
export function AuthPage({ page }: { page: Page }) {
  const auth = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = safeReturnTo(params.get('returnTo'))
  const [token] = useState(() => {
    const value =
      new URLSearchParams(window.location.hash.slice(1)).get('token') ?? ''
    if (window.location.hash)
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      )
    return value
  })
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [recovery, setRecovery] = useState(false)
  const state = auth.session?.state
  const ready = auth.status === 'ready'
  useEffect(() => {
    if (!ready) return
    if (
      state === 'authenticated' &&
      (page === 'sign-in' || page === 'sign-up' || page === 'mfa')
    )
      navigate(returnTo, { replace: true })
    if (
      (page === 'sign-in' || page === 'mfa') &&
      state === 'verification_required'
    )
      navigate(`/verify-email?returnTo=${encodeURIComponent(returnTo)}`, {
        replace: true,
      })
    if (page === 'sign-in' && state === 'mfa_required')
      navigate(`/mfa?returnTo=${encodeURIComponent(returnTo)}`, {
        replace: true,
      })
    if (page === 'mfa' && state === 'anonymous')
      navigate(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`, {
        replace: true,
      })
  }, [ready, state, page, returnTo, navigate])
  async function perform(action: () => Promise<void>) {
    setPending(true)
    setError('')
    setMessage('')
    try {
      await action()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Please try again.')
    } finally {
      setPending(false)
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const value = (name: string) => String(form.get(name) ?? '')
    void perform(async () => {
      if (page === 'sign-in')
        await auth.mutate('/auth/login', {
          email: value('email'),
          password: value('password'),
        })
      if (page === 'sign-up') {
        await auth.mutate('/auth/register', {
          name: value('name'),
          email: value('email'),
          password: value('password'),
        })
        setMessage(
          'Check your email for a verification link. You can sign in after verifying your address.',
        )
      }
      if (page === 'verify-email') {
        await auth.mutate(
          token ? '/auth/verification/confirm' : '/auth/verification/resend',
          token ? { token } : { email: value('email') },
        )
        setMessage(
          token
            ? 'Your email is verified. Continue to sign in.'
            : 'If your account needs verification, a link will be sent to that address.',
        )
      }
      if (page === 'forgot-password') {
        await auth.mutate('/auth/password/forgot', { email: value('email') })
        setMessage(
          'If an eligible account exists, a reset link will be sent to that address.',
        )
      }
      if (page === 'reset-password') {
        await auth.mutate('/auth/password/reset', {
          token,
          password: value('password'),
        })
        setMessage(
          'Your password has been reset. Sign in with your new password.',
        )
      }
      if (page === 'mfa')
        await auth.mutate('/auth/mfa/challenge', {
          [recovery ? 'recoveryCode' : 'code']: value('code'),
        })
    })
  }
  const emailNeeded =
    ['sign-in', 'sign-up', 'forgot-password'].includes(page) ||
    (page === 'verify-email' && !token)
  const passwordNeeded = ['sign-in', 'sign-up', 'reset-password'].includes(page)
  const completed =
    Boolean(message) &&
    ((page === 'verify-email' && Boolean(token)) ||
      ['reset-password', 'sign-up'].includes(page))
  return (
    <section className="auth-page" aria-labelledby="auth-title">
      <p className="auth-eyebrow">YOUR OWN LITTLE CORNER</p>
      <h1 id="auth-title">{titles[page]}</h1>
      <p>{descriptions[page]}</p>
      {auth.status === 'resolving' && (
        <p role="status">Checking your session…</p>
      )}
      {auth.status === 'unavailable' && (
        <Alert tone="destructive">
          <p>
            Account services are unavailable. Your session could not be checked.
          </p>
          <Button
            type="button"
            onClick={() => {
              void auth.refresh()
            }}
          >
            Try again
          </Button>
        </Alert>
      )}
      {error && (
        <Alert tone="destructive" role="alert">
          {error}
        </Alert>
      )}
      {message && (
        <Alert tone="success" role="status">
          {message}
        </Alert>
      )}
      {page === 'reset-password' && !token ? (
        <Alert tone="warning">
          This reset link is missing its token.{' '}
          <Link to="/forgot-password">Request a new link.</Link>
        </Alert>
      ) : (
        !completed && (
          <form onSubmit={submit} aria-busy={pending}>
            <fieldset disabled={!ready || pending}>
              {page === 'sign-up' && (
                <Field label="Display name" controlId="name">
                  {(props) => (
                    <Input
                      {...props}
                      name="name"
                      autoComplete="name"
                      maxLength={100}
                      required
                    />
                  )}
                </Field>
              )}
              {emailNeeded && (
                <Field label="Email" controlId="email">
                  {(props) => (
                    <Input
                      {...props}
                      name="email"
                      type="email"
                      autoComplete="email"
                      maxLength={254}
                      defaultValue={auth.session?.user?.email ?? ''}
                      required
                    />
                  )}
                </Field>
              )}
              {passwordNeeded && (
                <PasswordField
                  newPassword={page !== 'sign-in'}
                  autoComplete={
                    page === 'sign-in' ? 'current-password' : 'new-password'
                  }
                />
              )}
              {page === 'mfa' && (
                <Field
                  label={recovery ? 'Recovery code' : 'Authenticator code'}
                  controlId="code"
                >
                  {(props) => (
                    <Input
                      {...props}
                      key={recovery ? 'recovery' : 'totp'}
                      name="code"
                      autoComplete="one-time-code"
                      inputMode={recovery ? 'text' : 'numeric'}
                      pattern={recovery ? undefined : '[0-9]{6}'}
                      maxLength={recovery ? 128 : 6}
                      required
                    />
                  )}
                </Field>
              )}
              <Button type="submit" size="lg">
                {pending
                  ? 'Please wait…'
                  : page === 'sign-in'
                    ? 'Sign in'
                    : page === 'sign-up'
                      ? 'Create account'
                      : page === 'verify-email'
                        ? token
                          ? 'Verify email'
                          : 'Resend verification email'
                        : page === 'forgot-password'
                          ? 'Send reset link'
                          : page === 'reset-password'
                            ? 'Reset password'
                            : 'Verify and continue'}
              </Button>
            </fieldset>
          </form>
        )
      )}
      {page === 'sign-in' &&
        ready &&
        auth.session?.methods.passkey &&
        passkeysSupported() && (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
              const email = (
                document.getElementById('email') as HTMLInputElement | null
              )?.value
              if (!email) {
                setError('Enter your email to sign in with a passkey.')
                return
              }
              void perform(async () => {
                const options = await auth.mutate<
                  Parameters<typeof authenticatePasskey>[0]
                >('/auth/passkeys/login/begin', { email })
                const credential = await authenticatePasskey(options)
                await auth.mutate('/auth/passkeys/login/finish', credential)
              })
            }}
          >
            Sign in with a passkey
          </Button>
        )}
      {page === 'mfa' && (
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => {
            setRecovery(!recovery)
            setError('')
          }}
        >
          {recovery ? 'Use an authenticator code' : 'Use a recovery code'}
        </Button>
      )}
      {page === 'sign-in' && (
        <div className="auth-links">
          <Link to="/forgot-password">Forgot your password?</Link>
          <span>
            New here?{' '}
            <Link to={`/sign-up?returnTo=${encodeURIComponent(returnTo)}`}>
              Create an account
            </Link>
          </span>
        </div>
      )}
      {page !== 'sign-in' && page !== 'mfa' && (
        <Link to={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`}>
          Continue to sign in
        </Link>
      )}
      {(state === 'verification_required' || state === 'mfa_required') && (
        <Button
          variant="ghost"
          disabled={pending}
          onClick={() => {
            void perform(async () => {
              await auth.mutate('/auth/logout')
              navigate('/sign-in')
            })
          }}
        >
          Use a different account
        </Button>
      )}
      {page === 'mfa' && (
        <p className="auth-help">
          Lost all factors and recovery codes? Email reset cannot remove your
          security factors. Use another enrolled sign-in method.
        </p>
      )}
    </section>
  )
}
