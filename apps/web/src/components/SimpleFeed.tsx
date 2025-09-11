'use client'

import { useState, useEffect } from 'react'
import { FeedRanker, UserSignals, FeedItem } from '@nfticket/api'

export function SimpleFeed() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeed = async () => {
      const mockUserSignals: UserSignals = {
        likesOnPurchases: 15,
        likesOnSocial: 8,
        dwellOnPurchases: 120,
        categoriesFav: ['music', 'sports', 'tech'],
      }

      const mockItems: FeedItem[] = [
        {
          id: '1',
          type: 'purchase',
          score: 0,
          userId: 'user1',
          eventId: 'event1',
          categories: ['music'],
          timestamp: new Date(),
          metadata: { eventName: 'Concierto de Rock', price: 50 }
        },
        {
          id: '2',
          type: 'social',
          score: 0,
          userId: 'user2',
          categories: ['tech'],
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          metadata: { content: '¡Gran conferencia tech próximamente!' }
        },
        {
          id: '3',
          type: 'purchase',
          score: 0,
          userId: 'user3',
          eventId: 'event2',
          categories: ['sports'],
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          metadata: { eventName: 'Partido de Fútbol', price: 25 }
        }
      ]

      const ranker = new FeedRanker()
      const weights = ranker.calculateWeights(mockUserSignals)
      const rankedItems = ranker.rankFeedItems(mockItems, mockUserSignals, weights)

      setFeedItems(rankedItems)
      setLoading(false)
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
                      ? item.metadata.eventName 
                      : 'Post Social'
                    }
                  </h3>
                  <p className="text-text-muted text-sm">
                    {item.type === 'purchase' 
                      ? `Precio: $${item.metadata.price}` 
                      : item.metadata.content
                    }
                  </p>
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