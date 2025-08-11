-- Enable pgcrypto for UUID gen
create extension if not exists pgcrypto;

-- Profiles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Decks
create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subject text,
  topic text,
  description text,
  created_by uuid references public.profiles(user_id),
  created_at timestamptz default now()
);

-- Cards
create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks(id) on delete cascade,
  front text not null,
  back text not null,
  hint text,
  tags text[],
  created_at timestamptz default now()
);

-- Scheduling state per user-card
create table if not exists public.card_scheduling (
  user_id uuid references public.profiles(user_id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  repetition int default 0,
  interval_days int default 0,
  efactor numeric(4,2) default 2.50,
  due_at date default current_date,
  last_reviewed_at timestamptz,
  primary key (user_id, card_id)
);

-- Review logs
create table if not exists public.review_logs (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(user_id) on delete cascade,
  card_id uuid references public.cards(id) on delete cascade,
  deck_id uuid references public.decks(id) on delete cascade,
  grade int not null,
  scheduled_interval int,
  next_interval int,
  efactor_before numeric(4,2),
  efactor_after numeric(4,2),
  reviewed_at timestamptz default now()
);

-- Optional user settings
create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  daily_goal int default 20
);

-- RLS
alter table public.profiles enable row level security;
alter table public.decks enable row level security;
alter table public.cards enable row level security;
alter table public.card_scheduling enable row level security;
alter table public.review_logs enable row level security;
alter table public.user_settings enable row level security;

-- Policies
-- Profiles: users can read own profile and admins may be managed manually
create policy if not exists "read own profile" on public.profiles for select using (auth.uid() = user_id);
create policy if not exists "insert own profile" on public.profiles for insert with check (auth.uid() = user_id);
create policy if not exists "update own profile" on public.profiles for update using (auth.uid() = user_id);

-- Decks: readable by all, write by admins (handled via RPC or service role; for MVP allow all authenticated to read)
create policy if not exists "read decks" on public.decks for select using (true);

-- Cards: readable by all
create policy if not exists "read cards" on public.cards for select using (true);

-- card_scheduling: user can read/write own
create policy if not exists "read own scheduling" on public.card_scheduling for select using (auth.uid() = user_id);
create policy if not exists "upsert own scheduling" on public.card_scheduling for insert with check (auth.uid() = user_id);
create policy if not exists "update own scheduling" on public.card_scheduling for update using (auth.uid() = user_id);

-- review_logs: user can insert and read own
create policy if not exists "insert own log" on public.review_logs for insert with check (auth.uid() = user_id);
create policy if not exists "read own logs" on public.review_logs for select using (auth.uid() = user_id);

-- user_settings: read/write own
create policy if not exists "read own settings" on public.user_settings for select using (auth.uid() = user_id);
create policy if not exists "write own settings" on public.user_settings for insert with check (auth.uid() = user_id);
create policy if not exists "update own settings" on public.user_settings for update using (auth.uid() = user_id);


