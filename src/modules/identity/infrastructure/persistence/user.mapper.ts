import { User as PrismaUser } from '@prisma/client';
import { User } from '@identity/domain/aggregates/user.aggregate';

export class UserMapper {
  /**
   * Map Prisma model to Domain entity
   */
  static toDomain(raw: PrismaUser): User {
    return User.restore({
      id: raw.id,
      email: raw.email,
      username: raw.username ?? undefined,
      passwordHash: raw.passwordHash ?? '',
      fullName: raw.fullName,
      avatar: raw.avatar ?? undefined,
      bio: raw.bio ?? undefined,
      role: raw.role,
      status: raw.status,
      emailVerified: raw.emailVerified,
      onboardingCompleted: raw.onboardingCompleted,
      mustChangePassword: raw.mustChangePassword,
      inviteToken: raw.inviteToken ?? undefined,
      inviteTokenExpiry: raw.inviteTokenExpiry ?? undefined,
      lastLoginAt: raw.lastLoginAt ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  /**
   * Map Domain entity to Prisma model (for persistence)
   */
  static toPersistence(
    user: User,
  ): Omit<PrismaUser, 'createdAt' | 'updatedAt'> {
    return {
      id: user.id.value,
      email: user.email.value,
      username: user.username ?? null,
      passwordHash: user.passwordHash.value,
      fullName: user.fullName,
      avatar: user.avatar ?? null,
      bio: user.bio ?? null,
      role: user.role.value as PrismaUser['role'],
      status: user.status.value as PrismaUser['status'],
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
      mustChangePassword: user.mustChangePassword,
      inviteToken: user.inviteToken ?? null,
      inviteTokenExpiry: user.inviteTokenExpiry ?? null,
      lastLoginAt: user.lastLoginAt ?? null,
    };
  }

  /**
   * Map Domain entity to update data (partial)
   */
  static toUpdateData(user: User): Partial<PrismaUser> {
    return {
      email: user.email.value,
      username: user.username ?? null,
      passwordHash: user.passwordHash.value,
      fullName: user.fullName,
      avatar: user.avatar ?? null,
      bio: user.bio ?? null,
      role: user.role.value as PrismaUser['role'],
      status: user.status.value as PrismaUser['status'],
      emailVerified: user.emailVerified,
      onboardingCompleted: user.onboardingCompleted,
      mustChangePassword: user.mustChangePassword,
      inviteToken: user.inviteToken ?? null,
      inviteTokenExpiry: user.inviteTokenExpiry ?? null,
      lastLoginAt: user.lastLoginAt ?? null,
    };
  }
}
