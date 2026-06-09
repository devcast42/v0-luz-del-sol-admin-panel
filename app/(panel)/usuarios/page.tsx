"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Plus, ShieldAlert, Trash2, UserCog } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"
import { CREATABLE_ROLES, ROLE_LABELS, canManageUsers } from "@/lib/permissions"
import type { Role } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/utils/supabase/client"

export default function UsuariosPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadUsers() {
      const { data } = await supabase.from('usuarios').select('*').order('created_at', { ascending: false })
      if (data) {
        setUsers(data.map(u => ({
          id: u.id,
          name: u.nombre || 'Sin nombre',
          email: u.email,
          role: u.rol as Role,
          active: true,
          createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('es-PE') : 'N/A'
        })))
      }
    }
    loadUsers()
  }, [supabase])

  if (!user) return null

  if (!canManageUsers(user.role)) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="flex items-center gap-3 p-6">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <div>
            <p className="font-medium text-foreground">Sin acceso</p>
            <p className="text-sm text-muted-foreground">
              Tu rol no tiene permisos para gestionar usuarios.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const allowedRoles = CREATABLE_ROLES[user.role]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Gestión de Usuarios
          </h2>
          <p className="text-sm text-muted-foreground">
            {user.role === "SUPER_ADMIN"
              ? "Como Super Admin puedes crear Administradores y Contadores."
              : "Como Administrador puedes crear Contadores."}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-500 text-white hover:bg-brand-600">
              <Plus className="h-4 w-4" /> Nuevo usuario
            </Button>
          </DialogTrigger>
          <NuevoUsuarioDialog
            allowedRoles={allowedRoles}
            onClose={() => setOpen(false)}
            onCreate={(data) => {
              toast.error("Para crear usuarios de Auth se requiere una Edge Function (backend).")
              return false
            }}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Usuarios totales</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{users.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Activos</p>
            <p className="mt-2 text-2xl font-semibold text-success">
              {users.filter((u) => u.active).length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Inactivos</p>
            <p className="mt-2 text-2xl font-semibold text-muted-foreground">
              {users.filter((u) => !u.active).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Listado</CardTitle>
          <CardDescription>Personal con acceso al sistema</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const isSelf = u.id === user.id
                // Un admin no puede tocar a SUPER_ADMIN u otros admins
                const canEdit =
                  user.role === "SUPER_ADMIN"
                    ? !isSelf
                    : user.role === "ADMIN"
                      ? u.role === "CONTADOR"
                      : false
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">
                      {u.name}
                      {isSelf && (
                        <Badge variant="outline" className="ml-2 text-[10px]">tú</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          u.role === "SUPER_ADMIN"
                            ? "border-brand-300 bg-brand-100 text-brand-800"
                            : u.role === "ADMIN"
                              ? "border-brand-200 bg-brand-50 text-brand-700"
                              : "border-border bg-muted text-muted-foreground"
                        }
                      >
                        {ROLE_LABELS[u.role] || u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.createdAt}</TableCell>
                    <TableCell>
                      <Switch
                        checked={u.active}
                        disabled={!canEdit}
                        onCheckedChange={(v) => {
                          toast.error("Para desactivar usuarios en Auth se requiere una Edge Function.")
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!canEdit}
                        onClick={() => {
                          if (confirm(`¿Eliminar a ${u.name}?`)) {
                            toast.error("Para eliminar usuarios en Auth se requiere una Edge Function.")
                          }
                        }}
                        aria-label={`Eliminar ${u.name}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function NuevoUsuarioDialog({
  allowedRoles,
  onCreate,
  onClose,
}: {
  allowedRoles: Role[]
  onCreate: (data: { name: string; email: string; password: string; role: Role }) => boolean
  onClose: () => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>(allowedRoles[0] ?? "CONTADOR")
  const [touched, setTouched] = useState(false)

  const errors = {
    name: !name ? "Nombre obligatorio" : "",
    email: !email
      ? "Email obligatorio"
      : !/^\S+@\S+\.\S+$/.test(email)
        ? "Email inválido"
        : "",
    password: !password ? "Contraseña obligatoria" : password.length < 4 ? "Mínimo 4 caracteres" : "",
  }
  const valid = !errors.name && !errors.email && !errors.password

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!valid) return
    const ok = onCreate({ name, email, password, role })
    if (ok) {
      setName("")
      setEmail("")
      setPassword("")
      setTouched(false)
      onClose()
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-brand-500" /> Nuevo usuario
        </DialogTitle>
        <DialogDescription>
          Completa los datos. La contraseña se entregará al usuario para su primer acceso.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="u-name">Nombre completo</Label>
          <Input
            id="u-name"
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
          <Label htmlFor="u-email">Email</Label>
          <Input
            id="u-email"
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
          <Label htmlFor="u-pwd">Contraseña</Label>
          <Input
            id="u-pwd"
            type="text"
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
        <div className="space-y-1.5">
          <Label htmlFor="u-role">Rol</Label>
          <Select value={role} onValueChange={(v) => setRole(v as Role)}>
            <SelectTrigger id="u-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedRoles.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-brand-500 text-white hover:bg-brand-600">
            Crear usuario
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
