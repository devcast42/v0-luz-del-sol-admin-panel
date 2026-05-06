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
import { MOCK_USERS } from "./mock-data"
import type { Role, User } from "./types"

const STORAGE_KEY = "lds_session"
const USERS_KEY = "lds_users"

interface AuthContextValue {
  user: User | null
  users: User[]
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  createUser: (data: Omit<User, "id" | "createdAt" | "active"> & { active?: boolean }) =>
    { ok: boolean; error?: string }
  updateUser: (id: string, patch: Partial<User>) => void
  deleteUser: (id: string) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>(MOCK_USERS)
  const [loading, setLoading] = useState(true)

  // Hidratar desde localStorage
  useEffect(() => {
    try {
      const rawUsers = typeof window !== "undefined" ? localStorage.getItem(USERS_KEY) : null
      if (rawUsers) {
        setUsers(JSON.parse(rawUsers))
      } else if (typeof window !== "undefined") {
        localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS))
      }

      const rawSession = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      if (rawSession) setUser(JSON.parse(rawSession))
    } catch (e) {
      console.log("[v0] Auth hydrate error:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  const persistUsers = useCallback((next: User[]) => {
    setUsers(next)
    if (typeof window !== "undefined") {
      localStorage.setItem(USERS_KEY, JSON.stringify(next))
    }
  }, [])

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password) => {
      await new Promise((r) => setTimeout(r, 400)) // simula latencia
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
      )
      if (!found) return { ok: false, error: "Credenciales incorrectas" }
      if (!found.active) return { ok: false, error: "Usuario inactivo. Contacta a un administrador." }
      setUser(found)
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(found))
      }
      return { ok: true }
    },
    [users],
  )

  const logout = useCallback(() => {
    setUser(null)
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY)
  }, [])

  const createUser = useCallback<AuthContextValue["createUser"]>(
    (data) => {
      if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { ok: false, error: "Ya existe un usuario con ese email." }
      }
      const newUser: User = {
        ...data,
        id: `u-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
        active: data.active ?? true,
      }
      persistUsers([...users, newUser])
      return { ok: true }
    },
    [users, persistUsers],
  )

  const updateUser = useCallback<AuthContextValue["updateUser"]>(
    (id, patch) => {
      const next = users.map((u) => (u.id === id ? { ...u, ...patch } : u))
      persistUsers(next)
      if (user?.id === id) {
        const updated = next.find((u) => u.id === id) ?? null
        setUser(updated)
        if (updated && typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        }
      }
    },
    [users, user, persistUsers],
  )

  const deleteUser = useCallback<AuthContextValue["deleteUser"]>(
    (id) => {
      persistUsers(users.filter((u) => u.id !== id))
    },
    [users, persistUsers],
  )

  const value = useMemo<AuthContextValue>(
    () => ({ user, users, loading, login, logout, createUser, updateUser, deleteUser }),
    [user, users, loading, login, logout, createUser, updateUser, deleteUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}

export type { Role }
