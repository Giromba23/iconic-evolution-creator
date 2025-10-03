-- Create user roles enum
create type public.app_role as enum ('admin', 'user');

-- Create user_roles table
create table public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role app_role not null,
    created_at timestamp with time zone default now() not null,
    unique (user_id, role)
);

-- Enable RLS on user_roles
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS policies for user_roles
create policy "Users can view their own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Only admins can insert roles"
on public.user_roles
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update roles"
on public.user_roles
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete roles"
on public.user_roles
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Update evolution_entries RLS policies to require admin
drop policy if exists "Allow public delete access" on public.evolution_entries;
drop policy if exists "Allow public insert access" on public.evolution_entries;
drop policy if exists "Allow public update access" on public.evolution_entries;

create policy "Anyone can view entries"
on public.evolution_entries
for select
to anon, authenticated
using (true);

create policy "Only admins can insert entries"
on public.evolution_entries
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can update entries"
on public.evolution_entries
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Only admins can delete entries"
on public.evolution_entries
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));