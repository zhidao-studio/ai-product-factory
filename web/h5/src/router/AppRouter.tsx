import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DotLoading } from 'antd-mobile'
import { useSession } from '@/stores/useSession'

const LoginPage = lazy(() => import('@/features/auth/LoginPage').then((module) => ({ default: module.LoginPage })))
const AuthenticatedHomePage = lazy(() => import('@/features/home/AuthenticatedHomePage').then((module) => ({
  default: module.AuthenticatedHomePage,
})))

function RouteFallback() {
  return <DotLoading color="primary" />
}

function InitialRoute() {
  const { status } = useSession()
  if (status === 'loading') return <DotLoading color="primary" />
  return <Navigate to={status === 'authenticated' ? '/home' : '/login'} replace />
}

function RequireSession({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  if (status === 'loading') return <DotLoading color="primary" />
  if (status !== 'authenticated') return <Navigate to="/login" replace />
  return children
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<InitialRoute />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/home"
            element={(
              <RequireSession>
                <AuthenticatedHomePage />
              </RequireSession>
            )}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
