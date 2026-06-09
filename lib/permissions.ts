import type { ModuleKey, Role } from "./types"

/**
 * Mapa de permisos por rol.
 * Cambiar aquí define a qué módulos accede cada rol en el sidebar y rutas.
 */
export const ROLE_MODULES: Record<Role, ModuleKey[]> = {
  SUPER_ADMIN: [
    "dashboard",
    "clientes",
    "conversaciones",
    "agenda",
    "tareas",
    "ingresos",
    "egresos",
    "arqueo",
    "reportes",
    "usuarios",
    "terrenos",
  ],
  ADMIN: [
    "dashboard",
    "clientes",
    "conversaciones",
    "agenda",
    "tareas",
    "ingresos",
    "egresos",
    "arqueo",
    "reportes",
    "usuarios",
    "terrenos",
  ],
  CONTADOR: ["dashboard", "ingresos", "egresos", "arqueo", "reportes"],
  ASESOR: ["dashboard", "clientes", "conversaciones", "agenda", "tareas", "terrenos", "egresos"],
}

/** Roles que un rol determinado tiene permitido crear desde Gestión de Usuarios. */
export const CREATABLE_ROLES: Record<Role, Role[]> = {
  SUPER_ADMIN: ["ADMIN", "CONTADOR", "ASESOR"],
  ADMIN: ["CONTADOR", "ASESOR"],
  CONTADOR: [],
  ASESOR: [],
}

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  CONTADOR: "Contador",
  ASESOR: "Asesor",
}

export function canAccess(role: Role, module: ModuleKey): boolean {
  return ROLE_MODULES[role].includes(module)
}

export function canManageUsers(role: Role): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN"
}
