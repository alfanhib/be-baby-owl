# API Contract: Student Classes

**Module:** Student Classes  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

Student-facing API endpoints for viewing enrolled classes, class details, and progress. These endpoints are specifically for the student role.

**Base URL:** `{API_BASE_URL}`

---

## Authentication

All endpoints require Bearer token:

```
Authorization: Bearer {accessToken}
```

**Required Roles:** `student` (own data only)

---

## Types

```typescript
interface StudentClassEnrollment {
  id: string; // Enrollment ID
  className: string;
  course: {
    id: string;
    title: string;
    coverImage?: string;
  };
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  type: 'group' | 'private';
  packageType: number; // Number of meetings purchased
  lessonLimit: number; // Max lessons accessible (= packageType)
  lessonsUnlocked: number; // Lessons unlocked by instructor
  lessonsCompleted: number; // Lessons completed by student
  progress: number; // 0-100 percentage
  schedule: {
    days: string[]; // e.g., ["Monday", "Thursday"]
    time: string; // e.g., "19:00-21:00"
  };
  startDate: string; // ISO date
  endDate?: string; // ISO date (for completed classes)
  status: 'active' | 'completed' | 'paused';
  classmates?: {
    // Only for group classes
    id: string;
    name: string;
    avatar?: string;
  }[];
  nextLesson?: {
    // Next lesson to complete
    id: string;
    title: string;
    estimatedDuration: number; // in minutes
  };
}

interface LessonAccessCheck {
  canAccess: boolean;
  reason?: string; // If canAccess is false
  unlocksOn?: string; // Hint for when it might unlock
}
```

---

## Endpoints

### 1. GET `/students/:studentId/classes`

**Description:** Get all classes for a student

**Path Parameters:**

| Param     | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| studentId | string | Yes      | Student user ID |

**Query Parameters:**

| Param  | Type   | Required | Description                                 |
| ------ | ------ | -------- | ------------------------------------------- |
| status | string | No       | Filter by status: active, completed, paused |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Student classes fetched successfully",
  "data": [
    {
      "id": "enrollment-1",
      "className": "RN101 - Batch 1",
      "course": {
        "id": "course-1",
        "title": "101 React Native",
        "coverImage": "/images/courses/react-native.png"
      },
      "instructor": {
        "id": "instructor-1",
        "name": "Dr. Smith",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Smith"
      },
      "type": "group",
      "packageType": 20,
      "lessonLimit": 20,
      "lessonsUnlocked": 8,
      "lessonsCompleted": 5,
      "progress": 25,
      "schedule": {
        "days": ["Monday", "Thursday"],
        "time": "19:00-21:00"
      },
      "startDate": "2025-11-01",
      "endDate": null,
      "status": "active",
      "classmates": [
        {
          "id": "student-2",
          "name": "Jane Student",
          "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
        }
      ],
      "nextLesson": {
        "id": "lesson-9",
        "title": "React Native Navigation",
        "estimatedDuration": 45
      }
    }
  ]
}
```

**Authorization:**

- Student can only fetch their own classes
- Staff/Admin can fetch any student's classes

---

### 2. GET `/students/:studentId/classes/active`

**Description:** Get only active (in-progress) classes for a student

**Path Parameters:**

| Param     | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| studentId | string | Yes      | Student user ID |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Active classes fetched successfully",
  "data": [
    {
      "id": "enrollment-1",
      "className": "RN101 - Batch 1",
      "course": {
        "id": "course-1",
        "title": "101 React Native",
        "coverImage": "/images/courses/react-native.png"
      },
      "instructor": {
        "id": "instructor-1",
        "name": "Dr. Smith",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Smith"
      },
      "type": "group",
      "packageType": 20,
      "lessonLimit": 20,
      "lessonsUnlocked": 8,
      "lessonsCompleted": 5,
      "progress": 25,
      "schedule": {
        "days": ["Monday", "Thursday"],
        "time": "19:00-21:00"
      },
      "startDate": "2025-11-01",
      "status": "active",
      "classmates": [],
      "nextLesson": {
        "id": "lesson-9",
        "title": "React Native Navigation",
        "estimatedDuration": 45
      }
    }
  ]
}
```

---

### 3. GET `/students/:studentId/classes/completed`

**Description:** Get only completed classes for a student

**Path Parameters:**

