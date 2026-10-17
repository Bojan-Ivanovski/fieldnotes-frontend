import type { FormEvent } from 'react'
import { Button } from 'fieldnotes-ui'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { safeReturnTo } from '../client.ts'
import { useAuth } from '../AuthProvider/context.ts'
import { AuthPanel } from '../AuthPanel/AuthPanel.tsx'
import { AuthForm } from '../AuthForm/AuthForm.tsx'
import { useFormAction } from '../AuthForm/useFormAction.ts'
import { EmailField } from '../EmailField/EmailField.tsx'
import { useEmailLinkToken } from '../email-link/useEmailLinkToken.ts'

export function VerifyEmailPage() {
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
      await auth.mutate(
        token ? '/auth/verification/confirm' : '/auth/verification/resend',
        token ? { token } : { email: String(data.get('email') ?? '') },
      )
      action.setMessage(
        token
          ? 'Your email is verified. Continue to sign in.'
          : 'If your account needs verification, a link will be sent to that address.',
      )
    })
  }
  return (
    <AuthPanel
      title="Check your email."
      description="Open the verification link in your email, or request another below."
      error={action.error}
      message={action.message}
    >
      {!(token && action.message) && (
        <AuthForm
          pending={action.pending}
          disabled={auth.status !== 'ready'}
          onSubmit={submit}
        >
          {!token && <EmailField defaultValue={auth.session?.user?.email} />}
          <Button type="submit" size="lg">
            {action.pending
              ? 'Please wait…'
              : token
                ? 'Verify email'
                : 'Resend verification email'}
          </Button>
        </AuthForm>
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
