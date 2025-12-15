# API Contract: Instructor Dashboard & Tools

**Module:** Instructor Dashboard  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for instructor-specific features including dashboard, class management, student monitoring, and grading tools.

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
interface InstructorDashboard {
  classes: InstructorClassSummary[];
  pendingTasks: PendingTask[];
  studentStats: StudentStats;
  upcomingMeetings: UpcomingMeeting[];
  teachingAnalytics: TeachingAnalytics;
}

interface InstructorClassSummary {
  id: string;
  name: string;
  courseName: string;
  courseId: string;
  studentCount: number;
  maxCapacity: number;
  progress: number; // Average student progress (0-100)
  lessonsUnlocked: number;
  totalLessons: number;
  status: 'active' | 'completed' | 'upcoming' | 'cancelled';
  schedule: string; // e.g., "Mon & Thu, 19:00-21:00"
  nextMeeting?: {
    date: string;
    time: string;
  };
}

interface PendingTask {
  id: string;
  type: 'grade_assignment' | 'review_quiz' | 'unlock_lesson';
  title: string;
  description: string;
  className: string;
  classId: string;
  studentName?: string;
  studentId?: string;
  dueDate?: string;
  submittedAt?: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl: string;
}

interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  avgCompletionRate: number;
  avgAssignmentGrade: number;
  atRiskStudents: number;
}

interface UpcomingMeeting {
  id: string;
  classId: string;
  className: string;
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  meetingLink?: string;
  attendeeCount: number;
  totalStudents: number;
}

interface TeachingAnalytics {
  totalStudentsTaught: number;
  totalClasses: number;
  avgRating: number;
  totalReviews: number;
  completionRate: number;
  monthlyTrend: { month: string; students: number }[];
}
```

---

## Endpoints

### Dashboard

#### 1. GET `/instructor/dashboard`

**Description:** Get instructor dashboard data

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "classes": [
      {
        "id": "class-1",
        "name": "RN101 - Batch 1",
        "courseName": "101 React Native",
        "courseId": "course-1",
        "studentCount": 12,
        "maxCapacity": 15,
        "progress": 45,
        "lessonsUnlocked": 8,
        "totalLessons": 20,
        "status": "active",
        "schedule": "Mon & Thu, 19:00-21:00",
        "nextMeeting": {
          "date": "2025-12-16",
          "time": "19:00"
        }
      }
    ],
    "pendingTasks": [
      {
        "id": "task-1",
        "type": "grade_assignment",
        "title": "Grade: Logo Design",
        "description": "John Doe submitted 2 days ago",
        "className": "DG101 - Batch 1",
        "classId": "class-2",
        "studentName": "John Doe",
        "studentId": "student-1",
        "submittedAt": "2025-12-13T14:30:00Z",
        "priority": "high",
        "actionUrl": "/instructor/assignments/assignment-1/submissions/sub-1"
      }
    ],
    "studentStats": {
      "totalStudents": 45,
      "activeStudents": 42,
      "completedStudents": 28,
      "avgCompletionRate": 67,
      "avgAssignmentGrade": 82,
      "atRiskStudents": 3
    },
    "upcomingMeetings": [
      {
        "id": "meeting-1",
        "classId": "class-1",
        "className": "RN101 - Batch 1",
        "courseName": "101 React Native",
        "date": "2025-12-16",
        "startTime": "19:00",
        "endTime": "21:00",
        "location": "Online - Zoom",
        "meetingLink": "https://zoom.us/j/...",
        "attendeeCount": 12,
        "totalStudents": 15
      }
    ],
    "teachingAnalytics": {
      "totalStudentsTaught": 150,
      "totalClasses": 8,
      "avgRating": 4.8,
      "totalReviews": 95,
      "completionRate": 85,
      "monthlyTrend": [
        { "month": "Oct", "students": 35 },
        { "month": "Nov", "students": 42 },
        { "month": "Dec", "students": 45 }
      ]
    }
  }
}
```

---

### Instructor Classes

#### 2. GET `/instructor/classes`

**Description:** Get all classes assigned to instructor

**Query Parameters:**

| Param    | Type   | Required | Description      |
| -------- | ------ | -------- | ---------------- |
| status   | string | No       | Filter by status |
| courseId | string | No       | Filter by course |

**Response:** Array of `InstructorClassSummary`

---

#### 3. GET `/instructor/classes/:classId`

**Description:** Get detailed class info for instructor

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "class-1",
    "name": "RN101 - Batch 1",
    "course": { "id": "course-1", "title": "101 React Native" },
    "type": "group",
    "status": "active",
    "schedule": {
      "days": ["Monday", "Thursday"],
      "time": "19:00-21:00"
    },
    "capacity": { "current": 12, "max": 15 },
    "progress": {
      "lessonsUnlocked": 8,
      "totalLessons": 20,
      "avgStudentProgress": 45
    },
    "meetingStats": {
      "total": 20,
      "completed": 8,
      "remaining": 12
    },
    "students": [
      {
        "id": "student-1",
        "name": "John Doe",
        "avatar": "...",
        "progress": 55,
        "lastActive": "2025-12-14T10:00:00Z",
        "status": "active"
      }
    ]
  }
}
```

---

### Student Monitoring

#### 4. GET `/instructor/classes/:classId/students`

**Description:** Get students in a class with progress

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "student-1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "...",
      "enrollmentId": "enrollment-1",
      "progress": {
        "lessonsCompleted": 5,
        "lessonsUnlocked": 8,
        "percentage": 62.5,
        "lastCompletedLesson": "State Management",
        "lastActiveAt": "2025-12-14T10:00:00Z"
      },
      "attendance": {
        "present": 7,
        "absent": 1,
        "rate": 87.5
      },
      "assignments": {
        "submitted": 3,
        "pending": 1,
        "avgGrade": 85
      },
      "isAtRisk": false
    }
  ]
}
```

