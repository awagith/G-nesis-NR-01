import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'

export function DashboardLayout() {
  const { role } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!role) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        role={role}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area — offset by sidebar width on desktop */}
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
