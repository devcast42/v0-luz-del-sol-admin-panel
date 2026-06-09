"use client"

import { useState } from "react"
import { Plus, MoreVertical, Calendar, User as UserIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

export function TareasKanban({ initialTasks, usuarios, clientes, currentUser, isAdmin }: any) {
  const [tasks, setTasks] = useState(initialTasks)
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assignedTo, setAssignedTo] = useState(currentUser)
  const [clientId, setClientId] = useState("none")
  const [dueDate, setDueDate] = useState("")
  const [status, setStatus] = useState("TODO")

  const supabase = createClient()
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const payload: any = {
      title,
      description,
      status,
      assigned_to: assignedTo,
    }
    
    if (clientId !== "none") payload.client_id = clientId
    if (dueDate) payload.due_date = new Date(dueDate).toISOString()

    const { error } = await supabase.from('tasks').insert([payload])
    
    setIsSubmitting(false)
    if (error) {
      alert("Error: " + error.message)
    } else {
      setIsOpen(false)
      setTitle("")
      setDescription("")
      setDueDate("")
      setClientId("none")
      router.refresh()
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    if (error) alert("Error al actualizar tarea")
    else router.refresh()
  }

  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (!draggedTaskId) return

    // Optimistic UI update
    setTasks((prevTasks: any) => 
      prevTasks.map((t: any) => t.id === draggedTaskId ? { ...t, status: newStatus } : t)
    )

    await updateTaskStatus(draggedTaskId, newStatus)
    setDraggedTaskId(null)
  }

  const columns = [
    { id: "TODO", title: "Por Hacer", color: "bg-muted" },
    { id: "IN_PROGRESS", title: "En Progreso", color: "bg-brand-50 border-brand-200" },
    { id: "DONE", title: "Completado", color: "bg-success/10 border-success/30" },
  ]

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">Tablero de Tareas</h2>
          <p className="text-sm text-muted-foreground">Gestiona tus seguimientos y tareas pendientes.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="bg-brand-500 text-white hover:bg-brand-600">
          <Plus className="h-4 w-4 mr-2" /> Nueva Tarea
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[500px]">
        {columns.map(col => (
          <div 
            key={col.id} 
            className={`rounded-xl border ${col.color} p-4 flex flex-col gap-3 transition-colors`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              {col.title}
              <span className="bg-background px-2 py-0.5 rounded-full text-xs">
                {tasks.filter((t: any) => t.status === col.id).length}
              </span>
            </h3>
            
            <div className="space-y-3 flex-1 overflow-y-auto">
              {tasks.filter((t: any) => t.status === col.id).map((task: any) => (
                <Card 
                  key={task.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow border-border/60 ${draggedTaskId === task.id ? 'opacity-50 ring-2 ring-brand-500' : ''}`}
                >
                  <CardHeader className="p-3 pb-2 flex flex-row justify-between items-start space-y-0">
                    <CardTitle className="text-sm font-medium leading-tight">{task.title}</CardTitle>
                    <Select value={task.status} onValueChange={(val) => updateTaskStatus(task.id, val)}>
                      <SelectTrigger className="w-[30px] h-[24px] p-0 border-none bg-transparent hover:bg-muted justify-center" aria-label="Mover tarea">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TODO">Por Hacer</SelectItem>
                        <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                        <SelectItem value="DONE">Completado</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 space-y-2">
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {task.due_date && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.clients?.full_name && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                          <UserIcon className="h-3 w-3" />
                          {task.clients.full_name}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir Nueva Tarea</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label>Título de la Tarea</Label>
              <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Llamar al cliente..." />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalles de la tarea..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha de Vencimiento (Opcional)</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cliente Relacionado (Opcional)</Label>
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder="Ninguno" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    {clientes.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {isAdmin && (
              <div className="space-y-2">
                <Label>Asignar a</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {usuarios.map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-brand-500 text-white">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Guardar Tarea
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
