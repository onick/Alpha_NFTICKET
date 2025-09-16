'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { PostVisibility } from '@nfticket/feed'

interface PostComposerProps {
  onPost?: (postData: any) => Promise<void>
  currentUser?: {
    name: string
    username: string
    avatar_url: string
  }
}

export function PostComposer({ onPost, currentUser }: PostComposerProps) {
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const defaultUser = {
    name: 'Usuario Demo',
    username: 'usuario_demo',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
  }

  const user = currentUser || defaultUser

  const handleSubmit = async () => {
    if (!text.trim()) return

    setIsLoading(true)
    
    try {
      const postData = {
        text: text.trim(),
        visibility: 'public' as PostVisibility,
        hashtags: [],
        location: ''
      }

      await onPost?.(postData)
      setText('')
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const canPost = text.trim() && !isLoading

  return (
    <Card className="w-full mb-6 discord-card">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={user.avatar_url} 
              alt={user.name}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
              }}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <textarea
              placeholder="¿Qué está pasando?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full min-h-[100px] resize-none border-0 bg-transparent text-white placeholder:text-gray-500 focus:outline-none"
              maxLength={280}
            />

            <div className="flex items-center justify-between pt-2 border-t border-gray-600">
              <span className="text-xs text-gray-500">
                {text.length}/280
              </span>
              <Button
                onClick={handleSubmit}
                disabled={!canPost}
                className="px-6"
              >
                {isLoading ? 'Publicando...' : 'Publicar'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}