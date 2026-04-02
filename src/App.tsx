import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthProvider } from '@/contexts/AuthContext'
import { queryClient } from '@/lib/queryClient'
import { env } from '@/lib/env'

import { Home } from '@/pages/Home'
import { NotFound } from '@/pages/NotFound'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardRouter } from '@/pages/DashboardRouter'
import { UnauthorizedPage } from '@/pages/UnauthorizedPage'
import { GenesisOverview } from '@/pages/genesis/GenesisOverview'

function Placeholder({ label }: { label: string }) {
  return <div className="p-8 text-sm text-gray-400">{label} — em implementação</div>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Público */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Redireciona para dashboard por role */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />

            {/* Genesis */}
            <Route
              path="/dashboard/genesis"
              element={
                <ProtectedRoute allowedRoles={['genesis']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<GenesisOverview />} />
              <Route path="organizations" element={<Placeholder label="Organizações" />} />
              <Route path="users" element={<Placeholder label="Usuários" />} />
              <Route path="diagnosis" element={<Placeholder label="Diagnósticos" />} />
              <Route path="action-plans" element={<Placeholder label="Planos de Ação" />} />
              <Route path="crm" element={<Placeholder label="CRM" />} />
              <Route path="finance" element={<Placeholder label="Financeiro" />} />
              <Route path="audit" element={<Placeholder label="Auditoria" />} />
            </Route>

            {/* Cliente Executivo */}
            <Route
              path="/dashboard/client/*"
              element={
                <ProtectedRoute allowedRoles={['client_executive']}>
                  <Placeholder label="Dashboard Cliente" />
                </ProtectedRoute>
              }
            />

            {/* Colaborador */}
            <Route
              path="/dashboard/collaborator/*"
              element={
                <ProtectedRoute allowedRoles={['collaborator']}>
                  <Placeholder label="Dashboard Colaborador" />
                </ProtectedRoute>
              }
            />

            {/* Profissional */}
            <Route
              path="/dashboard/professional/*"
              element={
                <ProtectedRoute allowedRoles={['professional']}>
                  <Placeholder label="Dashboard Profissional" />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>

      {env.isDev && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
