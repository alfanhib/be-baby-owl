import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { RegenerateInviteCommand } from './regenerate-invite.command';
import { UserId } from '@identity/domain/value-objects/user-id.vo';
import type { IUserRepository } from '@identity/domain/repositories/user.repository.interface';
import { USER_REPOSITORY } from '@identity/domain/repositories/user.repository.interface';

export interface RegenerateInviteResult {
  userId: string;
  email: string;
  inviteUrl: string;
  inviteTokenExpiry: Date;
}

@CommandHandler(RegenerateInviteCommand)
export class RegenerateInviteHandler
  implements ICommandHandler<RegenerateInviteCommand>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly configService: ConfigService,
  ) {}

  private generateInviteToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async execute(command: RegenerateInviteCommand): Promise<RegenerateInviteResult> {
    const userId = UserId.create(command.userId);
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only allow regenerating invite for users who still need to change password
    if (!user.mustChangePassword) {
      throw new BadRequestException(
        'User has already set their password. Cannot regenerate invite.',
      );
    }

    // Generate new invite token
    const inviteToken = this.generateInviteToken();
    user.setInviteToken(inviteToken, 72); // 72 hours expiry

    await this.userRepository.save(user);

    // Generate invite URL
    const frontendUrl = this.configService.get<string>(
      'app.frontendUrl',
      'http://localhost:3000',
    );
    const inviteUrl = `${frontendUrl}/auth/setup-password?token=${inviteToken}`;

    return {
      userId: user.id.value,
      email: user.email.value,
      inviteUrl,
      inviteTokenExpiry: user.inviteTokenExpiry!,
    };
  }
}

