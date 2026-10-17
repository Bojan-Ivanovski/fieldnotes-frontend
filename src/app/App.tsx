import 'fieldnotes-ui/styles.css'
import { ThemeProvider } from 'fieldnotes-ui'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from '../modules/auth/providers/AuthProvider/AuthProvider.tsx'
import { AppRoutes } from './router/AppRoutes.tsx'
import { RouteMetadata } from './router/RouteMetadata/RouteMetadata.tsx'

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
