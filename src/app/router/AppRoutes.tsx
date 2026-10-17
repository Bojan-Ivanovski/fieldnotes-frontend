import { Route, Routes } from 'react-router'
import { DiscoveryLayout } from '../../modules/discovery/layout/DiscoveryLayout.tsx'
import { WorkspaceLayout } from '../../shared/layout/WorkspaceLayout/WorkspaceLayout.tsx'
import { FavoritesPage } from '../../modules/workspace/pages/FavoritesPage.tsx'
import { HomePage } from '../../modules/discovery/pages/HomePage/HomePage.tsx'
import { NewNotePage } from '../../modules/workspace/pages/NewNotePage.tsx'
import { NotesPage } from '../../modules/workspace/pages/NotesPage.tsx'
import { NotFoundPage } from '../../shared/pages/NotFoundPage.tsx'
import { AccountSettingsPage } from '../../modules/account/pages/AccountSettingsPage/AccountSettingsPage.tsx'
import { AuthLayout } from '../../modules/auth/layout/AuthLayout.tsx'
import { SignInPage } from '../../modules/auth/pages/SignInPage/SignInPage.tsx'
import { SignUpPage } from '../../modules/auth/pages/SignUpPage/SignUpPage.tsx'
import { VerifyEmailPage } from '../../modules/auth/pages/VerifyEmailPage/VerifyEmailPage.tsx'
import { ForgotPasswordPage } from '../../modules/auth/pages/ForgotPasswordPage/ForgotPasswordPage.tsx'
import { ResetPasswordPage } from '../../modules/auth/pages/ResetPasswordPage/ResetPasswordPage.tsx'
import { MfaPage } from '../../modules/auth/pages/MfaPage/MfaPage.tsx'
import { RequireAuth } from '../../modules/auth/components/RequireAuth.tsx'
import { SearchPage } from '../../modules/discovery/pages/SearchPage/SearchPage.tsx'
import { PreviewAccountPage } from '../../modules/discovery/pages/PreviewAccountPage/PreviewAccountPage.tsx'
import { ResourcePreviewPage } from '../../modules/discovery/pages/ResourcePreviewPage/ResourcePreviewPage.tsx'

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
      <Route element={<WorkspaceLayout />}>
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
