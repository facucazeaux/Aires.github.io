-- Ejecutá en Supabase SQL Editor (después de setup.sql / security-update.sql)

-- ── Slug en productos (URLs amigables) ──────────────────────
alter table public.productos add column if not exists slug text;

create unique index if not exists productos_slug_idx on public.productos (slug)
  where slug is not null;

-- Los slugs se generan al guardar desde el admin.
-- Editá y guardá cada producto existente para asignar slug automático.

-- ── Consultas de contacto ───────────────────────────────────
create table if not exists public.consultas (
  id bigint generated always as identity primary key,
  nombre text not null,
  email text not null,
  telefono text default '',
  mensaje text default '',
  leida boolean default false,
  created_at timestamptz default now()
);

alter table public.consultas enable row level security;

drop policy if exists "Public insert consultas" on public.consultas;
create policy "Public insert consultas"
  on public.consultas for insert
  to anon, authenticated
  with check (
    char_length(nombre) between 1 and 120
    and char_length(email) between 5 and 200
    and char_length(coalesce(telefono, '')) <= 40
    and char_length(coalesce(mensaje, '')) <= 2000
  );

drop policy if exists "Admin read consultas" on public.consultas;
create policy "Admin read consultas"
  on public.consultas for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admin update consultas" on public.consultas;
create policy "Admin update consultas"
  on public.consultas for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admin delete consultas" on public.consultas;
create policy "Admin delete consultas"
  on public.consultas for delete
  to authenticated
  using (public.is_admin());
