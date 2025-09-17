import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  )
}

// Client-side Supabase client (safe for browser)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'nfticket-web-client'
    }
  }
})

// Server-side Supabase client with service role (admin access)
export const createServiceSupabase = (): SupabaseClient => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY. This is required for server-side operations.'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'nfticket-service-client'
      }
    }
  })
}

// Database types - these will be generated from Supabase later
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          name: string
          avatar_url?: string
          bio?: string
          website?: string
          location?: string
          verified: boolean
          followers_count: number
          following_count: number
          posts_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          name: string
          avatar_url?: string
          bio?: string
          website?: string
          location?: string
          verified?: boolean
          followers_count?: number
          following_count?: number
          posts_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          name?: string
          avatar_url?: string
          bio?: string
          website?: string
          location?: string
          verified?: boolean
          followers_count?: number
          following_count?: number
          posts_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          type: 'text' | 'image' | 'event' | 'purchase'
          visibility: 'public' | 'followers' | 'private'
          hashtags?: string[]
          mentions?: string[]
          media?: any[]
          location?: string
          event_data?: any
          likes_count: number
          comments_count: number
          shares_count: number
          saves_count: number
          reports_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          type?: 'text' | 'image' | 'event' | 'purchase'
          visibility?: 'public' | 'followers' | 'private'
          hashtags?: string[]
          mentions?: string[]
          media?: any[]
          location?: string
          event_data?: any
          likes_count?: number
          comments_count?: number
          shares_count?: number
          saves_count?: number
          reports_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          type?: 'text' | 'image' | 'event' | 'purchase'
          visibility?: 'public' | 'followers' | 'private'
          hashtags?: string[]
          mentions?: string[]
          media?: any[]
          location?: string
          event_data?: any
          likes_count?: number
          comments_count?: number
          shares_count?: number
          saves_count?: number
          reports_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          author_id: string
          parent_id?: string
          content: string
          mentions?: string[]
          likes_count: number
          replies_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          author_id: string
          parent_id?: string
          content: string
          mentions?: string[]
          likes_count?: number
          replies_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          author_id?: string
          parent_id?: string
          content?: string
          mentions?: string[]
          likes_count?: number
          replies_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          target_type: 'post' | 'comment'
          target_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_type: 'post' | 'comment'
          target_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_type?: 'post' | 'comment'
          target_id?: string
          created_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper function to check connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    
    if (error) {
      console.error('Supabase connection test failed:', error.message)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('Supabase connection test error:', error)
    return false
  }
}

export default supabase