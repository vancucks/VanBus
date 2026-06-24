create table if not exists public.bus_feedbacks (
  id uuid primary key default gen_random_uuid(),
  bus_id uuid not null references public.buses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null check (char_length(text) <= 500),
  created_at timestamp with time zone default now()
);

alter table public.bus_feedbacks enable row level security;

drop policy if exists feedbacks_select_authenticated on public.bus_feedbacks;
create policy feedbacks_select_authenticated
on public.bus_feedbacks for select
to authenticated
using (true);

drop policy if exists feedbacks_insert_own on public.bus_feedbacks;
create policy feedbacks_insert_own
on public.bus_feedbacks for insert
to authenticated
with check (user_id = auth.uid());
