// Arquivo interno: exporta apenas o createContext.
// Separado do Provider para satisfazer a regra fast-refresh do ESLint.
// Não importe este arquivo diretamente fora de AuthContext.tsx e useAuth.ts.

import { createContext } from 'react'
import type { AuthContextValue } from '@/types/auth'

export const AuthContext = createContext<AuthContextValue | null>(null)
