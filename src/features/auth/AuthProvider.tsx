import { useEffect, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAuthRuntime } from './runtime.ts'
import { AuthContext } from './context.ts'
export function AuthProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient())
  const [runtime] = useState(() => createAuthRuntime(undefined, () => { void client.cancelQueries(); client.clear() }))
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot)
  useEffect(() => {
    void runtime.refresh()
    const refresh = () => { void runtime.refresh() }
    const storage = (event: StorageEvent) => { if (event.key === 'foltivo-auth-change') void runtime.refresh(true) }
    const visibility = () => { if (document.visibilityState === 'visible') refresh() }
    window.addEventListener('storage', storage)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', visibility)
    const interval = window.setInterval(refresh, 60_000)
    return () => { runtime.dispose(); window.removeEventListener('storage', storage); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', visibility); window.clearInterval(interval) }
  }, [runtime])
  const mutate: typeof runtime.mutate = async (...args) => {
    try { return await runtime.mutate(...args) }
    finally { try { localStorage.setItem('foltivo-auth-change', crypto.randomUUID()) } catch { /* Sessions still refresh on focus when storage is disabled. */ } }
  }
  return <QueryClientProvider client={client}><AuthContext value={{ ...snapshot, refresh: runtime.refresh, mutate }}>{children}</AuthContext></QueryClientProvider>
}
