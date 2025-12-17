import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStudentCoursesQuery } from './get-student-courses.query';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface StudentCourseItem {
  courseId: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string | null;
  level: string | null;
  totalLessons: number;
  completedLessons: number;
  totalExercises: number;
  completedExercises: number;
  progressPercentage: number;
  lastAccessedAt: Date | null;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface StudentCoursesResult {
  courses: StudentCourseItem[];
  totalCourses: number;
  inProgress: number;
  completed: number;
}

@QueryHandler(GetStudentCoursesQuery)
export class GetStudentCoursesHandler implements IQueryHandler<GetStudentCoursesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetStudentCoursesQuery): Promise<StudentCoursesResult> {
    const { userId } = query;

    // Get all courses that have progress for this user
    const coursesWithProgress = await this.prisma.course.findMany({
      where: {
        status: 'published',
        sections: {
          some: {
            lessons: {
              some: {
                OR: [
                  { lessonProgress: { some: { userId } } },
                  {
                    exercises: {
                      some: { exerciseProgress: { some: { userId } } },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      include: {
        sections: {
          include: {
            lessons: {
              include: {
                lessonProgress: {
                  where: { userId },
                },
                exercises: {
                  include: {
                    exerciseProgress: {
                      where: { userId },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const courses: StudentCourseItem[] = [];
    let inProgressCount = 0;
    let completedCount = 0;

    for (const course of coursesWithProgress) {
      let totalLessons = 0;
      let completedLessons = 0;
      let totalExercises = 0;
      let completedExercises = 0;
      let lastAccessedAt: Date | null = null;

      for (const section of course.sections) {
        for (const lesson of section.lessons) {
          totalLessons++;

          const lessonProg = lesson.lessonProgress[0];
          if (lessonProg?.completed) {
            completedLessons++;
          }

          // Track last accessed
          if (lessonProg?.updatedAt) {
            if (!lastAccessedAt || lessonProg.updatedAt > lastAccessedAt) {
              lastAccessedAt = lessonProg.updatedAt;
            }
          }

          for (const exercise of lesson.exercises) {
            totalExercises++;
            const exerciseProg = exercise.exerciseProgress[0];
            if (exerciseProg?.completed) {
              completedExercises++;
            }

            // Track last accessed
            if (exerciseProg?.updatedAt) {
              if (!lastAccessedAt || exerciseProg.updatedAt > lastAccessedAt) {
                lastAccessedAt = exerciseProg.updatedAt;
              }
            }
          }
        }
      }

      const progressPercentage =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      let status: 'not_started' | 'in_progress' | 'completed';
      if (progressPercentage === 0) {
        status = 'not_started';
      } else if (progressPercentage === 100) {
        status = 'completed';
        completedCount++;
      } else {
        status = 'in_progress';
        inProgressCount++;
      }

      courses.push({
        courseId: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description ?? '',
        thumbnailUrl: course.coverImage,
        level: course.level,
        totalLessons,
        completedLessons,
        totalExercises,
        completedExercises,
        progressPercentage,
        lastAccessedAt,
        status,
      });
    }

    // Sort by last accessed
    courses.sort((a, b) => {
      if (!a.lastAccessedAt && !b.lastAccessedAt) return 0;
      if (!a.lastAccessedAt) return 1;
      if (!b.lastAccessedAt) return -1;
      return b.lastAccessedAt.getTime() - a.lastAccessedAt.getTime();
    });

    return {
      courses,
      totalCourses: courses.length,
      inProgress: inProgressCount,
      completed: completedCount,
    };
  }
}
