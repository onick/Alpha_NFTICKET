-- Social Feed Schema for NFTicket
-- MVP implementation following the mandato specifications

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Posts table (main feed content)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('user', 'purchase', 'community', 'activity', 'event_recommendation', 'sponsored')),
  text TEXT,
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  
  -- Engagement metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  reports_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Post media (images, videos)
CREATE TABLE post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User posts specific data
CREATE TABLE user_posts (
  post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  hashtags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  location JSONB -- {name: string, coordinates?: [lat, lng]}
);

-- Purchase posts (compra compartida)
CREATE TABLE purchase_posts (
  post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  tickets_count INTEGER NOT NULL,
  total_amount INTEGER NOT NULL -- in cents
);

-- Community posts
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(community_id, user_id)
);

CREATE TABLE community_posts (
  post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL
);

-- Activity posts (follow, save event, etc.)
CREATE TABLE activity_posts (
  post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('follow', 'save_event', 'join_community')),
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'event', 'community')),
  target_data JSONB DEFAULT '{}'
);

-- Event recommendation posts
CREATE TABLE event_recommendation_posts (
  post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  recommendation_reason TEXT NOT NULL CHECK (recommendation_reason IN ('trending', 'category_match', 'location_based', 'friend_activity'))
);

-- Sponsored posts
CREATE TABLE sponsored_posts (
  post_id UUID PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
  sponsor_id UUID REFERENCES profiles(id) NOT NULL,
  campaign_id TEXT NOT NULL,
  target_audience TEXT[] DEFAULT '{}',
  budget_info JSONB DEFAULT '{}' -- {bid_amount: number, daily_budget: number}
);

-- Post interactions
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Comments
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  parent_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

-- Reports
CREATE TABLE post_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'misleading', 'other')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id)
);

-- Follow relationships
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- User signals for feed ranking
CREATE TABLE user_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Engagement preferences
  likes_on_purchases INTEGER DEFAULT 0,
  likes_on_social INTEGER DEFAULT 0,
  comments_ratio DECIMAL DEFAULT 0,
  saves_ratio DECIMAL DEFAULT 0,
  
  -- Time behavior
  dwell_time_avg INTEGER DEFAULT 0, -- seconds
  peak_activity_hours INTEGER[] DEFAULT '{}', -- [9, 18, 20]
  
  -- Content preferences
  categories_fav TEXT[] DEFAULT '{}',
  hashtags_fav TEXT[] DEFAULT '{}',
  
  -- Social behavior
  following_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  community_memberships TEXT[] DEFAULT '{}',
  
  -- Location preferences
  location_preference JSONB, -- {latitude: number, longitude: number, radius: number}
  
  -- Purchase behavior
  avg_ticket_price INTEGER DEFAULT 0,
  events_attended INTEGER DEFAULT 0,
  preferred_venues TEXT[] DEFAULT '{}',
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================
-- INDEXES for Performance
-- =============================

-- Posts indexes
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX idx_posts_type_created ON posts(type, created_at DESC);
CREATE INDEX idx_posts_visibility_created ON posts(visibility, created_at DESC);
CREATE INDEX idx_posts_created_likes ON posts(created_at DESC, likes_count DESC);

-- Feed pagination index (cursor-based)
CREATE INDEX idx_posts_pagination ON posts(created_at DESC, id);

-- Engagement indexes
CREATE INDEX idx_post_likes_post_user ON post_likes(post_id, user_id);
CREATE INDEX idx_post_likes_user_created ON post_likes(user_id, created_at DESC);
CREATE INDEX idx_post_saves_user_created ON post_saves(user_id, created_at DESC);

-- Comments indexes  
CREATE INDEX idx_comments_post_created ON post_comments(post_id, created_at DESC);
CREATE INDEX idx_comments_parent ON post_comments(parent_id, created_at DESC);

-- Follow indexes
CREATE INDEX idx_follows_follower ON follows(follower_id, created_at DESC);
CREATE INDEX idx_follows_following ON follows(following_id, created_at DESC);

-- Community indexes
CREATE INDEX idx_community_members_user ON community_members(user_id, joined_at DESC);
CREATE INDEX idx_community_members_community ON community_members(community_id, joined_at DESC);

-- Purchase posts index
CREATE INDEX idx_purchase_posts_event ON purchase_posts(event_id, post_id);

-- =============================
-- TRIGGERS for Engagement Counters
-- =============================

-- Update likes_count on posts
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- Update comments_count on posts
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_comments_count
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- Update saves_count on posts
CREATE OR REPLACE FUNCTION update_post_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET saves_count = saves_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET saves_count = GREATEST(0, saves_count - 1) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_saves_count
  AFTER INSERT OR DELETE ON post_saves
  FOR EACH ROW EXECUTE FUNCTION update_post_saves_count();

