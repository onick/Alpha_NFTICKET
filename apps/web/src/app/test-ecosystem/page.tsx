'use client'

import { useState, useEffect } from 'react'
import { Button } from '@nfticket/ui'
import { getEcosystemManager, User, Event, Purchase } from '@/lib/ecosystem-integration'
import { 
  User as UserIcon, 
  Building,
  Calendar,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Trash2,
  Play,
  Users,
  QrCode,
  BarChart3,
  RefreshCw
} from 'lucide-react'

interface TestStep {
  id: string
  title: string
  description: string
  completed: boolean
  error?: string
}

export default function EcosystemTestPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [testSteps, setTestSteps] = useState<TestStep[]>([
    {
      id: 'create-organizer',
      title: '1. Crear Usuario Organizador',
      description: 'Crear cuenta y solicitar ser organizador',
      completed: false
    },
    {
      id: 'approve-organizer',
      title: '2. Aprobar Organizador',
      description: 'Simular aprobación del sistema',
      completed: false
    },
    {
      id: 'create-event',
      title: '3. Crear Evento',
      description: 'Crear un evento con múltiples tipos de tickets',
      completed: false
    },
    {
      id: 'create-buyer',
      title: '4. Crear Comprador',
      description: 'Crear cuenta de comprador normal',
      completed: false
    },
    {
      id: 'purchase-ticket',
      title: '5. Comprar Ticket',
      description: 'Simular compra de ticket VIP',
      completed: false
    },
    {
      id: 'verify-purchase',
      title: '6. Verificar Compra',
      description: 'Confirmar ticket en perfil de comprador',
      completed: false
    },
    {
      id: 'check-analytics',
      title: '7. Verificar Analytics',
      description: 'Confirmar actualización en dashboard de organizador',
      completed: false
    },
    {
      id: 'test-checkin',
      title: '8. Simular Check-in',
      description: 'Verificar QR y marcar como usado',
      completed: false
    }
  ])

  const [testData, setTestData] = useState<{
    organizerUser?: User
    buyerUser?: User
    testEvent?: Event
    testPurchase?: Purchase
  }>({})

  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`
    setLogs(prev => [logMessage, ...prev.slice(0, 49)]) // Keep only last 50 logs
  }

  const updateStepStatus = (stepId: string, completed: boolean, error?: string) => {
    setTestSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed, error } : step
    ))
  }

  // Test Step Functions
  const createOrganizer = async () => {
    try {
      addLog('Creando usuario organizador...', 'info')
      
      const manager = getEcosystemManager()
      if (!manager) throw new Error('EcosystemManager not available')
      
      const organizerUser = manager.createUser({
        email: `organizador-test-${Date.now()}@test.com`,
        firstName: 'Test',
        lastName: 'Organizador',
        isOrganizer: false,
        organizerStatus: 'pending'
      })

      setTestData(prev => ({ ...prev, organizerUser }))
      setCurrentUser(organizerUser)
      updateStepStatus('create-organizer', true)
      addLog(`Organizador creado: ${organizerUser.email}`, 'success')
      
    } catch (error) {
      addLog(`Error creando organizador: ${error}`, 'error')
      updateStepStatus('create-organizer', false, String(error))
    }
  }

  const approveOrganizer = async () => {
    if (!testData.organizerUser) return

    try {
      addLog('Aprobando organizador...', 'info')
      
      const manager = getEcosystemManager()
      if (!manager) throw new Error('EcosystemManager not available')
      
      const success = manager.approveOrganizer(testData.organizerUser.id)
      if (!success) throw new Error('Error en aprobación')

      const updatedUser = manager.updateUser(testData.organizerUser.id, {
        isOrganizer: true,
        organizerStatus: 'approved'
      })

      if (updatedUser) {
        setTestData(prev => ({ ...prev, organizerUser: updatedUser }))
        setCurrentUser(updatedUser)
        updateStepStatus('approve-organizer', true)
        addLog('Organizador aprobado exitosamente', 'success')
      }
      
    } catch (error) {
      addLog(`Error aprobando organizador: ${error}`, 'error')
      updateStepStatus('approve-organizer', false, String(error))
    }
  }

  const createTestEvent = async () => {
    if (!testData.organizerUser) return

    try {
      addLog('Creando evento de prueba...', 'info')
      
      const manager = getEcosystemManager()
      if (!manager) throw new Error('EcosystemManager not available')
      
      const testEvent = manager.createEvent({
        organizerId: testData.organizerUser.id,
        name: 'Test Event - Bad Bunny World Tour',
        description: 'Evento de prueba para testing end-to-end',
        detailedDescription: 'Este es un evento creado automáticamente para testing del ecosistema completo.',
        category: 'Música',
        tags: ['test', 'reggaeton', 'concierto'],
        eventType: 'physical',
        venue: 'Estadio Test',
        address: 'Av. Test #123',
        city: 'Santo Domingo',
        country: 'República Dominicana',
        startDate: '2024-06-15',
        startTime: '20:00',
        timezone: 'America/Santo_Domingo (UTC-4)',
        ticketTypes: [
          {
            id: '',
            name: 'General',
            description: 'Entrada general',
            price: 75,
            quantity: 100,
            sold: 0
          },
          {
            id: '',
            name: 'VIP',
            description: 'Acceso VIP con beneficios',
            price: 350,
            quantity: 20,
            sold: 0
          }
        ],
        status: 'published',
        isPublic: true,
        allowTransfers: true,
        refundPolicy: 'no-refunds'
      })

      setTestData(prev => ({ ...prev, testEvent }))
      updateStepStatus('create-event', true)
      addLog(`Evento creado: ${testEvent.name} (ID: ${testEvent.id})`, 'success')
      
    } catch (error) {
      addLog(`Error creando evento: ${error}`, 'error')
      updateStepStatus('create-event', false, String(error))
    }
  }

  const createBuyer = async () => {
    try {
      addLog('Creando usuario comprador...', 'info')
      
      const manager = getEcosystemManager()
      if (!manager) throw new Error('EcosystemManager not available')
      
      const buyerUser = manager.createUser({
        email: `comprador-test-${Date.now()}@test.com`,
        firstName: 'Test',
        lastName: 'Comprador',
        isOrganizer: false
      })

      setTestData(prev => ({ ...prev, buyerUser }))
      updateStepStatus('create-buyer', true)
      addLog(`Comprador creado: ${buyerUser.email}`, 'success')
      
    } catch (error) {
      addLog(`Error creando comprador: ${error}`, 'error')
      updateStepStatus('create-buyer', false, String(error))
    }
  }

  const purchaseTicket = async () => {
    if (!testData.buyerUser || !testData.testEvent) return

    try {
      addLog('Procesando compra de ticket...', 'info')
      
      const vipTicketType = testData.testEvent.ticketTypes.find(t => t.name === 'VIP')
      if (!vipTicketType) throw new Error('Tipo de ticket VIP no encontrado')

      const manager = getEcosystemManager()
      if (!manager) throw new Error('EcosystemManager not available')
      
      const testPurchase = manager.createPurchase({
        eventId: testData.testEvent.id,
        userId: testData.buyerUser.id,
        tickets: [{
          ticketTypeId: vipTicketType.id,
          quantity: 1,
          price: vipTicketType.price,
          ticketIds: []
        }],
        userInfo: {
          firstName: testData.buyerUser.firstName,
          lastName: testData.buyerUser.lastName,
          email: testData.buyerUser.email,
          phone: '+1 (809) 123-4567'
        },
        total: vipTicketType.price,
        paymentMethod: 'Tarjeta terminada en 4567',
        shareOnFeed: true
      })

      setTestData(prev => ({ ...prev, testPurchase }))
      updateStepStatus('purchase-ticket', true)
      addLog(`Compra realizada: ${testPurchase.total} RD$ (ID: ${testPurchase.id})`, 'success')
      
    } catch (error) {
      addLog(`Error en compra: ${error}`, 'error')
      updateStepStatus('purchase-ticket', false, String(error))
    }
  }

  const verifyPurchase = async () => {
    if (!testData.buyerUser) return

    try {
      addLog('Verificando compra en perfil de comprador...', 'info')
      
      const manager = getEcosystemManager()
      if (!manager) throw new Error('EcosystemManager not available')
      
      const userPurchases = manager.getPurchasesByUser(testData.buyerUser.id)
      
      if (userPurchases.length === 0) {
        throw new Error('No se encontraron compras para el usuario')
      }

      const latestPurchase = userPurchases[0]
      const totalTickets = latestPurchase.tickets.reduce((sum, t) => sum + t.ticketIds.length, 0)
      
      updateStepStatus('verify-purchase', true)
      addLog(`Verificación exitosa: ${totalTickets} ticket(s) encontrado(s)`, 'success')
      
    } catch (error) {
      addLog(`Error en verificación: ${error}`, 'error')
      updateStepStatus('verify-purchase', false, String(error))
    }
  }

  const checkAnalytics = async () => {
    if (!testData.organizerUser) return

    try {
      addLog('Verificando analytics de organizador...', 'info')
      
      const manager = getEcosystemManager()
      if (!manager) throw new Error('EcosystemManager not available')
      
      const stats = manager.getOrganizerStats(testData.organizerUser.id)
      
      if (stats.totalTicketsSold === 0) {
        throw new Error('Analytics no muestran tickets vendidos')
      }

      updateStepStatus('check-analytics', true)
      addLog(`Analytics verificados: ${stats.totalTicketsSold} tickets, ${stats.totalRevenue} RD$`, 'success')
      
    } catch (error) {
      addLog(`Error verificando analytics: ${error}`, 'error')
      updateStepStatus('check-analytics', false, String(error))
    }
  }

  const testCheckIn = async () => {
    if (!testData.organizerUser || !testData.testPurchase) return

    try {
      addLog('Simulando check-in con QR...', 'info')
      
      const firstTicket = testData.testPurchase.tickets[0]
      const ticketId = firstTicket.ticketIds[0]
      
      if (!ticketId) throw new Error('No se encontró ID de ticket')

      const manager = getEcosystemManager()
      if (!manager) throw new Error('EcosystemManager not available')
      
      const checkInResult = manager.checkInTicket(ticketId, testData.organizerUser.id)
      
      if (!checkInResult.success) {
        throw new Error(checkInResult.message)
      }

      updateStepStatus('test-checkin', true)
      addLog(`Check-in exitoso para ticket: ${ticketId}`, 'success')
      
      // Test duplicate check-in
      const duplicateResult = manager.checkInTicket(ticketId, testData.organizerUser.id)
      if (duplicateResult.success) {
        throw new Error('El sistema permitió check-in duplicado')
      }
      
      addLog('Protección anti-duplicados funcionando correctamente', 'success')
      
    } catch (error) {
      addLog(`Error en check-in: ${error}`, 'error')
      updateStepStatus('test-checkin', false, String(error))
    }
  }

  const runAllTests = async () => {
    addLog('=== INICIANDO TESTING COMPLETO DEL ECOSISTEMA ===', 'info')
    
    await createOrganizer()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await approveOrganizer()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await createTestEvent()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await createBuyer()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await purchaseTicket()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await verifyPurchase()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await checkAnalytics()
    await new Promise(resolve => setTimeout(resolve, 500))
    
    await testCheckIn()
    
    addLog('=== TESTING COMPLETO FINALIZADO ===', 'info')
  }

  const clearTestData = () => {
    const manager = getEcosystemManager()
    if (!manager) return
    
    manager.clearAllData()
    setTestData({})
    setCurrentUser(null)
    setTestSteps(prev => prev.map(step => ({ ...step, completed: false, error: undefined })))
    setLogs([])
    addLog('Todos los datos de prueba han sido eliminados', 'info')
  }

  const seedDemo = () => {
    const manager = getEcosystemManager()
    if (!manager) return
    
    manager.seedDemoData()
    addLog('Datos demo cargados', 'success')
  }

  return (
    <div className="min-h-screen bg-background-dark p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🧪 Testing End-to-End del Ecosistema NFTicket
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Prueba completa del flujo desde la creación de organizador hasta el check-in del evento. 
            Esta página simula un caso de uso real conectando ambos flujos.
          </p>
        </div>

        {/* Control Panel */}
        <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={runAllTests}
              className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
            >
              <Play size={16} />
              <span>Ejecutar Todos los Tests</span>
            </Button>
            
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw size={16} className="mr-2" />
              Reiniciar Página
            </Button>
            
            <Button variant="outline" onClick={clearTestData} className="text-red-400 border-red-400 hover:bg-red-400/10">
              <Trash2 size={16} className="mr-2" />
              Limpiar Datos
            </Button>
            
            <Button variant="outline" onClick={seedDemo}>
              <Users size={16} className="mr-2" />
              Cargar Demo
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Steps */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Pasos del Testing</h2>
            
            {testSteps.map((step, index) => (
              <div 
                key={step.id}
                className={`bg-background-dark-muted rounded-xl p-4 border transition-colors ${
                  step.completed 
                    ? 'border-green-500 bg-green-500/5' 
                    : step.error 
                      ? 'border-red-500 bg-red-500/5'
                      : 'border-surface-border'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`mt-1 p-1 rounded-full ${
                    step.completed 
                      ? 'bg-green-500' 
                      : step.error 
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                  }`}>
                    {step.completed ? (
                      <CheckCircle size={16} className="text-white" />
                    ) : step.error ? (
                      <AlertCircle size={16} className="text-white" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-gray-300 mt-1">{step.description}</p>
                    {step.error && (
                      <p className="text-red-400 text-sm mt-2">Error: {step.error}</p>
                    )}
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const testFunctions = {
                        'create-organizer': createOrganizer,
                        'approve-organizer': approveOrganizer,
                        'create-event': createTestEvent,
                        'create-buyer': createBuyer,
                        'purchase-ticket': purchaseTicket,
                        'verify-purchase': verifyPurchase,
                        'check-analytics': checkAnalytics,
                        'test-checkin': testCheckIn
                      }
                      testFunctions[step.id as keyof typeof testFunctions]?.()
                    }}
                  >
                    <Play size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Logs and Info */}
          <div className="space-y-6">
            {/* Current Status */}
            {currentUser && (
              <div className="bg-background-dark-muted rounded-xl p-4 border border-surface-border">
                <h3 className="font-semibold text-white mb-3">Usuario Actual</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nombre:</span>
                    <span className="text-white">{currentUser.firstName} {currentUser.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{currentUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tipo:</span>
                    <span className={`${currentUser.isOrganizer ? 'text-brand-400' : 'text-gray-300'}`}>
                      {currentUser.isOrganizer ? 'Organizador' : 'Comprador'}
                    </span>
                  </div>
                  {currentUser.isOrganizer && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Estado:</span>
                      <span className="text-green-400">{currentUser.organizerStatus}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Test Data Summary */}
            {Object.keys(testData).length > 0 && (
              <div className="bg-background-dark-muted rounded-xl p-4 border border-surface-border">
                <h3 className="font-semibold text-white mb-3">Datos de Prueba</h3>
                <div className="space-y-2 text-sm">
                  {testData.organizerUser && (
                    <div className="flex items-center space-x-2">
                      <UserIcon size={14} className="text-brand-400" />
                      <span className="text-gray-300">Organizador creado</span>
                    </div>
                  )}
                  {testData.testEvent && (
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className="text-green-400" />
                      <span className="text-gray-300">Evento: {testData.testEvent.name}</span>
                    </div>
                  )}
                  {testData.buyerUser && (
                    <div className="flex items-center space-x-2">
                      <ShoppingCart size={14} className="text-blue-400" />
                      <span className="text-gray-300">Comprador creado</span>
                    </div>
                  )}
                  {testData.testPurchase && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle size={14} className="text-purple-400" />
                      <span className="text-gray-300">Compra: RD${testData.testPurchase.total}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activity Log */}
            <div className="bg-background-dark-muted rounded-xl p-4 border border-surface-border">
              <h3 className="font-semibold text-white mb-3">Log de Actividad</h3>
              <div className="h-64 overflow-y-auto space-y-1 text-xs font-mono">
                {logs.length === 0 ? (
                  <p className="text-gray-400">No hay actividad aún...</p>
                ) : (
                  logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`p-2 rounded ${
                        log.includes('ERROR') 
                          ? 'bg-red-500/10 text-red-300' 
                          : log.includes('SUCCESS')
                            ? 'bg-green-500/10 text-green-300'
                            : 'bg-blue-500/10 text-blue-300'
                      }`}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-background-dark-muted rounded-xl p-4 border border-surface-border">
              <h3 className="font-semibold text-white mb-3">Acciones Rápidas</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.open('/organizador/dashboard', '_blank')}
                >
                  <Building size={14} className="mr-2" />
                  Abrir Dashboard Organizador
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.open('/events', '_blank')}
                >
                  <Calendar size={14} className="mr-2" />
                  Ver Galería de Eventos
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.open('/perfil/tickets', '_blank')}
                >
                  <QrCode size={14} className="mr-2" />
                  Ver Mis Tickets
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}