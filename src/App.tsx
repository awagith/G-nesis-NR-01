import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

import { LoginPage } from '@/pages/LoginPage'
import { DashboardRouter } from '@/pages/DashboardRouter'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'

import { env } from '@/lib/env'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard/genesis/*"
              element={
                <ProtectedRoute allowedRoles={['genesis']}>
                  <div className="p-8 text-gray-500">Dashboard Genesis — Fase 4</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/client/*"
              element={
                <ProtectedRoute allowedRoles={['client_executive']}>
                  <div className="p-8 text-gray-500">Dashboard Cliente — Fase 4</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/collaborator/*"
              element={
                <ProtectedRoute allowedRoles={['collaborator']}>
                  <div className="p-8 text-gray-500">Dashboard Colaborador — Fase 4</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/professional/*"
              element={
                <ProtectedRoute allowedRoles={['professional']}>
                  <div className="p-8 text-gray-500">Dashboard Profissional — Fase 4</div>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>

      {env.isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
