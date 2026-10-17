import { createContext, useContext } from 'react'
import type { AuthSnapshot, createAuthRuntime } from './runtime.ts'
export interface AuthContextValue extends AuthSnapshot {
  refresh: () => Promise<void>
  mutate: ReturnType<typeof createAuthRuntime>['mutate']
}
export const AuthContext = createContext<AuthContextValue | null>(null)
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('AuthProvider is required')
  return value
}
