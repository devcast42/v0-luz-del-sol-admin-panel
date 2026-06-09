"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { createClient } from "@/utils/supabase/client"
import type { Role, User } from "./types"
import { useRouter } from "next/navigation"

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  const fetchUserProfile = useCallback(async (userId: string, email: string) => {
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", userId)
      .single()

    if (error || !data) {
      console.error("Error fetching user profile:", error)
      return null
    }

    return {
      id: data.id,
      name: data.nombre || "Usuario",
      email: data.email || email,
      role: data.rol as Role,
      avatar: "", 
      active: true,
      createdAt: data.created_at,
    }
  }, [supabase])

  useEffect(() => {
    let mounted = true

    async function getInitialSession() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user && mounted) {
        const profile = await fetchUserProfile(session.user.id, session.user.email || "")
        if (profile) {
          setUser(profile)
        }
      }
      if (mounted) setLoading(false)
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      if (session?.user) {
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
          const profile = await fetchUserProfile(session.user.id, session.user.email || "")
          setUser(profile)
        }
      } else {
        setUser(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserProfile])

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Mejorar los mensajes de error de Supabase para el usuario final
        if (error.message.includes("Invalid login credentials")) {
          return { ok: false, error: "Credenciales incorrectas" }
        }
        return { ok: false, error: error.message }
      }

      router.refresh()
      return { ok: true }
    },
    [supabase, router],
  )

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push("/login")
  }, [supabase, router])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}

export type { Role }
