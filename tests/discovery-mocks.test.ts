import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createMockDiscoveryService,
  MOCK_PAGE_SIZE,
} from '../src/modules/discovery/data/mocks/client.ts'
import { DiscoveryError } from '../src/modules/discovery/data/types.ts'
import {
  readSearchState,
  searchUrl,
} from '../src/modules/discovery/lib/search-state.ts'
import type {
  DiscoveryResource,
  SearchType,
} from '../src/modules/discovery/data/types.ts'

function setup() {
  const runtime = createMockDiscoveryService({ delayMs: 0 })
  return { ...runtime, signal: new AbortController().signal }
}

async function allResults(
  runtime: ReturnType<typeof setup>,
  query: string,
  type: SearchType = 'all',
) {
  const results: DiscoveryResource[] = []
  let cursor: string | null = null
  do {
    const page = await runtime.service.search(
      { query, type, cursor },
      runtime.signal,
    )
    assert.ok(page.results.length <= MOCK_PAGE_SIZE)
    results.push(...page.results)
    cursor = page.nextCursor
  } while (cursor)
  return results
}

test('anonymous search returns only public metadata, with bounded unique results', async () => {
  const runtime = setup()
  const results = await allResults(runtime, 'notes')
  assert.ok(results.length > MOCK_PAGE_SIZE)
  assert.ok(results.every((row) => row.visibility === 'public'))
  assert.equal(
    new Set(results.map((row) => `${row.type}:${row.id}`)).size,
    results.length,
  )
  const serialized = JSON.stringify(results)
  assert.ok(!serialized.includes('accessibleTo'))
  assert.ok(!serialized.includes('folioIds'))
  assert.ok(!serialized.includes('Editorial planning notes'))
  assert.ok(!serialized.includes('Studio project notes'))
})

test('private Books do not hide independently public Folios from global search', async () => {
  const runtime = setup()
  const results = await allResults(runtime, 'design')
  assert.deepEqual(
    results.map((row) => row.id),
    ['design-notes'],
  )
  await assert.rejects(
    runtime.service.getResource('book', 'studio-handbook', runtime.signal),
    (error) => error instanceof DiscoveryError && error.code === 'not-found',
  )
})

test('public Book listings omit inaccessible Folios and their metadata', async () => {
  const runtime = setup()
  const preview = await runtime.service.getResource(
    'book',
    'field-guide',
    runtime.signal,
  )
  assert.deepEqual(
    preview.references.map((row) => row.id),
    ['small-observations', 'research-practice'],
  )
  assert.ok(!JSON.stringify(preview).includes('editorial-draft'))
  runtime.controls.setAccount('alex')
  const authorized = await runtime.service.getResource(
    'book',
    'field-guide',
    runtime.signal,
  )
  assert.ok(authorized.references.some((row) => row.id === 'editorial-draft'))
})

test('each sample account gets only its independently authorized private resources', async () => {
  const runtime = setup()
  runtime.controls.setAccount('maya')
  const personal = await allResults(runtime, 'notes')
  assert.ok(personal.some((row) => row.id === 'personal-notes'))
  assert.ok(!personal.some((row) => row.id === 'studio-plans'))
  runtime.controls.setAccount('alex')
  const team = await allResults(runtime, 'notes')
  assert.ok(team.some((row) => row.id === 'studio-plans'))
  assert.ok(!team.some((row) => row.id === 'personal-notes'))
  runtime.controls.setAccount(null)
  assert.ok(
    (await allResults(runtime, 'notes')).every(
      (row) => row.visibility === 'public',
    ),
  )
})

test('result navigation rechecks access and uses the same response for missing resources', async () => {
  const runtime = setup()
  runtime.controls.setAccount('maya')
  assert.equal(
    (
      await runtime.service.getResource(
        'folio',
        'personal-notes',
        runtime.signal,
      )
    ).resource.id,
    'personal-notes',
  )
  runtime.controls.setAccount(null)
  for (const id of ['personal-notes', 'missing']) {
    await assert.rejects(
      runtime.service.getResource('folio', id, runtime.signal),
      (error) => error instanceof DiscoveryError && error.code === 'not-found',
    )
  }
})

