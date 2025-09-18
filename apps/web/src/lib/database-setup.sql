-- Create notifications table for the NFTicket platform
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  to_user_id VARCHAR(255) NOT NULL,
  from_user_id VARCHAR(255),
  type VARCHAR(50) NOT NULL CHECK (type IN ('comment', 'like', 'group', 'ticket', 'event', 'follow', 'mention')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
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

-- Create RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
CREATE POLICY notifications_user_access ON notifications
  FOR ALL USING (to_user_id = current_user);

-- Policy: Users can insert notifications for others (for creating notifications)
CREATE POLICY notifications_insert ON notifications
  FOR INSERT WITH CHECK (true);

-- Add foreign key constraint to profiles table if it exists
-- ALTER TABLE notifications ADD CONSTRAINT fk_notifications_from_user 
--   FOREIGN KEY (from_user_id) REFERENCES profiles(id) ON DELETE SET NULL;

-- Add comment for documentation
COMMENT ON TABLE notifications IS 'Stores user notifications for comments, likes, groups, events, etc.';
COMMENT ON COLUMN notifications.type IS 'Type of notification: comment, like, group, ticket, event, follow, mention';
COMMENT ON COLUMN notifications.to_user_id IS 'User who receives the notification';
COMMENT ON COLUMN notifications.from_user_id IS 'User who triggered the notification (can be null for system notifications)';