import { createServiceClient } from '../src/client'
import { MOCK_EVENTS } from '../../api/src/mockData'

async function seed() {
  console.log('🌱 Starting database seeding...')
  
  try {
    const supabase = createServiceClient()
    
    // Clear existing data
    console.log('🧹 Cleaning existing data...')
    await supabase.from('tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('ticket_types').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    // Seed organizers (profiles) first
    console.log('👥 Seeding organizers...')
    const organizers = MOCK_EVENTS.map(event => event.organizer).filter(Boolean)
    const uniqueOrganizers = organizers.filter((org, index, self) => 
      index === self.findIndex(o => o?.id === org?.id)
    )
    
    for (const organizer of uniqueOrganizers) {
      if (organizer) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            id: organizer.id,
            username: organizer.username,
            full_name: organizer.full_name,
            avatar_url: organizer.avatar_url
          })
        
        if (error) {
          console.error(`Error inserting organizer ${organizer.username}:`, error)
        } else {
          console.log(`✅ Inserted organizer: ${organizer.username}`)
        }
      }
    }
    
    // Seed events
    console.log('🎉 Seeding events...')
    for (const event of MOCK_EVENTS) {
      const { error } = await supabase
        .from('events')
        .insert({
          id: event.id,
          organizer_id: event.organizer_id,
          title: event.title,
          description: event.description,
          image_url: event.image_url,
          category: event.category,
          start_date: event.start_date,
          end_date: event.end_date,
          venue_name: event.venue_name,
          venue_address: event.venue_address,
          created_at: event.created_at
        })
      
      if (error) {
        console.error(`Error inserting event ${event.title}:`, error)
      } else {
        console.log(`✅ Inserted event: ${event.title}`)
      }
    }
    
    // Seed ticket types
    console.log('🎫 Seeding ticket types...')
    for (const event of MOCK_EVENTS) {
      if (event.ticket_types) {
        for (const ticketType of event.ticket_types) {
          const { error } = await supabase
            .from('ticket_types')
            .insert({
              id: ticketType.id,
              event_id: ticketType.event_id,
              name: ticketType.name,
              price: ticketType.price,
              quantity_available: ticketType.quantity_available,
              created_at: ticketType.created_at
            })
          
          if (error) {
            console.error(`Error inserting ticket type ${ticketType.name}:`, error)
          } else {
            console.log(`✅ Inserted ticket type: ${ticketType.name} for ${event.title}`)
          }
        }
      }
    }
    
    console.log('🎊 Seeding completed successfully!')
    console.log(`📊 Seeded ${uniqueOrganizers.length} organizers, ${MOCK_EVENTS.length} events, and ${MOCK_EVENTS.reduce((acc, event) => acc + (event.ticket_types?.length || 0), 0)} ticket types`)
    
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  }
}

// Run the seed script
if (require.main === module) {
  seed()
    .then(() => {
      console.log('🏁 Seed script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seed script failed:', error)
      process.exit(1)
    })
}

export { seed }