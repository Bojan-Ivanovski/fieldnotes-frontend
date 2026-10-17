import 'fieldnotes-ui/styles.css'
import { ThemeProvider } from 'fieldnotes-ui'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from '../features/auth/AuthProvider.tsx'
import { AppRoutes } from './AppRoutes.tsx'
import { RouteMetadata } from './RouteMetadata.tsx'

export default function App() {
  return (
    <ThemeProvider defaultTheme="fieldnotes-dark">
      <BrowserRouter>
        <AuthProvider>
          <RouteMetadata />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}
