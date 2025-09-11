'use client'

import { Button } from '@nfticket/ui'

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 px-6" style={{background: 'linear-gradient(135deg, #0B0B12 0%, #0F0F18 50%, #1A215F 100%)'}}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-brand-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-brand-600 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-brand-400 rounded-full blur-2xl"></div>
      </div>

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-brand-500 font-medium">NFTicket está en vivo</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Eventos únicos,
              <span className="text-transparent bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text">
                {' '}Tickets NFT
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-xl">
              Descubre, compra y revende tickets de eventos como NFTs únicos. 
              Autenticidad garantizada en blockchain con beneficios exclusivos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 text-lg">
                🎫 Explorar Eventos
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-[#404249] text-gray-300 hover:bg-[#404249] hover:text-white px-8 py-4 text-lg"
              >
                🚀 Crear Evento
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-[#404249]">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-sm text-gray-400">Eventos Activos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="text-sm text-gray-400">NFTs Vendidos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">25K+</div>
                <div className="text-sm text-gray-400">Usuarios</div>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="relative z-10 bg-gradient-to-br from-background-dark-muted to-background-dark rounded-2xl border border-surface-border p-8 shadow-nft-dark">
              {/* Mock NFT Ticket */}
              <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between text-white mb-4">
                  <span className="text-sm font-medium">NFTicket #1234</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">VIP</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Festival de Música 2024</h3>
                <div className="flex items-center justify-between text-white/80 text-sm">
                  <span>📅 15 Dic, 2024</span>
                  <span>📍 Estadio Nacional</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400">✓</span>
                  </div>
                  <span className="text-gray-300">Verificación en blockchain</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-400/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400">🔄</span>
                  </div>
                  <span className="text-gray-300">Transferencia segura</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400">⭐</span>
                  </div>
                  <span className="text-gray-300">Beneficios exclusivos</span>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-500/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-400/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-20 text-[#1e1f26]" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>
    </section>
  )
}