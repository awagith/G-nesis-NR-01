// Validação de variáveis de ambiente obrigatórias.
// Lança erro claro no boot se alguma estiver ausente,
// evitando falhas silenciosas em runtime.

const required = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_APP_ENV',
] as const

for (const key of required) {
  if (!import.meta.env[key]) {
    throw new Error(
      `[env] Variável obrigatória ausente: ${key}\n` +
      `Verifique o arquivo .env.${import.meta.env.MODE}`
    )
  }
}

export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  appEnv: import.meta.env.VITE_APP_ENV as 'development' | 'staging' | 'production',
  appName: import.meta.env.VITE_APP_NAME as string ?? 'Gênesis NR-01',
  appUrl: import.meta.env.VITE_APP_URL as string ?? 'http://localhost:5173',
  isDev: import.meta.env.VITE_APP_ENV === 'development',
  isStaging: import.meta.env.VITE_APP_ENV === 'staging',
  isProd: import.meta.env.VITE_APP_ENV === 'production',
} as const
