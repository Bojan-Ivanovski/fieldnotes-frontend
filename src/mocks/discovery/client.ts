import { DiscoveryError } from '../../features/discovery/types.ts'
import type {
  DiscoveryResource,
  DiscoveryService,
  DiscoverySession,
  ResourceType,
  SearchRequest,
} from '../../features/discovery/types.ts'
import { mockAccounts, mockResources } from './fixtures.ts'
import type { MockResource } from './fixtures.ts'
import type { MockScenario } from './scenarios.ts'

export const MOCK_PAGE_SIZE = 6

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted()
    const abort = () => {
      clearTimeout(timer)
      reject(new DOMException('Request cancelled', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, ms)
    signal.addEventListener('abort', abort, { once: true })
  })
}

function metadata(row: MockResource): DiscoveryResource {
  const { id, type, title, description, library, visibility, href } = row
  return {
    id,
    type,
    title,
    description,
    library: { ...library },
    visibility,
    href,
  }
}

/** In-memory API substitute. This is a policy demonstration, not security. */
export function createMockDiscoveryService(options: { delayMs?: number } = {}) {
  let generation = 0
  let session: DiscoverySession = {
    key: 'mock-0',
    status: 'ready',
    account: null,
  }
  let scenario: MockScenario = 'normal'
  const listeners = new Set<() => void>()

  function changed() {
    session = { ...session, key: `mock-${++generation}` }
    listeners.forEach((listener) => listener())
  }

  const canRead = (row: MockResource) =>
    row.visibility === 'public' ||
    (session.account !== null && row.accessibleTo.includes(session.account.id))

  async function wait(signal: AbortSignal) {
    const key = session.key
    await delay(scenario === 'slow' ? 2000 : (options.delayMs ?? 350), signal)
    signal.throwIfAborted()
    if (key !== session.key)
      throw new DOMException('Session changed', 'AbortError')
    if (scenario === 'failure' || scenario === 'unavailable')
      throw new DiscoveryError(scenario)
  }

  const service: DiscoveryService = {
    getSession: () => session,
    subscribeSession: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    async search(request: SearchRequest, signal: AbortSignal) {
      await wait(signal)
      const query = request.query.trim().toLocaleLowerCase()
      if (!query || scenario === 'empty') {
        return {
          results: [],
          nextCursor: null,
          previousCursor: null,
          hasPrevious: false,
        }
      }
      // Authorize each resource BEFORE matching and pagination, independently of Books.
      const matches = mockResources
        .filter(canRead)
        .filter(
          (row) =>
            (request.type === 'all' || row.type === request.type) &&
            `${row.title} ${row.description}`
              .toLocaleLowerCase()
              .includes(query),
        )
      const cursor = request.cursor
      if (cursor && !/^mock:\d+$/.test(cursor))
        throw new DiscoveryError('invalid-cursor')
      const offset = cursor ? Number(cursor.slice(5)) : 0
      if (
        !Number.isSafeInteger(offset) ||
        offset % MOCK_PAGE_SIZE !== 0 ||
        (offset > 0 && offset >= matches.length)
      )
        throw new DiscoveryError('invalid-cursor')
      return {
        results: matches.slice(offset, offset + MOCK_PAGE_SIZE).map(metadata),
        nextCursor:
          offset + MOCK_PAGE_SIZE < matches.length
            ? `mock:${offset + MOCK_PAGE_SIZE}`
            : null,
        previousCursor:
          offset > MOCK_PAGE_SIZE ? `mock:${offset - MOCK_PAGE_SIZE}` : null,
        hasPrevious: offset > 0,
      }
    },
    async getResource(type: ResourceType, id: string, signal: AbortSignal) {
      await wait(signal)
      const row = mockResources.find(
        (item) => item.type === type && item.id === id,
      )
      if (!row || !canRead(row)) throw new DiscoveryError('not-found')
      return {
        resource: metadata(row),
        references:
          row.type === 'book'
            ? mockResources
                .filter(
                  (item) =>
                    item.type === 'folio' &&
                    row.folioIds.includes(item.id) &&
                    canRead(item),
                )
                .map(metadata)
            : [],
      }
    },
  }

  return {
    service,
    controls: {
      accounts: mockAccounts,
      getScenario: () => scenario,
      setAccount(id: string | null) {
        const account = mockAccounts.find((item) => item.id === id) ?? null
        if (id !== null && account === null)
          throw new Error('Unknown mock account')
        session = { ...session, account }
        changed()
      },
      setScenario(next: MockScenario) {
        scenario = next
        changed()
      },
    },
  }
}
