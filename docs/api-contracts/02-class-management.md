# API Contract: Class Management (Student Side)

**Version:** 1.0  
**Date:** December 2, 2025  
**Module:** M12-M15 - Class Management

---

## Overview

Class management endpoints for students to view their enrolled classes, track package progress, and access unlocked lessons.

---

## 1. Get Student's Classes

**Endpoint:** `GET /api/students/{studentId}/classes`

**Description:** Retrieve all classes a student is enrolled in.

**Authentication:** Required (JWT Token)

**Authorization:** Student can only view their own classes, Instructors/Staff/Super Admin can view any student's classes.

### Request

```http
GET /api/students/123e4567-e89b-12d3-a456-426614174000/classes HTTP/1.1
Authorization: Bearer {jwt_token}
```

**Query Parameters:**

| Parameter | Type   | Required | Description                                                           |
| --------- | ------ | -------- | --------------------------------------------------------------------- |
| status    | string | No       | Filter by class status: `active`, `completed`, `paused`. Default: all |
| limit     | number | No       | Number of results per page. Default: 10                               |
| offset    | number | No       | Pagination offset. Default: 0                                         |

### Response Success (200 OK)

```json
{
  "success": true,
  "data": {
    "classes": [
      {
        "id": "class-123",
        "className": "RN101 - Batch 1",
        "course": {
          "id": "course-1",
          "title": "101 React Native",
          "coverImage": "https://cdn.example.com/courses/rn101.png"
        },
        "instructor": {
          "id": "instructor-1",
          "name": "Dr. Smith Instructor",
          "avatar": "https://cdn.example.com/avatars/smith.png"
        },
        "type": "group",
        "packageType": "20x",
        "lessonLimit": 20,
        "lessonsUnlocked": 8,
        "lessonsCompleted": 5,
        "progress": 25,
        "schedule": {
          "days": ["Monday", "Thursday"],
          "time": "19:00-21:00"
        },
        "startDate": "2025-11-01T00:00:00Z",
        "endDate": "2026-01-31T23:59:59Z",
        "status": "active",
        "classmates": [
          {
            "id": "student-2",
            "name": "Jane Student",
            "avatar": "https://cdn.example.com/avatars/jane.png"
          }
        ],
        "nextLesson": {
          "id": "lesson-9",
          "title": "React Native Navigation",
          "estimatedDuration": 45
        }
      }
    ],
    "pagination": {
      "total": 3,
      "limit": 10,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

### Response Error

**401 Unauthorized:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only view your own classes"
  }
}
```

---

## 2. Get Class Detail

**Endpoint:** `GET /api/classes/{classId}`

**Description:** Get detailed information about a specific class.

**Authentication:** Required (JWT Token)

**Authorization:** Student must be enrolled in the class, or be an Instructor/Staff/Super Admin.

### Request

```http
GET /api/classes/class-123 HTTP/1.1
Authorization: Bearer {jwt_token}
```

