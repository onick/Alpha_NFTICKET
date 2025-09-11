'use client'

import { Button } from '@nfticket/ui'
import { Calendar, MapPin, DollarSign, Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'

const featuredEvents = [
  {
    id: 1,
    title: 'Festival de Música 2024',
    description: 'El evento musical más grande del año. Artistas internacionales, tecnología blockchain y una experiencia única con tickets NFT.',
    date: '15 Diciembre, 2024',
    location: 'Estadio Nacional',
    price: 'Desde $50',
    image: 'https://picsum.photos/seed/festival1/1920/1080',
    category: 'Música'
  },
  {
    id: 2,
    title: 'Cumbre Web3 Global',
    description: 'La conferencia más importante de tecnología blockchain. Speakers de talla mundial y networking exclusivo.',
    date: '20 Enero, 2025',
    location: 'Centro de Convenciones',
    price: 'Desde $150',
    image: 'https://picsum.photos/seed/web3summit/1920/1080',
    category: 'Tecnología'
  },
  {
    id: 3,
    title: 'Final Copa Mundial',
    description: 'La final más esperada del año. Vive la emoción del fútbol con la mejor experiencia NFT.',
    date: '5 Febrero, 2025',
    location: 'Estadio Olímpico',
    price: 'Desde $75',
    image: 'https://picsum.photos/seed/worldcup/1920/1080',
    category: 'Deportes'
  }
]

export function EventsHero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index)
  }, [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setCurrentIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    // Auto-scroll every 5 seconds
    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, 5000)

    return () => {
      clearInterval(interval)
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  const currentEvent = featuredEvents[currentIndex]

  return (
    <section className="relative h-[80vh] overflow-hidden">
      {/* Carousel */}
      <div className="embla" ref={emblaRef}>
        <div className="embla__container flex">
          {featuredEvents.map((event) => (
            <div key={event.id} className="embla__slide relative w-full h-[80vh] flex-shrink-0">
              {/* Background Image */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10"></div>
                <img 
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-20">
        <div className="container h-full flex items-center">
          <div className="max-w-2xl">
            {/* Category Badge */}
            <div className="inline-flex items-center space-x-2 bg-brand-500/90 backdrop-blur-sm rounded-lg px-4 py-2 mb-6">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              <span className="text-sm text-white font-medium">{currentEvent.category}</span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {currentEvent.title}
            </h1>
            
            {/* Description */}
            <p className="text-xl text-gray-200 mb-8 max-w-xl leading-relaxed">
              {currentEvent.description}
            </p>

            {/* Event Info */}
            <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-300">
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-brand-500" />
                <span>{currentEvent.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} className="text-brand-500" />
                <span>{currentEvent.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign size={16} className="text-green-400" />
                <span>{currentEvent.price}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 text-lg font-semibold flex items-center space-x-2">
                <Play size={20} fill="currentColor" />
                <span>Comprar Tickets</span>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg flex items-center space-x-2"
              >
                <Info size={18} />
                <span>Más Información</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-4 flex items-center z-30">
        <button
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className="w-12 h-12 bg-black/50 hover:bg-black/70 disabled:opacity-30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
      </div>
      
      <div className="absolute inset-y-0 right-4 flex items-center z-30">
        <button
          onClick={scrollNext}
          disabled={!canScrollNext}
          className="w-12 h-12 bg-black/50 hover:bg-black/70 disabled:opacity-30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex space-x-2">
          {featuredEvents.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 z-30">
        <div 
          className="h-full bg-brand-500 transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / featuredEvents.length) * 100}%` }}
        />
      </div>
    </section>
  )
}