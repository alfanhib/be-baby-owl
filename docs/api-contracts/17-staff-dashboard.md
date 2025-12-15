# API Contract: Staff Dashboard

**Module:** Staff Dashboard  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for staff-specific dashboard and features. Staff handle day-to-day operations: enrollments, payments, and student support.

**Base URL:** `{API_BASE_URL}/staff`

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
interface StaffDashboardStats {
  pendingEnrollments: number;
  activeClasses: number;
  pendingPayments: number;
  totalStudents: number;
  totalInstructors: number;
  monthlyRevenue: number;
  todayEnrollments: number;
  weeklyEnrollments: number;
  completedClasses: number;
  verifiedPaymentsToday: number;
  pendingPaymentsAmount: number;
  enrollmentRate: number;
  avgRating: number;
}

interface EnrollmentTrendItem {
  date: string;
  count: number;
}

interface RevenueTrendItem {
  date: string;
  amount: number;
  verified: number;
  pending: number;
}

interface RecentActivity {
  id: string;
  type:
    | 'enrollment'
    | 'payment_verified'
    | 'class_created'
    | 'user_created'
    | 'class_completed';
  title: string;
  description: string;
  user?: { id: string; name: string; avatar?: string };
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface PendingAction {
  id: string;
  type:
    | 'verify_payment'
    | 'approve_enrollment'
    | 'review_transfer'
    | 'follow_up';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  dueDate?: string;
  actionUrl: string;
  metadata?: Record<string, unknown>;
}

interface QuickStats {
  label: string;
  value: number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: string;
}
```

---

## Endpoints

### Dashboard

#### 1. GET `/staff/dashboard`

**Description:** Get staff dashboard data

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "stats": {
      "pendingEnrollments": 12,
      "activeClasses": 45,
      "pendingPayments": 8,
      "totalStudents": 500,
      "totalInstructors": 30,
      "monthlyRevenue": 450000000,
      "todayEnrollments": 3,
      "weeklyEnrollments": 25,
      "completedClasses": 120,
      "verifiedPaymentsToday": 5,
      "pendingPaymentsAmount": 24000000,
      "enrollmentRate": 85,
      "avgRating": 4.7
    },
    "quickStats": [
      {
        "label": "Today's Enrollments",
        "value": 3,
        "change": 50,
        "changeType": "increase",
        "icon": "user-plus"
      },
      { "label": "Pending Payments", "value": 8, "icon": "credit-card" },
      { "label": "Active Classes", "value": 45, "icon": "book-open" }
    ],
    "enrollmentTrend": [
      { "date": "2025-12-09", "count": 4 },
      { "date": "2025-12-10", "count": 6 },
      { "date": "2025-12-11", "count": 3 }
    ],
    "revenueTrend": [
      {
        "date": "2025-12-09",
        "amount": 15000000,
        "verified": 12000000,
        "pending": 3000000
      }
    ],
    "recentActivity": [
      {
        "id": "activity-1",
        "type": "enrollment",
        "title": "New Enrollment",
        "description": "John Doe enrolled in RN101 - Batch 1",
        "user": { "id": "student-1", "name": "John Doe", "avatar": "..." },
        "timestamp": "2025-12-15T10:00:00Z"
      },
      {
        "id": "activity-2",
        "type": "payment_verified",
        "title": "Payment Verified",
        "description": "Payment of Rp 3,000,000 verified for Jane Student",
        "timestamp": "2025-12-15T09:45:00Z"
      }
    ],
    "pendingActions": [
      {
        "id": "action-1",
        "type": "verify_payment",
        "title": "Verify Payment",
        "description": "Rp 3,000,000 from Bob Student - waiting 2 days",
        "priority": "high",
        "createdAt": "2025-12-13T10:00:00Z",
        "actionUrl": "/staff/payments/payment-123"
      }
    ]
  }
}
```

---

### Quick Enrollment

#### 2. GET `/staff/quick-enroll/search-student`

**Description:** Search existing students for quick enrollment

**Query Parameters:**

| Param | Type   | Required | Description                     |
| ----- | ------ | -------- | ------------------------------- |
| q     | string | Yes      | Search by name, email, or phone |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "student-1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+6281234567890",
      "avatar": "..."
    }
  ]
}
```

---

#### 3. GET `/staff/quick-enroll/available-classes`

**Description:** Get classes available for enrollment

**Query Parameters:**

| Param    | Type   | Required | Description          |
| -------- | ------ | -------- | -------------------- |
| courseId | string | No       | Filter by course     |
| type     | string | No       | "group" or "private" |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "class-1",
      "name": "RN101 - Batch 1",
      "course": { "id": "course-1", "title": "101 React Native" },
      "instructor": { "id": "instructor-1", "name": "Dr. Smith" },
      "type": "group",
      "capacity": { "current": 12, "max": 15 },
      "canEnroll": true,
      "packages": [
        { "meetings": 20, "price": 3000000, "priceFormatted": "Rp 3.000.000" }
      ]
    }
  ]
}
```

