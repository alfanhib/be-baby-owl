# API Contract: Admin Student Management

**Module:** Admin Student Management  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for admin-level student management. Provides detailed student views with enrollment history, progress tracking, gamification stats, and bulk operations.

**Base URL:** `{API_BASE_URL}/admin/students`

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
type StudentStatus = 'active' | 'inactive' | 'suspended';

interface AdminStudent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: StudentStatus;
  enrollments: {
    total: number;
    active: number;
    completed: number;
  };
  progress: {
    avgCompletion: number;
    totalHours: number;
    lessonsCompleted: number;
  };
  gamification: {
    xp: number;
    level: number;
    streak: number;
    badges: number;
  };
  lastActiveAt: string;
  createdAt: string;
  enrolledCourses: {
    courseId: string;
    courseName: string;
    className: string;
    progress: number;
    status: 'active' | 'completed' | 'suspended';
  }[];
}

interface StudentFilters {
  status?: StudentStatus;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'progress' | 'xp' | 'lastActive';
  sortOrder?: 'asc' | 'desc';
  hasEnrollments?: boolean;
  isAtRisk?: boolean;
  page?: number;
  limit?: number;
}

interface StudentStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  atRisk: number;
  newThisMonth: number;
  avgProgress: number;
  avgXp: number;
}

interface StudentDetail extends AdminStudent {
  payments: {
    total: number;
    verified: number;
    pending: number;
  };
  assignments: {
    submitted: number;
    graded: number;
    pending: number;
    avgScore: number;
  };
  attendance: {
    present: number;
    absent: number;
    late: number;
    rate: number;
  };
  activityLog: StudentActivity[];
  notes: AdminNote[];
}

interface StudentActivity {
  id: string;
  type:
    | 'lesson_completed'
    | 'assignment_submitted'
    | 'quiz_passed'
    | 'login'
    | 'enrollment';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface AdminNote {
  id: string;
  content: string;
  createdBy: { id: string; name: string };
  createdAt: string;
  isPrivate: boolean;
}
```

---

## Endpoints

### Student List

#### 1. GET `/admin/students`

**Description:** Get paginated list of students with filters

**Query Parameters:**

| Param          | Type          | Required | Description                  |
| -------------- | ------------- | -------- | ---------------------------- |
| status         | StudentStatus | No       | Filter by status             |
| search         | string        | No       | Search by name, email, phone |
| sortBy         | string        | No       | Sort field                   |
| sortOrder      | string        | No       | "asc" or "desc"              |
| hasEnrollments | boolean       | No       | Only with enrollments        |
| isAtRisk       | boolean       | No       | Only at-risk students        |
| page           | number        | No       | Page number                  |
| limit          | number        | No       | Items per page               |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "student-1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+6281234567890",
      "avatar": "https://example.com/john.jpg",
      "status": "active",
      "enrollments": {
        "total": 3,
        "active": 2,
        "completed": 1
      },
      "progress": {
        "avgCompletion": 65,
        "totalHours": 45,
        "lessonsCompleted": 25
      },
      "gamification": {
        "xp": 1500,
        "level": 5,
        "streak": 7,
        "badges": 12
      },
      "lastActiveAt": "2025-12-14T10:00:00Z",
      "createdAt": "2025-06-01T10:00:00Z",
      "enrolledCourses": [
        {
          "courseId": "course-1",
          "courseName": "101 React Native",
          "className": "RN101 - Batch 1",
          "progress": 55,
          "status": "active"
        }
      ]
    }
  ],
  "meta": {
    "total": 500,
    "page": 1,
    "limit": 20,
    "totalPages": 25
  }
}
```

---

#### 2. GET `/admin/students/stats`

**Description:** Get student statistics

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total": 500,
    "active": 450,
    "inactive": 40,
    "suspended": 10,
    "atRisk": 25,
    "newThisMonth": 45,
    "avgProgress": 62,
    "avgXp": 1200
  }
}
```

---

#### 3. GET `/admin/students/at-risk`

**Description:** Get students at risk (inactive, low progress)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "student-15",
      "name": "Jane Inactive",
      "email": "jane@example.com",
      "riskReason": "No activity for 14 days",
      "lastActiveAt": "2025-12-01T10:00:00Z",
      "progress": 25,
      "className": "RN101 - Batch 1",
      "instructorName": "Dr. Smith"
    }
  ]
}
```

---

### Student Detail

#### 4. GET `/admin/students/:id`

