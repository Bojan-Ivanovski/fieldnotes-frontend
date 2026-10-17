import { ApplicationShell } from 'fieldnotes-ui'
import { Outlet } from 'react-router'
import { WorkspaceHeader } from './WorkspaceHeader/WorkspaceHeader.tsx'
import { WorkspaceSidebar } from './WorkspaceSidebar/WorkspaceSidebar.tsx'

export function WorkspaceLayout() {
  return (
    <ApplicationShell
      sidebar={<WorkspaceSidebar />}
      header={<WorkspaceHeader />}
      mainId="main-content"
    >
      <Outlet />
    </ApplicationShell>
  )
}
