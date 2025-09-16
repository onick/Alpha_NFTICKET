'use client'

import { useState, useEffect } from 'react'
import { X, Camera, Save, Loader2 } from 'lucide-react'
import { Button } from '@nfticket/ui'
import { compressImage, getImageSizeInfo } from '@/lib/image-utils'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  initialData: {
    name: string
    email: string
    avatar: string
    banner?: string
    bio?: string
    location?: string
    website?: string
  }
}

export function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    website: '',
    avatar: '',
    banner: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [bannerPreview, setBannerPreview] = useState('')
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionError, setCompressionError] = useState('')

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name || '',
        bio: initialData.bio || '',
        location: initialData.location || '',
        website: initialData.website || '',
        avatar: initialData.avatar || '',
        banner: initialData.banner || ''
      })
      setAvatarPreview(initialData.avatar || '')
      setBannerPreview(initialData.banner || '')
    }
  }, [isOpen, initialData])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsCompressing(true)
      setCompressionError('')
      
      try {
        const compressedImage = await compressImage(file, {
          maxWidth: 400,
          maxHeight: 400,
          quality: 0.8
        })
        
        const sizeInfo = getImageSizeInfo(compressedImage)
        console.log('🖼️ Avatar compressed:', sizeInfo.formatted)
        
        setAvatarPreview(compressedImage)
        setFormData(prev => ({
          ...prev,
          avatar: compressedImage
        }))
      } catch (error) {
        console.error('Avatar compression failed:', error)
        setCompressionError('Error comprimiendo imagen de perfil')
      } finally {
        setIsCompressing(false)
      }
    }
  }

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsCompressing(true)
      setCompressionError('')
      
      try {
        const compressedImage = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 400,
          quality: 0.8
        })
        
        const sizeInfo = getImageSizeInfo(compressedImage)
        console.log('🖼️ Banner compressed:', sizeInfo.formatted)
        
        setBannerPreview(compressedImage)
        setFormData(prev => ({
          ...prev,
          banner: compressedImage
        }))
      } catch (error) {
        console.error('Banner compression failed:', error)
        setCompressionError('Error comprimiendo imagen de portada')
      } finally {
        setIsCompressing(false)
      }
    }
  }

  const handleSave = async () => {
    if (isCompressing) {
      return // Don't save while compressing
    }

    setIsSaving(true)
    setCompressionError('')
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
      if (error instanceof Error && error.message.includes('QuotaExceededError')) {
        setCompressionError('Error: Espacio de almacenamiento insuficiente. Las imágenes son muy grandes.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    if (!isSaving) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-[#313338] rounded-2xl border border-[#404249] shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#404249]">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-white">Editar Perfil</h2>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving || isCompressing || !formData.name.trim()}
            className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Guardando...</span>
              </>
            ) : isCompressing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Comprimiendo...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Guardar</span>
              </>
            )}
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Error Message */}
          {compressionError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{compressionError}</p>
            </div>
          )}
          
          <div className="space-y-8">
            {/* Banner and Avatar Section */}
            <div className="relative">
              {/* Banner */}
              <div className="h-48 bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl relative overflow-hidden">
                {bannerPreview && (
                  <img 
                    src={bannerPreview} 
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 right-4">
                  <label className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors cursor-pointer">
                    <Camera size={18} />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Avatar */}
              <div className="absolute -bottom-12 left-6">
                <div className="relative">
                  <img 
                    src={avatarPreview || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'} 
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border-4 border-[#313338] object-cover"
                  />
                  <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-500 hover:bg-brand-600 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                    <Camera size={14} className="text-white" />
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="pt-14 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-[#404249] rounded-lg text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none transition-colors"
                  placeholder="Tu nombre completo"
                  maxLength={50}
                />
                <div className="mt-1 text-xs text-gray-400 text-right">
                  {formData.name.length}/50
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Biografía
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-[#404249] rounded-lg text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none transition-colors resize-none"
                  placeholder="Cuéntanos sobre ti..."
                  maxLength={160}
                />
                <div className="mt-1 text-xs text-gray-400 text-right">
                  {formData.bio.length}/160
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-[#404249] rounded-lg text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none transition-colors"
                  placeholder="Ej: Santo Domingo, República Dominicana"
                  maxLength={30}
                />
                <div className="mt-1 text-xs text-gray-400 text-right">
                  {formData.location.length}/30
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sitio web
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-4 py-3 bg-[#2b2d31] border border-[#404249] rounded-lg text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none transition-colors"
                  placeholder="https://tusitio.com"
                  maxLength={100}
                />
                <div className="mt-1 text-xs text-gray-400 text-right">
                  {formData.website.length}/100
                </div>
              </div>
            </div>

            {/* Preview Section */}
            <div className="border-t border-[#404249] pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Vista Previa</h3>
              <div className="bg-[#2b2d31] rounded-lg p-4 border border-[#404249]">
                <div className="flex items-start space-x-4">
                  <img 
                    src={avatarPreview || initialData.avatar} 
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">
                      {formData.name || 'Tu nombre'}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      @{(formData.name || 'usuario').toLowerCase().replace(/\s+/g, '')}
                    </p>
                    {formData.bio && (
                      <p className="text-white mt-2 text-sm">
                        {formData.bio}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                      {formData.location && (
                        <span>📍 {formData.location}</span>
                      )}
                      {formData.website && (
                        <span>🔗 {formData.website}</span>
                      )}
                    </div>
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