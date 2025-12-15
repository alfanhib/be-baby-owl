# API Contract: Class Management

**Module:** Class Management  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for managing classes (cohorts). Classes are instances of courses with assigned instructors and students. Supports group classes (2-20 students) and private classes (1 student).

**Base URL:** `{API_BASE_URL}/classes`

---

## Authentication

All endpoints require Bearer token:

```
Authorization: Bearer {accessToken}
```

**Required Roles:** `staff`, `super_admin` (CRUD), `instructor` (own classes - read/update)

---

## Types

```typescript
type ClassType = 'group' | 'private';
type ClassStatus = 'draft' | 'active' | 'completed' | 'cancelled';

interface MeetingStats {
  total: number; // Total meetings based on package
  scheduled: number; // Meetings that have been scheduled
  completed: number; // Meetings that occurred
  cancelled: number; // Cancelled meetings
  remaining: number; // total - scheduled
}

interface Class {
  id: string;
  name: string;
  course: {
    id: string;
    title: string;
  };
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  type: ClassType;
  status: ClassStatus;
  totalMeetings: number; // Package: number of meetings purchased
  maxStudents: number; // Capacity (group: 2-20, private: 1)
  currentStudents: number;
  meetingStats: MeetingStats;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ClassFilters {
  status?: ClassStatus;
  type?: ClassType;
  courseId?: string;
  instructorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface ClassStats {
  total: number;
  byStatus: {
    draft: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  byType: {
    group: number;
    private: number;
  };
  totalStudents: number;
  totalMeetings: number;
}

interface CreateClassPayload {
  name: string;
  courseId: string;
  instructorId: string;
  type: ClassType;
  totalMeetings: number; // Package size (10, 15, 20, 30, 50, etc.)
  maxStudents: number;
  description?: string;
}

interface UpdateClassPayload {
  name?: string;
  instructorId?: string;
  totalMeetings?: number; // Can add meetings for private classes
  maxStudents?: number;
  description?: string;
  status?: ClassStatus;
}
```

---

## Endpoints

### Class CRUD

#### 1. GET `/classes`

**Description:** Get paginated list of classes with filters

**Query Parameters:**

