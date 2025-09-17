-- NFTicket Database Schema for Supabase
-- Execute these commands in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table - Core user profiles
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    location TEXT,
    verified BOOLEAN DEFAULT false,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table - All user posts and content
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'event', 'purchase')),
    visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
    hashtags TEXT[] DEFAULT '{}',
    mentions TEXT[] DEFAULT '{}',
    media JSONB DEFAULT '[]',
    location TEXT,
    event_data JSONB,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    reports_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table - Comments and replies on posts
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mentions TEXT[] DEFAULT '{}',
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table - Likes on posts and comments
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- Follows table - User follow relationships
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- Saves table - Saved posts by users
CREATE TABLE IF NOT EXISTS public.saves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- Events table - Event information for tickets
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    venue TEXT,
    location TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    category TEXT,
    image_url TEXT,
    max_capacity INTEGER,
    current_attendance INTEGER DEFAULT 0,
    price_range JSONB,
    organizer_id UUID REFERENCES public.users(id),
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'ended', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets table - NFT tickets owned by users
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    ticket_type TEXT NOT NULL,
    seat_info JSONB,
    price DECIMAL(10, 2),
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_date TIMESTAMP WITH TIME ZONE,
    nft_token_id TEXT,
    nft_contract_address TEXT,
    blockchain_network TEXT DEFAULT 'polygon',
    metadata JSONB,
    status TEXT DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'transferred', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON public.posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_type_created ON public.posts(type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility_created ON public.posts(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON public.comments(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_parent_created ON public.comments(parent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_target ON public.likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(event_date);
CREATE INDEX IF NOT EXISTS idx_tickets_owner ON public.tickets(owner_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON public.tickets(event_id);

-- Functions to update counters automatically
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts 
        SET comments_count = comments_count - 1 
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'post' THEN
            UPDATE public.posts 
            SET likes_count = likes_count + 1 
            WHERE id = NEW.target_id;
        ELSIF NEW.target_type = 'comment' THEN
            UPDATE public.comments 
            SET likes_count = likes_count + 1 
            WHERE id = NEW.target_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'post' THEN
            UPDATE public.posts 
            SET likes_count = likes_count - 1 
            WHERE id = OLD.target_id;
        ELSIF OLD.target_type = 'comment' THEN
            UPDATE public.comments 
            SET likes_count = likes_count - 1 
            WHERE id = OLD.target_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.users 
        SET following_count = following_count + 1 
        WHERE id = NEW.follower_id;
        
        UPDATE public.users 
        SET followers_count = followers_count + 1 
        WHERE id = NEW.following_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.users 
        SET following_count = following_count - 1 
        WHERE id = OLD.follower_id;
        
        UPDATE public.users 
        SET followers_count = followers_count - 1 
        WHERE id = OLD.following_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_post_comments_count ON public.comments;
CREATE TRIGGER trigger_update_post_comments_count
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

DROP TRIGGER IF EXISTS trigger_update_likes_count ON public.likes;
CREATE TRIGGER trigger_update_likes_count
    AFTER INSERT OR DELETE ON public.likes
    FOR EACH ROW EXECUTE FUNCTION update_likes_count();

DROP TRIGGER IF EXISTS trigger_update_follow_counts ON public.follows;
CREATE TRIGGER trigger_update_follow_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized later)
-- Users can read all public profiles
CREATE POLICY "Users can view public profiles" ON public.users
    FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Public posts are visible to everyone
CREATE POLICY "Public posts are visible" ON public.posts
    FOR SELECT USING (visibility = 'public');

-- Users can create posts
CREATE POLICY "Users can create posts" ON public.posts
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts" ON public.posts
    FOR UPDATE USING (auth.uid() = author_id);

-- Comments are visible on visible posts
CREATE POLICY "Comments are visible" ON public.comments
    FOR SELECT USING (true);

-- Users can create comments
CREATE POLICY "Users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can like posts and comments
CREATE POLICY "Users can manage likes" ON public.likes
    FOR ALL USING (auth.uid() = user_id);

-- Users can manage their follows
CREATE POLICY "Users can manage follows" ON public.follows
    FOR ALL USING (auth.uid() = follower_id);

-- Events are publicly visible
CREATE POLICY "Events are publicly visible" ON public.events
    FOR SELECT USING (true);

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON public.tickets
    FOR SELECT USING (auth.uid() = owner_id);

-- Insert sample data (optional - for development)
-- Note: You should replace these with your actual user data
INSERT INTO public.users (id, email, username, name, avatar_url, verified) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'ana@example.com', 'ana_events', 'Ana Herrera', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', false),
    ('550e8400-e29b-41d4-a716-446655440002', 'carlos@example.com', 'carlostech', 'Carlos Rivera', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', false),
    ('550e8400-e29b-41d4-a716-446655440003', 'maria@example.com', 'mariag_music', 'María González', 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face', true),
    ('550e8400-e29b-41d4-a716-446655440004', 'luis@example.com', 'luism_photo', 'Luis Martínez', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', false),
    ('550e8400-e29b-41d4-a716-446655440005', 'sofia@example.com', 'sofia_design', 'Sofia Reyes', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face', false),
    ('550e8400-e29b-41d4-a716-446655440006', 'diego@example.com', 'diego_music', 'Diego Santos', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face', false)
ON CONFLICT (email) DO NOTHING;

-- Sample posts
INSERT INTO public.posts (author_id, content, type, hashtags, location, likes_count, comments_count, shares_count) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', '¡Qué noche tan increíble en el concierto de Romeo Santos! 🎤✨ La energía del público fue impresionante. Ya extraño estar ahí... #RomeoSantos #ConciertosRD #MemoriasInolvidables', 'text', '{RomeoSantos,ConciertosRD,MemoriasInolvidables}', 'Palacio de los Deportes, Santo Domingo', 847, 156, 203),
    ('550e8400-e29b-41d4-a716-446655440002', 'Reflexionando sobre todo lo aprendido en Tech Summit RD 2024 🚀. La keynote sobre IA transformó mi perspectiva completamente. ¿Alguien más estuvo ahí? Me encantaría conectar y discutir ideas. #TechSummitRD #IA #Networking', 'text', '{TechSummitRD,IA,Networking}', 'Centro de Convenciones, Santiago', 234, 45, 67)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions for authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant permissions for anonymous users (limited read access)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.users TO anon;
GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.comments TO anon;
GRANT SELECT ON public.events TO anon;