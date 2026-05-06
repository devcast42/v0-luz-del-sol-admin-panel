import type { ModuleKey, Role } from "./types"

/**
 * Mapa de permisos por rol.
 * Cambiar aquí define a qué módulos accede cada rol en el sidebar y rutas.
 */
export const ROLE_MODULES: Record<Role, ModuleKey[]> = {
  super_admin: [
    "dashboard",
    "clientes",
    "conversaciones",
    "agenda",
    "ingresos",
    "egresos",
    "reportes",
    "usuarios",
  ],
  admin: [
    "dashboard",
    "clientes",
    "conversaciones",
    "agenda",
    "ingresos",
    "egresos",
    "reportes",
    "usuarios",
  ],
  contador: ["ingresos", "egresos", "reportes"],
}

/** Roles que un rol determinado tiene permitido crear desde Gestión de Usuarios. */
export const CREATABLE_ROLES: Record<Role, Role[]> = {
  super_admin: ["admin", "contador"],
  admin: ["contador"],
  contador: [],
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Administrador",
  contador: "Contador",
}

export function canAccess(role: Role, module: ModuleKey): boolean {
  return ROLE_MODULES[role].includes(module)
}

export function canManageUsers(role: Role): boolean {
  return role === "super_admin" || role === "admin"
}