| Param     | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| studentId | string | Yes      | Student user ID |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Completed classes fetched successfully",
  "data": [
    {
      "id": "enrollment-3",
      "className": "UI/UX Design - Batch 2",
      "course": {
        "id": "course-3",
        "title": "UI/UX Design Fundamentals",
        "coverImage": "/images/courses/ui-ux.png"
      },
      "instructor": {
        "id": "instructor-3",
        "name": "Sarah Designer",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
      },
      "type": "group",
      "packageType": 10,
      "lessonLimit": 10,
      "lessonsUnlocked": 10,
      "lessonsCompleted": 10,
      "progress": 100,
      "schedule": {
        "days": ["Wednesday"],
        "time": "18:00-20:00"
      },
      "startDate": "2025-09-01",
      "endDate": "2025-11-30",
      "status": "completed",
      "classmates": []
    }
  ]
}
```

---

### 4. GET `/classes/:classId/detail`

**Description:** Get detailed class information for a student

**Path Parameters:**

| Param   | Type   | Required | Description         |
| ------- | ------ | -------- | ------------------- |
| classId | string | Yes      | Class/Enrollment ID |

**Query Parameters:**

| Param     | Type   | Required | Description     |
| --------- | ------ | -------- | --------------- |
| studentId | string | Yes      | Student user ID |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Class detail fetched successfully",
  "data": {
    "id": "enrollment-1",
    "className": "RN101 - Batch 1",
    "course": {
      "id": "course-1",
      "title": "101 React Native",
      "coverImage": "/images/courses/react-native.png"
    },
    "instructor": {
      "id": "instructor-1",
      "name": "Dr. Smith",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Smith"
    },
    "type": "group",
    "packageType": 20,
    "lessonLimit": 20,
    "lessonsUnlocked": 8,
    "lessonsCompleted": 5,
    "progress": 25,
    "schedule": {
      "days": ["Monday", "Thursday"],
      "time": "19:00-21:00"
    },
    "startDate": "2025-11-01",
    "status": "active",
    "classmates": [
      {
        "id": "student-2",
        "name": "Jane Student",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
      },
      {
        "id": "student-3",
        "name": "Bob Learner",
        "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob"
      }
    ],
    "nextLesson": {
      "id": "lesson-9",
      "title": "React Native Navigation",
      "estimatedDuration": 45
    }
  }
}
```

**Errors:**

- `404 Not Found` - Class not found or student not enrolled

---

### 5. GET `/students/:studentId/classes/:classId/lessons/:lessonId/access`

**Description:** Check if student can access a specific lesson

**Path Parameters:**

| Param     | Type   | Required | Description         |
| --------- | ------ | -------- | ------------------- |
| studentId | string | Yes      | Student user ID     |
| classId   | string | Yes      | Class/Enrollment ID |
| lessonId  | string | Yes      | Lesson ID           |

**Response (200 OK) - Can Access:**

```json
{
  "success": true,
  "message": "Access check completed",
  "data": {
    "canAccess": true
  }
}
```

**Response (200 OK) - Cannot Access:**

```json
{
  "success": true,
  "message": "Access check completed",
  "data": {
    "canAccess": false,
    "reason": "Lesson not yet unlocked by instructor",
    "unlocksOn": "Contact your instructor"
  }
}
```

**Possible Reasons:**

- `"Not enrolled in this class"` - Student is not enrolled
- `"Lesson not yet unlocked by instructor"` - Instructor hasn't unlocked
- `"Package limit reached"` - Lesson exceeds purchased package

---

## Error Codes

| Code                     | HTTP Status | Description                           |
| ------------------------ | ----------- | ------------------------------------- |
| `CLASS_NOT_FOUND`        | 404         | Class not found                       |
| `NOT_ENROLLED`           | 403         | Student is not enrolled in this class |
| `LESSON_LOCKED`          | 403         | Lesson is not unlocked yet            |
| `PACKAGE_LIMIT_EXCEEDED` | 403         | Lesson exceeds package limit          |

---

## Authorization Rules

1. Students can only access their own class data
2. Token must contain matching `userId`
3. Staff and Super Admin can access any student's data
4. Instructors can access data for students in their classes

---

## Implementation Checklist

### Backend

- [ ] Create endpoint for student classes list
- [ ] Create endpoint for active classes
- [ ] Create endpoint for completed classes
- [ ] Create endpoint for class detail
- [ ] Create endpoint for lesson access check
- [ ] Implement authorization middleware
- [ ] Add caching for frequently accessed data
- [ ] Write unit tests

### Frontend

- [x] My Classes widget on dashboard
- [x] Classes list page
- [x] Class detail page
- [x] useStudentClasses hook
- [x] useStudentActiveClasses hook
- [x] useStudentCompletedClasses hook
- [x] useStudentClassDetail hook

---

**Last Updated:** December 15, 2025
