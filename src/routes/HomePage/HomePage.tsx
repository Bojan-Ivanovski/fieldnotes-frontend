import './HomePage.css'
import { Link } from 'react-router'
import { SearchForm } from '../../features/discovery/SearchForm/SearchForm.tsx'
import { useDiscovery } from '../../features/discovery/context.ts'
import { IdeaAtlas } from '../../features/discovery/IdeaAtlas/IdeaAtlas.tsx'
import { ProductDemo } from '../../features/discovery/ProductDemo/ProductDemo.tsx'
import { searchUrl } from '../../features/discovery/search-state.ts'

export function HomePage() {
  const { session } = useDiscovery()
  return (
    <div className="foltivo-home">
      <section className="atlas-hero" aria-labelledby="home-heading">
        <IdeaAtlas />
        <div className="atlas-hero-content">
          <Link to="#how-it-works" className="atlas-announcement">
            <span className="atlas-announcement-spark" aria-hidden="true">
              ✳
            </span>
            A home for the endlessly curious<span aria-hidden="true">↗</span>
          </Link>
          <h1 id="home-heading">
            Think beyond
            <br />
            <span>the page.</span>
            <svg aria-hidden="true" viewBox="0 0 470 28">
              <path d="M8 19C100 2 315 0 460 13M70 25C200 10 360 10 423 20" />
            </svg>
          </h1>
          <p className="atlas-hero-description">
            A small note can open up a whole world.
            <br className="atlas-desktop-break" /> Give your ideas a place to
            grow, connect, and be discovered.
          </p>
          <div className="atlas-hero-search">
            <SearchForm />
            <p className="discovery-search-help">
              {session.account
                ? 'Public discoveries + private work accessible to your sample account.'
                : 'Explore public Books & Folios. No account needed.'}
            </p>
          </div>
          <div className="atlas-popular-threads">
            <span>FOLLOW A THREAD</span>
            <Link to={searchUrl('research')}>
              Research <span aria-hidden="true">↗</span>
            </Link>
            <Link to={searchUrl('writing')}>
              Writing <span aria-hidden="true">↗</span>
            </Link>
            <Link to={searchUrl('design')}>
              Design <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
        <div className="atlas-hero-bottom">
          <span>MADE FOR WANDERING MINDS</span>
          <span aria-hidden="true">↓</span>
          <span>BUILT FOR CONNECTED THINKING</span>
        </div>
      </section>
      <ProductDemo />
      <section
        className="atlas-manifesto"
        id="how-it-works"
        aria-labelledby="model-heading"
      >
        <div className="atlas-section-marker">
          <span aria-hidden="true">✳</span>
          <span>01 / MAKE SPACE</span>
          <span className="atlas-marker-rule" />
        </div>
        <div className="atlas-manifesto-heading">
          <h2 id="model-heading">
            Less scattered.
            <br />
            <span>More possibility.</span>
          </h2>
          <p>
            Some ideas need a quiet corner.
            <br />
            Others need a few good connections.
            <br />
            There’s room for both here.
          </p>
        </div>
        <div className="atlas-model-grid">
          <div className="atlas-model-intro">
            <span className="atlas-large-asterisk" aria-hidden="true">
              ✳
            </span>
            <h3>
              Your own little
              <br />
              corner of everything.
            </h3>
            <p>
              A User Library is yours from the start. No team, organization, or
              Book required. When it’s shared work, Organization Libraries bring
              it together.
            </p>
            <Link to="/sign-up">
              Create your Library <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div
            className="atlas-model-visual"
            aria-label="Illustrative Library containing Folios and optional Books"
          >
            <div className="atlas-model-library">
              <span className="atlas-model-library-avatar">m.</span>
              <div>
                Maya’s Library<small>USER LIBRARY / ILLUSTRATION</small>
              </div>
              <span aria-hidden="true">↗</span>
            </div>
            <div className="atlas-model-tree">
              <div className="atlas-model-tree-label">FOLIOS / YOUR WORK</div>
              <div className="atlas-model-tree-folio">
                <span>f.</span>A quieter research practice<i>Folio</i>
              </div>
              <div className="atlas-model-tree-folio">
                <span>f.</span>Questions worth keeping<i>Folio</i>
              </div>
              <div className="atlas-model-tree-label">
                BOOKS / OPTIONAL CONNECTIONS
              </div>
              <div className="atlas-model-tree-book">
                <span aria-hidden="true">▤</span>
                <div>
                  The curiosity collection
                  <small>References your Folios. Never copies them.</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        className="atlas-connections"
        aria-labelledby="connections-heading"
      >
        <div className="atlas-section-marker">
          <span aria-hidden="true">⌁</span>
          <span>02 / CONNECT THE DOTS</span>
          <span className="atlas-marker-rule" />
        </div>
        <div className="atlas-connections-body">
          <div>
            <p className="atlas-kicker">
              KNOWLEDGE DOESN’T GROW IN STRAIGHT LINES.
            </p>
            <h2 id="connections-heading">
              Neither should
              <br />
              <em>your thinking.</em>
            </h2>
            <p>
              A Folio is a living thread of knowledge. Give it Documents, add
              Directories when you need them, and gather related Folios into
              Books. One Folio can belong in many collections.
            </p>
            <p className="atlas-access-note">
              <span aria-hidden="true">◇</span> Connections organize your work.
              They never change its access.
            </p>
            <Link className="atlas-text-link" to="/preview/book/field-guide">
              See a sample Book <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div
            className="atlas-connection-art"
            aria-label="Two Books reference one Folio"
          >
            <svg viewBox="0 0 540 450" fill="none" aria-hidden="true">
              <circle
                cx="270"
                cy="225"
                r="175"
                stroke="currentColor"
                strokeDasharray="2 9"
              />
              <circle
                cx="270"
                cy="225"
                r="115"
                stroke="currentColor"
                opacity=".4"
              />
              <path
                d="M95 315Q190 110 270 225T450 125"
                stroke="#bbaaeb"
                strokeWidth="1.5"
              />
              <path
                d="M95 315Q210 360 270 225T450 125"
                stroke="#b5da95"
                strokeWidth="1.5"
              />
              <circle cx="95" cy="315" r="5" fill="#c5e8a6" />
              <circle cx="450" cy="125" r="5" fill="#c1aff4" />
            </svg>
            <div className="atlas-art-folio">
              <span>f.</span>
              <strong>One good idea.</strong>
              <small>ONE FOLIO · MANY CONNECTIONS</small>
            </div>
            <div className="atlas-art-book atlas-art-book-one">
              <span>▤</span>
              <strong>
                The research
                <br />
                collection
              </strong>
              <small>BOOK / REFERENCE</small>
            </div>
            <div className="atlas-art-book atlas-art-book-two">
              <span>▤</span>
              <strong>
                A writing
                <br />
                companion
              </strong>
              <small>BOOK / REFERENCE</small>
            </div>
            <span className="atlas-art-star" aria-hidden="true">
              ✳
            </span>
          </div>
        </div>
      </section>
      <section
        className="atlas-discover-section"
        aria-labelledby="discover-heading"
      >
        <div className="atlas-section-marker">
          <span aria-hidden="true">↗</span>
          <span>03 / KEEP EXPLORING</span>
          <span className="atlas-marker-rule" />
        </div>
        <div className="atlas-discover-heading">
          <h2 id="discover-heading">
            Curiosity is
            <br />
            <span>a good compass.</span>
          </h2>
          <div>
            <p>
              The next thing that changes how you think
              <br />
              might already be out there.
            </p>
            <Link className="atlas-text-link" to="/search">
              Explore Books & Folios <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
        <div className="atlas-topic-shelf">
          <Link
            to={searchUrl('research')}
            className="atlas-topic atlas-topic-research"
          >
            <span className="atlas-topic-index">01 / FOLLOW A QUESTION</span>
            <span className="atlas-topic-drawing" aria-hidden="true">
              <i />
              <i />
              <i />
              <b>?</b>
            </span>
            <span className="atlas-topic-bottom">
              <strong>
                Research &<br />
                observation
              </strong>
              <span aria-hidden="true">↗</span>
            </span>
          </Link>
          <Link
            to={searchUrl('writing')}
            className="atlas-topic atlas-topic-writing"
          >
            <span className="atlas-topic-index">02 / FIND YOUR WORDS</span>
            <span className="atlas-topic-drawing" aria-hidden="true">
              <i />
              <i />
              <i />
              <b>“</b>
            </span>
            <span className="atlas-topic-bottom">
              <strong>
                Writing &<br />
                unfinished ideas
              </strong>
              <span aria-hidden="true">↗</span>
            </span>
          </Link>
          <Link
            to={searchUrl('design')}
            className="atlas-topic atlas-topic-design"
          >
            <span className="atlas-topic-index">03 / SEE IT DIFFERENTLY</span>
            <span className="atlas-topic-drawing" aria-hidden="true">
              <i />
              <i />
              <i />
              <b>✳</b>
            </span>
            <span className="atlas-topic-bottom">
              <strong>
                Design &<br />
                possibility
              </strong>
              <span aria-hidden="true">↗</span>
            </span>
          </Link>
        </div>
        <p className="atlas-shelf-note">
          Suggested search paths through our sample content. Follow whatever
          catches your eye.
        </p>
      </section>
      <section className="atlas-finale" aria-labelledby="invitation-heading">
        <div className="atlas-finale-orbit" aria-hidden="true" />
        <span className="atlas-finale-star" aria-hidden="true">
          ✳
        </span>
        <p className="atlas-kicker">
          THERE’S A WHOLE WORLD IN THAT HEAD OF YOURS.
        </p>
        <h2 id="invitation-heading">
          Give it a place
          <br />
          to <em>begin.</em>
        </h2>
        <p>
          Your own Library. Your own pace.
          <br />A little space for whatever comes next.
        </p>
        <Link
          className="discovery-link-button discovery-link-button-primary"
          to="/sign-up"
        >
          Create your Library <span aria-hidden="true">↗</span>
        </Link>
        <Link className="atlas-finale-secondary" to="/search">
          Or just follow your curiosity →
        </Link>
      </section>
    </div>
  )
}
