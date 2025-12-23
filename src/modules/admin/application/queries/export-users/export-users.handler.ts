import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ExportUsersQuery } from './export-users.query';
import { Prisma } from '@prisma/client';

@QueryHandler(ExportUsersQuery)
export class ExportUsersHandler implements IQueryHandler<ExportUsersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ExportUsersQuery): Promise<string> {
    const { role, status } = query;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role as 'student' | 'instructor' | 'staff' | 'super_admin';
    }

    if (status) {
      where.status = status as 'active' | 'inactive' | 'suspended';
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        role: true,
        status: true,
        emailVerified: true,
        onboardingCompleted: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (users.length === 0) {
      return '';
    }

    // Simple CSV generation
    const headers = [
      'ID',
      'Email',
      'Username',
      'Full Name',
      'Role',
      'Status',
      'Email Verified',
      'Onboarding Completed',
      'Enrollments',
      'Created At',
      'Last Login',
    ];

    const rows = users.map((u) => [
      this.escapeCsv(u.id),
      this.escapeCsv(u.email),
      this.escapeCsv(u.username || ''),
      this.escapeCsv(u.fullName),
      this.escapeCsv(u.role),
      this.escapeCsv(u.status),
      u.emailVerified ? 'Yes' : 'No',
      u.onboardingCompleted ? 'Yes' : 'No',
      u._count.enrollments.toString(),
      u.createdAt.toISOString(),
      u.lastLoginAt?.toISOString() || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    return csvContent;
  }

  private escapeCsv(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
}
