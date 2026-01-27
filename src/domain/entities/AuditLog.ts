/**
 * AuditLog Domain Entity
 * Framework-agnostic representation of an Audit Log entry
 */
export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export type AuditAction =
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGE'
  | 'PERMISSION_DENIED';

export interface CreateAuditLogDTO {
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
}

export interface AuditLogQuery {
  actorId?: string;
  action?: AuditAction;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface AuditLogAggregation {
  _id: {
    action?: string;
    resource?: string;
    actorId?: string;
  };
  count: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
}
