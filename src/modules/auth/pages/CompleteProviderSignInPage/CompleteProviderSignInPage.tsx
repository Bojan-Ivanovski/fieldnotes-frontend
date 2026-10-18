import { useEffect, useState } from 'react'
import { Button } from 'fieldnotes-ui'
import { Link, useNavigate } from 'react-router'
import { useEmailLinkToken } from '../../../../shared/hooks/useEmailLinkToken.ts'
import { useAuth } from '../../providers/AuthProvider/context.ts'
import { AuthPanel } from '../../components/AuthPanel/AuthPanel.tsx'
import { useFormAction } from '../../components/AuthForm/useFormAction.ts'
export function CompleteProviderSignInPage() {
  const token = useEmailLinkToken()
  const auth = useAuth()
  const action = useFormAction()
  const navigate = useNavigate()
  const [completed, setCompleted] = useState(false)
  const state = auth.session?.state
  useEffect(() => {
    if (!completed || auth.status !== 'ready') return
    if (state === 'authenticated') navigate('/settings', { replace: true })
    else if (state === 'mfa_required') navigate('/mfa', { replace: true })
  }, [completed, auth.status, state, navigate])
  return (
    <AuthPanel
      title="Complete provider sign-in."
      description="Continue to finish signing in securely in this browser. Your enrolled security factors still apply."
      error={action.error}
      message={action.message}
    >
      {!token ? (
        <p>
          This sign-in link is missing its token. Start provider sign-in again.
        </p>
      ) : (
        <Button
          disabled={action.pending || auth.status !== 'ready' || completed}
          onClick={() => {
            void action.perform(async () => {
              await auth.mutate('/auth/providers/complete', { token })
              setCompleted(true)
              action.setMessage('Provider verified. Checking your account…')
            })
          }}
        >
          Continue sign-in
        </Button>
      )}
      <Link to="/sign-in">Back to sign in</Link>
    </AuthPanel>
  )
}
