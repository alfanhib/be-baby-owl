import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ForbiddenException } from '@nestjs/common';
import { DeactivateUserCommand } from './deactivate-user.command';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import { UserNotFoundError } from '@identity/domain/errors/user-not-found.error';
import { UserId } from '@identity/domain/value-objects/user-id.vo';
import { UserRoleEnum } from '@identity/domain/value-objects/user-role.vo';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

export interface DeactivateUserResult {
  userId: string;
  email: string;
  status: string;
  action: string;
}

@CommandHandler(DeactivateUserCommand)
export class DeactivateUserHandler implements ICommandHandler<DeactivateUserCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: DeactivateUserCommand): Promise<DeactivateUserResult> {
    // Verify actor has permission
    const actorId = UserId.create(command.deactivatedBy);
    const actor = await this.userRepository.findById(actorId);
    if (!actor) {
      throw new ForbiddenException('Actor user not found');
    }

    // Only Super Admin can deactivate/suspend/reactivate users
    if (actor.role.value !== UserRoleEnum.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only Super Admin can manage user account status',
      );
    }

    // Find target user
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(command.userId);
    }

    // Cannot deactivate another Super Admin
    if (user.role.value === UserRoleEnum.SUPER_ADMIN) {
      throw new ForbiddenException('Cannot modify Super Admin account status');
    }

    // Perform action
    switch (command.action) {
      case 'deactivate':
        user.deactivate(command.reason);
        break;
      case 'suspend':
        user.suspend();
        break;
      case 'reactivate':
        user.reactivate();
        break;
    }

    // Save changes
    await this.userRepository.save(user);

    // Publish domain events
    await this.eventBus.publishFromAggregate(user);

    return {
      userId: user.id.value,
      email: user.email.value,
      status: user.status.value,
      action: command.action,
    };
  }
}
