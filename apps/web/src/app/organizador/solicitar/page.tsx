'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@nfticket/ui'
import { 
  ArrowLeft, 
  Star, 
  Users, 
  TrendingUp, 
  Shield, 
  CheckCircle,
  Globe,
  Calendar,
  BarChart3,
  CreditCard,
  Mail,
  Phone,
  Building,
  ExternalLink
} from 'lucide-react'

interface OrganizerApplication {
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName: string
  companyWebsite: string
  socialMedia: string
  eventType: string
  eventFrequency: string
  expectedAttendees: string
  description: string
  hasExperience: boolean
  agreedToTerms: boolean
}

export default function ApplyOrganizerPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [application, setApplication] = useState<OrganizerApplication>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    companyWebsite: '',
    socialMedia: '',
    eventType: '',
    eventFrequency: '',
    expectedAttendees: '',
    description: '',
    hasExperience: false,
    agreedToTerms: false
  })

  const benefits = [
    {
      icon: <TrendingUp className="h-8 w-8 text-brand-400" />,
      title: "Vende más tickets",
      description: "Nuestra plataforma te ayuda a llegar a más audiencia y aumentar tus ventas"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-400" />,
      title: "Pagos seguros",
      description: "Procesamiento seguro de pagos con tecnología blockchain y transferencias rápidas"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-400" />,
      title: "Analytics poderosos",
      description: "Conoce a tu audiencia con datos detallados y reportes en tiempo real"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-400" />,
      title: "Gestión de asistentes",
      description: "Herramientas completas para manejar check-ins, listas y comunicación"
    }
  ]

  const steps = [
    { number: 1, title: "Información Personal", completed: currentStep > 1 },
    { number: 2, title: "Información del Negocio", completed: currentStep > 2 },
    { number: 3, title: "Detalles de Eventos", completed: currentStep > 3 },
    { number: 4, title: "Revisión y Envío", completed: false }
  ]

  const handleInputChange = (field: keyof OrganizerApplication, value: string | boolean) => {
    setApplication(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(application.firstName && application.lastName && application.email && application.phone)
      case 2:
        return !!(application.companyName && application.eventType)
      case 3:
        return !!(application.eventFrequency && application.expectedAttendees && application.description)
      case 4:
        return application.agreedToTerms
      default:
        return false
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep(4)) return
    
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Store application in localStorage for demo
      localStorage.setItem('organizerApplication', JSON.stringify({
        ...application,
        applicationDate: new Date().toISOString(),
        status: 'pending'
      }))
      
      // Redirect to welcome page
      router.push('/organizador/bienvenida')
    } catch (error) {
      console.error('Error submitting application:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={application.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Apellido <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={application.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                  placeholder="Tu apellido"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={application.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={application.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                  placeholder="+1 (809) 123-4567"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Información del Negocio</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre de la Empresa/Organización <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={application.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                  placeholder="Nombre de tu empresa"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={application.companyWebsite}
                    onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                    className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                    placeholder="https://tuempresa.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Redes Sociales
                  </label>
                  <input
                    type="text"
                    value={application.socialMedia}
                    onChange={(e) => handleInputChange('socialMedia', e.target.value)}
                    className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                    placeholder="@tuempresa"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Eventos <span className="text-red-400">*</span>
                </label>
                <select
                  value={application.eventType}
                  onChange={(e) => handleInputChange('eventType', e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="">Selecciona el tipo</option>
                  <option value="music">Música y Conciertos</option>
                  <option value="business">Negocios y Conferencias</option>
                  <option value="sports">Deportes</option>
                  <option value="arts">Arte y Cultura</option>
                  <option value="education">Educación y Talleres</option>
                  <option value="other">Otros</option>
                </select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Detalles de Eventos</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Frecuencia de Eventos <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={application.eventFrequency}
                    onChange={(e) => handleInputChange('eventFrequency', e.target.value)}
                    className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">Selecciona frecuencia</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                    <option value="quarterly">Trimestral</option>
                    <option value="yearly">Anual</option>
                    <option value="occasional">Ocasional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Asistentes Esperados <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={application.expectedAttendees}
                    onChange={(e) => handleInputChange('expectedAttendees', e.target.value)}
                    className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">Selecciona cantidad</option>
                    <option value="1-50">1 - 50 personas</option>
                    <option value="51-200">51 - 200 personas</option>
                    <option value="201-500">201 - 500 personas</option>
                    <option value="501-1000">501 - 1,000 personas</option>
                    <option value="1000+">Más de 1,000 personas</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Describe tus eventos <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={application.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 border border-surface-border rounded-lg bg-background-dark-muted text-white placeholder-text-muted focus:border-brand-500 focus:outline-none"
                  placeholder="Cuéntanos sobre los eventos que organizas o planeas organizar..."
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="hasExperience"
                  checked={application.hasExperience}
                  onChange={(e) => handleInputChange('hasExperience', e.target.checked)}
                  className="w-5 h-5 text-brand-500 border-surface-border rounded focus:ring-brand-500"
                />
                <label htmlFor="hasExperience" className="text-gray-300">
                  Tengo experiencia previa organizando eventos
                </label>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Revisión y Envío</h3>
            <div className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
              <h4 className="font-semibold text-white mb-4">Resumen de tu Solicitud</h4>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Nombre:</strong> {application.firstName} {application.lastName}</div>
                  <div><strong>Email:</strong> {application.email}</div>
                  <div><strong>Empresa:</strong> {application.companyName}</div>
                  <div><strong>Tipo:</strong> {application.eventType}</div>
                  <div><strong>Frecuencia:</strong> {application.eventFrequency}</div>
                  <div><strong>Asistentes:</strong> {application.expectedAttendees}</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/30">
              <h4 className="font-semibold text-blue-400 mb-3">¿Qué sigue?</h4>
              <ul className="space-y-2 text-sm text-blue-300">
                <li>• Revisaremos tu solicitud en 24-48 horas</li>
                <li>• Te contactaremos por email con el resultado</li>
                <li>• Si es aprobada, recibirás acceso inmediato al dashboard</li>
                <li>• Podrás crear tu primer evento de inmediato</li>
              </ul>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="agreedToTerms"
                checked={application.agreedToTerms}
                onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                className="w-5 h-5 text-brand-500 border-surface-border rounded focus:ring-brand-500"
              />
              <label htmlFor="agreedToTerms" className="text-gray-300">
                Acepto los <a href="#" className="text-brand-400 hover:underline">términos y condiciones</a> y la <a href="#" className="text-brand-400 hover:underline">política de privacidad</a>
              </label>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-sm border-b border-surface-border">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-text-muted hover:text-white"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </Button>
            <h1 className="text-xl font-bold text-white">Conviértete en Organizador</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-brand-900/40 via-background-dark to-background-dark-muted">
        <div className="container py-16">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Crea eventos que <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">marquen la diferencia</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Únete a NFTicket y transforma la manera en que organizas eventos. 
              Tecnología blockchain, pagos seguros y herramientas profesionales al alcance de tus manos.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-background-dark-muted/50 backdrop-blur-sm rounded-xl p-6 border border-surface-border text-center">
                <div className="flex justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="container py-12">
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
                Anterior
              </Button>
              
              <div className="flex items-center space-x-3">
                {currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="bg-brand-500 hover:bg-brand-600"
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!validateStep(4) || isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      'Enviar Solicitud'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}