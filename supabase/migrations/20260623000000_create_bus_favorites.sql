create table public.bus_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bus_id uuid not null references public.buses(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (user_id, bus_id)
);

alter table public.bus_favorites enable row level security;

create policy favorites_select_authenticated
on public.bus_favorites for select
to authenticated
using (true);

create policy favorites_insert_own
on public.bus_favorites for insert
to authenticated
with check (user_id = auth.uid());

create policy favorites_delete_own
on public.bus_favorites for delete
to authenticated
using (user_id = auth.uid());
