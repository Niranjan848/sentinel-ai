create table public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scan_type text not null check (scan_type in ('url','email','image','audio','video')),
  input_summary text not null,
  risk_score integer not null check (risk_score between 0 and 100),
  attack_type text not null,
  confidence text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

alter table public.scans enable row level security;

create policy "Users can view own scans"
  on public.scans for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own scans"
  on public.scans for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete own scans"
  on public.scans for delete
  to authenticated
  using (auth.uid() = user_id);

create index scans_user_created_idx on public.scans(user_id, created_at desc);