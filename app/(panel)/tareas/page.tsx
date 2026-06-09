import { createClient } from "@/utils/supabase/server"
import { TareasKanban } from "@/components/tareas-kanban"

export default async function TareasPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch users (for assigning tasks) if Admin
  const { data: profile } = await supabase.from('usuarios').select('rol').eq('id', user.id).single()
  const isAdmin = profile?.rol === 'ADMIN' || profile?.rol === 'SUPER_ADMIN'

  let usuariosQuery = supabase.from('usuarios').select('id, nombre, rol')
  if (!isAdmin) {
    usuariosQuery = usuariosQuery.eq('id', user.id)
  }
  const { data: usuarios } = await usuariosQuery

  // Fetch clients for attaching to tasks
  const { data: clientes } = await supabase.from('clients').select('id, full_name')

  // Fetch tasks
  let tasksQuery = supabase
    .from('tasks')
    .select('*, clients(full_name), usuarios(nombre)')
    .order('created_at', { ascending: false })
  
  // Asesor only sees their own tasks
  if (!isAdmin) {
    tasksQuery = tasksQuery.eq('assigned_to', user.id)
  }
  
  const { data: tasks } = await tasksQuery

  return <TareasKanban 
    initialTasks={tasks || []} 
    usuarios={usuarios || []} 
    clientes={clientes || []}
    currentUser={user.id}
    isAdmin={isAdmin}
  />
}