---

#### 5. GET `/instructor/classes/:classId/students/:studentId`

**Description:** Get detailed student progress

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "student-1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+6281234567890",
      "avatar": "..."
    },
    "enrollment": {
      "id": "enrollment-1",
      "enrolledAt": "2025-10-01T10:00:00Z",
      "status": "active"
    },
    "progress": {
      "overall": 55,
      "lessonsCompleted": 5,
      "lessonsUnlocked": 8,
      "totalLessons": 20,
      "xpEarned": 250
    },
    "attendance": {
      "present": 7,
      "absent": 1,
      "late": 0,
      "rate": 87.5,
      "history": [
        { "meetingId": "m1", "date": "2025-12-01", "status": "present" }
      ]
    },
    "assignments": {
      "total": 4,
      "submitted": 3,
      "graded": 2,
      "pending": 1,
      "avgGrade": 85,
      "list": [
        { "id": "a1", "title": "Logo Design", "status": "graded", "score": 90 }
      ]
    },
    "activityLog": [
      {
        "type": "lesson_completed",
        "title": "State Management",
        "at": "2025-12-14T10:00:00Z"
      }
    ]
  }
}
```

---

#### 6. GET `/instructor/at-risk-students`

**Description:** Get students who are falling behind

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "studentId": "student-5",
      "studentName": "Jane Low",
      "classId": "class-1",
      "className": "RN101 - Batch 1",
      "reason": "No activity for 7 days",
      "lastActiveAt": "2025-12-08T10:00:00Z",
      "progress": 25,
      "missedAssignments": 2
    }
  ]
}
```

---

### Pending Tasks

#### 7. GET `/instructor/pending-tasks`

**Description:** Get all pending tasks for instructor

**Query Parameters:**

| Param    | Type   | Required | Description        |
| -------- | ------ | -------- | ------------------ |
| type     | string | No       | Filter by type     |
| classId  | string | No       | Filter by class    |
| priority | string | No       | Filter by priority |

---

#### 8. POST `/instructor/pending-tasks/:taskId/dismiss`

**Description:** Dismiss a pending task

---

### Analytics

#### 9. GET `/instructor/analytics`

**Description:** Get teaching analytics

**Query Parameters:**

| Param  | Type   | Required | Description             |
| ------ | ------ | -------- | ----------------------- |
| period | string | No       | "week", "month", "year" |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalStudents": 150,
      "totalClasses": 8,
      "totalCourses": 3,
      "avgRating": 4.8,
      "completionRate": 85
    },
    "studentProgress": {
      "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
      "completed": [10, 25, 40, 55],
      "inProgress": [30, 25, 20, 15]
    },
    "classPerformance": [
      {
        "classId": "class-1",
        "name": "RN101 - Batch 1",
        "avgProgress": 55,
        "avgGrade": 82
      }
    ],
    "courseBreakdown": [
      {
        "courseId": "course-1",
        "name": "101 React Native",
        "students": 45,
        "percentage": 30
      }
    ]
  }
}
```

---

### Attendance

#### 10. POST `/instructor/classes/:classId/meetings/:meetingId/attendance`

**Description:** Mark attendance for a meeting

**Request Body:**

```json
{
  "attendance": [
    { "studentId": "student-1", "status": "present" },
    { "studentId": "student-2", "status": "absent" },
    { "studentId": "student-3", "status": "late" }
  ]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Attendance recorded",
  "data": {
    "meetingId": "meeting-1",
    "date": "2025-12-16",
    "present": 10,
    "absent": 2,
    "late": 3,
    "attendanceRate": 86.7
  }
}
```

**Side Effects:**

- Deducts credits for present/late students
- Updates attendance stats

---

## Error Codes

| Code                        | HTTP Status | Description                       |
| --------------------------- | ----------- | --------------------------------- |
| `NOT_INSTRUCTOR`            | 403         | User is not an instructor         |
| `NOT_YOUR_CLASS`            | 403         | Class not assigned to instructor  |
| `STUDENT_NOT_IN_CLASS`      | 404         | Student not in instructor's class |
| `MEETING_NOT_FOUND`         | 404         | Meeting not found                 |
| `ATTENDANCE_ALREADY_MARKED` | 400         | Attendance already recorded       |

---

## Implementation Checklist

### Backend

- [ ] Instructor dashboard endpoint
- [ ] Classes list/detail endpoints
- [ ] Student monitoring endpoints
- [ ] At-risk students detection
- [ ] Pending tasks endpoints
- [ ] Analytics endpoints
- [ ] Attendance recording
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Instructor dashboard page
- [x] Classes list page
- [x] Class detail page
- [x] Student progress view
- [x] Pending tasks widget
- [x] Attendance marking UI
- [x] Analytics charts
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
