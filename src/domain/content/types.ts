/** Product entities, not a persistence schema or an authorization policy. */
export interface UserLibrary {
  id: string
  name: string
  kind: 'user'
  ownerUserId: string
}

export interface OrganizationLibrary {
  id: string
  name: string
  kind: 'organization'
  organizationId: string
}

export type Library = UserLibrary | OrganizationLibrary

export interface Folio {
  id: string
  libraryId: string
  name: string
}

/** References organize Folios; they do not confer access. */
export interface Book {
  id: string
  libraryId: string
  name: string
  folioIds: readonly string[]
}

export interface Directory {
  id: string
  folioId: string
  name: string
  /** null places this Directory at the Folio root. */
  parentDirectoryId: string | null
}

export interface Document {
  id: string
  folioId: string
  /** null places this Document at the Folio root. */
  directoryId: string | null
  name: string
  markdown: string
}
