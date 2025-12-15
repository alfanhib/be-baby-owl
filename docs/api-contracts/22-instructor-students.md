# API Contract: Instructor Student Management

**Module:** Instructor Student Management (PRD 14, 18)  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for instructors to manage and monitor their students. Includes progress tracking, at-risk detection, messaging, and report generation.

**Base URL:** `{API_BASE_URL}/instructor`

---

## Authentication

All endpoints require Bearer token:

```
Authorization: Bearer {accessToken}
```

**Required Roles:** `instructor`

---

## Types

```typescript
type StudentStatus = 'active' | 'inactive' | 'completed' | 'at_risk';
type AssignmentStatus = 'not_submitted' | 'submitted' | 'graded' | 'late';

interface InstructorStudent {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: StudentStatus;
  enrolledAt: string;
  lastActiveAt: string;
  // Progress
  overallProgress: number;
  averageScore: number;
  totalTimeSpent: number; // minutes
  // Classes
  classes: {
    id: string;
    name: string;
    courseName: string;
    progress: number;
    packageType: string;
  }[];
  // Stats
  completedLessons: number;
  totalLessons: number;
  completedExercises: number;
  totalExercises: number;
  submittedAssignments: number;
  totalAssignments: number;
  // Attendance
  attendanceRate: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  sections: {
    sectionId: string;
    sectionTitle: string;
    lessons: {
      lessonId: string;
      lessonTitle: string;
      status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
      completedAt?: string;
      score?: number;
      timeSpent: number;
    }[];
  }[];
  assignments: {
    id: string;
    title: string;
    dueDate?: string;
    status: AssignmentStatus;
    submittedAt?: string;
    score?: number;
    feedback?: string;
  }[];
  quizResults: {
    quizId: string;
    quizTitle: string;
    score: number;
    maxScore: number;
    attempts: number;
    passedAt?: string;
  }[];
}

interface AtRiskStudent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  classId: string;
  className: string;
  riskLevel: 'high' | 'medium' | 'low';
  riskReasons: string[];
  lastActiveAt: string;
  progress: number;
  missedAssignments: number;
  attendanceRate: number;
  suggestedAction: string;
}

interface StudentFilters {
  classId?: string;
  status?: StudentStatus;
  search?: string;
  sortBy?: 'name' | 'progress' | 'lastActive' | 'score';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

---

## Endpoints

### Student List

#### 1. GET `/instructor/students`

**Description:** Get all students assigned to instructor

**Query Parameters:**

| Param     | Type          | Required | Description          |
| --------- | ------------- | -------- | -------------------- |
| classId   | string        | No       | Filter by class      |
| status    | StudentStatus | No       | Filter by status     |
| search    | string        | No       | Search by name/email |
| sortBy    | string        | No       | Sort field           |
| sortOrder | string        | No       | "asc" or "desc"      |
| page      | number        | No       | Page number          |
| limit     | number        | No       | Items per page       |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "student-1",
      "userId": "user-1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+6281234567890",
      "avatar": "https://example.com/john.jpg",
      "status": "active",
      "enrolledAt": "2025-10-01T10:00:00Z",
      "lastActiveAt": "2025-12-14T10:00:00Z",
      "overallProgress": 55,
      "averageScore": 85,
      "totalTimeSpent": 1200,
      "classes": [
        {
          "id": "class-1",
          "name": "RN101 - Batch 1",
          "courseName": "101 React Native",
          "progress": 55,
          "packageType": "20 Meetings"
        }
      ],
      "completedLessons": 8,
      "totalLessons": 20,
      "completedExercises": 24,
      "totalExercises": 60,
      "submittedAssignments": 3,
      "totalAssignments": 4,
      "attendanceRate": 87.5,
      "presentCount": 7,
      "absentCount": 1,
      "lateCount": 0
    }
  ],
  "meta": { "total": 45, "page": 1, "limit": 20, "totalPages": 3 }
}
```

---

#### 2. GET `/instructor/students/:id`

**Description:** Get single student details

---

#### 3. GET `/instructor/students/:id/progress`

