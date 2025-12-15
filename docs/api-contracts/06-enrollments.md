# API Contract: Enrollment Management

**Module:** Enrollment Management  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for managing student enrollments. Enrollments link students to classes and track their progress, attendance, and credits.

**Base URL:** `{API_BASE_URL}/enrollments`

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
type EnrollmentStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'suspended';
type PaymentStatus = 'pending' | 'verified' | 'rejected' | 'refunded';

interface Enrollment {
  id: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  course: {
    id: string;
    title: string;
  };
  class: {
    id: string;
    name: string;
    type: 'group' | 'private';
  };
  classPackage: {
    totalMeetings: number;
    lessonsLimit: number; // Same as totalMeetings (1:1 ratio)
  };
  credits: {
    total: number; // Initial credits = totalMeetings
    used: number; // Credits used (attendance marked)
    remaining: number; // total - used
  };
  status: EnrollmentStatus;
  paymentStatus: PaymentStatus;
  progress: {
    lessonsUnlocked: number;
    lessonsCompleted: number;
  };
  attendance: {
    present: number;
    absent: number;
    late: number;
    rate: number; // Percentage
  };
  amount: number; // Payment amount
  enrolledAt: string;
  enrolledBy?: string;
  notes?: string;
  transferHistory?: TransferRecord[];
  upgradeHistory?: UpgradeRecord[];
  creditAdjustments?: CreditAdjustment[];
}

interface TransferRecord {
  fromClassId: string;
  fromClassName: string;
  toClassId: string;
  toClassName: string;
  transferredAt: string;
  transferredBy: string;
}

interface UpgradeRecord {
  fromMeetings: number;
  toMeetings: number;
  priceDifference: number;
  upgradedAt: string;
  upgradedBy: string;
}

interface CreditAdjustment {
  id: string;
  type: 'add' | 'deduct' | 'reset';
  amount: number;
  reason: string;
  previousTotal: number;
  newTotal: number;
  adjustedAt: string;
  adjustedBy: string;
}

