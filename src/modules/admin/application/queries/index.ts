import { GetUsersHandler } from './get-users/get-users.handler';
import { GetSystemAnalyticsHandler } from './get-system-analytics/get-system-analytics.handler';
import { ExportUsersHandler } from './export-users/export-users.handler';
import { GetDashboardHandler } from './get-dashboard/get-dashboard.handler';
import { GetUsersOverviewHandler } from './get-users-overview/get-users-overview.handler';
import { GetSystemHealthHandler } from './get-system-health/get-system-health.handler';
import { GetSystemConfigHandler } from './get-system-config/get-system-config.handler';
import { GetAuditLogsHandler } from './get-audit-logs/get-audit-logs.handler';
import { GetFinancialReportHandler } from './get-financial-report/get-financial-report.handler';
import { GetUserGrowthReportHandler } from './get-user-growth-report/get-user-growth-report.handler';
import { GetCoursePerformanceHandler } from './get-course-performance/get-course-performance.handler';

export const QueryHandlers = [
  GetUsersHandler,
  GetSystemAnalyticsHandler,
  ExportUsersHandler,
  GetDashboardHandler,
  GetUsersOverviewHandler,
  GetSystemHealthHandler,
  GetSystemConfigHandler,
  GetAuditLogsHandler,
  GetFinancialReportHandler,
  GetUserGrowthReportHandler,
  GetCoursePerformanceHandler,
];

export * from './get-users/get-users.query';
export * from './get-users/get-users.handler';
export * from './get-system-analytics/get-system-analytics.query';
export * from './get-system-analytics/get-system-analytics.handler';
export * from './export-users/export-users.query';
export * from './export-users/export-users.handler';
export * from './get-dashboard/get-dashboard.query';
export * from './get-dashboard/get-dashboard.handler';
export * from './get-users-overview/get-users-overview.query';
export * from './get-users-overview/get-users-overview.handler';
export * from './get-system-health/get-system-health.query';
export * from './get-system-health/get-system-health.handler';
export * from './get-system-config/get-system-config.query';
export * from './get-system-config/get-system-config.handler';
export * from './get-audit-logs/get-audit-logs.query';
export * from './get-audit-logs/get-audit-logs.handler';
export * from './get-financial-report/get-financial-report.query';
export * from './get-financial-report/get-financial-report.handler';
export * from './get-user-growth-report/get-user-growth-report.query';
export * from './get-user-growth-report/get-user-growth-report.handler';
export * from './get-course-performance/get-course-performance.query';
export * from './get-course-performance/get-course-performance.handler';

