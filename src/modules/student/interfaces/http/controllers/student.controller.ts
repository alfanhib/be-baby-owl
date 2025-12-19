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
  GetStudentDashboardQuery,
  GetMyCoursesQuery,
  GetCourseDetailQuery,
  CheckLessonAccessQuery,
} from '@student/application/queries';

// Result types for type safety
interface DashboardResult {
  courses: unknown[];
  stats: unknown;
  upcomingClasses: unknown[];
  recentActivity: unknown[];
}

interface CourseResult {
  id: string;
  className: string;
  course: unknown;
  progress: number;
}

interface CourseDetailResult {
  enrollmentId: string;
  classId: string;
  sections: unknown[];
  progress: unknown;
}

interface LessonAccessResult {
  canAccess: boolean;
  reason?: string;
}

@ApiTags('Student')
@Controller('student')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly queryBus: QueryBus) {}

  // ========== Dashboard ==========

  @Get('dashboard')
  @Roles('student', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get student dashboard data' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved' })
  async getDashboard(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: DashboardResult }> {
    const result = await this.queryBus.execute<
      GetStudentDashboardQuery,
      DashboardResult
    >(new GetStudentDashboardQuery(user.userId));
    return { success: true, data: result };
  }

  // ========== My Courses ==========

  @Get('courses')
  @Roles('student', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get student enrolled courses' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'completed', 'paused'],
  })
  @ApiResponse({ status: 200, description: 'Courses retrieved' })
  async getMyCourses(
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: 'active' | 'completed' | 'paused',
  ): Promise<{ success: boolean; data: CourseResult[] }> {
    const result = await this.queryBus.execute<
      GetMyCoursesQuery,
      CourseResult[]
    >(new GetMyCoursesQuery(user.userId, status));
    return { success: true, data: result };
  }

  @Get('courses/active')
  @Roles('student', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get active courses only' })
  @ApiResponse({ status: 200, description: 'Active courses retrieved' })
  async getActiveCourses(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: CourseResult[] }> {
    const result = await this.queryBus.execute<
      GetMyCoursesQuery,
      CourseResult[]
    >(new GetMyCoursesQuery(user.userId, 'active'));
    return { success: true, data: result };
  }

  @Get('courses/completed')
  @Roles('student', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get completed courses only' })
  @ApiResponse({ status: 200, description: 'Completed courses retrieved' })
  async getCompletedCourses(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: CourseResult[] }> {
    const result = await this.queryBus.execute<
      GetMyCoursesQuery,
      CourseResult[]
    >(new GetMyCoursesQuery(user.userId, 'completed'));
    return { success: true, data: result };
  }

  // ========== Course Detail ==========

  @Get('classes/:classId')
  @Roles('student', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get course/class detail for student' })
  @ApiParam({ name: 'classId', description: 'Class ID' })
  @ApiResponse({ status: 200, description: 'Course detail retrieved' })
  @ApiResponse({ status: 403, description: 'Not enrolled in this class' })
  async getCourseDetail(
    @Param('classId') classId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: CourseDetailResult }> {
    const result = await this.queryBus.execute<
      GetCourseDetailQuery,
      CourseDetailResult
    >(new GetCourseDetailQuery(user.userId, classId));
    return { success: true, data: result };
  }

  // ========== Lesson Access ==========

  @Get('classes/:classId/lessons/:lessonId/access')
  @Roles('student', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Check if student can access a lesson' })
  @ApiParam({ name: 'classId', description: 'Class ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({ status: 200, description: 'Access check completed' })
  async checkLessonAccess(
    @Param('classId') classId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; message: string; data: LessonAccessResult }> {
    const result = await this.queryBus.execute<
      CheckLessonAccessQuery,
      LessonAccessResult
    >(new CheckLessonAccessQuery(user.userId, classId, lessonId));
    return { success: true, message: 'Access check completed', data: result };
  }

  // ========== Admin Access to Student Data ==========

  @Get(':studentId/dashboard')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Get dashboard for a specific student (admin)' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved' })
  async getStudentDashboardAdmin(
    @Param('studentId') studentId: string,
  ): Promise<{ success: boolean; data: DashboardResult }> {
    const result = await this.queryBus.execute<
      GetStudentDashboardQuery,
      DashboardResult
    >(new GetStudentDashboardQuery(studentId));
    return { success: true, data: result };
  }

  @Get(':studentId/courses')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Get courses for a specific student (admin)' })
  @ApiParam({ name: 'studentId', description: 'Student ID' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'completed', 'paused'],
  })
  @ApiResponse({ status: 200, description: 'Courses retrieved' })
  async getStudentCoursesAdmin(
    @Param('studentId') studentId: string,
    @Query('status') status?: 'active' | 'completed' | 'paused',
  ): Promise<{ success: boolean; data: CourseResult[] }> {
    const result = await this.queryBus.execute<
      GetMyCoursesQuery,
      CourseResult[]
    >(new GetMyCoursesQuery(studentId, status));
    return { success: true, data: result };
  }
}
