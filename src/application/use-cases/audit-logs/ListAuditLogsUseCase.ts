import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { AuditLog, AuditLogQuery, AuditAction } from '../../../domain/entities/AuditLog';

export interface ListAuditLogsInput {
  actorId?: string;
  action?: AuditAction;
  resource?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ListAuditLogsOutput {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * List Audit Logs Use Case
 * Retrieves paginated audit logs with filtering
 */
export class ListAuditLogsUseCase {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(input: ListAuditLogsInput = {}): Promise<ListAuditLogsOutput> {
    const { page = 1, limit = 20 } = input;

    const query: AuditLogQuery = {
      actorId: input.actorId,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
      page,
      limit,
    };

    const { logs, total } = await this.auditLogRepository.findAll(query);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
