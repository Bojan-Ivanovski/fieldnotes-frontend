import { Route, Routes } from 'react-router'
import { DiscoveryLayout } from '../features/discovery/DiscoveryLayout/DiscoveryLayout.tsx'
import { AppLayout } from '../components/layout/AppLayout.tsx'
import { FavoritesPage } from '../routes/FavoritesPage.tsx'
import { HomePage } from '../routes/HomePage/HomePage.tsx'
import { NewNotePage } from '../routes/NewNotePage.tsx'
import { NotesPage } from '../routes/NotesPage.tsx'
import { NotFoundPage } from '../routes/NotFoundPage.tsx'
import { AccountSettingsPage } from '../features/auth/AccountSettingsPage/AccountSettingsPage.tsx'
import { AuthLayout } from '../features/auth/AuthLayout/AuthLayout.tsx'
import { SignInPage } from '../features/auth/SignInPage/SignInPage.tsx'
import { SignUpPage } from '../features/auth/SignUpPage/SignUpPage.tsx'
import { VerifyEmailPage } from '../features/auth/VerifyEmailPage/VerifyEmailPage.tsx'
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage/ForgotPasswordPage.tsx'
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage/ResetPasswordPage.tsx'
import { MfaPage } from '../features/auth/MfaPage/MfaPage.tsx'
import { RequireAuth } from '../features/auth/RequireAuth.tsx'
import { SearchPage } from '../routes/SearchPage/SearchPage.tsx'
import { PreviewAccountPage } from '../routes/PreviewAccountPage/PreviewAccountPage.tsx'
import { ResourcePreviewPage } from '../routes/ResourcePreviewPage/ResourcePreviewPage.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/mfa" element={<MfaPage />} />
      </Route>
      <Route element={<DiscoveryLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/preview/account" element={<PreviewAccountPage />} />
        <Route path="/preview/:type/:id" element={<ResourcePreviewPage />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/new" element={<NewNotePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/settings" element={<AccountSettingsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
