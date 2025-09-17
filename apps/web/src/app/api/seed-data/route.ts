import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Sample users data with generated UUIDs that don't conflict with auth.users
    const sampleUsers = [
      {
        username: 'ana_events',
        full_name: 'Ana Herrera',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'carlostech',
        full_name: 'Carlos Rivera',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'mariag_music',
        full_name: 'María González',
        avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'luism_photo',
        full_name: 'Luis Martínez',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'sofia_design',
        full_name: 'Sofia Reyes',
        avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face'
      },
      {
        username: 'diego_music',
        full_name: 'Diego Santos',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
      }
    ]

    const results = []

    for (const userData of sampleUsers) {
      // Insert into profiles using Supabase's auto-generated UUID
      const { data, error } = await supabase
        .from('profiles')
        .insert([userData])
        .select()

      if (error) {
        console.error(`Error inserting user ${userData.username}:`, error)
        results.push({
          username: userData.username,
          success: false,
          error: error.message
        })
      } else {
        results.push({
          username: userData.username,
          success: true,
          data: data[0]
        })
      }
    }

    return NextResponse.json({
      status: 'completed',
      message: 'Sample data seeding completed',
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Failed to seed sample data',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}