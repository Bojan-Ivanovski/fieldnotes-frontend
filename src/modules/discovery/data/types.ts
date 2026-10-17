export type ResourceType = 'book' | 'folio'
export type SearchType = 'all' | ResourceType

export interface DiscoveryAccount {
  id: string
  name: string
}

/** key must change whenever identity or effective permissions change. */
export interface DiscoverySession {
  key: string
  status: 'resolving' | 'ready' | 'unavailable'
  account: DiscoveryAccount | null
}

export interface DiscoveryResource {
  id: string
  type: ResourceType
  title: string
  description: string
  library: { id: string; name: string; kind: 'user' | 'organization' }
  visibility: 'public' | 'private'
  href: string
}

export interface SearchRequest {
  query: string
  type: SearchType
  cursor: string | null
}

export interface SearchPage {
  results: readonly DiscoveryResource[]
  nextCursor: string | null
  previousCursor: string | null
  hasPrevious: boolean
}

export interface ResourcePreview {
  resource: DiscoveryResource
  /** Already authorized; no inaccessible references or counts. */
  references: readonly DiscoveryResource[]
}

/** A live adapter must authorize on the server before returning any metadata. */
export interface DiscoveryService {
  getSession: () => DiscoverySession
  subscribeSession: (listener: () => void) => () => void
  search: (request: SearchRequest, signal: AbortSignal) => Promise<SearchPage>
  getResource: (
    type: ResourceType,
    id: string,
    signal: AbortSignal,
  ) => Promise<ResourcePreview>
}

export class DiscoveryError extends Error {
  code: 'failure' | 'unavailable' | 'not-found' | 'invalid-cursor'

  constructor(code: DiscoveryError['code']) {
    super(code)
    this.name = 'DiscoveryError'
    this.code = code
  }
}
