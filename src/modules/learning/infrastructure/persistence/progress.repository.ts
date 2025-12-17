import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';
import { IProgressRepository } from '@learning/domain/repositories/progress.repository.interface';
import { StudentProgress } from '@learning/domain/aggregates/student-progress.aggregate';
import { ProgressMapper } from './progress.mapper';

@Injectable()
export class ProgressRepository implements IProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<StudentProgress | null> {
    // Get all lesson IDs for the course
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        sections: {
          include: {
            lessons: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!course) {
      return null;
    }

    const lessonIds = course.sections.flatMap((s) =>
      s.lessons.map((l) => l.id),
    );

    // Get lesson progress for this user
    const lessonProgressList = await this.prisma.lessonProgress.findMany({
      where: {
        userId,
        lessonId: { in: lessonIds },
      },
    });

    // Get exercise progress for this user
    const exerciseProgressList = await this.prisma.exerciseProgress.findMany({
      where: {
        userId,
        exercise: {
          lesson: {
            section: {
              courseId,
            },
          },
        },
      },
    });

    if (lessonProgressList.length === 0 && exerciseProgressList.length === 0) {
      return null;
    }

    // Generate a virtual progress ID (composite of user + course)
    const progressId = `${userId}_${courseId}`;

    return ProgressMapper.toDomain(
      progressId,
      userId,
      courseId,
      lessonProgressList,
      exerciseProgressList,
    );
  }

  async save(progress: StudentProgress): Promise<void> {
    // userId and courseId used for context but not directly in save logic

    // Save lesson progress
    for (const lessonProgress of progress.lessonProgressList) {
      const data = ProgressMapper.lessonProgressToPersistence(lessonProgress);

      await this.prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: data.userId,
            lessonId: data.lessonId,
          },
        },
        create: {
          id: data.id,
          userId: data.userId,
          lessonId: data.lessonId,
          completed: data.completed,
          exercisesCompleted: data.exercisesCompleted,
          totalExercises: data.totalExercises,
          completedAt: data.completedAt,
        },
        update: {
          completed: data.completed,
          exercisesCompleted: data.exercisesCompleted,
          totalExercises: data.totalExercises,
          completedAt: data.completedAt,
        },
      });
    }

    // Save exercise progress
    for (const exerciseProgress of progress.exerciseProgressList) {
      const data =
        ProgressMapper.exerciseProgressToPersistence(exerciseProgress);

      await this.prisma.exerciseProgress.upsert({
        where: {
          userId_exerciseId: {
            userId: data.userId,
            exerciseId: data.exerciseId,
          },
        },
        create: {
          id: data.id,
          userId: data.userId,
          exerciseId: data.exerciseId,
          completed: data.completed,
          watchedSeconds: data.watchedSeconds,
          scrollDepth: data.scrollDepth,
          completedAt: data.completedAt,
        },
        update: {
          completed: data.completed,
          watchedSeconds: data.watchedSeconds,
          scrollDepth: data.scrollDepth,
          completedAt: data.completedAt,
        },
      });
    }
  }

  async findByUser(userId: string): Promise<StudentProgress[]> {
    // Get all courses the user has progress in
    const lessonProgress = await this.prisma.lessonProgress.findMany({
      where: { userId },
      include: {
        lesson: {
          include: {
            section: {
              select: { courseId: true },
            },
          },
        },
      },
    });

    // Group by courseId
    const courseIds = [
      ...new Set(lessonProgress.map((lp) => lp.lesson.section.courseId)),
    ];

    const progressList: StudentProgress[] = [];

    for (const courseId of courseIds) {
      const progress = await this.findByUserAndCourse(userId, courseId);
      if (progress) {
        progressList.push(progress);
      }
    }

    return progressList;
  }

  async findByCourse(courseId: string): Promise<StudentProgress[]> {
    // Get all users who have progress in this course
    const lessonProgress = await this.prisma.lessonProgress.findMany({
      where: {
        lesson: {
          section: {
            courseId,
          },
        },
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    const userIds = lessonProgress.map((lp) => lp.userId);

    const progressList: StudentProgress[] = [];

    for (const userId of userIds) {
      const progress = await this.findByUserAndCourse(userId, courseId);
      if (progress) {
        progressList.push(progress);
      }
    }

    return progressList;
  }

  async delete(userId: string, courseId: string): Promise<void> {
    // Delete exercise progress
    await this.prisma.exerciseProgress.deleteMany({
      where: {
        userId,
        exercise: {
          lesson: {
            section: {
              courseId,
            },
          },
        },
      },
    });

    // Delete lesson progress
    await this.prisma.lessonProgress.deleteMany({
      where: {
        userId,
        lesson: {
          section: {
            courseId,
          },
        },
      },
    });
  }

  async hasStartedCourse(userId: string, courseId: string): Promise<boolean> {
    const count = await this.prisma.lessonProgress.count({
      where: {
        userId,
        lesson: {
          section: {
            courseId,
          },
        },
      },
    });

    return count > 0;
  }

  async getCourseStats(courseId: string): Promise<{
    totalStudents: number;
    completedStudents: number;
    averageProgress: number;
  }> {
    // Get total lessons in course
    const totalLessons = await this.prisma.lesson.count({
      where: {
        section: {
          courseId,
        },
      },
    });

    // Get all students with progress
    const studentsWithProgress = await this.prisma.lessonProgress.findMany({
      where: {
        lesson: {
          section: {
            courseId,
          },
        },
      },
      select: {
        userId: true,
        completed: true,
      },
    });

    // Group by userId
    const studentProgress = new Map<
      string,
      { completed: number; total: number }
    >();

    for (const progress of studentsWithProgress) {
      const existing = studentProgress.get(progress.userId) || {
        completed: 0,
        total: 0,
      };
      existing.total += 1;
      if (progress.completed) {
        existing.completed += 1;
      }
      studentProgress.set(progress.userId, existing);
    }

    const totalStudents = studentProgress.size;

    let completedStudents = 0;
    let totalProgressPercent = 0;

    for (const [, { completed }] of studentProgress) {
      const progressPercent =
        totalLessons > 0 ? (completed / totalLessons) * 100 : 0;
      totalProgressPercent += progressPercent;

      if (completed >= totalLessons && totalLessons > 0) {
        completedStudents += 1;
      }
    }

    const averageProgress =
      totalStudents > 0 ? Math.round(totalProgressPercent / totalStudents) : 0;

    return {
      totalStudents,
      completedStudents,
      averageProgress,
    };
  }
}
