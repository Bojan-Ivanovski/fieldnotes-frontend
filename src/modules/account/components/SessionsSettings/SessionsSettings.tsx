import './SessionsSettings.css'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, SettingsSection } from 'fieldnotes-ui'
import { authRequest } from '../../../auth/data/client.ts'
import type { AccountSession } from '../../../auth/data/client.ts'
import { useAuth } from '../../../auth/providers/AuthProvider/context.ts'
import type { SettingsActions } from '../../data/settings.ts'

export function SessionsSettings({
  pending,
  perform,
  confirm,
  notify,
}: SettingsActions) {
  const auth = useAuth()
  const sessions = useQuery({
    queryKey: ['account-sessions', auth.session!.user!.id],
    queryFn: ({ signal }) =>
      authRequest<{ sessions: AccountSession[] }>('/auth/sessions', { signal }),
    retry: false,
  })
  return (
    <SettingsSection
      id="sessions"
      title="Sessions"
      description="Review browsers signed into your account. Revoking this session signs you out here."
    >
      {sessions.isPending ? (
        <p role="status">Loading sessions…</p>
      ) : sessions.isError ? (
        <Alert tone="destructive">
          Sessions could not be loaded.{' '}
          <Button
            onClick={() => {
              void sessions.refetch()
            }}
          >
            Retry sessions
          </Button>
        </Alert>
      ) : (
        sessions.data.sessions.map((session) => (
          <div key={session.id} className="session-list-row">
            <span>
              {session.current ? 'This browser' : 'Another browser'}
              <small>
                {session.userAgent || 'Browser information unavailable'}
                <br />
                Started {new Date(session.createdAt).toLocaleString()}
                <br />
                Last active{' '}
                {session.lastSeenAt
                  ? new Date(session.lastSeenAt).toLocaleString()
                  : 'unavailable'}
                <br />
                Expires {new Date(session.expiresAt).toLocaleString()}
              </small>
            </span>
            <Button
              disabled={pending}
              variant="outline"
              onClick={() =>
                confirm({
                  title: 'Revoke session?',
                  description: session.current
                    ? 'This signs you out of this browser immediately.'
                    : 'This signs the other browser out. That person must sign in again.',
                  action: async () => {
                    await auth.mutate(
                      `/auth/sessions/${encodeURIComponent(session.id)}`,
                      undefined,
                      'DELETE',
                    )
                    notify('Session revoked.')
                  },
                })
              }
            >
              Revoke {session.current ? 'this session' : 'session'}
            </Button>
          </div>
        ))
      )}
      <div className="session-actions">
        <Button
          variant="outline"
          disabled={
            pending ||
            !sessions.data ||
            !sessions.data.sessions.some((session) => !session.current)
          }
          onClick={() =>
            confirm({
              title: 'Sign out other sessions?',
              description:
                'Your current browser stays signed in. Every other browser must sign in again.',
              action: async () => {
                const result = await auth.mutate<{ revokedCount: number }>(
                  '/auth/sessions/others',
                  undefined,
                  'DELETE',
                )
                notify(`${result.revokedCount} other sessions signed out.`)
              },
            })
          }
        >
          Sign out other sessions
        </Button>
        <Button
          disabled={pending}
          variant="outline"
          onClick={() => {
            void perform(async () => {
              await auth.mutate('/auth/logout')
            })
          }}
        >
          Sign out
        </Button>
      </div>
    </SettingsSection>
  )
}
