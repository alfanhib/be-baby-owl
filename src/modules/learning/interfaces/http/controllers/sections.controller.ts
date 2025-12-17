import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
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
  AddSectionCommand,
  UpdateSectionCommand,
  DeleteSectionCommand,
  ReorderSectionsCommand,
} from '@learning/application/commands';
import { AddSectionDto, UpdateSectionDto, ReorderSectionsDto } from '../dto';

@ApiTags('Sections')
@ApiBearerAuth()
@Controller('courses/:courseId/sections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SectionsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Add a section to a course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 201, description: 'Section created successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async addSection(
    @Param('courseId') courseId: string,
    @Body() dto: AddSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ sectionId: string }> {
    return this.commandBus.execute(
      new AddSectionCommand(courseId, dto.title, dto.description, user.userId),
    );
  }

  @Put(':sectionId')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Update a section' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiResponse({ status: 200, description: 'Section updated successfully' })
  @ApiResponse({ status: 404, description: 'Course or section not found' })
  async updateSection(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateSectionCommand(
        sectionId,
        courseId,
        dto.title,
        dto.description,
        user.userId,
      ),
    );
  }

  @Delete(':sectionId')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Delete a section from a course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiResponse({ status: 200, description: 'Section deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course or section not found' })
  async deleteSection(
    @Param('courseId') courseId: string,
    @Param('sectionId') sectionId: string,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteSectionCommand(sectionId, courseId, user.userId),
    );
  }

  @Put('reorder')
  @Roles('instructor', 'super_admin')
  @ApiOperation({ summary: 'Reorder sections in a course' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiResponse({ status: 200, description: 'Sections reordered successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async reorderSections(
    @Param('courseId') courseId: string,
    @Body() dto: ReorderSectionsDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    await this.commandBus.execute(
      new ReorderSectionsCommand(courseId, dto.sectionIds, user.userId),
    );
  }
}
