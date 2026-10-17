import type { FormEvent } from 'react'
import { Button, Alert } from 'fieldnotes-ui'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { safeReturnTo } from '../../data/client.ts'
import { useAuth } from '../../providers/AuthProvider/context.ts'
import { AuthPanel } from '../../components/AuthPanel/AuthPanel.tsx'
import { AuthForm } from '../../components/AuthForm/AuthForm.tsx'
import { useFormAction } from '../../components/AuthForm/useFormAction.ts'
import { PasswordField } from '../../components/PasswordField/PasswordField.tsx'
import { useEmailLinkToken } from '../../hooks/useEmailLinkToken.ts'

export function ResetPasswordPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = safeReturnTo(params.get('returnTo'))
  const token = useEmailLinkToken()
  const action = useFormAction()
  const state = auth.session?.state
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void action.perform(async () => {
      await auth.mutate('/auth/password/reset', {
        token,
        password: String(data.get('password') ?? ''),
      })
      action.setMessage(
        'Your password has been reset. Sign in with your new password.',
      )
    })
  }
  return (
    <AuthPanel
      title="Choose a new password."
      description="Your new password will sign out existing sessions. Your security factors stay enabled."
      error={action.error}
      message={action.message}
    >
      {!token ? (
        <Alert tone="warning">
          This reset link is missing its token.{' '}
          <Link to="/forgot-password">Request a new link.</Link>
        </Alert>
      ) : (
        !action.message && (
          <AuthForm
            pending={action.pending}
            disabled={auth.status !== 'ready'}
            onSubmit={submit}
          >
            <PasswordField newPassword autoComplete="new-password" />
            <Button type="submit" size="lg">
              {action.pending ? 'Please wait…' : 'Reset password'}
            </Button>
          </AuthForm>
        )
      )}
      <Link to={`/sign-in?returnTo=${encodeURIComponent(returnTo)}`}>
        Continue to sign in
      </Link>
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
