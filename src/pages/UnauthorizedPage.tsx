import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function UnauthorizedPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Acesso não autorizado</h1>
      <p className="text-gray-500">
        Você não tem permissão para acessar esta página.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Voltar
        </button>
        <button
          onClick={signOut}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Sair
        </button>
      </div>
    </div>
  )
}
