# Foltivo mocks

Reusable, deterministic substitutes for services that are not available yet.
The app currently uses these mocks in both development and production builds,
following the developer's instruction for #3. The preview banner is always
visible. Nothing in this directory provides authentication or real security;
all fixtures, including sample private content, are shipped to the browser.
Never put real private information in fixtures.

## Directory layout

```text
mocks/
└── discovery/
    ├── fixtures.ts   # Invented Libraries, accounts, Books, Folios, access lists
    ├── scenarios.ts  # Named response scenarios and review descriptions
    └── client.ts     # Per-instance session, access simulation, search, pagination
```

The UI consumes `DiscoveryService` from `features/discovery/types.ts` rather
than importing resource fixtures. The composition point is
`features/discovery/DiscoveryProvider.tsx`. Preview controls are deliberately
separate from the service interface so future live services do not need to
implement sample-account switching or failure simulation.

## Use in tests or new features

```ts
import { createMockDiscoveryService } from './discovery/client.ts'

const { service, controls } = createMockDiscoveryService({ delayMs: 0 })
const controller = new AbortController()
const publicPage = await service.search(
  { query: 'notes', type: 'all', cursor: null }, controller.signal,
)
controls.setAccount('maya')
const personalPage = await service.search(
  { query: 'notes', type: 'folio', cursor: null }, controller.signal,
)
```

Create a fresh instance per test or independent preview. Instances do not share
sessions or scenarios. The default latency is 350 ms. State lives only in
memory: a full reload or leaving the discovery layout resets it. There are no
cookies, tokens, localStorage entries, network requests, or persistence writes.

## Review in the app

Run `npm run dev`, then open Home or `/search`. The banner's **Preview controls**
link opens `/preview/account`, where you can select an identity and a response
scenario. Sign-in and account-creation links also open this clearly labeled
preview, without collecting credentials or creating real accounts.

| Visitor | Accessible sample content |
| --- | --- |
| Anonymous | Public Books and Folios across all sample Libraries |
| Maya | Public content and her private “My unfinished notes” Folio |
| Alex | Public content, the private Studio handbook and planning Folio, and the restricted editorial draft |

Useful searches:

- `notes`: enough public results to exercise six-item pagination.
- `research`: a public Folio in an Organization Library.
- `My unfinished`: private content available only to Maya.
- `Studio project`: private content available only to Alex.
- `design`: a public Folio also referenced by a private Book. Anonymous discovery
  must still find the Folio.
- `Editorial planning`: restricted Folio referenced by a public Book. The public
  Book must not disclose it to anonymous visitors.

| Scenario | Behavior |
| --- | --- |
| Normal results | Case-insensitive name/description matching and authorized pagination |
| Slow connection | Two-second response for loading and cancellation review |
| No matches | Successful empty result set |
| Request failure | Error state with a retry action |
| Service unavailable | Distinct unavailable state with a retry action |

Scenarios remain active until changed or the preview resets. Retrying a
persistent failure fails again; return to **Normal results** to recover.
Scenarios also apply to preview resource requests, except that No matches
only affects search. An empty search never dumps the index.

## Access and pagination behavior

The mock service applies its access lists before matching and pagination. It
returns presentation metadata only: no access lists, Book reference IDs, or
unfiltered totals. Resource identity is `type + id`; Folios are searched once
regardless of Book references. Book previews filter each referenced Folio
independently. Resource opening rechecks access and returns the same not-found
error for inaccessible and nonexistent resources.

Cursors are mock-specific offsets (`mock:6`, for example), not a proposed API
contract. Invalid or out-of-range cursors return an explicit expired-page state.
The UI keeps query, resource type, and cursor in the URL. New queries and type
filters reset pagination. Choosing another preview identity also clears the
return URL's cursor.

Every identity or scenario change replaces the session key and emits a
subscription update. The provider cancels requests and discards cached results
before publishing that change. All query keys include the session key; obsolete
mock requests also reject if their original session changed. Abort signals
cancel latency timers. This demonstrates the frontend lifecycle; a real service
must enforce access on the server independently.

## Extending fixtures

Add invented resources in `discovery/fixtures.ts`. Use stable unique IDs and
explicit Library identity/type. Empty `accessibleTo` means public; a nonempty
list makes the resource private to those sample identities. Book `folioIds`
contain references, not owned copies. Preserve the public-Book/private-Folio
and private-Book/public-Folio examples when extending the dataset.

Add response scenarios in `discovery/scenarios.ts`, implement their behavior in
`discovery/client.ts`, and cover them with behavior tests. Avoid special query
words that secretly trigger failures; scenarios should be explicit and reusable.

## Verification and live integration

- `npm test`: domain and mock-service behavior tests, using Node's built-in runner.
- `npm run test:e2e`: Chromium tests for discovery and access transitions. On a
  machine without the browser, run `npx playwright install chromium` once.
- `npm run build`: TypeScript checks application and tests, then builds the app.
- `npm run lint`: repository lint checks.

The live replacement requirements are in
[`docs/dev/discovery.md`](../../docs/dev/discovery.md). The mock response shape
is a frontend integration boundary, not an agreed REST endpoint or a finished
permissions design. Live content API and reader destinations remain outside this preview delivery.
Real Go-backed authentication is integrated separately; see
[authentication](../../docs/dev/authentication.md). Sample accounts never grant
live account access.
