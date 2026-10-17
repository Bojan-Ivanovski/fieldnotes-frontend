import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

async function search(page: Page, query: string) {
  await page.getByRole('searchbox', { name: 'Search Books and Folios' }).fill(query)
  await page.getByRole('button', { name: 'Search', exact: true }).click()
}

async function previewControls(page: Page) {
  await page.getByRole('link', { name: 'Preview controls' }).click()
}

async function scenario(page: Page, value: string) {
  await previewControls(page)
  await page.getByLabel('Response scenario').selectOption(value)
  await page.getByRole('link', { name: 'Return to discovery' }).click()
}

test('public Home, URL-based search, filters, pagination, history, and destinations', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Think beyondthe page.')
  await page.screenshot({ path: test.info().outputPath('home-desktop.png'), fullPage: true })
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0)
  await search(page, 'notes')
  await expect(page).toHaveURL(/\/search\?q=notes&type=all$/)
  await expect(page.getByRole('article')).toHaveCount(6)
  await page.getByRole('link', { name: 'Next →', exact: true }).click()
  await expect(page).toHaveURL(/cursor=mock%3A6/)
  await expect(page.getByRole('link', { name: 'Previous', exact: false })).toBeVisible()
  await page.goBack()
  await expect(page.getByRole('article')).toHaveCount(6)
  await page.getByRole('navigation', { name: 'Resource type' }).getByRole('link', { name: 'Folios', exact: true }).click()
  await expect(page).toHaveURL(/type=folio$/)
  await expect(page.getByRole('article')).toHaveCount(6)
  await page.reload()
  await expect(page.getByRole('searchbox')).toHaveValue('notes')
  await expect(page.getByRole('article')).toHaveCount(6)
  await page.getByRole('article').first().getByRole('link').click()
  await expect(page).toHaveURL(/\/preview\/folio\//)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('Home product illustration supports tabs, keyboard navigation, and discovery links', async ({ page }) => {
  await page.goto('/')
  const tabs = page.getByRole('tablist', { name: 'Explore the content model' })
  await expect(tabs.getByRole('tab', { name: '01 Write' })).toHaveAttribute('aria-selected', 'true')
  await tabs.getByRole('tab', { name: '02 Connect' }).click()
  await expect(page.getByRole('tabpanel')).toContainText('One idea.More than one home.')
  await tabs.getByRole('tab', { name: '02 Connect' }).press('ArrowRight')
  await expect(tabs.getByRole('tab', { name: '03 Discover' })).toBeFocused()
  await expect(page.getByRole('tabpanel')).toContainText('There’s a wholeworld beyond your notes.')
  await page.getByRole('tabpanel').getByRole('link', { name: 'Research & observation' }).click()
  await expect(page).toHaveURL(/\/search\?q=research&type=all$/)
  await expect(page.getByRole('article')).toHaveCount(1)
})

test('illustrated Home stays within narrow and tablet viewports in every demo state', async ({ page }) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    for (const name of ['01 Write', '02 Connect', '03 Discover']) {
      await page.getByRole('tab', { name }).click()
      await expect(page.getByRole('tabpanel')).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
  }
})

test('identity changes clear protected results, including browser history and sign-out', async ({ page }) => {
  await page.goto('/search?q=My+unfinished&type=all')
  await expect(page.getByRole('heading', { name: 'No threads found. Yet.' })).toBeVisible()
  await page.getByRole('link', { name: 'Sign in', exact: true }).click()
  await expect(page.getByText('no real authentication', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Continue as Maya' }).click()
  await expect(page.getByRole('link', { name: 'My unfinished notes', exact: true })).toBeVisible()
  await previewControls(page)
  await page.getByRole('button', { name: 'Continue as Alex' }).click()
  await expect(page.getByText('My unfinished notes', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'No threads found. Yet.' })).toBeVisible()
  await search(page, 'Studio project')
  await expect(page.getByRole('link', { name: 'Studio project notes', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Sign out of preview' }).click()
  await expect(page.getByText('Studio project notes', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'No threads found. Yet.' })).toBeVisible()
  await page.goBack()
  await expect(page.getByText('My unfinished notes', { exact: true })).toHaveCount(0)
})

test('Book preview hides inaccessible references and rechecks private destinations', async ({ page }) => {
  await page.goto('/preview/book/field-guide')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A field guide to thoughtful work')
  await expect(page.getByRole('article')).toHaveCount(2)
  await expect(page.getByText('Editorial planning notes', { exact: true })).toHaveCount(0)
  await page.goto('/preview/folio/personal-notes')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Resource unavailable.')
})

test('empty, failure, retry, unavailable, loading, and invalid-cursor states', async ({ page }) => {
  await page.goto('/search')
  await expect(page.getByRole('heading', { name: 'What’s on your mind?' })).toBeVisible()
  await search(page, 'notes')
  await expect(page.getByRole('article')).toHaveCount(6)
  await scenario(page, 'empty')
  await expect(page.getByRole('heading', { name: 'No threads found. Yet.' })).toBeVisible()
  await scenario(page, 'failure')
  await expect(page.getByRole('heading', { name: 'We couldn’t complete that search.' })).toBeVisible()
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByRole('heading', { name: 'We couldn’t complete that search.' })).toBeVisible()
  await scenario(page, 'unavailable')
  await expect(page.getByRole('heading', { name: 'Discovery is taking a pause.' })).toBeVisible()
  await scenario(page, 'slow')
  await expect(page.getByText('Looking for your next thread…')).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(6)
  await scenario(page, 'normal')
  await page.goto('/search?q=notes&type=all&cursor=invalid')
  await expect(page.getByRole('heading', { name: 'This results page has expired.' })).toBeVisible()
  await page.getByRole('link', { name: 'Return to first page' }).click()
  await expect(page.getByRole('article')).toHaveCount(6)
})

test('obsolete slow searches do not overwrite a new query or identity', async ({ page }) => {
  await page.goto('/search?q=My+unfinished&type=all')
  await previewControls(page)
  await page.getByLabel('Response scenario').selectOption('slow')
  await page.getByRole('button', { name: 'Continue as Maya' }).click()
  await expect(page.getByText('Looking for your next thread…')).toBeVisible()
  await search(page, 'research')
  await page.getByRole('button', { name: 'Sign out of preview' }).click()
  await expect(page.getByRole('link', { name: 'A quieter research practice', exact: true })).toBeVisible()
  await expect(page.getByText('My unfinished notes', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('searchbox')).toHaveValue('research')
})

test('narrow screens, keyboard submission, preview identity links, and existing note routes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await page.screenshot({ path: test.info().outputPath('home-mobile.png'), fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await expect(page.getByRole('link', { name: 'Create an account', exact: false })).toBeVisible()
  await page.getByRole('searchbox').fill('research')
  await page.getByRole('searchbox').press('Enter')
  await expect(page.getByRole('article')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.goto('/notes')
  await expect(page.getByRole('heading', { name: 'All notes' })).toBeVisible()
  await page.getByRole('button', { name: 'Open Navigation' }).click()
  await expect(page.getByRole('navigation', { name: 'Sections' })).toBeVisible()
})
