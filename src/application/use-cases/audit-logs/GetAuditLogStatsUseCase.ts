import { IAuditLogRepository } from '../../../domain/repositories/IAuditLogRepository';
import { AuditLogAggregation } from '../../../domain/entities/AuditLog';

export interface GetAuditLogStatsInput {
  startDate: string;
  endDate: string;
  groupBy: 'action' | 'resource' | 'actor';
}

export interface GetAuditLogStatsOutput {
  aggregations: AuditLogAggregation[];
  period: {
    startDate: Date;
    endDate: Date;
  };
}

/**
 * Get Audit Log Stats Use Case
 * Retrieves aggregated audit log statistics
 */
export class GetAuditLogStatsUseCase {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(input: GetAuditLogStatsInput): Promise<GetAuditLogStatsOutput> {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    let aggregations: AuditLogAggregation[];

    switch (input.groupBy) {
      case 'action':
        aggregations = await this.auditLogRepository.aggregateByAction(startDate, endDate);
        break;
      case 'resource':
        aggregations = await this.auditLogRepository.aggregateByResource(startDate, endDate);
        break;
      case 'actor':
        aggregations = await this.auditLogRepository.aggregateByActor(startDate, endDate);
        break;
      default:
        aggregations = await this.auditLogRepository.aggregateByAction(startDate, endDate);
    }

    return {
      aggregations,
      period: { startDate, endDate },
    };
  }
}
