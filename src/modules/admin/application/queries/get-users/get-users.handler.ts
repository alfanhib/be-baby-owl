import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { GetUsersQuery } from './get-users.query';
import { Prisma } from '@prisma/client';

export interface UserListDto {
  id: string;
  email: string;
  username: string | null;
  fullName: string;
  avatar: string | null;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface PaginatedUsers {
  data: UserListDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetUsersQuery): Promise<PaginatedUsers> {
    const { search, role, status, page, limit } = query;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role as 'student' | 'instructor' | 'staff' | 'super_admin';
    }

    if (status) {
      where.status = status as 'active' | 'inactive' | 'suspended';
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          fullName: true,
          avatar: true,
          role: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          lastLoginAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
