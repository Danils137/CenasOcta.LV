create extension if not exists "uuid-ossp";

create table if not exists public.user_companies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  registration_number text,
  vat_number text,
  address text,
  contact_person text,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_user_companies_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger user_companies_set_updated_at
before update on public.user_companies
for each row
execute procedure public.set_user_companies_updated_at();

alter table public.user_companies enable row level security;

create policy "Users can view own companies" on public.user_companies
for select
using (auth.uid() = user_id);

create policy "Users can insert own companies" on public.user_companies
for insert
with check (auth.uid() = user_id);

create policy "Users can update own companies" on public.user_companies
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own companies" on public.user_companies
for delete
using (auth.uid() = user_id);
