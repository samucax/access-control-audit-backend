import {
  AuditLog,
  CreateAuditLogDTO,
  AuditLogQuery,
  AuditLogAggregation,
} from '../entities/AuditLog';

/**
 * AuditLog Repository Interface
 * Defines the contract for audit log data access operations
 */
export interface IAuditLogRepository {
  create(data: CreateAuditLogDTO): Promise<AuditLog>;
  findById(id: string): Promise<AuditLog | null>;
  findAll(query: AuditLogQuery): Promise<{ logs: AuditLog[]; total: number }>;
  findByActorId(actorId: string, page: number, limit: number): Promise<AuditLog[]>;
  findByResource(resource: string, page: number, limit: number): Promise<AuditLog[]>;

  /**
   * Aggregate audit logs by action type
   * Returns count of each action type within a date range
   */
  aggregateByAction(startDate: Date, endDate: Date): Promise<AuditLogAggregation[]>;

  /**
   * Aggregate audit logs by resource
   * Returns count of actions per resource within a date range
   */
  aggregateByResource(startDate: Date, endDate: Date): Promise<AuditLogAggregation[]>;

  /**
   * Aggregate audit logs by actor
   * Returns count of actions per actor within a date range
   */
  aggregateByActor(startDate: Date, endDate: Date): Promise<AuditLogAggregation[]>;

  /**
   * Get audit trail for a specific resource instance
   */
  getResourceAuditTrail(resource: string, resourceId: string): Promise<AuditLog[]>;
}
