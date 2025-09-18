import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Create notifications table
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create notifications table for the NFTicket platform
        CREATE TABLE IF NOT EXISTS notifications (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          to_user_id VARCHAR(255) NOT NULL,
          from_user_id VARCHAR(255),
          type VARCHAR(50) NOT NULL CHECK (type IN ('comment', 'like', 'group', 'ticket', 'event', 'follow', 'mention')),
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          event_id UUID,
          group_id UUID,
          action_url VARCHAR(255),
          read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_notifications_to_user_id ON notifications(to_user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
      `
    })

    if (error) {
      console.error('Error creating notifications table:', error)
      
      // Try alternative approach using direct SQL execution
      const { error: createError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1)

      if (createError && createError.code === 'PGRST204') {
        // Table doesn't exist, try to create it manually
        return NextResponse.json({
          message: 'Notifications table creation attempted. Please create the table manually using the SQL in src/lib/database-setup.sql',
          sql_file: '/src/lib/database-setup.sql'
        })
      }

      return NextResponse.json(
        { error: 'Failed to create notifications table', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Notifications table created successfully',
      table: 'notifications'
    })

  } catch (error) {
    console.error('Setup notifications API Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Please create the notifications table manually using Supabase dashboard',
        sql_file: '/src/lib/database-setup.sql'
      },
      { status: 500 }
    )
  }
}