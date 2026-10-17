import type {
  DiscoveryAccount,
  DiscoveryResource,
} from '../../features/discovery/types.ts'

export const mockAccounts: readonly DiscoveryAccount[] = [
  { id: 'maya', name: 'Maya — personal Library' },
  { id: 'alex', name: 'Alex — Studio member' },
]

export const mockLibraries = {
  maya: { id: 'maya-library', name: 'Maya’s Library', kind: 'user' },
  rowan: { id: 'rowan-library', name: 'Rowan’s Library', kind: 'user' },
  field: { id: 'open-field', name: 'Open Field', kind: 'organization' },
  studio: { id: 'studio', name: 'Studio', kind: 'organization' },
} as const

export interface MockResource extends DiscoveryResource {
  /** Fixture-only access list, evaluated inside the mock service. */
  accessibleTo: readonly string[]
  folioIds: readonly string[]
}

function resource(
  type: DiscoveryResource['type'],
  id: string,
  title: string,
  description: string,
  library: DiscoveryResource['library'],
  accessibleTo: readonly string[] = [],
  folioIds: readonly string[] = [],
): MockResource {
  return {
    id,
    type,
    title,
    description,
    library,
    accessibleTo,
    folioIds,
    visibility: accessibleTo.length ? 'private' : 'public',
    href: `/preview/${type}/${id}`,
  }
}

/** Invented review content. No real people, organizations, or live index. */
export const mockResources: readonly MockResource[] = [
  resource(
    'book',
    'field-guide',
    'A field guide to thoughtful work',
    'A collection of practical Folios on noticing, learning, and making space for good work.',
    mockLibraries.field,
    [],
    ['small-observations', 'research-practice', 'editorial-draft'],
  ),
  resource(
    'folio',
    'small-observations',
    'The art of small observations',
    'Field notes on paying attention: capture a detail, ask a question, follow the thread.',
    mockLibraries.field,
  ),
  resource(
    'folio',
    'research-practice',
    'A quieter research practice',
    'A simple way to turn scattered research notes into useful, connected knowledge.',
    mockLibraries.field,
  ),
  resource(
    'book',
    'learning-notebook',
    'The learning notebook',
    'Essays, reading notes, and experiments for a life of learning.',
    mockLibraries.rowan,
    [],
    ['reading-notes', 'garden-notes'],
  ),
  resource(
    'folio',
    'reading-notes',
    'Reading notes that stay useful',
    'Keep the passage, your response, and the question you want to revisit.',
    mockLibraries.rowan,
  ),
  resource(
    'folio',
    'garden-notes',
    'Notes from a growing garden',
    'Seasonal observations and small experiments, recorded one week at a time.',
    mockLibraries.rowan,
  ),
  resource(
    'book',
    'writing-practice',
    'A writing practice',
    'From rough notes to a piece worth sharing, with room for unfinished ideas.',
    mockLibraries.maya,
    [],
    ['writing-notes'],
  ),
  resource(
    'folio',
    'writing-notes',
    'Make room for a first draft',
    'Notes on finding a starting point and letting an idea take shape.',
    mockLibraries.maya,
  ),
  resource(
    'folio',
    'design-notes',
    'Design notes for a calmer web',
    'A public record of decisions about clarity, pace, and accessible interfaces.',
    mockLibraries.studio,
  ),
  resource(
    'book',
    'studio-handbook',
    'Studio handbook',
    'Shared working agreements and project notes for the Studio team.',
    mockLibraries.studio,
    ['alex'],
    ['design-notes', 'studio-plans'],
  ),
  resource(
    'folio',
    'studio-plans',
    'Studio project notes',
    'Private planning notes for the Studio team’s next project.',
    mockLibraries.studio,
    ['alex'],
  ),
  resource(
    'folio',
    'personal-notes',
    'My unfinished notes',
    'A private space for Maya’s working ideas and reading notes.',
    mockLibraries.maya,
    ['maya'],
  ),
  resource(
    'folio',
    'editorial-draft',
    'Editorial planning notes',
    'A restricted draft referenced by a public Book; hidden from unauthorized visitors.',
    mockLibraries.field,
    ['alex'],
  ),
]
