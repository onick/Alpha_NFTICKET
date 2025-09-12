'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@nfticket/ui'
import { 
  ArrowLeft, 
  QrCode, 
  CheckCircle2, 
  X, 
  Camera,
  RefreshCw,
  Users,
  Clock,
  AlertCircle,
  Search,
  Ticket,
  User,
  Calendar
} from 'lucide-react'

interface CheckInResult {
  success: boolean
  attendee?: {
    name: string
    email: string
    ticketType: string
    ticketId: string
    alreadyCheckedIn: boolean
  }
  error?: string
}

interface CheckInStats {
  totalAttendees: number
  checkedIn: number
  remaining: number
  checkedInByType: Record<string, number>
}

// Mock event data
const mockEvent = {
  id: '1',
  name: 'Bad Bunny - World Tour 2024',
  date: '15 de Marzo, 2024',
  time: '8:00 PM',
  location: 'Estadio Olímpico Félix Sánchez'
}

// Mock attendees database
const mockAttendees = new Map([
  ['TIK-ABC123', { 
    name: 'María González', 
    email: 'maria@email.com', 
    ticketType: 'VIP', 
    ticketId: 'TIK-ABC123',
    checkedIn: false,
    checkinTime: null
  }],
  ['TIK-DEF456', { 
    name: 'Carlos Rodríguez', 
    email: 'carlos@email.com', 
    ticketType: 'General', 
    ticketId: 'TIK-DEF456',
    checkedIn: true,
    checkinTime: '2024-03-15T19:30:00Z'
  }],
  ['TIK-GHI789', { 
    name: 'Ana Martínez', 
    email: 'ana@email.com', 
    ticketType: 'Preferencial', 
    ticketId: 'TIK-GHI789',
    checkedIn: false,
    checkinTime: null
  }]
])

