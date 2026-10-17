import './ResourceResult.css'
import { ResourceCard } from 'fieldnotes-ui'
import { Link } from 'react-router'
import type { DiscoveryResource } from '../../data/types.ts'

export function ResourceResult({ resource }: { resource: DiscoveryResource }) {
  return (
    <ResourceCard
      className="discovery-resource"
      headingLevel={3}
      title={<Link to={resource.href}>{resource.title}</Link>}
      description={resource.description}
      metadata={
        <>
          <span className="discovery-resource-type">
            {resource.type === 'book' ? 'Book' : 'Folio'}
          </span>
          <span>{resource.library.name}</span>
          <span>
            {resource.library.kind === 'user'
              ? 'User Library'
              : 'Organization Library'}
          </span>
          <span>
            {resource.visibility === 'public'
              ? 'Public'
              : 'Private · sample access'}
          </span>
        </>
      }
    />
  )
}
