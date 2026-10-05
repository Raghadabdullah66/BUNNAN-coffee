create extension if not exists pgcrypto;

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  english_name text,
  description text not null default '',
  price numeric(8, 2) not null check (price >= 0),
  category text not null,
  image_url text not null default '',
  available boolean not null default true,
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.menu_items enable row level security;

create table if not exists public.menu_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.menu_admins enable row level security;

create policy "Admins can read their own membership"
on public.menu_admins for select to authenticated
using (user_id = auth.uid());

create policy "Anyone can read available menu items"
on public.menu_items for select to anon, authenticated
using (available = true);

create policy "Admins can read all menu items"
on public.menu_items for select to authenticated
using (exists (select 1 from public.menu_admins where user_id = auth.uid()));

create policy "Admins can add menu items"
on public.menu_items for insert to authenticated
with check (exists (select 1 from public.menu_admins where user_id = auth.uid()));

create policy "Admins can edit menu items"
on public.menu_items for update to authenticated
using (exists (select 1 from public.menu_admins where user_id = auth.uid()))
with check (exists (select 1 from public.menu_admins where user_id = auth.uid()));

create policy "Admins can delete menu items"
on public.menu_items for delete to authenticated
using (exists (select 1 from public.menu_admins where user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

create policy "Anyone can view menu images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'menu-images');

create policy "Authenticated users can upload menu images"
on storage.objects for insert to authenticated
with check (bucket_id = 'menu-images' and exists (select 1 from public.menu_admins where user_id = auth.uid()));

create policy "Authenticated users can update menu images"
on storage.objects for update to authenticated
using (bucket_id = 'menu-images' and exists (select 1 from public.menu_admins where user_id = auth.uid()))
with check (bucket_id = 'menu-images' and exists (select 1 from public.menu_admins where user_id = auth.uid()));

create policy "Authenticated users can delete menu images"
on storage.objects for delete to authenticated
using (bucket_id = 'menu-images' and exists (select 1 from public.menu_admins where user_id = auth.uid()));