import { Entity } from '@shared/domain/entity.base';
import { LessonUnlockId } from '../value-objects/enrollment-id.vo';

interface LessonUnlockProps {
  classId: string;
  lessonId: string;
  unlockedBy: string;
  unlockedAt: Date;
  meetingNumber?: number;
  notes?: string;
}

export class LessonUnlock extends Entity<LessonUnlockId> {
  private _classId: string;
  private _lessonId: string;
  private _unlockedBy: string;
  private _unlockedAt: Date;
  private _meetingNumber?: number;
  private _notes?: string;

  private constructor(id: LessonUnlockId, props: LessonUnlockProps) {
    super(id);
    this._classId = props.classId;
    this._lessonId = props.lessonId;
    this._unlockedBy = props.unlockedBy;
    this._unlockedAt = props.unlockedAt;
    this._meetingNumber = props.meetingNumber;
    this._notes = props.notes;
  }

  // Getters
  get classId(): string {
    return this._classId;
  }

  get lessonId(): string {
    return this._lessonId;
  }

  get unlockedBy(): string {
    return this._unlockedBy;
  }

  get unlockedAt(): Date {
    return this._unlockedAt;
  }

  get meetingNumber(): number | undefined {
    return this._meetingNumber;
  }

  get notes(): string | undefined {
    return this._notes;
  }

  // Factory methods
  static create(
    classId: string,
    lessonId: string,
    unlockedBy: string,
    meetingNumber?: number,
    notes?: string,
  ): LessonUnlock {
    return new LessonUnlock(LessonUnlockId.create(), {
      classId,
      lessonId,
      unlockedBy,
      unlockedAt: new Date(),
      meetingNumber,
      notes,
    });
  }

  static restore(
    id: string,
    props: {
      classId: string;
      lessonId: string;
      unlockedBy: string;
      unlockedAt: Date;
      meetingNumber?: number;
      notes?: string;
    },
  ): LessonUnlock {
    return new LessonUnlock(LessonUnlockId.create(id), {
      classId: props.classId,
      lessonId: props.lessonId,
      unlockedBy: props.unlockedBy,
      unlockedAt: props.unlockedAt,
      meetingNumber: props.meetingNumber,
      notes: props.notes,
    });
  }
}
