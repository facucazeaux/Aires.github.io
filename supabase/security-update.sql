-- Ejecutá si ya corriste setup.sql antes (actualiza seguridad + storage).
-- IMPORTANTE: asigná role admin al usuario en Supabase Dashboard:
-- Authentication → Users → tu admin → Edit user → App Metadata → { "role": "admin" }

-- ── Helper: solo admins (app_metadata, NO user_metadata) ─────
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ── RLS más estricto (reemplaza políticas permisivas) ────────
drop policy if exists "Admin insert categorías" on public.categorias;
drop policy if exists "Admin update categorías" on public.categorias;
drop policy if exists "Admin delete categorías" on public.categorias;
drop policy if exists "Admin insert productos" on public.productos;
drop policy if exists "Admin update productos" on public.productos;
drop policy if exists "Admin delete productos" on public.productos;

create policy "Admin insert categorías"
  on public.categorias for insert to authenticated
  with check (public.is_admin());

create policy "Admin update categorías"
  on public.categorias for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admin delete categorías"
  on public.categorias for delete to authenticated
  using (public.is_admin());

create policy "Admin insert productos"
  on public.productos for insert to authenticated
  with check (public.is_admin());

create policy "Admin update productos"
  on public.productos for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admin delete productos"
  on public.productos for delete to authenticated
  using (public.is_admin());

-- ── Storage: bucket de imágenes ──────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'imagenes',
  'imagenes',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read imagenes" on storage.objects;
drop policy if exists "Admin insert imagenes" on storage.objects;
drop policy if exists "Admin update imagenes" on storage.objects;
drop policy if exists "Admin delete imagenes" on storage.objects;

create policy "Public read imagenes"
  on storage.objects for select
  using (bucket_id = 'imagenes');

create policy "Admin insert imagenes"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'imagenes' and public.is_admin());

create policy "Admin update imagenes"
  on storage.objects for update to authenticated
  using (bucket_id = 'imagenes' and public.is_admin())
  with check (bucket_id = 'imagenes' and public.is_admin());

create policy "Admin delete imagenes"
  on storage.objects for delete to authenticated
  using (bucket_id = 'imagenes' and public.is_admin());
