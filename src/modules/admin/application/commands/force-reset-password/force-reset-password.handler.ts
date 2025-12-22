import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { ForceResetPasswordCommand } from './force-reset-password.command';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import {
  IPasswordHasher,
  PASSWORD_HASHER,
} from '@identity/domain/services/password-hasher.interface';
import * as crypto from 'crypto';

@CommandHandler(ForceResetPasswordCommand)
export class ForceResetPasswordHandler
  implements ICommandHandler<ForceResetPasswordCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(
    command: ForceResetPasswordCommand,
  ): Promise<{ success: boolean; message: string; temporaryPassword?: string }> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { id: command.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let newPassword = command.newPassword;
    let temporaryPassword: string | undefined;

    // Generate temporary password if not provided
    if (!newPassword) {
      temporaryPassword = this.generateTemporaryPassword();
      newPassword = temporaryPassword;
    }

    // Hash and update password
    const passwordHash = await this.passwordHasher.hash(newPassword);

    await this.prisma.user.update({
      where: { id: command.userId },
      data: {
        passwordHash,
        mustChangePassword: true, // Force password change on next login
      },
    });

    return {
      success: true,
      message: temporaryPassword
        ? 'Password reset with temporary password'
        : 'Password updated successfully',
      temporaryPassword,
    };
  }

  private generateTemporaryPassword(): string {
    const chars =
      'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(crypto.randomInt(chars.length));
    }
    return password;
  }
}

