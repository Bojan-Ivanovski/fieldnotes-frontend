import { expect, test } from '@playwright/test'

test('two tabs serialize cookie-changing login and background session reads', async ({
  context,
}) => {
  const anonymous = {
    state: 'anonymous',
    user: null,
    csrfToken: 'anonymous-csrf',
    methods: { password: true, totp: false, passkey: false },
  }
  const authenticated = {
    ...anonymous,
    state: 'authenticated',
    csrfToken: 'authenticated-csrf',
    user: {
      id: 'coordinated-user',
      email: 'person@example.test',
      name: 'Coordinated person',
      emailVerified: true,
      libraryId: 'personal-library',
    },
  }
  let state: typeof anonymous | typeof authenticated = anonymous
  let sessionReads = 0
  let loginStarted = false
  let finishLogin: (() => void) | undefined
  const paused = new Promise<void>((resolve) => {
    finishLogin = resolve
  })
  await context.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/auth/session')) {
      sessionReads++
      await route.fulfill({ json: state })
      return
    }
    if (path.endsWith('/auth/login')) {
      loginStarted = true
      await paused
      state = authenticated
      await route.fulfill({ json: state })
      return
    }
    if (path.endsWith('/auth/security')) {
      await route.fulfill({
        json: { totpEnabled: false, recoveryCodesRemaining: 0, passkeys: [] },
      })
      return
    }
    if (path.endsWith('/auth/sessions')) {
      await route.fulfill({ json: { sessions: [] } })
      return
    }
    await route.fulfill({
      status: 404,
      json: { error: { code: 'not_found', message: 'Not found' } },
    })
  })
  const first = await context.newPage()
  const second = await context.newPage()
  await first.goto('/sign-in')
  await second.goto('/sign-in')
  await expect(first.getByLabel('Email', { exact: true })).toBeEnabled()
  await expect(second.getByLabel('Email', { exact: true })).toBeEnabled()
  await first.getByLabel('Email', { exact: true }).fill('person@example.test')
  await first
    .getByLabel('Password', { exact: true })
    .fill('a coordinated test password')
  await first.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect.poll(() => loginStarted).toBe(true)
  const beforeRead = sessionReads
  await second.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect
    .poll(() =>
      second.evaluate(
        async () =>
          (await navigator.locks.query()).pending?.filter(
            (lock) => lock.name === 'foltivo-auth-session',
          ).length ?? 0,
      ),
    )
    .toBeGreaterThan(0)
  expect(sessionReads).toBe(beforeRead)
  finishLogin!()
  await expect(first).toHaveURL(/\/settings$/)
  await expect(second).toHaveURL(/\/settings$/)
  await expect(first.getByLabel('Display name')).toHaveValue(
    'Coordinated person',
  )
  await expect(second.getByLabel('Display name')).toHaveValue(
    'Coordinated person',
  )
})
