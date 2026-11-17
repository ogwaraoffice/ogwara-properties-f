-- Ogwara Properties production foundation
-- Run in Supabase SQL Editor. The public signup role is always customer.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null check (category in ('rent', 'sale', 'shortlet')),
  property_type text not null,
  area text not null,
  street text not null default '',
  landmarks text[] not null default '{}',
  price numeric(14,2) not null check (price >= 0),
  period text check (period in ('year', 'night') or period is null),
  bedrooms integer,
  bathrooms integer,
  student_walk integer,
  power text not null default 'Ask for current details',
  water text not null default 'Ask for current details',
  description text not null,
  images text[] not null default '{}',
  verified boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favourites (
  user_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, property_id)
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''), 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.favourites enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- Profiles: users can read/update their own basic profile, but never change their role.
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
drop policy if exists "Users update own name" on public.profiles;
create policy "Users update own name" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = 'customer');

-- Public can only read published properties. Only admin can create/update/delete.
drop policy if exists "Anyone reads published properties" on public.properties;
create policy "Anyone reads published properties" on public.properties for select using (published = true or public.is_admin());
drop policy if exists "Admins manage properties" on public.properties;
create policy "Admins manage properties" on public.properties for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Customers manage only their own favourites.
drop policy if exists "Users manage own favourites" on public.favourites;
create policy "Users manage own favourites" on public.favourites for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists properties_published_created_idx on public.properties (published, created_at desc);
create index if not exists properties_area_category_idx on public.properties (area, category);

-- After you create your account using ogwaraoffice@gmail.com and verify it,
-- run this statement once to grant administrator access:
-- update public.profiles p set role = 'admin'
-- from auth.users u where p.id = u.id and u.email = 'ogwaraoffice@gmail.com';

-- Create a public Storage bucket named "property-images" in Supabase Storage.
-- Add policies so admins can upload/update/delete; public can read published property images.

-- Storage policies for the public property-images bucket.
-- Create the bucket in Storage first and keep it public so listing photos can be indexed/viewed.
drop policy if exists "Public reads property photos" on storage.objects;
create policy "Public reads property photos" on storage.objects for select to public
using (bucket_id = 'property-images');
drop policy if exists "Admins upload property photos" on storage.objects;
create policy "Admins upload property photos" on storage.objects for insert to authenticated
with check (bucket_id = 'property-images' and public.is_admin());
drop policy if exists "Admins update property photos" on storage.objects;
create policy "Admins update property photos" on storage.objects for update to authenticated
using (bucket_id = 'property-images' and public.is_admin())
with check (bucket_id = 'property-images' and public.is_admin());
drop policy if exists "Admins delete property photos" on storage.objects for delete to authenticated
using (bucket_id = 'property-images' and public.is_admin());
