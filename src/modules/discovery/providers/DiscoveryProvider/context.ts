import { createContext, useContext } from 'react'
import type { DiscoveryService, DiscoverySession } from '../../data/types.ts'
import type { createMockDiscoveryService } from '../../data/mocks/client.ts'

export interface DiscoveryContextValue {
  service: DiscoveryService
  session: DiscoverySession
  preview: ReturnType<typeof createMockDiscoveryService>['controls']
}

export const DiscoveryContext = createContext<DiscoveryContextValue | null>(
  null,
)

export function useDiscovery() {
  const context = useContext(DiscoveryContext)
  if (!context) throw new Error('DiscoveryProvider is required')
  return context
}