**Description:** Get detailed student information

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "student-1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+6281234567890",
    "avatar": "...",
    "status": "active",
    "enrollments": { "total": 3, "active": 2, "completed": 1 },
    "progress": { "avgCompletion": 65, "totalHours": 45, "lessonsCompleted": 25 },
    "gamification": { "xp": 1500, "level": 5, "streak": 7, "badges": 12 },
    "payments": { "total": 9000000, "verified": 9000000, "pending": 0 },
    "assignments": { "submitted": 15, "graded": 14, "pending": 1, "avgScore": 85 },
    "attendance": { "present": 18, "absent": 2, "late": 1, "rate": 90 },
    "activityLog": [
      {
        "id": "activity-1",
        "type": "lesson_completed",
        "title": "Completed: Navigation",
        "description": "Completed lesson 'Navigation Deep Dive'",
        "timestamp": "2025-12-14T10:00:00Z"
      }
    ],
    "notes": [
      {
        "id": "note-1",
        "content": "Follow-up for payment reminder sent",
        "createdBy": { "id": "staff-1", "name": "Admin Staff" },
        "createdAt": "2025-12-10T10:00:00Z",
        "isPrivate": true
      }
    ],
    "enrolledCourses": [...],
    "lastActiveAt": "2025-12-14T10:00:00Z",
    "createdAt": "2025-06-01T10:00:00Z"
  }
}
```

---

#### 5. GET `/admin/students/:id/enrollments`

**Description:** Get student's enrollment history

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "enrollment-1",
      "courseId": "course-1",
      "courseName": "101 React Native",
      "classId": "class-1",
      "className": "RN101 - Batch 1",
      "instructorName": "Dr. Smith",
      "packageType": 20,
      "progress": 55,
      "status": "active",
      "enrolledAt": "2025-10-01T10:00:00Z",
      "payment": {
        "amount": 3000000,
        "status": "verified",
        "paidAt": "2025-10-01T08:00:00Z"
      }
    }
  ]
}
```

---

#### 6. GET `/admin/students/:id/activity`

**Description:** Get student's activity log

**Query Parameters:**

| Param     | Type   | Required | Description             |
| --------- | ------ | -------- | ----------------------- |
| type      | string | No       | Filter by activity type |
| startDate | string | No       | From date               |
| endDate   | string | No       | To date                 |
| page      | number | No       | Page number             |
| limit     | number | No       | Items per page          |

---

### Student Actions

#### 7. PATCH `/admin/students/:id/status`

**Description:** Update student status

**Request Body:**

```json
{
  "status": "suspended",
  "reason": "Payment overdue"
}
```

---

#### 8. POST `/admin/students/:id/notes`

**Description:** Add admin note to student

**Request Body:**

```json
{
  "content": "Called for follow-up, will pay next week",
  "isPrivate": true
}
```

---

#### 9. DELETE `/admin/students/:id/notes/:noteId`

**Description:** Delete admin note

---

#### 10. POST `/admin/students/:id/send-notification`

**Description:** Send notification to student

**Request Body:**

```json
{
  "type": "email",
  "template": "payment_reminder",
  "customMessage": "Please complete your payment"
}
```

---

### Bulk Operations

#### 11. POST `/admin/students/bulk/status`

**Description:** Bulk update student status

**Request Body:**

```json
{
  "studentIds": ["student-1", "student-2", "student-3"],
  "status": "inactive",
  "reason": "Course ended"
}
```

---

#### 12. POST `/admin/students/export`

**Description:** Export students as CSV/Excel

**Request Body:**

```json
{
  "format": "xlsx",
  "filters": {
    "status": "active",
    "hasEnrollments": true
  },
  "columns": ["name", "email", "phone", "progress", "xp"]
}
```

---

## Error Codes

| Code                  | HTTP Status | Description                         |
| --------------------- | ----------- | ----------------------------------- |
| `STUDENT_NOT_FOUND`   | 404         | Student not found                   |
| `INVALID_STATUS`      | 400         | Invalid status value                |
| `NOTE_NOT_FOUND`      | 404         | Note not found                      |
| `BULK_LIMIT_EXCEEDED` | 400         | Too many students in bulk operation |

---

## Implementation Checklist

### Backend

- [ ] Student list with filters
- [ ] Student stats endpoint
- [ ] At-risk students endpoint
- [ ] Student detail endpoint
- [ ] Enrollment history endpoint
- [ ] Activity log endpoint
- [ ] Status update endpoint
- [ ] Notes CRUD
- [ ] Notification sending
- [ ] Bulk operations
- [ ] Export functionality
- [ ] Write unit tests

### Frontend

- [x] Students list page
- [x] Student detail page
- [x] Enrollment history tab
- [x] Activity log tab
- [x] Notes panel
- [x] Status update dialog
- [x] Bulk actions toolbar
- [x] Export dialog
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
