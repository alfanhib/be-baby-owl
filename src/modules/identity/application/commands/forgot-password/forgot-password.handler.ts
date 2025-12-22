import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { ForgotPasswordCommand } from './forgot-password.command';
import { Email } from '@identity/domain/value-objects/email.vo';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import { RedisService } from '@shared/infrastructure/redis/redis.service';
import { EmailService } from '@notification/email/email.service';
import { randomBytes } from 'crypto';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler
  implements ICommandHandler<ForgotPasswordCommand>
{
  private readonly logger = new Logger(ForgotPasswordHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: ForgotPasswordCommand): Promise<void> {
    // Validate email format
    const email = Email.create(command.email);

    // Find user by email
    const user = await this.userRepository.findByEmail(email.value);

    // Always return success to prevent email enumeration attacks
    // Even if user doesn't exist, don't reveal this
    if (!user) {
      this.logger.warn(
        `Password reset requested for non-existent email: ${command.email}`,
      );
      return;
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString('hex');
    const tokenKey = `password_reset:${resetToken}`;

    // Store token in Redis with 1 hour expiry
    await this.redisService.set(tokenKey, user.id.value, 3600);

    // Send password reset email
    await this.emailService.sendPasswordResetEmail(
      user.email.value,
      user.fullName,
      resetToken,
    );

    this.logger.log(`Password reset email sent to: ${user.email.value}`);
  }
}

