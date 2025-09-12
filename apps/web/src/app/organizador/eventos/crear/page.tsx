'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@nfticket/ui'
import { 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Minus, 
  Eye, 
  Save,
  Upload,
  MapPin,
  Calendar,
  Clock,
  Globe,
  Users,
  DollarSign,
  Ticket,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  X
} from 'lucide-react'

interface TicketType {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  saleStartDate?: string
  saleEndDate?: string
}

interface EventData {
  // Step 1: Event Information
  name: string
  description: string
  detailedDescription: string
  bannerImage: string
  category: string
  tags: string[]
  
  // Step 2: Location and Date
  eventType: 'physical' | 'online'
  venue: string
  address: string
  city: string
  country: string
  onlineLink: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  timezone: string
  
  // Step 3: Tickets
  ticketTypes: TicketType[]
  
  // Step 4: Settings
  isPublic: boolean
  allowTransfers: boolean
  refundPolicy: string
}

const categories = [
  'Música',
  'Tecnología', 
  'Deportes',
  'Arte y Cultura',
  'Negocios',
  'Educación',
  'Comida y Bebida',
  'Entretenimiento',
  'Salud y Bienestar',
  'Otros'
]

const timezones = [
  'America/Santo_Domingo (UTC-4)',
  'America/New_York (UTC-5)',
  'America/Los_Angeles (UTC-8)',
  'Europe/Madrid (UTC+1)',
  'Europe/London (UTC+0)'
]

