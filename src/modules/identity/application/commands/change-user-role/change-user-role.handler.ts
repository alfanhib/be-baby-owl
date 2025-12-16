import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException } from '@nestjs/common';
import { ChangeUserRoleCommand } from './change-user-role.command';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import { UserNotFoundError } from '@identity/domain/errors/user-not-found.error';
import { UserId } from '@identity/domain/value-objects/user-id.vo';
import { UserRoleEnum } from '@identity/domain/value-objects/user-role.vo';

export interface ChangeUserRoleResult {
  userId: string;
  email: string;
  previousRole: string;
  newRole: string;
}

@CommandHandler(ChangeUserRoleCommand)
export class ChangeUserRoleHandler implements ICommandHandler<ChangeUserRoleCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: ChangeUserRoleCommand): Promise<ChangeUserRoleResult> {
    // Verify actor has permission
    const actorId = UserId.create(command.changedBy);
    const actor = await this.userRepository.findById(actorId);
    if (!actor) {
      throw new ForbiddenException('Actor user not found');
    }

    // Only Super Admin can change user roles
    if (actor.role.value !== UserRoleEnum.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admin can change user roles');
    }

    // Validate new role
    const validRoles = Object.values(UserRoleEnum) as string[];
    if (!validRoles.includes(command.newRole)) {
      throw new ForbiddenException(`Invalid role: ${command.newRole}`);
    }

    const newRole = command.newRole as UserRoleEnum;

    // Cannot assign Super Admin role
    if (newRole === UserRoleEnum.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot assign Super Admin role');
    }

    // Find target user
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(command.userId);
    }

    // Cannot change Super Admin's role
    if (user.role.value === UserRoleEnum.SUPER_ADMIN) {
      throw new ForbiddenException("Cannot change Super Admin's role");
    }

    const previousRole = user.role.value;

    // Change role
    user.changeRole(newRole);

    // Save changes
    await this.userRepository.save(user);

    return {
      userId: user.id.value,
      email: user.email.value,
      previousRole,
      newRole: user.role.value,
    };
  }
}
