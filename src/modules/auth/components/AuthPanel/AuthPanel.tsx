import './AuthPanel.css'
import type { ReactNode } from 'react'
import { Alert, Button } from 'fieldnotes-ui'
import { useAuth } from '../../providers/AuthProvider/context.ts'

export function AuthPanel({
  title,
  description,
  error,
  message,
  children,
}: {
  title: string
  description: string
  error: string
  message: string
  children: ReactNode
}) {
  const auth = useAuth()
  return (
    <section className="auth-panel" aria-labelledby="auth-title">
      <p className="auth-eyebrow">YOUR OWN LITTLE CORNER</p>
      <h1 id="auth-title">{title}</h1>
      <p>{description}</p>
      {auth.status === 'resolving' && (
        <p role="status">Checking your session…</p>
      )}
      {auth.status === 'unavailable' && (
        <Alert tone="destructive">
          <p>
            Account services are unavailable. Your session could not be checked.
          </p>
          <Button
            type="button"
            onClick={() => {
              void auth.refresh()
            }}
          >
            Try again
          </Button>
        </Alert>
      )}
      {error && (
        <Alert tone="destructive" role="alert">
          {error}
        </Alert>
      )}
      {message && (
        <Alert tone="success" role="status">
          {message}
        </Alert>
      )}
      {children}
    </section>
  )
}
