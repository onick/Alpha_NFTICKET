'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Globe, 
  Users, 
  Lock, 
  Image, 
  MapPin, 
  Hash, 
  ShoppingBag, 
  X,
  Loader2
} from 'lucide-react'
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
  const [visibility, setVisibility] = useState<PostVisibility>('public')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [currentHashtag, setCurrentHashtag] = useState('')
  const [isPurchasePost, setIsPurchasePost] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Purchase-specific fields
  const [eventName, setEventName] = useState('')
  const [ticketType, setTicketType] = useState('')
  const [ticketPrice, setTicketPrice] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventLocation, setEventLocation] = useState('')

  const defaultUser = {
    name: 'Usuario Demo',
    username: 'usuario_demo',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
  }

  const user = currentUser || defaultUser

  const getVisibilityIcon = (vis: PostVisibility) => {
    switch (vis) {
      case 'public': return <Globe className="h-4 w-4" />
      case 'followers': return <Users className="h-4 w-4" />
      case 'private': return <Lock className="h-4 w-4" />
    }
  }

  const getVisibilityLabel = (vis: PostVisibility) => {
    switch (vis) {
      case 'public': return 'Público'
      case 'followers': return 'Seguidores'
      case 'private': return 'Privado'
    }
  }

  const addHashtag = () => {
    if (currentHashtag.trim() && !hashtags.includes(currentHashtag.trim())) {
      setHashtags([...hashtags, currentHashtag.trim()])
      setCurrentHashtag('')
    }
  }

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentHashtag.trim()) {
      e.preventDefault()
      addHashtag()
    }
  }

  const resetForm = () => {
    setText('')
    setHashtags([])
    setLocation('')
    setCurrentHashtag('')
    setIsPurchasePost(false)
    setEventName('')
    setTicketType('')
    setTicketPrice('')
    setEventDate('')
    setEventLocation('')
  }

  const handleSubmit = async () => {
    if (!text.trim() && !isPurchasePost) return
    if (isPurchasePost && !eventName.trim()) return

    setIsLoading(true)
    
    try {
      const postData: any = {
        text: text.trim(),
        visibility,
        hashtags,
        location: location.trim() || undefined
      }

      if (isPurchasePost) {
        postData.type = 'purchase'
        postData.event_name = eventName.trim()
        postData.ticket_type = ticketType.trim() || undefined
        postData.ticket_price = ticketPrice ? parseFloat(ticketPrice) : undefined
        postData.event_date = eventDate || undefined
        postData.event_location = eventLocation.trim() || undefined
      }

      await onPost?.(postData)
      resetForm()
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const canPost = (text.trim() || (isPurchasePost && eventName.trim())) && !isLoading

  return (
    <Card className="w-full mb-6 discord-card">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={user.avatar_url} 
              alt={user.name}
              onError={(e) => {
                // Si falla la imagen, usar la imagen por defecto
                const target = e.target as HTMLImageElement
                target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
              }}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            {/* Purchase Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="purchase-mode"
                checked={isPurchasePost}
                onCheckedChange={setIsPurchasePost}
              />
              <Label htmlFor="purchase-mode" className="flex items-center space-x-1">
                <ShoppingBag className="h-4 w-4" />
                <span>Compartir compra de ticket</span>
              </Label>
            </div>

            {/* Purchase Fields */}
            {isPurchasePost && (
              <div className="bg-green-50 p-4 rounded-lg space-y-3">
                <h3 className="font-medium text-green-800 flex items-center space-x-1">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Detalles de la Compra</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre del evento *"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="p-2 border rounded-md text-sm"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Tipo de ticket"
                    value={ticketType}
                    onChange={(e) => setTicketType(e.target.value)}
                    className="p-2 border rounded-md text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Precio (RD$)"
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(e.target.value)}
                    className="p-2 border rounded-md text-sm"
                  />
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="p-2 border rounded-md text-sm"
                  />
                </div>
                
                <input
                  type="text"
                  placeholder="Ubicación del evento"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
            )}

            {/* Main Text Area */}
            <Textarea
              placeholder={isPurchasePost ? "¿Cómo fue tu experiencia? (opcional)" : "¿Qué está pasando?"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px] resize-none border-0 text-lg placeholder:text-gray-500"
              maxLength={280}
            />

            {/* Hashtags */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Agregar hashtag"
                  value={currentHashtag}
                  onChange={(e) => setCurrentHashtag(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 p-2 border rounded-md text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addHashtag}
                  disabled={!currentHashtag.trim()}
                >
                  <Hash className="h-4 w-4" />
                </Button>
              </div>
              
              {hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {hashtags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-blue-600">
                      #{tag}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeHashtag(tag)}
                        className="ml-1 h-auto p-0 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Agregar ubicación"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 p-2 border rounded-md text-sm"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="text-gray-500">
                  <Image className="h-4 w-4" />
                </Button>
                
                <Select value={visibility} onValueChange={(value: PostVisibility) => setVisibility(value)}>
                  <SelectTrigger className="w-auto border-0 bg-transparent">
                    <SelectValue>
                      <div className="flex items-center space-x-1 text-sm">
                        {getVisibilityIcon(visibility)}
                        <span>{getVisibilityLabel(visibility)}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span>Público</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="followers">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Seguidores</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Solo yo</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {text.length}/280
                </span>
                <Button
                  onClick={handleSubmit}
                  disabled={!canPost}
                  className="px-6"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Publicar'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}