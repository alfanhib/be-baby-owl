import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/interfaces/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/interfaces/guards/roles.guard';
import { Roles } from '@shared/interfaces/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@shared/interfaces/decorators/current-user.decorator';
import {
  QuickEnrollCommand,
  BulkEnrollCommand,
} from '@staff/application/commands';
import {
  GetStaffDashboardQuery,
  SearchStudentsQuery,
  GetAvailableClassesQuery,
  GetEnrollmentHistoryQuery,
  GetEnrollmentAnalyticsQuery,
} from '@staff/application/queries';
import { QuickEnrollDto } from '../dto';
import { BulkEnrollDto } from '../dto/bulk-enroll.dto';

interface QuickEnrollResult {
  enrollmentId: string;
  studentId: string;
  studentCreated: boolean;
  classId: string;
  className: string;
}

interface StaffDashboardResult {
  stats: unknown;
  quickStats: unknown[];
  recentActivity: unknown[];
  pendingActions: Array<{ id: string; type: string; title: string }>;
}

interface StudentSearchResult {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface AvailableClassResult {
  id: string;
  name: string;
  course: unknown;
  instructor: unknown;
  type: string;
  capacity: unknown;
  canEnroll: boolean;
  packages: unknown[];
}

interface BulkEnrollResult {
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    email: string;
    success: boolean;
    enrollmentId?: string;
    error?: string;
  }>;
}

@ApiTags('Staff')
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Roles('staff', 'super_admin')
export class StaffController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ========== Dashboard ==========

  @Get('dashboard')
  @ApiOperation({ summary: 'Get staff dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved' })
  async getDashboard(): Promise<StaffDashboardResult> {
    return this.queryBus.execute<GetStaffDashboardQuery, StaffDashboardResult>(
      new GetStaffDashboardQuery(),
    );
  }

  // ========== Quick Enrollment ==========

  @Get('quick-enroll/search-student')
  @ApiOperation({ summary: 'Search students for quick enrollment' })
  @ApiQuery({ name: 'q', description: 'Search term (name, email, phone)' })
  @ApiResponse({ status: 200, description: 'Students found' })
  async searchStudent(
    @Query('q') searchTerm: string,
  ): Promise<StudentSearchResult[]> {
    return this.queryBus.execute<SearchStudentsQuery, StudentSearchResult[]>(
      new SearchStudentsQuery(searchTerm),
    );
  }

  @Get('quick-enroll/available-classes')
  @ApiOperation({ summary: 'Get classes available for enrollment' })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: 'Filter by course',
  })
  @ApiQuery({ name: 'type', required: false, enum: ['group', 'private'] })
  @ApiResponse({ status: 200, description: 'Available classes retrieved' })
  async getAvailableClasses(
    @Query('courseId') courseId?: string,
    @Query('type') type?: 'group' | 'private',
  ): Promise<AvailableClassResult[]> {
    return this.queryBus.execute<
      GetAvailableClassesQuery,
      AvailableClassResult[]
    >(new GetAvailableClassesQuery(courseId, type));
  }

  @Post('quick-enroll')
  @ApiOperation({
    summary: 'Quick enrollment (create student if new + enroll)',
  })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Class or student not found' })
  @ApiResponse({ status: 409, description: 'Already enrolled or email exists' })
  async quickEnroll(
    @Body() dto: QuickEnrollDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<QuickEnrollResult> {
    const command = new QuickEnrollCommand(
      dto.student.id || null,
      dto.student.name || null,
      dto.student.email || null,
      dto.student.phone || null,
      dto.classId,
      dto.package.meetings,
      dto.package.price,
      dto.paymentStatus,
      dto.notes || null,
      user.userId,
    );

    return this.commandBus.execute<QuickEnrollCommand, QuickEnrollResult>(
      command,
    );
  }

  // ========== Staff Tools ==========

  @Get('pending-payments')
  @ApiOperation({ summary: 'Get payments pending verification' })
  @ApiResponse({ status: 200, description: 'Pending payments retrieved' })
  async getPendingPayments(): Promise<
    Array<{ id: string; type: string; title: string }>
  > {
    const dashboardResult = await this.queryBus.execute<
      GetStaffDashboardQuery,
      StaffDashboardResult
    >(new GetStaffDashboardQuery());
    return dashboardResult.pendingActions.filter(
      (a) => a.type === 'verify_payment',
    );
  }

  // ========== Enrollment History & Analytics ==========

  @Get('enrollments/history')
  @ApiOperation({ summary: 'Get enrollment history (audit log)' })
  @ApiQuery({ name: 'classId', required: false })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Enrollment history retrieved' })
  async getEnrollmentHistory(
    @Query('classId') classId?: string,
    @Query('studentId') studentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<unknown> {
    return this.queryBus.execute(
      new GetEnrollmentHistoryQuery(
        classId,
        studentId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
      ),
    );
  }

  @Get('enrollments/analytics')
  @ApiOperation({ summary: 'Get enrollment analytics and trends' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiResponse({ status: 200, description: 'Enrollment analytics retrieved' })
  async getEnrollmentAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('courseId') courseId?: string,
  ): Promise<unknown> {
    return this.queryBus.execute(
      new GetEnrollmentAnalyticsQuery(
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined,
        courseId,
      ),
    );
  }

  // ========== Bulk Enrollment ==========

  @Post('bulk-enroll')
  @ApiOperation({ summary: 'Bulk enroll multiple students to a class' })
  @ApiResponse({ status: 201, description: 'Bulk enrollment completed' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or capacity exceeded',
  })
  @ApiResponse({ status: 404, description: 'Class not found' })
  async bulkEnroll(
    @Body() dto: BulkEnrollDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<BulkEnrollResult> {
    const command = new BulkEnrollCommand(
      dto.classId,
      dto.students.map((s) => ({
        email: s.email,
        name: s.name,
        phone: s.phone,
        packageMeetings: s.packageMeetings,
        packagePrice: s.packagePrice,
        notes: s.notes,
      })),
      dto.paymentStatus,
      user.userId,
    );

    return this.commandBus.execute<BulkEnrollCommand, BulkEnrollResult>(
      command,
    );
  }
}
