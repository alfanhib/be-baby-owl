import { AggregateRoot } from '@shared/domain/aggregate-root.base';
import { ClassId } from '../value-objects/class-id.vo';
import { ClassType } from '../value-objects/class-type.vo';
import { ClassStatus } from '../value-objects/class-status.vo';
import { Schedule } from '../value-objects/schedule.vo';
import { Enrollment } from '../entities/enrollment.entity';
import { Attendance } from '../entities/attendance.entity';
import { LessonUnlock } from '../entities/lesson-unlock.entity';
import {
  CreditAdjustment,
  CreditAdjustmentType,
} from '../entities/credit-adjustment.entity';
import { AttendanceStatus } from '../value-objects/attendance-status.vo';

// Domain Events
import {
  ClassCreatedEvent,
  ClassActivatedEvent,
  StudentEnrolledEvent,
  StudentRemovedEvent,
  AttendanceMarkedEvent,
  CreditAdjustedEvent,
  LessonUnlockedEvent,
  ClassCompletedEvent,
} from '../events';

interface ClassProps {
  name: string;
  courseId: string;
  instructorId: string;
  type: ClassType;
  status: ClassStatus;
  totalMeetings: number;
  meetingsCompleted: number;
  maxStudents?: number;
  schedules: Schedule[];
  startDate?: Date;
  endDate?: Date;
  enrollmentDeadline?: Date;
  continuedFromClassId?: string;
  enrollments: Enrollment[];
  lessonUnlocks: LessonUnlock[];
  notes?: string;
}

export class Class extends AggregateRoot<ClassId> {
  private _name: string;
  private _courseId: string;
  private _instructorId: string;
  private _type: ClassType;
  private _status: ClassStatus;
  private _totalMeetings: number;
  private _meetingsCompleted: number;
  private _maxStudents?: number;
  private _schedules: Schedule[];
  private _startDate?: Date;
  private _endDate?: Date;
  private _enrollmentDeadline?: Date;
  private _continuedFromClassId?: string;
  private _enrollments: Enrollment[];
  private _lessonUnlocks: LessonUnlock[];
  private _notes?: string;

  private constructor(
    id: ClassId,
    props: ClassProps,
    createdAt?: Date,
    updatedAt?: Date,
    version?: number,
  ) {
    super(id, createdAt, updatedAt, version);
    this._name = props.name;
    this._courseId = props.courseId;
    this._instructorId = props.instructorId;
    this._type = props.type;
    this._status = props.status;
    this._totalMeetings = props.totalMeetings;
    this._meetingsCompleted = props.meetingsCompleted;
    this._maxStudents = props.maxStudents;
    this._schedules = props.schedules;
    this._startDate = props.startDate;
    this._endDate = props.endDate;
    this._enrollmentDeadline = props.enrollmentDeadline;
    this._continuedFromClassId = props.continuedFromClassId;
    this._enrollments = props.enrollments;
    this._lessonUnlocks = props.lessonUnlocks;
    this._notes = props.notes;
  }

  // Getters
  get name(): string {
    return this._name;
  }

  get courseId(): string {
    return this._courseId;
  }

  get instructorId(): string {
    return this._instructorId;
  }

  get type(): ClassType {
    return this._type;
  }

  get status(): ClassStatus {
    return this._status;
  }

  get totalMeetings(): number {
    return this._totalMeetings;
  }

  get meetingsCompleted(): number {
    return this._meetingsCompleted;
  }

  get maxStudents(): number | undefined {
    return this._maxStudents;
  }

  get schedules(): Schedule[] {
    return [...this._schedules];
  }

  get startDate(): Date | undefined {
    return this._startDate;
  }

  get endDate(): Date | undefined {
    return this._endDate;
  }

  get enrollmentDeadline(): Date | undefined {
    return this._enrollmentDeadline;
  }

  get continuedFromClassId(): string | undefined {
    return this._continuedFromClassId;
  }

  get enrollments(): Enrollment[] {
    return [...this._enrollments];
  }

  get activeEnrollments(): Enrollment[] {
    return this._enrollments.filter((e) => e.isActive());
  }

