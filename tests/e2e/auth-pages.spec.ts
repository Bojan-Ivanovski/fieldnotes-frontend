import { expect, test } from '@playwright/test'
const anonymous = {
  state: 'anonymous',
  user: null,
  csrfToken: 'fixture-csrf',
  methods: { password: true, totp: true, passkey: false },
}
test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/auth/session', (route) =>
    route.fulfill({ json: anonymous }),
  )
})
test('real authentication entry is separate from sample discovery accounts', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/sign-in\?returnTo=/)
  await expect(page).toHaveTitle('Sign in — Foltivo')
  await expect(page.getByLabel('Email', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'autocomplete',
    'current-password',
  )
  await expect(
    page.getByRole('button', { name: 'Continue as Maya' }),
  ).toHaveCount(0)
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow',
  )
})
test('verification consumes fragment once, hides token from address and sends only CSRF-protected JSON', async ({
  page,
}) => {
  let body: unknown
  await page.route('**/api/v1/auth/verification/confirm', (route) => {
    body = route.request().postDataJSON()
    expect(route.request().headers()['x-csrf-token']).toBe('fixture-csrf')
    return route.fulfill({ json: { message: 'Verified' } })
  })
  await page.goto('/verify-email#token=one-use-token')
  await expect(page).toHaveURL(/\/verify-email$/)
  await page.getByRole('button', { name: 'Verify email', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Your email is verified')
  expect(body).toEqual({ token: 'one-use-token' })
})
test('missing reset token and account outage have actionable states without protected access', async ({
  page,
}) => {
  await page.goto('/reset-password')
  await expect(
    page.getByText('This reset link is missing its token.', { exact: false }),
  ).toBeVisible()
  await page.route('**/api/v1/auth/session', (route) =>
    route.fulfill({
      status: 503,
      json: { error: { code: 'unavailable', message: 'Unavailable' } },
    }),
  )
  await page.goto('/settings')
  await expect(
    page.getByText('Your account could not be checked.'),
  ).toBeVisible()
  await expect(page.getByLabel('Display name')).toHaveCount(0)
  await expect(page).toHaveURL(/\/settings$/)
})
test('narrow forms support labels, visibility, keyboard submission and safe return destinations', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.route('**/api/v1/auth/login', (route) =>
    route.fulfill({
      status: 401,
      json: {
        error: {
          code: 'invalid_credentials',
          message: 'Email or password is incorrect.',
        },
      },
    }),
  )
  await page.goto('/sign-in?returnTo=https://example.com')
  await page.getByLabel('Email', { exact: true }).fill('person@example.test')
  await page
    .getByLabel('Password', { exact: true })
    .fill('a long example password')
  await page.getByRole('button', { name: 'Show password', exact: true }).click()
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute(
    'type',
    'text',
  )
  await page.getByLabel('Password', { exact: true }).press('Enter')
  await expect(page.getByRole('alert')).toContainText(
    'Email or password is incorrect.',
  )
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)
})
