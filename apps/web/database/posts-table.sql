-- Crear tabla posts para el social feed
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  type text DEFAULT 'text' CHECK (type IN ('text', 'image', 'video', 'purchase', 'event')),
  hashtags text[] DEFAULT '{}',
  mentions text[] DEFAULT '{}',
  media jsonb DEFAULT '[]',
  location text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  shares_count integer DEFAULT 0,
  saves_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Política: todos pueden ver posts públicos
CREATE POLICY "Anyone can view posts" ON posts
    FOR SELECT USING (true);

-- Política: usuarios autenticados pueden crear posts
CREATE POLICY "Authenticated users can create posts" ON posts
    FOR INSERT WITH CHECK (true);

-- Política: autores pueden actualizar sus propios posts
CREATE POLICY "Authors can update own posts" ON posts
    FOR UPDATE USING (true);

-- Grant permisos
GRANT ALL ON posts TO authenticated;
GRANT SELECT ON posts TO anon;