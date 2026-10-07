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

grant usage on schema public to anon, authenticated;
grant select on public.menu_items to anon, authenticated;
grant insert, update, delete on public.menu_items to authenticated;
grant select on public.menu_admins to authenticated;

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

create table if not exists public.menu_categories (
  name text primary key,
  english_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.menu_categories enable row level security;

grant select on public.menu_categories to anon, authenticated;
grant insert, delete on public.menu_categories to authenticated;

create policy "Anyone can read menu categories"
on public.menu_categories for select to anon, authenticated
using (true);

create policy "Admins can add menu categories"
on public.menu_categories for insert to authenticated
with check (exists (select 1 from public.menu_admins where user_id = auth.uid()));

create policy "Admins can delete menu categories"
on public.menu_categories for delete to authenticated
using (exists (select 1 from public.menu_admins where user_id = auth.uid()));

create or replace function public.rename_menu_category(
  p_old text,
  p_new text,
  p_en text
)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  if not exists (
    select 1 from public.menu_admins where user_id = auth.uid()
  ) then
    raise exception 'Only menu admins can rename categories' using errcode = '42501';
  end if;

  if nullif(btrim(p_new), '') is null or nullif(btrim(p_en), '') is null then
    raise exception 'Both category names are required' using errcode = '22023';
  end if;

  if p_new <> p_old and exists (
    select 1 from public.menu_categories where name = p_new
  ) then
    raise exception 'A category with that name already exists' using errcode = '23505';
  end if;

  update public.menu_categories
  set name = btrim(p_new),
      english_name = btrim(p_en)
  where name = p_old;

  if not found then
    raise exception 'Category not found' using errcode = 'P0002';
  end if;

  update public.menu_items
  set category = btrim(p_new)
  where category = p_old;
end;
$$;

revoke all on function public.rename_menu_category(text, text, text) from public;
grant execute on function public.rename_menu_category(text, text, text) to authenticated;

insert into public.menu_categories (name, english_name, sort_order)
values
  ('مشروبات الماتشا', 'Matcha Drinks', 1),
  ('الآساي', 'Acai', 2),
  ('كرواسون', 'Croissants', 3),
  ('مشروبات ساخنة', 'Hot Drinks', 4),
  ('مشروبات باردة', 'Cold Drinks', 6),
  ('مشروبات الموهيتو', 'Mojitos', 9),
  ('حلويات', 'Desserts', 10),
  ('مياه', 'Water', 11),
  ('الحليب', 'Milk', 12)
on conflict (name) do update
set english_name = excluded.english_name;

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