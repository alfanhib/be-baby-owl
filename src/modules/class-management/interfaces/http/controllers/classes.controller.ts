import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
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
  CreateClassCommand,
  UpdateClassCommand,
  OpenEnrollmentCommand,
  ActivateClassCommand,
  CompleteClassCommand,
  CancelClassCommand,
  EnrollStudentCommand,
  RemoveStudentCommand,
  MarkAttendanceCommand,
  UpdateAttendanceCommand,
  AdjustCreditsCommand,
  UnlockLessonCommand,
} from '@class-management/application/commands';
import {
  GetClassQuery,
  GetClassesQuery,
  GetInstructorClassesQuery,
  GetStudentClassesQuery,
  GetClassRosterQuery,
  GetClassAttendanceQuery,
  GetStudentAttendanceQuery,
  GetUnlockedLessonsQuery,
  GetCreditHistoryQuery,
} from '@class-management/application/queries';
import {
  CreateClassDto,
  UpdateClassDto,
  EnrollStudentDto,
  MarkAttendanceDto,
  UpdateAttendanceDto,
  AdjustCreditsDto,
  UnlockLessonDto,
} from '../dto';

@ApiTags('Classes')
@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ClassesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ========== Class CRUD ==========

  @Post()
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  async createClass(
    @Body() dto: CreateClassDto,
  ): Promise<{ success: boolean; data: { classId: string } }> {
    const result: { classId: string } = await this.commandBus.execute(
      new CreateClassCommand(
        dto.name,
        dto.courseId,
        dto.instructorId,
        dto.type,
        dto.totalMeetings,
        dto.maxStudents,
        dto.schedules,
        dto.startDate ? new Date(dto.startDate) : undefined,
        dto.endDate ? new Date(dto.endDate) : undefined,
        dto.enrollmentDeadline ? new Date(dto.enrollmentDeadline) : undefined,
        dto.notes,
      ),
    );
    return { success: true, data: result };
  }

  @Get()
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Get all classes (admin view)' })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiQuery({ name: 'instructorId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getClasses(
    @Query('courseId') courseId?: string,
    @Query('instructorId') instructorId?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.queryBus.execute(
      new GetClassesQuery(courseId, instructorId, status, type, page, limit),
    );
    return { success: true, data: result };
  }

  @Get('my-classes')
  @Roles('instructor')
  @ApiOperation({ summary: 'Get classes for current instructor' })
  @ApiQuery({ name: 'status', required: false })
  async getMyClasses(
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: string,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.queryBus.execute(
      new GetInstructorClassesQuery(user.userId, status),
    );
    return { success: true, data: result };
  }

  @Get('enrolled')
  @Roles('student')
  @ApiOperation({ summary: 'Get classes student is enrolled in' })
  @ApiQuery({ name: 'status', required: false })
  async getEnrolledClasses(
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: string,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.queryBus.execute(
      new GetStudentClassesQuery(user.userId, status),
    );
    return { success: true, data: result };
  }

  @Get(':classId')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get class details' })
  @ApiParam({ name: 'classId' })
  async getClass(
    @Param('classId') classId: string,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.queryBus.execute(
      new GetClassQuery(classId),
    );
    if (!result) {
      throw new NotFoundException('Class not found');
    }
    return { success: true, data: result };
  }

  @Put(':classId')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Update class details' })
  @ApiParam({ name: 'classId' })
  async updateClass(
    @Param('classId') classId: string,
    @Body() dto: UpdateClassDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.commandBus.execute<UpdateClassCommand, void>(
      new UpdateClassCommand(
        classId,
        dto.name,
        dto.maxStudents,
        dto.startDate ? new Date(dto.startDate) : undefined,
        dto.endDate ? new Date(dto.endDate) : undefined,
        dto.enrollmentDeadline ? new Date(dto.enrollmentDeadline) : undefined,
        dto.notes,
      ),
    );
    return { success: true, message: 'Class updated successfully' };
  }

  // ========== Class Status ==========

  @Post(':classId/open-enrollment')
  @Roles('instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Open class for enrollment' })
  @ApiParam({ name: 'classId' })
  async openEnrollment(
    @Param('classId') classId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.commandBus.execute(new OpenEnrollmentCommand(classId));
    return { success: true, message: 'Enrollment opened' };
  }

  @Post(':classId/activate')
  @Roles('instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate class (start teaching)' })
  @ApiParam({ name: 'classId' })
  async activateClass(
    @Param('classId') classId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.commandBus.execute(new ActivateClassCommand(classId));
    return { success: true, message: 'Class activated' };
  }

  @Post(':classId/complete')
  @Roles('instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete class' })
  @ApiParam({ name: 'classId' })
  async completeClass(
    @Param('classId') classId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.commandBus.execute(new CompleteClassCommand(classId));
    return { success: true, message: 'Class completed' };
  }

  @Delete(':classId')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Cancel class' })
  @ApiParam({ name: 'classId' })
  async cancelClass(
    @Param('classId') classId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.commandBus.execute(new CancelClassCommand(classId));
    return { success: true, message: 'Class cancelled' };
  }

  // ========== Enrollment ==========

  @Post(':classId/enroll')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Enroll a student in the class' })
  @ApiParam({ name: 'classId' })
  async enrollStudent(
    @Param('classId') classId: string,
    @Body() dto: EnrollStudentDto,
  ): Promise<{ success: boolean; data: { enrollmentId: string } }> {
    const result: { enrollmentId: string } = await this.commandBus.execute(
      new EnrollStudentCommand(classId, dto.studentId, dto.notes),
    );
    return { success: true, data: result };
  }

  @Delete(':classId/students/:studentId')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Remove a student from the class' })
  @ApiParam({ name: 'classId' })
  @ApiParam({ name: 'studentId' })
  async removeStudent(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.commandBus.execute(new RemoveStudentCommand(classId, studentId));
    return { success: true, message: 'Student removed from class' };
  }

  @Get(':classId/roster')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get class roster' })
  @ApiParam({ name: 'classId' })
  async getClassRoster(
    @Param('classId') classId: string,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.queryBus.execute(
      new GetClassRosterQuery(classId),
    );
    if (!result) {
      throw new NotFoundException('Class not found');
    }
    return { success: true, data: result };
  }

  // ========== Attendance ==========

  @Post(':classId/attendance')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Mark attendance for a student' })
  @ApiParam({ name: 'classId' })
  async markAttendance(
    @Param('classId') classId: string,
    @Body() dto: MarkAttendanceDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: { attendanceId: string } }> {
    const result: { attendanceId: string } = await this.commandBus.execute(
      new MarkAttendanceCommand(
        classId,
        dto.enrollmentId,
        dto.meetingNumber,
        new Date(dto.meetingDate),
        dto.status,
        user.userId,
        dto.notes,
      ),
    );
    return { success: true, data: result };
  }

  @Get(':classId/attendance')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get class attendance records' })
  @ApiParam({ name: 'classId' })
  @ApiQuery({ name: 'meetingNumber', required: false })
  async getClassAttendance(
    @Param('classId') classId: string,
    @Query('meetingNumber') meetingNumber?: number,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.queryBus.execute(
      new GetClassAttendanceQuery(classId, meetingNumber),
    );
    if (!result) {
      throw new NotFoundException('Class not found');
    }
    return { success: true, data: result };
  }

  @Get(':classId/attendance/students/:studentId')
  @Roles('instructor', 'staff', 'super_admin', 'student')
  @ApiOperation({ summary: 'Get student attendance in a class' })
  @ApiParam({ name: 'classId' })
  @ApiParam({ name: 'studentId' })
  async getStudentAttendance(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.queryBus.execute(
      new GetStudentAttendanceQuery(classId, studentId),
    );
    if (!result) {
      throw new NotFoundException('Enrollment not found');
    }
    return { success: true, data: result };
  }

  @Put(':classId/attendance/:attendanceId')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Update an attendance record' })
  @ApiParam({ name: 'classId' })
  @ApiParam({ name: 'attendanceId' })
  async updateAttendance(
    @Param('attendanceId') attendanceId: string,
    @Body() dto: UpdateAttendanceDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; message: string }> {
    await this.commandBus.execute(
      new UpdateAttendanceCommand(
        attendanceId,
        dto.status,
        user.userId,
        dto.notes,
      ),
    );
    return { success: true, message: 'Attendance updated successfully' };
  }

  // ========== Credits ==========

  @Post(':classId/credits')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Adjust credits for an enrollment' })
  @ApiParam({ name: 'classId' })
  async adjustCredits(
    @Param('classId') classId: string,
    @Body() dto: AdjustCreditsDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: { adjustmentId: string } }> {
    const result: { adjustmentId: string } = await this.commandBus.execute(
      new AdjustCreditsCommand(
        classId,
        dto.enrollmentId,
        dto.amount,
        dto.type,
        dto.reason,
        user.userId,
      ),
    );
    return { success: true, data: result };
  }

  @Get(':classId/enrollments/:enrollmentId/credits/history')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get credit adjustment history for an enrollment' })
  @ApiParam({ name: 'classId' })
  @ApiParam({ name: 'enrollmentId' })
  async getCreditHistory(
    @Param('enrollmentId') enrollmentId: string,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.queryBus.execute(
      new GetCreditHistoryQuery(enrollmentId),
    );
    if (!result) {
      throw new NotFoundException('Enrollment not found');
    }
    return { success: true, data: result };
  }

  // ========== Lesson Unlock ==========

  @Post(':classId/unlock-lesson')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Unlock a lesson for the class' })
  @ApiParam({ name: 'classId' })
  async unlockLesson(
    @Param('classId') classId: string,
    @Body() dto: UnlockLessonDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: { lessonUnlockId: string } }> {
    const result: { lessonUnlockId: string } = await this.commandBus.execute(
      new UnlockLessonCommand(
        classId,
        dto.lessonId,
        user.userId,
        dto.meetingNumber,
        dto.notes,
      ),
    );
    return { success: true, data: result };
  }

  @Get(':classId/unlocked-lessons')
  @Roles('instructor', 'staff', 'super_admin', 'student')
  @ApiOperation({ summary: 'Get all unlocked lessons for the class' })
  @ApiParam({ name: 'classId' })
  async getUnlockedLessons(
    @Param('classId') classId: string,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.queryBus.execute(
      new GetUnlockedLessonsQuery(classId),
    );
    if (!result) {
      throw new NotFoundException('Class not found');
    }
    return { success: true, data: result };
  }
}
