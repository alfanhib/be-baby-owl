import { Entity } from '@shared/domain/entity.base';
import { EnrollmentId } from '../value-objects/enrollment-id.vo';
import {
  EnrollmentStatus,
  EnrollmentStatusEnum,
} from '../value-objects/enrollment-status.vo';
import { MeetingCredit } from '../value-objects/meeting-credit.vo';

interface EnrollmentProps {
  classId: string;
  studentId: string;
  status: EnrollmentStatus;
  credits: MeetingCredit;
  enrolledAt: Date;
  completedAt?: Date;
  notes?: string;
}

export class Enrollment extends Entity<EnrollmentId> {
  private _classId: string;
  private _studentId: string;
  private _status: EnrollmentStatus;
  private _credits: MeetingCredit;
  private _enrolledAt: Date;
  private _completedAt?: Date;
  private _notes?: string;

  private constructor(id: EnrollmentId, props: EnrollmentProps) {
    super(id);
    this._classId = props.classId;
    this._studentId = props.studentId;
    this._status = props.status;
    this._credits = props.credits;
    this._enrolledAt = props.enrolledAt;
    this._completedAt = props.completedAt;
    this._notes = props.notes;
  }

  // Getters
  get classId(): string {
    return this._classId;
  }

  get studentId(): string {
    return this._studentId;
  }

  get status(): EnrollmentStatus {
    return this._status;
  }

  get credits(): MeetingCredit {
    return this._credits;
  }

  get enrolledAt(): Date {
    return this._enrolledAt;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  // Factory methods
  static create(
    classId: string,
    studentId: string,
    totalMeetings: number,
    notes?: string,
  ): Enrollment {
    return new Enrollment(EnrollmentId.create(), {
      classId,
      studentId,
      status: EnrollmentStatus.active(),
      credits: MeetingCredit.create(totalMeetings, 0),
      enrolledAt: new Date(),
      notes,
    });
  }

  static restore(
    id: string,
    props: {
      classId: string;
      studentId: string;
      status: string;
      totalCredits: number;
      usedCredits: number;
      enrolledAt: Date;
      completedAt?: Date;
      notes?: string;
    },
  ): Enrollment {
    return new Enrollment(EnrollmentId.create(id), {
      classId: props.classId,
      studentId: props.studentId,
      status: EnrollmentStatus.create(props.status),
      credits: MeetingCredit.create(props.totalCredits, props.usedCredits),
      enrolledAt: props.enrolledAt,
      completedAt: props.completedAt,
      notes: props.notes,
    });
  }

  // Business methods
  useCredit(): void {
    if (!this._credits.hasCredits()) {
      throw new Error('No credits remaining');
    }
    this._credits = this._credits.useCredit();
  }

  addCredits(amount: number): void {
    this._credits = this._credits.addCredits(amount);
  }

  adjustCredits(amount: number): void {
    this._credits = this._credits.adjustCredits(amount);
  }

  complete(): void {
    if (this._status.value !== EnrollmentStatusEnum.ACTIVE) {
      throw new Error('Only active enrollments can be completed');
    }
    this._status = EnrollmentStatus.completed();
    this._completedAt = new Date();
  }

  withdraw(): void {
    if (this._status.value !== EnrollmentStatusEnum.ACTIVE) {
      throw new Error('Only active enrollments can be withdrawn');
    }
    this._status = EnrollmentStatus.withdrawn();
  }

  updateNotes(notes: string): void {
    this._notes = notes;
  }

  isActive(): boolean {
    return this._status.isActive();
  }

  hasCreditsRemaining(): boolean {
    return this._credits.hasCredits();
  }

  isCreditsLow(): boolean {
    return this._credits.isLow();
  }
}
