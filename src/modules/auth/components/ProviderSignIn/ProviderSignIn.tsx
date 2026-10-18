import { useQuery } from '@tanstack/react-query'
import { Button } from 'fieldnotes-ui'
import { authRequest } from '../../data/client.ts'
import { useAuth } from '../../providers/AuthProvider/context.ts'
import { providerAuthorizationUrl } from '../../lib/provider-authorization.ts'
export function ProviderSignIn({
  pending,
  perform,
}: {
  pending: boolean
  perform: (action: () => Promise<void>) => Promise<void>
}) {
  const auth = useAuth()
  const providers = useQuery({
    queryKey: ['sign-in-providers'],
    queryFn: ({ signal }) =>
      authRequest<{
        providers: { provider: 'github' | 'google'; configured: boolean }[]
      }>('/auth/providers', { signal }),
    retry: false,
  })
  if (auth.session?.state !== 'anonymous') return null
  return (
    <>
      {providers.isError ? (
        <p>Provider sign-in is unavailable. You can still use your password.</p>
      ) : (
        providers.data?.providers
          .filter((provider) => provider.configured)
          .map(({ provider }) => (
            <Button
              key={provider}
              variant="outline"
              disabled={pending}
              onClick={() => {
                void perform(async () => {
                  const result = await auth.mutate<{ url: string }>(
                    `/auth/providers/${provider}/login`,
                  )
                  window.location.assign(
                    providerAuthorizationUrl(result.url, provider),
                  )
                })
              }}
            >
              Sign in with {provider === 'github' ? 'GitHub' : 'Google'}
            </Button>
          ))
      )}
    </>
  )
}
