import './ResourcePreviewPage.css'
import { useQuery } from '@tanstack/react-query'
import { Button } from 'fieldnotes-ui'
import { Link, useParams } from 'react-router'
import { useDiscovery } from '../../providers/DiscoveryProvider/context.ts'
import { ResourceResult } from '../../components/ResourceResult/ResourceResult.tsx'
import { DiscoveryError } from '../../data/types.ts'

export function ResourcePreviewPage() {
  const { type, id = '' } = useParams()
  const { service, session } = useDiscovery()
  const validType = type === 'book' || type === 'folio'
  const result = useQuery({
    queryKey: ['discovery-resource', session.key, type, id],
    queryFn: ({ signal }) =>
      service.getResource(type === 'book' ? 'book' : 'folio', id, signal),
    enabled: validType && session.status === 'ready',
  })
  const notFound =
    !validType ||
    (result.error instanceof DiscoveryError &&
      result.error.code === 'not-found')

  return (
    <div className="resource-preview-page">
      <Link to="/search">← Back to discovery</Link>
      <p className="discovery-eyebrow">Sample resource destination</p>
      {session.status !== 'ready' ? (
        <p role="status">Checking access before displaying content…</p>
      ) : notFound ? (
        <>
          <h1>Resource unavailable.</h1>
          <p>
            This sample resource doesn’t exist or isn’t accessible to the
            current visitor.
          </p>
        </>
      ) : result.isPending ? (
        <p role="status">Checking access and opening the sample resource…</p>
      ) : result.isError ? (
        <>
          <h1>Couldn’t open this resource.</h1>
          <p role="status">
            The preview service could not complete the request.
          </p>
          <Button
            onClick={() => {
              void result.refetch()
            }}
          >
            Try again
          </Button>
        </>
      ) : (
        <>
          <h1>{result.data.resource.title}</h1>
          <p>{result.data.resource.description}</p>
          <p className="discovery-search-help">
            {result.data.resource.type === 'book' ? 'Book' : 'Folio'} ·{' '}
            {result.data.resource.library.name} ·{' '}
            {result.data.resource.visibility === 'public'
              ? 'Public'
              : 'Private sample content'}
          </p>
          {type === 'book' ? (
            <section className="resource-preview-section">
              <h2>Folios you can access</h2>
              {result.data.references.length ? (
                <ul className="discovery-result-list">
                  {result.data.references.map((resource) => (
                    <li key={resource.id}>
                      <ResourceResult resource={resource} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No accessible Folios to show.</p>
              )}
            </section>
          ) : (
            <div className="resource-preview-section">
              <h2>A place for this idea to grow</h2>
              <p>
                This illustrative Folio is part of the discovery preview. Its
                description is sample content, rather than a live document.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
