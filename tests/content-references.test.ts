import assert from 'node:assert/strict'
import test from 'node:test'
import {
  addFolioReference,
  removeBook,
  removeFolioReference,
} from '../src/domain/content/references.ts'
import type { Book, Folio } from '../src/domain/content/types.ts'

const folio: Folio = Object.freeze({
  id: 'folio',
  libraryId: 'personal',
  name: 'Research',
})
const planning: Book = Object.freeze({
  id: 'planning',
  libraryId: 'personal',
  name: 'Planning',
  folioIds: Object.freeze([]),
})

test('a Folio can exist without a Book and be referenced by multiple Books', () => {
  const onboarding: Book = { ...planning, id: 'onboarding', name: 'Onboarding' }
  const first = addFolioReference(planning, folio)
  const second = addFolioReference(onboarding, folio)
  assert.deepEqual(first.folioIds, [folio.id])
  assert.deepEqual(second.folioIds, [folio.id])
  assert.deepEqual(planning.folioIds, [])
  assert.deepEqual(folio, {
    id: 'folio',
    libraryId: 'personal',
    name: 'Research',
  })
})

test('adding the same reference twice is idempotent', () => {
  const book = addFolioReference(planning, folio)
  assert.equal(addFolioReference(book, folio), book)
})

test('cross-Library references are rejected without changing the Book', () => {
  assert.throws(
    () => addFolioReference(planning, { ...folio, libraryId: 'team' }),
    /own Library/,
  )
  assert.deepEqual(planning.folioIds, [])
})

test('removing a reference preserves the Folio and references in other Books', () => {
  const first = addFolioReference(planning, folio)
  const second = addFolioReference({ ...planning, id: 'other' }, folio)
  const folios = [folio]
  assert.deepEqual(removeFolioReference(first, folio.id).folioIds, [])
  assert.deepEqual(first.folioIds, [folio.id])
  assert.deepEqual(second.folioIds, [folio.id])
  assert.equal(folios[0], folio)
  assert.equal(removeFolioReference(first, 'missing'), first)
})

test('removing a Book preserves Library Folios and other Books', () => {
  const first = addFolioReference(planning, folio)
  const second = addFolioReference({ ...planning, id: 'other' }, folio)
  const books = Object.freeze([first, second])
  const folios = Object.freeze([folio])
  assert.deepEqual(removeBook(books, first.id), [second])
  assert.deepEqual(books, [first, second])
  assert.deepEqual(folios, [folio])
  assert.deepEqual(second.folioIds, [folio.id])
  assert.deepEqual(removeBook(books, 'missing'), books)
})
