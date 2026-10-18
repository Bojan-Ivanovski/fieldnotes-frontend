import { useQuery } from '@tanstack/react-query'
import { Alert, Button, Field, Input, SettingsSection } from 'fieldnotes-ui'
import { authRequest } from '../../../auth/data/client.ts'
import { useAuth } from '../../../auth/providers/AuthProvider/context.ts'
import { AccountCredentials } from '../AccountCredentials/AccountCredentials.tsx'
import { credentials } from '../../data/settings.ts'
import type { SettingsActions } from '../../data/settings.ts'
export function EmailSettings({
  pending,
  perform,
  confirm,
  notify,
}: SettingsActions) {
  const auth = useAuth()
  const change = useQuery({
    queryKey: ['account-email-change', auth.session!.user!.id],
    queryFn: ({ signal }) =>
      authRequest<{ pending: { email: string; expiresAt: string } | null }>(
        '/auth/email-change',
        { signal },
      ),
    retry: false,
  })
  return (
    <SettingsSection
      id="email"
      title="Email address"
      description="Your current address remains your sign-in address until the new address is confirmed. Confirmation signs out all sessions; your security factors stay enabled."
    >
      {change.isPending ? (
        <p role="status">Checking pending email changes…</p>
      ) : change.isError ? (
        <Alert tone="destructive">
          Email change status could not be loaded.{' '}
          <Button
            onClick={() => {
              void change.refetch()
            }}
          >
            Retry
          </Button>
        </Alert>
      ) : (
        change.data.pending && (
          <div>
            <p>
              Awaiting confirmation:{' '}
              <strong>{change.data.pending.email}</strong>. Link expires{' '}
              {new Date(change.data.pending.expiresAt).toLocaleString()}.
            </p>
            <Button
              disabled={pending}
              variant="outline"
              onClick={() =>
                confirm({
                  title: 'Cancel email change?',
                  description:
                    'The pending confirmation link will stop working. Your current email stays unchanged.',
                  action: async () => {
                    await auth.mutate('/auth/email-change', undefined, 'DELETE')
                    notify('Email change cancelled.')
                  },
                })
              }
            >
              Cancel pending change
            </Button>
          </div>
        )
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          void perform(async () => {
            await auth.mutate('/auth/reauthenticate', credentials(data))
            await auth.mutate('/auth/email-change', {
              email: String(data.get('email') ?? ''),
            })
            notify(
              'Check your new email address for a confirmation link. A new request replaces any previous link.',
            )
          })
        }}
      >
        <fieldset disabled={pending || !change.data}>
          <Field label="New email address" controlId="new-account-email">
            {(props) => (
              <Input
                {...props}
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
              />
            )}
          </Field>
          <AccountCredentials
            id="email-change"
            passwordLabel="Password to change email"
          />
          <Button type="submit">Send confirmation link</Button>
        </fieldset>
      </form>
    </SettingsSection>
  )
}
