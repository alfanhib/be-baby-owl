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
  AddLessonCommand,
  UpdateLessonCommand,
  DeleteLessonCommand,
  ReorderLessonsCommand,
} from '@learning/application/commands';
import { GetLessonDetailQuery } from '@learning/application/queries/get-lesson-detail';
import { AddLessonDto, UpdateLessonDto, ReorderLessonsDto } from '../dto';

@ApiTags('Lessons')
@ApiBearerAuth()
@Controller('courses/:courseId/sections/:sectionId/lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Add a lesson to a section' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiResponse({ status: 201, description: 'Lesson created successfully' })
  @ApiResponse({ status: 404, description: 'Course or section not found' })
  async addLesson(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: AddLessonDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ lessonId: string }> {
    return this.commandBus.execute(
      new AddLessonCommand(
        courseId,
        sectionId,
        dto.title,
        dto.description,
        dto.estimatedDuration,
        user.userId,
      ),
    );
  }

  @Put(':lessonId')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Update a lesson' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({ status: 200, description: 'Lesson updated successfully' })
  @ApiResponse({
    status: 404,
    description: 'Course, section or lesson not found',
  })
  async updateLesson(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateLessonCommand(
        lessonId,
        courseId,
        sectionId,
        dto.title,
        dto.description,
        dto.estimatedDuration,
        user.userId,
      ),
    );
  }

  @Delete(':lessonId')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Delete a lesson from a section' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  @ApiResponse({
    status: 404,
    description: 'Course, section or lesson not found',
  })
  async deleteLesson(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteLessonCommand(lessonId, courseId, sectionId, user.userId),
    );
  }

  @Put('reorder')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Reorder lessons in a section' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiResponse({ status: 200, description: 'Lessons reordered successfully' })
  @ApiResponse({ status: 404, description: 'Course or section not found' })
  async reorderLessons(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: ReorderLessonsDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.commandBus.execute(
      new ReorderLessonsCommand(
        courseId,
        sectionId,
        dto.lessonIds,
        user.userId,
      ),
    );
  }

  @Get(':lessonId')
  @Roles('student', 'instructor', 'staff', 'super_admin')
  @ApiOperation({ summary: 'Get lesson details with exercises' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiParam({ name: 'lessonId', description: 'Lesson ID' })
  @ApiResponse({ status: 200, description: 'Lesson details retrieved' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async getLessonDetail(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; data: unknown }> {
    const result: unknown = await this.queryBus.execute(
      new GetLessonDetailQuery(courseId, lessonId, user.userId),
    );

    if (!result) {
      throw new NotFoundException('Lesson not found');
    }

    return {
      success: true,
      data: result,
    };
  }
}
