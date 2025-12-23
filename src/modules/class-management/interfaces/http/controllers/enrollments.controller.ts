import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
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

// Queries
import {
  GetEnrollmentsQuery,
  GetEnrollmentQuery,
  GetEnrollmentStatsQuery,
} from '@class-management/application/queries';
import { EnrollmentListResult } from '@class-management/application/queries/get-enrollments/get-enrollments.handler';
import { EnrollmentDetailResult } from '@class-management/application/queries/get-enrollment/get-enrollment.handler';
import { EnrollmentStatsResult } from '@class-management/application/queries/get-enrollment-stats/get-enrollment-stats.handler';

// Commands
import {
  CreateEnrollmentCommand,
  UpdateEnrollmentStatusCommand,
  UpdatePaymentStatusCommand,
  TransferEnrollmentCommand,
  UpgradePackageCommand,
  CancelEnrollmentCommand,
  BulkEnrollCommand,
  AdjustCreditsCommand,
} from '@class-management/application/commands';
import { CreateEnrollmentResult } from '@class-management/application/commands/create-enrollment/create-enrollment.handler';
import { UpgradePackageResult } from '@class-management/application/commands/upgrade-package/upgrade-package.handler';
import { BulkEnrollResult } from '@class-management/application/commands/bulk-enroll/bulk-enroll.handler';

// DTOs
import {
  CreateEnrollmentDto,
  UpdateEnrollmentStatusDto,
  UpdatePaymentStatusDto,
  TransferEnrollmentDto,
  UpgradePackageDto,
  CancelEnrollmentDto,
  BulkEnrollDto,
  AdjustCreditsDto,
} from '../dto';

@ApiTags('Enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  // ========== Enrollment CRUD ==========

  @Get()
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Get paginated list of enrollments' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'completed', 'withdrawn'],
  })
  @ApiQuery({
    name: 'paymentStatus',
    required: false,
    enum: ['pending', 'verified', 'refunded'],
  })
  @ApiQuery({ name: 'classId', required: false })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getEnrollments(
    @Query('status') status?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('classId') classId?: string,
    @Query('courseId') courseId?: string,
    @Query('studentId') studentId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<EnrollmentListResult> {
    return this.queryBus.execute(
      new GetEnrollmentsQuery(
        { status, paymentStatus, classId, courseId, studentId, search },
        page || 1,
        limit || 10,
      ),
    );
  }

  @Get('stats')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Get enrollment statistics' })
  async getEnrollmentStats(): Promise<EnrollmentStatsResult> {
    return this.queryBus.execute(new GetEnrollmentStatsQuery());
  }

  @Get(':id')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Get single enrollment with full details' })
  @ApiParam({ name: 'id' })
  async getEnrollment(
    @Param('id') id: string,
  ): Promise<EnrollmentDetailResult> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const result = await this.queryBus.execute(new GetEnrollmentQuery(id));
    if (!result) {
      throw new NotFoundException(`Enrollment ${id} not found`);
    }
    return result as EnrollmentDetailResult;
  }

  @Post()
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Create a new enrollment (Quick Enrollment Tool)' })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
  async createEnrollment(
    @Body() dto: CreateEnrollmentDto,
  ): Promise<CreateEnrollmentResult> {
    return this.commandBus.execute(
      new CreateEnrollmentCommand(
        dto.classId,
        dto.studentId,
        dto.student,
        dto.amount,
        dto.paymentStatus,
        dto.notes,
      ),
    );
  }

  @Patch(':id/status')
  @Roles('staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update enrollment status' })
  @ApiParam({ name: 'id' })
  async updateEnrollmentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEnrollmentStatusDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    return this.commandBus.execute(
      new UpdateEnrollmentStatusCommand(id, dto.status, user.userId),
    );
  }

  @Patch(':id/payment-status')
  @Roles('staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update payment status' })
  @ApiParam({ name: 'id' })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    return this.commandBus.execute(
      new UpdatePaymentStatusCommand(
        id,
        dto.paymentStatus,
        user.userId,
        dto.verificationNotes,
      ),
    );
  }

  // ========== Enrollment Actions ==========

  @Post(':id/transfer')
  @Roles('staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transfer student to different class' })
  @ApiParam({ name: 'id' })
  async transferEnrollment(
    @Param('id') id: string,
    @Body() dto: TransferEnrollmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<unknown> {
    return this.commandBus.execute(
      new TransferEnrollmentCommand(id, dto.toClassId, dto.reason, user.userId),
    );
  }

  @Post(':id/upgrade')
  @Roles('staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Upgrade package (add meetings) - Private classes only',
  })
  @ApiParam({ name: 'id' })
  async upgradePackage(
    @Param('id') id: string,
    @Body() dto: UpgradePackageDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<UpgradePackageResult> {
    return this.commandBus.execute(
      new UpgradePackageCommand(
        id,
        dto.additionalMeetings,
        dto.additionalAmount,
        dto.paymentStatus,
        user.userId,
      ),
    );
  }

  @Post(':id/cancel')
  @Roles('staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel enrollment' })
  @ApiParam({ name: 'id' })
  async cancelEnrollment(
    @Param('id') id: string,
    @Body() dto: CancelEnrollmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ message: string }> {
    return this.commandBus.execute(
      new CancelEnrollmentCommand(
        id,
        dto.reason,
        dto.refundAmount ?? null,
        user.userId,
      ),
    );
  }

  @Post(':id/credits/adjust')
  @Roles('staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adjust student credits (add/deduct)' })
  @ApiParam({ name: 'id' })
  async adjustCredits(
    @Param('id') id: string,
    @Body() dto: AdjustCreditsDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ adjustmentId: string }> {
    // Need to get enrollment to find classId
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const enrollment = await this.queryBus.execute(new GetEnrollmentQuery(id));
    if (!enrollment) {
      throw new NotFoundException(`Enrollment ${id} not found`);
    }

    return this.commandBus.execute(
      new AdjustCreditsCommand(
        (enrollment as EnrollmentDetailResult).class.id,
        id,
        dto.amount,
        dto.type,
        dto.reason,
        user.userId,
      ),
    );
  }

  // ========== Bulk Operations ==========

  @Post('bulk')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Bulk create enrollments' })
  @ApiResponse({ status: 201, description: 'Bulk enrollment completed' })
  async bulkEnroll(
    @Body() dto: BulkEnrollDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<BulkEnrollResult> {
    return this.commandBus.execute(
      new BulkEnrollCommand(
        dto.classId,
        dto.students,
        dto.amount,
        dto.paymentStatus,
        user.userId,
      ),
    );
  }
}
