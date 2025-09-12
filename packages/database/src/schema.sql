-- NFTicket Database Schema for Supabase
-- Aplicar este SQL en el proyecto Supabase

-- perfila usuarios (vía auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- eventos
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references profiles(id),
  title text not null,
  description text,
  image_url text,
  category text,
  start_date timestamptz not null,
  end_date timestamptz not null,
  venue_name text not null,
  venue_address text,
  created_at timestamptz default now()
  -- Fase 2 (Kadena):
  -- , nft_contract_address text
  -- , nft_template_id text
);

-- tipos de entrada
create table if not exists ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  name text not null,           -- General, VIP
  price numeric(10,2) not null,
  quantity_available int not null,
  created_at timestamptz default now()
);

-- órdenes (para Stripe)
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references profiles(id),
  event_id uuid not null references events(id),
  status text not null check (status in ('pending','paid','failed','refunded')),
  total_amount numeric(10,2) not null,
  payment_provider text,        -- stripe, mercadopago
  provider_session_id text,     -- stripe session id
  created_at timestamptz default now()
);

-- tickets emitidos
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_type_id uuid not null references ticket_types(id),
  event_id uuid not null references events(id),
  order_id uuid not null references orders(id),
  owner_id uuid not null references profiles(id),
  unique_qr_code text unique not null,
  is_used boolean default false,
  purchased_at timestamptz default now()
  -- Fase 2 (Kadena):
  -- , nft_minted boolean default false
  -- , kda_tx_id text
);

-- Índices útiles
create index if not exists idx_events_start_date on events(start_date);
create index if not exists idx_tickets_owner on tickets(owner_id);
create index if not exists idx_ticket_types_event on ticket_types(event_id);

-- RLS
alter table profiles enable row level security;
alter table events enable row level security;
alter table ticket_types enable row level security;
alter table orders enable row level security;
alter table tickets enable row level security;

-- Policies mínimas (ajusta según roles)
create policy "profiles are viewable by user or public read"
on profiles for select using (true);

create policy "users can update their profile"
on profiles for update using (auth.uid() = id);

create policy "events are public read"
on events for select using (true);

create policy "organizer can manage their events"
on events for all using (auth.uid() = organizer_id) with check (auth.uid() = organizer_id);

create policy "ticket types public read"
on ticket_types for select using (true);

create policy "organizer can manage ticket types"
on ticket_types for all using (
  exists(select 1 from events e where e.id = ticket_types.event_id and e.organizer_id = auth.uid())
);

create policy "orders readable by owner"
on orders for select using (auth.uid() = buyer_id);

create policy "tickets readable by owner"
on tickets for select using (auth.uid() = owner_id);