'use client'

import { useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, MapPin, Smile, X } from 'lucide-react'
import { PostVisibility } from '@nfticket/feed'
import { compressImage, getImageSizeInfo } from '@/lib/image-utils'

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
  const [images, setImages] = useState<string[]>([])
  const [isCompressing, setIsCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultUser = {
    name: 'Usuario Demo',
    username: 'usuario_demo',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
  }

  const user = currentUser || defaultUser

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsCompressing(true)

    try {
      const compressedImages = await Promise.all(
        Array.from(files).map(async (file) => {
          if (file.type.startsWith('image/')) {
            return await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.8 })
          }
          return null
        })
      )

      const validImages = compressedImages.filter(Boolean) as string[]
      setImages(prev => [...prev, ...validImages].slice(0, 4)) // Max 4 images
    } catch (error) {
      console.error('Error compressing images:', error)
    } finally {
      setIsCompressing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!text.trim() && images.length === 0) return

    setIsLoading(true)
    
    try {
      const postData = {
        text: text.trim(),
        visibility: 'public' as PostVisibility,
        hashtags: [],
        location: '',
        images: images.length > 0 ? images : undefined
      }

      await onPost?.(postData)
      setText('')
      setImages([])
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const canPost = (text.trim() || images.length > 0) && !isLoading

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

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 h-6 w-6 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            <div className="flex items-center justify-between pt-2 border-t border-gray-600">
              <div className="flex items-center space-x-1">
                {/* Iconos de funcionalidades */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing || images.length >= 4}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                  onClick={() => {/* TODO: Implementar selector de ubicación */}}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
                  onClick={() => {/* TODO: Implementar selector de emojis */}}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {isCompressing && (
                    <span className="text-xs text-blue-400">
                      Comprimiendo imágenes...
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {text.length}/280
                  </span>
                  {images.length > 0 && (
                    <span className="text-xs text-blue-400">
                      {images.length}/4 imagen{images.length !== 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!canPost || isCompressing}
                  className="px-6"
                >
                  {isLoading ? 'Publicando...' : 'Publicar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}