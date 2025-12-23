import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/interfaces/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/interfaces/guards/roles.guard';
import { Roles } from '@shared/interfaces/decorators/roles.decorator';
import { CurrentUser } from '@shared/interfaces/decorators/current-user.decorator';

import {
  SubmitAssignmentCommand,
  GradeSubmissionCommand,
  BulkGradeSubmissionsCommand,
  ReturnForRevisionCommand,
} from '@assessment/application/commands';
import {
  GetPendingSubmissionsQuery,
  GetStudentSubmissionsQuery,
  GetSubmissionDetailQuery,
  GetGradingStatsQuery,
  PaginatedPendingSubmissions,
  PaginatedStudentSubmissions,
  SubmissionDetailDto,
  GradingStatsDto,
} from '@assessment/application/queries';
import {
  SubmitAssignmentDto,
  GradeSubmissionDto,
  BulkGradeDto,
  ReturnForRevisionDto,
  SubmissionQueryDto,
} from '../dto';

interface CurrentUserPayload {
  userId: string;
  email: string;
  role: string;
}

@ApiTags('Submissions')
@ApiBearerAuth()
@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubmissionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ========== Student Endpoints ==========

  @Post('exercises/:exerciseId/submit')
  @Roles('student', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit an assignment' })
  @ApiParam({ name: 'exerciseId' })
  @ApiResponse({ status: 201, description: 'Assignment submitted' })
  async submitAssignment(
    @Param('exerciseId') exerciseId: string,
    @Body() dto: SubmitAssignmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: { submissionId: string } }> {
    const result = await this.commandBus.execute<
      SubmitAssignmentCommand,
      { submissionId: string }
    >(
      new SubmitAssignmentCommand(
        exerciseId,
        user.userId,
        dto.type,
        dto.fileUrl,
        dto.fileName,
        dto.fileSize,
        dto.textContent,
        dto.linkUrl,
        dto.comment,
      ),
    );
    return { success: true, data: result };
  }

  @Get('my-submissions')
  @Roles('student', 'super_admin')
  @ApiOperation({ summary: 'Get my submissions' })
  @ApiResponse({ status: 200, description: 'List of student submissions' })
  async getMySubmissions(
    @Query() query: SubmissionQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: PaginatedStudentSubmissions }> {
    const result = await this.queryBus.execute<
      GetStudentSubmissionsQuery,
      PaginatedStudentSubmissions
    >(
      new GetStudentSubmissionsQuery(
        user.userId,
        query.exerciseId,
        query.status,
        query.page,
        query.limit,
      ),
    );
    return { success: true, data: result };
  }

  // ========== Instructor Endpoints ==========

  @Get('pending')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Get pending submissions for grading' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'List of pending submissions' })
  async getPendingSubmissions(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: PaginatedPendingSubmissions }> {
    const result = await this.queryBus.execute<
      GetPendingSubmissionsQuery,
      PaginatedPendingSubmissions
    >(new GetPendingSubmissionsQuery(user.userId, page, limit));
    return { success: true, data: result };
  }

  @Get('grading-stats')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Get grading statistics' })
  @ApiQuery({ name: 'classId', required: false })
  @ApiResponse({ status: 200, description: 'Grading statistics' })
  async getGradingStats(
    @Query('classId') classId: string | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: GradingStatsDto }> {
    const result = await this.queryBus.execute<
      GetGradingStatsQuery,
      GradingStatsDto
    >(new GetGradingStatsQuery(user.userId, classId));
    return { success: true, data: result };
  }

  @Get(':submissionId')
  @Roles('student', 'instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get submission detail' })
  @ApiParam({ name: 'submissionId' })
  @ApiResponse({ status: 200, description: 'Submission detail' })
  async getSubmissionDetail(
    @Param('submissionId') submissionId: string,
  ): Promise<{ success: boolean; data: SubmissionDetailDto }> {
    const result = await this.queryBus.execute<
      GetSubmissionDetailQuery,
      SubmissionDetailDto
    >(new GetSubmissionDetailQuery(submissionId));
    return { success: true, data: result };
  }

  @Put(':submissionId/grade')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Grade a submission' })
  @ApiParam({ name: 'submissionId' })
  @ApiResponse({ status: 200, description: 'Submission graded' })
  async gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeSubmissionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; message: string }> {
    await this.commandBus.execute(
      new GradeSubmissionCommand(
        submissionId,
        user.userId,
        dto.score,
        dto.maxScore,
        dto.feedback,
      ),
    );
    return { success: true, message: 'Submission graded successfully' };
  }

  @Post('bulk-grade')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Grade multiple submissions at once' })
  @ApiResponse({ status: 200, description: 'Bulk grading result' })
  async bulkGrade(
    @Body() dto: BulkGradeDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{
    success: boolean;
    data: {
      success: string[];
      failed: Array<{ submissionId: string; error: string }>;
    };
  }> {
    const result = await this.commandBus.execute<
      BulkGradeSubmissionsCommand,
      {
        success: string[];
        failed: Array<{ submissionId: string; error: string }>;
      }
    >(new BulkGradeSubmissionsCommand(user.userId, dto.entries));
    return { success: true, data: result };
  }

  @Put(':submissionId/return')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Return submission for revision' })
  @ApiParam({ name: 'submissionId' })
  @ApiResponse({ status: 200, description: 'Submission returned for revision' })
  async returnForRevision(
    @Param('submissionId') submissionId: string,
    @Body() dto: ReturnForRevisionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; message: string }> {
    await this.commandBus.execute(
      new ReturnForRevisionCommand(submissionId, user.userId, dto.feedback),
    );
    return { success: true, message: 'Submission returned for revision' };
  }

  // ========== Admin Endpoints ==========

  @Get('students/:studentId')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get submissions for a specific student' })
  @ApiParam({ name: 'studentId' })
  @ApiResponse({ status: 200, description: 'Student submissions' })
  async getStudentSubmissions(
    @Param('studentId') studentId: string,
    @Query() query: SubmissionQueryDto,
  ): Promise<{ success: boolean; data: PaginatedStudentSubmissions }> {
    const result = await this.queryBus.execute<
      GetStudentSubmissionsQuery,
      PaginatedStudentSubmissions
    >(
      new GetStudentSubmissionsQuery(
        studentId,
        query.exerciseId,
        query.status,
        query.page,
        query.limit,
      ),
    );
    return { success: true, data: result };
  }
}
