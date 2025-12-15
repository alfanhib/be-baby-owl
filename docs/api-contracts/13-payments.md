# API Contract: Payment Management

**Module:** Payment Management  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for payment tracking and verification. For MVP, payments are processed externally (bank transfer/e-wallet) and manually verified by staff.

**Base URL:** `{API_BASE_URL}/payments`

---

## Authentication

All endpoints require Bearer token:

```
Authorization: Bearer {accessToken}
```

**Required Roles:** `staff`, `super_admin`

---

## Types

```typescript
type PaymentStatus = 'pending' | 'verified' | 'rejected' | 'refunded';
type PaymentMethod =
  | 'bank_transfer'
  | 'e_wallet'
  | 'credit_card'
  | 'cash'
  | 'other';

interface Payment {
  id: string;
  enrollment: {
    id: string;
    studentName: string;
    studentEmail: string;
    className: string;
    courseName: string;
  };
  amount: number;
  currency: string; // "IDR"
  status: PaymentStatus;
  method: PaymentMethod;
  reference?: string; // Bank reference, transaction ID
  proofUrl?: string; // Upload bukti transfer
  notes?: string;
  paidAt?: string; // When customer paid
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  refundedAt?: string;
  refundedBy?: string;
  refundAmount?: number;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentFilters {
  status?: PaymentStatus;
  method?: PaymentMethod;
  enrollmentId?: string;
  studentId?: string;
  classId?: string;
  courseId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface PaymentStats {
  total: number;
  totalAmount: number;
  byStatus: {
    pending: { count: number; amount: number };
    verified: { count: number; amount: number };
    rejected: { count: number; amount: number };
    refunded: { count: number; amount: number };
  };
  thisMonth: {
    count: number;
    amount: number;
    verifiedAmount: number;
  };
  pendingVerification: number;
}

interface CreatePaymentPayload {
  enrollmentId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  paidAt?: string;
  notes?: string;
}
```

---

## Endpoints

### Payment CRUD

#### 1. GET `/payments`

**Description:** Get paginated list of payments

**Query Parameters:**

| Param        | Type          | Required | Description            |
| ------------ | ------------- | -------- | ---------------------- |
| status       | PaymentStatus | No       | Filter by status       |
| method       | PaymentMethod | No       | Filter by method       |
| enrollmentId | string        | No       | Filter by enrollment   |
| studentId    | string        | No       | Filter by student      |
| classId      | string        | No       | Filter by class        |
| search       | string        | No       | Search by student name |
| startDate    | string        | No       | Payment date from      |
| endDate      | string        | No       | Payment date to        |
| page         | number        | No       | Page number            |
| limit        | number        | No       | Items per page         |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "payment-1",
      "enrollment": {
        "id": "enrollment-1",
        "studentName": "John Doe",
        "studentEmail": "john@example.com",
        "className": "RN101 - Batch 1",
        "courseName": "101 React Native"
      },
      "amount": 3000000,
      "currency": "IDR",
      "status": "pending",
      "method": "bank_transfer",
      "reference": "TRF-123456789",
      "proofUrl": "https://storage.example.com/proofs/proof-1.jpg",
      "notes": "BCA transfer",
      "paidAt": "2025-12-14T10:00:00Z",
      "createdAt": "2025-12-14T10:30:00Z",
      "updatedAt": "2025-12-14T10:30:00Z"
    }
  ],
  "meta": {
    "total": 500,
    "page": 1,
    "limit": 10,
    "totalPages": 50
  }
}
```

---

#### 2. GET `/payments/:id`

**Description:** Get single payment details

---

#### 3. GET `/payments/stats`

**Description:** Get payment statistics

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total": 500,
    "totalAmount": 1500000000,
    "byStatus": {
      "pending": { "count": 25, "amount": 75000000 },
      "verified": { "count": 450, "amount": 1350000000 },
      "rejected": { "count": 15, "amount": 45000000 },
      "refunded": { "count": 10, "amount": 30000000 }
    },
    "thisMonth": {
      "count": 50,
      "amount": 150000000,
      "verifiedAmount": 135000000
    },
    "pendingVerification": 25
  }
}
```

---

#### 4. POST `/payments`

**Description:** Create a new payment record

**Request Body:**

```json
{
  "enrollmentId": "enrollment-1",
  "amount": 3000000,
  "method": "bank_transfer",
  "reference": "TRF-123456789",
  "paidAt": "2025-12-14T10:00:00Z",
  "notes": "BCA transfer to account 1234567890"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Payment record created",
  "data": {
    "id": "payment-new",
    "status": "pending",
    ...
  }
}
```

---

