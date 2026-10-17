export const mockScenarios = [
  { id: 'normal', name: 'Normal results', description: 'Public content plus resources accessible to the sample account.' },
  { id: 'slow', name: 'Slow connection', description: 'A two-second response to review loading and cancellation.' },
  { id: 'empty', name: 'No matches', description: 'A successful search with no results.' },
  { id: 'failure', name: 'Request failure', description: 'A failed search, with a retry action.' },
  { id: 'unavailable', name: 'Service unavailable', description: 'Discovery is unavailable; this is distinct from no matches.' },
] as const

export type MockScenario = typeof mockScenarios[number]['id']
