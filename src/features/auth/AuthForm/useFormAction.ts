import { useState } from 'react'

/** Shared async feedback mechanics; callers own all auth flow decisions. */
export function useFormAction() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  async function perform(action: () => Promise<void>) {
    setPending(true)
    setError('')
    setMessage('')
    try {
      await action()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Please try again.')
    } finally {
      setPending(false)
    }
  }
  return { pending, error, message, setError, setMessage, perform }
}
