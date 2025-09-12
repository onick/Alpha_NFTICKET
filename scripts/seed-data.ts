#!/usr/bin/env tsx

import { createServiceClient } from '@nfticket/database'

const SAMPLE_EVENTS = [
  {
    title: "Tech Conference 2024",
    description: "The biggest tech conference of the year featuring AI, blockchain, and web3 talks.",
    image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
    category: "Technology",
    start_date: "2024-12-15T09:00:00.000Z",
    end_date: "2024-12-15T18:00:00.000Z",
    venue_name: "Convention Center",
    venue_address: "123 Tech Street, San Francisco, CA",
    organizer_id: "sample-organizer-1"
  },
  {
    title: "Music Festival Summer",
    description: "Three days of amazing music with top artists from around the world.",
    image_url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    category: "Music",
    start_date: "2024-07-20T16:00:00.000Z",
    end_date: "2024-07-22T23:00:00.000Z",
    venue_name: "Golden Gate Park",
    venue_address: "Golden Gate Park, San Francisco, CA",
    organizer_id: "sample-organizer-2"
  },
  {
    title: "Art Gallery Opening",
    description: "Exclusive opening of contemporary art exhibition featuring local artists.",
    image_url: "https://images.unsplash.com/photo-1544967882-4d8b4292ca79?w=400",
    category: "Art",
    start_date: "2024-11-08T19:00:00.000Z",
    end_date: "2024-11-08T22:00:00.000Z",
    venue_name: "Modern Art Gallery",
    venue_address: "456 Art Avenue, New York, NY",
    organizer_id: "sample-organizer-3"
  },
  {
    title: "Food & Wine Festival",
    description: "Taste the best food and wine from local restaurants and wineries.",
    image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
    category: "Food",
    start_date: "2024-10-12T12:00:00.000Z",
    end_date: "2024-10-12T20:00:00.000Z",
    venue_name: "Waterfront Plaza",
    venue_address: "789 Harbor Way, Miami, FL",
    organizer_id: "sample-organizer-4"
  },
  {
    title: "Startup Pitch Competition",
    description: "Watch innovative startups pitch their ideas to top investors.",
    image_url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400",
    category: "Business",
    start_date: "2024-09-25T14:00:00.000Z",
    end_date: "2024-09-25T18:00:00.000Z",
    venue_name: "Innovation Hub",
    venue_address: "321 Startup Boulevard, Austin, TX",
    organizer_id: "sample-organizer-5"
  }
]

const SAMPLE_ORGANIZERS = [
  {
    id: "sample-organizer-1",
    username: "techconference",
    full_name: "Tech Conference Organizers",
    avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
  },
  {
    id: "sample-organizer-2", 
    username: "musicfest",
    full_name: "Summer Music Festival",
    avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"
  },
  {
    id: "sample-organizer-3",
    username: "artgallery",
    full_name: "Modern Art Gallery",
    avatar_url: "https://images.unsplash.com/photo-1494790108755-2616b612b886?w=100"
  },
  {
    id: "sample-organizer-4",
    username: "foodwine",
    full_name: "Food & Wine Events",
    avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
  },
  {
    id: "sample-organizer-5",
    username: "startuppitch",
    full_name: "Startup Community",
    avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100"
  }
]

async function seedData() {
  const supabase = createServiceClient()
  
  try {
    console.log('🌱 Starting data seeding...')
    
    // Create sample organizers (profiles)
    console.log('📋 Creating organizer profiles...')
    const { error: profilesError } = await supabase
      .from('profiles')
      .upsert(SAMPLE_ORGANIZERS, { onConflict: 'id' })
    
    if (profilesError) {
      throw new Error(`Failed to create profiles: ${profilesError.message}`)
    }
    
    console.log('✅ Created organizer profiles')
    
    // Create sample events
    console.log('🎫 Creating sample events...')
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .upsert(SAMPLE_EVENTS, { onConflict: 'title' })
      .select('id, title')
    
    if (eventsError) {
      throw new Error(`Failed to create events: ${eventsError.message}`)
    }
    
    console.log('✅ Created sample events:', events?.map(e => e.title))
    
    // Create ticket types for each event
    console.log('🎟️ Creating ticket types...')
    const ticketTypes = []
    
    for (const event of events || []) {
      // General admission ticket
      ticketTypes.push({
        event_id: event.id,
        name: 'General Admission',
        price: 50,
        quantity_available: 100
      })
      
      // VIP ticket
      ticketTypes.push({
        event_id: event.id,
        name: 'VIP',
        price: 150,
        quantity_available: 25
      })
    }
    
    const { error: ticketTypesError } = await supabase
      .from('ticket_types')
      .upsert(ticketTypes)
    
    if (ticketTypesError) {
      throw new Error(`Failed to create ticket types: ${ticketTypesError.message}`)
    }
    
    console.log('✅ Created ticket types')
    
    console.log('🎉 Data seeding completed successfully!')
    console.log(`Created ${SAMPLE_ORGANIZERS.length} organizers`)
    console.log(`Created ${SAMPLE_EVENTS.length} events`)
    console.log(`Created ${ticketTypes.length} ticket types`)
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
    process.exit(1)
  }
}

// Run the seed script
if (require.main === module) {
  seedData()
}

export { seedData }