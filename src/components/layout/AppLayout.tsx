import { ApplicationShell } from 'fieldnotes-ui'
import { Outlet } from 'react-router'
import { AppHeader } from './AppHeader/AppHeader.tsx'
import { AppSidebar } from './AppSidebar/AppSidebar.tsx'

export function AppLayout() {
  return (
    <ApplicationShell
      sidebar={<AppSidebar />}
      header={<AppHeader />}
      mainId="main-content"
    >
      <Outlet />
    </ApplicationShell>
  )
}
