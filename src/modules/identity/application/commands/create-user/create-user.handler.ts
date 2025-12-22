import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
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
  inviteUrl: string;
  inviteTokenExpiry: Date;
}

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly eventBus: EventBusService,
    private readonly configService: ConfigService,
  ) {}

  private generateInviteToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

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

    // Check if username already exists (if provided)
    if (command.username) {
      const usernameExists = await this.userRepository.usernameExists(
        command.username,
      );
      if (usernameExists) {
        throw new ConflictException('Username already exists');
      }
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(command.password);

    // Generate invite token for first-time login
    const inviteToken = this.generateInviteToken();
    const inviteTokenExpiry = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    // Create user aggregate - admin-created users must change password on first login
    const user = User.create({
      email: command.email,
      username: command.username,
      passwordHash,
      fullName: command.fullName,
      role: targetRole,
      mustChangePassword: true, // User must change password on first login
      inviteToken,
      inviteTokenExpiry,
    });

    // Save to repository
    await this.userRepository.save(user);

    // Publish domain events
    await this.eventBus.publishFromAggregate(user);

    // Generate invite URL
    const frontendUrl = this.configService.get<string>(
      'app.frontendUrl',
      'http://localhost:3000',
    );
    const inviteUrl = `${frontendUrl}/auth/setup-password?token=${inviteToken}`;

    return {
      userId: user.id.value,
      email: user.email.value,
      fullName: user.fullName,
      role: user.role.value,
      inviteUrl,
      inviteTokenExpiry,
    };
  }
}
