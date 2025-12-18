import { AggregateRoot } from '@shared/domain/aggregate-root.base';
import { PaymentId } from '../value-objects/payment-id.vo';
import { PaymentStatus } from '../value-objects/payment-status.vo';
import { PaymentMethod } from '../value-objects/payment-method.vo';
import { Money } from '../value-objects/money.vo';
import {
  PaymentAlreadyVerifiedError,
  PaymentAlreadyRejectedError,
  PaymentAlreadyRefundedError,
  InvalidRefundAmountError,
} from '../errors';
import {
  PaymentCreatedEvent,
  PaymentVerifiedEvent,
  PaymentRejectedEvent,
  PaymentRefundedEvent,
} from '../events';

interface PaymentProps {
  studentName: string | null;
  studentEmail: string | null;
  studentPhone: string | null;
  courseId: string | null;
  packageType: string | null;
  amount: Money;
  method: PaymentMethod | null;
  reference: string | null;
  proofUrl: string | null;
  status: PaymentStatus;
  notes: string | null;
  paidAt: Date | null;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  rejectedBy: string | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  refundedBy: string | null;
  refundedAt: Date | null;
  refundAmount: Money | null;
  refundReason: string | null;
}

export class Payment extends AggregateRoot<PaymentId> {
  private _studentName: string | null;
  private _studentEmail: string | null;
  private _studentPhone: string | null;
  private _courseId: string | null;
  private _packageType: string | null;
  private _amount: Money;
  private _method: PaymentMethod | null;
  private _reference: string | null;
  private _proofUrl: string | null;
  private _status: PaymentStatus;
  private _notes: string | null;
  private _paidAt: Date | null;
  private _verifiedBy: string | null;
  private _verifiedAt: Date | null;
  private _rejectedBy: string | null;
  private _rejectedAt: Date | null;
  private _rejectionReason: string | null;
  private _refundedBy: string | null;
  private _refundedAt: Date | null;
  private _refundAmount: Money | null;
  private _refundReason: string | null;

  private constructor(
    id: PaymentId,
    props: PaymentProps,
    createdAt?: Date,
    updatedAt?: Date,
    version?: number,
  ) {
    super(id, createdAt, updatedAt, version);
    this._studentName = props.studentName;
    this._studentEmail = props.studentEmail;
    this._studentPhone = props.studentPhone;
    this._courseId = props.courseId;
    this._packageType = props.packageType;
    this._amount = props.amount;
    this._method = props.method;
    this._reference = props.reference;
    this._proofUrl = props.proofUrl;
    this._status = props.status;
    this._notes = props.notes;
    this._paidAt = props.paidAt;
    this._verifiedBy = props.verifiedBy;
    this._verifiedAt = props.verifiedAt;
    this._rejectedBy = props.rejectedBy;
    this._rejectedAt = props.rejectedAt;
    this._rejectionReason = props.rejectionReason;
    this._refundedBy = props.refundedBy;
    this._refundedAt = props.refundedAt;
    this._refundAmount = props.refundAmount;
    this._refundReason = props.refundReason;
  }

  // Getters
  get studentName(): string | null {
    return this._studentName;
  }

  get studentEmail(): string | null {
    return this._studentEmail;
  }

  get studentPhone(): string | null {
    return this._studentPhone;
  }

  get courseId(): string | null {
    return this._courseId;
  }

  get packageType(): string | null {
    return this._packageType;
  }

  get amount(): Money {
    return this._amount;
  }

  get method(): PaymentMethod | null {
    return this._method;
  }

  get reference(): string | null {
    return this._reference;
  }

  get proofUrl(): string | null {
    return this._proofUrl;
  }

  get status(): PaymentStatus {
    return this._status;
  }

  get notes(): string | null {
    return this._notes;
  }

  get paidAt(): Date | null {
    return this._paidAt;
  }

  get verifiedBy(): string | null {
    return this._verifiedBy;
  }