interface EnrollmentFilters {
  status?: EnrollmentStatus;
  paymentStatus?: PaymentStatus;
  classId?: string;
  courseId?: string;
  studentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
```

---

## Endpoints

### Enrollment CRUD

#### 1. GET `/enrollments`

**Description:** Get paginated list of enrollments

**Query Parameters:**

| Param         | Type             | Required | Description                  |
| ------------- | ---------------- | -------- | ---------------------------- |
| status        | EnrollmentStatus | No       | Filter by status             |
| paymentStatus | PaymentStatus    | No       | Filter by payment status     |
| classId       | string           | No       | Filter by class              |
| courseId      | string           | No       | Filter by course             |
| studentId     | string           | No       | Filter by student            |
| search        | string           | No       | Search by student name       |
| page          | number           | No       | Page number (default: 1)     |
| limit         | number           | No       | Items per page (default: 10) |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Enrollments fetched successfully",
  "data": [
    {
      "id": "enrollment-1",
      "student": {
        "id": "student-1",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+6281234567890"
      },
      "course": {
        "id": "course-1",
        "title": "101 React Native"
      },
      "class": {
        "id": "class-1",
        "name": "RN101 - Batch 1",
        "type": "group"
      },
      "classPackage": {
        "totalMeetings": 20,
        "lessonsLimit": 20
      },
      "credits": {
        "total": 20,
        "used": 8,
        "remaining": 12
      },
      "status": "active",
      "paymentStatus": "verified",
      "progress": {
        "lessonsUnlocked": 8,
        "lessonsCompleted": 5
      },
      "attendance": {
        "present": 7,
        "absent": 1,
        "late": 0,
        "rate": 87.5
      },
      "amount": 3000000,
      "enrolledAt": "2025-10-01T10:00:00Z",
      "enrolledBy": "staff-1",
      "notes": "Enrolled via WhatsApp"
    }
  ],
  "meta": {
    "total": 200,
    "page": 1,
    "limit": 10,
    "totalPages": 20
  }
}
```

---

#### 2. GET `/enrollments/:id`

**Description:** Get single enrollment with full details

---

#### 3. GET `/enrollments/stats`

**Description:** Get enrollment statistics

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total": 500,
    "byStatus": {
      "pending": 20,
      "active": 350,
      "completed": 100,
      "cancelled": 25,
      "suspended": 5
    },
    "byPaymentStatus": {
      "pending": 30,
      "verified": 450,
      "rejected": 15,
      "refunded": 5
    },
    "thisMonth": 45,
    "lastMonth": 38,
    "growthRate": 18.4
  }
}
```

---

#### 4. POST `/enrollments`

**Description:** Create a new enrollment (Quick Enrollment Tool)

**Request Body:**

```json
{
  "studentId": "student-1",
  "classId": "class-1",
  "amount": 3000000,
  "paymentStatus": "pending",
  "notes": "Enrolled via WhatsApp"
}
```

**For new student (create + enroll):**

```json
{
  "student": {
    "name": "New Student",
    "email": "new@example.com",
    "phone": "+6281234567890"
  },
  "classId": "class-1",
  "amount": 3000000,
  "paymentStatus": "pending",
  "notes": "New student enrollment"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Enrollment created successfully",
  "data": {
    "id": "enrollment-new",
    "student": { ... },
    "class": { ... },
    "status": "pending",
    "paymentStatus": "pending",
    ...
  }
}
```

---

#### 5. PATCH `/enrollments/:id`

**Description:** Update enrollment

**Request Body:**

```json
{
  "status": "active",
  "paymentStatus": "verified",
  "notes": "Payment verified via bank transfer"
}
```

---

#### 6. PATCH `/enrollments/:id/status`

**Description:** Update enrollment status only

---

#### 7. PATCH `/enrollments/:id/payment-status`

**Description:** Update payment status only

**Request Body:**

```json
{
  "paymentStatus": "verified",
  "verifiedBy": "staff-1",
  "verificationNotes": "Bank transfer confirmed"
}
```

---

### Enrollment Actions

#### 8. POST `/enrollments/:id/transfer`

**Description:** Transfer student to different class

**Request Body:**

```json
{
  "toClassId": "class-2",
  "reason": "Schedule conflict"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Enrollment transferred successfully",
  "data": {
    "id": "enrollment-1",
    "class": {
      "id": "class-2",
      "name": "RN101 - Batch 2"
    },
    "transferHistory": [
      {
        "fromClassId": "class-1",
        "fromClassName": "RN101 - Batch 1",
        "toClassId": "class-2",
        "toClassName": "RN101 - Batch 2",
        "transferredAt": "2025-12-15T10:00:00Z",
        "transferredBy": "staff-1"
      }
    ]
  }
}
```

**Notes:**

- Can only transfer to same course
- Target class must have capacity
- Progress is preserved

---

#### 9. POST `/enrollments/:id/upgrade`

**Description:** Upgrade package (add meetings) - Private classes only

**Request Body:**

```json
{
  "additionalMeetings": 10,
  "additionalAmount": 1500000,
  "paymentStatus": "pending"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Package upgraded successfully",
  "data": {
    "id": "enrollment-1",
    "classPackage": {
      "totalMeetings": 30,
      "lessonsLimit": 30
    },
    "credits": {
      "total": 30,
      "used": 8,
      "remaining": 22
    },
    "upgradeHistory": [
      {
        "fromMeetings": 20,
        "toMeetings": 30,
        "priceDifference": 1500000,
        "upgradedAt": "2025-12-15T10:00:00Z",
        "upgradedBy": "staff-1"
      }
    ]
  }
}
```

**Notes:**

- Only for private classes
- Group classes cannot upgrade

---

#### 10. POST `/enrollments/:id/cancel`

**Description:** Cancel enrollment

**Request Body:**

```json
{
  "reason": "Student request",
  "refundAmount": 1500000
}
```

---

#### 11. POST `/enrollments/:id/credits/adjust`

**Description:** Adjust student credits (add/deduct)

**Request Body:**

```json
{
  "type": "add",
  "amount": 2,
  "reason": "Compensation for technical issue"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Credits adjusted successfully",
  "data": {
    "credits": {
      "total": 22,
      "used": 8,
      "remaining": 14
    },
    "adjustment": {
      "id": "adj-1",
      "type": "add",
      "amount": 2,
      "reason": "Compensation for technical issue",
      "previousTotal": 20,
      "newTotal": 22,
      "adjustedAt": "2025-12-15T10:00:00Z",
      "adjustedBy": "staff-1"
    }
  }
}
```

---

### Bulk Operations

#### 12. POST `/enrollments/bulk`

**Description:** Bulk create enrollments (CSV upload)

**Request Body:**

```json
{
  "classId": "class-1",
  "students": [
    {
      "name": "Student 1",
      "email": "s1@example.com",
      "phone": "+6281111111111"
    },
    {
      "name": "Student 2",
      "email": "s2@example.com",
      "phone": "+6282222222222"
    }
  ],
  "amount": 3000000,
  "paymentStatus": "pending"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Bulk enrollment completed",
  "data": {
    "created": 2,
    "failed": 0,
    "enrollments": [
      { "id": "enrollment-new-1", ... },
      { "id": "enrollment-new-2", ... }
    ],
    "errors": []
  }
}
```

---

## Error Codes

| Code                        | HTTP Status | Description                                     |
| --------------------------- | ----------- | ----------------------------------------------- |
| `ENROLLMENT_NOT_FOUND`      | 404         | Enrollment not found                            |
| `CLASS_FULL`                | 409         | Class at max capacity                           |
| `ALREADY_ENROLLED`          | 409         | Student already enrolled in this class          |
| `CANNOT_TRANSFER`           | 400         | Cannot transfer (different course, no capacity) |
| `CANNOT_UPGRADE`            | 400         | Cannot upgrade group class                      |
| `INVALID_CREDIT_ADJUSTMENT` | 400         | Invalid credit adjustment                       |

---

## Workflow: Quick Enrollment

1. Staff receives purchase via WhatsApp
2. Staff opens Quick Enrollment Tool
3. Search existing student or create new
4. Select class
5. Enter payment amount
6. Submit → Creates enrollment with `pending` status
7. After payment verified → Update to `verified`
8. System activates enrollment

**Target Time:** < 5 minutes per enrollment

---

## Implementation Checklist

### Backend

- [ ] Enrollment CRUD endpoints
- [ ] Transfer enrollment endpoint
- [ ] Upgrade package endpoint
- [ ] Cancel enrollment endpoint
- [ ] Credit adjustment endpoint
- [ ] Bulk enrollment endpoint
- [ ] CSV parser for bulk upload
- [ ] Email notifications
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Enrollment list page
- [x] Enrollment detail dialog
- [x] Quick Enrollment Tool
- [x] Transfer enrollment dialog
- [x] Upgrade package dialog
- [x] Cancel enrollment dialog
- [x] Credit adjustment dialog
- [x] Bulk enrollment dialog
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
