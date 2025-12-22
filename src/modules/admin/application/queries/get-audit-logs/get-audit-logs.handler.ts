import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAuditLogsQuery } from './get-audit-logs.query';

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ipAddress: string;
  timestamp: Date;
}

export interface AuditLogsDto {
  data: AuditLogEntry[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// In-memory audit log store (would be database in production)
const auditLogs: AuditLogEntry[] = [
  {
    id: 'audit-1',
    userId: 'admin-1',
    userName: 'Super Admin',
    action: 'login',
    resource: 'auth',
    details: { method: 'password' },
    ipAddress: '192.168.1.1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'audit-2',
    userId: 'admin-1',
    userName: 'Super Admin',
    action: 'update_config',
    resource: 'system_config',
    details: { field: 'maintenanceMode', oldValue: false, newValue: true },
    ipAddress: '192.168.1.1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 'audit-3',
    userId: 'staff-1',
    userName: 'Staff Member',
    action: 'verify_payment',
    resource: 'payment',
    details: { paymentId: 'pay-123', amount: 1500000 },
    ipAddress: '192.168.1.10',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: 'audit-4',
    userId: 'admin-1',
    userName: 'Super Admin',
    action: 'reset_password',
    resource: 'user',
    details: { targetUserId: 'user-456' },
    ipAddress: '192.168.1.1',
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: 'audit-5',
    userId: 'instructor-1',
    userName: 'John Instructor',
    action: 'create_class',
    resource: 'class',
    details: { className: 'Python Batch 2', courseId: 'course-123' },
    ipAddress: '192.168.1.20',
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
  },
];

// Export function to add audit logs from other parts of the app
export function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  auditLogs.unshift({
    ...entry,
    id: `audit-${Date.now()}`,
    timestamp: new Date(),
  });
  // Keep only last 1000 entries
  if (auditLogs.length > 1000) {
    auditLogs.pop();
  }
}

@QueryHandler(GetAuditLogsQuery)
export class GetAuditLogsHandler implements IQueryHandler<GetAuditLogsQuery> {
  execute(query: GetAuditLogsQuery): Promise<AuditLogsDto> {
    let filtered = [...auditLogs];

    // Apply filters
    if (query.userId) {
      filtered = filtered.filter((log) => log.userId === query.userId);
    }
    if (query.action) {
      filtered = filtered.filter((log) => log.action === query.action);
    }
    if (query.resource) {
      filtered = filtered.filter((log) => log.resource === query.resource);
    }
    if (query.startDate) {
      filtered = filtered.filter((log) => log.timestamp >= query.startDate!);
    }
    if (query.endDate) {
      filtered = filtered.filter((log) => log.timestamp <= query.endDate!);
    }

    // Sort by timestamp desc
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / query.limit);
    const start = (query.page - 1) * query.limit;
    const data = filtered.slice(start, start + query.limit);

    return Promise.resolve({
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages,
      },
    });
  }
}

