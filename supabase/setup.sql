-- Ejecutá este script en Supabase → SQL Editor (una sola vez).
-- Después asigná role admin: Authentication → Users → Edit → App Metadata → { "role": "admin" }

-- ── Categorías ──────────────────────────────────────────────
create table if not exists public.categorias (
  id bigint generated always as identity primary key,
  nombre text not null unique,
  descripcion text default '',
  imagen text default '',
  orden int default 0,
  created_at timestamptz default now()
);

-- ── Productos ─────────────────────────────────────────────
create table if not exists public.productos (
  id bigint generated always as identity primary key,
  codigo text,
  categoria text not null default 'Tractor',
  marca text not null,
  modelo text not null,
  medida text not null,
  construccion text default 'Radial',
  aplicacion text,
  "indiceCarga" text,
  velocidad text,
  profundidad text,
  imagen text,
  created_at timestamptz default now()
);

-- Categorías iniciales (ignora duplicados)
insert into public.categorias (nombre, descripcion, imagen, orden) values
  ('Tractor', 'R1, R1W, radial y diagonal para máxima tracción y durabilidad en todo tipo de suelo.', '/Aires.github.io/img-neumaticos/tractor_home.jpg', 1),
  ('Cosechadora', 'Baja compactación y alta capacidad de carga para proteger el suelo en cosecha.', '/Aires.github.io/img-neumaticos/cosechadora_home.jpg', 2),
  ('Implemento', 'Carros, sembradoras, pulverizadoras y todo lo que rueda en el campo.', '/Aires.github.io/img-neumaticos/sembradora_home.webp', 3)
on conflict (nombre) do nothing;

-- ── Admin helper (usa app_metadata, NO user_metadata) ───────
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

-- ── Row Level Security ──────────────────────────────────────
alter table public.categorias enable row level security;
alter table public.productos enable row level security;

-- Lectura pública (catálogo)
drop policy if exists "Lectura pública categorías" on public.categorias;
create policy "Lectura pública categorías"
  on public.categorias for select using (true);

drop policy if exists "Lectura pública productos" on public.productos;
create policy "Lectura pública productos"
  on public.productos for select using (true);

-- Escritura solo admins autenticados
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

-- ── Storage: imágenes de productos y categorías ─────────────
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

-- ── Importar productos ──────────────────────────────────────
-- Table Editor → productos → Import from CSV → supabase/productos.csv
