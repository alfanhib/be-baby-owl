import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/interfaces/guards/jwt-auth.guard';
import { RolesGuard } from '@shared/interfaces/guards/roles.guard';
import { Roles } from '@shared/interfaces/decorators/roles.decorator';
import { CurrentUser } from '@shared/interfaces/decorators/current-user.decorator';
import { CurrentUserPayload } from '@shared/interfaces/decorators/current-user.decorator';
import {
  AddExerciseCommand,
  UpdateExerciseCommand,
  DeleteExerciseCommand,
  ReorderExercisesCommand,
} from '@learning/application/commands';
import { GetExerciseDetailQuery } from '@learning/application/queries/get-exercise-detail';
import { ExerciseContent } from '@learning/domain/entities/exercise.entity';
import { AddExerciseDto, UpdateExerciseDto, ReorderExercisesDto } from '../dto';

@ApiTags('Exercises')
@ApiBearerAuth()
@Controller('courses/:courseId/sections/:sectionId/lessons/:lessonId/exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExercisesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Add an exercise to a lesson' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({ status: 201, description: 'Exercise created successfully' })
  @ApiResponse({
    status: 404,
    description: 'Course, section or lesson not found',
  })
  async addExercise(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: AddExerciseDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ exerciseId: string }> {
    return this.commandBus.execute(
      new AddExerciseCommand(
        courseId,
        sectionId,
        lessonId,
        dto.title,
        dto.type,
        dto.content as unknown as ExerciseContent,
        dto.estimatedDuration,
        user.userId,
      ),
    );
  }

  @Put(':exerciseId')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Update an exercise' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiParam({ name: 'exerciseId', description: 'Exercise ID' })
  @ApiResponse({ status: 200, description: 'Exercise updated successfully' })
  @ApiResponse({
    status: 404,
    description: 'Course, section, lesson or exercise not found',
  })
  async updateExercise(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() dto: UpdateExerciseDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateExerciseCommand(
        exerciseId,
        courseId,
        sectionId,
        lessonId,
        dto.title,
        dto.content as unknown as ExerciseContent | undefined,
        dto.estimatedDuration,
        user.userId,
      ),
    );
  }

  @Delete(':exerciseId')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Delete an exercise from a lesson' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiParam({ name: 'exerciseId', description: 'Exercise ID' })
  @ApiResponse({ status: 200, description: 'Exercise deleted successfully' })
  @ApiResponse({
    status: 404,
    description: 'Course, section, lesson or exercise not found',
  })
  async deleteExercise(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @Param('exerciseId') exerciseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteExerciseCommand(
        exerciseId,
        courseId,
        sectionId,
        lessonId,
        user.userId,
      ),
    );
  }

  @Put('reorder')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Reorder exercises in a lesson' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({ status: 200, description: 'Exercises reordered successfully' })
  @ApiResponse({
    status: 404,
    description: 'Course, section or lesson not found',
  })
  async reorderExercises(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: ReorderExercisesDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.commandBus.execute(
      new ReorderExercisesCommand(
        courseId,
        sectionId,
        lessonId,
        dto.exerciseIds,
        user.userId,
      ),
    );
  }

  @Get(':exerciseId')
  @Roles('student', 'instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get exercise details with content' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiParam({ name: 'exerciseId', description: 'Exercise ID' })
  @ApiResponse({ status: 200, description: 'Exercise details retrieved' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  async getExerciseDetail(
    @Param('courseId') courseId: string,
    @Param('exerciseId') exerciseId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.queryBus.execute(
      new GetExerciseDetailQuery(courseId, exerciseId, user.userId),
    );

    if (!result) {
      throw new NotFoundException('Exercise not found');
    }

    return {
      success: true,
      data: result,
    };
  }
}
