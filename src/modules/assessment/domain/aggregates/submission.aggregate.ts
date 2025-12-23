import { AggregateRoot } from '@shared/domain/aggregate-root.base';
import { SubmissionId } from '../value-objects/submission-id.vo';
import { SubmissionStatus } from '../value-objects/submission-status.vo';
import { SubmissionType } from '../value-objects/submission-type.vo';
import { Grade } from '../value-objects/grade.vo';
import {
  SubmissionCreatedEvent,
  SubmissionGradedEvent,
  SubmissionReturnedEvent,
} from '../events';
import { InvalidSubmissionError } from '../errors';

interface FileInfo {
  url: string;
  name: string;
  size: number;
}

interface SubmissionProps {
  exerciseId: string;
  studentId: string;
  type: SubmissionType;
  fileInfo: FileInfo | null;
  textContent: string | null;
  linkUrl: string | null;
  comment: string | null;
  version: number;
  status: SubmissionStatus;
  grade: Grade | null;
  feedback: string | null;
  gradedById: string | null;
  gradedAt: Date | null;
}

export class Submission extends AggregateRoot<SubmissionId> {
  private _exerciseId: string;
  private _studentId: string;
  private _type: SubmissionType;
  private _fileInfo: FileInfo | null;
  private _textContent: string | null;
  private _linkUrl: string | null;
  private _comment: string | null;
  private _submissionVersion: number;
  private _status: SubmissionStatus;
  private _grade: Grade | null;
  private _feedback: string | null;
  private _gradedById: string | null;
  private _gradedAt: Date | null;

  private constructor(
    id: SubmissionId,
    props: SubmissionProps,
    createdAt?: Date,
    updatedAt?: Date,
    aggregateVersion?: number,
  ) {
    super(id, createdAt, updatedAt, aggregateVersion);
    this._exerciseId = props.exerciseId;
    this._studentId = props.studentId;
    this._type = props.type;
    this._fileInfo = props.fileInfo;
    this._textContent = props.textContent;
    this._linkUrl = props.linkUrl;
    this._comment = props.comment;
    this._submissionVersion = props.version;
    this._status = props.status;
    this._grade = props.grade;
    this._feedback = props.feedback;
    this._gradedById = props.gradedById;
    this._gradedAt = props.gradedAt;
  }

  // Getters
  get exerciseId(): string {
    return this._exerciseId;
  }

  get studentId(): string {
    return this._studentId;
  }

  get type(): SubmissionType {
    return this._type;
  }

  get fileInfo(): FileInfo | null {
    return this._fileInfo;
  }

  get textContent(): string | null {
    return this._textContent;
  }

  get linkUrl(): string | null {
    return this._linkUrl;
  }

  get comment(): string | null {
    return this._comment;
  }

  get submissionVersion(): number {
    return this._submissionVersion;
  }

  get status(): SubmissionStatus {
    return this._status;
  }

  get grade(): Grade | null {
    return this._grade;
  }

  get feedback(): string | null {
    return this._feedback;
  }

  get gradedById(): string | null {
    return this._gradedById;
  }

  get gradedAt(): Date | null {
    return this._gradedAt;
  }

  // Factory methods
  static create(props: {
    exerciseId: string;
    studentId: string;
    type: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    textContent?: string;
    linkUrl?: string;
    comment?: string;
  }): Submission {
    const id = SubmissionId.create();
    const type = SubmissionType.create(props.type);

    // Validate submission content based on type
    if (type.isFile() && !props.fileUrl) {
      throw new InvalidSubmissionError(
        'File URL is required for file submissions',
      );
    }
    if (type.isText() && !props.textContent) {
      throw new InvalidSubmissionError(
        'Text content is required for text submissions',
      );
    }
    if (type.isLink() && !props.linkUrl) {
      throw new InvalidSubmissionError(
        'Link URL is required for link submissions',
      );
    }

    const fileInfo =
      type.isFile() && props.fileUrl
        ? {
            url: props.fileUrl,
            name: props.fileName ?? 'unknown',
            size: props.fileSize ?? 0,
          }
        : null;

    const submission = new Submission(id, {
      exerciseId: props.exerciseId,
      studentId: props.studentId,
      type,
      fileInfo,
      textContent: type.isText() ? (props.textContent ?? null) : null,
      linkUrl: type.isLink() ? (props.linkUrl ?? null) : null,
      comment: props.comment ?? null,
      version: 1,
      status: SubmissionStatus.pending(),
      grade: null,
      feedback: null,
      gradedById: null,
      gradedAt: null,
    });

    submission.addDomainEvent(
      new SubmissionCreatedEvent(
        id.value,
        props.exerciseId,
        props.studentId,
        props.type,
        1,
      ),
    );

    return submission;
  }

