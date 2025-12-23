import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/interfaces/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/interfaces/guards/roles.guard';
import { Roles } from '@shared/interfaces/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@shared/interfaces/decorators/current-user.decorator';
import {
  GetInstructorDashboardQuery,
  GetInstructorClassesQuery,
  GetClassStudentsQuery,
  GetAtRiskStudentsQuery,
  GetInstructorAnalyticsQuery,
} from '@instructor/application/queries';

// Result types for type safety
interface InstructorDashboardResult {
  classes: unknown[];
  pendingTasks: unknown[];
  studentStats: unknown;
  upcomingMeetings: unknown[];
}

interface InstructorClassResult {
  id: string;
  name: string;
  courseName: string;
  status: string;
}

interface StudentInClassResult {
  id: string;
  name: string;
  progress: unknown;
  isAtRisk: boolean;
}

interface AtRiskStudentResult {
  studentId: string;
  studentName: string;
  classId: string;
  reason: string;
}

interface InstructorAnalyticsResult {
  overview: unknown;
  classPerformance: unknown[];
  monthlyTrend: unknown[];
  courseBreakdown: unknown[];
}

@ApiTags('Instructor')
@Controller('instructor')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles('instructor', 'super_admin')
export class InstructorController {
  constructor(private readonly queryBus: QueryBus) {}

  // ========== Dashboard ==========

  @Get('dashboard')
  @ApiOperation({ summary: 'Get instructor dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved' })
  async getDashboard(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<InstructorDashboardResult> {
    return this.queryBus.execute<
      GetInstructorDashboardQuery,
      InstructorDashboardResult
    >(new GetInstructorDashboardQuery(user.userId));
  }

  // ========== Classes ==========

  @Get('classes')
  @ApiOperation({ summary: 'Get instructor classes' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: 'Filter by course',
  })
  @ApiResponse({ status: 200, description: 'Classes retrieved' })
  async getClasses(
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: string,
    @Query('courseId') courseId?: string,
  ): Promise<InstructorClassResult[]> {
    return this.queryBus.execute<
      GetInstructorClassesQuery,
      InstructorClassResult[]
    >(new GetInstructorClassesQuery(user.userId, status, courseId));
  }

  // ========== Student Monitoring ==========

  @Get('classes/:classId/students')
  @ApiOperation({ summary: 'Get students in a class' })
  @ApiParam({ name: 'classId', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Students retrieved' })
  @ApiResponse({ status: 403, description: 'Class not assigned to instructor' })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async getClassStudents(
    @Param('classId') classId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<StudentInClassResult[]> {
    return this.queryBus.execute<GetClassStudentsQuery, StudentInClassResult[]>(
      new GetClassStudentsQuery(classId, user.userId),
    );
  }

  @Get('at-risk-students')
  @ApiOperation({ summary: 'Get at-risk students across all classes' })
  @ApiResponse({ status: 200, description: 'At-risk students retrieved' })
  async getAtRiskStudents(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<AtRiskStudentResult[]> {
    return this.queryBus.execute<GetAtRiskStudentsQuery, AtRiskStudentResult[]>(
      new GetAtRiskStudentsQuery(user.userId),
    );
  }

  // ========== Analytics ==========

  @Get('analytics')
  @ApiOperation({ summary: 'Get teaching analytics' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['week', 'month', 'year'],
    description: 'Analytics period',
  })
  @ApiResponse({ status: 200, description: 'Analytics retrieved' })
  async getAnalytics(
    @CurrentUser() user: CurrentUserPayload,
    @Query('period') period?: 'week' | 'month' | 'year',
  ): Promise<InstructorAnalyticsResult> {
    return this.queryBus.execute<
      GetInstructorAnalyticsQuery,
      InstructorAnalyticsResult
    >(new GetInstructorAnalyticsQuery(user.userId, period || 'month'));
  }
}