**Description:** Get detailed student progress

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "studentId": "student-1",
    "studentName": "John Doe",
    "classId": "class-1",
    "className": "RN101 - Batch 1",
    "sections": [
      {
        "sectionId": "section-1",
        "sectionTitle": "Getting Started",
        "lessons": [
          {
            "lessonId": "lesson-1",
            "lessonTitle": "Introduction",
            "status": "completed",
            "completedAt": "2025-10-05T10:00:00Z",
            "score": 90,
            "timeSpent": 45
          },
          {
            "lessonId": "lesson-2",
            "lessonTitle": "Setup",
            "status": "in_progress",
            "timeSpent": 30
          }
        ]
      }
    ],
    "assignments": [
      {
        "id": "assignment-1",
        "title": "First App Project",
        "dueDate": "2025-12-01T23:59:00Z",
        "status": "graded",
        "submittedAt": "2025-11-30T18:00:00Z",
        "score": 85,
        "feedback": "Good work! Consider improving..."
      }
    ],
    "quizResults": [
      {
        "quizId": "quiz-1",
        "quizTitle": "React Native Basics",
        "score": 8,
        "maxScore": 10,
        "attempts": 2,
        "passedAt": "2025-10-10T10:00:00Z"
      }
    ]
  }
}
```

---

### At-Risk Students

#### 4. GET `/instructor/students/at-risk`

**Description:** Get students who are at risk

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "student-5",
      "name": "Jane Struggling",
      "email": "jane@example.com",
      "avatar": "...",
      "classId": "class-1",
      "className": "RN101 - Batch 1",
      "riskLevel": "high",
      "riskReasons": [
        "No activity for 10 days",
        "2 missed assignments",
        "Attendance rate below 70%"
      ],
      "lastActiveAt": "2025-12-05T10:00:00Z",
      "progress": 25,
      "missedAssignments": 2,
      "attendanceRate": 65,
      "suggestedAction": "Reach out via phone call"
    }
  ]
}
```

---

### Student Communication

#### 5. POST `/instructor/students/:id/message`

**Description:** Send message/notification to student

**Request Body:**

```json
{
  "type": "email",
  "subject": "Check-in: How are you doing?",
  "message": "Hi John, I noticed you haven't been active lately..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "messageId": "msg-123",
    "sentAt": "2025-12-15T10:00:00Z",
    "deliveryStatus": "sent"
  }
}
```

---

#### 6. GET `/instructor/students/:id/messages`

**Description:** Get message history with student

---

### Reports

#### 7. GET `/instructor/students/:id/report`

**Description:** Generate progress report for student

**Query Parameters:**

| Param   | Type   | Required | Description    |
| ------- | ------ | -------- | -------------- |
| format  | string | No       | "json", "pdf"  |
| classId | string | No       | Specific class |

**Response (JSON):**

```json
{
  "success": true,
  "data": {
    "studentId": "student-1",
    "studentName": "John Doe",
    "generatedAt": "2025-12-15T10:00:00Z",
    "period": { "from": "2025-10-01", "to": "2025-12-15" },
    "summary": {
      "overallProgress": 55,
      "averageScore": 85,
      "attendanceRate": 87.5,
      "hoursLearned": 20,
      "lessonsCompleted": 8,
      "assignmentsSubmitted": 3
    },
    "strengths": [
      "Consistent attendance",
      "High quiz scores",
      "Active participation"
    ],
    "areasForImprovement": [
      "Assignment submission timing",
      "Deeper engagement with exercises"
    ],
    "recommendations": [
      "Focus on completing pending exercises",
      "Submit assignments before deadline"
    ]
  }
}
```

---

#### 8. POST `/instructor/students/bulk-report`

**Description:** Generate bulk report for multiple students

**Request Body:**

```json
{
  "studentIds": ["student-1", "student-2", "student-3"],
  "classId": "class-1",
  "format": "pdf"
}
```

---

### Student Stats

#### 9. GET `/instructor/students/stats`

**Description:** Get aggregated student statistics

**Query Parameters:**

| Param   | Type   | Required | Description     |
| ------- | ------ | -------- | --------------- |
| classId | string | No       | Filter by class |

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 45,
    "active": 40,
    "inactive": 3,
    "completed": 0,
    "atRisk": 2,
    "avgProgress": 58,
    "avgScore": 82,
    "avgAttendance": 88,
    "progressDistribution": [
      { "range": "0-25%", "count": 5 },
      { "range": "26-50%", "count": 12 },
      { "range": "51-75%", "count": 18 },
      { "range": "76-100%", "count": 10 }
    ]
  }
}
```

---

## Error Codes

| Code                       | HTTP Status | Description                       |
| -------------------------- | ----------- | --------------------------------- |
| `STUDENT_NOT_FOUND`        | 404         | Student not found                 |
| `NOT_YOUR_STUDENT`         | 403         | Student not in instructor's class |
| `MESSAGE_SEND_FAILED`      | 500         | Failed to send message            |
| `REPORT_GENERATION_FAILED` | 500         | Failed to generate report         |

---

## Implementation Checklist

### Backend

- [ ] Student list endpoint with filters
- [ ] Student detail endpoint
- [ ] Student progress endpoint
- [ ] At-risk detection algorithm
- [ ] Message sending (email/SMS)
- [ ] Message history
- [ ] Report generation (JSON/PDF)
- [ ] Bulk report generation
- [ ] Student stats aggregation
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Students list page
- [x] Student detail page
- [x] Progress visualization
- [x] At-risk students widget
- [x] Send message dialog
- [x] Message history
- [x] Generate report button
- [x] Stats dashboard
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
