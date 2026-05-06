import { LoginForm } from "@/components/login-form"

export const metadata = {
  title: "Iniciar sesión — Luz del Sol",
}

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-10">
      {/* Fondo decorativo celeste */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60rem 40rem at 100% 0%, var(--brand-100), transparent 60%), radial-gradient(40rem 30rem at 0% 100%, var(--brand-50), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        style={{
          background:
            "radial-gradient(60rem 40rem at 100% 0%, rgba(56,189,248,0.08), transparent 60%), radial-gradient(40rem 30rem at 0% 100%, rgba(14,165,233,0.06), transparent 60%)",
        }}
      />
      <LoginForm />
    </main>
  )
}
