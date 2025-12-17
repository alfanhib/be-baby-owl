import { Entity } from '@shared/domain/entity.base';
import { AttendanceId } from '../value-objects/enrollment-id.vo';
import { AttendanceStatus } from '../value-objects/attendance-status.vo';

interface AttendanceProps {
  enrollmentId: string;
  classId: string;
  meetingNumber: number;
  meetingDate: Date;
  status: AttendanceStatus;
  creditConsumed: boolean;
  markedBy: string;
  markedAt: Date;
  lastEditedBy?: string;
  lastEditedAt?: Date;
  notes?: string;
}

export class Attendance extends Entity<AttendanceId> {
  private _enrollmentId: string;
  private _classId: string;
  private _meetingNumber: number;
  private _meetingDate: Date;
  private _status: AttendanceStatus;
  private _creditConsumed: boolean;
  private _markedBy: string;
  private _markedAt: Date;
  private _lastEditedBy?: string;
  private _lastEditedAt?: Date;
  private _notes?: string;

  private constructor(id: AttendanceId, props: AttendanceProps) {
    super(id);
    this._enrollmentId = props.enrollmentId;
    this._classId = props.classId;
    this._meetingNumber = props.meetingNumber;
    this._meetingDate = props.meetingDate;
    this._status = props.status;
    this._creditConsumed = props.creditConsumed;
    this._markedBy = props.markedBy;
    this._markedAt = props.markedAt;
    this._lastEditedBy = props.lastEditedBy;
    this._lastEditedAt = props.lastEditedAt;
    this._notes = props.notes;
  }

  // Getters
  get enrollmentId(): string {
    return this._enrollmentId;
  }

  get classId(): string {
    return this._classId;
  }

  get meetingNumber(): number {
    return this._meetingNumber;
  }

  get meetingDate(): Date {
    return this._meetingDate;
  }

  get status(): AttendanceStatus {
    return this._status;
  }

  get creditConsumed(): boolean {
    return this._creditConsumed;
  }

  get markedBy(): string {
    return this._markedBy;
  }

  get markedAt(): Date {
    return this._markedAt;
  }

  get lastEditedBy(): string | undefined {
    return this._lastEditedBy;
  }

  get lastEditedAt(): Date | undefined {
    return this._lastEditedAt;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  // Factory methods
  static create(
    enrollmentId: string,
    classId: string,
    meetingNumber: number,
    meetingDate: Date,
    status: AttendanceStatus,
    markedBy: string,
    notes?: string,
  ): Attendance {
    return new Attendance(AttendanceId.create(), {
      enrollmentId,
      classId,
      meetingNumber,
      meetingDate,
      status,
      creditConsumed: status.consumesCredit(),
      markedBy,
      markedAt: new Date(),
      notes,
    });
  }

  static restore(
    id: string,
    props: {
      enrollmentId: string;
      classId: string;
      meetingNumber: number;
      meetingDate: Date;
      status: string;
      creditConsumed: boolean;
      markedBy: string;
      markedAt: Date;
      lastEditedBy?: string;
      lastEditedAt?: Date;
      notes?: string;
    },
  ): Attendance {
    return new Attendance(AttendanceId.create(id), {
      enrollmentId: props.enrollmentId,
      classId: props.classId,
      meetingNumber: props.meetingNumber,
      meetingDate: props.meetingDate,
      status: AttendanceStatus.create(props.status),
      creditConsumed: props.creditConsumed,
      markedBy: props.markedBy,
      markedAt: props.markedAt,
      lastEditedBy: props.lastEditedBy,
      lastEditedAt: props.lastEditedAt,
      notes: props.notes,
    });
  }

  // Business methods
  updateStatus(
    newStatus: AttendanceStatus,
    editedBy: string,
    notes?: string,
  ): { creditDelta: number } {
    const previouslyConsumed = this._creditConsumed;
    const shouldConsume = newStatus.consumesCredit();

    this._status = newStatus;
    this._creditConsumed = shouldConsume;
    this._lastEditedBy = editedBy;
    this._lastEditedAt = new Date();
    this.touch();

    if (notes) {
      this._notes = notes;
    }

    // Calculate credit delta
    // If previously consumed but now shouldn't: +1 (refund)
    // If previously not consumed but now should: -1 (consume)
    let creditDelta = 0;
    if (previouslyConsumed && !shouldConsume) {
      creditDelta = 1; // Refund
    } else if (!previouslyConsumed && shouldConsume) {
      creditDelta = -1; // Consume
    }

    return { creditDelta };
  }
}
