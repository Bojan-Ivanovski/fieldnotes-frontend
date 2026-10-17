import { useEffect } from 'react'
import { Field, Input, Button } from 'fieldnotes-ui'
import { useNavigate, Link, useSearchParams } from 'react-router'
import type { FormEvent } from 'react'
import { safeReturnTo } from '../client.ts'
import { useAuth } from '../AuthProvider/context.ts'
import { AuthPanel } from '../AuthPanel/AuthPanel.tsx'
import { AuthForm } from '../AuthForm/AuthForm.tsx'
import { useFormAction } from '../AuthForm/useFormAction.ts'
import { EmailField } from '../EmailField/EmailField.tsx'
import { PasswordField } from '../PasswordField/PasswordField.tsx'

export function SignUpPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = safeReturnTo(params.get('returnTo'))
  const action = useFormAction()
  const ready = auth.status === 'ready'
  const state = auth.session?.state
  useEffect(() => {
    if (ready && state === 'authenticated')
      navigate(returnTo, { replace: true })
  }, [ready, state, returnTo, navigate])
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void action.perform(async () => {
      await auth.mutate('/auth/register', {
        name: String(data.get('name') ?? ''),
        email: String(data.get('email') ?? ''),
        password: String(data.get('password') ?? ''),
      })
      action.setMessage(
        'Check your email for a verification link. You can sign in after verifying your address.',
      )
    })
  }
  return (
    <AuthPanel
      title="Make room for your ideas."
      description="Create your personal Library. No organization required."
      error={action.error}
      message={action.message}
    >
      {!action.message && (
        <AuthForm pending={action.pending} disabled={!ready} onSubmit={submit}>
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
          <EmailField defaultValue={auth.session?.user?.email} />
          <PasswordField newPassword autoComplete="new-password" />
          <Button type="submit" size="lg">
            {action.pending ? 'Please wait…' : 'Create account'}
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
