'use client'

import { useI18n } from '@nfticket/i18n'

export function RightRail() {
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      {/* Trending Communities Card */}
      <div className="card-right-rail">
        <h3 className="font-semibold text-gray-900 mb-4">Trending Communities</h3>
        <div className="space-y-3">
          {['Tech Events', 'Music Lovers', 'Sports Fans'].map((community) => (
            <div key={community} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">{community}</span>
              </div>
              <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Join
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Events Card */}
      <div className="card-right-rail">
        <h3 className="font-semibold text-gray-900 mb-4">Suggested Events</h3>
        <div className="space-y-4">
          {[
            { name: 'Web3 Summit 2024', date: 'Dec 15', price: '$150' },
            { name: 'Rock Festival', date: 'Jan 20', price: '$75' },
          ].map((event) => (
            <div key={event.name} className="border-l-4 border-primary-500 pl-3">
              <h4 className="font-medium text-gray-900 text-sm">{event.name}</h4>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">{event.date}</span>
                <span className="text-xs font-medium text-primary-600">{event.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats Card */}
      <div className="card-right-rail">
        <h3 className="font-semibold text-gray-900 mb-4">Your Activity</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">12</div>
            <div className="text-xs text-gray-500">Events Attended</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-xs text-gray-500">NFTs Owned</div>
          </div>
        </div>
      </div>
    </div>
  )
}