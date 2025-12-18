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
import { QuickEnrollCommand } from '@staff/application/commands';
import {
  GetStaffDashboardQuery,
  SearchStudentsQuery,
  GetAvailableClassesQuery,
} from '@staff/application/queries';
import { QuickEnrollDto } from '../dto';

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
  async getDashboard(): Promise<{
    success: boolean;
    data: StaffDashboardResult;
  }> {
    const result = await this.queryBus.execute<
      GetStaffDashboardQuery,
      StaffDashboardResult
    >(new GetStaffDashboardQuery());
    return { success: true, data: result };
  }

  // ========== Quick Enrollment ==========

  @Get('quick-enroll/search-student')
  @ApiOperation({ summary: 'Search students for quick enrollment' })
  @ApiQuery({ name: 'q', description: 'Search term (name, email, phone)' })
  @ApiResponse({ status: 200, description: 'Students found' })
  async searchStudent(
    @Query('q') searchTerm: string,
  ): Promise<{ success: boolean; data: StudentSearchResult[] }> {
    const result = await this.queryBus.execute<
      SearchStudentsQuery,
      StudentSearchResult[]
    >(new SearchStudentsQuery(searchTerm));
    return { success: true, data: result };
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
  ): Promise<{ success: boolean; data: AvailableClassResult[] }> {
    const result = await this.queryBus.execute<
      GetAvailableClassesQuery,
      AvailableClassResult[]
    >(new GetAvailableClassesQuery(courseId, type));
    return { success: true, data: result };
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
  ): Promise<{ success: boolean; message: string; data: QuickEnrollResult }> {
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

    const result = await this.commandBus.execute<
      QuickEnrollCommand,
      QuickEnrollResult
    >(command);

    return {
      success: true,
      message: result.studentCreated
        ? 'Student created and enrolled successfully'
        : 'Student enrolled successfully',
      data: result,
    };
  }

  // ========== Staff Tools ==========

  @Get('pending-payments')
  @ApiOperation({ summary: 'Get payments pending verification' })
  @ApiResponse({ status: 200, description: 'Pending payments retrieved' })
  async getPendingPayments(): Promise<{
    success: boolean;
    data: Array<{ id: string; type: string; title: string }>;
  }> {
    // For now, returning from dashboard query which includes pending actions
    const dashboardResult = await this.queryBus.execute<
      GetStaffDashboardQuery,
      StaffDashboardResult
    >(new GetStaffDashboardQuery());
    return {
      success: true,
      data: dashboardResult.pendingActions.filter(
        (a) => a.type === 'verify_payment',
      ),
    };
  }
}
