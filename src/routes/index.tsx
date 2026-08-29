import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/templates/DashboardLayout'
import { SettingsLayout } from '@/components/templates/SettingsLayout'
import { CompanyLayout } from '@/components/templates/CompanyLayout'
import { PageSkeleton } from '@/components/molecules/SkeletonTemplates'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { RoleGuard } from '@/routes/RoleGuard'
import { UserRole } from '@/types/enums'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { ForbiddenPage, NotFoundPage, ServerErrorPage } from '@/pages/errors'

const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const RequestListPage = lazy(() =>
  import('@/pages/requests/RequestListPage').then((m) => ({ default: m.RequestListPage })),
)
const NewRequestPage = lazy(() =>
  import('@/pages/requests/NewRequestPage').then((m) => ({ default: m.NewRequestPage })),
)
const RequestDetailPage = lazy(() =>
  import('@/pages/requests/RequestDetailPage').then((m) => ({ default: m.RequestDetailPage })),
)
const EditRequestPage = lazy(() =>
  import('@/pages/requests/EditRequestPage').then((m) => ({ default: m.EditRequestPage })),
)
const ProfilePage = lazy(() =>
  import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const FilesPage = lazy(() =>
  import('@/pages/files/FilesPage').then((m) => ({ default: m.FilesPage })),
)
const NotificationsPage = lazy(() =>
  import('@/pages/notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
)
const UserManagementPage = lazy(() =>
  import('@/pages/users/UserManagementPage').then((m) => ({ default: m.UserManagementPage })),
)
const UserDetailPage = lazy(() =>
  import('@/pages/users/UserDetailPage').then((m) => ({ default: m.UserDetailPage })),
)
const ApprovalsPage = lazy(() =>
  import('@/pages/approvals/ApprovalsPage').then((m) => ({ default: m.ApprovalsPage })),
)
const ReportsPage = lazy(() =>
  import('@/pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })),
)
const SettingsGeneralPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsGeneralPage })),
)
const SettingsNotificationsPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsNotificationsPage })),
)
const SettingsSecurityPage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsSecurityPage })),
)
const SettingsAppearancePage = lazy(() =>
  import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsAppearancePage })),
)
const CompanyInfoPage = lazy(() =>
  import('@/pages/company/CompanyPages').then((m) => ({ default: m.CompanyInfoPage })),
)
const CompanySummaryPage = lazy(() =>
  import('@/pages/company/CompanyPages').then((m) => ({ default: m.CompanySummaryPage })),
)
const CompanyMembershipPage = lazy(() =>
  import('@/pages/company/CompanyPages').then((m) => ({ default: m.CompanyMembershipPage })),
)

function Fallback() {
  return <PageSkeleton />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/500" element={<ServerErrorPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="requests" element={<RequestListPage />} />
              <Route path="requests/new" element={<NewRequestPage />} />
              <Route path="requests/:id" element={<RequestDetailPage />} />
              <Route path="requests/:id/edit" element={<EditRequestPage />} />
              <Route path="files" element={<FilesPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<ProfilePage />} />

              <Route element={<RoleGuard roles={[UserRole.ADMIN]} />}>
                <Route path="users" element={<UserManagementPage />} />
                <Route path="users/:id" element={<UserDetailPage />} />
                <Route path="approvals" element={<ApprovalsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="company" element={<CompanyLayout />}>
                  <Route index element={<CompanyInfoPage />} />
                  <Route path="summary" element={<CompanySummaryPage />} />
                  <Route path="membership" element={<CompanyMembershipPage />} />
                </Route>
              </Route>

              <Route path="settings" element={<SettingsLayout />}>
                <Route index element={<SettingsGeneralPage />} />
                <Route path="notifications" element={<SettingsNotificationsPage />} />
                <Route path="security" element={<SettingsSecurityPage />} />
                <Route path="appearance" element={<SettingsAppearancePage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
