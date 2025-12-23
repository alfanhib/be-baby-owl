import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPackageInfoQuery } from './get-package-info.query';
import {
  IClassRepository,
  CLASS_REPOSITORY,
} from '../../../domain/repositories/class.repository.interface';
import { ClassId } from '../../../domain/value-objects/class-id.vo';

export interface PackageInfoResult {
  classId: string;
  className: string;
  classType: string;
  totalMeetings: number;
  lessonsUnlocked: number;
  meetingsRemaining: number;
  status: 'PLENTY' | 'LOW' | 'CRITICAL' | 'EXHAUSTED';
  canAddMeetings: boolean;
  canContinueAsPrivate: boolean;
  studentPackage?: {
    studentId: string;
    creditsRemaining: number;
    creditsUsed: number;
    totalCredits: number;
  };
}

@QueryHandler(GetPackageInfoQuery)
export class GetPackageInfoHandler implements IQueryHandler<
  GetPackageInfoQuery,
  PackageInfoResult
> {
  constructor(
    @Inject(CLASS_REPOSITORY)
    private readonly classRepository: IClassRepository,
  ) {}

  async execute(query: GetPackageInfoQuery): Promise<PackageInfoResult> {
    const { classId, studentId } = query;

    const classAggregate = await this.classRepository.findById(
      ClassId.create(classId),
    );
    if (!classAggregate) {
      throw new Error(`Class not found: ${classId}`);
    }

    const totalMeetings = classAggregate.totalMeetings;
    const lessonsUnlocked = classAggregate.lessonsUnlockedCount;
    const meetingsRemaining = totalMeetings - lessonsUnlocked;

    // Determine status based on remaining meetings
    let status: 'PLENTY' | 'LOW' | 'CRITICAL' | 'EXHAUSTED';
    if (meetingsRemaining <= 0) {
      status = 'EXHAUSTED';
    } else if (meetingsRemaining <= 2) {
      status = 'CRITICAL';
    } else if (meetingsRemaining <= 5) {
      status = 'LOW';
    } else {
      status = 'PLENTY';
    }

    const isPrivate = classAggregate.type.isPrivate();
    const isGroup = !isPrivate;

    const result: PackageInfoResult = {
      classId,
      className: classAggregate.name,
      classType: classAggregate.type.value,
      totalMeetings,
      lessonsUnlocked,
      meetingsRemaining,
      status,
      canAddMeetings: isPrivate, // Only private classes can add meetings
      canContinueAsPrivate:
        isGroup && (status === 'CRITICAL' || status === 'EXHAUSTED'),
    };

    // If studentId provided, get their specific package info
    if (studentId) {
      const enrollment = classAggregate.getEnrollmentByStudentId(studentId);
      if (enrollment) {
        result.studentPackage = {
          studentId,
          creditsRemaining: enrollment.credits.remaining,
          creditsUsed: enrollment.credits.used,
          totalCredits: enrollment.credits.total,
        };
      }
    }

    return result;
  }
}
