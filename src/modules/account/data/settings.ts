export interface SettingsActions {
  pending: boolean
  perform: (action: () => Promise<void>) => Promise<void>
  confirm: (confirmation: {
    title: string
    description: string
    action: () => Promise<void>
  }) => void
  notify: (message: string) => void
}

export function credentials(data: FormData) {
  const code = String(data.get('code') ?? '')
  return {
    password: String(data.get('password') ?? ''),
    ...(code ? { code } : {}),
  }
}