  get lessonUnlocks(): LessonUnlock[] {
    return [...this._lessonUnlocks];
  }

  get notes(): string | undefined {
    return this._notes;
  }

  get studentCount(): number {
    return this.activeEnrollments.length;
  }

  get lessonsUnlockedCount(): number {
    return this._lessonUnlocks.length;
  }

  // Factory methods
  static create(props: {
    name: string;
    courseId: string;
    instructorId: string;
    type: string;
    totalMeetings: number;
    maxStudents?: number;
    schedules?: Array<{
      dayOfWeek: string;
      startTime: string;
      endTime: string;
      timezone?: string;
    }>;
    startDate?: Date;
    endDate?: Date;
    enrollmentDeadline?: Date;
    continuedFromClassId?: string;
    notes?: string;
  }): Class {
    const id = ClassId.create();
    const classType = ClassType.create(props.type);

    // Private classes can only have 1 student
    let maxStudents = props.maxStudents;
    if (classType.isPrivate()) {
      maxStudents = 1;
    }

    const schedules = (props.schedules ?? []).map((s) =>
      Schedule.create(s.dayOfWeek, s.startTime, s.endTime, s.timezone),
    );

    const classEntity = new Class(id, {
      name: props.name,
      courseId: props.courseId,
      instructorId: props.instructorId,
      type: classType,
      status: ClassStatus.draft(),
      totalMeetings: props.totalMeetings,
      meetingsCompleted: 0,
      maxStudents,
      schedules,
      startDate: props.startDate,
      endDate: props.endDate,
      enrollmentDeadline: props.enrollmentDeadline,
      continuedFromClassId: props.continuedFromClassId,
      enrollments: [],
      lessonUnlocks: [],
      notes: props.notes,
    });

    classEntity.addDomainEvent(
      new ClassCreatedEvent(
        id.value,
        props.name,
        props.courseId,
        props.instructorId,
        classType.value,
      ),
    );

    return classEntity;
  }

  static restore(
    id: string,
    props: {
      name: string;
      courseId: string;
      instructorId: string;
      type: string;
      status: string;
      totalMeetings: number;
      meetingsCompleted: number;
      maxStudents?: number;
      schedules: Array<{
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        timezone: string;
      }>;
      startDate?: Date;
      endDate?: Date;
      enrollmentDeadline?: Date;
      continuedFromClassId?: string;
      enrollments: Enrollment[];
      lessonUnlocks: LessonUnlock[];
      notes?: string;
      createdAt: Date;
      updatedAt: Date;
      version?: number;
    },
  ): Class {
    return new Class(
      ClassId.create(id),
      {
        name: props.name,
        courseId: props.courseId,
        instructorId: props.instructorId,
        type: ClassType.create(props.type),
        status: ClassStatus.create(props.status),
        totalMeetings: props.totalMeetings,
        meetingsCompleted: props.meetingsCompleted,
        maxStudents: props.maxStudents,
        schedules: props.schedules.map((s) =>
          Schedule.create(s.dayOfWeek, s.startTime, s.endTime, s.timezone),
        ),
        startDate: props.startDate,
        endDate: props.endDate,
        enrollmentDeadline: props.enrollmentDeadline,
        continuedFromClassId: props.continuedFromClassId,
        enrollments: props.enrollments,
        lessonUnlocks: props.lessonUnlocks,
        notes: props.notes,
      },
      props.createdAt,
      props.updatedAt,
      props.version,
    );
  }

  // Business methods

  /**
   * Open class for enrollment
   */
  openEnrollment(): void {
    if (!this._status.isDraft()) {
      throw new Error('Only draft classes can be opened for enrollment');
    }
    this._status = ClassStatus.enrollmentOpen();
    this.touch();
  }

  /**
   * Activate the class (start teaching)
   */
  activate(): void {
    if (!this._status.canActivate()) {
      throw new Error('Class cannot be activated from current status');
    }
    this._status = ClassStatus.active();
    this.touch();

    this.addDomainEvent(new ClassActivatedEvent(this.id.value, this._name));
  }

