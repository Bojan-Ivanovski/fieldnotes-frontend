import './SearchPage.css'
import { useQuery } from '@tanstack/react-query'
import { Button, SearchResults } from 'fieldnotes-ui'
import { Link, useSearchParams } from 'react-router'
import { useDiscovery } from '../../features/discovery/context.ts'
import { SearchForm } from '../../features/discovery/SearchForm/SearchForm.tsx'
import { ResourceResult } from '../../features/discovery/ResourceResult/ResourceResult.tsx'
import { readSearchState, searchUrl } from '../../features/discovery/search-state.ts'
import { DiscoveryError } from '../../features/discovery/types.ts'
import type { SearchType } from '../../features/discovery/types.ts'

const filters: { type: SearchType; label: string }[] = [
  { type: 'all', label: 'All' }, { type: 'book', label: 'Books' }, { type: 'folio', label: 'Folios' },
]

export function SearchPage() {
  const [params] = useSearchParams()
  const request = readSearchState(params)
  const { service, session } = useDiscovery()
  const search = useQuery({
    queryKey: ['discovery', session.key, request],
    queryFn: ({ signal }) => service.search(request, signal),
    enabled: Boolean(request.query) && session.status === 'ready',
  })
  const errorCode = search.error instanceof DiscoveryError ? search.error.code : 'failure'
  const announcement = !request.query ? 'Enter a search to begin.'
    : session.status === 'resolving' ? 'Checking your session…'
    : session.status === 'unavailable' ? 'Your session could not be checked.'
    : search.isPending ? 'Searching Books and Folios…'
    : search.isError ? errorCode === 'unavailable' ? 'Discovery is temporarily unavailable.' : 'Search could not be completed.'
    : `${search.data.results.length} ${search.data.results.length === 1 ? 'result' : 'results'} on this page.`

  return (
    <div className="discovery-search-page">
      <div className="discovery-search-heading"><p className="discovery-eyebrow">Follow your curiosity</p><h1>Find your next thread.</h1><p>Search Books and Folios across User and Organization Libraries.</p></div>
      <SearchForm query={request.query} type={request.type} />
      <p className="discovery-search-help">{session.account ? 'Public content + private content accessible to your sample account.' : 'Public content. Open to everyone, no account needed.'}</p>
      <nav className="discovery-filters" aria-label="Resource type">
        {filters.map(({ type, label }) => <Link key={type} to={searchUrl(request.query, type)} aria-current={request.type === type ? 'page' : undefined}>{label}</Link>)}
      </nav>
      <SearchResults title={request.query ? `Results for “${request.query}”` : 'A good place to start'} announcement={announcement} loading={Boolean(request.query) && search.isFetching}>
        {!request.query ? (
          <div className="discovery-state"><span aria-hidden="true">↗</span><h3>What’s on your mind?</h3><p>Search by a Book or Folio’s name or description.</p><div className="discovery-suggestions">Try <Link to={searchUrl('notes')}>notes</Link>, <Link to={searchUrl('research')}>research</Link>, or <Link to={searchUrl('writing')}>writing</Link>.</div></div>
        ) : session.status !== 'ready' ? (
          <div className="discovery-state"><h3>{session.status === 'resolving' ? 'Checking your session…' : 'Session unavailable'}</h3><p>Results stay hidden until your access can be checked.</p></div>
        ) : search.isPending ? (
          <div className="discovery-state"><div className="discovery-loading" aria-hidden="true" /><p>Looking for your next thread…</p></div>
        ) : search.isError ? (
          <div className="discovery-state"><h3>{errorCode === 'unavailable' ? 'Discovery is taking a pause.' : errorCode === 'invalid-cursor' ? 'This results page has expired.' : 'We couldn’t complete that search.'}</h3><p>{errorCode === 'unavailable' ? 'The search service is unavailable. Try again in a moment.' : errorCode === 'invalid-cursor' ? 'Start again from the first page for this search.' : 'Your search is still here. Give it another try.'}</p>{errorCode === 'invalid-cursor' ? <Link to={searchUrl(request.query, request.type)}>Return to first page</Link> : <Button onClick={() => { void search.refetch() }}>Try again</Button>}</div>
        ) : search.data.results.length === 0 ? (
          <div className="discovery-state"><h3>No threads found. Yet.</h3><p>Try another word or search all resource types.</p><Link to={searchUrl(request.query, 'all')}>Search all Books and Folios</Link></div>
        ) : (
          <>
            <ul className="discovery-result-list">{search.data.results.map((resource) => <li key={`${resource.type}:${resource.id}`}><ResourceResult resource={resource} /></li>)}</ul>
            {(search.data.hasPrevious || search.data.nextCursor) && <nav className="discovery-pagination" aria-label="Search result pages">{search.data.hasPrevious ? <Link className="discovery-link-button" to={searchUrl(request.query, request.type, search.data.previousCursor)}>← Previous</Link> : <span />}{search.data.nextCursor && <Link className="discovery-link-button" to={searchUrl(request.query, request.type, search.data.nextCursor)}>Next →</Link>}</nav>}
          </>
        )}
      </SearchResults>
    </div>
  )
}
