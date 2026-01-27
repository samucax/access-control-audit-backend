import { IAuditLogRepository } from '../../../../domain/repositories/IAuditLogRepository';
import {
  AuditLog,
  CreateAuditLogDTO,
  AuditLogQuery,
  AuditLogAggregation,
} from '../../../../domain/entities/AuditLog';
import { AuditLogModel, IAuditLogDocument } from '../models/AuditLogModel';
import mongoose from 'mongoose';

/**
 * MongoDB implementation of AuditLog Repository
 * Includes aggregation pipeline examples for analytics
 */
export class MongoAuditLogRepository implements IAuditLogRepository {
  private mapToEntity(doc: IAuditLogDocument): AuditLog {
    return {
      id: doc._id.toString(),
      actorId: doc.actorId.toString(),
      actorEmail: doc.actorEmail,
      action: doc.action,
      resource: doc.resource,
      resourceId: doc.resourceId,
      metadata: doc.metadata,
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      timestamp: doc.timestamp,
    };
  }

  async create(data: CreateAuditLogDTO): Promise<AuditLog> {
    const auditLog = await AuditLogModel.create({
      ...data,
      metadata: data.metadata || {},
      timestamp: new Date(),
    });
    return this.mapToEntity(auditLog);
  }

  async findById(id: string): Promise<AuditLog | null> {
    const auditLog = await AuditLogModel.findById(id);
    return auditLog ? this.mapToEntity(auditLog) : null;
  }

  async findAll(query: AuditLogQuery): Promise<{ logs: AuditLog[]; total: number }> {
    const { page = 1, limit = 20, actorId, action, resource, resourceId, startDate, endDate } = query;

    const filter: Record<string, unknown> = {};

    if (actorId) filter.actorId = new mongoose.Types.ObjectId(actorId);
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (resourceId) filter.resourceId = resourceId;

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) (filter.timestamp as Record<string, Date>).$gte = startDate;
      if (endDate) (filter.timestamp as Record<string, Date>).$lte = endDate;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLogModel.find(filter).skip(skip).limit(limit).sort({ timestamp: -1 }),
      AuditLogModel.countDocuments(filter),
    ]);

    return {
      logs: logs.map((log) => this.mapToEntity(log)),
      total,
    };
  }

  async findByActorId(actorId: string, page: number, limit: number): Promise<AuditLog[]> {
    const skip = (page - 1) * limit;
    const logs = await AuditLogModel.find({ actorId })
      .skip(skip)
      .limit(limit)
      .sort({ timestamp: -1 });
    return logs.map((log) => this.mapToEntity(log));
  }

  async findByResource(resource: string, page: number, limit: number): Promise<AuditLog[]> {
    const skip = (page - 1) * limit;
    const logs = await AuditLogModel.find({ resource })
      .skip(skip)
      .limit(limit)
      .sort({ timestamp: -1 });
    return logs.map((log) => this.mapToEntity(log));
  }

  /**
   * Aggregation: Count audit logs grouped by action type
   */
  async aggregateByAction(startDate: Date, endDate: Date): Promise<AuditLogAggregation[]> {
    return AuditLogModel.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { action: '$action' },
          count: { $sum: 1 },
          firstOccurrence: { $min: '$timestamp' },
          lastOccurrence: { $max: '$timestamp' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
  }

  /**
   * Aggregation: Count audit logs grouped by resource
   */
  async aggregateByResource(startDate: Date, endDate: Date): Promise<AuditLogAggregation[]> {
    return AuditLogModel.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { resource: '$resource' },
          count: { $sum: 1 },
          firstOccurrence: { $min: '$timestamp' },
          lastOccurrence: { $max: '$timestamp' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
  }

  /**
   * Aggregation: Count audit logs grouped by actor
   */
  async aggregateByActor(startDate: Date, endDate: Date): Promise<AuditLogAggregation[]> {
    return AuditLogModel.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { actorId: '$actorId' },
          count: { $sum: 1 },
          firstOccurrence: { $min: '$timestamp' },
          lastOccurrence: { $max: '$timestamp' },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 100,
      },
    ]);
  }

  /**
   * Get complete audit trail for a specific resource instance
   */
  async getResourceAuditTrail(resource: string, resourceId: string): Promise<AuditLog[]> {
    const logs = await AuditLogModel.find({ resource, resourceId }).sort({ timestamp: 1 });
    return logs.map((log) => this.mapToEntity(log));
  }
}
