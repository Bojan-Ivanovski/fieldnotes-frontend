import './AuthLayout.css'
import { Link, Outlet, useLocation } from 'react-router'
import { useEffect, useRef } from 'react'
export function AuthLayout() {
  const { pathname } = useLocation()
  const main = useRef<HTMLElement>(null)
  useEffect(() => {
    main.current?.focus()
    window.scrollTo(0, 0)
  }, [pathname])
  return (
    <div className="auth-layout">
      <aside className="auth-atlas">
        <Link to="/" className="auth-brand">
          f. <span>Foltivo</span>
        </Link>
        <div className="auth-atlas-copy">
          <p>A LITTLE ROOM TO GROW</p>
          <h2>
            A home for
            <br />
            your thoughts.
          </h2>
          <p>
            Your own Library. Your own pace.
            <br />A place for whatever comes next.
          </p>
          <div className="auth-orbits" aria-hidden="true">
            <span>f.</span>
          </div>
        </div>
        <Link to="/search">Explore public Books & Folios ↗</Link>
      </aside>
      <main ref={main} tabIndex={-1} className="auth-main">
        <Link className="auth-mobile-brand" to="/">
          Foltivo
        </Link>
        <Outlet />
        <footer>
          <Link to="/">Back to Foltivo</Link>
          <span>Your personal Library needs no organization.</span>
        </footer>
      </main>
    </div>
  )
}
