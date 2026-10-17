import { createHmac, randomUUID } from 'node:crypto'
import { expect, request, test } from '@playwright/test'

const appOrigin = process.env.FOLTIVO_APP_ORIGIN ?? 'http://localhost:4173'
const mailpitOrigin = 'http://127.0.0.1:8025'

type MailSummary = {
  ID: string
  Subject: string
  Created: string
  To: { Address: string }[]
}

type MailMessage = {
  Text?: unknown
  HTML?: unknown
}

async function waitForMail(recipient: string, subject: string, sentAfter: number): Promise<MailMessage> {
  const api = await request.newContext({ baseURL: mailpitOrigin })
  try {
    const deadline = Date.now() + 30_000
    while (Date.now() < deadline) {
      const response = await api.get('/api/v1/messages?start=0&limit=50')
      expect(response.ok()).toBe(true)
      const page = await response.json() as { messages: MailSummary[] }
      const match = page.messages.find(message =>
        message.Subject === subject && Date.parse(message.Created) >= sentAfter &&
        message.To?.some(to => to.Address.toLowerCase() === recipient.toLowerCase()),
      )
      if (match) {
        const detail = await api.get(`/api/v1/message/${encodeURIComponent(match.ID)}`)
        expect(detail.ok()).toBe(true)
        return await detail.json() as MailMessage
      }
      await new Promise(resolve => setTimeout(resolve, 400))
    }
    throw new Error('Timed out waiting for the expected test email.')
  } finally {
    await api.dispose()
  }
}

async function clearPasswordFields(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    for (const input of document.querySelectorAll<HTMLInputElement>('input[type="password"], input[autocomplete="one-time-code"]')) input.value = ''
  })
}

function decodeBase32(value: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = 0
  let buffer = 0
  const bytes: number[] = []
  for (const character of value.toUpperCase().replace(/=+$/, '')) {
    const digit = alphabet.indexOf(character)
    if (digit < 0) throw new Error('The authenticator returned an invalid setup key.')
    buffer = (buffer << 5) | digit
    bits += 5
    while (bits >= 8) {
      bits -= 8
      bytes.push((buffer >> bits) & 0xff)
      buffer &= (1 << bits) - 1
    }
  }
  return Buffer.from(bytes)
}

function totpCode(secret: string, at = Date.now()): string {
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 30_000)))
  const digest = createHmac('sha1', decodeBase32(secret)).update(counter).digest()
  const offset = digest[digest.length - 1]! & 0x0f
  const binary = digest.readUInt32BE(offset) & 0x7fffffff
  return String(binary % 1_000_000).padStart(6, '0')
}

