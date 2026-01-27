import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { AuditLog } from '../../../domain/entities/AuditLog';

export interface GetResourceAuditTrailInput {
  resource: string;
  resourceId: string;
}

/**
 * Get Resource Audit Trail Use Case
 * Retrieves complete audit history for a specific resource
 */
export class GetResourceAuditTrailUseCase {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(input: GetResourceAuditTrailInput): Promise<AuditLog[]> {
    return this.auditLogRepository.getResourceAuditTrail(input.resource, input.resourceId);
  }
}
