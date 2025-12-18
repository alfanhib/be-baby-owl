import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UploadProofCommand } from './upload-proof.command';
import {
  IPaymentRepository,
  PAYMENT_REPOSITORY,
} from '@billing/domain/repositories/payment.repository.interface';
import { PaymentId } from '@billing/domain/value-objects/payment-id.vo';
import { PaymentNotFoundError } from '@billing/domain/errors';

@CommandHandler(UploadProofCommand)
export class UploadProofHandler implements ICommandHandler<UploadProofCommand> {
  constructor(
    @Inject(PAYMENT_REPOSITORY)
    private readonly paymentRepository: IPaymentRepository,
  ) {}

  async execute(command: UploadProofCommand): Promise<{ proofUrl: string }> {
    const paymentId = PaymentId.create(command.paymentId);
    const payment = await this.paymentRepository.findById(paymentId);

    if (!payment) {
      throw new PaymentNotFoundError(command.paymentId);
    }

    payment.uploadProof(command.proofUrl);

    await this.paymentRepository.save(payment);

    return { proofUrl: command.proofUrl };
  }
}
