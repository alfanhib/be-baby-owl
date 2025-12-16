import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '@shared/interfaces/decorators/public.decorator';
import { Roles } from '@shared/interfaces/decorators/roles.decorator';
import { CurrentUser } from '@shared/interfaces/decorators/current-user.decorator';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  PublishedCourseQueryDto,
} from '../dto';
import { CreateCourseCommand } from '@learning/application/commands/create-course/create-course.command';
import { CreateCourseResult } from '@learning/application/commands/create-course/create-course.handler';
import { UpdateCourseCommand } from '@learning/application/commands/update-course/update-course.command';
import { UpdateCourseResult } from '@learning/application/commands/update-course/update-course.handler';
import { PublishCourseCommand } from '@learning/application/commands/publish-course/publish-course.command';
import { PublishCourseResult } from '@learning/application/commands/publish-course/publish-course.handler';
import { ArchiveCourseCommand } from '@learning/application/commands/archive-course/archive-course.command';
import { ArchiveCourseResult } from '@learning/application/commands/archive-course/archive-course.handler';
import { DeleteCourseCommand } from '@learning/application/commands/delete-course/delete-course.command';
import {
  GetCourseQuery,
  GetCourseBySlugQuery,
} from '@learning/application/queries/get-course/get-course.query';
import { CourseDetailResult } from '@learning/application/queries/get-course/get-course.handler';
import {
  GetCoursesQuery,
  GetPublishedCoursesQuery,
} from '@learning/application/queries/get-courses/get-courses.query';
import { PaginatedCoursesResult } from '@learning/application/queries/get-courses/get-courses.handler';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ============================================
  // Public Endpoints (Catalog)
  // ============================================

  @Get('catalog')
  @Public()
  @ApiOperation({ summary: 'Get published courses (public catalog)' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated published courses',
  })
  async getCatalog(
    @Query() query: PublishedCourseQueryDto,
  ): Promise<PaginatedCoursesResult> {
    return this.queryBus.execute(
      new GetPublishedCoursesQuery(
        query.page,
        query.limit,
        query.category,
        query.level,
        query.search,
      ),
    );
  }

  @Get('catalog/:slug')
  @Public()
  @ApiOperation({ summary: 'Get course detail by slug (public)' })
  @ApiResponse({ status: 200, description: 'Returns course details' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCatalogCourse(
    @Param('slug') slug: string,
  ): Promise<CourseDetailResult> {
    return this.queryBus.execute(new GetCourseBySlugQuery(slug));
  }

  // ============================================
  // Admin/Instructor Endpoints
  // ============================================

  @Get()
  @Roles('instructor', 'staff', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all courses (admin/instructor)' })
  @ApiResponse({ status: 200, description: 'Returns paginated courses' })
  async getCourses(
    @Query() query: CourseQueryDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedCoursesResult> {
    // Instructors only see their own courses, admins see all
    const createdById = user.role === 'instructor' ? user.id : undefined;

    return this.queryBus.execute(
      new GetCoursesQuery(
        query.page,
        query.limit,
        query.status,
        query.category,
        query.level,
        createdById,
        query.search,
      ),
    );
  }

  @Get(':id')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({ status: 200, description: 'Returns course details' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourse(@Param('id') id: string): Promise<CourseDetailResult> {
    return this.queryBus.execute(new GetCourseQuery(id));
  }

  @Post()
  @Roles('instructor', 'staff', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input or duplicate slug' })
  async createCourse(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCourseDto,
  ): Promise<CreateCourseResult> {
    const command = new CreateCourseCommand(
      dto.title,
      dto.description,
      user.id,
      dto.slug,
      dto.coverImage,
      dto.category,
      dto.level,
      dto.language,
      dto.estimatedDuration,
    );
    return this.commandBus.execute(command);
  }

  @Put(':id')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update course' })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async updateCourse(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCourseDto,
  ): Promise<UpdateCourseResult> {
    const command = new UpdateCourseCommand(
      id,
      user.id,
      dto.title,
      dto.description,
      dto.coverImage,
      dto.category,
      dto.level,
      dto.language,
      dto.estimatedDuration,
    );
    return this.commandBus.execute(command);
  }

  @Post(':id/publish')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish course' })
  @ApiResponse({ status: 200, description: 'Course published successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot publish (no sections, etc.)',
  })
  async publishCourse(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<PublishCourseResult> {
    const command = new PublishCourseCommand(id, user.id);
    return this.commandBus.execute(command);
  }

  @Post(':id/archive')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Archive course' })
  @ApiResponse({ status: 200, description: 'Course archived successfully' })
  @ApiResponse({ status: 400, description: 'Cannot archive (not published)' })
  async archiveCourse(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ArchiveCourseResult> {
    const command = new ArchiveCourseCommand(id, user.id);
    return this.commandBus.execute(command);
  }

  @Delete(':id')
  @Roles('instructor', 'staff', 'super_admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete draft course' })
  @ApiResponse({ status: 204, description: 'Course deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete published course' })
  async deleteCourse(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    const command = new DeleteCourseCommand(id, user.id);
    return this.commandBus.execute(command);
  }
}
