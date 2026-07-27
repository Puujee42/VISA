-- VISA app — full Supabase schema (run in SQL Editor)
-- Auth is handled by Clerk; API routes use the service/publishable key server-side.

create extension if not exists "pgcrypto";

-- ─── Users ───────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text not null,
  full_name text,
  photo text,
  role text not null default 'guest',
  country text default '-',
  step text default '-',
  student_id text default '',
  university text default 'MNUMS',
  badges jsonb not null default '[]',
  documents jsonb not null default '{}',
  documents_submitted boolean not null default false,
  documents_reviewed_by text default '',
  documents_approved_at timestamptz,
  profile jsonb not null default '{}',
  activity_history jsonb not null default '[]',
  events_attended_count int not null default 0,
  points int not null default 0,
  status text default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_clerk_id_idx on public.users (clerk_id);
create index if not exists users_role_created_idx on public.users (role, created_at desc);
create index if not exists users_email_idx on public.users (email);

-- ─── Applications ────────────────────────────────────────────────────────────
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  program_id text not null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  age text not null,
  level text not null,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_status_idx on public.applications (user_id, status);
create index if not exists applications_status_created_idx on public.applications (status, created_at desc);

-- ─── Bookings ────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  service_id text not null,
  service_title text not null,
  date text not null,
  time text not null,
  name text not null,
  email text not null,
  phone text not null,
  note text,
  status text not null default 'pending',
  livekit_room text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_user_status_idx on public.bookings (user_id, status);
create index if not exists bookings_date_status_idx on public.bookings (date, status);

-- ─── Materials ───────────────────────────────────────────────────────────────
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  file_url text not null,
  file_name text not null,
  file_type text not null default 'other',
  category text not null default 'other',
  sent_by text not null,
  sent_to uuid[] not null default '{}',
  is_for_all boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists materials_broadcast_idx on public.materials (is_for_all, created_at desc);
create index if not exists materials_sent_to_idx on public.materials using gin (sent_to);

-- ─── Shopping ────────────────────────────────────────────────────────────────
create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null,
  description jsonb not null default '{"en":"","mn":"","de":""}',
  price numeric not null,
  image text default '',
  category text default 'general',
  stock int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Orders ──────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.shopping_items(id) on delete restrict,
  item_name text not null,
  quantity int not null default 1 check (quantity >= 1),
  amount numeric not null check (amount >= 0),
  currency text not null default 'MNT',
  qpay_invoice_id text unique not null,
  qpay_invoice_no text default '',
  qpay_qr_text text default '',
  qpay_qr_image text default '',
  qpay_urls jsonb not null default '[]',
  locale text default 'en',
  status text not null default 'pending',
  paid_amount numeric default 0,
  paid_at timestamptz,
  expires_at timestamptz,
  qpay_raw jsonb,
  qpay_raw_check jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_status_created_idx on public.orders (status, created_at desc);
create index if not exists orders_item_created_idx on public.orders (item_id, created_at desc);

-- ─── Opportunities ───────────────────────────────────────────────────────────
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title jsonb not null,
  provider jsonb not null,
  location jsonb not null,
  deadline text not null,
  posted_date text,
  description jsonb not null,
  requirements jsonb not null default '{"en":[],"mn":[]}',
  tags jsonb not null default '[]',
  link text not null,
  image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── News ────────────────────────────────────────────────────────────────────
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null,
  summary jsonb not null,
  content jsonb not null,
  author text default 'Admin',
  published_date timestamptz default now(),
  image text not null,
  tags jsonb not null default '[]',
  featured boolean default false,
  views int not null default 0,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Clubs ───────────────────────────────────────────────────────────────────
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  club_id text unique not null,
  name jsonb not null,
  description jsonb default '{"en":"","mn":""}',
  image text,
  website text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Events ──────────────────────────────────────────────────────────────────
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null,
  description jsonb not null,
  date timestamptz not null,
  time_string text not null,
  location jsonb not null,
  image text not null,
  category text not null,
  link text,
  university text not null default 'MNUMS',
  status text not null default 'upcoming',
  featured boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_attendees (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  primary key (event_id, user_id)
);

-- ─── Lessons ─────────────────────────────────────────────────────────────────
create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  title jsonb not null,
  description jsonb not null,
  category text not null,
  country_tag text default 'General',
  icon text default 'FaBook',
  color text default 'blue',
  focus jsonb default '{"mn":[],"en":[]}',
  image_url text,
  video_url text,
  status text not null default 'active',
  difficulty text default 'beginner',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_attendees (
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  primary key (lesson_id, user_id)
);

-- ─── updated_at trigger ──────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ declare t text; begin
  foreach t in array array[
    'users','applications','bookings','materials','shopping_items','orders',
    'opportunities','news','clubs','events','lessons'
  ] loop
    execute format('drop trigger if exists set_%s_updated_at on public.%s', t, t);
    execute format(
      'create trigger set_%s_updated_at before update on public.%s for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;

-- ─── Atomic stock decrement (QPay payment) ───────────────────────────────────
create or replace function public.decrement_stock(p_item_id uuid, p_quantity int)
returns boolean
language plpgsql
as $$
declare
  updated int;
begin
  update public.shopping_items
  set stock = stock - p_quantity
  where id = p_item_id and stock >= p_quantity;

  get diagnostics updated = row_count;
  return updated = 1;
end;
$$;

-- Drop sample todos table if present
drop table if exists public.todos;

-- See also: supabase/phone_apply_admin.sql (phone OTP, apply questions, admin notifications)