  get verifiedAt(): Date | null {
    return this._verifiedAt;
  }

  get rejectedBy(): string | null {
    return this._rejectedBy;
  }

  get rejectedAt(): Date | null {
    return this._rejectedAt;
  }

  get rejectionReason(): string | null {
    return this._rejectionReason;
  }

  get refundedBy(): string | null {
    return this._refundedBy;
  }

  get refundedAt(): Date | null {
    return this._refundedAt;
  }

  get refundAmount(): Money | null {
    return this._refundAmount;
  }

  get refundReason(): string | null {
    return this._refundReason;
  }

  // Factory methods
  static create(props: {
    studentName?: string;
    studentEmail?: string;
    studentPhone?: string;
    courseId?: string;
    packageType?: string;
    amount: number;
    method?: string;
    reference?: string;
    paidAt?: Date;
    notes?: string;
  }): Payment {
    const id = PaymentId.create();
    const money = Money.create(props.amount);
    const method = props.method ? PaymentMethod.create(props.method) : null;

    const payment = new Payment(id, {
      studentName: props.studentName ?? null,
      studentEmail: props.studentEmail ?? null,
      studentPhone: props.studentPhone ?? null,
      courseId: props.courseId ?? null,
      packageType: props.packageType ?? null,
      amount: money,
      method,
      reference: props.reference ?? null,
      proofUrl: null,
      status: PaymentStatus.pending(),
      notes: props.notes ?? null,
      paidAt: props.paidAt ?? null,
      verifiedBy: null,
      verifiedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      refundedBy: null,
      refundedAt: null,
      refundAmount: null,
      refundReason: null,
    });

    payment.addDomainEvent(
      new PaymentCreatedEvent(
        id.value,
        props.studentName ?? '',
        props.studentEmail ?? '',
        props.courseId ?? null,
        props.amount,
        props.method ?? '',
      ),
    );

    return payment;
  }

  static restore(
    id: string,
    props: {
      studentName: string | null;
      studentEmail: string | null;
      studentPhone: string | null;
      courseId: string | null;
      packageType: string | null;
      amount: number;
      method: string | null;
      reference: string | null;
      proofUrl: string | null;
      status: string;
      notes: string | null;
      paidAt: Date | null;
      verifiedBy: string | null;
      verifiedAt: Date | null;
      rejectedBy: string | null;
      rejectedAt: Date | null;
      rejectionReason: string | null;
      refundedBy: string | null;
      refundedAt: Date | null;
      refundAmount: number | null;
      refundReason: string | null;
      createdAt: Date;
      updatedAt: Date;
      version?: number;
    },
  ): Payment {
    return new Payment(
      PaymentId.create(id),
      {
        studentName: props.studentName,
        studentEmail: props.studentEmail,
        studentPhone: props.studentPhone,
        courseId: props.courseId,
        packageType: props.packageType,
        amount: Money.create(props.amount),
        method: props.method ? PaymentMethod.create(props.method) : null,
        reference: props.reference,
        proofUrl: props.proofUrl,
        status: PaymentStatus.create(props.status),
        notes: props.notes,
        paidAt: props.paidAt,
        verifiedBy: props.verifiedBy,
        verifiedAt: props.verifiedAt,
        rejectedBy: props.rejectedBy,
        rejectedAt: props.rejectedAt,
        rejectionReason: props.rejectionReason,
        refundedBy: props.refundedBy,
        refundedAt: props.refundedAt,
        refundAmount: props.refundAmount
          ? Money.create(props.refundAmount)
          : null,
        refundReason: props.refundReason,
      },
      props.createdAt,
      props.updatedAt,
      props.version,
    );
  }

  // Business methods

