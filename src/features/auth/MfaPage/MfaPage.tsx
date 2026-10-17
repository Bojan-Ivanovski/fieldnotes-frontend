import './MfaPage.css'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Button, Field, Input } from 'fieldnotes-ui'
import { useNavigate, useSearchParams } from 'react-router'
import { safeReturnTo } from '../client.ts'
import { useAuth } from '../AuthProvider/context.ts'
import { AuthPanel } from '../AuthPanel/AuthPanel.tsx'
import { AuthForm } from '../AuthForm/AuthForm.tsx'
import { useFormAction } from '../AuthForm/useFormAction.ts'

export function MfaPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = safeReturnTo(params.get('returnTo'))
  const action = useFormAction()
  const [recovery, setRecovery] = useState(false)
  const state = auth.session?.state
  const ready = auth.status === 'ready'
  useEffect(() => {
    if (!ready) return
    if (state === 'authenticated') navigate(returnTo, { replace: true })
    if (state === 'verification_required')
      navigate(`/verify-email?returnTo=${encodeURIComponent(returnTo)}`, {
        replace: true,
      })
    if (state === 'anonymous')
      navigate(`/sign-in?returnTo=${encodeURIComponent(returnTo)}`, {
        replace: true,
      })
  }, [ready, state, returnTo, navigate])
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void action.perform(async () => {
      await auth.mutate('/auth/mfa/challenge', {
        [recovery ? 'recoveryCode' : 'code']: String(data.get('code') ?? ''),
      })
    })
  }
  return (
    <AuthPanel
      title="One more step."
      description="Enter a code from your authenticator app or a single-use recovery code."
      error={action.error}
      message={action.message}
    >
      <AuthForm pending={action.pending} disabled={!ready} onSubmit={submit}>
        <Field
          label={recovery ? 'Recovery code' : 'Authenticator code'}
          controlId="code"
        >
          {(props) => (
            <Input
              {...props}
              key={recovery ? 'recovery' : 'totp'}
              name="code"
              autoComplete="one-time-code"
              inputMode={recovery ? 'text' : 'numeric'}
              pattern={recovery ? undefined : '[0-9]{6}'}
              maxLength={recovery ? 128 : 6}
              required
            />
          )}
        </Field>
        <Button type="submit" size="lg">
          {action.pending ? 'Please wait…' : 'Verify and continue'}
        </Button>
      </AuthForm>
      <Button
        type="button"
        variant="ghost"
        disabled={action.pending}
        onClick={() => {
          setRecovery(!recovery)
          action.setError('')
        }}
      >
        {recovery ? 'Use an authenticator code' : 'Use a recovery code'}
      </Button>
      {(state === 'verification_required' || state === 'mfa_required') && (
        <Button
          variant="ghost"
          disabled={action.pending}
          onClick={() => {
            void action.perform(async () => {
              await auth.mutate('/auth/logout')
              navigate('/sign-in')
            })
          }}
        >
          Use a different account
        </Button>
      )}
      <p className="mfa-help">
        Lost all factors and recovery codes? Email reset cannot remove your
        security factors. Use another enrolled sign-in method.
      </p>
    </AuthPanel>
  )
}