-- Update follower/following counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update follower count for followed user
    UPDATE user_signals SET followers_count = followers_count + 1 WHERE user_id = NEW.following_id;
    -- Update following count for follower user
    UPDATE user_signals SET following_count = following_count + 1 WHERE user_id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update follower count for unfollowed user
    UPDATE user_signals SET followers_count = GREATEST(0, followers_count - 1) WHERE user_id = OLD.following_id;
    -- Update following count for unfollower user
    UPDATE user_signals SET following_count = GREATEST(0, following_count - 1) WHERE user_id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_follow_counts
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- =============================
-- RLS POLICIES
-- =============================

-- Posts RLS policies
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users can see public posts, their own posts, and posts from users they follow if visibility allows
CREATE POLICY "Posts visibility policy" ON posts
  FOR SELECT USING (
    -- Public posts are visible to everyone
    visibility = 'public'
    OR
    -- Users can see their own posts
    author_id = auth.uid()
    OR
    -- Users can see posts from people they follow if visibility is 'followers'
    (visibility = 'followers' AND EXISTS (
      SELECT 1 FROM follows 
      WHERE follower_id = auth.uid() 
      AND following_id = author_id
    ))
  );

-- Users can only create posts as themselves
CREATE POLICY "Users can create posts" ON posts
  FOR INSERT WITH CHECK (author_id = auth.uid());

-- Users can only update their own posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (author_id = auth.uid());

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (author_id = auth.uid());

-- Post interactions RLS
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Users can interact with posts they can see
CREATE POLICY "Like posts policy" ON post_likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_likes.post_id
      AND (
        posts.visibility = 'public'
        OR posts.author_id = auth.uid()
        OR (posts.visibility = 'followers' AND EXISTS (
          SELECT 1 FROM follows 
          WHERE follower_id = auth.uid() 
          AND following_id = posts.author_id
        ))
      )
    )
  );

CREATE POLICY "Create likes policy" ON post_likes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Delete own likes policy" ON post_likes
  FOR DELETE USING (user_id = auth.uid());

-- Similar policies for saves
CREATE POLICY "Save posts policy" ON post_saves
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_saves.post_id
      AND (
        posts.visibility = 'public'
        OR posts.author_id = auth.uid()
        OR (posts.visibility = 'followers' AND EXISTS (
          SELECT 1 FROM follows 
          WHERE follower_id = auth.uid() 
          AND following_id = posts.author_id
        ))
      )
    )
  );

CREATE POLICY "Create saves policy" ON post_saves
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Delete own saves policy" ON post_saves
  FOR DELETE USING (user_id = auth.uid());

-- Comments policies
CREATE POLICY "View comments policy" ON post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_comments.post_id
      AND (
        posts.visibility = 'public'
        OR posts.author_id = auth.uid()
        OR (posts.visibility = 'followers' AND EXISTS (
          SELECT 1 FROM follows 
          WHERE follower_id = auth.uid() 
          AND following_id = posts.author_id
        ))
      )
    )
  );

CREATE POLICY "Create comments policy" ON post_comments
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Update own comments policy" ON post_comments
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Delete own comments policy" ON post_comments
  FOR DELETE USING (author_id = auth.uid());

-- Follows policies
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View follows policy" ON follows
  FOR SELECT USING (
    follower_id = auth.uid() OR following_id = auth.uid()
  );

CREATE POLICY "Create follows policy" ON follows
  FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Delete follows policy" ON follows
  FOR DELETE USING (follower_id = auth.uid());

-- Communities policies
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View public communities" ON communities
  FOR SELECT USING (is_private = false OR created_by = auth.uid());

CREATE POLICY "Create communities" ON communities
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Update own communities" ON communities
  FOR UPDATE USING (created_by = auth.uid());

-- Community members policies
CREATE POLICY "View community members" ON community_members
  FOR SELECT USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM communities 
      WHERE communities.id = community_members.community_id 
      AND communities.is_private = false
    )
  );

CREATE POLICY "Join communities" ON community_members
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Leave communities" ON community_members
  FOR DELETE USING (user_id = auth.uid());

-- User signals (private to each user)
ALTER TABLE user_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own user signals" ON user_signals
  FOR ALL USING (user_id = auth.uid());

-- =============================
-- HELPER FUNCTIONS
-- =============================

-- Function to create initial user signals record
CREATE OR REPLACE FUNCTION create_user_signals()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_signals (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create user signals when profile is created
CREATE TRIGGER trigger_create_user_signals
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_user_signals();