---

#### 4. POST `/staff/quick-enroll`

**Description:** Quick enrollment (create student if new + create enrollment)

**Request Body:**

```json
{
  "student": {
    "id": "student-1"
  },
  "classId": "class-1",
  "package": {
    "meetings": 20,
    "price": 3000000
  },
  "paymentStatus": "pending",
  "notes": "Enrolled via WhatsApp"
}
```

**Or for new student:**

```json
{
  "student": {
    "name": "New Student",
    "email": "new@example.com",
    "phone": "+6281234567890"
  },
  "classId": "class-1",
  "package": {
    "meetings": 20,
    "price": 3000000
  },
  "paymentStatus": "pending"
}
```

---

### Staff Tools

#### 5. GET `/staff/pending-payments`

**Description:** Get payments pending verification

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "payment-1",
      "studentName": "John Doe",
      "amount": 3000000,
      "amountFormatted": "Rp 3.000.000",
      "className": "RN101 - Batch 1",
      "createdAt": "2025-12-13T10:00:00Z",
      "daysWaiting": 2,
      "proofUrl": "...",
      "priority": "high"
    }
  ]
}
```

---

#### 6. GET `/staff/today-summary`

**Description:** Get today's summary for end-of-day report

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "2025-12-15",
    "enrollments": {
      "created": 5,
      "verified": 3,
      "cancelled": 0
    },
    "payments": {
      "verified": 4,
      "totalVerified": 12000000,
      "pending": 2,
      "totalPending": 6000000
    },
    "classes": {
      "created": 1,
      "started": 2,
      "completed": 0
    },
    "students": {
      "newRegistrations": 3,
      "totalActive": 500
    }
  }
}
```

---

#### 7. GET `/staff/follow-ups`

**Description:** Get students/enrollments needing follow-up

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "followup-1",
      "type": "payment_pending",
      "studentName": "Bob Student",
      "studentPhone": "+6281234567890",
      "description": "Payment pending for 5 days",
      "createdAt": "2025-12-10T10:00:00Z",
      "lastContact": "2025-12-12T10:00:00Z",
      "priority": "high"
    },
    {
      "id": "followup-2",
      "type": "inactive_student",
      "studentName": "Jane Learner",
      "description": "No activity for 14 days",
      "lastActivity": "2025-12-01T10:00:00Z",
      "priority": "medium"
    }
  ]
}
```

---

## Error Codes

| Code                | HTTP Status | Description       |
| ------------------- | ----------- | ----------------- |
| `NOT_STAFF`         | 403         | User is not staff |
| `STUDENT_NOT_FOUND` | 404         | Student not found |
| `CLASS_NOT_FOUND`   | 404         | Class not found   |
| `CLASS_FULL`        | 409         | Class at capacity |

---

## Implementation Checklist

### Backend

- [ ] Staff dashboard endpoint
- [ ] Quick enrollment endpoints
- [ ] Pending payments endpoint
- [ ] Today summary endpoint
- [ ] Follow-ups endpoint
- [ ] Student search
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Staff dashboard page
- [x] Quick stats cards
- [x] Trend charts
- [x] Recent activity feed
- [x] Pending actions list
- [x] Quick enrollment dialog
- [x] Follow-up management
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
