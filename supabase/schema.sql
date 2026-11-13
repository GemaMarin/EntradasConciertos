-- =====================================================================
-- Primera Fila · esquema de base de datos (Supabase / Postgres)
-- Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar varias veces.
-- =====================================================================

-- ---------- Perfiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_.]{3,24}$'),
  display_name text not null default '',
  avatar_url text,
  is_private boolean not null default false,
  cities text[] not null default array['madrid'],
  artists jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Crea el perfil automáticamente al registrarse (con Google trae nombre y foto)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  -- El usuario inicial se genera a partir del nombre (nunca del email, que es privado)
  full_name text := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '');
  base text := regexp_replace(
    translate(lower(full_name), 'áéíóúàèìòùäëïöüñç ', 'aeiouaeiouaeiounc.'), '[^a-z0-9_.]', '', 'g');
  candidate text;
begin
  base := trim(both '.' from base);
  if length(base) < 3 then base := base || 'fan'; end if;
  base := left(base, 18);
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    candidate := base || floor(random() * 10000)::int;
  end loop;
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    candidate,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Seguir (tipo Instagram) ----------
create table if not exists public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'accepted' check (status in ('accepted', 'pending')),
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
create index if not exists follows_following_idx on public.follows (following_id);

-- Si el perfil es privado, la solicitud queda pendiente
create or replace function public.set_follow_status()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    new.status := case when (select is_private from public.profiles where id = new.following_id)
                       then 'pending' else 'accepted' end;
  end if;
  return new;
end $$;

drop trigger if exists before_follow_insert on public.follows;
create trigger before_follow_insert before insert on public.follows
  for each row execute function public.set_follow_status();

-- ---------- Asistencia a conciertos ----------
-- Guardamos una copia del concierto (event) para no depender de la fuente original
create table if not exists public.attendance (
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id text not null,
  status text not null check (status in ('interested', 'going')),
  event jsonb not null,
  event_date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, event_id)
);
create index if not exists attendance_event_idx on public.attendance (event_id);
create index if not exists attendance_date_idx on public.attendance (event_date);

-- ---------- Permisos (Row Level Security) ----------
alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.attendance enable row level security;

-- ¿Puede el usuario actual ver la actividad de `target`?
create or replace function public.can_see(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select target = auth.uid()
    or not (select is_private from public.profiles where id = target)
    or exists (select 1 from public.follows
               where follower_id = auth.uid() and following_id = target and status = 'accepted');
$$;

drop policy if exists "perfiles visibles" on public.profiles;
create policy "perfiles visibles" on public.profiles for select to authenticated using (true);
drop policy if exists "editar mi perfil" on public.profiles;
create policy "editar mi perfil" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "ver follows" on public.follows;
create policy "ver follows" on public.follows for select to authenticated using (true);
drop policy if exists "seguir" on public.follows;
create policy "seguir" on public.follows for insert to authenticated with check (follower_id = auth.uid());
drop policy if exists "aceptar solicitud" on public.follows;
create policy "aceptar solicitud" on public.follows for update to authenticated
  using (following_id = auth.uid()) with check (following_id = auth.uid() and status = 'accepted');
drop policy if exists "dejar de seguir o quitar seguidor" on public.follows;
create policy "dejar de seguir o quitar seguidor" on public.follows for delete to authenticated
  using (follower_id = auth.uid() or following_id = auth.uid());

drop policy if exists "ver asistencia" on public.attendance;
create policy "ver asistencia" on public.attendance for select to authenticated using (public.can_see(user_id));
drop policy if exists "mi asistencia" on public.attendance;
create policy "mi asistencia" on public.attendance for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
