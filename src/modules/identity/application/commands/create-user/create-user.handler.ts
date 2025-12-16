import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException } from '@nestjs/common';
import { CreateUserCommand } from './create-user.command';
import { User } from '@identity/domain/aggregates/user.aggregate';
import { Password } from '@identity/domain/value-objects/password.vo';
import { UserId } from '@identity/domain/value-objects/user-id.vo';
import { UserRoleEnum } from '@identity/domain/value-objects/user-role.vo';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '@identity/domain/services/password-hasher.interface';
import { PASSWORD_HASHER } from '@identity/domain/services/password-hasher.interface';
import { EmailAlreadyExistsError } from '@identity/domain/errors/email-already-exists.error';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

export interface CreateUserResult {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    // Validate role is valid
    const validRoles = Object.values(UserRoleEnum);
    if (!validRoles.includes(command.role as UserRoleEnum)) {
      throw new ForbiddenException(`Invalid role: ${command.role}`);
    }

    // Staff can only create students
    // Super Admin can create any role except super_admin
    const creatorId = UserId.create(command.createdBy);
    const creatorUser = await this.userRepository.findById(creatorId);
    if (!creatorUser) {
      throw new ForbiddenException('Creator user not found');
    }

    const creatorRole = creatorUser.role.value;
    const targetRole = command.role as UserRoleEnum;

    // Staff can only create students
    if (creatorRole === UserRoleEnum.STAFF) {
      if (targetRole !== UserRoleEnum.STUDENT) {
        throw new ForbiddenException('Staff can only create student accounts');
      }
    }

    // Super Admin cannot create another Super Admin
    if (
      creatorRole === UserRoleEnum.SUPER_ADMIN &&
      targetRole === UserRoleEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Cannot create another Super Admin account');
    }

    // Validate password strength
    Password.createFromPlain(command.password);

    // Check if email already exists
    const emailExists = await this.userRepository.emailExists(command.email);
    if (emailExists) {
      throw new EmailAlreadyExistsError(command.email);
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(command.password);

    // Create user aggregate
    const user = User.create({
      email: command.email,
      passwordHash,
      fullName: command.fullName,
      role: targetRole,
    });

    // Save to repository
    await this.userRepository.save(user);

    // Publish domain events
    await this.eventBus.publishFromAggregate(user);

    return {
      userId: user.id.value,
      email: user.email.value,
      fullName: user.fullName,
      role: user.role.value,
    };
  }
}
