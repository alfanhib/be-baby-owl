# API Contract: Lesson & Content Delivery

**Module:** Lesson & Content Delivery  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for lesson content delivery, exercise completion, progress tracking, and lesson unlocking. Core of the learning experience.

**Base URL:** `{API_BASE_URL}`

---

## Authentication

All endpoints require Bearer token:

```
Authorization: Bearer {accessToken}
```

---

## Types

```typescript
type ExerciseType =
  | 'video'
  | 'reading'
  | 'quiz'
  | 'assignment'
  | 'material'
  | 'coding';
type ExerciseStatus = 'locked' | 'available' | 'in_progress' | 'completed';
type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

interface LessonDetail {
  id: string;
  title: string;
  description?: string;
  order: number;
  sectionId: string;
  sectionTitle: string;
  courseId: string;
  courseTitle: string;
  estimatedDuration: number; // in minutes
  xpReward: number;
  status: LessonStatus;
  isLocked: boolean;
  unlockedAt?: string;
  completedAt?: string;
  progress: {
    completedExercises: number;
    totalExercises: number;
    percentage: number;
  };
  exercises: Exercise[];
  navigation: {
    previousLesson?: { id: string; title: string };
    nextLesson?: { id: string; title: string; isLocked: boolean };
  };
}

interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  title: string;
  order: number;
  xpReward: number;
  status: ExerciseStatus;
  isCompleted: boolean;
  completedAt?: string;
  content: ExerciseContent; // Varies by type
}

interface ExerciseProgress {
  exerciseId: string;
  studentId: string;
  status: ExerciseStatus;
  startedAt?: string;
  completedAt?: string;
  score?: number; // For quiz/assignment
  attempts?: number; // For quiz
  watchedDuration?: number; // For video (seconds)
  data?: any; // Type-specific progress data
}

interface LessonUnlockRequest {
  classId: string;
  lessonIds: string[]; // Can unlock multiple
}
```

---

## Endpoints

### Lesson Content

#### 1. GET `/classes/:classId/lessons/:lessonId`

**Description:** Get lesson detail with exercises for student in a class

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "lesson-1",
    "title": "Introduction to React Native",
    "description": "Learn the basics of React Native",
    "order": 1,
    "sectionId": "section-1",
    "sectionTitle": "Getting Started",
    "courseId": "course-1",
    "courseTitle": "101 React Native",
    "estimatedDuration": 45,
    "xpReward": 50,
    "status": "in_progress",
    "isLocked": false,
    "unlockedAt": "2025-12-01T10:00:00Z",
    "progress": {
      "completedExercises": 2,
      "totalExercises": 5,
      "percentage": 40
    },
    "exercises": [
      {
        "id": "exercise-1",
        "type": "video",
        "title": "Welcome Video",
        "order": 1,
        "xpReward": 10,
        "status": "completed",
        "isCompleted": true,
        "completedAt": "2025-12-01T10:15:00Z",
        "content": {
          "videoUrl": "https://youtube.com/watch?v=abc123",
          "duration": 300,
          "thumbnail": "https://img.youtube.com/..."
        }
      },
      {
        "id": "exercise-2",
        "type": "reading",
        "title": "What is React Native?",
        "order": 2,
        "xpReward": 10,
        "status": "completed",
        "isCompleted": true,
        "content": {
          "body": "<h2>Introduction</h2><p>React Native is...</p>",
          "estimatedReadTime": 5
        }
      },
      {
        "id": "exercise-3",
        "type": "quiz",
        "title": "Knowledge Check",
        "order": 3,
        "xpReward": 15,
        "status": "available",
        "isCompleted": false,
        "content": {
          "questions": [...],
          "passingScore": 70,
          "allowRetry": true
        }
      }
    ],
    "navigation": {
      "previousLesson": null,
      "nextLesson": {
        "id": "lesson-2",
        "title": "Setting Up Environment",
        "isLocked": false
      }
    }
  }
}
```

**Authorization:**

- Student must be enrolled in the class
- Lesson must be unlocked

---

#### 2. GET `/exercises/:exerciseId`

**Description:** Get single exercise with full content

---

### Progress Tracking

#### 3. POST `/exercises/:exerciseId/start`

**Description:** Mark exercise as started

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Exercise started",
  "data": {
    "exerciseId": "exercise-3",
    "status": "in_progress",
    "startedAt": "2025-12-15T10:00:00Z"
  }
}
```

---

#### 4. POST `/exercises/:exerciseId/complete`

**Description:** Mark exercise as completed

**Request Body (Video):**

```json
{
  "watchedDuration": 300,
  "completed": true
}
```

**Request Body (Reading):**

```json
{
  "completed": true
}
```

**Request Body (Quiz):**

```json
{
  "answers": [
    { "questionId": "q1", "answer": 0 },
    { "questionId": "q2", "answer": [1, 2] },
    { "questionId": "q3", "answer": "true" }
  ]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Exercise completed",
  "data": {
    "exerciseId": "exercise-3",
    "status": "completed",
    "completedAt": "2025-12-15T10:15:00Z",
    "score": 85,
    "passed": true,
    "xpEarned": 15,
    "lessonProgress": {
      "completedExercises": 3,
      "totalExercises": 5,
      "percentage": 60,
      "isLessonComplete": false
    }
  }
}
```

**Side Effects:**

