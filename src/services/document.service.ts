import { documentRepository } from '@/repositories/document.repository'
import { auditRepository } from '@/repositories/audit.repository'
import type { QueryResult, QueryListResult } from '@/repositories/base.repository'
import type { Document } from '@/types'

export const documentService = {
  listByOrganization(orgId: string): Promise<QueryListResult<Document>> {
    return documentRepository.findByOrganization(orgId)
  },

  listByType(orgId: string, type: string): Promise<QueryListResult<Document>> {
    return documentRepository.findByType(orgId, type)
  },

  async upload(
    params: {
      file: File
      organizationId: string
      type: string
      uploadedBy: string
    }
  ): Promise<QueryResult<Document>> {
    const result = await documentRepository.upload(params)

    if (result.data) {
      await auditRepository.log({
        userId: params.uploadedBy,
        action: 'document.upload',
        entityType: 'documents',
        entityId: result.data.id,
        organizationId: params.organizationId,
        metadata: { name: params.file.name, type: params.type, size: params.file.size },
      })
    }

    return result
  },

  getDownloadUrl(storagePath: string) {
    return documentRepository.getDownloadUrl(storagePath)
  },

  async remove(id: string, storagePath: string, actorId: string, orgId: string) {
    const result = await documentRepository.remove(id, storagePath)

    if (!result.error) {
      await auditRepository.log({
        userId: actorId,
        action: 'document.delete',
        entityType: 'documents',
        entityId: id,
        organizationId: orgId,
      })
    }

    return result
  },
}
