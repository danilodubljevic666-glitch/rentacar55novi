-- ================================================================
-- Rent a Car 55 — Supabase Schema
-- Pokreni ovo u Supabase → SQL Editor
-- ================================================================

-- 1. Tabela rezervacija
create table if not exists public.reservations (
  id          uuid        default gen_random_uuid() primary key,
  car_id      text        not null,
  car_name    text        not null,
  full_name   text        not null,
  email       text        not null,
  phone       text        not null,
  from_date   date        not null,
  to_date     date        not null,
  message     text,
  status      text        not null default 'pending',
  created_at  timestamptz default now(),
  constraint status_check check (status in ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- 2. Row Level Security
alter table public.reservations enable row level security;

-- Daj anon roli table-level INSERT privilegiju
grant insert on public.reservations to anon;

-- Svi mogu da unesu rezervaciju (forma na sajtu)
create policy "anyone_insert" on public.reservations
  for insert to anon with check (true);

-- Samo prijavljeni admin može da čita sve
create policy "auth_read" on public.reservations
  for select to authenticated using (true);

-- Samo admin može da mijenja status
create policy "auth_update" on public.reservations
  for update to authenticated using (true);

-- 3. Funkcija za provjeru dostupnosti (bez ličnih podataka)
create or replace function public.get_availability()
returns table(car_id text, from_date date, to_date date)
language sql
security definer
set search_path = public
as $$
  select car_id, from_date, to_date
  from reservations
  where status in ('pending', 'confirmed')
    and to_date >= current_date;
$$;

grant execute on function public.get_availability() to anon;

-- ================================================================
-- GOTOVO! Sljedeći korak:
-- Idi na Authentication → Users → Add User
-- Dodaj email i šifru za admina
-- ================================================================
