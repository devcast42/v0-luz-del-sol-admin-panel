"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AlertCircle, ShieldCheck } from "lucide-react"
import { createUserAction } from "@/app/actions/users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { ThemeToggle } from "@/components/theme-toggle"

export function SetupForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const errors = {
    name: !name ? "Nombre obligatorio" : "",
    email: !email
      ? "Email obligatorio"
      : !/^\S+@\S+\.\S+$/.test(email)
        ? "Email inválido"
        : "",
    password: !password
      ? "Contraseña obligatoria"
      : password.length < 6
        ? "Mínimo 6 caracteres"
        : "",
  }
  const valid = !errors.name && !errors.email && !errors.password

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    setSubmitting(true)
    setError(null)
    const res = await createUserAction({
      name,
      email,
      password,
      role: "super_admin",
    })
    setSubmitting(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setDone(true)
    setTimeout(() => router.replace("/login"), 1500)
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
              />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Configuración inicial
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Creá el primer Super Admin del sistema. Esta pantalla solo está
              disponible mientras no exista ninguno.
            </p>
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-6 text-center">
              <ShieldCheck className="h-8 w-8 text-success" />
              <p className="font-medium text-foreground">Super Admin creado</p>
              <p className="text-sm text-muted-foreground">Redirigiendo al login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="s-name">Nombre completo</Label>
                <Input
                  id="s-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={touched && !!errors.name}
                  className={touched && errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {touched && errors.name && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-email">Email</Label>
                <Input
                  id="s-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={touched && !!errors.email}
                  className={touched && errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {touched && errors.email && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.email}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-pwd">Contraseña</Label>
                <Input
                  id="s-pwd"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={touched && !!errors.password}
                  className={touched && errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {touched && errors.password && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.password}
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
                disabled={submitting}
                className="w-full bg-brand-500 text-white hover:bg-brand-600"
              >
                {submitting ? (
                  <>
                    <Spinner className="text-white" /> Creando...
                  </>
                ) : (
                  "Crear Super Admin"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