  static restore(
    id: string,
    props: {
      exerciseId: string;
      studentId: string;
      type: string;
      fileUrl: string | null;
      fileName: string | null;
      fileSize: number | null;
      textContent: string | null;
      linkUrl: string | null;
      comment: string | null;
      version: number;
      status: string;
      grade: number | null;
      maxGrade: number | null;
      feedback: string | null;
      gradedById: string | null;
      gradedAt: Date | null;
      createdAt: Date;
      updatedAt: Date;
      aggregateVersion?: number;
    },
  ): Submission {
    const type = SubmissionType.create(props.type);
    const fileInfo = props.fileUrl
      ? {
          url: props.fileUrl,
          name: props.fileName ?? 'unknown',
          size: props.fileSize ?? 0,
        }
      : null;

    const grade =
      props.grade !== null && props.maxGrade !== null
        ? Grade.create(props.grade, props.maxGrade)
        : null;

    return new Submission(
      SubmissionId.create(id),
      {
        exerciseId: props.exerciseId,
        studentId: props.studentId,
        type,
        fileInfo,
        textContent: props.textContent,
        linkUrl: props.linkUrl,
        comment: props.comment,
        version: props.version,
        status: SubmissionStatus.create(props.status),
        grade,
        feedback: props.feedback,
        gradedById: props.gradedById,
        gradedAt: props.gradedAt,
      },
      props.createdAt,
      props.updatedAt,
      props.aggregateVersion,
    );
  }

  // Business methods

  /**
   * Resubmit with new content
   */
  resubmit(props: {
    type: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    textContent?: string;
    linkUrl?: string;
    comment?: string;
  }): void {
    const type = SubmissionType.create(props.type);

    // Validate submission content based on type
    if (type.isFile() && !props.fileUrl) {
      throw new InvalidSubmissionError(
        'File URL is required for file submissions',
      );
    }
    if (type.isText() && !props.textContent) {
      throw new InvalidSubmissionError(
        'Text content is required for text submissions',
      );
    }
    if (type.isLink() && !props.linkUrl) {
      throw new InvalidSubmissionError(
        'Link URL is required for link submissions',
      );
    }

    this._type = type;
    this._fileInfo =
      type.isFile() && props.fileUrl
        ? {
            url: props.fileUrl,
            name: props.fileName ?? 'unknown',
            size: props.fileSize ?? 0,
          }
        : null;
    this._textContent = type.isText() ? (props.textContent ?? null) : null;
    this._linkUrl = type.isLink() ? (props.linkUrl ?? null) : null;
    this._comment = props.comment ?? this._comment;
    this._submissionVersion += 1;
    this._status = SubmissionStatus.pending();
    this._grade = null;
    this._feedback = null;
    this._gradedById = null;
    this._gradedAt = null;

    this.touch();

    this.addDomainEvent(
      new SubmissionCreatedEvent(
        this.id.value,
        this._exerciseId,
        this._studentId,
        props.type,
        this._submissionVersion,
      ),
    );
  }

  /**
   * Grade the submission
   */
  gradeSubmission(
    gradedById: string,
    score: number,
    maxScore: number,
    feedback?: string,
  ): void {
    if (!this._status.canGrade()) {
      throw new InvalidSubmissionError(
        `Cannot grade submission with status: ${this._status.value}`,
      );
    }

    this._grade = Grade.create(score, maxScore);
    this._feedback = feedback ?? null;
    this._gradedById = gradedById;
    this._gradedAt = new Date();
    this._status = SubmissionStatus.graded();

    this.touch();

    this.addDomainEvent(
      new SubmissionGradedEvent(
        this.id.value,
        this._exerciseId,
        this._studentId,
        gradedById,
        score,
        maxScore,
        feedback ?? null,
      ),
    );
  }

  /**
   * Return submission for revision
   */
  returnForRevision(returnedById: string, feedback: string): void {
    if (!this._status.canReturn()) {
      throw new InvalidSubmissionError(
        `Cannot return submission with status: ${this._status.value}`,
      );
    }

    this._feedback = feedback;
    this._status = SubmissionStatus.returned();
    this._grade = null;
    this._gradedById = null;
    this._gradedAt = null;

    this.touch();

    this.addDomainEvent(
      new SubmissionReturnedEvent(
        this.id.value,
        this._exerciseId,
        this._studentId,
        returnedById,
        feedback,
      ),
    );
  }

  /**
   * Update feedback without changing grade
   */
  updateFeedback(feedback: string): void {
    this._feedback = feedback;
    this.touch();
  }
}
