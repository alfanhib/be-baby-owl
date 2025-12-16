import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { ICourseRepository } from '@learning/domain/repositories/course.repository.interface';
import { Course } from '@learning/domain/aggregates/course.aggregate';
import { CourseId } from '@learning/domain/value-objects/course-id.vo';
import { CourseMapper } from './course.mapper';

@Injectable()
export class CourseRepository implements ICourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    sections: {
      orderBy: { orderIndex: 'asc' as const },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' as const },
          include: {
            exercises: {
              orderBy: { orderIndex: 'asc' as const },
            },
          },
        },
      },
    },
  };

  async findById(id: CourseId): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({
      where: { id: id.value },
      include: this.includeRelations,
    });

    if (!course) {
      return null;
    }

    return CourseMapper.toDomain(course);
  }

  async findBySlug(slug: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: this.includeRelations,
    });

    if (!course) {
      return null;
    }

    return CourseMapper.toDomain(course);
  }

  async save(course: Course): Promise<void> {
    const data = CourseMapper.toPersistence(course);

    await this.prisma.course.upsert({
      where: { id: data.id },
      create: {
        ...data,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
      update: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        coverImage: data.coverImage,
        category: data.category,
        level: data.level,
        language: data.language,
        estimatedDuration: data.estimatedDuration,
        status: data.status,
        publishedAt: data.publishedAt,
        updatedAt: new Date(),
      },
    });
  }

  async exists(id: CourseId): Promise<boolean> {
    const count = await this.prisma.course.count({
      where: { id: id.value },
    });
    return count > 0;
  }

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.course.count({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    return count > 0;
  }

  async delete(id: CourseId): Promise<void> {
    await this.prisma.course.delete({
      where: { id: id.value },
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    status?: string;
    category?: string;
    level?: string;
    createdById?: string;
    search?: string;
  }): Promise<{ courses: Course[]; total: number }> {
    const {
      skip = 0,
      take = 20,
      status,
      category,
      level,
      createdById,
      search,
    } = params;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = category;
    }
    if (level) {
      where.level = level;
    }
    if (createdById) {
      where.createdById = createdById;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: this.includeRelations,
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      courses: courses.map((c) => CourseMapper.toDomain(c)),
      total,
    };
  }

  async findPublished(params: {
    skip?: number;
    take?: number;
    category?: string;
    level?: string;
    search?: string;
  }): Promise<{ courses: Course[]; total: number }> {
    const { skip = 0, take = 20, category, level, search } = params;

    const where: Record<string, unknown> = {
      status: 'published',
    };

    if (category) {
      where.category = category;
    }
    if (level) {
      where.level = level;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take,
        orderBy: { publishedAt: 'desc' },
        include: this.includeRelations,
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      courses: courses.map((c) => CourseMapper.toDomain(c)),
      total,
    };
  }
}
