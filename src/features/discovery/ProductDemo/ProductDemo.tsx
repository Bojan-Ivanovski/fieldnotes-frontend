import './ProductDemo.css'
import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { searchUrl } from '../search-state.ts'

const views = [
  {
    id: 'write',
    label: 'Write',
    number: '01',
    description: 'A small thought, with room to become something.',
  },
  {
    id: 'connect',
    label: 'Connect',
    number: '02',
    description: 'One Folio. Many places it belongs.',
  },
  {
    id: 'discover',
    label: 'Discover',
    number: '03',
    description: 'Your next idea might begin with someone else’s.',
  },
] as const

type DemoView = (typeof views)[number]['id']

export function ProductDemo() {
  const [active, setActive] = useState<DemoView>('write')
  const tabs = useRef<(HTMLButtonElement | null)[]>([])

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % views.length
    else if (event.key === 'ArrowLeft')
      next = (index + views.length - 1) % views.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = views.length - 1
    else return
    event.preventDefault()
    setActive(views[next].id)
    tabs.current[next]?.focus()
  }

  return (
    <section
      className="product-stage"
      aria-label="Interactive Foltivo illustration"
    >
      <div
        className="product-stage-tabs"
        role="tablist"
        aria-label="Explore the content model"
      >
        {views.map((view, index) => (
          <button
            key={view.id}
            id={`demo-tab-${view.id}`}
            role="tab"
            type="button"
            aria-selected={active === view.id}
            aria-controls={`demo-panel-${view.id}`}
            tabIndex={active === view.id ? 0 : -1}
            ref={(node) => {
              tabs.current[index] = node
            }}
            onClick={() => setActive(view.id)}
            onKeyDown={(event) => moveTab(event, index)}
          >
            <span>{view.number}</span>
            {view.label}
            <span className="stage-tab-arrow" aria-hidden="true">
              ↗
            </span>
          </button>
        ))}
      </div>
      <div className="product-window">
        <div className="product-window-bar">
          <span className="product-window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>foltivo / your little corner of the internet</span>
          <span className="product-demo-label">Interactive illustration</span>
        </div>
        {views.map((view) => (
          <div
            key={view.id}
            id={`demo-panel-${view.id}`}
            role="tabpanel"
            aria-labelledby={`demo-tab-${view.id}`}
            tabIndex={0}
            hidden={active !== view.id}
            className="product-demo-panel"
          >
            <aside
              className="product-demo-sidebar"
              aria-label="Illustrative Library structure"
            >
              <div className="product-demo-identity">
                <span>m.</span>
                <div>
                  Maya’s Library<small>User Library</small>
                </div>
              </div>
              <p>YOUR SPACE</p>
              <div
                className={
                  active === 'discover'
                    ? 'demo-sidebar-row is-selected'
                    : 'demo-sidebar-row'
                }
              >
                <span aria-hidden="true">⌕</span> Discover
              </div>
              <div
                className={
                  active === 'write'
                    ? 'demo-sidebar-row is-selected'
                    : 'demo-sidebar-row'
                }
              >
                <span aria-hidden="true">▱</span> Folios{' '}
                <span className="demo-row-end">↗</span>
              </div>
              <div className="demo-sidebar-subrow">
                ↳ A quieter research practice
              </div>
              <div className="demo-sidebar-subrow">
                ↳ Questions worth keeping
              </div>
              <div
                className={
                  active === 'connect'
                    ? 'demo-sidebar-row is-selected'
                    : 'demo-sidebar-row'
                }
              >
                <span aria-hidden="true">▤</span> Books{' '}
                <span className="demo-row-end">↗</span>
              </div>
              <div className="demo-sidebar-subrow">
                ↳ The curiosity collection
              </div>
              <div className="demo-sidebar-note">
                <span aria-hidden="true">✳</span>
                <p>
                  Ideas grow better
                  <br />
                  with a little space.
                </p>
              </div>
            </aside>
            <div className="product-demo-content">
              <div className="product-demo-breadcrumb">
                {active === 'write'
                  ? 'Folios / A quieter research practice'
                  : active === 'connect'
                    ? 'Books / The curiosity collection'
                    : 'Discover / Beyond your Library'}
                <span>
                  {active === 'discover'
                    ? 'Public discovery'
                    : 'Illustrative content'}
                </span>
              </div>
              {view.id === 'write' && (
                <div className="demo-document">
                  <p className="demo-document-overline">
                    <span aria-hidden="true">▱</span> FOLIO / A QUIETER RESEARCH
                    PRACTICE
                  </p>
                  <h2>
                    Good questions
                    <br />
                    lead somewhere.
                  </h2>
                  <p>
                    Start with what you notice. Keep the things that make you
                    pause.
                    <br className="demo-desktop-break" /> Let the connections
                    reveal themselves.
                  </p>
                  <div className="demo-quote">
                    <span aria-hidden="true">“</span>
                    <p>
                      The beginning of an idea is often
                      <br />
                      just a better question.
                    </p>
                  </div>
                  <div className="demo-document-items">
                    <span>
                      <i aria-hidden="true">≡</i> A question to come back to{' '}
                      <small>Document</small>
                    </span>
                    <span>
                      <i aria-hidden="true">⌑</i> Observations & loose threads{' '}
                      <small>Directory</small>
                    </span>
                  </div>
                  <Link
                    to="/preview/folio/research-practice"
                    className="demo-inline-link"
                  >
                    Open a sample Folio <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              )}
              {view.id === 'connect' && (
                <div className="demo-connections">
                  <p className="demo-document-overline">
                    BOOKS / OPTIONAL COLLECTIONS
                  </p>
                  <h2>
                    One idea.
                    <br />
                    More than one home.
                  </h2>
                  <p>
                    Books reference Folios. Your content stays connected,
                    without making copies or changing who can access it.
                  </p>
                  <div
                    className="demo-reference-map"
                    aria-label="Two Books reference the same Folio"
                  >
                    <div className="demo-map-book">
                      <span>▤</span>The curiosity
                      <br />
                      collection<small>BOOK</small>
                    </div>
                    <div className="demo-map-lines" aria-hidden="true">
                      <i />
                      <i />
                    </div>
                    <div className="demo-map-folio">
                      <span>f.</span>A quieter
                      <br />
                      research practice<small>ONE FOLIO</small>
                    </div>
                    <div
                      className="demo-map-lines demo-map-lines-right"
                      aria-hidden="true"
                    >
                      <i />
                      <i />
                    </div>
                    <div className="demo-map-book">
                      <span>▤</span>A writing
                      <br />
                      companion<small>BOOK</small>
                    </div>
                  </div>
                  <Link
                    to="/preview/book/field-guide"
                    className="demo-inline-link"
                  >
                    Explore a sample Book <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              )}
              {view.id === 'discover' && (
                <div className="demo-discover">
                  <p className="demo-document-overline">
                    DISCOVERY / FOLLOW YOUR CURIOSITY
                  </p>
                  <h2>
                    There’s a whole
                    <br />
                    world beyond your notes.
                  </h2>
                  <p>
                    Explore public Books and Folios across personal and
                    organizational Libraries. No account required.
                  </p>
                  <div className="demo-discovery-rows">
                    <Link to={searchUrl('research')}>
                      <span className="demo-discovery-symbol">↗</span>
                      <span>
                        Research & observation
                        <small>Find a new way of looking.</small>
                      </span>
                      <span aria-hidden="true">→</span>
                    </Link>
                    <Link to={searchUrl('writing')}>
                      <span className="demo-discovery-symbol">✳</span>
                      <span>
                        Writing & unfinished ideas
                        <small>Find your next starting point.</small>
                      </span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="product-stage-caption">
        <span className="stage-caption-line" />
        <p>{views.find((view) => view.id === active)?.description}</p>
        <span className="stage-caption-line" />
      </div>
    </section>
  )
}
