import './WorkspaceSidebar.css'
import { Heading, Sidebar, Text } from 'fieldnotes-ui'
import { NavLink } from 'react-router'

export function WorkspaceSidebar() {
  return (
    <Sidebar
      label="Main navigation"
      header={
        <div className="app-brand">
          <Heading>Foltivo</Heading>
          <Text as="p" tone="muted">
            Your quiet corner of the web
          </Text>
        </div>
      }
      footer={
        <Text as="p" tone="muted">
          A home for your thoughts.
        </Text>
      }
    >
      <nav className="app-nav" aria-label="Sections">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/notes">All notes</NavLink>
        <NavLink to="/favorites">Favorites</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>
    </Sidebar>
  )
}
