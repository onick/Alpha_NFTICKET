'use client'

import { useState, useEffect } from 'react'
import { FeedRanker, UserSignals, FeedItem } from '@nfticket/api'
import { getEcosystemManager } from '@/lib/ecosystem-integration'

export function SimpleFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeed = async () => {
      if (typeof window === 'undefined') return

      try {
        const manager = getEcosystemManager()
        if (!manager) {
          setLoading(false)
          return
        }

        // Obtener datos reales del ecosistema
        const events = manager.getPublishedEvents()
        const allPurchases = events.flatMap(event => manager.getPurchasesByEvent(event.id))
        
        const mockUserSignals: UserSignals = {
          likesOnPurchases: 15,
          likesOnSocial: 8,
          dwellOnPurchases: 120,
          categoriesFav: ['music', 'sports', 'tech'],
        }

        // Crear items de feed basados en datos reales
        const feedItems: FeedItem[] = []
        
        // Agregar eventos recientes como posts sociales
        events.slice(0, 3).forEach((event, index) => {
          feedItems.push({
            id: `event_${event.id}`,
            type: 'social',
            score: 0,
            userId: event.organizerId,
            eventId: event.id,
            categories: [event.category.toLowerCase()],
            timestamp: new Date(event.createdAt),
            metadata: { 
              content: `🎉 Nuevo evento disponible: ${event.name}`,
              eventName: event.name,
              organizerName: `Organizador ${event.organizerId.slice(-4)}`
            }
          })
        })

        // Agregar compras recientes
        allPurchases.slice(0, 5).forEach((purchase, index) => {
          const event = events.find(e => e.id === purchase.eventId)
          if (event) {
            feedItems.push({
              id: `purchase_${purchase.id}`,
              type: 'purchase',
              score: 0,
              userId: purchase.userId,
              eventId: purchase.eventId,
              categories: [event.category.toLowerCase()],
              timestamp: new Date(purchase.createdAt),
              metadata: { 
                eventName: event.name,
                price: purchase.total,
                userName: `${purchase.userInfo.firstName} ${purchase.userInfo.lastName}`
              }
            })
          }
        })

        // Si no hay datos reales, mostrar algunos ejemplos
        if (feedItems.length === 0) {
          feedItems.push(
            {
              id: 'welcome',
              type: 'social',
              score: 0.9,
              userId: 'system',
              categories: ['general'],
              timestamp: new Date(),
              metadata: { 
                content: '👋 ¡Bienvenido a NFTicket! Aquí verás la actividad de eventos y compras.',
                organizerName: 'NFTicket'
              }
            },
            {
              id: 'tip',
              type: 'social',
              score: 0.8,
              userId: 'system',
              categories: ['general'],
              timestamp: new Date(Date.now() - 1000 * 60 * 30),
              metadata: { 
                content: '💡 Tip: Visita /test-ecosystem para generar datos de prueba y ver el feed en acción.',
                organizerName: 'NFTicket'
              }
            }
          )
        }

        const ranker = new FeedRanker()
        const weights = ranker.calculateWeights(mockUserSignals)
        const rankedItems = ranker.rankFeedItems(feedItems, mockUserSignals, weights)

        setFeedItems(rankedItems)
        setLoading(false)
      } catch (error) {
        console.error('Error loading feed:', error)
        setLoading(false)
      }
    }

    loadFeed()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-[#2b2d31] rounded-lg h-32"></div>
        <div className="animate-pulse bg-[#2b2d31] rounded-lg h-32"></div>
        <div className="animate-pulse bg-[#2b2d31] rounded-lg h-32"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Feed Personalizado NFTicket</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors duration-200">
            Reciente
          </button>
          <button className="px-3 py-1 text-sm text-text-muted hover:bg-surface-glass hover:text-white rounded-lg transition-colors duration-200">
            Popular
          </button>
        </div>
      </div>

      {feedItems.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          No hay contenido disponible
        </div>
      ) : (
        <div className="space-y-4">
          {feedItems.map((item) => (
            <div key={item.id} className={`rounded-lg p-4 border transition-colors duration-200 ${
              item.type === 'purchase' 
                ? 'discord-purchase-card' 
                : 'discord-card'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-lg ${
                      item.type === 'purchase' 
                        ? 'bg-brand-900/50 text-brand-300' 
                        : 'bg-surface-glass text-brand-400'
                    }`}>
                      {item.type === 'purchase' ? 'Compra' : 'Social'}
                    </span>
                    <span className="text-xs text-text-muted">Score: {item.score.toFixed(2)}</span>
                  </div>
                  <h3 className="font-medium text-white mb-1">
                    {item.type === 'purchase' 
                      ? `${item.metadata.userName} compró tickets`
                      : item.metadata.organizerName || 'Post Social'
                    }
                  </h3>
                  <p className="text-text-muted text-sm mb-2">
                    {item.type === 'purchase' 
                      ? `📍 ${item.metadata.eventName} • RD$${item.metadata.price?.toLocaleString()}`
                      : item.metadata.content
                    }
                  </p>
                  {item.type === 'purchase' && (
                    <div className="flex items-center space-x-2 text-xs text-brand-400">
                      <span>🎫 Tickets NFT adquiridos</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 mt-3">
                    {item.categories.map((cat) => (
                      <span key={cat} className="text-xs bg-surface-glass text-text-muted px-2 py-1 rounded-lg">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}