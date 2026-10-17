import { Alert, Button } from 'fieldnotes-ui'
import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './context.ts'
export function RequireAuth() {
  const auth = useAuth()
  const location = useLocation()
  const returnTo = encodeURIComponent(location.pathname + location.search)
  if (auth.status === 'resolving') return <p role="status">Checking your session…</p>
  if (auth.status === 'unavailable') return <Alert tone="destructive"><p>Your account could not be checked.</p><Button onClick={() => { void auth.refresh() }}>Try again</Button></Alert>
  if (auth.session?.state !== 'authenticated') return <Navigate replace to={`${auth.session?.state === 'mfa_required' ? '/mfa' : auth.session?.state === 'verification_required' ? '/verify-email' : '/sign-in'}?returnTo=${returnTo}`} />
  return <Outlet />
}
