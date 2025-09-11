'use client'

import { useI18n } from '@nfticket/i18n'
import { useEffect, useState } from 'react'
import { FeedRanker, UserSignals, FeedItem } from '@nfticket/api'

export function FeedContainer() {
  const { t } = useI18n()
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate feed loading with personalized ranking
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
          metadata: { eventName: 'Rock Concert', price: 50 }
        },
        {
          id: '2',
          type: 'social',
          score: 0,
          userId: 'user2',
          categories: ['tech'],
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          metadata: { content: 'Great tech conference coming up!' }
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
        <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
        <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
        <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('feed.recent')}</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-primary-100 text-primary-600 rounded-full">
            {t('feed.recent')}
          </button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-full">
            {t('feed.popular')}
          </button>
        </div>
      </div>

      {feedItems.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t('feed.noResults')}
        </div>
      ) : (
        <div className="space-y-4">
          {feedItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.type === 'purchase' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-500">Score: {item.score.toFixed(2)}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {item.type === 'purchase' 
                      ? item.metadata.eventName 
                      : 'Social Post'
                    }
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.type === 'purchase' 
                      ? `Price: $${item.metadata.price}` 
                      : item.metadata.content
                    }
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    {item.categories.map((cat) => (
                      <span key={cat} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
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