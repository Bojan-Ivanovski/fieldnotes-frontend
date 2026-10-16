import 'fieldnotes-ui/styles.css'
import { ThemeProvider } from 'fieldnotes-ui'
import { BrowserRouter } from 'react-router'
import { AppRoutes } from './AppRoutes.tsx'

export default function App() {
  return (
    <ThemeProvider defaultTheme="fieldnotes-dark">
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  )
}
