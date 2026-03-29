import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { queryClient } from '@/lib/queryClient'

import { DashboardRouter } from '@/pages/DashboardRouter'
import { LoginPage } from '@/pages/LoginPage'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'
import { GenesisOverview } from '@/pages/genesis/GenesisOverview'

import { env } from '@/lib/env'

function GenesisDashboardPlaceholder() {
  return <div className="text-gray-500">Em breve</div>
}

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

            {/* Genesis admin routes */}
            <Route
              path="/dashboard/genesis"
              element={
                <ProtectedRoute allowedRoles={['genesis']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<GenesisOverview />} />
              <Route path="organizations" element={<GenesisDashboardPlaceholder />} />
              <Route path="users" element={<GenesisDashboardPlaceholder />} />
              <Route path="diagnosis" element={<GenesisDashboardPlaceholder />} />
              <Route path="action-plans" element={<GenesisDashboardPlaceholder />} />
              <Route path="crm" element={<GenesisDashboardPlaceholder />} />
              <Route path="finance" element={<GenesisDashboardPlaceholder />} />
              <Route path="audit" element={<GenesisDashboardPlaceholder />} />
            </Route>

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
