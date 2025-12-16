import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ChangePasswordCommand } from './change-password.command';
import { UserId } from '@identity/domain/value-objects/user-id.vo';
import { Password } from '@identity/domain/value-objects/password.vo';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '@identity/domain/services/password-hasher.interface';
import { PASSWORD_HASHER } from '@identity/domain/services/password-hasher.interface';
import { UserNotFoundError } from '@identity/domain/errors/user-not-found.error';
import { InvalidCredentialsError } from '@identity/domain/errors/invalid-credentials.error';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    // Validate new password strength (will throw if weak)
    Password.createFromPlain(command.newPassword);

    // Find user
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError(command.userId);
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordHasher.compare(
      command.currentPassword,
      user.passwordHash.value,
    );

    if (!isCurrentPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Hash new password
    const newPasswordHash = await this.passwordHasher.hash(command.newPassword);

    // Change password
    user.changePassword(newPasswordHash);
    await this.userRepository.save(user);

    // Publish domain events
    await this.eventBus.publishFromAggregate(user);
  }
}
