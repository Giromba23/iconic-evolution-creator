-- Remover políticas de admin e permitir acesso público novamente
drop policy if exists "Only admins can insert entries" on public.evolution_entries;
drop policy if exists "Only admins can update entries" on public.evolution_entries;
drop policy if exists "Only admins can delete entries" on public.evolution_entries;

create policy "Anyone can insert entries"
on public.evolution_entries
for insert
to anon, authenticated
with check (true);

create policy "Anyone can update entries"
on public.evolution_entries
for update
to anon, authenticated
using (true);

create policy "Anyone can delete entries"
on public.evolution_entries
for delete
to anon, authenticated
using (true);