import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAvailableClassesQuery } from './get-available-classes.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ClassStatus, ClassType } from '@prisma/client';

interface ClassPackage {
  meetings: number;
  price: number;
  priceFormatted: string;
}

interface AvailableClass {
  id: string;
  name: string;
  course: {
    id: string;
    title: string;
  };
  instructor: {
    id: string;
    name: string;
  };
  type: string;
  capacity: {
    current: number;
    max: number;
  };
  canEnroll: boolean;
  packages: ClassPackage[];
}

@QueryHandler(GetAvailableClassesQuery)
export class GetAvailableClassesHandler implements IQueryHandler<GetAvailableClassesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAvailableClassesQuery): Promise<AvailableClass[]> {
    const where: Record<string, unknown> = {
      status: {
        in: [ClassStatus.enrollment_open, ClassStatus.active],
      },
    };

    if (query.courseId) {
      where.courseId = query.courseId;
    }

    if (query.type) {
      where.type = query.type === 'group' ? ClassType.group : ClassType.private;
    }

    const classes = await this.prisma.class.findMany({
      where,
      include: {
        course: {
          select: { id: true, title: true },
        },
        instructor: {
          select: { id: true, fullName: true },
        },
      },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
    });

    return classes.map((classEntity) => {
      const canEnroll =
        classEntity.currentCapacity < classEntity.maxCapacity ||
        classEntity.type === ClassType.private;

      // Generate package options based on total meetings
      const packages = this.generatePackages(classEntity.totalMeetings);

      return {
        id: classEntity.id,
        name: classEntity.name,
        course: {
          id: classEntity.course.id,
          title: classEntity.course.title,
        },
        instructor: {
          id: classEntity.instructor.id,
          name: classEntity.instructor.fullName,
        },
        type: classEntity.type,
        capacity: {
          current: classEntity.currentCapacity,
          max: classEntity.maxCapacity,
        },
        canEnroll,
        packages,
      };
    });
  }

  private generatePackages(totalMeetings: number): ClassPackage[] {
    // Standard pricing per meeting: Rp 150,000
    const pricePerMeeting = 150000;

    // Generate standard package options
    const packageOptions = [10, 15, 20, 30, 50].filter(
      (m) => m <= totalMeetings * 2, // Allow up to 2x the class total
    );

    // Always include the class total meetings as an option
    if (!packageOptions.includes(totalMeetings)) {
      packageOptions.push(totalMeetings);
      packageOptions.sort((a, b) => a - b);
    }

    return packageOptions.map((meetings) => ({
      meetings,
      price: meetings * pricePerMeeting,
      priceFormatted: `Rp ${(meetings * pricePerMeeting).toLocaleString('id-ID')}`,
    }));
  }
}
