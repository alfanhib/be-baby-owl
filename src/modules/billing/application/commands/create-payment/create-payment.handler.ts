import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreatePaymentCommand } from './create-payment.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@billing/domain/repositories/payment.repository.interface';
import { Payment } from '@billing/domain/aggregates/payment.aggregate';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

@CommandHandler(CreatePaymentCommand)
export class CreatePaymentHandler implements ICommandHandler<CreatePaymentCommand> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: CreatePaymentCommand): Promise<{ paymentId: string }> {
    const payment = Payment.create({
      studentName: command.studentName,
      studentEmail: command.studentEmail,
      studentPhone: command.studentPhone,
      courseId: command.courseId,
      packageType: command.packageType,
      amount: command.amount ?? 0,
      method: command.method,
      reference: command.reference,
      paidAt: command.paidAt,
      notes: command.notes,
    });

    await this.paymentRepository.save(payment);

    // Publish domain events
    for (const event of payment.clearEvents()) {
      await this.eventBus.publish(event);
    }

    return { paymentId: payment.id.value };
  }
}
