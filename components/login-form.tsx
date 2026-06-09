"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AlertCircle, Eye, EyeOff, LogIn } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ROLE_MODULES } from "@/lib/permissions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ThemeToggle } from "@/components/theme-toggle"

const MOCK_CREDENTIALS = [
  { role: "Super Admin",   email: "superadmin@luzdelsol.com", password: "super123" },
  { role: "Administrador", email: "admin@luzdelsol.com",      password: "admin123" },
  { role: "Contador",      email: "contador@luzdelsol.com",   password: "contador123" },
  { role: "Asesor",      email: "asesor@luzdelsol.com",   password: "asesor123" },
]

export function LoginForm() {
  const { login, user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState({ email: false, password: false })

  // Si ya hay sesión, redirige
  useEffect(() => {
    if (!authLoading && user) {
      const first = ROLE_MODULES[user.role][0] ?? "dashboard"
      router.replace(`/${first}`)
    }
  }, [user, authLoading, router])

  const emailError =
    touched.email && (!email ? "El email es obligatorio" : !/^\S+@\S+\.\S+$/.test(email) ? "Email inválido" : "")
  const passwordError =
    touched.password && (!password ? "La contraseña es obligatoria" : password.length < 4 ? "Mínimo 4 caracteres" : "")
  const formValid = !emailError && !passwordError && email && password

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!email || !password) return
    setSubmitting(true)
    setError(null)
    const res = await login(email, password)
    setSubmitting(false)
    if (!res.ok) {
      setError(res.error ?? "No se pudo iniciar sesión")
      return
    }
  }

  function fillCreds(c: { email: string; password: string }) {
    setEmail(c.email)
    setPassword(c.password)
    setError(null)
    setTouched({ email: false, password: false })
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex items-center justify-end">
        <ThemeToggle />
      </div>

      <Card className="border-border/60 shadow-xl shadow-brand-500/5">
        <CardContent className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:ring-brand-500/20">
              <Image
                src="/logo.png"
                alt="Luz del Sol"
                width={64}
                height={64}
                className="h-14 w-14 object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Luz del Sol
            </h1>
            <p className="text-sm text-muted-foreground">
              Panel administrativo · Compañía Inmobiliaria
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@luzdelsol.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                aria-invalid={!!emailError}
                className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {emailError && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" /> {emailError}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  aria-invalid={!!passwordError}
                  className={`pr-10 ${passwordError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="h-3.5 w-3.5" /> {passwordError}
                </p>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting || !formValid}
              className="w-full bg-brand-500 text-white hover:bg-brand-600"
            >
              {submitting ? (
                <>
                  <Spinner className="text-white" /> Ingresando...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" /> Iniciar sesión
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/40 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Credenciales de prueba (click para autocompletar):
            </p>
            <div className="flex flex-col gap-1.5">
              {MOCK_CREDENTIALS.map((c) => (
                <button
                  key={c.email}
                  type="button"
                  onClick={() => fillCreds(c)}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-500/10 dark:hover:text-brand-200"
                >
                  <span className="font-medium">{c.role}</span>
                  <span className="font-mono text-muted-foreground">{c.email}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Luz del Sol SAC · Todos los derechos reservados
      </p>
    </div>
  )
}