  /**
   * Complete the class
   */
  complete(): void {
    if (!this._status.canComplete()) {
      throw new Error('Only active classes can be completed');
    }
    this._status = ClassStatus.completed();
    this._endDate = new Date();
    this.touch();

    // Mark all active enrollments as completed
    for (const enrollment of this._enrollments) {
      if (enrollment.isActive()) {
        enrollment.complete();
      }
    }

    this.addDomainEvent(new ClassCompletedEvent(this.id.value, this._name));
  }

  /**
   * Cancel the class
   */
  cancel(): void {
    if (this._status.isCompleted() || this._status.isCancelled()) {
      throw new Error('Cannot cancel a completed or already cancelled class');
    }
    this._status = ClassStatus.cancelled();
    this.touch();
  }

  /**
   * Enroll a student in the class
   */
  enrollStudent(studentId: string, notes?: string): Enrollment {
    // Business rules for enrollment
    this.validateEnrollment(studentId);

    const enrollment = Enrollment.create(
      this.id.value,
      studentId,
      this._totalMeetings,
      notes,
    );

    this._enrollments.push(enrollment);
    this.touch();

    this.addDomainEvent(
      new StudentEnrolledEvent(
        this.id.value,
        studentId,
        enrollment.id.value,
        this._totalMeetings,
      ),
    );

    return enrollment;
  }

  private validateEnrollment(studentId: string): void {
    // Check class status
    if (this._type.isGroup()) {
      // Group class: can only enroll during enrollment_open status
      if (!this._status.isEnrollmentOpen()) {
        throw new Error('Group class enrollment is closed');
      }

      // Check enrollment deadline
      if (this._enrollmentDeadline && new Date() > this._enrollmentDeadline) {
        throw new Error('Enrollment deadline has passed');
      }
    } else {
      // Private class: can enroll anytime except when completed/cancelled
      if (this._status.isCompleted() || this._status.isCancelled()) {
        throw new Error('Cannot enroll in completed or cancelled class');
      }
    }

    // Check if student is already enrolled
    const existingEnrollment = this._enrollments.find(
      (e) => e.studentId === studentId && e.isActive(),
    );
    if (existingEnrollment) {
      throw new Error('Student is already enrolled in this class');
    }

    // Check max students
    if (
      this._maxStudents &&
      this.activeEnrollments.length >= this._maxStudents
    ) {
      throw new Error('Class is full');
    }
  }

  /**
   * Remove a student from the class
   */
  removeStudent(studentId: string): void {
    const enrollment = this._enrollments.find(
      (e) => e.studentId === studentId && e.isActive(),
    );

    if (!enrollment) {
      throw new Error('Student is not enrolled in this class');
    }

    enrollment.withdraw();
    this.touch();

    this.addDomainEvent(
      new StudentRemovedEvent(
        this.id.value,
        studentId,
        enrollment.id.value,
        'removed',
      ),
    );
  }

  /**
   * Mark attendance for a student
   */
  markAttendance(
    enrollmentId: string,
    meetingNumber: number,
    meetingDate: Date,
    status: AttendanceStatus,
    markedBy: string,
    notes?: string,
  ): Attendance {
    const enrollment = this._enrollments.find(
      (e) => e.id.value === enrollmentId,
    );

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    if (!enrollment.isActive()) {
      throw new Error('Cannot mark attendance for inactive enrollment');
    }

    // Create attendance record
    const attendance = Attendance.create(
      enrollmentId,
      this.id.value,
      meetingNumber,
      meetingDate,
      status,
      markedBy,
      notes,
    );

    // Consume credit if applicable
    if (status.consumesCredit()) {
      enrollment.useCredit();
    }

    // Update meetings completed if this is a new meeting
    if (meetingNumber > this._meetingsCompleted) {
      this._meetingsCompleted = meetingNumber;
    }

    this.touch();

    this.addDomainEvent(
      new AttendanceMarkedEvent(
        this.id.value,
        enrollmentId,
        enrollment.studentId,
        meetingNumber,
        status.value,
        attendance.creditConsumed,
      ),
    );

    return attendance;
  }

