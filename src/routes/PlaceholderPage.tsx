import { Card, Heading, Text } from 'fieldnotes-ui'

interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="app-page">
      <Heading>{title}</Heading>
      <Card>
        <Text as="p" tone="muted">This section is ready for notes and app features.</Text>
      </Card>
    </div>
  )
}