### Response Success (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "class-123",
    "className": "RN101 - Batch 1",
    "course": {
      "id": "course-1",
      "title": "101 React Native",
      "description": "Learn React Native from scratch",
      "coverImage": "https://cdn.example.com/courses/rn101.png"
    },
    "instructor": {
      "id": "instructor-1",
      "name": "Dr. Smith Instructor",
      "avatar": "https://cdn.example.com/avatars/smith.png",
      "bio": "10+ years teaching React Native"
    },
    "type": "group",
    "packageType": "20x",
    "lessonLimit": 20,
    "lessonsUnlocked": 8,
    "lessonsCompleted": 5,
    "progress": 25,
    "schedule": {
      "days": ["Monday", "Thursday"],
      "time": "19:00-21:00",
      "timezone": "Asia/Jakarta"
    },
    "startDate": "2025-11-01T00:00:00Z",
    "endDate": "2026-01-31T23:59:59Z",
    "status": "active",
    "classmates": [
      {
        "id": "student-2",
        "name": "Jane Student",
        "avatar": "https://cdn.example.com/avatars/jane.png",
        "progress": 30
      }
    ],
    "unlockedLessons": [
      {
        "id": "lesson-1",
        "number": 1,
        "title": "Introduction to React Native",
        "duration": 45,
        "isCompleted": true,
        "completedAt": "2025-11-02T10:30:00Z"
      },
      {
        "id": "lesson-2",
        "number": 2,
        "title": "Setting Up Your Environment",
        "duration": 60,
        "isCompleted": true,
        "completedAt": "2025-11-05T14:20:00Z"
      },
      {
        "id": "lesson-8",
        "number": 8,
        "title": "State Management Basics",
        "duration": 50,
        "isCompleted": false,
        "completedAt": null
      }
    ],
    "nextLesson": {
      "id": "lesson-9",
      "title": "React Native Navigation",
      "estimatedDuration": 45,
      "willUnlockOn": null
    }
  }
}
```

### Response Error

**404 Not Found:**

```json
{
  "success": false,
  "error": {
    "code": "CLASS_NOT_FOUND",
    "message": "Class not found"
  }
}
```

**403 Forbidden:**

```json
{
  "success": false,
  "error": {
    "code": "NOT_ENROLLED",
    "message": "You are not enrolled in this class"
  }
}
```

---

## 3. Check Lesson Access

**Endpoint:** `GET /api/classes/{classId}/lessons/{lessonId}/access`

**Description:** Check if a student can access a specific lesson in their class.

**Authentication:** Required (JWT Token)

**Authorization:** Student must be enrolled in the class.

### Request

```http
GET /api/classes/class-123/lessons/lesson-9/access HTTP/1.1
Authorization: Bearer {jwt_token}
```

### Response Success (200 OK)

**When Access is Granted:**

```json
{
  "success": true,
  "data": {
    "canAccess": true,
    "lessonId": "lesson-9",
    "unlockedAt": "2025-11-15T09:00:00Z",
    "expiresAt": null
  }
}
```

**When Access is Denied:**

```json
{
  "success": true,
  "data": {
    "canAccess": false,
    "lessonId": "lesson-9",
    "reason": "LESSON_NOT_UNLOCKED",
    "message": "This lesson has not been unlocked by your instructor yet",
    "willUnlockOn": null,
    "remainingLessons": 12
  }
}
```

**When Package Limit Exceeded:**

```json
{
  "success": true,
  "data": {
    "canAccess": false,
    "lessonId": "lesson-21",
    "reason": "PACKAGE_LIMIT_EXCEEDED",
    "message": "You have reached your package limit of 20 lessons",
    "packageType": "20x",
    "lessonsUnlocked": 20,
    "lessonLimit": 20,
    "upgradeRequired": true
  }
}
```

### Response Error

**404 Not Found:**

```json
{
  "success": false,
  "error": {
    "code": "LESSON_NOT_FOUND",
    "message": "Lesson not found in this course"
  }
}
```

---

## 4. Get Active Classes (Shortcut)

**Endpoint:** `GET /api/students/me/classes/active`

**Description:** Get only active classes for the currently authenticated student.

**Authentication:** Required (JWT Token)

**Authorization:** Student only (self)

### Request

```http
GET /api/students/me/classes/active HTTP/1.1
Authorization: Bearer {jwt_token}
```

### Response Success (200 OK)

```json
{
  "success": true,
  "data": {
    "classes": [
      {
        "id": "class-123",
        "className": "RN101 - Batch 1",
        "course": {
          "id": "course-1",
          "title": "101 React Native"
        },
        "progress": 25,
        "nextLesson": {
          "id": "lesson-9",
          "title": "React Native Navigation"
        }
      }
    ],
    "total": 2
  }
}
```

---

## 5. Get Completed Classes

**Endpoint:** `GET /api/students/me/classes/completed`

**Description:** Get all completed classes for the currently authenticated student.

**Authentication:** Required (JWT Token)

**Authorization:** Student only (self)

### Request

```http
GET /api/students/me/classes/completed HTTP/1.1
Authorization: Bearer {jwt_token}
```

### Response Success (200 OK)

```json
{
  "success": true,
  "data": {
    "classes": [
      {
        "id": "class-456",
        "className": "UI/UX Design - Batch 2",
        "course": {
          "id": "course-3",
          "title": "UI/UX Design Fundamentals"
        },
        "progress": 100,
        "completedAt": "2025-11-30T15:00:00Z",
        "certificateUrl": "https://cdn.example.com/certificates/cert-456.pdf"
      }
    ],
    "total": 1
  }
}
```

---

## Error Codes

| Code                     | HTTP Status | Description                               |
| ------------------------ | ----------- | ----------------------------------------- |
| `UNAUTHORIZED`           | 401         | Missing or invalid authentication token   |
| `FORBIDDEN`              | 403         | User doesn't have permission              |
| `CLASS_NOT_FOUND`        | 404         | Class ID doesn't exist                    |
| `LESSON_NOT_FOUND`       | 404         | Lesson ID doesn't exist                   |
| `NOT_ENROLLED`           | 403         | Student is not enrolled in the class      |
| `LESSON_NOT_UNLOCKED`    | 403         | Lesson hasn't been unlocked by instructor |
| `PACKAGE_LIMIT_EXCEEDED` | 403         | Student has reached their package limit   |

---

## Implementation Notes

1. **Package Limit Enforcement:**
   - Backend must check `lessonsUnlocked <= lessonLimit` before allowing access
   - Frontend should display warnings when approaching limit

2. **Caching:**
   - Class list can be cached for 5 minutes
   - Class detail can be cached for 2 minutes
   - Lesson access should NOT be cached (real-time check required)

3. **Pagination:**
   - Default page size: 10 classes
   - Maximum page size: 50 classes

4. **Real-time Updates:**
   - Consider using WebSockets for lesson unlock notifications
   - Alternative: Polling every 30 seconds when on class detail page

5. **Performance:**
   - Use database indexes on:
     - `class_enrollments.student_id`
     - `class_enrollments.class_id`
     - `lesson_unlocks.class_id`

---

**Last Updated:** December 2, 2025  
**Next Review:** After backend implementation
