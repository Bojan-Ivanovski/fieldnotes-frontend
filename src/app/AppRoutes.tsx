import { Route, Routes } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout.tsx'
import { FavoritesPage } from '../routes/FavoritesPage.tsx'
import { HomePage } from '../routes/HomePage/HomePage.tsx'
import { NewNotePage } from '../routes/NewNotePage.tsx'
import { NotesPage } from '../routes/NotesPage.tsx'
import { NotFoundPage } from '../routes/NotFoundPage.tsx'
import { SettingsPage } from '../routes/SettingsPage.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/new" element={<NewNotePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
