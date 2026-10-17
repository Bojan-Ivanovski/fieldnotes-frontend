import type { FormEvent } from 'react'
import { Button } from 'fieldnotes-ui'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { safeReturnTo } from '../client.ts'
import { useAuth } from '../AuthProvider/context.ts'
import { AuthPanel } from '../AuthPanel/AuthPanel.tsx'
import { AuthForm } from '../AuthForm/AuthForm.tsx'
import { useFormAction } from '../AuthForm/useFormAction.ts'
import { EmailField } from '../EmailField/EmailField.tsx'

export function ForgotPasswordPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = safeReturnTo(params.get('returnTo'))
  const action = useFormAction()
  const state = auth.session?.state
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void action.perform(async () => {
      await auth.mutate('/auth/password/forgot', {
        email: String(data.get('email') ?? ''),
      })
      action.setMessage(
        'If an eligible account exists, a reset link will be sent to that address.',
      )
    })
  }
  return (
    <AuthPanel
      title="Find your way back."
      description="We’ll email you a link to reset your password if an account is eligible."
      error={action.error}
      message={action.message}
    >
      <AuthForm
        pending={action.pending}
        disabled={auth.status !== 'ready'}
        onSubmit={submit}
      >
        <EmailField defaultValue={auth.session?.user?.email} />
        <Button type="submit" size="lg">
          {action.pending ? 'Please wait…' : 'Send reset link'}
        </Button>
      </AuthForm>
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
