# API Contract: Activity Logs

**Module:** Activity Logs (PRD 21.5)  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for user activity logging and audit trail. Tracks all significant actions in the system for security, compliance, and debugging.

**Base URL:** `{API_BASE_URL}/activity-logs`

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
type ActivityCategory =
  | 'auth'
  | 'enrollment'
  | 'payment'
  | 'course'
  | 'class'
  | 'lesson'
  | 'assignment'
  | 'user'
  | 'system';

type ActivitySeverity = 'info' | 'warning' | 'error' | 'success';
type UserRole = 'student' | 'instructor' | 'staff' | 'super_admin';

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  userAvatar?: string;
  category: ActivityCategory;
  action: string; // e.g., "login", "create_enrollment"
  description: string; // Human-readable description
  resource: {
    type: string; // e.g., "enrollment", "payment"
    id: string;
    name: string;
  };
  severity: ActivitySeverity;
  metadata?: Record<string, unknown>; // Additional context
  ipAddress: string;
  userAgent?: string;
  location?: string; // GeoIP location
  timestamp: string;
  duration?: number; // in ms, for performance tracking
}

interface ActivityLogFilters {
  category?: ActivityCategory;
  severity?: ActivitySeverity;
  userId?: string;
  userRole?: UserRole;
  action?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ActivityStats {
  totalLogs: number;
  byCategory: Record<ActivityCategory, number>;
  bySeverity: Record<ActivitySeverity, number>;
  topUsers: { userId: string; userName: string; count: number }[];
  recentErrors: ActivityLog[];
}
```

---

## Endpoints

### 1. GET `/activity-logs`

**Description:** Get paginated activity logs

**Query Parameters:**

| Param     | Type             | Required | Description        |
| --------- | ---------------- | -------- | ------------------ |
| category  | ActivityCategory | No       | Filter by category |
| severity  | ActivitySeverity | No       | Filter by severity |
| userId    | string           | No       | Filter by user     |
| userRole  | UserRole         | No       | Filter by role     |
| action    | string           | No       | Filter by action   |
| startDate | string           | No       | From date          |
| endDate   | string           | No       | To date            |
| search    | string           | No       | Search description |
| page      | number           | No       | Page number        |
| limit     | number           | No       | Items per page     |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "log-1",
      "userId": "user-1",
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "userRole": "staff",
      "category": "enrollment",
      "action": "create_enrollment",
      "description": "Created enrollment for Jane Student in RN101 - Batch 1",
      "resource": {
        "type": "enrollment",
        "id": "enrollment-123",
        "name": "Jane Student - RN101"
      },
      "severity": "success",
      "metadata": {
        "studentId": "student-1",
        "classId": "class-1",
        "amount": 3000000
      },
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "location": "Jakarta, ID",
      "timestamp": "2025-12-15T10:00:00Z",
      "duration": 245
    }
  ],
  "meta": { "total": 5000, "page": 1, "limit": 50, "totalPages": 100 }
}
```

---

### 2. GET `/activity-logs/:id`

**Description:** Get single activity log detail

---

### 3. GET `/activity-logs/stats`

**Description:** Get activity statistics

**Query Parameters:**

| Param  | Type   | Required | Description            |
| ------ | ------ | -------- | ---------------------- |
| period | string | No       | "day", "week", "month" |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalLogs": 50000,
    "byCategory": {
      "auth": 15000,
      "enrollment": 8000,
      "payment": 5000,
      "course": 3000,
      "class": 7000,
      "lesson": 10000,
      "assignment": 2000,
      "user": 1000,
      "system": 0
    },
    "bySeverity": {
      "info": 40000,
      "success": 8000,
      "warning": 1500,
      "error": 500
    },
    "topUsers": [
      { "userId": "staff-1", "userName": "Admin Staff", "count": 1500 }
    ],
    "recentErrors": [
      {
        "id": "log-err-1",
        "action": "payment_verify",
        "description": "...",
        "timestamp": "..."
      }
    ]
  }
}
```

---

### 4. GET `/activity-logs/user/:userId`

**Description:** Get activity logs for specific user

---

### 5. GET `/activity-logs/export`

**Description:** Export activity logs as CSV

**Query Parameters:** Same as GET `/activity-logs` + `format` (csv/xlsx)

---

### 6. POST `/activity-logs`

**Description:** Create activity log (internal API, called by services)

**Request Body:**

```json
{
  "userId": "user-1",
  "category": "enrollment",
  "action": "create_enrollment",
  "description": "Created enrollment...",
  "resource": { "type": "enrollment", "id": "enr-1", "name": "..." },
  "severity": "success",
  "metadata": {}
}
```

---

## Common Actions

| Category   | Actions                                                                              |
| ---------- | ------------------------------------------------------------------------------------ |
| auth       | `login`, `logout`, `password_reset`, `password_change`, `token_refresh`              |
| enrollment | `create_enrollment`, `update_enrollment`, `cancel_enrollment`, `transfer_enrollment` |
| payment    | `create_payment`, `verify_payment`, `reject_payment`, `refund_payment`               |
| course     | `create_course`, `update_course`, `publish_course`, `archive_course`                 |
| class      | `create_class`, `update_class`, `start_class`, `complete_class`                      |
| lesson     | `unlock_lesson`, `complete_lesson`, `complete_exercise`                              |
| assignment | `submit_assignment`, `grade_assignment`                                              |
| user       | `create_user`, `update_user`, `delete_user`, `change_role`                           |
| system     | `config_change`, `backup`, `restore`                                                 |

---

## Implementation Checklist

### Backend

- [ ] Activity logs CRUD
- [ ] Automatic logging middleware
- [ ] Log aggregation for stats
- [ ] Export functionality
- [ ] Retention policy (archive old logs)
- [ ] GeoIP lookup for location
- [ ] Write unit tests

### Frontend

- [x] Activity logs page
- [x] Filters & search
- [x] Log detail modal
- [x] Stats dashboard
- [x] Export button
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
