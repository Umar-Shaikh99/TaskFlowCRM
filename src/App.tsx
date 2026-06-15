import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store/store'
import { PublicLayout } from './layouts/PublicLayout'
import { DashboardLayout } from './layouts/DashboardLayout'
import { ProtectedRoute } from './routes/ProtectedRoute'
// import { LoginPage } from './pages/auth/LoginPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { UsersPage } from './pages/users/UsersPage'
import { TasksPage } from './pages/tasks/TasksPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'

const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'))
export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider defaultTheme="system" storageKey="taskflow-ui-theme">
          <Toaster />
          <BrowserRouter>
            <React.Suspense
              fallback={
                <div className="flex h-screen w-screen items-center justify-center bg-canvas">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
                </div>
              }>
              <Routes>
                {/* Redirect index to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Public Auth Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                </Route>

                {/* Protected Dashboard Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <UsersPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                {/* Fallback Catch-All */}
                <Route path="/not-found" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/not-found" replace />} />
              </Routes>
            </React.Suspense>
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  )
}

export default App
