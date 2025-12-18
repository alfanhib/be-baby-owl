import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { VerifyPaymentCommand } from './verify-payment.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@billing/domain/repositories/payment.repository.interface';
import { PaymentId } from '@billing/domain/value-objects/payment-id.vo';
import { PaymentNotFoundError } from '@billing/domain/errors';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

@CommandHandler(VerifyPaymentCommand)
export class VerifyPaymentHandler implements ICommandHandler<VerifyPaymentCommand> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: VerifyPaymentCommand): Promise<void> {
    const paymentId = PaymentId.create(command.paymentId);
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new PaymentNotFoundError(command.paymentId);
    }

    payment.verify(command.verifiedBy, command.notes);

    await this.paymentRepository.save(payment);

    // Publish domain events
    for (const event of payment.clearEvents()) {
      await this.eventBus.publish(event);
    }
  }
}
