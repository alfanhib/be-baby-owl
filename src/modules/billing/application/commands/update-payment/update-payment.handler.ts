import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdatePaymentCommand } from './update-payment.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@billing/domain/repositories/payment.repository.interface';
import { PaymentId } from '@billing/domain/value-objects/payment-id.vo';
import { PaymentNotFoundError } from '@billing/domain/errors';

@CommandHandler(UpdatePaymentCommand)
export class UpdatePaymentHandler implements ICommandHandler<UpdatePaymentCommand> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(command: UpdatePaymentCommand): Promise<void> {
    const paymentId = PaymentId.create(command.paymentId);
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new PaymentNotFoundError(command.paymentId);
    }

    payment.updateDetails({
      studentName: command.studentName,
      studentEmail: command.studentEmail,
      studentPhone: command.studentPhone,
      courseId: command.courseId,
      packageType: command.packageType,
      amount: command.amount,
      method: command.method,
      reference: command.reference,
      notes: command.notes,
      paidAt: command.paidAt,
    });

    await this.paymentRepository.save(payment);
  }
}