export default function CheckInPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isScanning, setIsScanning] = useState(false)
  const [lastScanResult, setLastScanResult] = useState<CheckInResult | null>(null)
  const [manualTicketId, setManualTicketId] = useState('')
  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([])
  const [stats, setStats] = useState<CheckInStats>({
    totalAttendees: 3,
    checkedIn: 1,
    remaining: 2,
    checkedInByType: {
      'VIP': 0,
      'General': 1,
      'Preferencial': 0,
      'Palco': 0
    }
  })
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsScanning(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Error al acceder a la cámara. Por favor, verifica los permisos.')
    }
  }

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const processQRCode = async (ticketId: string): Promise<CheckInResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const attendee = mockAttendees.get(ticketId)
    
    if (!attendee) {
      return {
        success: false,
        error: 'Ticket no válido o no encontrado'
      }
    }

    if (attendee.checkedIn) {
      return {
        success: false,
        attendee: {
          name: attendee.name,
          email: attendee.email,
          ticketType: attendee.ticketType,
          ticketId: attendee.ticketId,
          alreadyCheckedIn: true
        },
        error: 'Este ticket ya fue utilizado'
      }
    }

    // Mark as checked in
    attendee.checkedIn = true
    attendee.checkinTime = new Date().toISOString()
    
    // Update stats
    setStats(prev => ({
      ...prev,
      checkedIn: prev.checkedIn + 1,
      remaining: prev.remaining - 1,
      checkedInByType: {
        ...prev.checkedInByType,
        [attendee.ticketType]: prev.checkedInByType[attendee.ticketType] + 1
      }
    }))

    // Add to recent check-ins
    setRecentCheckIns(prev => [
      {
        ...attendee,
        checkinTime: new Date().toISOString()
      },
      ...prev.slice(0, 9) // Keep only 10 most recent
    ])

    return {
      success: true,
      attendee: {
        name: attendee.name,
        email: attendee.email,
        ticketType: attendee.ticketType,
        ticketId: attendee.ticketId,
        alreadyCheckedIn: false
      }
    }
  }

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualTicketId.trim()) return

    const result = await processQRCode(manualTicketId.trim().toUpperCase())
    setLastScanResult(result)
    setManualTicketId('')
  }

  // Mock QR scanning - in real implementation, use a QR scanning library
  const simulateQRScan = (ticketId: string) => {
    processQRCode(ticketId).then(setLastScanResult)
  }

  useEffect(() => {
    return () => {
      // Cleanup camera on unmount
      stopScanning()
    }
  }, [])

  const getResultColor = (result: CheckInResult) => {
    if (result.success) return 'border-green-500 bg-green-500/10'
    return 'border-red-500 bg-red-500/10'
  }

  const getResultIcon = (result: CheckInResult) => {
    if (result.success) return <CheckCircle2 className="h-8 w-8 text-green-400" />
    return <X className="h-8 w-8 text-red-400" />
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-sm border-b border-surface-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push(`/organizador/eventos/${params.id}`)}
                className="flex items-center space-x-2 text-text-muted hover:text-white"
              >
                <ArrowLeft size={20} />
                <span>Volver</span>
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">Check-in del Evento</h1>
                <p className="text-text-muted">{mockEvent.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">{mockEvent.date}</p>
              <p className="text-sm text-white font-medium">{mockEvent.location}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-background-dark-muted rounded-xl p-4 border border-surface-border text-center">
            <div className="text-2xl font-bold text-white">{stats.totalAttendees}</div>
            <div className="text-sm text-text-muted">Total</div>
          </div>
          <div className="bg-background-dark-muted rounded-xl p-4 border border-surface-border text-center">
            <div className="text-2xl font-bold text-green-400">{stats.checkedIn}</div>
            <div className="text-sm text-text-muted">Check-in</div>
          </div>
          <div className="bg-background-dark-muted rounded-xl p-4 border border-surface-border text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.remaining}</div>
            <div className="text-sm text-text-muted">Pendientes</div>
          </div>
          <div className="bg-background-dark-muted rounded-xl p-4 border border-surface-border text-center">
            <div className="text-2xl font-bold text-brand-400">
              {stats.totalAttendees > 0 ? Math.round((stats.checkedIn / stats.totalAttendees) * 100) : 0}%
            </div>
            <div className="text-sm text-text-muted">Completado</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Scanner Section */}
          <div className="space-y-6">
            {/* Scanner Card */}
            <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Escáner QR</h2>
                <Button
                  variant="outline"
                  onClick={isScanning ? stopScanning : startScanning}
                  className="flex items-center space-x-2"
                >
                  <Camera size={16} />
                  <span>{isScanning ? 'Detener' : 'Iniciar'} Cámara</span>
                </Button>
              </div>

              {/* Camera View */}
              <div className="relative bg-black rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
                {isScanning ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 text-text-muted mx-auto mb-4" />
                      <p className="text-text-muted">Activa la cámara para escanear códigos QR</p>
                    </div>
                  </div>
                )}
                
                {/* Scanning overlay */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-1/4 border-2 border-brand-500 rounded-lg animate-pulse">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-400 rounded-tl"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-400 rounded-tr"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-400 rounded-bl"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-400 rounded-br"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Demo buttons for testing */}
              {isScanning && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => simulateQRScan('TIK-ABC123')}
                  >
                    Simular: Ticket Válido
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => simulateQRScan('TIK-DEF456')}
                  >
                    Simular: Ya Usado
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => simulateQRScan('TIK-INVALID')}
                  >
                    Simular: Inválido
                  </Button>
                </div>
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>

            {/* Manual Input */}
            <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border">
              <h3 className="font-semibold text-white mb-4">Check-in Manual</h3>
              <form onSubmit={handleManualCheckIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID del Ticket
                  </label>
                  <input
                    type="text"
                    value={manualTicketId}
                    onChange={(e) => setManualTicketId(e.target.value)}
                    placeholder="TIK-ABC123"
                    className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark text-white placeholder-text-muted focus:border-brand-500 focus:outline-none font-mono"
                  />
                </div>
                <Button 
                  className="w-full bg-brand-500 hover:bg-brand-600"
                  disabled={!manualTicketId.trim()}
                >
                  <Search className="mr-2" size={16} />
                  Verificar Ticket
                </Button>
              </form>
            </div>

            {/* Last Result */}
            {lastScanResult && (
              <div className={`bg-background-dark-muted rounded-2xl p-6 border-2 ${getResultColor(lastScanResult)}`}>
                <div className="flex items-start space-x-4">
                  {getResultIcon(lastScanResult)}
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg ${lastScanResult.success ? 'text-green-400' : 'text-red-400'}`}>
                      {lastScanResult.success ? 'Check-in Exitoso' : 'Error en Check-in'}
                    </h3>
                    
                    {lastScanResult.attendee && (
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-text-muted">Nombre:</span>
                          <span className="text-white font-medium">{lastScanResult.attendee.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Tipo:</span>
                          <span className="text-white">{lastScanResult.attendee.ticketType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Ticket:</span>
                          <span className="text-white font-mono">{lastScanResult.attendee.ticketId}</span>
                        </div>
                      </div>
                    )}
                    
                    {lastScanResult.error && (
                      <p className="mt-2 text-red-300">{lastScanResult.error}</p>
                    )}
                    
                    {lastScanResult.success && (
                      <div className="mt-4 flex items-center text-green-400 text-sm">
                        <CheckCircle2 size={16} className="mr-2" />
                        <span>Entrada confirmada • {new Date().toLocaleTimeString('es-DO')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            {/* Recent Check-ins */}
            <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Check-ins Recientes</h3>
                <Button variant="outline" size="sm">
                  <RefreshCw size={16} />
                </Button>
              </div>
              
              {recentCheckIns.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-text-muted mx-auto mb-3" />
                  <p className="text-text-muted">No hay check-ins recientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCheckIns.map((checkin, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-surface-glass rounded-lg">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{checkin.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-text-muted">
                          <span>{checkin.ticketType}</span>
                          <span>•</span>
                          <span>{new Date(checkin.checkinTime).toLocaleTimeString('es-DO')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Check-in by Type */}
            <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border">
              <h3 className="font-semibold text-white mb-4">Check-in por Tipo</h3>
              <div className="space-y-3">
                {Object.entries(stats.checkedInByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-text-muted">{type}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{count}</span>
                      <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border">
              <h3 className="font-semibold text-white mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/organizador/eventos/${params.id}`)}
                >
                  <Ticket className="mr-2" size={16} />
                  Ver Lista Completa
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <User className="mr-2" size={16} />
                  Buscar Asistente
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Calendar className="mr-2" size={16} />
                  Reportes del Evento
                </Button>
              </div>
            </div>

            {/* Emergency Info */}
            <div className="bg-orange-500/10 rounded-2xl p-6 border border-orange-500/30">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-orange-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-400 mb-2">Información de Emergencia</h4>
                  <div className="space-y-1 text-sm text-orange-300">
                    <p>• Soporte: +1 (809) 123-4567</p>
                    <p>• En caso de problemas técnicos, usar check-in manual</p>
                    <p>• Todos los check-ins se sincronizan automáticamente</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}