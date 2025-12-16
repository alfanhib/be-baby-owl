import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException } from '@nestjs/common';
import { UpdateUserCommand } from './update-user.command';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import { UserNotFoundError } from '@identity/domain/errors/user-not-found.error';
import { UserId } from '@identity/domain/value-objects/user-id.vo';
import { UserRoleEnum } from '@identity/domain/value-objects/user-role.vo';

export interface UpdateUserResult {
  userId: string;
  email: string;
  fullName: string;
  role: string;
}

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<UpdateUserResult> {
    // Verify updater has permission
    const updaterId = UserId.create(command.updatedBy);
    const updater = await this.userRepository.findById(updaterId);
    if (!updater) {
      throw new ForbiddenException('Updater user not found');
    }

    // Only Super Admin can update other users
    if (updater.role.value !== UserRoleEnum.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only Super Admin can update other user accounts',
      );
    }

    // Find target user
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(command.userId);
    }

    // Cannot update another Super Admin
    if (user.role.value === UserRoleEnum.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot update Super Admin account');
    }

    // Update profile
    user.updateProfile({
      fullName: command.fullName,
      avatar: command.avatar,
      bio: command.bio,
    });

    // Save changes
    await this.userRepository.save(user);

    return {
      userId: user.id.value,
      email: user.email.value,
      fullName: user.fullName,
      role: user.role.value,
    };
  }
}
