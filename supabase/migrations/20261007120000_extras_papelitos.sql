-- Papelitos: compras (Hotmart), extras desbloqueables y personaje con foto.

-- 1) Qué producto de Hotmart desbloquea qué parte del app.
create table if not exists public.productos_hotmart (
  hotmart_product_id text primary key,
  clave text not null check (clave in ('kit', 'premium', 'colorear', 'carita')),
  nombre text,
  creado timestamptz not null default now()
);
alter table public.productos_hotmart enable row level security;
-- Sin políticas: solo el servidor (service role) la lee.

-- 2) Compras recibidas por el aviso (webhook) de Hotmart. Una fila por transacción.
create table if not exists public.compras (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  clave text not null check (clave in ('kit', 'premium', 'colorear', 'carita')),
  transaccion text not null unique,
  hotmart_product_id text,
  estado text not null default 'activo' check (estado in ('activo', 'revocado')),
  evento text,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index if not exists compras_email_idx on public.compras (lower(email));
alter table public.compras enable row level security;

-- Cada persona logueada ve solo las compras de su propio e-mail.
drop policy if exists "ver mis compras" on public.compras;
create policy "ver mis compras" on public.compras
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- 3) Personaje con la carita: guarda solo las imágenes generadas (nunca la foto).
create table if not exists public.personajes_carita (
  user_id uuid primary key references auth.users (id) on delete cascade,
  genero text not null default 'nino' check (genero in ('nino', 'nina')),
  looks jsonb not null default '{}'::jsonb, -- { "ninguno": "user_id/ninguno.png", ... }
  creaciones int not null default 0,
  regeneraciones int not null default 0,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
alter table public.personajes_carita enable row level security;
drop policy if exists "ver mi personaje" on public.personajes_carita;
create policy "ver mi personaje" on public.personajes_carita
  for select to authenticated
  using (user_id = auth.uid());
-- Escritura solo desde el servidor (service role).

-- 4) Bucket privado para las imágenes generadas. Cada usuario lee solo su carpeta.
insert into storage.buckets (id, name, public)
values ('personajes', 'personajes', false)
on conflict (id) do nothing;

drop policy if exists "leer mis personajes" on storage.objects;
create policy "leer mis personajes" on storage.objects
  for select to authenticated
  using (bucket_id = 'personajes' and (storage.foldername(name))[1] = auth.uid()::text);

-- 5) Guarda un look generado sin pisar los otros (los looks se generan en paralelo).
create or replace function public.guardar_look_carita(p_user uuid, p_look text, p_path text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.personajes_carita
     set looks = looks || jsonb_build_object(p_look, p_path),
         regeneraciones = regeneraciones + 1,
         actualizado = now()
   where user_id = p_user;
$$;
revoke all on function public.guardar_look_carita(uuid, text, text) from public, anon, authenticated;