| Param        | Type        | Required | Description                  |
| ------------ | ----------- | -------- | ---------------------------- |
| status       | ClassStatus | No       | Filter by status             |
| type         | ClassType   | No       | Filter by type               |
| courseId     | string      | No       | Filter by course             |
| instructorId | string      | No       | Filter by instructor         |
| search       | string      | No       | Search by name               |
| page         | number      | No       | Page number (default: 1)     |
| limit        | number      | No       | Items per page (default: 10) |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Classes fetched successfully",
  "data": [
    {
      "id": "class-1",
      "name": "RN101 - Batch 1",
      "course": {
        "id": "course-1",
        "title": "101 React Native"
      },
      "instructor": {
        "id": "instructor-1",
        "name": "Dr. Smith",
        "avatar": "https://example.com/avatars/smith.jpg"
      },
      "type": "group",
      "status": "active",
      "totalMeetings": 20,
      "maxStudents": 15,
      "currentStudents": 12,
      "meetingStats": {
        "total": 20,
        "scheduled": 10,
        "completed": 8,
        "cancelled": 0,
        "remaining": 10
      },
      "description": "Monday & Thursday batch",
      "createdAt": "2025-10-01T10:00:00Z",
      "updatedAt": "2025-12-01T08:30:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

#### 2. GET `/classes/:id`

**Description:** Get single class by ID

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Class fetched successfully",
  "data": {
    "id": "class-1",
    "name": "RN101 - Batch 1",
    "course": {
      "id": "course-1",
      "title": "101 React Native"
    },
    "instructor": {
      "id": "instructor-1",
      "name": "Dr. Smith",
      "avatar": "https://example.com/avatars/smith.jpg"
    },
    "type": "group",
    "status": "active",
    "totalMeetings": 20,
    "maxStudents": 15,
    "currentStudents": 12,
    "meetingStats": {
      "total": 20,
      "scheduled": 10,
      "completed": 8,
      "cancelled": 0,
      "remaining": 10
    },
    "description": "Monday & Thursday batch",
    "createdAt": "2025-10-01T10:00:00Z",
    "updatedAt": "2025-12-01T08:30:00Z"
  }
}
```

---

#### 3. GET `/classes/stats`

**Description:** Get class statistics

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Class stats fetched successfully",
  "data": {
    "total": 50,
    "byStatus": {
      "draft": 5,
      "active": 30,
      "completed": 12,
      "cancelled": 3
    },
    "byType": {
      "group": 35,
      "private": 15
    },
    "totalStudents": 450,
    "totalMeetings": 1200
  }
}
```

---

#### 4. POST `/classes`

**Description:** Create a new class

**Request Body:**

```json
{
  "name": "RN101 - Batch 2",
  "courseId": "course-1",
  "instructorId": "instructor-1",
  "type": "group",
  "totalMeetings": 20,
  "maxStudents": 15,
  "description": "Tuesday & Friday batch"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Class created successfully",
  "data": {
    "id": "class-new",
    "name": "RN101 - Batch 2",
    "status": "draft",
    ...
  }
}
```

**Validation Rules:**

- `name`: Required, min 3 chars
- `courseId`: Required, must exist
- `instructorId`: Required, must be instructor role
- `type`: Required, "group" or "private"
- `totalMeetings`: Required, min 1
- `maxStudents`: Required, 1 for private, 2-20 for group

---

#### 5. PATCH `/classes/:id`

**Description:** Update class details

**Request Body:**

```json
{
  "name": "RN101 - Batch 2 (Updated)",
  "instructorId": "instructor-2",
  "totalMeetings": 25,
  "description": "Updated description"
}
```

**Notes:**

- `totalMeetings` can only be increased (not decreased)
- Changing instructor notifies students

---

#### 6. PATCH `/classes/:id/status`

**Description:** Update class status only

**Request Body:**

```json
{
  "status": "active"
}
```

**Status Transitions:**

- `draft` → `active` (when ready to start)
- `active` → `completed` (when all meetings done)
- `active` → `cancelled` (cancel class)
- `draft` → `cancelled`

---

#### 7. DELETE `/classes/:id`

**Description:** Delete a class (soft delete)

**Notes:**

- Cannot delete classes with active enrollments
- Can only delete `draft` or `cancelled` classes

---

### Class Roster

#### 8. GET `/classes/:id/roster`

**Description:** Get students enrolled in class

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Class roster fetched successfully",
  "data": {
    "classId": "class-1",
    "className": "RN101 - Batch 1",
    "capacity": {
      "current": 12,
      "max": 15
    },
    "students": [
      {
        "id": "student-1",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://example.com/avatars/john.jpg",
        "enrollmentId": "enrollment-1",
        "enrolledAt": "2025-10-01T10:00:00Z",
        "progress": {
          "lessonsCompleted": 5,
          "lessonsUnlocked": 8,
          "percentage": 25
        },
        "attendance": {
          "present": 7,
          "absent": 1,
          "late": 0,
          "rate": 87.5
        },
        "status": "active"
      }
    ]
  }
}
```

---

#### 9. POST `/classes/:id/roster`

**Description:** Add student to class (create enrollment)

**Request Body:**

```json
{
  "studentId": "student-new",
  "amount": 3000000,
  "paymentStatus": "pending",
  "notes": "Enrolled via phone"
}
```

**Notes:**

- Creates enrollment record
- Validates capacity not exceeded
- For group classes, cannot add after class started

---

#### 10. DELETE `/classes/:id/roster/:studentId`

**Description:** Remove student from class

**Notes:**

- Sets enrollment status to "cancelled"
- Notifies student

---

### Lookups

#### 11. GET `/classes/lookup/courses`

**Description:** Get courses for class creation dropdown

**Response:**

```json
{
  "success": true,
  "data": [
    { "id": "course-1", "title": "101 React Native" },
    { "id": "course-2", "title": "Advanced TypeScript" }
  ]
}
```

---

#### 12. GET `/classes/lookup/instructors`

**Description:** Get instructors for class creation dropdown

**Response:**

```json
{
  "success": true,
  "data": [
    { "id": "instructor-1", "name": "Dr. Smith", "avatar": "..." },
    { "id": "instructor-2", "name": "Prof. Johnson", "avatar": "..." }
  ]
}
```

---

## Business Rules

### Group Classes

- Capacity: 2-20 students
- All students must enroll BEFORE class starts
- Cannot add students mid-class
- All students share same package (totalMeetings)
- Cannot upgrade package

### Private Classes

- Capacity: 1 student
- Can start anytime
- Can add more meetings (upgrade)
- Flexible scheduling

### Package = Meetings = Lessons

- 1 Meeting = 1 Lesson (fixed ratio)
- `totalMeetings` = max lessons that can be unlocked
- Instructor unlocks lessons after conducting meeting

---

## Error Codes

| Code                        | HTTP Status | Description                          |
| --------------------------- | ----------- | ------------------------------------ |
| `CLASS_NOT_FOUND`           | 404         | Class not found                      |
| `COURSE_NOT_FOUND`          | 404         | Course not found                     |
| `INSTRUCTOR_NOT_FOUND`      | 404         | Instructor not found                 |
| `CLASS_FULL`                | 409         | Class at max capacity                |
| `CLASS_STARTED`             | 409         | Cannot add to started group class    |
| `HAS_ENROLLMENTS`           | 409         | Cannot delete class with enrollments |
| `INVALID_STATUS_TRANSITION` | 400         | Invalid status change                |
| `CANNOT_DECREASE_MEETINGS`  | 400         | Cannot reduce meeting count          |

---

## Role-Based Access

| Endpoint                 | staff | super_admin | instructor   |
| ------------------------ | ----- | ----------- | ------------ |
| GET /classes             | ✅    | ✅          | ✅ (own)     |
| GET /classes/:id         | ✅    | ✅          | ✅ (own)     |
| GET /classes/stats       | ✅    | ✅          | ❌           |
| POST /classes            | ✅    | ✅          | ❌           |
| PATCH /classes/:id       | ❌    | ✅          | ✅ (limited) |
| DELETE /classes/:id      | ❌    | ✅          | ❌           |
| GET /classes/:id/roster  | ✅    | ✅          | ✅ (own)     |
| POST /classes/:id/roster | ✅    | ✅          | ❌           |

---

## Implementation Checklist

### Backend

- [ ] Class CRUD endpoints
- [ ] Class roster endpoints
- [ ] Lookup endpoints
- [ ] Capacity validation
- [ ] Status transition validation
- [ ] Meeting stats calculation
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Class list page
- [x] Class detail page
- [x] Class form (create/edit)
- [x] Class roster page
- [x] Add student to class
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
