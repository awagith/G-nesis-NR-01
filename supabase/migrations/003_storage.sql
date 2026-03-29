-- ============================================================
-- Gênesis NR-01 — Migration 003: Supabase Storage
-- Execute no SQL Editor do Supabase após a migration 002.
-- ============================================================

-- Criar bucket privado de documentos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  52428800, -- 50MB por arquivo
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do nothing;

-- ─── Políticas de Storage ─────────────────────────────────────────────────────

-- Upload: genesis e client_executive da mesma org
create policy "storage: upload autenticados"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and auth_role() in ('genesis', 'client_executive', 'professional')
  );

-- Download: usuários da mesma organização (path começa com org_id)
create policy "storage: download da mesma org"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (
      auth_role() = 'genesis'
      or (auth_org_id() is not null
          and (storage.foldername(name))[1] = auth_org_id()::text)
    )
  );

-- Delete: genesis e client_executive da mesma org
create policy "storage: delete genesis e client_executive"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and (
      auth_role() = 'genesis'
      or (auth_role() = 'client_executive'
          and (storage.foldername(name))[1] = auth_org_id()::text)
    )
  );
