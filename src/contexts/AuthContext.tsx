// Contexto de autenticação — exporta apenas o AuthProvider (componente).
// O hook useAuth está em src/hooks/useAuth.ts
// O tipo AuthContextValue está em src/types/auth.ts

import { useEffect, useState, useCallback, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { AuthContext } from '@/contexts/authContext.internal'
import type { Profile } from '@/types'

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchProfile = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            console.error('[Auth] Erro ao buscar perfil:', error.message)
            return null
        }
        return data as Profile
    }, [])

    const refreshProfile = useCallback(async () => {
        if (!user) return
        const updated = await fetchProfile(user.id)
        if (updated) setProfile(updated)
    }, [user, fetchProfile])

    useEffect(() => {
        // Timeout de segurança: se getSession() não responder em 15s, mostra o formulário de login
        const safetyTimeout = setTimeout(() => {
            setIsLoading(false)
            setSession(null)
            setUser(null)
            setProfile(null)
        }, 15000)

        supabase.auth.getSession().then(async ({ data: { session }, error }) => {
            clearTimeout(safetyTimeout)

            if (error) {
                // Refresh token expirado/inválido — limpa sessão corrompida do localStorage
                console.warn('[Auth] Sessão inválida, limpando:', error.message)
                await supabase.auth.signOut()
                setSession(null)
                setUser(null)
                setProfile(null)
                setIsLoading(false)
                return
            }

            setSession(session)
            setUser(session?.user ?? null)
            setIsLoading(false)
            if (session?.user) {
                const p = await fetchProfile(session.user.id)
                setProfile(p)
            }
        }).catch(async () => {
            clearTimeout(safetyTimeout)
            await supabase.auth.signOut()
            setSession(null)
            setUser(null)
            setProfile(null)
            setIsLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                clearTimeout(safetyTimeout)

                if (event === 'SIGNED_OUT') {
                    setSession(null)
                    setUser(null)
                    setProfile(null)
                    setIsLoading(false)
                    return
                }

                setSession(session)
                setUser(session?.user ?? null)
                setIsLoading(false)
                if (session?.user) {
                    const p = await fetchProfile(session.user.id)
                    setProfile(p)
                } else {
                    setProfile(null)
                }
            }
        )

        return () => { clearTimeout(safetyTimeout); subscription.unsubscribe() }
    }, [fetchProfile])

    const signIn = useCallback(async (email: string, password: string) => {
        setIsLoading(true)
        const normalizedEmail = email.trim().toLowerCase()
        const { error } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
        })
        setIsLoading(false)
        if (error) return { error: error.message }
        return { error: null }
    }, [])

    const signOut = useCallback(async () => {
        await supabase.auth.signOut()
        setProfile(null)
    }, [])

    return (
        <AuthContext.Provider
            value={{
                session,
                user,
                profile,
                role: profile?.role ?? null,
                isLoading,
                isAuthenticated: !!session,
                signIn,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
