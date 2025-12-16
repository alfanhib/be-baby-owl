import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { VerifyEmailCommand } from './verify-email.command';
import { UserId } from '@identity/domain/value-objects/user-id.vo';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import { UserNotFoundError } from '@identity/domain/errors/user-not-found.error';
import { RedisService } from '@shared/infrastructure/redis/redis.service';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

@CommandHandler(VerifyEmailCommand)
export class VerifyEmailHandler implements ICommandHandler<VerifyEmailCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly redisService: RedisService,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: VerifyEmailCommand): Promise<void> {
    // Get user ID from verification token in Redis
    const userId = await this.redisService.get(
      `email_verification:${command.token}`,
    );

    if (!userId) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    // Find user
    const user = await this.userRepository.findById(UserId.create(userId));

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    // Verify email
    user.verifyEmail();
    await this.userRepository.save(user);

    // Remove verification token
    await this.redisService.del(`email_verification:${command.token}`);

    // Publish domain events
    await this.eventBus.publishFromAggregate(user);
  }
}
