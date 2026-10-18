import { useQuery } from '@tanstack/react-query'
import { Alert, Button, SettingsSection } from 'fieldnotes-ui'
import { authRequest } from '../../../auth/data/client.ts'
import { useAuth } from '../../../auth/providers/AuthProvider/context.ts'
import { AccountCredentials } from '../AccountCredentials/AccountCredentials.tsx'
import { credentials } from '../../data/settings.ts'
import type { SettingsActions } from '../../data/settings.ts'
import { providerAuthorizationUrl } from '../../../auth/lib/provider-authorization.ts'
export function LinkedProvidersSettings({
  pending,
  perform,
  confirm,
  notify,
}: SettingsActions) {
  const auth = useAuth()
  const providers = useQuery({
    queryKey: ['account-providers', auth.session!.user!.id],
    queryFn: ({ signal }) =>
      authRequest<{
        providers: {
          provider: 'github' | 'google'
          configured: boolean
          linked: boolean
          linkedAt?: string
        }[]
      }>('/auth/providers', { signal }),
    retry: false,
  })
  return (
    <SettingsSection
      id="providers"
      title="Linked sign-in providers"
      description="Link an existing account explicitly. Provider sign-in does not grant repository access and does not bypass your authenticator."
    >
      {providers.isPending ? (
        <p role="status">Loading providers…</p>
      ) : providers.isError ? (
        <Alert tone="destructive">
          Providers could not be loaded.{' '}
          <Button
            onClick={() => {
              void providers.refetch()
            }}
          >
            Retry
          </Button>
        </Alert>
      ) : (
        providers.data.providers.map((provider) => (
          <form
            key={provider.provider}
            onSubmit={(event) => {
              event.preventDefault()
              const data = new FormData(event.currentTarget)
              const action = async () => {
                await auth.mutate('/auth/reauthenticate', credentials(data))
                if (provider.linked) {
                  await auth.mutate(
                    `/auth/providers/${provider.provider}`,
                    undefined,
                    'DELETE',
                  )
                  notify('Sign-in provider unlinked.')
                } else {
                  const result = await auth.mutate<{ url: string }>(
                    `/auth/providers/${provider.provider}/link`,
                  )
                  window.location.assign(
                    providerAuthorizationUrl(result.url, provider.provider),
                  )
                }
              }
              if (provider.linked) {
                confirm({
                  title: 'Unlink sign-in provider?',
                  description:
                    'This provider will no longer sign you in. Your password and enrolled security factors stay available.',
                  action,
                })
              } else {
                void perform(action)
              }
            }}
          >
            <h3>{provider.provider === 'github' ? 'GitHub' : 'Google'}</h3>
            <p>
              {provider.linked
                ? 'Linked'
                : provider.configured
                  ? 'Not linked'
                  : 'Not configured'}
            </p>
            {provider.linkedAt && (
              <p>Linked {new Date(provider.linkedAt).toLocaleDateString()}</p>
            )}
            <fieldset
              disabled={pending || (!provider.configured && !provider.linked)}
            >
              <AccountCredentials
                id={`provider-${provider.provider}`}
                passwordLabel={`Password to ${provider.linked ? 'unlink' : 'link'} ${provider.provider === 'github' ? 'GitHub' : 'Google'}`}
              />
              <Button type="submit" variant="outline">
                {provider.linked ? 'Unlink' : 'Link'}{' '}
                {provider.provider === 'github' ? 'GitHub' : 'Google'}
              </Button>
            </fieldset>
          </form>
        ))
      )}
    </SettingsSection>
  )
}