export default function CreateEventPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const [eventData, setEventData] = useState<EventData>({
    name: '',
    description: '',
    detailedDescription: '',
    bannerImage: '',
    category: '',
    tags: [],
    eventType: 'physical',
    venue: '',
    address: '',
    city: '',
    country: '',
    onlineLink: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: 'America/Santo_Domingo (UTC-4)',
    ticketTypes: [],
    isPublic: true,
    allowTransfers: true,
    refundPolicy: 'no-refunds'
  })

  const steps = [
    { number: 1, title: "Información del Evento", completed: currentStep > 1 },
    { number: 2, title: "Lugar y Fecha", completed: currentStep > 2 },
    { number: 3, title: "Configuración de Tickets", completed: currentStep > 3 },
    { number: 4, title: "Vista Previa y Publicación", completed: false }
  ]

  const handleInputChange = (field: keyof EventData, value: any) => {
    setEventData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addTag = (tag: string) => {
    if (tag && !eventData.tags.includes(tag)) {
      handleInputChange('tags', [...eventData.tags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', eventData.tags.filter(tag => tag !== tagToRemove))
  }

  const addTicketType = () => {
    const newTicket: TicketType = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      quantity: 0
    }
    handleInputChange('ticketTypes', [...eventData.ticketTypes, newTicket])
  }

  const updateTicketType = (id: string, field: keyof TicketType, value: any) => {
    const updatedTickets = eventData.ticketTypes.map(ticket =>
      ticket.id === id ? { ...ticket, [field]: value } : ticket
    )
    handleInputChange('ticketTypes', updatedTickets)
  }

  const removeTicketType = (id: string) => {
    const updatedTickets = eventData.ticketTypes.filter(ticket => ticket.id !== id)
    handleInputChange('ticketTypes', updatedTickets)
  }

  // Check if step is valid without setting errors (for useMemo)
  const isStepValid = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!eventData.name.trim()) newErrors.name = 'El nombre del evento es obligatorio'
        if (!eventData.description.trim()) newErrors.description = 'La descripción es obligatoria'
        if (!eventData.category) newErrors.category = 'Selecciona una categoría'
        break
      
      case 2:
        if (eventData.eventType === 'physical') {
          if (!eventData.venue.trim()) newErrors.venue = 'El lugar es obligatorio'
          if (!eventData.address.trim()) newErrors.address = 'La dirección es obligatoria'
          if (!eventData.city.trim()) newErrors.city = 'La ciudad es obligatoria'
        } else {
          if (!eventData.onlineLink.trim()) newErrors.onlineLink = 'El enlace del evento es obligatorio'
        }
        if (!eventData.startDate) newErrors.startDate = 'La fecha de inicio es obligatoria'
        if (!eventData.startTime) newErrors.startTime = 'La hora de inicio es obligatoria'
        break
      
      case 3:
        if (eventData.ticketTypes.length === 0) {
          newErrors.tickets = 'Debes crear al menos un tipo de ticket'
        } else {
          eventData.ticketTypes.forEach((ticket, index) => {
            if (!ticket.name.trim()) newErrors[`ticket_${index}_name`] = 'Nombre del ticket requerido'
            if (ticket.price <= 0) newErrors[`ticket_${index}_price`] = 'El precio debe ser mayor a 0'
            if (ticket.quantity <= 0) newErrors[`ticket_${index}_quantity`] = 'La cantidad debe ser mayor a 0'
          })
        }
        break
    }
    
    return Object.keys(newErrors).length === 0
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!eventData.name.trim()) newErrors.name = 'El nombre del evento es obligatorio'
        if (!eventData.description.trim()) newErrors.description = 'La descripción es obligatoria'
        if (!eventData.category) newErrors.category = 'Selecciona una categoría'
        break
      
      case 2:
        if (eventData.eventType === 'physical') {
          if (!eventData.venue.trim()) newErrors.venue = 'El lugar es obligatorio'
          if (!eventData.address.trim()) newErrors.address = 'La dirección es obligatoria'
          if (!eventData.city.trim()) newErrors.city = 'La ciudad es obligatoria'
        } else {
          if (!eventData.onlineLink.trim()) newErrors.onlineLink = 'El enlace del evento es obligatorio'
        }
        if (!eventData.startDate) newErrors.startDate = 'La fecha de inicio es obligatoria'
        if (!eventData.startTime) newErrors.startTime = 'La hora de inicio es obligatoria'
        break
      
      case 3:
        if (eventData.ticketTypes.length === 0) {
          newErrors.tickets = 'Debes crear al menos un tipo de ticket'
        } else {
          eventData.ticketTypes.forEach((ticket, index) => {
            if (!ticket.name.trim()) newErrors[`ticket_${index}_name`] = 'Nombre del ticket requerido'
            if (ticket.price <= 0) newErrors[`ticket_${index}_price`] = 'El precio debe ser mayor a 0'
            if (ticket.quantity <= 0) newErrors[`ticket_${index}_quantity`] = 'La cantidad debe ser mayor a 0'
          })
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Memoize the current step validation to prevent infinite renders
  const currentStepIsValid = useMemo(() => {
    return isStepValid(currentStep)
  }, [currentStep, eventData])

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const saveDraft = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call to save draft
      await new Promise(resolve => setTimeout(resolve, 1500))
      localStorage.setItem('eventDraft', JSON.stringify({
        ...eventData,
        id: Date.now().toString(),
        status: 'draft',
        createdAt: new Date().toISOString()
      }))
      alert('Borrador guardado exitosamente')
      router.push('/organizador/dashboard')
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const publishEvent = async () => {
    if (!validateStep(currentStep)) return
    
    setIsSubmitting(true)
    try {
      // Simulate API call to publish event
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Save to localStorage for demo
      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
        status: 'published',
        createdAt: new Date().toISOString(),
        ticketsSold: 0,
        revenue: 0,
        views: 0
      }
      
      localStorage.setItem('publishedEvent', JSON.stringify(newEvent))
      
      // Redirect to success page or dashboard
      router.push('/organizador/dashboard')
      alert('¡Evento publicado exitosamente!')
    } catch (error) {
      console.error('Error publishing event:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Información del Evento</h3>
            
            {/* Event Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Evento <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={eventData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                placeholder="Ej: Concierto de Jazz en Santo Domingo"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descripción Corta <span className="text-red-400">*</span>
              </label>
              <textarea
                value={eventData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                placeholder="Una descripción breve que aparecerá en las tarjetas del evento..."
                rows={3}
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descripción Detallada
              </label>
              <textarea
                value={eventData.detailedDescription}
                onChange={(e) => handleInputChange('detailedDescription', e.target.value)}
                className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                placeholder="Descripción completa con todos los detalles del evento, que incluya, etc..."
                rows={6}
              />
              <p className="text-xs text-gray-400 mt-1">Esta descripción aparecerá en la página completa del evento</p>
            </div>

            {/* Banner Image */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Imagen Principal (Banner)
              </label>
              <div className="border-2 border-dashed border-surface-border rounded-lg p-6 text-center hover:border-brand-500 transition-colors cursor-pointer">
                <Upload className="h-12 w-12 text-text-muted mx-auto mb-2" />
                <p className="text-sm text-text-muted mb-1">Arrastra una imagen aquí o haz clic para seleccionar</p>
                <p className="text-xs text-gray-400">Recomendado: 1920x1080px, máximo 5MB</p>
                <input
                  type="url"
                  value={eventData.bannerImage}
                  onChange={(e) => handleInputChange('bannerImage', e.target.value)}
                  className="mt-3 w-full px-3 py-2 border border-surface-border rounded bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                  placeholder="O pega la URL de una imagen"
                />
              </div>
            </div>

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categoría <span className="text-red-400">*</span>
                </label>
                <select
                  value={eventData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Etiquetas
                </label>
                <input
                  type="text"
                  placeholder="Presiona Enter para agregar etiquetas"
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      addTag(input.value.trim())
                      input.value = ''
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {eventData.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full text-sm">
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Lugar y Fecha</h3>
            
            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Evento <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange('eventType', 'physical')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    eventData.eventType === 'physical'
                      ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                      : 'border-surface-border bg-background-dark-muted text-text-muted hover:border-brand-400'
                  }`}
                >
                  <MapPin className="h-6 w-6 mb-2" />
                  <h4 className="font-semibold">Evento Físico</h4>
                  <p className="text-sm opacity-75">En un lugar específico</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange('eventType', 'online')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    eventData.eventType === 'online'
                      ? 'border-brand-500 bg-brand-500/10 text-brand-400'
                      : 'border-surface-border bg-background-dark-muted text-text-muted hover:border-brand-400'
                  }`}
                >
                  <Globe className="h-6 w-6 mb-2" />
                  <h4 className="font-semibold">Evento Online</h4>
                  <p className="text-sm opacity-75">Transmisión virtual</p>
                </button>
              </div>
            </div>

            {/* Location Fields */}
            {eventData.eventType === 'physical' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lugar/Venue <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={eventData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                    placeholder="Ej: Teatro Nacional, Estadio Olímpico"
                  />
                  {errors.venue && <p className="text-red-400 text-sm mt-1">{errors.venue}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dirección Completa <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={eventData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                    placeholder="Ej: Av. Máximo Gómez #30, Plaza de la Cultura"
                  />
                  {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ciudad <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={eventData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                      placeholder="Santo Domingo"
                    />
                    {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      value={eventData.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                      placeholder="República Dominicana"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enlace del Evento Online <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  value={eventData.onlineLink}
                  onChange={(e) => handleInputChange('onlineLink', e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                  placeholder="https://zoom.us/j/123456789 o https://youtube.com/live/..."
                />
                {errors.onlineLink && <p className="text-red-400 text-sm mt-1">{errors.onlineLink}</p>}
              </div>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha de Inicio <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={eventData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white focus:border-brand-500 focus:outline-none"
                />
                {errors.startDate && <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hora de Inicio <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  value={eventData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white focus:border-brand-500 focus:outline-none"
                />
                {errors.startTime && <p className="text-red-400 text-sm mt-1">{errors.startTime}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  value={eventData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white focus:border-brand-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Opcional - deja vacío si es el mismo día</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Hora de Fin
                </label>
                <input
                  type="time"
                  value={eventData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zona Horaria
              </label>
              <select
                value={eventData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white focus:border-brand-500 focus:outline-none"
              >
                {timezones.map(timezone => (
                  <option key={timezone} value={timezone}>{timezone}</option>
                ))}
              </select>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Configuración de Tickets</h3>
              <Button 
                onClick={addTicketType}
                className="bg-brand-500 hover:bg-brand-600"
              >
                <Plus className="mr-2" size={16} />
                Añadir Tipo de Ticket
              </Button>
            </div>
            
            {errors.tickets && <p className="text-red-400 text-sm">{errors.tickets}</p>}
            
            <div className="space-y-6">
              {eventData.ticketTypes.map((ticket, index) => (
                <div key={ticket.id} className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-white">Ticket #{index + 1}</h4>
                    {eventData.ticketTypes.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTicketType(ticket.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre del Ticket <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={ticket.name}
                        onChange={(e) => updateTicketType(ticket.id, 'name', e.target.value)}
                        className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                        placeholder="Ej: Entrada General, VIP, Acceso Anticipado"
                      />
                      {errors[`ticket_${index}_name`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`ticket_${index}_name`]}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Precio (RD$) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={ticket.price}
                        onChange={(e) => updateTicketType(ticket.id, 'price', Number(e.target.value))}
                        className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                        placeholder="0"
                        min="0"
                        step="1"
                      />
                      {errors[`ticket_${index}_price`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`ticket_${index}_price`]}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descripción del Ticket
                    </label>
                    <textarea
                      value={ticket.description}
                      onChange={(e) => updateTicketType(ticket.id, 'description', e.target.value)}
                      className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                      placeholder="Ej: Incluye camiseta y bebida, acceso a área VIP..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Cantidad Disponible <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        value={ticket.quantity}
                        onChange={(e) => updateTicketType(ticket.id, 'quantity', Number(e.target.value))}
                        className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                        placeholder="0"
                        min="0"
                        step="1"
                      />
                      {errors[`ticket_${index}_quantity`] && (
                        <p className="text-red-400 text-sm mt-1">{errors[`ticket_${index}_quantity`]}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Inicio de Venta
                      </label>
                      <input
                        type="datetime-local"
                        value={ticket.saleStartDate || ''}
                        onChange={(e) => updateTicketType(ticket.id, 'saleStartDate', e.target.value)}
                        className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Fin de Venta
                      </label>
                      <input
                        type="datetime-local"
                        value={ticket.saleEndDate || ''}
                        onChange={(e) => updateTicketType(ticket.id, 'saleEndDate', e.target.value)}
                        className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark text-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {eventData.ticketTypes.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-surface-border rounded-xl">
                  <Ticket className="h-12 w-12 text-text-muted mx-auto mb-4" />
                  <h4 className="font-semibold text-white mb-2">No hay tipos de tickets</h4>
                  <p className="text-text-muted mb-4">Crea al menos un tipo de ticket para tu evento</p>
                  <Button 
                    onClick={addTicketType}
                    className="bg-brand-500 hover:bg-brand-600"
                  >
                    <Plus className="mr-2" size={16} />
                    Crear Primer Ticket
                  </Button>
                </div>
              )}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Vista Previa y Publicación</h3>
            
            {/* Event Preview */}
            <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
              <h4 className="font-semibold text-white mb-4">Vista Previa del Evento</h4>
              <div className="bg-surface-glass rounded-lg p-6 border border-surface-border">
                {/* Preview content would go here */}
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 bg-brand-500/20 rounded-lg flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{eventData.name || 'Nombre del evento'}</h3>
                    <p className="text-gray-300 mb-3">{eventData.description || 'Descripción del evento aparecerá aquí'}</p>
                    <div className="flex items-center space-x-4 text-sm text-text-muted">
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{eventData.startDate || 'Fecha'} • {eventData.startTime || 'Hora'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span>{eventData.venue || eventData.onlineLink || 'Ubicación'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Settings */}
            <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
              <h4 className="font-semibold text-white mb-4">Configuración del Evento</h4>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-white">Evento Público</h5>
                    <p className="text-sm text-text-muted">El evento será visible en la galería pública</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={eventData.isPublic}
                    onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                    className="w-5 h-5 text-brand-500 border-surface-border rounded focus:ring-brand-500"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-white">Permitir Transferencias</h5>
                    <p className="text-sm text-text-muted">Los compradores pueden transferir sus tickets</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={eventData.allowTransfers}
                    onChange={(e) => handleInputChange('allowTransfers', e.target.checked)}
                    className="w-5 h-5 text-brand-500 border-surface-border rounded focus:ring-brand-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Política de Reembolsos
                  </label>
                  <select
                    value={eventData.refundPolicy}
                    onChange={(e) => handleInputChange('refundPolicy', e.target.value)}
                    className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="no-refunds">Sin reembolsos</option>
                    <option value="24h-before">Hasta 24h antes del evento</option>
                    <option value="week-before">Hasta 1 semana antes del evento</option>
                    <option value="custom">Política personalizada</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ticket Summary */}
            {eventData.ticketTypes.length > 0 && (
              <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
                <h4 className="font-semibold text-white mb-4">Resumen de Tickets</h4>
                <div className="space-y-3">
                  {eventData.ticketTypes.map((ticket, index) => (
                    <div key={ticket.id} className="flex justify-between items-center p-3 bg-surface-glass rounded-lg">
                      <div>
                        <h5 className="font-medium text-white">{ticket.name}</h5>
                        <p className="text-sm text-text-muted">{ticket.quantity} disponibles</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">RD${ticket.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-surface-border pt-3 mt-3">
                    <div className="flex justify-between font-semibold text-white">
                      <span>Total Tickets</span>
                      <span>{eventData.ticketTypes.reduce((sum, t) => sum + t.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-white">
                      <span>Ingresos Potenciales</span>
                      <span>RD${eventData.ticketTypes.reduce((sum, t) => sum + (t.price * t.quantity), 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Important Notes */}
            <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/30">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">Importante</h4>
                  <ul className="space-y-1 text-sm text-blue-300">
                    <li>• Una vez publicado, el evento será visible para todos los usuarios</li>
                    <li>• Podrás editar algunos detalles después de publicar</li>
                    <li>• Las ventas comenzarán inmediatamente una vez publicado</li>
                    <li>• Recibirás notificaciones por cada ticket vendido</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
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
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-text-muted hover:text-white"
              >
                <ArrowLeft size={20} />
                <span>Volver</span>
              </Button>
              <h1 className="text-xl font-bold text-white">Crear Nuevo Evento</h1>
            </div>
            <Button
              variant="outline"
              onClick={saveDraft}
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Guardar Borrador</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step.number === currentStep 
                      ? 'bg-brand-500 border-brand-500 text-white' 
                      : step.completed 
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-background-dark-muted border-surface-border text-text-muted'
                  }`}>
                    {step.completed ? (
                      <CheckCircle size={20} />
                    ) : (
                      <span className="font-semibold">{step.number}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 ml-4 ${
                      step.completed ? 'bg-green-500' : 'bg-surface-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-background-dark-muted rounded-2xl p-8 border border-surface-border">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-border">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2" size={16} />
                Anterior
              </Button>
              
              <div className="flex items-center space-x-3">
                {currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!currentStepIsValid}
                    className="bg-brand-500 hover:bg-brand-600"
                  >
                    Siguiente
                    <ArrowRight className="ml-2" size={16} />
                  </Button>
                ) : (
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      onClick={saveDraft}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                          <span>Guardando...</span>
                        </div>
                      ) : (
                        <>
                          <Save className="mr-2" size={16} />
                          Guardar Borrador
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={publishEvent}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Publicando...</span>
                        </div>
                      ) : (
                        <>
                          <Eye className="mr-2" size={16} />
                          Publicar Evento
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}