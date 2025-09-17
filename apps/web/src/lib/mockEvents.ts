// Mock Events Data para desarrollo sin Supabase
import { type Event } from '@nfticket/api'

export const MOCK_EVENTS: Event[] = [
  {
    id: 'event-001',
    organizer_id: 'organizer-001',
    title: 'Bad Bunny - Un Verano Sin Ti Tour 2024',
    description: 'El conejo malo llega a República Dominicana con su tour más esperado del año. Una noche inolvidable de reggaetón y música urbana.',
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    category: 'Música',
    start_date: '2024-12-15T20:00:00.000Z',
    end_date: '2024-12-15T23:30:00.000Z',
    venue_name: 'Estadio Olímpico Félix Sánchez',
    venue_address: 'Av. John F. Kennedy, Santo Domingo',
    created_at: '2024-09-01T10:00:00.000Z',
    organizer: {
      id: 'organizer-001',
      username: 'rimas_entertainment',
      full_name: 'Rimas Entertainment',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      created_at: '2024-08-01T10:00:00.000Z'
    },
    ticket_types: [
      {
        id: 'ticket-001-vip',
        event_id: 'event-001',
        name: 'VIP Experience',
        price: 15000,
        quantity_available: 50,
        created_at: '2024-09-01T10:00:00.000Z'
      },
      {
        id: 'ticket-001-general',
        event_id: 'event-001', 
        name: 'Entrada General',
        price: 3500,
        quantity_available: 25000,
        created_at: '2024-09-01T10:00:00.000Z'
      }
    ]
  },
  {
    id: 'event-002',
    organizer_id: 'organizer-002',
    title: 'Conferencia Tech RD 2024',
    description: 'La conferencia de tecnología más importante del Caribe. Speakers internacionales, networking y las últimas tendencias en IA, blockchain y desarrollo.',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    category: 'Tecnología',
    start_date: '2024-11-20T09:00:00.000Z',
    end_date: '2024-11-20T18:00:00.000Z',
    venue_name: 'Hotel Catalonia Santo Domingo',
    venue_address: 'Av. George Washington, Malecón',
    created_at: '2024-08-15T14:00:00.000Z',
    organizer: {
      id: 'organizer-002',
      username: 'techrd',
      full_name: 'Tech RD Community',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      created_at: '2024-08-01T10:00:00.000Z'
    },
    ticket_types: [
      {
        id: 'ticket-002-early',
        event_id: 'event-002',
        name: 'Early Bird',
        price: 2500,
        quantity_available: 200,
        created_at: '2024-08-15T14:00:00.000Z'
      },
      {
        id: 'ticket-002-regular',
        event_id: 'event-002',
        name: 'Entrada Regular',
        price: 3500,
        quantity_available: 800,
        created_at: '2024-08-15T14:00:00.000Z'
      }
    ]
  },
  {
    id: 'event-003',
    organizer_id: 'organizer-003',
    title: 'Festival Gastronómico Sabores Dominicanos',
    description: 'Una celebración de la rica gastronomía dominicana con los mejores chefs del país. Degustaciones, talleres culinarios y música en vivo.',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=400&fit=crop',
    category: 'Gastronomía',
    start_date: '2024-10-12T16:00:00.000Z',
    end_date: '2024-10-12T22:00:00.000Z',
    venue_name: 'Plaza de la Cultura',
    venue_address: 'Av. Máximo Gómez, Santo Domingo',
    created_at: '2024-08-01T12:00:00.000Z',
    organizer: {
      id: 'organizer-003',
      username: 'sabores_rd',
      full_name: 'Sabores RD',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b886?w=100',
      created_at: '2024-08-01T10:00:00.000Z'
    },
    ticket_types: [
      {
        id: 'ticket-003-degustacion',
        event_id: 'event-003',
        name: 'Degustación Premium',
        price: 1800,
        quantity_available: 300,
        created_at: '2024-08-01T12:00:00.000Z'
      },
      {
        id: 'ticket-003-entrada',
        event_id: 'event-003',
        name: 'Entrada General',
        price: 800,
        quantity_available: 1500,
        created_at: '2024-08-01T12:00:00.000Z'
      }
    ]
  },
  {
    id: 'event-004',
    organizer_id: 'organizer-004',
    title: 'Romeo Santos - Golden Tour Final',
    description: 'El Rey de la Bachata cierra su Golden Tour en casa. Una noche mágica con los éxitos que han marcado toda una generación.',
    image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=400&fit=crop',
    category: 'Música',
    start_date: '2024-12-31T21:00:00.000Z',
    end_date: '2025-01-01T01:00:00.000Z',
    venue_name: 'Palacio de los Deportes Virgilio Travieso',
    venue_address: 'Av. Tiradentes, Santo Domingo',
    created_at: '2024-09-05T16:00:00.000Z',
    organizer: {
      id: 'organizer-004',
      username: 'aventura_music',
      full_name: 'Aventura Music',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      created_at: '2024-09-05T16:00:00.000Z'
    },
    ticket_types: [
      {
        id: 'ticket-004-palco',
        event_id: 'event-004',
        name: 'Palco VIP',
        price: 25000,
        quantity_available: 20,
        created_at: '2024-09-05T16:00:00.000Z'
      },
      {
        id: 'ticket-004-preferencial',
        event_id: 'event-004',
        name: 'Preferencial',
        price: 8500,
        quantity_available: 500,
        created_at: '2024-09-05T16:00:00.000Z'
      },
      {
        id: 'ticket-004-general',
        event_id: 'event-004',
        name: 'General',
        price: 4500,
        quantity_available: 8000,
        created_at: '2024-09-05T16:00:00.000Z'
      }
    ]
  },
  {
    id: 'event-005',
    organizer_id: 'organizer-005',
    title: 'Startup Weekend Santo Domingo',
    description: '54 horas para convertir una idea en un negocio real. Mentores, inversionistas y networking en el ecosistema emprendedor más dinámico.',
    image_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=400&fit=crop',
    category: 'Emprendimiento',
    start_date: '2024-11-01T18:00:00.000Z',
    end_date: '2024-11-03T20:00:00.000Z',
    venue_name: 'ITLA Campus Santo Domingo',
    venue_address: 'Av. Las Américas, Santo Domingo',
    created_at: '2024-09-10T09:00:00.000Z',
    organizer: {
      id: 'organizer-005',
      username: 'startup_rd',
      full_name: 'Startup RD',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      created_at: '2024-09-10T09:00:00.000Z'
    },
    ticket_types: [
      {
        id: 'ticket-005-participante',
        event_id: 'event-005',
        name: 'Participante',
        price: 1500,
        quantity_available: 80,
        created_at: '2024-09-10T09:00:00.000Z'
      },
      {
        id: 'ticket-005-mentor',
        event_id: 'event-005',
        name: 'Mentor/Inversionista',
        price: 0,
        quantity_available: 20,
        created_at: '2024-09-10T09:00:00.000Z'
      }
    ]
  },
  {
    id: 'event-006',
    organizer_id: 'organizer-006',
    title: 'Merengue Festival 2024',
    description: 'Celebramos nuestro ritmo nacional con los mejores exponentes del merengue. Una noche de baile y tradición dominicana.',
    image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop&seed=merengue',
    category: 'Música',
    start_date: '2024-11-30T19:00:00.000Z',
    end_date: '2024-11-30T23:00:00.000Z',
    venue_name: 'Anfiteatro Puerto Plata',
    venue_address: 'Malecón de Puerto Plata',
    created_at: '2024-09-08T11:00:00.000Z',
    organizer: {
      id: 'organizer-006',
      username: 'merengue_fest',
      full_name: 'Merengue Festival RD',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&seed=merengue',
      created_at: '2024-09-08T11:00:00.000Z'
    },
    ticket_types: [
      {
        id: 'ticket-006-vip',
        event_id: 'event-006',
        name: 'VIP Merengue',
        price: 4500,
        quantity_available: 100,
        created_at: '2024-09-08T11:00:00.000Z'
      },
      {
        id: 'ticket-006-general',
        event_id: 'event-006',
        name: 'Entrada General',
        price: 1800,
        quantity_available: 3000,
        created_at: '2024-09-08T11:00:00.000Z'
      }
    ]
  },
  {
    id: 'event-007',
    organizer_id: 'organizer-007',
    title: 'Expo Arte Contemporáneo RD',
    description: 'Muestra de arte contemporáneo dominicano con artistas emergentes y consagrados. Exposiciones, talleres y charlas magistrales.',
    image_url: 'https://images.unsplash.com/photo-1544967882-4d8b4292ca79?w=800&h=400&fit=crop',
    category: 'Arte',
    start_date: '2024-10-25T10:00:00.000Z',
    end_date: '2024-10-27T20:00:00.000Z',
    venue_name: 'Centro Cultural Eduardo León Jimenes',
    venue_address: 'Av. 27 de Febrero, Santiago',
    created_at: '2024-08-20T15:00:00.000Z',
    organizer: {
      id: 'organizer-007',
      username: 'arte_rd',
      full_name: 'Arte Contemporáneo RD',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b886?w=100&seed=arte',
      created_at: '2024-08-20T15:00:00.000Z'
    },
    ticket_types: [
      {
        id: 'ticket-007-pase',
        event_id: 'event-007',
        name: 'Pase 3 Días',
        price: 1200,
        quantity_available: 500,
        created_at: '2024-08-20T15:00:00.000Z'
      },
      {
        id: 'ticket-007-diario',
        event_id: 'event-007',
        name: 'Entrada Diaria',
        price: 500,
        quantity_available: 200,
        created_at: '2024-08-20T15:00:00.000Z'
      }
    ]
  },
  {
    id: 'event-008',
    organizer_id: 'organizer-008',
    title: 'Copa América Voleibol Playa',
    description: 'Competencia internacional de voleibol playa con las mejores selecciones del continente. Arena, sol y deporte de alto nivel.',
    image_url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=400&fit=crop',
    category: 'Deportes',
    start_date: '2024-12-05T08:00:00.000Z',
    end_date: '2024-12-08T18:00:00.000Z',
    venue_name: 'Playa Boca Chica',
    venue_address: 'Boca Chica, Santo Domingo',
    created_at: '2024-09-03T13:00:00.000Z',
    organizer: {
      id: 'organizer-008',
      username: 'voley_americas',
      full_name: 'NORCECA Volleyball',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&seed=voley',
      created_at: '2024-09-03T13:00:00.000Z'
    },
    ticket_types: [
      {
        id: 'ticket-008-palco',
        event_id: 'event-008',
        name: 'Palco Premium',
        price: 3500,
        quantity_available: 50,
        created_at: '2024-09-03T13:00:00.000Z'
      },
      {
        id: 'ticket-008-tribuna',
        event_id: 'event-008',
        name: 'Tribuna',
        price: 1500,
        quantity_available: 800,
        created_at: '2024-09-03T13:00:00.000Z'
      },
      {
        id: 'ticket-008-general',
        event_id: 'event-008',
        name: 'Entrada General',
        price: 800,
        quantity_available: 2000,
        created_at: '2024-09-03T13:00:00.000Z'
      }
    ]
  }
]

// Helper function to get trending events
export function getTrendingMockEvents(limit: number = 4): Event[] {
  return MOCK_EVENTS
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, limit)
}

// Helper function to get events by category
export function getMockEventsByCategory(category: string): Event[] {
  return MOCK_EVENTS.filter(event => 
    event.category?.toLowerCase().includes(category.toLowerCase())
  )
}

// Helper function to search events
export function searchMockEvents(query: string): Event[] {
  const searchTerm = query.toLowerCase()
  return MOCK_EVENTS.filter(event =>
    event.title.toLowerCase().includes(searchTerm) ||
    event.description?.toLowerCase().includes(searchTerm) ||
    event.category?.toLowerCase().includes(searchTerm) ||
    event.venue_name.toLowerCase().includes(searchTerm)
  )
}