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
  GetCourseStudentsQuery,
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
  PaginatedCourseStudents,
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
  async getDashboard(): Promise<DashboardDto> {
    return this.queryBus.execute<GetDashboardQuery, DashboardDto>(
      new GetDashboardQuery(),
    );
  }

  // ========== System Configuration ==========

  @Get('config')
  @ApiOperation({ summary: 'Get system configuration' })
  @ApiResponse({ status: 200, description: 'System configuration' })
  async getConfig(): Promise<SystemConfigDto> {
    return this.queryBus.execute<GetSystemConfigQuery, SystemConfigDto>(
      new GetSystemConfigQuery(),
    );
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
  ): Promise<{ message: string }> {
    const result = (await this.commandBus.execute(
      new UpdateSystemConfigCommand(body),
    )) as unknown as { success: boolean; message: string };
    return { message: result.message };
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
  ): Promise<PaginatedUsers> {
    return this.queryBus.execute<GetUsersQuery, PaginatedUsers>(
      new GetUsersQuery(search, role, status, page || 1, limit || 20),
    );
  }

  @Get('users/overview')
  @ApiOperation({ summary: 'Get user statistics overview' })
  @ApiResponse({ status: 200, description: 'User overview statistics' })
  async getUsersOverview(): Promise<UsersOverviewDto> {
    return this.queryBus.execute<GetUsersOverviewQuery, UsersOverviewDto>(
      new GetUsersOverviewQuery(),
    );
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
  ): Promise<{ message: string; temporaryPassword?: string }> {
    const result = (await this.commandBus.execute(
      new ForceResetPasswordCommand(userId, body.newPassword),
    )) as unknown as {
      success: boolean;
      message: string;
      temporaryPassword?: string;
    };
    return {
      message: result.message,
      temporaryPassword: result.temporaryPassword,
    };
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
  ): Promise<SystemAnalyticsDto> {
    return this.queryBus.execute<GetSystemAnalyticsQuery, SystemAnalyticsDto>(
      new GetSystemAnalyticsQuery(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      ),
    );
  }

  // ========== System Operations ==========

  @Get('system/health')
  @ApiOperation({ summary: 'Get detailed system health' })
  @ApiResponse({ status: 200, description: 'System health status' })
  async getSystemHealth(): Promise<SystemHealthDto> {
    return this.queryBus.execute<GetSystemHealthQuery, SystemHealthDto>(
      new GetSystemHealthQuery(),
    );
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
  ): Promise<{ message: string }> {
    const result = (await this.commandBus.execute(
      new ClearCacheCommand(body?.pattern),
    )) as unknown as { success: boolean; message: string };
    return { message: result.message };
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
  ): Promise<AuditLogsDto> {
    return this.queryBus.execute<GetAuditLogsQuery, AuditLogsDto>(
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
  }

  // ========== Reports ==========

  @Get('reports/financial')
  @ApiOperation({ summary: 'Get financial report' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['month', 'quarter', 'year'],
  })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Financial report' })
  async getFinancialReport(
    @Query('period') period?: 'month' | 'quarter' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<FinancialReportDto> {
    return this.queryBus.execute<GetFinancialReportQuery, FinancialReportDto>(
      new GetFinancialReportQuery(
        period,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      ),
    );
  }

  @Get('reports/user-growth')
  @ApiOperation({ summary: 'Get user growth report' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['month', 'quarter', 'year'],
  })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'User growth report' })
  async getUserGrowthReport(
    @Query('period') period?: 'month' | 'quarter' | 'year',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<UserGrowthReportDto> {
    return this.queryBus.execute<GetUserGrowthReportQuery, UserGrowthReportDto>(
      new GetUserGrowthReportQuery(
        period,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      ),
    );
  }

  @Get('reports/course-performance')
  @ApiOperation({ summary: 'Get course performance report' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Course performance report' })
  async getCoursePerformanceReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<CoursePerformanceReportDto> {
    return this.queryBus.execute<
      GetCoursePerformanceQuery,
      CoursePerformanceReportDto
    >(
      new GetCoursePerformanceQuery(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
      ),
    );
  }

  // ========== Course Students ==========

  @Get('courses/:courseId/students')
  @ApiOperation({ summary: 'Get students enrolled in a specific course' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by student name or email',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'completed', 'withdrawn'],
  })
  @ApiQuery({
    name: 'classId',
    required: false,
    description: 'Filter by specific class',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'List of students enrolled in the course',
  })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseStudents(
    @Param('courseId') courseId: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('classId') classId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<PaginatedCourseStudents | null> {
    return this.queryBus.execute<
      GetCourseStudentsQuery,
      PaginatedCourseStudents | null
    >(
      new GetCourseStudentsQuery(
        courseId,
        search,
        status,
        classId,
        page || 1,
        limit || 20,
      ),
    );
  }
}