test('type filtering and pagination happen after authorization', async () => {
  const runtime = setup()
  assert.ok(
    (await allResults(runtime, 'notes', 'folio')).every(
      (row) => row.type === 'folio',
    ),
  )
  assert.ok(
    (await allResults(runtime, 'notes', 'book')).every(
      (row) => row.type === 'book',
    ),
  )
  const first = await runtime.service.search(
    { query: 'notes', type: 'all', cursor: null },
    runtime.signal,
  )
  const second = await runtime.service.search(
    { query: 'notes', type: 'all', cursor: first.nextCursor },
    runtime.signal,
  )
  assert.equal(second.hasPrevious, true)
  assert.equal(second.previousCursor, null)
  assert.equal(second.nextCursor, null)
  for (const cursor of [
    'bad',
    'mock:999999',
    'mock:1',
    'mock:9007199254740992',
  ]) {
    await assert.rejects(
      runtime.service.search(
        { query: 'notes', type: 'all', cursor },
        runtime.signal,
      ),
      (error) =>
        error instanceof DiscoveryError && error.code === 'invalid-cursor',
    )
  }
})

test('failure and unavailable scenarios differ from a successful empty search', async () => {
  const runtime = setup()
  const request = { query: 'notes', type: 'all', cursor: null } as const
  runtime.controls.setScenario('empty')
  assert.deepEqual(
    (await runtime.service.search(request, runtime.signal)).results,
    [],
  )
  for (const scenario of ['failure', 'unavailable'] as const) {
    runtime.controls.setScenario(scenario)
    await assert.rejects(
      runtime.service.search(request, runtime.signal),
      (error) => error instanceof DiscoveryError && error.code === scenario,
    )
  }
})

test('aborted requests and requests from a previous identity cannot return data', async () => {
  const runtime = setup()
  const controller = new AbortController()
  const pending = runtime.service.search(
    { query: 'notes', type: 'all', cursor: null },
    controller.signal,
  )
  controller.abort()
  await assert.rejects(pending, { name: 'AbortError' })
  const obsolete = runtime.service.search(
    { query: 'notes', type: 'all', cursor: null },
    runtime.signal,
  )
  runtime.controls.setAccount('alex')
  await assert.rejects(obsolete, { name: 'AbortError' })
  await assert.rejects(
    runtime.service.search(
      { query: 'notes', type: 'all', cursor: null },
      controller.signal,
    ),
    { name: 'AbortError' },
  )
})

test('mock sessions are isolated and subscriptions can be removed', () => {
  const first = setup()
  const second = setup()
  const originalKey = first.service.getSession().key
  let events = 0
  const unsubscribe = first.service.subscribeSession(() => {
    events++
  })
  first.controls.setAccount('maya')
  assert.notEqual(first.service.getSession().key, originalKey)
  assert.equal(events, 1)
  assert.equal(second.service.getSession().account, null)
  unsubscribe()
  first.controls.setAccount(null)
  assert.equal(events, 1)
})

test('URL state trims and bounds queries, defaults unknown filters, and encodes safely', () => {
  assert.deepEqual(
    readSearchState(new URLSearchParams('q=++notes++&type=unknown&cursor=')),
    { query: 'notes', type: 'all', cursor: null },
  )
  const url = searchUrl('  a & b?  ', 'book', 'mock:6')
  assert.deepEqual(
    readSearchState(new URL(url, 'https://example.test').searchParams),
    { query: 'a & b?', type: 'book', cursor: 'mock:6' },
  )
  assert.equal(
    readSearchState(new URLSearchParams({ q: 'x'.repeat(500) })).query.length,
    200,
  )
})
