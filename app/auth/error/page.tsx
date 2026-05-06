import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md border-destructive/30">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">No se pudo autenticar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              El enlace expiró o no es válido. Volvé a iniciar sesión.
            </p>
          </div>
          <Button asChild className="bg-brand-500 text-white hover:bg-brand-600">
            <Link href="/login">Volver al login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
