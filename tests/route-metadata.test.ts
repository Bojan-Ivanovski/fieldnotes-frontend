import assert from 'node:assert/strict'
import test from 'node:test'
import { getRouteMetadata } from '../src/app/route-metadata.ts'

// Check public URL boundaries, rather than duplicating every display string.
test('public pages use the intended Foltivo origin and distinct titles', () => {
  const home = getRouteMetadata('/')
  const search = getRouteMetadata('/search')
  assert.equal(home.canonical, 'https://foltivo.com/')
  assert.equal(home.robots, 'index, follow')
  assert.equal(search.canonical, 'https://foltivo.com/search')
  assert.equal(search.robots, 'noindex, follow')
  assert.notEqual(home.title, search.title)
  assert.ok(home.title.includes('Foltivo'))
  assert.ok(search.title.includes('Foltivo'))
})

test('private, preview, and missing routes do not advertise public share URLs', () => {
  for (const route of [
    '/notes',
    '/notes/new',
    '/favorites',
    '/settings',
    '/preview/account',
    '/preview/folio/personal-notes',
    '/preview/book/studio-handbook',
    '/missing',
  ]) {
    const metadata = getRouteMetadata(route)
    assert.equal(metadata.canonical, null, route)
    assert.equal(metadata.robots, 'noindex, nofollow', route)
    assert.ok(metadata.title.endsWith(' — Foltivo'), route)
    assert.ok(!metadata.title.includes('personal-notes'), route)
    assert.ok(!metadata.description.includes('studio-handbook'), route)
  }
})

test('trailing slashes keep the same public URL and protected route policy', () => {
  for (const route of ['/search', '/notes', '/preview/account']) {
    assert.deepEqual(getRouteMetadata(`${route}/`), getRouteMetadata(route))
  }
})
