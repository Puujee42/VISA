-- Phone auth, apply questions, admin notifications (run in Supabase SQL Editor)

alter table public.users
  add column if not exists phone text;

create unique index if not exists users_phone_unique
  on public.users (phone)
  where phone is not null and phone <> '';

alter table public.applications
  add column if not exists answers jsonb not null default '{}'::jsonb;

create table if not exists public.phone_otps (
  phone text primary key,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.apply_questions (
  id uuid primary key default gen_random_uuid(),
  field_key text unique not null,
  label jsonb not null default '{"en":"","mn":"","de":""}'::jsonb,
  type text not null default 'text',
  options jsonb not null default '[]'::jsonb,
  required boolean not null default true,
  sort_order int not null default 0,
  is_active boolean not null default true,
  is_system boolean not null default false,
  placeholder jsonb not null default '{"en":"","mn":"","de":""}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists apply_questions_active_sort_idx
  on public.apply_questions (is_active, sort_order);

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'application',
  title text not null,
  body text default '',
  link text default '/admin',
  meta jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists admin_notifications_unread_idx
  on public.admin_notifications (is_read, created_at desc);

-- Seed default apply questions (skip if already present)
insert into public.apply_questions (field_key, label, type, options, required, sort_order, is_system, placeholder)
values
  (
    'firstName',
    '{"en":"First name","mn":"Нэр","de":"Vorname"}'::jsonb,
    'text', '[]'::jsonb, true, 10, true,
    '{"en":"","mn":"","de":""}'::jsonb
  ),
  (
    'lastName',
    '{"en":"Last name","mn":"Овог","de":"Nachname"}'::jsonb,
    'text', '[]'::jsonb, true, 20, true,
    '{"en":"","mn":"","de":""}'::jsonb
  ),
  (
    'email',
    '{"en":"Email","mn":"И-мэйл","de":"E-Mail"}'::jsonb,
    'email', '[]'::jsonb, true, 30, true,
    '{"en":"","mn":"","de":""}'::jsonb
  ),
  (
    'phone',
    '{"en":"Phone","mn":"Утас","de":"Telefon"}'::jsonb,
    'phone', '[]'::jsonb, true, 40, true,
    '{"en":"99918122","mn":"99918122","de":"99918122"}'::jsonb
  ),
  (
    'age',
    '{"en":"Age","mn":"Нас","de":"Alter"}'::jsonb,
    'number', '[]'::jsonb, true, 50, true,
    '{"en":"","mn":"","de":""}'::jsonb
  ),
  (
    'level',
    '{"en":"Language level","mn":"Хэлний түвшин","de":"Sprachniveau"}'::jsonb,
    'select',
    '["A1","A2","B1","B2","C1"]'::jsonb,
    true, 60, true,
    '{"en":"","mn":"","de":""}'::jsonb
  ),
  (
    'message',
    '{"en":"Message","mn":"Нэмэлт мэдээлэл","de":"Nachricht"}'::jsonb,
    'textarea', '[]'::jsonb, false, 70, true,
    '{"en":"Optional","mn":"Заавал биш","de":"Optional"}'::jsonb
  )
on conflict (field_key) do nothing;

-- Promote admin phone if user already exists
update public.users
set role = 'admin'
where phone = '99918122' or email = '99918122@phone.aupair.mn';
