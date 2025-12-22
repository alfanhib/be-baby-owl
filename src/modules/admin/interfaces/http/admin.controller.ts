import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/interfaces/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/interfaces/guards/roles.guard';
import { Roles } from '@shared/interfaces/decorators/roles.decorator';

import {
  GetUsersQuery,
  GetSystemAnalyticsQuery,
  ExportUsersQuery,
  GetDashboardQuery,
  GetUsersOverviewQuery,
  GetSystemHealthQuery,
  GetSystemConfigQuery,
  GetAuditLogsQuery,
  GetFinancialReportQuery,
  GetUserGrowthReportQuery,
  GetCoursePerformanceQuery,
  PaginatedUsers,
  SystemAnalyticsDto,
  DashboardDto,
  UsersOverviewDto,
  SystemHealthDto,
  SystemConfigDto,
  AuditLogsDto,
  FinancialReportDto,
  UserGrowthReportDto,
  CoursePerformanceReportDto,
} from '../../application/queries';

import {
  UpdateSystemConfigCommand,
  ForceResetPasswordCommand,
  ClearCacheCommand,
} from '../../application/commands';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class AdminController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  // ========== Dashboard ==========

  @Get('dashboard')
  @ApiOperation({ summary: 'Get super admin dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  async getDashboard(): Promise<{ success: boolean; data: DashboardDto }> {
    const result = await this.queryBus.execute<GetDashboardQuery, DashboardDto>(
      new GetDashboardQuery(),
    );
    return { success: true, data: result };
  }

  // ========== System Configuration ==========

  @Get('config')
  @ApiOperation({ summary: 'Get system configuration' })
  @ApiResponse({ status: 200, description: 'System configuration' })
  async getConfig(): Promise<{ success: boolean; data: SystemConfigDto }> {
    const result = await this.queryBus.execute<
      GetSystemConfigQuery,
      SystemConfigDto
    >(new GetSystemConfigQuery());
    return { success: true, data: result };
  }

  @Patch('config')
  @ApiOperation({ summary: 'Update system configuration' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        maintenanceMode: { type: 'boolean' },
        registrationEnabled: { type: 'boolean' },
        sessionTimeout: { type: 'number' },
        emailNotifications: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Configuration updated' })
  async updateConfig(
    @Body() body: Record<string, unknown>,
  ): Promise<{ success: boolean; message: string }> {
    return this.commandBus.execute(new UpdateSystemConfigCommand(body));
  }

  // ========== User Management ==========

  @Get('users')
  @ApiOperation({ summary: 'Get paginated users list (Super Admin only)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['student', 'instructor', 'staff', 'super_admin'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'suspended'],
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Users list' })
  async getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ success: boolean; data: PaginatedUsers }> {
    const result = await this.queryBus.execute<GetUsersQuery, PaginatedUsers>(
      new GetUsersQuery(search, role, status, page || 1, limit || 20),
    );
    return { success: true, data: result };
  }

  @Get('users/overview')
  @ApiOperation({ summary: 'Get user statistics overview' })
  @ApiResponse({ status: 200, description: 'User overview statistics' })
  async getUsersOverview(): Promise<{
    success: boolean;
    data: UsersOverviewDto;
  }> {
    const result = await this.queryBus.execute<
      GetUsersOverviewQuery,
      UsersOverviewDto
    >(new GetUsersOverviewQuery());
    return { success: true, data: result };
  }

  @Get('users/export')
  @ApiOperation({ summary: 'Export users to CSV (Super Admin only)' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({
    status: 200,
    description: 'CSV file with users',
    headers: {
      'Content-Type': { description: 'text/csv' },
      'Content-Disposition': {
        description: 'attachment; filename="users.csv"',
      },
    },
  })
  async exportUsers(
    @Query('role') role: string | undefined,
    @Query('status') status: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const csvString = await this.queryBus.execute<ExportUsersQuery, string>(
      new ExportUsersQuery(role, status),
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="users-${new Date().toISOString()}.csv"`,
    );
    res.send(csvString);
  }

  @Post('users/:id/reset-password')
  @ApiOperation({ summary: 'Force password reset for user' })
  @ApiResponse({ status: 200, description: 'Password reset' })
  async resetUserPassword(
    @Param('id') userId: string,
    @Body() body: { newPassword?: string },
  ): Promise<{
    success: boolean;
    message: string;
    temporaryPassword?: string;
  }> {
    return this.commandBus.execute(
      new ForceResetPasswordCommand(userId, body.newPassword),
    );
  }

  // ========== System Analytics ==========

  @Get('analytics')
  @ApiOperation({ summary: 'Get system analytics (Super Admin only)' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'System analytics' })
  async getSystemAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ success: boolean; data: SystemAnalyticsDto }> {
    const result = await this.queryBus.execute<
      GetSystemAnalyticsQuery,
      SystemAnalyticsDto
    >(
      new GetSystemAnalyticsQuery(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      ),
    );
    return { success: true, data: result };
  }

  // ========== System Operations ==========

  @Get('system/health')
  @ApiOperation({ summary: 'Get detailed system health' })
  @ApiResponse({ status: 200, description: 'System health status' })
  async getSystemHealth(): Promise<{
    success: boolean;
    data: SystemHealthDto;
  }> {
    const result = await this.queryBus.execute<
      GetSystemHealthQuery,
      SystemHealthDto
    >(new GetSystemHealthQuery());
    return { success: true, data: result };
  }

  @Post('system/cache/clear')
  @ApiOperation({ summary: 'Clear system cache' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pattern: { type: 'string', description: 'Optional pattern to clear' },
      },
    },
    required: false,
  })
  @ApiResponse({ status: 200, description: 'Cache cleared' })
  async clearCache(
    @Body() body: { pattern?: string },
  ): Promise<{ success: boolean; message: string }> {
    return this.commandBus.execute(new ClearCacheCommand(body?.pattern));
  }

  // ========== Audit Logs ==========

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get system audit logs' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'action', required: false })
  @ApiQuery({ name: 'resource', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Audit logs' })
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ success: boolean; data: AuditLogsDto['data']; meta: AuditLogsDto['meta'] }> {
    const result = await this.queryBus.execute<GetAuditLogsQuery, AuditLogsDto>(
      new GetAuditLogsQuery(
        userId,
        action,
        resource,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        page || 1,
        limit || 50,
      ),
    );
    return { success: true, data: result.data, meta: result.meta };
  }

  // ========== Reports ==========

  @Get('reports/financial')
  @ApiOperation({ summary: 'Get financial report' })
  @ApiQuery({ name: 'period', required: false, enum: ['month', 'quarter', 'year'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Financial report' })
  async getFinancialReport(
    @Query('period') period?: 'month' | 'quarter' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ success: boolean; data: FinancialReportDto }> {
    const result = await this.queryBus.execute<
      GetFinancialReportQuery,
      FinancialReportDto
    >(
      new GetFinancialReportQuery(
        period,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      ),
    );
    return { success: true, data: result };
  }

  @Get('reports/user-growth')
  @ApiOperation({ summary: 'Get user growth report' })
  @ApiQuery({ name: 'period', required: false, enum: ['month', 'quarter', 'year'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'User growth report' })
  async getUserGrowthReport(
    @Query('period') period?: 'month' | 'quarter' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ success: boolean; data: UserGrowthReportDto }> {
    const result = await this.queryBus.execute<
      GetUserGrowthReportQuery,
      UserGrowthReportDto
    >(
      new GetUserGrowthReportQuery(
        period,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      ),
    );
    return { success: true, data: result };
  }

  @Get('reports/course-performance')
  @ApiOperation({ summary: 'Get course performance report' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Course performance report' })
  async getCoursePerformanceReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ success: boolean; data: CoursePerformanceReportDto }> {
    const result = await this.queryBus.execute<
      GetCoursePerformanceQuery,
      CoursePerformanceReportDto
    >(
      new GetCoursePerformanceQuery(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      ),
    );
    return { success: true, data: result };
  }
}
