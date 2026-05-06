"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { CREATABLE_ROLES } from "@/lib/permissions"
import type { Role } from "@/lib/types"

type ActionResult = { ok: true } | { ok: false; error: string }

interface CreateUserInput {
  name: string
  email: string
  password: string
  role: Role
}

/**
 * Devuelve el rol del usuario actual leyendo su profile, o null si no hay sesión.
 */
async function getCurrentRole(): Promise<{ id: string; role: Role } | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (!profile) return null
  return { id: user.id, role: profile.role as Role }
}

/**
 * Crea un usuario en auth.users + dispara el trigger que crea el profile.
 * Solo super_admin/admin pueden crearlos, respetando CREATABLE_ROLES.
 *
 * Caso especial: si NO existe ningún super_admin todavía, se permite que
 * cualquier visitante cree el primer super_admin (bootstrap inicial).
 */
export async function createUserAction(input: CreateUserInput): Promise<ActionResult> {
  const admin = createAdminClient()

  const { count, error: countErr } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "super_admin")
  if (countErr) {
    return { ok: false, error: countErr.message }
  }
  const hasSuperAdmin = (count ?? 0) > 0

  if (!hasSuperAdmin) {
    if (input.role !== "super_admin") {
      return {
        ok: false,
        error: "El primer usuario del sistema debe ser un Super Admin.",
      }
    }
  } else {
    const current = await getCurrentRole()
    if (!current) return { ok: false, error: "No autenticado" }

    const allowed = CREATABLE_ROLES[current.role]
    if (!allowed.includes(input.role)) {
      return {
        ok: false,
        error: `Tu rol no puede crear usuarios con rol ${input.role}.`,
      }
    }
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: {
      full_name: input.name,
      role: input.role,
    },
  })
  if (error) {
    return { ok: false, error: error.message }
  }

  if (data.user) {
    await admin
      .from("profiles")
      .update({ full_name: input.name, role: input.role })
      .eq("id", data.user.id)
  }

  revalidatePath("/usuarios")
  return { ok: true }
}

export async function setUserActiveAction(
  userId: string,
  active: boolean,
): Promise<ActionResult> {
  const current = await getCurrentRole()
  if (!current) return { ok: false, error: "No autenticado" }
  if (current.role !== "super_admin" && current.role !== "admin") {
    return { ok: false, error: "Sin permisos" }
  }

  const admin = createAdminClient()

  if (current.role === "admin") {
    const { data: target } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()
    if (!target || target.role !== "contador") {
      return { ok: false, error: "Solo puedes gestionar Contadores." }
    }
  }

  const { error } = await admin
    .from("profiles")
    .update({ is_active: active })
    .eq("id", userId)
  if (error) return { ok: false, error: error.message }

  await admin.auth.admin.updateUserById(userId, {
    ban_duration: active ? "none" : "876000h",
  })

  revalidatePath("/usuarios")
  return { ok: true }
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  const current = await getCurrentRole()
  if (!current) return { ok: false, error: "No autenticado" }
  if (current.role !== "super_admin" && current.role !== "admin") {
    return { ok: false, error: "Sin permisos" }
  }
  if (userId === current.id) {
    return { ok: false, error: "No puedes eliminar tu propia cuenta." }
  }

  const admin = createAdminClient()

  if (current.role === "admin") {
    const { data: target } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()
    if (!target || target.role !== "contador") {
      return { ok: false, error: "Solo puedes eliminar Contadores." }
    }
  }

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { ok: false, error: error.message }

  revalidatePath("/usuarios")
  return { ok: true }
}

/**
 * Indica si el sistema todavía no tiene ningún super_admin.
 * Lo usa /setup para mostrar el wizard inicial.
 */
export async function hasSuperAdminAction(): Promise<boolean> {
  const admin = createAdminClient()
  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "super_admin")
  return (count ?? 0) > 0
}
