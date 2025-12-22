import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import { ResetPasswordCommand } from './reset-password.command';
import { UserId } from '@identity/domain/value-objects/user-id.vo';
import { Password } from '@identity/domain/value-objects/password.vo';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '@identity/domain/services/password-hasher.interface';
import { PASSWORD_HASHER } from '@identity/domain/services/password-hasher.interface';
import { UserNotFoundError } from '@identity/domain/errors/user-not-found.error';
import { RedisService } from '@shared/infrastructure/redis/redis.service';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler
  implements ICommandHandler<ResetPasswordCommand>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly redisService: RedisService,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<void> {
    // Validate new password strength
    Password.createFromPlain(command.newPassword);

    // Get user ID from reset token in Redis
    const tokenKey = `password_reset:${command.token}`;
    const userId = await this.redisService.get(tokenKey);

    if (!userId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Find user
    const user = await this.userRepository.findById(UserId.create(userId));

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    // Hash new password
    const newPasswordHash = await this.passwordHasher.hash(command.newPassword);

    // Reset password
    user.changePassword(newPasswordHash);
    await this.userRepository.save(user);

    // Remove reset token
    await this.redisService.del(tokenKey);

    // Publish domain events
    await this.eventBus.publishFromAggregate(user);
  }
}

