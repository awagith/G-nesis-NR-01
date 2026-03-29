import { supabase } from '@/lib/supabase'
import { BaseRepository, formatError } from '@/repositories/base.repository'
import type { QueryResult, QueryListResult } from '@/repositories/base.repository'
import type { Document } from '@/types'

const BUCKET = 'documents'

export class DocumentRepository extends BaseRepository<Document> {
  constructor() {
    super('documents')
  }

  async findByOrganization(organizationId: string): Promise<QueryListResult<Document>> {
    const { data, error, count } = await supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    return { data: (data as Document[]) ?? [], error: formatError(error), count }
  }

  async findByType(organizationId: string, type: string): Promise<QueryListResult<Document>> {
    const { data, error, count } = await supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)
      .eq('type', type)
      .order('created_at', { ascending: false })

    return { data: (data as Document[]) ?? [], error: formatError(error), count }
  }

  // Upload de arquivo para o Supabase Storage + registro na tabela
  async upload(params: {
    file: File
    organizationId: string
    type: string
    uploadedBy: string
  }): Promise<QueryResult<Document>> {
    const ext = params.file.name.split('.').pop()
    const storagePath = `${params.organizationId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    // 1. Upload para o Storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, params.file, { upsert: false })

    if (storageError) {
      return { data: null, error: storageError.message }
    }

    // 2. Registrar metadados na tabela
    const { data, error } = await supabase
      .from('documents')
      .insert({
        organization_id: params.organizationId,
        name: params.file.name,
        type: params.type,
        storage_path: storagePath,
        size_bytes: params.file.size,
        uploaded_by: params.uploadedBy,
      })
      .select()
      .single()

    return { data: data as Document | null, error: formatError(error) }
  }

  // Gera URL pública temporária para download (1 hora)
  async getDownloadUrl(storagePath: string): Promise<{ url: string | null; error: string | null }> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, 3600)

    return { url: data?.signedUrl ?? null, error: error?.message ?? null }
  }

  // Remove arquivo do Storage e da tabela
  async remove(id: string, storagePath: string): Promise<{ error: string | null }> {
    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([storagePath])

    if (storageError) return { error: storageError.message }

    return this.delete(id)
  }
}

export const documentRepository = new DocumentRepository()
