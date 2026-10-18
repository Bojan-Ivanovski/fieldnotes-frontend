import './AccountSettingsPage.css'
import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Button,
  ConfirmDialog,
  Field,
  Input,
  SettingsLayout,
  SettingsSection,
} from 'fieldnotes-ui'
import { Link, useSearchParams } from 'react-router'
import QRCode from 'qrcode'
import { authRequest } from '../../../auth/data/client.ts'
import type { Security } from '../../../auth/data/client.ts'
import { useAuth } from '../../../auth/providers/AuthProvider/context.ts'
import { PasswordField } from '../../../auth/components/PasswordField/PasswordField.tsx'
import { createPasskey, passkeysSupported } from '../../../auth/lib/passkeys.ts'
import { LinkedProvidersSettings } from '../../components/LinkedProvidersSettings/LinkedProvidersSettings.tsx'
import { EmailSettings } from '../../components/EmailSettings/EmailSettings.tsx'
import { AccountClosureSettings } from '../../components/AccountClosureSettings/AccountClosureSettings.tsx'
import { SessionsSettings } from '../../components/SessionsSettings/SessionsSettings.tsx'
export function AccountSettingsPage() {
  const auth = useAuth()
  const key = auth.session?.user?.id
  return <AccountSettings key={key} />
}
function AccountSettings() {
  const auth = useAuth()
  const user = auth.session!.user!
  const [pending, setPending] = useState(false)
  const operationInFlight = useRef(false)
  const [params, setParams] = useSearchParams()
  const [error, setError] = useState(
    params.get('provider') === 'failed'
      ? 'Provider linking could not be completed. Please try again.'
      : '',
  )
  const [message, setMessage] = useState(
    params.get('provider') === 'linked'
      ? 'Your sign-in provider has been linked.'
      : '',
  )
  useEffect(() => {
    if (!params.has('provider')) return
    const cleaned = new URLSearchParams(params)
    cleaned.delete('provider')
    setParams(cleaned, { replace: true })
  }, [params, setParams])
  const [setup, setSetup] = useState<{ secret: string; uri: string } | null>(
    null,
  )
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [qrCode, setQrCode] = useState('')
  const [useRecovery, setUseRecovery] = useState(false)
  const [confirmation, setConfirmation] = useState<{
    title: string
    description: string
    action: () => Promise<void>
  } | null>(null)
  const security = useQuery({
    queryKey: ['account-security', user.id],
    queryFn: ({ signal }) =>
      authRequest<Security>('/auth/security', { signal }),
    retry: false,
  })
  async function perform(action: () => Promise<void>) {
    if (operationInFlight.current) return
    operationInFlight.current = true
    setPending(true)
    setError('')
    setMessage('')
    try {
      await action()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Please try again.')
    } finally {
      operationInFlight.current = false
      setPending(false)
    }
  }
  function formAction(
    event: FormEvent<HTMLFormElement>,
    action: (data: FormData) => Promise<void>,
  ) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void perform(() => action(data))
  }
  const value = (data: FormData, name: string) => String(data.get(name) ?? '')
  return (
    <div className="account-settings">
      <SettingsLayout
        title="Account settings"
        description="Your profile, sign-in methods, and account access."
        navigation={
          <nav aria-label="Account settings">
            <a href="#profile">Profile</a>
            <a href="#email">Email</a>
            <a href="#security">Security</a>
            <a href="#closure">Close account</a>
            <a href="#sessions">Sessions</a>
            <Link to="/search">Explore</Link>
          </nav>
        }
      >
        <div aria-live="polite">
          {message && <Alert tone="success">{message}</Alert>}
        </div>
        {error && (
          <Alert role="alert" tone="destructive">
            {error}
          </Alert>
        )}
        <SettingsSection
          id="profile"
          title="Profile"
          description="Your display name can change. Your account identity stays the same."
        >
          <p>
            <strong>{user.email}</strong> ·{' '}
            {user.emailVerified ? 'Verified' : 'Not verified'}
          </p>
          <form
            onSubmit={(event) =>
              formAction(event, async (data) => {
                await auth.mutate(
                  '/auth/profile',
                  { name: value(data, 'name') },
                  'PATCH',
                )
                setMessage('Your profile has been updated.')
              })
            }
          >
            <fieldset disabled={pending}>
              <Field label="Display name" controlId="profile-name">
                {(props) => (
                  <Input
                    {...props}
                    name="name"
                    defaultValue={user.name}
                    autoComplete="name"
                    maxLength={100}
                    required
                  />
                )}
              </Field>
              <Button type="submit">Save profile</Button>
            </fieldset>
          </form>
        </SettingsSection>
        <EmailSettings
          pending={pending}
          perform={perform}
          confirm={setConfirmation}
          notify={setMessage}
        />
        <SettingsSection
          title="Password"
          description="Changing your password signs you out of every session. Enrolled security factors stay enabled."
        >
          <form
            onSubmit={(event) =>
              formAction(event, async (data) => {
                await auth.mutate('/auth/password/change', {
                  currentPassword: value(data, 'currentPassword'),
                  password: value(data, 'newPassword'),
                  ...(value(data, 'passwordCode')
                    ? { code: value(data, 'passwordCode') }
                    : {}),
                })
                setMessage('Your password has changed.')
              })
            }
          >
            <fieldset disabled={pending}>
              <PasswordField label="Current password" name="currentPassword" />
              <PasswordField
                label="New password"
                name="newPassword"
                autoComplete="new-password"
                newPassword
              />
              {security.data?.totpEnabled && (
                <Field
                  label="Current authenticator code"
                  controlId="password-code"
                >
                  {(props) => (
                    <Input
                      {...props}
                      name="passwordCode"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      required
                    />
                  )}
                </Field>
              )}
              <Button type="submit">Change password</Button>
            </fieldset>
          </form>
        </SettingsSection>
        <SettingsSection
          id="security"
          title="Sign-in and security"
          description="Verify your account before changing security methods. Use a fresh authenticator code for each sensitive action, or an unused recovery code if your authenticator is lost."
        >
          {security.isPending ? (
            <p role="status">Loading security settings…</p>
          ) : security.isError ? (
            <Alert tone="destructive">
              Security settings could not be loaded.{' '}
              <Button
                onClick={() => {
                  void security.refetch()
                }}
              >
                Retry security settings
              </Button>
            </Alert>
          ) : (
            <p>
              Authenticator:{' '}
              {security.data.totpEnabled ? 'Enabled' : 'Not enabled'} · Recovery
              codes remaining: {security.data.recoveryCodesRemaining}
            </p>
          )}
          <form
            onSubmit={(event) => {
              const action =
                (event.nativeEvent as SubmitEvent).submitter?.getAttribute(
                  'value',
                ) ?? 'verify'
              formAction(event, async (data) => {
                const credentials = {
                  password: value(data, 'securityPassword'),
                  ...(value(data, 'securityCode')
                    ? { code: value(data, 'securityCode') }
                    : {}),
                }
                if (action === 'remove') {
                  setConfirmation({
                    title: 'Remove authenticator?',
                    description:
                      'Your authenticator and its recovery codes will no longer protect password sign-in. Other sessions may be signed out.',
                    action: async () => {
                      await auth.mutate('/auth/totp/remove', credentials)
                      setSetup(null)
                      setRecoveryCodes([])
                      setMessage('Your authenticator was removed.')
                    },
                  })
                } else if (action === 'regenerate') {
                  const result = await auth.mutate<{ recoveryCodes: string[] }>(
                    '/auth/recovery-codes/regenerate',
                    credentials,
                  )
                  setRecoveryCodes(result.recoveryCodes)
                  setMessage(
                    'New recovery codes created. Your previous codes no longer work.',
                  )
                } else {
                  await auth.mutate('/auth/reauthenticate', credentials)
                  if (action === 'enroll') {
                    const enrollment = await auth.mutate<{
                      secret: string
                      uri: string
                    }>('/auth/totp/enroll')
                    setSetup(enrollment)
                    setQrCode(
                      await QRCode.toDataURL(enrollment.uri, {
                        width: 240,
                        margin: 2,
                        errorCorrectionLevel: 'M',
                      }),
                    )
                  } else
                    setMessage(
                      'Account verified. You can now manage your passkeys.',
                    )
                }
              })
            }}
          >
            <fieldset disabled={pending || !security.data}>
              <PasswordField label="Account password" name="securityPassword" />
              {security.data?.totpEnabled && (
                <>
                  <Field
                    label={
                      useRecovery
                        ? 'Recovery code for security changes'
                        : 'Authenticator code for security changes'
                    }
                    controlId="security-code"
                  >
                    {(props) => (
                      <Input
                        {...props}
                        key={useRecovery ? 'recovery' : 'authenticator'}
                        name="securityCode"
                        autoComplete="one-time-code"
                        inputMode={useRecovery ? 'text' : 'numeric'}
                        pattern={useRecovery ? undefined : '[0-9]{6}'}
                        maxLength={useRecovery ? 128 : 6}
                        required
                      />
                    )}
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setUseRecovery(!useRecovery)}
                  >
                    {useRecovery
                      ? 'Use an authenticator code for security changes'
                      : 'Use a recovery code for security changes'}
                  </Button>
                </>
              )}
              <div className="account-actions">
                <Button type="submit" value="verify" variant="outline">
                  Verify account
                </Button>
                {auth.session?.methods.totp &&
                  (security.data?.totpEnabled ? (
                    <>
                      <Button
                        type="submit"
                        value="regenerate"
                        variant="outline"
                      >
                        Regenerate recovery codes
                      </Button>
                      <Button type="submit" value="remove" variant="outline">
                        Remove authenticator
                      </Button>
                    </>
                  ) : (
                    <Button type="submit" value="enroll">
                      Set up authenticator
                    </Button>
                  ))}
              </div>
            </fieldset>
          </form>
          {setup && (
            <div className="account-enrollment">
              <h3>Connect your authenticator</h3>
              {qrCode && (
                <img
                  src={qrCode}
                  width="240"
                  height="240"
                  alt="Scan this QR code with your authenticator app"
                />
              )}
              <p>
                In your authenticator app, add an account with this setup key.
                Then enter a code to enable it.
              </p>
              <Field label="Authenticator setup key" controlId="totp-secret">
                {(props) => <Input {...props} value={setup.secret} readOnly />}
              </Field>
              <a href={setup.uri}>Open in an authenticator app</a>
              <form
                onSubmit={(event) =>
                  formAction(event, async (data) => {
                    const result = await auth.mutate<{
                      recoveryCodes: string[]
                    }>('/auth/totp/confirm', {
                      code: value(data, 'enrollmentCode'),
                    })
                    setRecoveryCodes(result.recoveryCodes)
                    setSetup(null)
                    setMessage(
                      'Authenticator enabled. Save your recovery codes now.',
                    )
                  })
                }
              >
                <fieldset disabled={pending}>
                  <Field
                    label="Confirm authenticator code"
                    controlId="enrollment-code"
                  >
                    {(props) => (
                      <Input
                        {...props}
                        name="enrollmentCode"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        pattern="[0-9]{6}"
                        maxLength={6}
                        required
                      />
                    )}
                  </Field>
                  <Button type="submit">Enable authenticator</Button>
                </fieldset>
              </form>
            </div>
          )}
          {recoveryCodes.length > 0 && (
            <div className="account-recovery">
              <h3>Save your recovery codes</h3>
              <p>
                Each code works once. These codes are shown only now; keep them
                somewhere safe.
              </p>
              <pre aria-label="Recovery codes">{recoveryCodes.join('\n')}</pre>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const file = new Blob(
                    [`Foltivo recovery codes\n\n${recoveryCodes.join('\n')}\n`],
                    { type: 'text/plain' },
                  )
                  const url = URL.createObjectURL(file)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = 'foltivo-recovery-codes.txt'
                  link.click()
                  URL.revokeObjectURL(url)
                }}
              >
                Download recovery codes
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setRecoveryCodes([])}
              >
                I have saved my codes
              </Button>
            </div>
          )}
        </SettingsSection>
        {auth.session?.methods.passkey && (
          <SettingsSection
            title="Passkeys"
            description="Passkeys use your device’s screen lock. Verify your account above before adding or removing one."
          >
            {passkeysSupported() ? (
              <form
                onSubmit={(event) =>
                  formAction(event, async (data) => {
                    const options = await auth.mutate<
                      Parameters<typeof createPasskey>[0]
                    >('/auth/passkeys/register/begin', {
                      name: value(data, 'passkeyName'),
                    })
                    const credential = await createPasskey(options)
                    await auth.mutate(
                      '/auth/passkeys/register/finish',
                      credential,
                    )
                    setMessage('Your passkey was added.')
                  })
                }
              >
                <fieldset disabled={pending}>
                  <Field label="Passkey name" controlId="passkey-name">
                    {(props) => (
                      <Input
                        {...props}
                        name="passkeyName"
                        placeholder="For example, personal laptop"
                        maxLength={100}
                        required
                      />
                    )}
                  </Field>
                  <Button type="submit">Add passkey</Button>
                </fieldset>
              </form>
            ) : (
              <p>
                This browser does not support passkeys. Try a supported browser
                over HTTPS.
              </p>
            )}
            {security.data?.passkeys.map((passkey) => (
              <div className="account-list-row" key={passkey.id}>
                <span>
                  {passkey.name}
                  <small>
                    Added {new Date(passkey.createdAt).toLocaleDateString()}
                  </small>
                </span>
                <Button
                  disabled={pending}
                  variant="outline"
                  onClick={() => {
                    setConfirmation({
                      title: 'Remove passkey?',
                      description: `You will no longer be able to sign in with ${passkey.name}. Your password and other enrolled methods stay available.`,
                      action: async () => {
                        await auth.mutate(
                          `/auth/passkeys/${encodeURIComponent(passkey.id)}`,
                          undefined,
                          'DELETE',
                        )
                        setMessage('Your passkey was removed.')
                      },
                    })
                  }}
                >
                  Remove {passkey.name}
                </Button>
              </div>
            ))}
          </SettingsSection>
        )}
        <SessionsSettings
          pending={pending}
          perform={perform}
          confirm={setConfirmation}
          notify={setMessage}
        />
        <LinkedProvidersSettings
          pending={pending}
          perform={perform}
          confirm={setConfirmation}
          notify={setMessage}
        />
        <AccountClosureSettings
          pending={pending}
          perform={perform}
          confirm={setConfirmation}
          notify={setMessage}
        />
      </SettingsLayout>
      <ConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => {
          if (!open) setConfirmation(null)
        }}
        title={confirmation?.title ?? 'Confirm security change'}
        description={confirmation?.description ?? ''}
        destructive
        confirmLabel="Confirm"
        onConfirm={async () => {
          const action = confirmation?.action
          setConfirmation(null)
          if (action) await perform(action)
        }}
      />
    </div>
  )
}
