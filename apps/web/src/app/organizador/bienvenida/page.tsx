'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@nfticket/ui'
import { 
  CheckCircle, 
  Rocket, 
  Calendar, 
  Users, 
  BarChart3, 
  Shield,
  ArrowRight,
  Play,
  BookOpen,
  MessageCircle,
  Gift,
  Sparkles
} from 'lucide-react'

export default function OrganizerWelcomePage() {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Show confetti animation on load
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }, [])

  const features = [
    {
      icon: <Calendar className="h-6 w-6 text-brand-400" />,
      title: "Creación de Eventos",
      description: "Interface intuitiva para crear eventos en minutos",
      comingSoon: false
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-purple-400" />,
      title: "Analytics Avanzados",
      description: "Reportes detallados de ventas y asistencia",
      comingSoon: false
    },
    {
      icon: <Users className="h-6 w-6 text-green-400" />,
      title: "Gestión de Asistentes",
      description: "Check-in con QR y comunicación directa",
      comingSoon: false
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-400" />,
      title: "Pagos Seguros",
      description: "Procesamiento automático con blockchain",
      comingSoon: false
    }
  ]

  const quickActions = [
    {
      icon: <Rocket className="h-8 w-8 text-brand-400" />,
      title: "Crear tu primer evento",
      description: "Lanza tu evento en menos de 10 minutos",
      action: "Crear Evento",
      primary: true,
      onClick: () => router.push('/organizador/eventos/crear')
    },
    {
      icon: <BookOpen className="h-8 w-8 text-blue-400" />,
      title: "Guía de inicio",
      description: "Aprende las mejores prácticas",
      action: "Ver Guía",
      primary: false,
      onClick: () => alert('Guía de inicio próximamente')
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-green-400" />,
      title: "Soporte dedicado",
      description: "Contacta a nuestro equipo de organizadores",
      action: "Contactar",
      primary: false,
      onClick: () => alert('Chat de soporte próximamente')
    }
  ]

  const goToDashboard = () => {
    router.push('/organizador/dashboard')
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/5 to-transparent animate-pulse"></div>
          {/* Simple confetti effect with CSS */}
          <style jsx>{`
            .confetti {
              position: absolute;
              width: 6px;
              height: 6px;
              background: linear-gradient(45deg, #3B82F6, #8B5CF6, #EF4444, #10B981);
              animation: fall 3s linear infinite;
            }
            @keyframes fall {
              0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
            }
          `}</style>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Success Header */}
      <div className="bg-gradient-to-br from-green-900/40 via-background-dark to-background-dark-muted">
        <div className="container py-16">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-green-500/20 p-6 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6">
              ¡Bienvenido a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600">NFTicket</span>!
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Tu solicitud ha sido aprobada. Ahora tienes acceso completo a todas las herramientas 
              profesionales para crear eventos extraordinarios.
            </p>
            <div className="flex items-center justify-center space-x-2 text-green-400 bg-green-500/10 rounded-full px-6 py-3 inline-flex">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">¡Estás listo para comenzar!</span>
            </div>
          </div>
        </div>
      </div>

      {/* What's Included Section */}
      <div className="container py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Todo lo que necesitas para el éxito</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Como organizador aprobado, tienes acceso completo a nuestra suite de herramientas profesionales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-background-dark-muted rounded-xl p-6 border border-surface-border">
              <div className="flex items-start space-x-4">
                <div className="bg-surface-glass p-3 rounded-lg">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                  {feature.comingSoon && (
                    <span className="inline-block mt-2 px-2 py-1 bg-brand-500/20 text-brand-400 text-xs rounded-full">
                      Próximamente
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {quickActions.map((action, index) => (
            <div 
              key={index} 
              className={`bg-background-dark-muted rounded-2xl p-8 border transition-all duration-200 hover:scale-105 cursor-pointer ${
                action.primary 
                  ? 'border-brand-500/50 bg-gradient-to-br from-brand-900/20 to-background-dark-muted' 
                  : 'border-surface-border hover:border-brand-400/50'
              }`}
              onClick={action.onClick}
            >
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-xl ${
                    action.primary ? 'bg-brand-500/20' : 'bg-surface-glass'
                  }`}>
                    {action.icon}
                  </div>
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{action.title}</h3>
                <p className="text-gray-400 mb-6">{action.description}</p>
                <Button 
                  className={`w-full ${
                    action.primary 
                      ? 'bg-brand-500 hover:bg-brand-600' 
                      : 'bg-transparent border border-surface-border hover:border-brand-400'
                  }`}
                >
                  {action.action}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Welcome Gift */}
        <div className="bg-gradient-to-r from-purple-900/30 to-brand-900/30 rounded-2xl p-8 border border-purple-700/30 text-center">
          <div className="flex justify-center mb-4">
            <Gift className="h-12 w-12 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Regalo de Bienvenida</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Como nuevo organizador, tu primer evento tiene <strong>0% de comisión</strong> en los primeros 100 tickets vendidos. 
            ¡Es nuestra forma de darte la bienvenida!
          </p>
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-400 px-4 py-2 rounded-full">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold">Oferta válida por 30 días</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Button
            onClick={() => router.push('/organizador/eventos/crear')}
            className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 text-lg font-semibold"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Crear mi Primer Evento
          </Button>
          <Button
            variant="outline"
            onClick={goToDashboard}
            className="px-8 py-4 text-lg"
          >
            Ver Dashboard
          </Button>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-12 p-6 bg-background-dark-muted/50 rounded-xl border border-surface-border">
          <h4 className="font-semibold text-white mb-2">¿Tienes preguntas?</h4>
          <p className="text-gray-400 mb-4">
            Nuestro equipo de soporte para organizadores está aquí para ayudarte
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" size="sm">
              <MessageCircle className="mr-2 h-4 w-4" />
              Chat en Vivo
            </Button>
            <Button variant="outline" size="sm">
              📧 soporte-organizadores@nfticket.com
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}