import {
  Course as PrismaCourse,
  Section as PrismaSection,
  Lesson as PrismaLesson,
  Exercise as PrismaExercise,
} from '@prisma/client';
import { Course } from '@learning/domain/aggregates/course.aggregate';
import { Section } from '@learning/domain/entities/section.entity';
import { Lesson } from '@learning/domain/entities/lesson.entity';
import {
  Exercise,
  ExerciseContent,
} from '@learning/domain/entities/exercise.entity';

type PrismaCourseWithRelations = PrismaCourse & {
  sections?: (PrismaSection & {
    lessons?: (PrismaLesson & {
      exercises?: PrismaExercise[];
    })[];
  })[];
};

export class CourseMapper {
  static toDomain(raw: PrismaCourseWithRelations): Course {
    const sections = (raw.sections || []).map((s) =>
      CourseMapper.sectionToDomain(s),
    );

    return Course.restore({
      id: raw.id,
      title: raw.title,
      slug: raw.slug,
      description: raw.description,
      coverImage: raw.coverImage ?? undefined,
      category: raw.category ?? undefined,
      level: raw.level ?? undefined,
      language: raw.language,
      estimatedDuration: raw.estimatedDuration ?? undefined,
      status: raw.status,
      createdById: raw.createdById,
      publishedAt: raw.publishedAt ?? undefined,
      sections,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static sectionToDomain(
    raw: PrismaSection & {
      lessons?: (PrismaLesson & { exercises?: PrismaExercise[] })[];
    },
  ): Section {
    const lessons = (raw.lessons || []).map((l) =>
      CourseMapper.lessonToDomain(l),
    );

    return Section.restore({
      id: raw.id,
      courseId: raw.courseId,
      title: raw.title,
      description: raw.description ?? undefined,
      orderIndex: raw.orderIndex,
      lessons,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static lessonToDomain(
    raw: PrismaLesson & { exercises?: PrismaExercise[] },
  ): Lesson {
    const exercises = (raw.exercises || []).map((e) =>
      CourseMapper.exerciseToDomain(e),
    );

    return Lesson.restore({
      id: raw.id,
      sectionId: raw.sectionId,
      title: raw.title,
      description: raw.description ?? undefined,
      orderIndex: raw.orderIndex,
      estimatedDuration: raw.estimatedDuration ?? undefined,
      status: raw.status,
      exercises,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static exerciseToDomain(raw: PrismaExercise): Exercise {
    return Exercise.restore({
      id: raw.id,
      lessonId: raw.lessonId,
      title: raw.title,
      type: raw.type,
      content: raw.content as unknown as ExerciseContent,
      orderIndex: raw.orderIndex,
      estimatedDuration: raw.estimatedDuration ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(
    course: Course,
  ): Omit<PrismaCourse, 'createdAt' | 'updatedAt'> {
    return {
      id: course.id.value,
      title: course.title,
      code: null,
      slug: course.slug.value,
      description: course.description,
      coverImage: course.coverImage ?? null,
      category: course.category ?? null,
      level: course.level?.value ?? null,
      language: course.language,
      estimatedDuration: course.estimatedDuration ?? null,
      status: course.status.value as PrismaCourse['status'],
      createdById: course.createdById,
      publishedAt: course.publishedAt ?? null,
    };
  }
}
