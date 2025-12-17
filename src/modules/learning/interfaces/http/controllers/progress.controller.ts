import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/interfaces/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/interfaces/guards/roles.guard';
import { Roles } from '@shared/interfaces/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUserPayload,
} from '@shared/interfaces/decorators/current-user.decorator';
import { CompleteExerciseCommand } from '@learning/application/commands/complete-exercise';
import { UpdateVideoProgressCommand } from '@learning/application/commands/update-video-progress';
import { UpdateMaterialProgressCommand } from '@learning/application/commands/update-material-progress';
import { SubmitQuizAnswerCommand } from '@learning/application/commands/submit-quiz-answer';
import { GetStudentProgressQuery } from '@learning/application/queries/get-student-progress';
import { GetCourseStatsQuery } from '@learning/application/queries/get-course-stats';
import { CompleteExerciseDto } from '../dto/complete-exercise.dto';
import { UpdateVideoProgressDto } from '../dto/update-video-progress.dto';
import { UpdateMaterialProgressDto } from '../dto/update-material-progress.dto';
import { SubmitQuizDto } from '../dto/submit-quiz.dto';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('exercises/:exerciseId/complete')
  @Roles('student', 'instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark an exercise as complete' })
  @ApiResponse({ status: 200, description: 'Exercise marked as complete' })
  async completeExercise(
    @Param('exerciseId') exerciseId: string,
    @Body() dto: CompleteExerciseDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.commandBus.execute(
      new CompleteExerciseCommand(
        user.userId,
        dto.courseId,
        dto.lessonId,
        exerciseId,
      ),
    );

    return {
      success: true,
      data: result,
    };
  }

  @Put('exercises/:exerciseId/video')
  @Roles('student', 'instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update video watch progress' })
  @ApiResponse({ status: 200, description: 'Video progress updated' })
  async updateVideoProgress(
    @Param('exerciseId') exerciseId: string,
    @Body() dto: UpdateVideoProgressDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.commandBus.execute(
      new UpdateVideoProgressCommand(
        user.userId,
        dto.courseId,
        dto.lessonId,
        exerciseId,
        dto.watchedSeconds,
        dto.totalSeconds,
      ),
    );

    return {
      success: true,
      data: result,
    };
  }

  @Put('exercises/:exerciseId/material')
  @Roles('student', 'instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update material reading progress' })
  @ApiResponse({ status: 200, description: 'Material progress updated' })
  async updateMaterialProgress(
    @Param('exerciseId') exerciseId: string,
    @Body() dto: UpdateMaterialProgressDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.commandBus.execute(
      new UpdateMaterialProgressCommand(
        user.userId,
        dto.courseId,
        dto.lessonId,
        exerciseId,
        dto.scrollDepth,
      ),
    );

    return {
      success: true,
      data: result,
    };
  }

  @Post('exercises/:exerciseId/quiz')
  @Roles('student', 'instructor', 'staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit quiz answers' })
  @ApiResponse({ status: 200, description: 'Quiz submitted and graded' })
  async submitQuiz(
    @Param('exerciseId') exerciseId: string,
    @Body() dto: SubmitQuizDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.commandBus.execute(
      new SubmitQuizAnswerCommand(
        user.userId,
        dto.courseId,
        dto.lessonId,
        exerciseId,
        dto.answers,
      ),
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get('courses/:courseId')
  @Roles('student', 'instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get student progress for a course' })
  @ApiResponse({ status: 200, description: 'Student progress retrieved' })
  async getStudentProgress(
    @Param('courseId') courseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.queryBus.execute(
      new GetStudentProgressQuery(user.userId, courseId),
    );

    if (!result) {
      throw new NotFoundException('Course not found or no progress recorded');
    }

    return {
      success: true,
      data: result,
    };
  }

  @Get('courses/:courseId/stats')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get course statistics (instructor view)' })
  @ApiResponse({ status: 200, description: 'Course statistics retrieved' })
  async getCourseStats(
    @Param('courseId') courseId: string,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.queryBus.execute(
      new GetCourseStatsQuery(courseId),
    );

    if (!result) {
      throw new NotFoundException('Course not found');
    }

    return {
      success: true,
      data: result,
    };
  }
}
