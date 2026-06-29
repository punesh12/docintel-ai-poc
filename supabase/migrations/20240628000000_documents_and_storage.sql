-- Documents table
create table if not exists public.documents (
  id uuid primary key,
  name text not null,
  size bigint not null,
  storage_path text not null,
  public_url text,
  status text not null default 'processing'
    check (status in ('uploading', 'processing', 'ready', 'failed')),
  uploaded_at timestamptz not null default now(),
  processed_at timestamptz,
  page_count integer
);

create index if not exists documents_uploaded_at_idx on public.documents (uploaded_at desc);

alter table public.documents enable row level security;

drop policy if exists "documents_select_anon" on public.documents;
create policy "documents_select_anon"
  on public.documents for select
  to anon, authenticated
  using (true);

drop policy if exists "documents_insert_anon" on public.documents;
create policy "documents_insert_anon"
  on public.documents for insert
  to anon, authenticated
  with check (true);

drop policy if exists "documents_update_anon" on public.documents;
create policy "documents_update_anon"
  on public.documents for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "documents_delete_anon" on public.documents;
create policy "documents_delete_anon"
  on public.documents for delete
  to anon, authenticated
  using (true);

-- Storage bucket (public so PDF.js can load files via URL)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  true,
  104857600,
  array['application/pdf']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "documents_storage_select" on storage.objects;
create policy "documents_storage_select"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'documents');

drop policy if exists "documents_storage_insert" on storage.objects;
create policy "documents_storage_insert"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'documents');

drop policy if exists "documents_storage_update" on storage.objects;
create policy "documents_storage_update"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'documents')
  with check (bucket_id = 'documents');

drop policy if exists "documents_storage_delete" on storage.objects;
create policy "documents_storage_delete"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'documents');
