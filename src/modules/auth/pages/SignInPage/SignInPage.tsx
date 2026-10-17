import './SignInPage.css'
import { useEffect, useRef } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router'
import type { FormEvent } from 'react'
import { Button } from 'fieldnotes-ui'
import { safeReturnTo } from '../../data/client.ts'
import { useAuth } from '../../providers/AuthProvider/context.ts'
import { AuthPanel } from '../../components/AuthPanel/AuthPanel.tsx'
import { AuthForm } from '../../components/AuthForm/AuthForm.tsx'
import { useFormAction } from '../../components/AuthForm/useFormAction.ts'
import { EmailField } from '../../components/EmailField/EmailField.tsx'
import { PasswordField } from '../../components/PasswordField/PasswordField.tsx'
import { passkeysSupported, authenticatePasskey } from '../../lib/passkeys.ts'

export function SignInPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = safeReturnTo(params.get('returnTo'))
  const action = useFormAction()
  const form = useRef<HTMLFormElement>(null)
  const state = auth.session?.state
  const ready = auth.status === 'ready'
  useEffect(() => {
    if (!ready) return
    if (state === 'authenticated') navigate(returnTo, { replace: true })
    if (state === 'verification_required')
      navigate(`/verify-email?returnTo=${encodeURIComponent(returnTo)}`, {
        replace: true,
      })
    if (state === 'mfa_required')
      navigate(`/mfa?returnTo=${encodeURIComponent(returnTo)}`, {
        replace: true,
      })
  }, [ready, state, returnTo, navigate])
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void action.perform(async () => {
      await auth.mutate('/auth/login', {
        email: String(data.get('email') ?? ''),
        password: String(data.get('password') ?? ''),
      })
    })
  }
  function signInWithPasskey() {
    const email = form.current
      ? String(new FormData(form.current).get('email') ?? '')
      : ''
    if (!email) {
      action.setError('Enter your email to sign in with a passkey.')
      return
    }
    void action.perform(async () => {
      const options = await auth.mutate<
        Parameters<typeof authenticatePasskey>[0]
      >('/auth/passkeys/login/begin', { email })
      const credential = await authenticatePasskey(options)
      await auth.mutate('/auth/passkeys/login/finish', credential)
    })
  }
  return (
    <AuthPanel
      title="Welcome back."
      description="Sign in to your personal Library."
      error={action.error}
      message={action.message}
    >
      <AuthForm
        formRef={form}
        pending={action.pending}
        disabled={!ready}
        onSubmit={submit}
      >
        <EmailField defaultValue={auth.session?.user?.email} />
        <PasswordField autoComplete="current-password" />
        <Button type="submit" size="lg">
          {action.pending ? 'Please wait…' : 'Sign in'}
        </Button>
      </AuthForm>
      {ready && auth.session?.methods.passkey && passkeysSupported() && (
        <Button
          type="button"
          variant="outline"
          disabled={action.pending}
          onClick={signInWithPasskey}
        >
          Sign in with a passkey
        </Button>
      )}
      <div className="sign-in-links">
        <Link to="/forgot-password">Forgot your password?</Link>
        <span>
          New here?{' '}
          <Link to={`/sign-up?returnTo=${encodeURIComponent(returnTo)}`}>
            Create an account
          </Link>
        </span>
      </div>
      {(state === 'verification_required' || state === 'mfa_required') && (
        <Button
          variant="ghost"
          disabled={action.pending}
          onClick={() => {
            void action.perform(async () => {
              await auth.mutate('/auth/logout')
              navigate('/sign-in')
            })
          }}
        >
          Use a different account
        </Button>
      )}
    </AuthPanel>
  )
}
