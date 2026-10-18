import { useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Field, Input, SettingsSection } from 'fieldnotes-ui'
import { authRequest } from '../../../auth/data/client.ts'
import { useAuth } from '../../../auth/providers/AuthProvider/context.ts'
import { AccountCredentials } from '../AccountCredentials/AccountCredentials.tsx'
import { credentials } from '../../data/settings.ts'
import type { SettingsActions } from '../../data/settings.ts'
export function AccountClosureSettings({
  pending,
  perform,
  confirm,
}: SettingsActions) {
  const auth = useAuth()
  const navigate = useNavigate()
  const closure = useQuery({
    queryKey: ['account-closure', auth.session!.user!.id],
    queryFn: ({ signal }) =>
      authRequest<{
        pending: unknown
        blockers: { code: string; message: string }[]
        recoveryDays: number
      }>('/auth/account-closure', { signal }),
    retry: false,
  })
  return (
    <SettingsSection
      id="closure"
      title="Close account"
      description="Closure immediately signs out every session and disables normal sign-in. You have 30 days to recover your account using your password and enrolled security factors."
    >
      <p>
        Your account and User Library are retained during recovery and removed
        after the recovery period. Any unresolved Organization Library ownership
        must be resolved before closing.
      </p>
      {closure.isPending ? (
        <p role="status">Checking account obligations…</p>
      ) : closure.isError ? (
        <Alert tone="destructive">
          Account obligations could not be checked.{' '}
          <Button
            onClick={() => {
              void closure.refetch()
            }}
          >
            Retry
          </Button>
        </Alert>
      ) : (
        closure.data.blockers.length > 0 && (
          <Alert tone="destructive">
            <p>Resolve these obligations before closing:</p>
            <ul>
              {closure.data.blockers.map((blocker) => (
                <li key={blocker.code}>{blocker.message}</li>
              ))}
            </ul>
          </Alert>
        )
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          if (String(data.get('confirmation')) !== 'CLOSE') return
          confirm({
            title: 'Close your account?',
            description:
              'All sessions will end immediately. Recover within 30 days to keep your account. After that, closure is permanent.',
            action: async () => {
              await auth.mutate('/auth/reauthenticate', credentials(data))
              await auth.mutate('/auth/account-closure')
              navigate('/recover-account?closed=1', { replace: true })
            },
          })
        }}
      >
        <fieldset
          disabled={
            pending || !closure.data || closure.data.blockers.length > 0
          }
        >
          <AccountCredentials
            id="account-closure"
            passwordLabel="Password to close account"
          />
          <Field label="Type CLOSE to confirm" controlId="closure-confirmation">
            {(props) => (
              <Input
                {...props}
                name="confirmation"
                pattern="CLOSE"
                required
                autoComplete="off"
              />
            )}
          </Field>
          <Button type="submit" variant="outline">
            Close account
          </Button>
        </fieldset>
      </form>
      <Button
        variant="ghost"
        disabled={pending}
        onClick={() => {
          void perform(async () => {
            await closure.refetch()
          })
        }}
      >
        Check obligations again
      </Button>
    </SettingsSection>
  )
}
