import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { SetupPasswordCommand } from './setup-password.command';
import { Password } from '@identity/domain/value-objects/password.vo';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';
import type { IPasswordHasher } from '@identity/domain/services/password-hasher.interface';
import { PASSWORD_HASHER } from '@identity/domain/services/password-hasher.interface';
import { EventBusService } from '@shared/infrastructure/event-bus/event-bus.service';

export interface SetupPasswordResult {
  success: boolean;
  message: string;
}

@CommandHandler(SetupPasswordCommand)
export class SetupPasswordHandler implements ICommandHandler<SetupPasswordCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(command: SetupPasswordCommand): Promise<SetupPasswordResult> {
    // Find user by invite token
    const user = await this.userRepository.findByInviteToken(
      command.inviteToken,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid or expired invite token');
    }

    // Validate invite token is not expired
    if (!user.isInviteTokenValid(command.inviteToken)) {
      throw new UnauthorizedException('Invite token has expired');
    }

    // Validate password strength
    Password.createFromPlain(command.newPassword);

    // Hash new password
    const passwordHash = await this.passwordHasher.hash(command.newPassword);

    // Change password and clear invite token
    user.changePassword(passwordHash);
    user.clearInviteToken();

    // Save user
    await this.userRepository.save(user);

    // Publish domain events
    await this.eventBus.publishFromAggregate(user);

    return {
      success: true,
      message: 'Password has been set successfully. You can now login.',
    };
  }
}