- Awards XP if first completion
- Updates lesson progress
- If all exercises complete → lesson complete → award lesson XP

---

#### 5. GET `/classes/:classId/progress`

**Description:** Get student's progress in a class

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "classId": "class-1",
    "studentId": "student-1",
    "overall": {
      "lessonsCompleted": 5,
      "lessonsUnlocked": 8,
      "totalLessons": 20,
      "percentage": 25,
      "totalXpEarned": 250
    },
    "sections": [
      {
        "id": "section-1",
        "title": "Getting Started",
        "lessonsCompleted": 3,
        "totalLessons": 3,
        "isComplete": true
      },
      {
        "id": "section-2",
        "title": "Core Concepts",
        "lessonsCompleted": 2,
        "totalLessons": 5,
        "isComplete": false
      }
    ],
    "recentActivity": [
      {
        "lessonId": "lesson-5",
        "lessonTitle": "State Management",
        "completedAt": "2025-12-14T15:30:00Z",
        "xpEarned": 50
      }
    ]
  }
}
```

---

### Lesson Unlocking (Instructor)

#### 6. POST `/classes/:classId/lessons/unlock`

**Description:** Unlock lessons for a class (Instructor)

**Request Body:**

```json
{
  "lessonIds": ["lesson-9", "lesson-10"]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "2 lessons unlocked successfully",
  "data": {
    "unlockedLessons": [
      { "id": "lesson-9", "title": "Navigation" },
      { "id": "lesson-10", "title": "API Integration" }
    ],
    "totalUnlocked": 10,
    "lessonLimit": 20,
    "remaining": 10
  }
}
```

**Validation:**

- Cannot exceed package lesson limit
- Only instructor of the class can unlock

**Side Effects:**

- Notifies all students in class
- Updates class progress

---

#### 7. POST `/classes/:classId/lessons/bulk-unlock`

**Description:** Unlock lessons up to a certain lesson (inclusive)

**Request Body:**

```json
{
  "upToLessonId": "lesson-10"
}
```

---

#### 8. GET `/classes/:classId/unlock-status`

**Description:** Get unlock status for a class

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "classId": "class-1",
    "lessonLimit": 20,
    "lessonsUnlocked": 8,
    "remaining": 12,
    "lessons": [
      {
        "id": "lesson-1",
        "title": "Intro",
        "isUnlocked": true,
        "unlockedAt": "2025-12-01"
      },
      {
        "id": "lesson-2",
        "title": "Setup",
        "isUnlocked": true,
        "unlockedAt": "2025-12-03"
      },
      {
        "id": "lesson-9",
        "title": "Navigation",
        "isUnlocked": false,
        "canUnlock": true
      },
      {
        "id": "lesson-10",
        "title": "API",
        "isUnlocked": false,
        "canUnlock": true
      }
    ]
  }
}
```

---

### Video Progress

#### 9. POST `/exercises/:exerciseId/video-progress`

**Description:** Update video watch progress (called periodically)

**Request Body:**

```json
{
  "currentTime": 180,
  "duration": 300,
  "completed": false
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "watchedDuration": 180,
    "watchedPercentage": 60,
    "completed": false
  }
}
```

---

### Coding Exercises

#### 10. POST `/exercises/:exerciseId/run-code`

**Description:** Execute code for coding exercise

**Request Body:**

```json
{
  "code": "print('Hello, World!')",
  "language": "python"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "output": "Hello, World!\n",
    "executionTime": 0.05,
    "memoryUsed": 1024,
    "testResults": [
      {
        "name": "Test 1",
        "passed": true,
        "expected": "Hello",
        "actual": "Hello"
      },
      {
        "name": "Test 2",
        "passed": false,
        "expected": "World",
        "actual": "None"
      }
    ],
    "allTestsPassed": false,
    "passedCount": 1,
    "totalTests": 2
  }
}
```

---

## Error Codes

| Code                     | HTTP Status | Description                        |
| ------------------------ | ----------- | ---------------------------------- |
| `LESSON_NOT_FOUND`       | 404         | Lesson not found                   |
| `LESSON_LOCKED`          | 403         | Lesson is locked                   |
| `EXERCISE_NOT_FOUND`     | 404         | Exercise not found                 |
| `NOT_ENROLLED`           | 403         | Student not enrolled in class      |
| `PACKAGE_LIMIT_EXCEEDED` | 400         | Cannot unlock beyond package limit |
| `ALREADY_COMPLETED`      | 400         | Exercise already completed         |
| `QUIZ_NOT_PASSED`        | 200         | Quiz not passed (with score)       |
| `CODE_EXECUTION_ERROR`   | 400         | Code execution failed              |
| `CODE_TIMEOUT`           | 408         | Code execution timed out           |

---

## Implementation Checklist

### Backend

- [ ] Lesson detail endpoint with exercises
- [ ] Exercise start/complete endpoints
- [ ] Progress tracking (per exercise, lesson, class)
- [ ] Lesson unlock endpoints
- [ ] Video progress tracking
- [ ] Quiz grading logic
- [ ] Coding exercise execution (Pyodide/Docker)
- [ ] XP award system
- [ ] Email notifications
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Lesson detail page
- [x] Exercise renderer (by type)
- [x] Video player with progress
- [x] Quiz component (6 types)
- [x] Reading/material renderer
- [x] Coding exercise editor
- [x] Progress indicators
- [x] Lesson navigation
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