  /**
   * Verify the payment
   */
  verify(verifiedBy: string, notes?: string): void {
    if (!this._status.canVerify()) {
      if (this._status.isVerified()) {
        throw new PaymentAlreadyVerifiedError(this.id.value);
      }
      if (this._status.isRejected()) {
        throw new PaymentAlreadyRejectedError(this.id.value);
      }
      if (this._status.isRefunded()) {
        throw new PaymentAlreadyRefundedError(this.id.value);
      }
    }

    this._status = PaymentStatus.verified();
    this._verifiedBy = verifiedBy;
    this._verifiedAt = new Date();

    if (notes) {
      this._notes = this._notes ? `${this._notes}\n${notes}` : notes;
    }

    this.touch();

    this.addDomainEvent(
      new PaymentVerifiedEvent(
        this.id.value,
        verifiedBy,
        this._amount.amount,
        this._studentEmail,
      ),
    );
  }

  /**
   * Reject the payment
   */
  reject(rejectedBy: string, reason: string): void {
    if (!this._status.canReject()) {
      if (this._status.isVerified()) {
        throw new PaymentAlreadyVerifiedError(this.id.value);
      }
      if (this._status.isRejected()) {
        throw new PaymentAlreadyRejectedError(this.id.value);
      }
      if (this._status.isRefunded()) {
        throw new PaymentAlreadyRefundedError(this.id.value);
      }
    }

    this._status = PaymentStatus.rejected();
    this._rejectedBy = rejectedBy;
    this._rejectedAt = new Date();
    this._rejectionReason = reason;
    this.touch();

    this.addDomainEvent(
      new PaymentRejectedEvent(
        this.id.value,
        rejectedBy,
        reason,
        this._studentEmail,
      ),
    );
  }

  /**
   * Refund the payment
   */
  refund(refundedBy: string, amount: number, reason: string): void {
    if (!this._status.canRefund()) {
      if (this._status.isPending()) {
        throw new Error('Cannot refund pending payment. Reject it instead.');
      }
      if (this._status.isRejected()) {
        throw new PaymentAlreadyRejectedError(this.id.value);
      }
      if (this._status.isRefunded()) {
        throw new PaymentAlreadyRefundedError(this.id.value);
      }
    }

    if (amount > this._amount.amount) {
      throw new InvalidRefundAmountError(amount, this._amount.amount);
    }

    this._status = PaymentStatus.refunded();
    this._refundedBy = refundedBy;
    this._refundedAt = new Date();
    this._refundAmount = Money.create(amount);
    this._refundReason = reason;
    this.touch();

    this.addDomainEvent(
      new PaymentRefundedEvent(
        this.id.value,
        refundedBy,
        amount,
        reason,
        this._studentEmail,
      ),
    );
  }

  /**
   * Update payment details (only for pending payments)
   */
  updateDetails(props: {
    studentName?: string;
    studentEmail?: string;
    studentPhone?: string;
    courseId?: string;
    packageType?: string;
    amount?: number;
    method?: string;
    reference?: string;
    notes?: string;
    paidAt?: Date;
  }): void {
    if (!this._status.isPending()) {
      throw new Error('Can only update pending payments');
    }

    if (props.studentName !== undefined) {
      this._studentName = props.studentName;
    }
    if (props.studentEmail !== undefined) {
      this._studentEmail = props.studentEmail;
    }
    if (props.studentPhone !== undefined) {
      this._studentPhone = props.studentPhone;
    }
    if (props.courseId !== undefined) {
      this._courseId = props.courseId;
    }
    if (props.packageType !== undefined) {
      this._packageType = props.packageType;
    }
    if (props.amount !== undefined) {
      this._amount = Money.create(props.amount);
    }
    if (props.method !== undefined) {
      this._method = PaymentMethod.create(props.method);
    }
    if (props.reference !== undefined) {
      this._reference = props.reference;
    }
    if (props.notes !== undefined) {
      this._notes = props.notes;
    }
    if (props.paidAt !== undefined) {
      this._paidAt = props.paidAt;
    }

    this.touch();
  }

  /**
   * Upload payment proof
   */
  uploadProof(proofUrl: string): void {
    this._proofUrl = proofUrl;
    this.touch();
  }
}
