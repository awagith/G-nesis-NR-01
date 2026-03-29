import { useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const { signIn, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  if (isAuthenticated) return <Navigate to={from} replace />

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const { error } = await signIn(email, password)

    if (error) {
      setError('E-mail ou senha inválidos. Verifique suas credenciais.')
    }

    setIsPending(false)
  }

  if (isLoading) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo / Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Gênesis NR-01
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Acesse sua conta para continuar
          </p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm
                           placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1
                           focus:ring-indigo-500 disabled:opacity-50"
                placeholder="seu@email.com"
                disabled={isPending}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm
                           placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1
                           focus:ring-indigo-500 disabled:opacity-50"
                placeholder="••••••••"
                disabled={isPending}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm
                       font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline
                       focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
                       disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
