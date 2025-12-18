import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchStudentsQuery } from './search-students.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

interface StudentSearchResult {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
}

@QueryHandler(SearchStudentsQuery)
export class SearchStudentsHandler implements IQueryHandler<SearchStudentsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: SearchStudentsQuery): Promise<StudentSearchResult[]> {
    const { searchTerm } = query;

    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const students = await this.prisma.user.findMany({
      where: {
        role: 'student',
        status: 'active',
        OR: [
          { fullName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatar: true,
      },
      take: 10,
      orderBy: { fullName: 'asc' },
    });

    return students.map((student) => ({
      id: student.id,
      name: student.fullName,
      email: student.email,
      avatar: student.avatar,
    }));
  }
}
