import type { UserRole } from '@/types'
import {
    Brain,
    Building2,
    ClipboardList,
    DollarSign,
    LayoutDashboard,
    ShieldCheck,
    Users,
    UserSearch,
    X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface SidebarProps {
  role: UserRole
  open: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
}

const genesisNav: NavItem[] = [
  { label: 'Visão Geral', to: '/dashboard/genesis', icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: 'Organizações', to: '/dashboard/genesis/organizations', icon: <Building2 className="h-5 w-5" /> },
  { label: 'Usuários', to: '/dashboard/genesis/users', icon: <Users className="h-5 w-5" /> },
  { label: 'Diagnósticos', to: '/dashboard/genesis/diagnosis', icon: <Brain className="h-5 w-5" /> },
  { label: 'Planos de Ação', to: '/dashboard/genesis/action-plans', icon: <ClipboardList className="h-5 w-5" /> },
  { label: 'CRM', to: '/dashboard/genesis/crm', icon: <UserSearch className="h-5 w-5" /> },
  { label: 'Financeiro', to: '/dashboard/genesis/finance', icon: <DollarSign className="h-5 w-5" /> },
  { label: 'Auditoria', to: '/dashboard/genesis/audit', icon: <ShieldCheck className="h-5 w-5" /> },
]

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case 'genesis':
      return genesisNav
    default:
      return []
  }
}

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
const linkActive = 'bg-indigo-50 text-indigo-700'
const linkInactive = 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'

export function Sidebar({ role, open, onClose }: SidebarProps) {
  const items = getNavItems(role)

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/dashboard/genesis'}
          onClick={onClose}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? linkActive : linkInactive}`
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <span className="text-lg font-bold text-indigo-600">Gênesis</span>
          <span className="text-xs text-gray-400">NR-01</span>
        </div>
        {nav}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/30"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
              <span className="text-lg font-bold text-indigo-600">Gênesis</span>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}
    </>
  )
}
