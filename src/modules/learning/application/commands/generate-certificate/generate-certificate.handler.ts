import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GenerateCertificateCommand } from './generate-certificate.command';
import {
  ICourseRepository,
  COURSE_REPOSITORY,
} from '@learning/domain/repositories/course.repository.interface';
import {
  IProgressRepository,
  PROGRESS_REPOSITORY,
} from '@learning/domain/repositories/progress.repository.interface';
import { CourseId } from '@learning/domain/value-objects/course-id.vo';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service';

export interface CertificateResult {
  certificateId: string;
  certificateCode: string;
  studentName: string;
  courseTitle: string;
  completedAt: Date;
  issuedAt: Date;
}

@CommandHandler(GenerateCertificateCommand)
export class GenerateCertificateHandler implements ICommandHandler<GenerateCertificateCommand> {
  constructor(
    @Inject(COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @Inject(PROGRESS_REPOSITORY)
    private readonly progressRepository: IProgressRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    command: GenerateCertificateCommand,
  ): Promise<CertificateResult> {
    const { userId, courseId } = command;

    // Check if certificate already exists
    const existingCert = await this.prisma.certificate.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existingCert) {
      return {
        certificateId: existingCert.id,
        certificateCode: existingCert.certificateCode,
        studentName: existingCert.studentName,
        courseTitle: existingCert.courseTitle,
        completedAt: existingCert.completedAt,
        issuedAt: existingCert.issuedAt,
      };
    }

    // Get course details
    const course = await this.courseRepository.findById(
      CourseId.create(courseId),
    );
    if (!course) {
      throw new Error('Course not found');
    }

    // Check course completion
    const progress = await this.progressRepository.findByUserAndCourse(
      userId,
      courseId,
    );

    // Calculate total lessons and completed lessons
    let totalLessons = 0;
    let completedLessons = 0;

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        totalLessons++;
        const lessonProg = progress?.getLessonProgress(lesson.id.value);
        if (lessonProg?.completed) {
          completedLessons++;
        }
      }
    }

    const progressPercentage =
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

    if (progressPercentage < 100) {
      throw new Error(
        `Course not completed. Current progress: ${progressPercentage}%`,
      );
    }

    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Generate certificate code
    const certificateCode = this.generateCertificateCode();

    // Find completion date from the last completed lesson
    let completedAt = new Date();
    if (progress) {
      for (const section of course.sections) {
        for (const lesson of section.lessons) {
          const lessonProg = progress.getLessonProgress(lesson.id.value);
          if (lessonProg?.completedAt && lessonProg.completedAt > completedAt) {
            completedAt = lessonProg.completedAt;
          }
        }
      }
    }

    // Create certificate record
    const certificate = await this.prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateCode,
        studentName: user.fullName,
        courseTitle: course.title,
        completedAt,
      },
    });

    return {
      certificateId: certificate.id,
      certificateCode: certificate.certificateCode,
      studentName: certificate.studentName,
      courseTitle: certificate.courseTitle,
      completedAt: certificate.completedAt,
      issuedAt: certificate.issuedAt,
    };
  }

  private generateCertificateCode(): string {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${year}-${random}`;
  }
}
