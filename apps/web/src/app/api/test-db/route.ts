import { NextResponse } from 'next/server'
import { supabase, testSupabaseConnection } from '@/lib/supabase'

export async function GET() {
  try {
    // Test basic connection
    const isConnected = await testSupabaseConnection()
    
    if (!isConnected) {
      return NextResponse.json({
        status: 'error',
        message: 'Failed to connect to Supabase',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // Test profiles table
    const { data: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Test events table
    const { data: eventsCount, error: eventsError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })

    // Test tickets table
    const { data: ticketsCount, error: ticketsError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      data: {
        profiles: {
          count: profilesCount,
          error: profilesError?.message || null
        },
        events: {
          count: eventsCount,
          error: eventsError?.message || null
        },
        tickets: {
          count: ticketsCount,
          error: ticketsError?.message || null
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Database test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}