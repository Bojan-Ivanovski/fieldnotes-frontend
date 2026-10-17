import type { Book, Folio } from './types.ts'

/** Callers must authorize the operation before invoking this domain helper. */
export function addFolioReference(book: Book, folio: Folio): Book {
  if (book.libraryId !== folio.libraryId) {
    throw new Error('A Book can only reference Folios in its own Library.')
  }

  if (book.folioIds.includes(folio.id)) return book

  return { ...book, folioIds: [...book.folioIds, folio.id] }
}

/** Removes only the reference. The Folio and other Books are untouched. */
export function removeFolioReference(book: Book, folioId: string): Book {
  if (!book.folioIds.includes(folioId)) return book

  return { ...book, folioIds: book.folioIds.filter((id) => id !== folioId) }
}

/** Returns a new collection; Folios are owned separately by their Library. */
export function removeBook(books: readonly Book[], bookId: string): Book[] {
  return books.filter((book) => book.id !== bookId)
}
