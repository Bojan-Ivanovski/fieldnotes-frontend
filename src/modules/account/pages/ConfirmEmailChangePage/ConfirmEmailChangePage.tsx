import { Button } from 'fieldnotes-ui'
import { Link } from 'react-router'
import { useEmailLinkToken } from '../../../../shared/hooks/useEmailLinkToken.ts'
import { useAuth } from '../../../auth/providers/AuthProvider/context.ts'
import { AuthPanel } from '../../../auth/components/AuthPanel/AuthPanel.tsx'
import { useFormAction } from '../../../auth/components/AuthForm/useFormAction.ts'
export function ConfirmEmailChangePage() {
  const token = useEmailLinkToken()
  const auth = useAuth()
  const action = useFormAction()
  const authenticated = auth.session?.state === 'authenticated'
  return (
    <AuthPanel
      title="Confirm your new email."
      description="Confirming this address changes your sign-in email and signs out every session. Your password and security factors stay the same."
      error={action.error}
      message={action.message}
    >
      {!token ? (
        <p>
          This link is missing its confirmation token. Reopen the link from your
          email, or request another change in settings.
        </p>
      ) : (
        !action.message && (
          <>
            {!authenticated && (
              <>
                <p>
                  Sign in using your current email in another tab, then check
                  your session here. Keep this page open: reloading removes the
                  token for your privacy.
                </p>
                <Link to="/sign-in" target="_blank" rel="noopener noreferrer">
                  Sign in in another tab
                </Link>
                <Button
                  disabled={action.pending || auth.status === 'resolving'}
                  onClick={() => {
                    void auth.refresh()
                  }}
                >
                  Check sign-in
                </Button>
              </>
            )}
            <Button
              disabled={!authenticated || action.pending}
              onClick={() => {
                void action.perform(async () => {
                  await auth.mutate('/auth/email-change/confirm', { token })
                  action.setMessage(
                    'Your email has changed. Sign in using your new address.',
                  )
                })
              }}
            >
              Confirm email change
            </Button>
          </>
        )
      )}
      <Link to="/sign-in">Continue to sign in</Link>
    </AuthPanel>
  )
}
