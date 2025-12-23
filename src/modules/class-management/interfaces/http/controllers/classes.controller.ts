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
  DuplicateClassCommand,
  BulkMarkAttendanceCommand,
  BulkUnlockLessonsCommand,
  AddMeetingsCommand,
  ContinueAsPrivateCommand,
} from '@class-management/application/commands';
import { AddMeetingsResult } from '@class-management/application/commands/add-meetings/add-meetings.handler';
import { ContinueAsPrivateResult } from '@class-management/application/commands/continue-as-private/continue-as-private.handler';
import { BulkAttendanceResult } from '@class-management/application/commands/bulk-mark-attendance/bulk-mark-attendance.handler';
import { BulkUnlockResult } from '@class-management/application/commands/bulk-unlock-lessons/bulk-unlock-lessons.handler';
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
  GetPackageInfoQuery,
} from '@class-management/application/queries';
import { ClassDetailResult } from '@class-management/application/queries/get-class/get-class.handler';
import { ClassRosterResult } from '@class-management/application/queries/get-class-roster/get-class-roster.handler';
import {
  ClassAttendanceResult,
  StudentAttendanceResult,
} from '@class-management/application/queries/get-class-attendance/get-class-attendance.handler';
import { PackageInfoResult } from '@class-management/application/queries/get-package-info/get-package-info.handler';
import {
  CreateClassDto,
  UpdateClassDto,
  EnrollStudentDto,
  MarkAttendanceDto,
  BulkMarkAttendanceDto,
  UpdateAttendanceDto,
  AdjustCreditsDto,
  UnlockLessonDto,
  DuplicateClassDto,
  BulkUnlockLessonsDto,
  AddMeetingsDto,
  ContinueAsPrivateDto,
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
  async createClass(@Body() dto: CreateClassDto): Promise<{ classId: string }> {
    return this.commandBus.execute(
      new CreateClassCommand(
        dto.name,
        dto.courseId,
        dto.instructorId,
        dto.type,
        dto.totalMeetings,
        dto.price,
        dto.maxStudents,
        dto.schedules,
        dto.startDate ? new Date(dto.startDate) : undefined,
        dto.endDate ? new Date(dto.endDate) : undefined,
        dto.enrollmentDeadline ? new Date(dto.enrollmentDeadline) : undefined,
        dto.notes,
      ),
    );
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
  ): Promise<unknown> {
    return this.queryBus.execute(
      new GetClassesQuery(courseId, instructorId, status, type, page, limit),
    );
  }

  @Get('my-classes')
  @Roles('instructor')
  @ApiOperation({ summary: 'Get classes for current instructor' })
  @ApiQuery({ name: 'status', required: false })
  async getMyClasses(
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: string,
  ): Promise<unknown> {
    return this.queryBus.execute(
      new GetInstructorClassesQuery(user.userId, status),
    );
  }

  @Get('enrolled')
  @Roles('student')
  @ApiOperation({ summary: 'Get classes student is enrolled in' })
  @ApiQuery({ name: 'status', required: false })
  async getEnrolledClasses(
    @CurrentUser() user: CurrentUserPayload,
    @Query('status') status?: string,
  ): Promise<unknown> {
    return this.queryBus.execute(
      new GetStudentClassesQuery(user.userId, status),
    );
  }

  @Get(':classId')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get class details' })
  @ApiParam({ name: 'classId' })
  async getClass(
    @Param('classId') classId: string,
  ): Promise<ClassDetailResult> {
    const result = (await this.queryBus.execute(
      new GetClassQuery(classId),
    )) as unknown as ClassDetailResult | null;
    if (!result) {
      throw new NotFoundException('Class not found');
    }
    return result;
  }

  @Put(':classId')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Update class details' })
  @ApiParam({ name: 'classId' })
  async updateClass(
    @Param('classId') classId: string,
    @Body() dto: UpdateClassDto,
  ): Promise<{ message: string }> {
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
    return { message: 'Class updated successfully' };
  }

  // ========== Class Status ==========

  @Post(':classId/open-enrollment')
  @Roles('instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Open class for enrollment' })
  @ApiParam({ name: 'classId' })
  async openEnrollment(
    @Param('classId') classId: string,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(new OpenEnrollmentCommand(classId));
    return { message: 'Enrollment opened' };
  }

  @Post(':classId/activate')
  @Roles('instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate class (start teaching)' })
  @ApiParam({ name: 'classId' })
  async activateClass(
    @Param('classId') classId: string,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(new ActivateClassCommand(classId));
    return { message: 'Class activated' };
  }

  @Post(':classId/complete')
  @Roles('instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete class' })
  @ApiParam({ name: 'classId' })
  async completeClass(
    @Param('classId') classId: string,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(new CompleteClassCommand(classId));
    return { message: 'Class completed' };
  }

  @Delete(':classId')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Cancel class' })
  @ApiParam({ name: 'classId' })
  async cancelClass(
    @Param('classId') classId: string,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(new CancelClassCommand(classId));
    return { message: 'Class cancelled' };
  }

  @Post(':classId/duplicate')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Duplicate a class (without enrollments/unlocks)' })
  @ApiParam({ name: 'classId', description: 'Source class ID to duplicate' })
  async duplicateClass(
    @Param('classId') classId: string,
    @Body() dto: DuplicateClassDto,
  ): Promise<{ classId: string }> {
    return this.commandBus.execute(
      new DuplicateClassCommand(
        classId,
        dto.newName,
        dto.newInstructorId,
        dto.newStartDate ? new Date(dto.newStartDate) : undefined,
        dto.newEndDate ? new Date(dto.newEndDate) : undefined,
        dto.newEnrollmentDeadline
          ? new Date(dto.newEnrollmentDeadline)
          : undefined,
      ),
    );
  }

  // ========== Enrollment ==========

  @Post(':classId/enroll')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Enroll a student in the class' })
  @ApiParam({ name: 'classId' })
  async enrollStudent(
    @Param('classId') classId: string,
    @Body() dto: EnrollStudentDto,
  ): Promise<{ enrollmentId: string }> {
    return this.commandBus.execute(
      new EnrollStudentCommand(classId, dto.studentId, dto.notes),
    );
  }

  @Delete(':classId/students/:studentId')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Remove a student from the class' })
  @ApiParam({ name: 'classId' })
  @ApiParam({ name: 'studentId' })
  async removeStudent(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(new RemoveStudentCommand(classId, studentId));
    return { message: 'Student removed from class' };
  }

  @Get(':classId/roster')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get class roster' })
  @ApiParam({ name: 'classId' })
  async getClassRoster(
    @Param('classId') classId: string,
  ): Promise<ClassRosterResult> {
    const result = (await this.queryBus.execute(
      new GetClassRosterQuery(classId),
    )) as unknown as ClassRosterResult | null;
    if (!result) {
      throw new NotFoundException('Class not found');
    }
    return result;
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
  ): Promise<{ attendanceId: string }> {
    return this.commandBus.execute(
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
  }

  @Get(':classId/attendance')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get class attendance records' })
  @ApiParam({ name: 'classId' })
  @ApiQuery({ name: 'meetingNumber', required: false })
  async getClassAttendance(
    @Param('classId') classId: string,
    @Query('meetingNumber') meetingNumber?: number,
  ): Promise<ClassAttendanceResult> {
    const result = (await this.queryBus.execute(
      new GetClassAttendanceQuery(classId, meetingNumber),
    )) as unknown as ClassAttendanceResult | null;
    if (!result) {
      throw new NotFoundException('Class not found');
    }
    return result;
  }

  @Get(':classId/attendance/students/:studentId')
  @Roles('instructor', 'staff', 'super_admin', 'student')
  @ApiOperation({ summary: 'Get student attendance in a class' })
  @ApiParam({ name: 'classId' })
  @ApiParam({ name: 'studentId' })
  async getStudentAttendance(
    @Param('classId') classId: string,
    @Param('studentId') studentId: string,
  ): Promise<StudentAttendanceResult> {
    const result = (await this.queryBus.execute(
      new GetStudentAttendanceQuery(classId, studentId),
    )) as unknown as StudentAttendanceResult | null;
    if (!result) {
      throw new NotFoundException('Enrollment not found');
    }
    return result;
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
  ): Promise<{ message: string }> {
    await this.commandBus.execute(
      new UpdateAttendanceCommand(
        attendanceId,
        dto.status,
        user.userId,
        dto.notes,
      ),
    );
    return { message: 'Attendance updated successfully' };
  }

  @Post(':classId/attendance/bulk')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Mark attendance for multiple students at once' })
  @ApiParam({ name: 'classId' })
  async bulkMarkAttendance(
    @Param('classId') classId: string,
    @Body() dto: BulkMarkAttendanceDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<BulkAttendanceResult> {
    return this.commandBus.execute<
      BulkMarkAttendanceCommand,
      BulkAttendanceResult
    >(
      new BulkMarkAttendanceCommand(
        classId,
        dto.meetingNumber,
        new Date(dto.meetingDate),
        dto.attendances.map((a) => ({
          enrollmentId: a.enrollmentId,
          status: a.status,
          notes: a.notes,
        })),
        user.userId,
      ),
    );
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
  ): Promise<{ adjustmentId: string }> {
    return this.commandBus.execute(
      new AdjustCreditsCommand(
        classId,
        dto.enrollmentId,
        dto.amount,
        dto.type,
        dto.reason,
        user.userId,
      ),
    );
  }

  @Get(':classId/enrollments/:enrollmentId/credits/history')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get credit adjustment history for an enrollment' })
  @ApiParam({ name: 'classId' })
  @ApiParam({ name: 'enrollmentId' })
  async getCreditHistory(
    @Param('enrollmentId') enrollmentId: string,
  ): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.queryBus.execute(
      new GetCreditHistoryQuery(enrollmentId),
    );
    if (!result) {
      throw new NotFoundException('Enrollment not found');
    }
    return result;
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
  ): Promise<{ lessonUnlockId: string }> {
    return (await this.commandBus.execute(
      new UnlockLessonCommand(
        classId,
        dto.lessonId,
        user.userId,
        dto.meetingNumber,
        dto.notes,
      ),
    )) as unknown as { lessonUnlockId: string };
  }

  @Post(':classId/unlock-lessons/bulk')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Unlock multiple lessons at once' })
  @ApiParam({ name: 'classId' })
  async bulkUnlockLessons(
    @Param('classId') classId: string,
    @Body() dto: BulkUnlockLessonsDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<BulkUnlockResult> {
    const result = await this.commandBus.execute<
      BulkUnlockLessonsCommand,
      BulkUnlockResult
    >(
      new BulkUnlockLessonsCommand(
        classId,
        dto.lessons.map((l) => ({
          lessonId: l.lessonId,
          meetingNumber: l.meetingNumber,
          notes: l.notes,
        })),
        user.userId,
      ),
    );
    return result as unknown as BulkUnlockResult;
  }

  @Get(':classId/unlocked-lessons')
  @Roles('instructor', 'staff', 'super_admin', 'student')
  @ApiOperation({ summary: 'Get all unlocked lessons for the class' })
  @ApiParam({ name: 'classId' })
  async getUnlockedLessons(
    @Param('classId') classId: string,
  ): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.queryBus.execute(
      new GetUnlockedLessonsQuery(classId),
    );
    if (!result) {
      throw new NotFoundException('Class not found');
    }
    return result;
  }

  // ========== Package Management ==========

  @Get(':classId/package')
  @Roles('instructor', 'staff', 'super_admin', 'student')
  @ApiOperation({ summary: 'Get package information for a class' })
  @ApiParam({ name: 'classId' })
  @ApiQuery({
    name: 'studentId',
    required: false,
    description: 'Get package info for specific student',
  })
  async getPackageInfo(
    @Param('classId') classId: string,
    @Query('studentId') studentId?: string,
  ): Promise<PackageInfoResult> {
    return (await this.queryBus.execute<GetPackageInfoQuery, PackageInfoResult>(
      new GetPackageInfoQuery(classId, studentId),
    )) as unknown as PackageInfoResult;
  }

  @Post(':classId/add-meetings')
  @Roles('staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add meetings to a private class package' })
  @ApiParam({ name: 'classId' })
  async addMeetings(
    @Param('classId') classId: string,
    @Body() dto: AddMeetingsDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<AddMeetingsResult> {
    return this.commandBus.execute<AddMeetingsCommand, AddMeetingsResult>(
      new AddMeetingsCommand(classId, dto.meetingsToAdd, user.userId),
    );
  }

  @Post(':classId/continue-as-private')
  @Roles('staff', 'super_admin')
  @ApiOperation({
    summary: 'Continue a student from group class to private class',
  })
  @ApiParam({ name: 'classId', description: 'Source group class ID' })
  async continueAsPrivate(
    @Param('classId') classId: string,
    @Body() dto: ContinueAsPrivateDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ContinueAsPrivateResult> {
    return this.commandBus.execute<
      ContinueAsPrivateCommand,
      ContinueAsPrivateResult
    >(
      new ContinueAsPrivateCommand(
        classId,
        dto.studentId,
        dto.packageMeetings,
        dto.instructorId,
        dto.schedules,
        user.userId,
      ),
    );
  }
}