#### 5. PATCH `/payments/:id`

**Description:** Update payment details

**Request Body:**

```json
{
  "amount": 3500000,
  "method": "e_wallet",
  "reference": "GOPAY-987654321",
  "notes": "Updated to GoPay"
}
```

---

### Payment Verification

#### 6. POST `/payments/:id/verify`

**Description:** Verify a payment

**Request Body:**

```json
{
  "notes": "Verified via mobile banking"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "id": "payment-1",
    "status": "verified",
    "verifiedAt": "2025-12-15T10:00:00Z",
    "verifiedBy": "staff-1",
    "enrollment": {
      "id": "enrollment-1",
      "status": "active",
      "paymentStatus": "verified"
    }
  }
}
```

**Side Effects:**

- Updates payment status to "verified"
- Updates enrollment payment status
- Activates enrollment if was pending
- Sends confirmation email to student

---

#### 7. POST `/payments/:id/reject`

**Description:** Reject a payment

**Request Body:**

```json
{
  "reason": "Transfer amount does not match"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Payment rejected",
  "data": {
    "id": "payment-1",
    "status": "rejected",
    "rejectedAt": "2025-12-15T10:00:00Z",
    "rejectedBy": "staff-1",
    "rejectionReason": "Transfer amount does not match"
  }
}
```

**Side Effects:**

- Updates payment status
- Sends notification to student with reason

---

#### 8. POST `/payments/:id/refund`

**Description:** Process a refund

**Request Body:**

```json
{
  "amount": 3000000,
  "reason": "Student requested cancellation",
  "notes": "Refund to original bank account"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Refund processed",
  "data": {
    "id": "payment-1",
    "status": "refunded",
    "refundedAt": "2025-12-15T10:00:00Z",
    "refundedBy": "staff-1",
    "refundAmount": 3000000,
    "refundReason": "Student requested cancellation"
  }
}
```

**Side Effects:**

- Updates payment status
- Updates enrollment status to cancelled
- Creates audit log
- Sends notification

---

### Payment Proof Upload

#### 9. POST `/payments/:id/upload-proof`

**Description:** Upload payment proof image

**Request:** `multipart/form-data`

```
file: <binary>
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Proof uploaded successfully",
  "data": {
    "proofUrl": "https://storage.example.com/proofs/proof-1.jpg"
  }
}
```

---

### Export

#### 10. GET `/payments/export`

**Description:** Export payments as CSV/Excel

**Query Parameters:**

| Param     | Type          | Required | Description      |
| --------- | ------------- | -------- | ---------------- |
| format    | string        | No       | "csv", "xlsx"    |
| status    | PaymentStatus | No       | Filter by status |
| startDate | string        | No       | From date        |
| endDate   | string        | No       | To date          |

**Response:** File download

---

## Error Codes

| Code                    | HTTP Status | Description                   |
| ----------------------- | ----------- | ----------------------------- |
| `PAYMENT_NOT_FOUND`     | 404         | Payment not found             |
| `ALREADY_VERIFIED`      | 400         | Payment already verified      |
| `ALREADY_REJECTED`      | 400         | Payment already rejected      |
| `ALREADY_REFUNDED`      | 400         | Payment already refunded      |
| `INVALID_REFUND_AMOUNT` | 400         | Refund amount exceeds payment |
| `ENROLLMENT_NOT_FOUND`  | 404         | Enrollment not found          |
| `FILE_TOO_LARGE`        | 400         | Proof file too large          |
| `INVALID_FILE_TYPE`     | 400         | Invalid file type for proof   |

---

## Workflow

### Standard Payment Flow

```
1. Student purchases via WhatsApp
2. Staff creates enrollment (payment status: pending)
3. Student transfers payment
4. Student sends proof via WhatsApp
5. Staff uploads proof to system
6. Staff verifies payment
7. System activates enrollment
8. Student receives confirmation
```

### Quick Verification

For trusted sources (repeat customers, corporate):

```
1. Staff creates enrollment
2. Staff immediately verifies payment
3. Enrollment active
```

---

## Implementation Checklist

### Backend

- [ ] Payment CRUD endpoints
- [ ] Verification endpoint
- [ ] Rejection endpoint
- [ ] Refund endpoint
- [ ] Proof upload with S3/Cloudinary
- [ ] CSV/Excel export
- [ ] Email notifications
- [ ] Audit logging
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Payments list page
- [x] Payment filters
- [x] Payment detail dialog
- [x] Verify payment dialog
- [x] Reject payment dialog
- [x] Create payment dialog
- [x] Proof upload
- [x] Payment stats cards
- [x] Export functionality
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
