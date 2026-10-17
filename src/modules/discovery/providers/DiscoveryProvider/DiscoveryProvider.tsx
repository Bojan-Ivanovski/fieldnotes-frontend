import { useCallback, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMockDiscoveryService } from '../../data/mocks/client.ts'
import { DiscoveryContext } from './context.ts'

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [runtime] = useState(() => createMockDiscoveryService())
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: 0, staleTime: 0 },
        },
      }),
  )
  const subscribe = useCallback(
    (notify: () => void) =>
      runtime.service.subscribeSession(() => {
        // Clear protected data before notifying React about another identity.
        void client.cancelQueries()
        client.removeQueries()
        notify()
      }),
    [runtime, client],
  )
  const session = useSyncExternalStore(subscribe, runtime.service.getSession)

  return (
    <QueryClientProvider client={client}>
      <DiscoveryContext
        value={{ service: runtime.service, session, preview: runtime.controls }}
      >
        {children}
      </DiscoveryContext>
    </QueryClientProvider>
  )
}
