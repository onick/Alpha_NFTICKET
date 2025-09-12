'use client'

import { useState, useEffect } from 'react'
import { Button } from '@nfticket/ui'
import { ArrowLeft, Lock, CreditCard, Mail, User, Phone, MapPin, Eye, EyeOff, AlertCircle, CheckCircle, Shield, Smartphone } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CheckoutData {
  event: any
  tickets: Array<{ ticketId: number, quantity: number }>
  total: number
}

interface UserForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  createAccount: boolean
  password: string
}

interface PaymentForm {
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
}

export default function CheckoutPage({ params }: { params: { evento: string } }) {
  const router = useRouter()
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null)
  const [currentStep, setCurrentStep] = useState(1) // 1: User Info, 2: Payment, 3: Confirmation
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<any>({})
  
  const [userForm, setUserForm] = useState<UserForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    createAccount: false,
    password: ''
  })

  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })

  useEffect(() => {
    // Get checkout data from localStorage
    const data = localStorage.getItem('selectedTickets')
    if (data) {
      setCheckoutData(JSON.parse(data))
    } else {
      // Redirect back if no checkout data
      router.push('/events')
    }
  }, [])

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const validateUserForm = () => {
    const newErrors: any = {}
    if (!userForm.firstName.trim()) newErrors.firstName = 'Nombre requerido'
    if (!userForm.lastName.trim()) newErrors.lastName = 'Apellido requerido'
    if (!userForm.email.trim()) newErrors.email = 'Email requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) newErrors.email = 'Email inválido'
    if (!userForm.phone.trim()) newErrors.phone = 'Teléfono requerido'
    if (userForm.createAccount && !userForm.password) newErrors.password = 'Contraseña requerida'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePaymentForm = () => {
    const newErrors: any = {}
    if (!paymentForm.cardNumber.replace(/\s/g, '')) newErrors.cardNumber = 'Número de tarjeta requerido'
    if (!paymentForm.expiryDate) newErrors.expiryDate = 'Fecha de vencimiento requerida'
    if (!paymentForm.cvv) newErrors.cvv = 'CVV requerido'
    if (!paymentForm.cardholderName.trim()) newErrors.cardholderName = 'Nombre del titular requerido'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const proceedToPayment = () => {
    if (validateUserForm()) {
      setCurrentStep(2)
    }
  }

  const processPayment = async () => {
    if (!validatePaymentForm()) return
    
    setIsLoading(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Store purchase data
      const purchaseData = {
        event: checkoutData?.event,
        tickets: checkoutData?.tickets,
        user: userForm,
        total: checkoutData?.total,
        paymentMethod: 'Tarjeta terminada en ' + paymentForm.cardNumber.slice(-4),
        orderId: 'ORD-' + Date.now(),
        purchaseDate: new Date().toISOString()
      }
      
      localStorage.setItem('lastPurchase', JSON.stringify(purchaseData))
      localStorage.removeItem('selectedTickets')
      
      // Navigate to success page
      router.push(`/orden/confirmacion/${params.evento}`)
      
    } catch (error) {
      console.error('Payment failed:', error)
      // Handle payment error
    } finally {
      setIsLoading(false)
    }
  }

  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-500"></div>
      </div>
    )
  }

  const serviceFeePct = 0.05 // 5%
  const serviceFee = Math.round(checkoutData.total * serviceFeePct)
  const finalTotal = checkoutData.total + serviceFee

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
            <div className="flex items-center space-x-2 text-sm text-text-muted">
              <Lock size={16} />
              <span>Pago Seguro</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {[
                { step: 1, title: 'Información', icon: User },
                { step: 2, title: 'Pago', icon: CreditCard },
                { step: 3, title: 'Confirmación', icon: CheckCircle }
              ].map(({ step, title, icon: Icon }) => (
                <div key={step} className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= step 
                      ? 'bg-brand-500 text-white' 
                      : 'bg-surface-glass text-text-muted'
                  }`}>
                    {currentStep > step ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Icon size={20} />
                    )}
                  </div>
                  <span className={`font-medium ${
                    currentStep >= step ? 'text-white' : 'text-text-muted'
                  }`}>
                    {title}
                  </span>
                  {step < 3 && (
                    <div className={`w-12 h-0.5 ${
                      currentStep > step ? 'bg-brand-500' : 'bg-surface-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: User Information */}
              {currentStep === 1 && (
                <div className="bg-background-dark-muted rounded-2xl p-8 border border-surface-border">
                  <h2 className="text-2xl font-bold text-white mb-6">Información Personal</h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          value={userForm.firstName}
                          onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                          className={`w-full p-3 rounded-lg bg-background-dark border ${
                            errors.firstName ? 'border-red-500' : 'border-surface-border'
                          } text-white focus:border-brand-500 focus:outline-none`}
                          placeholder="Tu nombre"
                        />
                        {errors.firstName && (
                          <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Apellido *
                        </label>
                        <input
                          type="text"
                          value={userForm.lastName}
                          onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                          className={`w-full p-3 rounded-lg bg-background-dark border ${
                            errors.lastName ? 'border-red-500' : 'border-surface-border'
                          } text-white focus:border-brand-500 focus:outline-none`}
                          placeholder="Tu apellido"
                        />
                        {errors.lastName && (
                          <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                          className={`w-full p-3 pl-12 rounded-lg bg-background-dark border ${
                            errors.email ? 'border-red-500' : 'border-surface-border'
                          } text-white focus:border-brand-500 focus:outline-none`}
                          placeholder="tu@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Teléfono *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="tel"
                          value={userForm.phone}
                          onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                          className={`w-full p-3 pl-12 rounded-lg bg-background-dark border ${
                            errors.phone ? 'border-red-500' : 'border-surface-border'
                          } text-white focus:border-brand-500 focus:outline-none`}
                          placeholder="+1 (809) 555-0123"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    {/* Create Account Option */}
                    <div className="bg-surface-glass rounded-xl p-4 border border-surface-border">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="createAccount"
                          checked={userForm.createAccount}
                          onChange={(e) => setUserForm({...userForm, createAccount: e.target.checked})}
                          className="w-4 h-4 text-brand-500 bg-background-dark border-gray-300 rounded focus:ring-brand-500"
                        />
                        <label htmlFor="createAccount" className="text-sm font-medium text-gray-300">
                          Crear una cuenta para futuras compras (opcional)
                        </label>
                      </div>
                      
                      {userForm.createAccount && (
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Contraseña *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={userForm.password}
                              onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                              className={`w-full p-3 pr-12 rounded-lg bg-background-dark border ${
                                errors.password ? 'border-red-500' : 'border-surface-border'
                              } text-white focus:border-brand-500 focus:outline-none`}
                              placeholder="Mínimo 6 caracteres"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                            >
                              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={proceedToPayment}
                      className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3"
                    >
                      Continuar al Pago
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <div className="bg-background-dark-muted rounded-2xl p-8 border border-surface-border">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                    <CreditCard className="text-brand-400" />
                    <span>Método de Pago</span>
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border-2 border-brand-500 rounded-xl p-4 bg-brand-500/10">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="text-brand-400" size={24} />
                          <span className="font-medium text-white">Tarjeta de Crédito/Débito</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Visa, Mastercard, American Express</p>
                      </div>
                      <div className="border border-surface-border rounded-xl p-4 bg-surface-glass opacity-50">
                        <div className="flex items-center space-x-3">
                          <Smartphone className="text-gray-400" size={24} />
                          <span className="font-medium text-gray-400">Pago Móvil</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Próximamente</p>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Número de Tarjeta *
                        </label>
                        <input
                          type="text"
                          value={paymentForm.cardNumber}
                          onChange={(e) => setPaymentForm({...paymentForm, cardNumber: formatCardNumber(e.target.value)})}
                          maxLength={19}
                          className={`w-full p-3 rounded-lg bg-background-dark border ${
                            errors.cardNumber ? 'border-red-500' : 'border-surface-border'
                          } text-white focus:border-brand-500 focus:outline-none font-mono`}
                          placeholder="1234 5678 9012 3456"
                        />
                        {errors.cardNumber && (
                          <p className="text-red-400 text-sm mt-1">{errors.cardNumber}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            MM/AA *
                          </label>
                          <input
                            type="text"
                            value={paymentForm.expiryDate}
                            onChange={(e) => setPaymentForm({...paymentForm, expiryDate: formatExpiryDate(e.target.value)})}
                            maxLength={5}
                            className={`w-full p-3 rounded-lg bg-background-dark border ${
                              errors.expiryDate ? 'border-red-500' : 'border-surface-border'
                            } text-white focus:border-brand-500 focus:outline-none font-mono`}
                            placeholder="12/25"
                          />
                          {errors.expiryDate && (
                            <p className="text-red-400 text-sm mt-1">{errors.expiryDate}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            CVV *
                          </label>
                          <input
                            type="text"
                            value={paymentForm.cvv}
                            onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value.replace(/\D/g, '')})}
                            maxLength={3}
                            className={`w-full p-3 rounded-lg bg-background-dark border ${
                              errors.cvv ? 'border-red-500' : 'border-surface-border'
                            } text-white focus:border-brand-500 focus:outline-none font-mono`}
                            placeholder="123"
                          />
                          {errors.cvv && (
                            <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nombre del Titular *
                        </label>
                        <input
                          type="text"
                          value={paymentForm.cardholderName}
                          onChange={(e) => setPaymentForm({...paymentForm, cardholderName: e.target.value.toUpperCase()})}
                          className={`w-full p-3 rounded-lg bg-background-dark border ${
                            errors.cardholderName ? 'border-red-500' : 'border-surface-border'
                          } text-white focus:border-brand-500 focus:outline-none uppercase`}
                          placeholder="COMO APARECE EN LA TARJETA"
                        />
                        {errors.cardholderName && (
                          <p className="text-red-400 text-sm mt-1">{errors.cardholderName}</p>
                        )}
                      </div>
                    </div>

                    {/* Security Notice */}
                    <div className="bg-surface-glass rounded-xl p-4 border border-surface-border">
                      <div className="flex items-start space-x-3">
                        <Shield className="text-green-400 mt-0.5" size={20} />
                        <div>
                          <p className="text-sm font-medium text-green-400">Pago 100% Seguro</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Tus datos están protegidos con encriptación SSL de 256 bits. 
                            No almacenamos información de tarjetas de crédito.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="flex-1"
                      >
                        Volver
                      </Button>
                      <Button
                        onClick={processPayment}
                        disabled={isLoading}
                        className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3"
                      >
                        {isLoading ? 'Procesando...' : `Pagar RD$${finalTotal.toLocaleString()}`}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-background-dark-muted rounded-2xl p-6 border border-surface-border">
                  <h3 className="text-xl font-bold text-white mb-6">Resumen del Pedido</h3>
                  
                  {/* Event Info */}
                  <div className="mb-6 pb-6 border-b border-surface-border">
                    <img 
                      src={checkoutData.event.image} 
                      alt={checkoutData.event.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="font-semibold text-white">{checkoutData.event.name}</h4>
                    <p className="text-sm text-gray-400">{checkoutData.event.date} • {checkoutData.event.time}</p>
                    <p className="text-sm text-gray-400">{checkoutData.event.location}</p>
                  </div>

                  {/* Tickets */}
                  <div className="space-y-3 mb-6">
                    {checkoutData.tickets.map(({ ticketId, quantity }) => {
                      const ticket = checkoutData.event.ticketTypes.find((t: any) => t.id === ticketId)
                      return (
                        <div key={ticketId} className="flex justify-between text-sm">
                          <span className="text-gray-300">
                            {quantity}x {ticket?.name}
                          </span>
                          <span className="text-white font-medium">
                            RD${(ticket?.price * quantity).toLocaleString()}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2 mb-6 pb-6 border-b border-surface-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">RD${checkoutData.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Comisión de servicio</span>
                      <span className="text-white">RD${serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-brand-400">RD${finalTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Trust indicators */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <Shield size={12} />
                        <span>SSL Seguro</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle size={12} />
                        <span>Verificado</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Lock size={12} />
                        <span>Encriptado</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Al completar la compra aceptas nuestros términos y condiciones
                    </p>
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