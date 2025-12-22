import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { RegisterCommand } from './register-user.command';
import { User } from '@identity/domain/aggregates/user.aggregate';
import { Password } from '@identity/domain/value-objects/password.vo';
import { UserRoleEnum } from '@identity/domain/value-objects/user-role.vo';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '@identity/domain/services/password-hasher.interface';
import { PASSWORD_HASHER } from '@identity/domain/services/password-hasher.interface';
import { EmailAlreadyExistsError } from '@identity/domain/errors/email-already-exists.error';
import { UsernameAlreadyExistsError } from '@identity/domain/errors/username-already-exists.error';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

export interface RegisterResult {
  userId: string;
}

@CommandHandler(RegisterCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: RegisterCommand): Promise<RegisterResult> {
    // Validate password strength (will throw if weak)
    Password.createFromPlain(command.password);

    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(command.email);

    if (emailExists) {
      throw new EmailAlreadyExistsError(command.email);
    }

    // Check if username already exists (if provided)
    if (command.username) {
      const usernameExists = await this.userRepository.usernameExists(
        command.username,
      );

      if (usernameExists) {
        throw new UsernameAlreadyExistsError(command.username);
      }
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(command.password);

    // Create user aggregate
    const user = User.create({
      email: command.email,
      username: command.username,
      passwordHash,
      fullName: command.fullName,
      role: command.role as UserRoleEnum | undefined,
    });

    // Save to repository
    await this.userRepository.save(user);

    // Publish domain events
    await this.eventBus.publishFromAggregate(user);

    return {
      userId: user.id.value,
    };
  }
}
