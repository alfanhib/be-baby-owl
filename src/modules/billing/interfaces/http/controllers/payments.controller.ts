import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from '@shared/interfaces/decorators/roles.decorator';
import { CurrentUser } from '@shared/interfaces/decorators/current-user.decorator';

// DTOs
import {
  CreatePaymentDto,
  UpdatePaymentDto,
  VerifyPaymentDto,
  RejectPaymentDto,
  RefundPaymentDto,
  PaymentQueryDto,
} from '../dto';

// Commands
import {
  CreatePaymentCommand,
  VerifyPaymentCommand,
  RejectPaymentCommand,
  RefundPaymentCommand,
  UpdatePaymentCommand,
} from '@billing/application/commands';

// Queries
import {
  GetPaymentQuery,
  GetPaymentsQuery,
  GetPaymentStatsQuery,
  ExportPaymentsQuery,
  PaymentDto,
  PaginatedPaymentsResult,
} from '@billing/application/queries';

import { PaymentStats } from '@billing/domain/repositories/payment.repository.interface';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Get paginated list of payments' })
  @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
  async getPayments(
    @Query() query: PaymentQueryDto,
  ): Promise<PaginatedPaymentsResult> {
    return this.queryBus.execute<GetPaymentsQuery, PaginatedPaymentsResult>(
      new GetPaymentsQuery(
        query.status,
        query.method,
        query.courseId,
        query.search,
        query.startDate ? new Date(query.startDate) : undefined,
        query.endDate ? new Date(query.endDate) : undefined,
        query.page,
        query.limit,
      ),
    );
  }

  @Get('stats')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Get payment statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  async getStats(): Promise<PaymentStats> {
    return this.queryBus.execute<GetPaymentStatsQuery, PaymentStats>(
      new GetPaymentStatsQuery(),
    );
  }

  @Get('export')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Export payments to CSV' })
  @ApiResponse({ status: 200, description: 'CSV file downloaded' })
  @Header('Content-Type', 'text/csv')
  async exportPayments(
    @Query() query: PaymentQueryDto,
    @Res() res: Response,
  ): Promise<void> {
    const csv = await this.queryBus.execute<ExportPaymentsQuery, string>(
      new ExportPaymentsQuery(
        query.status,
        query.method,
        query.courseId,
        query.search,
        query.startDate ? new Date(query.startDate) : undefined,
        query.endDate ? new Date(query.endDate) : undefined,
      ),
    );

    const filename = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get(':id')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, description: 'Payment found' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(@Param('id') id: string): Promise<PaymentDto> {
    return this.queryBus.execute<GetPaymentQuery, PaymentDto>(
      new GetPaymentQuery(id),
    );
  }

  @Post()
  @Roles('staff', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment record' })
  @ApiResponse({ status: 201, description: 'Payment created' })
  async createPayment(
    @Body() dto: CreatePaymentDto,
  ): Promise<{ paymentId: string }> {
    return this.commandBus.execute<CreatePaymentCommand, { paymentId: string }>(
      new CreatePaymentCommand(
        dto.studentName,
        dto.studentEmail,
        dto.studentPhone,
        dto.courseId,
        dto.packageType,
        dto.amount,
        dto.method,
        dto.reference,
        dto.paidAt ? new Date(dto.paidAt) : undefined,
        dto.notes,
      ),
    );
  }

  @Patch(':id')
  @Roles('staff', 'super_admin')
  @ApiOperation({ summary: 'Update payment details' })
  @ApiResponse({ status: 200, description: 'Payment updated' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async updatePayment(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentDto,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(
      new UpdatePaymentCommand(
        id,
        dto.studentName,
        dto.studentEmail,
        dto.studentPhone,
        dto.courseId,
        dto.packageType,
        dto.amount,
        dto.method,
        dto.reference,
        dto.notes,
        dto.paidAt ? new Date(dto.paidAt) : undefined,
      ),
    );

    return { message: 'Payment updated successfully' };
  }

  @Post(':id/verify')
  @Roles('staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a payment' })
  @ApiResponse({ status: 200, description: 'Payment verified' })
  @ApiResponse({ status: 400, description: 'Cannot verify payment' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async verifyPayment(
    @Param('id') id: string,
    @Body() dto: VerifyPaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(
      new VerifyPaymentCommand(id, user.id, dto.notes),
    );

    return { message: 'Payment verified successfully' };
  }

  @Post(':id/reject')
  @Roles('staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject a payment' })
  @ApiResponse({ status: 200, description: 'Payment rejected' })
  @ApiResponse({ status: 400, description: 'Cannot reject payment' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async rejectPayment(
    @Param('id') id: string,
    @Body() dto: RejectPaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(
      new RejectPaymentCommand(id, user.id, dto.reason),
    );

    return { message: 'Payment rejected' };
  }

  @Post(':id/refund')
  @Roles('staff', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refund a payment' })
  @ApiResponse({ status: 200, description: 'Payment refunded' })
  @ApiResponse({ status: 400, description: 'Cannot refund payment' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async refundPayment(
    @Param('id') id: string,
    @Body() dto: RefundPaymentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(
      new RefundPaymentCommand(id, user.id, dto.amount, dto.reason, dto.notes),
    );

    return { message: 'Payment refunded successfully' };
  }

  @Delete(':id')
  @Roles('super_admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a payment (super admin only)' })
  @ApiResponse({ status: 204, description: 'Payment deleted' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  deletePayment(@Param('id') id: string): never {
    // Note: Delete functionality not implemented for safety
    // Payments should be rejected/refunded, not deleted
    throw new BadRequestException(
      `Payment ${id} deletion is not supported. Use reject or refund instead.`,
    );
  }
}