function emailLink(message: MailMessage, pathname: '/verify-email' | '/reset-password'): string {
  const bodies = [message.Text, message.HTML]
    .map(body => typeof body === 'string' ? body : JSON.stringify(body ?? ''))
    .join('\n')
  const links = bodies.match(/https?:\/\/[^\s<>"']+/g) ?? []
  const link = links.find(candidate => {
    try { return new URL(candidate).pathname === pathname } catch { return false }
  })
  if (!link || !new URL(link).hash.includes('token=')) {
    throw new Error('The test email did not contain the expected one-time link.')
  }
  return link
}

test.use({ trace: 'off' })

test('live authentication: register, verify, manage account, reset password, and enforce request protections', async ({ page }) => {
    test.skip(process.env.FOLTIVO_LIVE_AUTH !== '1', 'Set FOLTIVO_LIVE_AUTH=1 to run against the local backend and Mailpit.')
    test.setTimeout(90_000)

    const suffix = randomUUID()
    const existingEmail = process.env.FOLTIVO_LIVE_AUTH_EMAIL
    const email = existingEmail ?? `foltivo-live-${suffix}@example.test`
    const originalPassword = `Foltivo-live-${suffix}-Aa9!`
    const resetPassword = `Foltivo-reset-${suffix}-Bb8!`
    const originalName = `Foltivo Live ${suffix.slice(0, 8)}`
    const updatedName = `Foltivo Profile ${suffix.slice(0, 8)}`

    // Establish a real anonymous browser session and check the backend's CSRF guard.
    const protectedApi = await request.newContext({
      baseURL: 'http://127.0.0.1:8080',
      extraHTTPHeaders: { Origin: appOrigin },
    })
    try {
      const sessionResponse = await protectedApi.get('/api/v1/auth/session')
      expect(sessionResponse.status()).toBe(200)
      const anonymousSession = await sessionResponse.json() as { csrfToken: string }
      expect(anonymousSession.csrfToken).toBeTruthy()
      const rejectedMutation = await protectedApi.post('/api/v1/auth/logout', {
        data: {},
        headers: { 'X-CSRF-Token': 'invalid-live-test-token' },
      })
      expect(rejectedMutation.status()).toBe(403)
    } finally {
      await protectedApi.dispose()
    }

    const anonymousApi = await request.newContext({
      baseURL: 'http://127.0.0.1:8080',
      extraHTTPHeaders: { Origin: appOrigin },
    })
    try {
      const unauthorized = await anonymousApi.get('/api/v1/me')
      expect(unauthorized.status()).toBe(401)
    } finally {
      await anonymousApi.dispose()
    }

    if (existingEmail) {
      await page.goto('/forgot-password')
      await page.getByLabel('Email', { exact: true }).fill(email)
      const requestedAt = Date.now()
      await page.getByRole('button', { name: 'Send reset link', exact: true }).click()
      await expect(page.getByRole('status')).toContainText('a reset link will be sent')
      const bootstrapReset = emailLink(await waitForMail(email, 'Reset your Foltivo password', requestedAt), '/reset-password')
      await page.goto(bootstrapReset)
      await page.getByLabel('Password', { exact: true }).fill(originalPassword)
      await page.getByRole('button', { name: 'Reset password', exact: true }).click()
      await clearPasswordFields(page)
      await expect(page.getByRole('status')).toContainText('Your password has been reset')
    } else {
      await page.goto('/sign-up')
      await page.getByLabel('Display name').fill(originalName)
      await page.getByLabel('Email', { exact: true }).fill(email)
      await page.getByLabel('Password', { exact: true }).fill(originalPassword)
      const requestedAt = Date.now()
      await page.getByRole('button', { name: 'Create account', exact: true }).click()
      await clearPasswordFields(page)
      await expect(page.getByRole('status')).toContainText('Check your email for a verification link')

      const verification = emailLink(await waitForMail(email, 'Verify your Foltivo email', requestedAt), '/verify-email')
      await page.goto(verification)
      await expect(page).toHaveURL(/\/verify-email$/)
      await page.getByRole('button', { name: 'Verify email', exact: true }).click()
      await expect(page.getByRole('status')).toContainText('Your email is verified')
    }

    await page.getByRole('link', { name: 'Continue to sign in' }).click()
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Password', { exact: true }).fill(originalPassword)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.getByText(/· Verified$/)).toBeVisible()
    const displayName = page.getByLabel('Display name')
    await expect(displayName).toHaveValue(existingEmail ? /.+/ : originalName)
    const sessions = page.getByRole('region', { name: 'Sessions' })
    await expect(sessions.getByText(/This browser/)).toBeVisible()

    await displayName.fill(updatedName)
    await page.getByRole('button', { name: 'Save profile', exact: true }).click()
    await expect(page.getByText('Your profile has been updated.')).toBeVisible()
    await page.reload()
    await expect(displayName).toHaveValue(updatedName)
    await expect(sessions.getByText(/This browser/)).toBeVisible()

    await expect(page.getByText(/Authenticator: Not enabled/)).toBeVisible()
    await page.getByRole('textbox', { name: 'Account password', exact: true }).fill(originalPassword)
    await page.getByRole('button', { name: 'Set up authenticator', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page.getByRole('img', { name: 'Scan this QR code with your authenticator app' })).toBeVisible()
    const totpSecret = await page.getByLabel('Authenticator setup key').inputValue()
    const authenticatorCode = page.getByLabel('Confirm authenticator code')
    await authenticatorCode.fill(totpCode(totpSecret))
    await page.getByRole('button', { name: 'Enable authenticator', exact: true }).click()
    await clearPasswordFields(page)
    const recoveryCodesText = await page.getByLabel('Recovery codes').textContent()
    const recoveryCodes = (recoveryCodesText ?? '').split('\n').map(code => code.trim()).filter(Boolean)
    await page.getByRole('button', { name: 'I have saved my codes', exact: true }).click()
    expect(recoveryCodes).toHaveLength(10)
    await page.reload()
    await expect(page.getByText(/Authenticator: Enabled/)).toBeVisible()

    // Password sign-in must stop at MFA; one recovery code works once.
    await page.getByRole('button', { name: 'Sign out', exact: true }).click()
    await expect(page).toHaveURL(/\/sign-in/)
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Password', { exact: true }).fill(originalPassword)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page).toHaveURL(/\/mfa/)
    await page.getByRole('button', { name: 'Use a recovery code', exact: true }).click()
    await page.getByLabel('Recovery code').fill(recoveryCodes[0]!)
    await page.getByRole('button', { name: 'Verify and continue', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page).toHaveURL(/\/settings$/)

    await page.getByRole('button', { name: 'Sign out', exact: true }).click()
    await expect(page).toHaveURL(/\/sign-in/)
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Password', { exact: true }).fill(originalPassword)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page).toHaveURL(/\/mfa/)
    await page.getByRole('button', { name: 'Use a recovery code', exact: true }).click()
    const recoveryInput = page.getByLabel('Recovery code')
    await recoveryInput.fill(recoveryCodes[0]!)
    await page.getByRole('button', { name: 'Verify and continue', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page.getByRole('alert')).toContainText('Authentication code is invalid')
    await recoveryInput.fill(recoveryCodes[1]!)
    await page.getByRole('button', { name: 'Verify and continue', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page).toHaveURL(/\/settings$/)

    // Add a user-verified, resident passkey through Chromium's virtual authenticator.
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('WebAuthn.enable', { enableUI: false })
    const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
      options: {
        protocol: 'ctap2',
        transport: 'internal',
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
        automaticPresenceSimulation: true,
      },
    })
    await page.getByRole('textbox', { name: 'Account password', exact: true }).fill(originalPassword)
    await page.getByLabel('Authenticator code for security changes').fill(totpCode(totpSecret, Date.now() + 30_000))
    await page.getByRole('button', { name: 'Verify account', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page.getByText('Account verified. You can now manage your passkeys.')).toBeVisible()
    await page.getByLabel('Passkey name').fill('Local live test device')
    await page.getByRole('button', { name: 'Add passkey', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page.getByText('Your passkey was added.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Remove Local live test device', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Sign out', exact: true }).click()
    await expect(page).toHaveURL(/\/sign-in/)
    await page.getByLabel('Email', { exact: true }).fill(email)
    await cdp.send('WebAuthn.setResponseOverrideBits', { authenticatorId, isBadUV: true })
    await page.getByRole('button', { name: 'Sign in with a passkey', exact: true }).click()
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page).not.toHaveURL(/\/settings$/)
    await cdp.send('WebAuthn.setResponseOverrideBits', { authenticatorId, isBadUV: false })
    await page.getByRole('button', { name: 'Sign in with a passkey', exact: true }).click()
    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.getByText(/Authenticator: Enabled/)).toBeVisible()
    await cdp.send('WebAuthn.removeVirtualAuthenticator', { authenticatorId })
    await cdp.send('WebAuthn.disable')
    await cdp.detach()

    await page.goto('/forgot-password')
    await page.getByLabel('Email', { exact: true }).fill(email)
    const requestedAt = Date.now()
    await page.getByRole('button', { name: 'Send reset link', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('a reset link will be sent')
    const reset = emailLink(await waitForMail(email, 'Reset your Foltivo password', requestedAt), '/reset-password')
    await page.goto(reset)
    await page.getByLabel('Password', { exact: true }).fill(resetPassword)
    await page.getByRole('button', { name: 'Reset password', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page.getByRole('status')).toContainText('Your password has been reset')

    await page.getByRole('link', { name: 'Continue to sign in' }).click()
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Password', { exact: true }).fill(originalPassword)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page.getByRole('alert')).toContainText('Email or password is incorrect.')
    await page.getByLabel('Password', { exact: true }).fill(resetPassword)
    await page.getByRole('button', { name: 'Sign in', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page).toHaveURL(/\/mfa/)
    await page.getByRole('button', { name: 'Use a recovery code', exact: true }).click()
    await page.getByLabel('Recovery code').fill(recoveryCodes[2]!)
    await page.getByRole('button', { name: 'Verify and continue', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.getByLabel('Display name')).toHaveValue(updatedName)
    await expect(page.getByText(/Authenticator: Enabled/)).toBeVisible()

    // Losing the authenticator must still permit safe replacement with the
    // account password and an unused saved recovery code, never email alone.
    await page.getByRole('textbox', { name: 'Account password', exact: true }).fill(resetPassword)
    await page.getByRole('button', { name: 'Use a recovery code for security changes', exact: true }).click()
    await page.getByLabel('Recovery code for security changes', { exact: true }).fill(recoveryCodes[3]!)
    await page.getByRole('button', { name: 'Remove authenticator', exact: true }).click()
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await clearPasswordFields(page)
    await expect(page.getByText(/Authenticator: Not enabled/)).toBeVisible()

    await page.getByRole('button', { name: 'Sign out', exact: true }).click()
    await expect(page).toHaveURL(/\/sign-in/)
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/sign-in\?returnTo=/)
    expect(new URL(page.url()).searchParams.get('returnTo')).toBe('/settings')
    await expect(page.getByLabel('Display name')).toHaveCount(0)
})
