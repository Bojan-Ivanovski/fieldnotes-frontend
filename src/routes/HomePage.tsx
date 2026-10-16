import { Card, Heading, Text } from 'fieldnotes-ui'

export function HomePage() {
  return (
    <div className="app-page">
      <div>
        <Text tone="muted">Welcome back</Text>
        <Heading>Make room for a thought.</Heading>
      </div>
      <Card>
        <Heading>Your notes will live here</Heading>
        <Text as="p" tone="muted">
          Capture an idea, keep a useful link, or start a longer piece of writing.
        </Text>
      </Card>
    </div>
  )
}
