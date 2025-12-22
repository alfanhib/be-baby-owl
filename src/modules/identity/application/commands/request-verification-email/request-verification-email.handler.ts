import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException, Logger } from '@nestjs/common';
import { RequestVerificationEmailCommand } from './request-verification-email.command';
import { Email } from '@identity/domain/value-objects/email.vo';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import { RedisService } from '@shared/infrastructure/redis/redis.service';
import { EmailService } from '@notification/email/email.service';
import { randomBytes } from 'crypto';

@CommandHandler(RequestVerificationEmailCommand)
export class RequestVerificationEmailHandler
  implements ICommandHandler<RequestVerificationEmailCommand>
{
  private readonly logger = new Logger(RequestVerificationEmailHandler.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) {}

  async execute(command: RequestVerificationEmailCommand): Promise<void> {
    // Validate email format
    const email = Email.create(command.email);

    // Find user by email
    const user = await this.userRepository.findByEmail(email.value);

    if (!user) {
      // Silently return to prevent email enumeration
      this.logger.warn(
        `Verification requested for non-existent email: ${command.email}`,
      );
      return;
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const tokenKey = `email_verification:${verificationToken}`;

    // Store token in Redis with 24 hour expiry
    await this.redisService.set(tokenKey, user.id.value, 86400);

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email.value,
      user.fullName,
      verificationToken,
    );

    this.logger.log(`Verification email sent to: ${user.email.value}`);
  }
}

