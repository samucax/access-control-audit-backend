import { z } from 'zod';

export const listAuditLogsQuerySchema = z.object({
  actorId: z.string().optional(),
  action: z
    .enum([
      'CREATE',
      'READ',
      'UPDATE',
      'DELETE',
      'LOGIN',
      'LOGOUT',
      'LOGIN_FAILED',
      'PASSWORD_CHANGE',
      'PERMISSION_DENIED',
    ])
    .optional(),
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const auditLogStatsQuerySchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  groupBy: z.enum(['action', 'resource', 'actor']).default('action'),
});

export const resourceAuditTrailParamsSchema = z.object({
  resource: z.string().min(1, 'Resource is required'),
  resourceId: z.string().min(1, 'Resource ID is required'),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
export type AuditLogStatsQuery = z.infer<typeof auditLogStatsQuerySchema>;
export type ResourceAuditTrailParams = z.infer<typeof resourceAuditTrailParamsSchema>;
