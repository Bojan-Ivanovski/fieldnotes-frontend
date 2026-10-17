import { useEffect, useState } from 'react'

/** Capture without side effects so Strict Mode can repeat initialization safely. */
export function useEmailLinkToken() {
  const [link] = useState(() => ({
    fragment: window.location.hash,
    token:
      new URLSearchParams(window.location.hash.slice(1)).get('token') ?? '',
  }))
  useEffect(() => {
    if (link.fragment && window.location.hash === link.fragment) {
      window.history.replaceState(
        window.history.state,
        '',
        window.location.pathname + window.location.search,
      )
    }
  }, [link])
  return link.token
}
