import { Button } from 'fieldnotes-ui'
import { Link, useSearchParams } from 'react-router'
import { useEmailLinkToken } from '../../../../shared/hooks/useEmailLinkToken.ts'
import { useAuth } from '../../../auth/providers/AuthProvider/context.ts'
import { AuthPanel } from '../../../auth/components/AuthPanel/AuthPanel.tsx'
import { AuthForm } from '../../../auth/components/AuthForm/AuthForm.tsx'
import { useFormAction } from '../../../auth/components/AuthForm/useFormAction.ts'
import { EmailField } from '../../../auth/components/EmailField/EmailField.tsx'
import { AccountCredentials } from '../../components/AccountCredentials/AccountCredentials.tsx'
import { credentials } from '../../data/settings.ts'
export function RecoverAccountPage() {
  const token = useEmailLinkToken()
  const auth = useAuth()
  const action = useFormAction()
  const [params] = useSearchParams()
  const anonymous = auth.session?.state === 'anonymous'
  return (
    <AuthPanel
      title="Recover your account."
      description="Accounts can be recovered within 30 days of closure. Recovery requires your password and an authenticator or unused recovery code when enabled."
      error={action.error}
      message={action.message}
    >
      {params.get('closed') === '1' && (
        <p role="status">
          Your account is closed and all sessions have ended. You can recover it
          within 30 days.
        </p>
      )}
      {!anonymous && auth.status === 'ready' && (
        <>
          <p>
            Sign out of the current account before recovering another account.
            Keep this page open to retain your recovery token.
          </p>
          <Button
            disabled={action.pending}
            onClick={() => {
              void action.perform(async () => {
                await auth.mutate('/auth/logout')
              })
            }}
          >
            Sign out to continue
          </Button>
        </>
      )}
      {!(token && action.message) && (
        <AuthForm
          pending={action.pending}
          disabled={auth.status !== 'ready' || !anonymous}
          onSubmit={(event) => {
            event.preventDefault()
            const data = new FormData(event.currentTarget)
            void action.perform(async () => {
              if (token) {
                await auth.mutate('/auth/account-closure/recovery/confirm', {
                  token,
                  ...credentials(data),
                })
                action.setMessage(
                  'Your account has been recovered. Sign in normally; your enrolled security factors still apply.',
                )
              } else {
                await auth.mutate('/auth/account-closure/recovery/request', {
                  email: String(data.get('email') ?? ''),
                })
                action.setMessage(
                  'If this account is recoverable, a link will be sent to its email address.',
                )
              }
            })
          }}
        >
          {token ? (
            <AccountCredentials id="account-recovery" />
          ) : (
            <EmailField />
          )}
          <Button type="submit">
            {token ? 'Recover account' : 'Send recovery link'}
          </Button>
        </AuthForm>
      )}
      <Link to="/sign-in">Continue to sign in</Link>
    </AuthPanel>
  )
}
