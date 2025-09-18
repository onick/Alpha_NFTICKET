'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, MessageCircle, Heart, UserPlus, Calendar, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSocket } from '@/hooks/useSocket'

interface Notification {
  id: string
  type: 'comment' | 'like' | 'mention' | 'follow' | 'event' | 'group' | 'ticket'
  title: string
  message: string
  avatar?: string
  user?: {
    id: string
    name: string
    username: string
    avatar_url?: string
  }
  event?: {
    id: string
    name: string
  }
  group?: {
    id: string
    name: string
  }
  read: boolean
  created_at: string
  action_url?: string
}

export function NotificationsCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Socket.IO for real-time notifications
  const { on, off, isConnected } = useSocket()
  
  // Ref for dropdown to handle outside clicks
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load notifications on mount
  useEffect(() => {
    loadNotifications()
  }, [])

  // Real-time notifications via Socket.IO
  useEffect(() => {
    if (!isConnected) return

    const handleNewNotification = (notification: Notification) => {
      console.log('📨 New notification received:', notification)
      
      // Add to notifications list
      setNotifications(prev => [notification, ...prev])
      
      // Update unread count
      setUnreadCount(prev => prev + 1)
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: notification.user?.avatar_url || '/icons/nfticket-icon.png',
          badge: '/icons/nfticket-badge.png'
        })
      }
    }

    on('new_notification', handleNewNotification)

    return () => {
      off('new_notification', handleNewNotification)
    }
  }, [isConnected, on, off])

  // Request notification permission on first interaction
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/notifications')
      
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unread_count)
      } else {
        // Fallback to mock notifications
        setNotifications(getMockNotifications())
        setUnreadCount(3)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      // Fallback to mock notifications
      setNotifications(getMockNotifications())
      setUnreadCount(3)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH'
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'like': return <Heart className="h-4 w-4 text-red-500" />
      case 'mention': return <MessageCircle className="h-4 w-4 text-purple-500" />
      case 'follow': return <UserPlus className="h-4 w-4 text-green-500" />
      case 'event': return <Calendar className="h-4 w-4 text-orange-500" />
      case 'group': return <Users className="h-4 w-4 text-indigo-500" />
      case 'ticket': return <Calendar className="h-4 w-4 text-yellow-500" />
      default: return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'ahora'
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-96 z-50">
          <Card className="bg-[#1e1f22] border-[#404249] shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-white">Notificaciones</CardTitle>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      <Check className="h-3 w-3 mr-1" />
                      Marcar todas
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-gray-400">
                  Cargando notificaciones...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-400">
                  No tienes notificaciones
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 hover:bg-[#2b2d31] transition-colors cursor-pointer border-l-2 ${
                        notification.read 
                          ? 'border-transparent opacity-60' 
                          : 'border-blue-500'
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id)
                        }
                        if (notification.action_url) {
                          window.location.href = notification.action_url
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {notification.user?.avatar_url ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={notification.user.avatar_url} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                                {notification.user.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-[#404249] flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.created_at)}
                            </span>
                            {!notification.read && (
                              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Mock notifications for fallback
function getMockNotifications(): Notification[] {
  return [
    {
      id: '1',
      type: 'comment',
      title: 'Nuevo comentario',
      message: 'María comentó en tu post sobre el evento de Bad Bunny',
      user: {
        id: 'user1',
        name: 'María González',
        username: 'mariag',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b5ab?w=32&h=32&fit=crop&crop=face'
      },
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      action_url: '/feed'
    },
    {
      id: '2',
      type: 'group',
      title: 'Nuevo grupo de evento',
      message: 'Te agregaron al grupo "Bad Bunny VIP Experience"',
      event: {
        id: 'event1',
        name: 'Bad Bunny - World\'s Hottest Tour'
      },
      read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      action_url: '/groups/event1'
    },
    {
      id: '3',
      type: 'ticket',
      title: 'Ticket verificado',
      message: 'Tu ticket para Bad Bunny ha sido verificado por el organizador',
      read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      action_url: '/tickets'
    }
  ]
}