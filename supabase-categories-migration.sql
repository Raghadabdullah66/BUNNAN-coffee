create table if not exists public.menu_categories (
  name text primary key,
  english_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.menu_categories enable row level security;

grant select on public.menu_categories to anon, authenticated;
grant insert, delete on public.menu_categories to authenticated;

drop policy if exists "Anyone can read menu categories" on public.menu_categories;
create policy "Anyone can read menu categories"
on public.menu_categories for select to anon, authenticated
using (true);

drop policy if exists "Admins can add menu categories" on public.menu_categories;
create policy "Admins can add menu categories"
on public.menu_categories for insert to authenticated
with check (exists (select 1 from public.menu_admins where user_id = auth.uid()));

drop policy if exists "Admins can delete menu categories" on public.menu_categories;
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
