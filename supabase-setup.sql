-- SUPABASE SETUP SCRIPT --
-- Run this in your Supabase SQL Editor (https://app.supabase.com/)

-- 1. Profiles Table (Extends Auth Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Games Table
create table if not exists public.games (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  game_type text not null,
  created_at timestamptz default now()
);

-- 3. Players Table
create table if not exists public.players (
  id uuid default gen_random_uuid() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  username text not null,
  wins integer default 0 not null,
  created_at timestamptz default now()
);

-- 4. Activity Logs Table
create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Enable RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.players enable row level security;
alter table public.activity_logs enable row level security;

-- 5. Policies for profiles
create policy "Public profiles are viewable by everyone" 
  on profiles for select 
  using ( true );

create policy "Users can insert their own profile" 
  on profiles for insert 
  with check ( auth.uid() = id );

create policy "Users can update their own profile" 
  on profiles for update 
  using ( auth.uid() = id );

-- 6. Policies for games
create policy "Users can view their own games" 
  on games for select 
  using ( auth.uid() = user_id );

create policy "Users can create their own games" 
  on games for insert 
  with check ( auth.uid() = user_id );

create policy "Users can update their own games" 
  on games for update 
  using ( auth.uid() = user_id );

create policy "Users can delete their own games" 
  on games for delete 
  using ( auth.uid() = user_id );

-- 7. Policies for players
create policy "Users can view players in their games" 
  on players for select 
  using ( exists (
    select 1 from games 
    where games.id = players.game_id 
    and games.user_id = auth.uid()
  ) );

create policy "Users can manage players in their games" 
  on players for all 
  using ( exists (
    select 1 from games 
    where games.id = players.game_id 
    and games.user_id = auth.uid()
  ) );

-- 8. Policies for activity_logs
create policy "Users can view their own logs" 
  on activity_logs for select 
  using ( auth.uid() = user_id );

create policy "Users can insert their own logs" 
  on activity_logs for insert 
  with check ( auth.uid() = user_id );

-- 9. Trigger for automatic profile creation on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'username', 'User_' || substr(new.id::text, 1, 5)), 
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
