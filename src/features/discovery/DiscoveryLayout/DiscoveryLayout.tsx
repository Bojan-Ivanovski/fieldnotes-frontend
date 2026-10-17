import './DiscoveryLayout.css'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { Button } from 'fieldnotes-ui'
import { useEffect, useRef } from 'react'
import { DiscoveryProvider } from '../DiscoveryProvider.tsx'
import { useDiscovery } from '../context.ts'

function DiscoveryShell() {
  const { session, preview } = useDiscovery()
  const location = useLocation()
  const previousPath = useRef(location.pathname)
  const accountLink = `/preview/account?returnTo=${encodeURIComponent(location.pathname + location.search)}`

  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView()
    } else if (previousPath.current !== location.pathname) {
      document.getElementById('discovery-main')?.focus()
      window.scrollTo(0, 0)
    }
    previousPath.current = location.pathname
  }, [location.pathname, location.hash])

  return (
    <div className="discovery">
      <a className="discovery-skip" href="#discovery-main">Skip to content</a>
      <div className="discovery-preview-banner">
        <span className="discovery-preview-dot" aria-hidden="true" />
        <strong>Foltivo preview</strong>
        <span>Sample content & accounts. Changes aren’t saved.</span>
        <Link to={accountLink}>Preview controls <span aria-hidden="true">↗</span></Link>
      </div>
      <header className="discovery-header">
        <Link to="/" className="discovery-brand" aria-label="Foltivo home">
          <span className="discovery-brand-mark" aria-hidden="true">f.</span>
          <span>Foltivo</span>
        </Link>
        <nav aria-label="Discovery" className="discovery-navigation">
          <NavLink to="/search">Explore</NavLink>
          <Link to="/#how-it-works">How it works</Link>
        </nav>
        <div className="discovery-account-links">
          {session.account ? (
            <><Link className="discovery-link-button" to={accountLink}>Sample account: {session.account.id}</Link><Button variant="ghost" size="sm" onClick={() => preview.setAccount(null)}>Sign out of preview</Button></>
          ) : (
            <>
              <Link to={`${accountLink}&intent=sign-in`}>Sign in</Link>
              <Link className="discovery-link-button" to={`${accountLink}&intent=create`}>Create an account <span aria-hidden="true">↗</span></Link>
            </>
          )}
        </div>
      </header>
      <main id="discovery-main" className="discovery-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="discovery-footer">
        <Link to="/" className="discovery-brand">Foltivo<span aria-hidden="true">.</span></Link>
        <p>A home for your thoughts. A little room to grow.</p>
        <Link to="/search">Explore Books & Folios <span aria-hidden="true">↗</span></Link>
      </footer>
    </div>
  )
}

export function DiscoveryLayout() {
  return <DiscoveryProvider><DiscoveryShell /></DiscoveryProvider>
}
