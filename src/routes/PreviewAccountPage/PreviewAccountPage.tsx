import './PreviewAccountPage.css'
import { Button } from 'fieldnotes-ui'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useDiscovery } from '../../features/discovery/context.ts'
import { mockScenarios } from '../../mocks/discovery/scenarios.ts'
import type { MockScenario } from '../../mocks/discovery/scenarios.ts'

export function PreviewAccountPage() {
  const { preview, session } = useDiscovery()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  // Return only to discovery; never accept an external redirect from the URL.
  const requested = params.get('returnTo') ?? '/search'
  const returnTo =
    requested === '/' ||
    requested === '/search' ||
    requested.startsWith('/search?')
      ? requested
      : '/search'

  function chooseAccount(id: string | null) {
    preview.setAccount(id)
    const destination = new URL(returnTo, window.location.origin)
    destination.searchParams.delete('cursor')
    navigate(destination.pathname + destination.search)
  }

  return (
    <div className="preview-account-page">
      <p className="discovery-eyebrow">
        Preview controls · no real authentication
      </p>
      <h1>
        {params.get('intent') === 'create'
          ? 'Try a sample Library.'
          : 'Explore as a sample visitor.'}
      </h1>
      <p>
        Accounts and registration aren’t connected yet. These sample identities
        let you explore how discovery changes with access. No personal
        information is collected.
      </p>
      <section
        aria-labelledby="sample-accounts-heading"
        className="preview-account-section"
      >
        <h2 id="sample-accounts-heading">Choose a sample identity</h2>
        <p>
          Current visitor:{' '}
          {session.account?.name ?? 'Anonymous · public content only'}.
        </p>
        <div className="preview-account-accounts">
          <Button variant="outline" onClick={() => chooseAccount(null)}>
            Continue anonymously
          </Button>
          {preview.accounts.map((account) => (
            <Button
              key={account.id}
              variant="outline"
              onClick={() => chooseAccount(account.id)}
            >
              Continue as {account.id === 'maya' ? 'Maya' : 'Alex'}
            </Button>
          ))}
        </div>
        <p className="discovery-search-help">
          Maya can access her private Folio. Alex can access Studio’s private
          work and an editorial draft. Both can explore all public content.
        </p>
      </section>
      <section
        aria-labelledby="sample-scenario-heading"
        className="preview-account-section"
      >
        <h2 id="sample-scenario-heading">Review a search state</h2>
        <label htmlFor="mock-scenario">Response scenario</label>
        <select
          id="mock-scenario"
          value={preview.getScenario()}
          onChange={(event) =>
            preview.setScenario(event.target.value as MockScenario)
          }
        >
          {mockScenarios.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
        <p className="discovery-search-help">
          {
            mockScenarios.find(
              (scenario) => scenario.id === preview.getScenario(),
            )?.description
          }
        </p>
        <Link className="discovery-link-button" to={returnTo}>
          Return to discovery →
        </Link>
      </section>
    </div>
  )
}
