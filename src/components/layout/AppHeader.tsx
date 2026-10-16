import { Button, Text } from 'fieldnotes-ui'
import { useNavigate } from 'react-router'

export function AppHeader() {
  const navigate = useNavigate()

  return (
    <div className="app-header-content">
      <Text tone="muted">Your personal library</Text>
      <Button onClick={() => navigate('/notes/new')}>New note</Button>
    </div>
  )
}