  /**
   * Adjust credits for an enrollment
   */
  adjustCredits(
    enrollmentId: string,
    amount: number,
    type: CreditAdjustmentType,
    reason: string,
    adjustedBy: string,
  ): CreditAdjustment {
    const enrollment = this._enrollments.find(
      (e) => e.id.value === enrollmentId,
    );

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    const previousTotal = enrollment.credits.total;

    // Create adjustment record
    const adjustment = CreditAdjustment.create(
      enrollmentId,
      amount,
      type,
      reason,
      adjustedBy,
      previousTotal,
    );

    // Apply adjustment to enrollment
    enrollment.adjustCredits(amount);

    this.touch();

    this.addDomainEvent(
      new CreditAdjustedEvent(
        this.id.value,
        enrollmentId,
        enrollment.studentId,
        amount,
        type,
        reason,
        previousTotal,
        enrollment.credits.total,
      ),
    );

    return adjustment;
  }

  /**
   * Unlock a lesson for all students in the class
   */
  unlockLesson(
    lessonId: string,
    unlockedBy: string,
    meetingNumber?: number,
    notes?: string,
  ): LessonUnlock {
    // Check if instructor
    if (unlockedBy !== this._instructorId) {
      throw new Error('Only the instructor can unlock lessons');
    }

    // Check if lesson already unlocked
    const existingUnlock = this._lessonUnlocks.find(
      (u) => u.lessonId === lessonId,
    );
    if (existingUnlock) {
      throw new Error('Lesson is already unlocked');
    }

    // Check unlock limit (lessons unlocked <= meetings completed)
    if (this._lessonUnlocks.length >= this._totalMeetings) {
      throw new Error('Cannot unlock more lessons than total meetings');
    }

    const unlock = LessonUnlock.create(
      this.id.value,
      lessonId,
      unlockedBy,
      meetingNumber,
      notes,
    );

    this._lessonUnlocks.push(unlock);
    this.touch();

    this.addDomainEvent(
      new LessonUnlockedEvent(
        this.id.value,
        lessonId,
        unlockedBy,
        this._lessonUnlocks.length,
      ),
    );

    return unlock;
  }

  /**
   * Check if a lesson is unlocked
   */
  isLessonUnlocked(lessonId: string): boolean {
    return this._lessonUnlocks.some((u) => u.lessonId === lessonId);
  }

  /**
   * Update class details
   */
  updateDetails(props: {
    name?: string;
    maxStudents?: number;
    startDate?: Date;
    endDate?: Date;
    enrollmentDeadline?: Date;
    notes?: string;
  }): void {
    if (props.name !== undefined) {
      this._name = props.name;
    }
    if (props.maxStudents !== undefined) {
      // Private classes always have maxStudents = 1
      if (!this._type.isPrivate()) {
        this._maxStudents = props.maxStudents;
      }
    }
    if (props.startDate !== undefined) {
      this._startDate = props.startDate;
    }
    if (props.endDate !== undefined) {
      this._endDate = props.endDate;
    }
    if (props.enrollmentDeadline !== undefined) {
      this._enrollmentDeadline = props.enrollmentDeadline;
    }
    if (props.notes !== undefined) {
      this._notes = props.notes;
    }
    this.touch();
  }

  /**
   * Add meetings to the class (for private classes extending package)
   */
  addMeetings(count: number): void {
    if (!this._type.isPrivate()) {
      throw new Error('Can only add meetings to private classes');
    }
    if (count <= 0) {
      throw new Error('Count must be positive');
    }

    this._totalMeetings += count;

    // Add credits to all active enrollments
    for (const enrollment of this.activeEnrollments) {
      enrollment.addCredits(count);
    }

    this.touch();
  }

  /**
   * Get enrollment by student ID
   */
  getEnrollmentByStudentId(studentId: string): Enrollment | undefined {
    return this._enrollments.find(
      (e) => e.studentId === studentId && e.isActive(),
    );
  }

  /**
   * Get enrollment by ID
   */
  getEnrollmentById(enrollmentId: string): Enrollment | undefined {
    return this._enrollments.find((e) => e.id.value === enrollmentId);
  }
}
