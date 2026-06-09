export type Role = "super_admin" | "admin" | "contador"

export interface User {
  id: string
  name: string
  email: string
  password: string // mock — en producción nunca se guarda en cliente
  role: Role
  avatarUrl?: string
  createdAt: string
  active: boolean
}

export type ModuleKey =
  | "dashboard"
  | "clientes"
  | "conversaciones"
  | "agenda"
  | "ingresos"
  | "egresos"
  | "reportes"
  | "usuarios"

export interface Cliente {
  id: string
  nombre: string
  email: string
  telefono: string
  tipo: "Comprador" | "Vendedor" | "Inversor" | "Inquilino"
  estado: "Activo" | "Prospecto" | "Cerrado"
  asesor: string
  createdAt: string
}

export interface Conversacion {
  id: string
  cliente: string
  canal: "WhatsApp" | "Email" | "Llamada" | "Presencial"
  ultimoMensaje: string
  fecha: string
  noLeidos: number
}

export interface EventoAgenda {
  id: string
  titulo: string
  cliente: string
  fecha: string
  hora: string
  tipo: "Visita" | "Reunión" | "Firma" | "Llamada"
  estado: "Pendiente" | "Confirmado" | "Cancelado"
}

export interface MovimientoFinanciero {
  id: string
  concepto: string
  categoria: string
  monto: number
  fecha: string
  metodo: "Transferencia" | "Efectivo" | "Tarjeta" | "Cheque"
  estado: "Pagado" | "Pendiente" | "Anulado"
  referencia?: string
}
