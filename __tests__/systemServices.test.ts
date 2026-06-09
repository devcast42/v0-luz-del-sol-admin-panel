import { 
  createClientLead, 
  createEgreso, 
  createTask, 
  closeCashRegister, 
  createAppointment, 
  processRecurringExpenses 
} from '../lib/services/systemServices'

// MOCK de Supabase
const createMockSupabase = (mockData: any, mockError: any) => {
  return {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: mockData, error: mockError }),
  } as any
}

const createMockSupabaseArray = (mockData: any[], mockError: any) => {
  return {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lte: jest.fn().mockResolvedValue({ data: mockData, error: mockError }),
    insert: jest.fn().mockResolvedValue({ error: null })
  } as any
}

describe('🧪 PRUEBAS UNITARIAS VIOLENTAS (EXTREMAS) DEL SISTEMA', () => {

  describe('1. createClientLead', () => {
    const mockDb = createMockSupabase({ id: 'uuid-1', phone: '987654321' }, null)

    it('OK: Debe crear un lead exitosamente', async () => {
      const result = await createClientLead(mockDb, { full_name: 'Juan', email: 'juan@test.com', phone: '987654321' })
      expect(result.id).toBe('uuid-1')
    })

    it('VIOLENTO: Rechaza payload con inyección XSS en el nombre', async () => {
      await expect(createClientLead(mockDb, { full_name: '<script>alert("hack")</script>', email: 'x@x.com', phone: '123' }))
        .rejects.toThrow("XSS detected")
    })

    it('VIOLENTO: Rechaza nombres exageradamente largos (>255 chars)', async () => {
      await expect(createClientLead(mockDb, { full_name: 'A'.repeat(300), email: 'x@x.com', phone: '123' }))
        .rejects.toThrow("Name too long")
    })

    it('VIOLENTO: Rechaza correos malformados (sin @)', async () => {
      await expect(createClientLead(mockDb, { full_name: 'Juan', email: 'correo-falso.com', phone: '123' }))
        .rejects.toThrow("Invalid email format")
    })
  })

  describe('2. createEgreso', () => {
    const mockDb = createMockSupabase({ id: 'egreso-1' }, null)

    it('VIOLENTO: Bloquea intentos de registrar montos tipo NaN o nulos', async () => {
      await expect(createEgreso(mockDb, { monto: NaN, moneda: 'PEN', descripcion: 'Dudoso' }))
        .rejects.toThrow("Monto invalido")
    })

    it('VIOLENTO: Bloquea montos astronómicos que puedan romper el tipo Numérico de BD (> 1 Billón)', async () => {
      await expect(createEgreso(mockDb, { monto: 999999999999, moneda: 'PEN', descripcion: 'Lujo extremo' }))
        .rejects.toThrow("Monto excede limite permitido")
    })

    it('VIOLENTO: Rechaza monedas no soportadas (ej. EUR, BTC) para evitar descuadre de KPIs', async () => {
      await expect(createEgreso(mockDb, { monto: 100, moneda: 'BTC', descripcion: 'Cripto' }))
        .rejects.toThrow("Moneda no soportada")
    })

    it('VIOLENTO: Rechaza descripciones vacías o hechas de puros espacios (evita transacciones fantasma)', async () => {
      await expect(createEgreso(mockDb, { monto: 100, moneda: 'PEN', descripcion: '     ' }))
        .rejects.toThrow("Descripción requerida")
    })
  })

  describe('3. createTask', () => {
    const mockDb = createMockSupabase({ id: 'task-1', status: 'TODO' }, null)

    it('VIOLENTO: Bloquea inyección de texto masivo en títulos de Kanban', async () => {
      await expect(createTask(mockDb, { title: 'T'.repeat(600), assigned_to: '123' }))
        .rejects.toThrow("Title length exceeds maximum allowed")
    })
  })

  describe('4. closeCashRegister', () => {
    const mockDb = createMockSupabase({ diferencia: 20 }, null)

    it('VIOLENTO: Impide cerrar caja con físico negativo (Físicamente imposible, indica manipulación DOM)', async () => {
      await expect(closeCashRegister(mockDb, { fecha: 'hoy', monto_apertura: 100, monto_cierre_fisico: -50, total_ingresos: 0, total_egresos: 0 }))
        .rejects.toThrow("Caja no puede tener fisico negativo")
    })

    it('VIOLENTO: Precisión matemática en coma flotante JavaScript', async () => {
      // 100 + 0.1 (Ingresos) - 0.2 (Egresos) = Matemáticamente 99.9. Pero en JS: 100 + 0.1 - 0.2 = 99.90000000000002
      // Si el físico es 99.9, la diferencia calculada cruda no sería 0. Debe dar 0 con redondeo adecuado.
      const mockDbMath = createMockSupabase({ diferencia: 0 }, null)
      await closeCashRegister(mockDbMath, { fecha: 'hoy', monto_apertura: 100, monto_cierre_fisico: 99.90, total_ingresos: 0.1, total_egresos: 0.2 })
      expect(mockDbMath.insert).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ diferencia: 0 })
      ]))
    })
    
    it('VIOLENTO: Alerta de fraude por diferencias masivas (Ej. Caja esperada en números rojos, físico declara miles positivos)', async () => {
      await expect(closeCashRegister(mockDb, { fecha: 'hoy', monto_apertura: 0, monto_cierre_fisico: 200000, total_ingresos: 0, total_egresos: 500 }))
        .rejects.toThrow("Diferencia masiva detectada, posible fraude")
    })
  })

  describe('5. createAppointment', () => {
    const mockDb = createMockSupabase({ id: 'apt-1' }, null)

    it('VIOLENTO: Bloquea formatos de fecha maliciosos o inválidos (Buffer Overflow intento)', async () => {
      await expect(createAppointment(mockDb, { client_id: 'client-1', appointment_date: 'FECHA-RANDOM-QUE-ROMPE-BD' }))
        .rejects.toThrow("Invalid date format")
    })

    it('VIOLENTO: Evita guardar citas en fechas ilógicas (Ej. Año 1990 o Año 3000)', async () => {
      await expect(createAppointment(mockDb, { client_id: 'client-1', appointment_date: '3000-01-01T10:00:00Z' }))
        .rejects.toThrow("Date out of logical range")
    })
  })

  describe('6. processRecurringExpenses', () => {
    it('VIOLENTO: Previene procesamiento masivo fuera de memoria (Safety Stop > 1000 items)', async () => {
      const arrayGigante = new Array(1050).fill({ monto: 100, moneda: 'PEN', next_due_date: '2023-10-01' })
      const mockDb = createMockSupabaseArray(arrayGigante, null)
      
      await expect(processRecurringExpenses(mockDb, '2023-10-05'))
        .rejects.toThrow("Safety stop: Excedido el limite de procesamiento en lote (1000)")
    })

    it('VIOLENTO: Rechaza strings maliciosos en la fecha de ejecución (Cron Payload manipulado)', async () => {
      const mockDb = createMockSupabaseArray([], null)
      await expect(processRecurringExpenses(mockDb, 'DROP TABLE EGRESOS;'))
        .rejects.toThrow("Invalid run date")
    })
  })
})
