import type { SearchRequest, SearchType } from './types.ts'

export const MAX_QUERY_LENGTH = 200

export function readSearchState(params: URLSearchParams): SearchRequest {
  const type = params.get('type')
  return {
    query: (params.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH),
    type: type === 'book' || type === 'folio' ? type : 'all',
    cursor: params.get('cursor') || null,
  }
}

export function searchUrl(query: string, type: SearchType = 'all', cursor: string | null = null): string {
  const params = new URLSearchParams({ q: query.trim().slice(0, MAX_QUERY_LENGTH), type })
  if (cursor) params.set('cursor', cursor)
  return `/search?${params}`
}
