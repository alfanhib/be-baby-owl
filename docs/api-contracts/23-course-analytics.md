# API Contract: Course Analytics

**Module:** Course Analytics  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for course-specific analytics. Provides detailed insights into course performance, student engagement, lesson completion, and drop-off analysis.

**Base URL:** `{API_BASE_URL}/courses/:courseId/analytics`

---

## Authentication

All endpoints require Bearer token:

```
Authorization: Bearer {accessToken}
```

**Required Roles:** `instructor` (own courses), `staff`, `super_admin`

---

## Types

```typescript
interface CourseAnalytics {
  courseId: string;
  overview: {
    totalStudents: number;
    activeStudents: number;
    completedStudents: number;
    averageProgress: number;
    averageScore: number;
    completionRate: number;
    engagementRate: number;
    totalRevenue: number;
  };
  enrollmentTrend: {
    date: string;
    enrollments: number;
    completions: number;
  }[];
  lessonProgress: {
    lessonId: string;
    lessonTitle: string;
    sectionTitle: string;
    completions: number;
    averageTime: number; // minutes
    dropOffRate: number; // percentage
  }[];
  performanceBySection: {
    sectionId: string;
    sectionTitle: string;
    averageScore: number;
    completionRate: number;
    totalExercises: number;
  }[];
  studentDistribution: {
    status: 'active' | 'completed' | 'inactive';
    count: number;
    percentage: number;
  }[];
  recentActivity: {
    id: string;
    studentName: string;
    studentAvatar: string;
    action: string;
    lessonTitle?: string;
    score?: number;
    timestamp: string;
  }[];
}

interface CourseStudent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  classId: string;
  className: string;
  enrolledAt: string;
  lastActiveAt: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  averageScore: number;
  assignmentsSubmitted: number;
  totalAssignments: number;
  status: 'active' | 'completed' | 'inactive' | 'at_risk';
}

interface LessonAnalytics {
  lessonId: string;
  lessonTitle: string;
  sectionId: string;
  sectionTitle: string;
  totalStudents: number;
  completedCount: number;
  completionRate: number;
  averageTimeSpent: number; // minutes
  averageScore: number;
  dropOffRate: number;
  exercises: {
    exerciseId: string;
    exerciseTitle: string;
    type: string;
    completionRate: number;
    averageScore?: number;
    averageAttempts?: number;
  }[];
  studentProgress: {
    studentId: string;
    studentName: string;
    status: 'not_started' | 'in_progress' | 'completed';
    completedAt?: string;
    timeSpent: number;
    score?: number;
  }[];
}

interface DropOffAnalysis {
  courseId: string;
  overallDropOffRate: number;
  criticalPoints: {
    lessonId: string;
    lessonTitle: string;
    sectionTitle: string;
    dropOffRate: number;
    studentsDropped: number;
    possibleReasons: string[];
  }[];
  recommendations: string[];
}
```

---

## Endpoints

### Course Overview

#### 1. GET `/courses/:courseId/analytics`

**Description:** Get comprehensive course analytics

**Query Parameters:**

| Param   | Type   | Required | Description                               |
| ------- | ------ | -------- | ----------------------------------------- |
| period  | string | No       | "week", "month", "quarter", "year", "all" |
| classId | string | No       | Filter by specific class                  |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "courseId": "course-1",
    "overview": {
      "totalStudents": 250,
      "activeStudents": 180,
      "completedStudents": 50,
      "averageProgress": 62,
      "averageScore": 78,
      "completionRate": 20,
      "engagementRate": 85,
      "totalRevenue": 750000000
    },
    "enrollmentTrend": [
      { "date": "2025-10", "enrollments": 80, "completions": 10 },
      { "date": "2025-11", "enrollments": 90, "completions": 15 },
      { "date": "2025-12", "enrollments": 80, "completions": 25 }
    ],
    "lessonProgress": [
      {
        "lessonId": "lesson-1",
        "lessonTitle": "Introduction",
        "sectionTitle": "Getting Started",
        "completions": 230,
        "averageTime": 15,
        "dropOffRate": 5
      },
      {
        "lessonId": "lesson-10",
        "lessonTitle": "Advanced State",
        "sectionTitle": "State Management",
        "completions": 120,
        "averageTime": 45,
        "dropOffRate": 25
      }
    ],
    "performanceBySection": [
      {
        "sectionId": "section-1",
        "sectionTitle": "Getting Started",
        "averageScore": 85,
        "completionRate": 92,
        "totalExercises": 15
      }
    ],
    "studentDistribution": [
      { "status": "active", "count": 180, "percentage": 72 },
      { "status": "completed", "count": 50, "percentage": 20 },
      { "status": "inactive", "count": 20, "percentage": 8 }
    ],
    "recentActivity": [
      {
        "id": "activity-1",
        "studentName": "John Doe",
        "studentAvatar": "...",
        "action": "completed_lesson",
        "lessonTitle": "Navigation",
        "timestamp": "2025-12-14T10:00:00Z"
      }
    ]
  }
}
```

---

### Student Analysis

#### 2. GET `/courses/:courseId/analytics/students`

**Description:** Get students enrolled in course with analytics

**Query Parameters:**

| Param     | Type   | Required | Description                       |
| --------- | ------ | -------- | --------------------------------- |
| classId   | string | No       | Filter by class                   |
| status    | string | No       | Filter by status                  |
| sortBy    | string | No       | "progress", "score", "lastActive" |
| sortOrder | string | No       | "asc", "desc"                     |
| page      | number | No       | Page number                       |
| limit     | number | No       | Items per page                    |

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
      "classId": "class-1",
      "className": "RN101 - Batch 1",
      "enrolledAt": "2025-10-01T10:00:00Z",
      "lastActiveAt": "2025-12-14T10:00:00Z",
      "progress": 55,
      "lessonsCompleted": 11,
      "totalLessons": 20,
      "averageScore": 85,
      "assignmentsSubmitted": 3,
      "totalAssignments": 4,
      "status": "active"
    }
  ],
  "meta": { "total": 250, "page": 1, "limit": 20, "totalPages": 13 }
}
```

---

### Lesson Analytics

#### 3. GET `/courses/:courseId/analytics/lessons/:lessonId`

**Description:** Get detailed analytics for specific lesson

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "lessonId": "lesson-10",
    "lessonTitle": "Advanced State Management",
    "sectionId": "section-3",
    "sectionTitle": "State Management",
    "totalStudents": 180,
    "completedCount": 120,
    "completionRate": 67,
    "averageTimeSpent": 45,
    "averageScore": 78,
    "dropOffRate": 15,
    "exercises": [
      {
        "exerciseId": "exercise-1",
        "exerciseTitle": "Redux Setup Video",
        "type": "video",
        "completionRate": 85,
        "averageScore": null,
        "averageAttempts": null
      },
      {
        "exerciseId": "exercise-2",
        "exerciseTitle": "State Quiz",
        "type": "quiz",
        "completionRate": 72,
        "averageScore": 78,
        "averageAttempts": 1.8
      }
    ],
    "studentProgress": [
      {
        "studentId": "student-1",
        "studentName": "John Doe",
        "status": "completed",
        "completedAt": "2025-12-10T10:00:00Z",
        "timeSpent": 52,
        "score": 85
      },
      {
        "studentId": "student-2",
        "studentName": "Jane Student",
        "status": "in_progress",
        "timeSpent": 20,
        "score": null
      }
    ]
  }
}
```

---

### Drop-off Analysis

#### 4. GET `/courses/:courseId/analytics/dropoff`

**Description:** Get drop-off analysis to identify problem areas

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "courseId": "course-1",
    "overallDropOffRate": 18,
    "criticalPoints": [
      {
        "lessonId": "lesson-10",
        "lessonTitle": "Advanced State Management",
        "sectionTitle": "State Management",
        "dropOffRate": 25,
        "studentsDropped": 45,
        "possibleReasons": [
          "Lesson is too complex",
          "Prerequisite knowledge gap",
          "Long duration (45 min)"
        ]
      },
      {
        "lessonId": "lesson-15",
        "lessonTitle": "Testing",
        "sectionTitle": "Advanced Topics",
        "dropOffRate": 20,
        "studentsDropped": 30,
        "possibleReasons": [
          "Requires setup outside platform",
          "Technical topic"
        ]
      }
    ],
    "recommendations": [
      "Consider breaking Lesson 10 into smaller parts",
      "Add more examples and exercises for State Management",
      "Create prerequisite checklist for Advanced Topics section"
    ]
  }
}
```

---

### Engagement Metrics

#### 5. GET `/courses/:courseId/analytics/engagement`

**Description:** Get student engagement metrics

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "courseId": "course-1",
    "overall": {
      "averageSessionDuration": 45, // minutes
      "averageSessionsPerWeek": 3.2,
      "averageCompletionTime": 60, // days
      "returnRate": 78
    },
    "byDay": [
      { "day": "Monday", "avgSessions": 120, "avgDuration": 48 },
      { "day": "Tuesday", "avgSessions": 95, "avgDuration": 42 }
    ],
    "byHour": [
      { "hour": "19:00", "avgSessions": 85 },
      { "hour": "20:00", "avgSessions": 120 },
      { "hour": "21:00", "avgSessions": 95 }
    ],
    "peakTimes": {
      "day": "Thursday",
      "hour": "20:00",
      "note": "Most students are active on Thursday evenings"
    }
  }
}
```

---

### Export

#### 6. GET `/courses/:courseId/analytics/export`

**Description:** Export course analytics

**Query Parameters:**

| Param  | Type   | Required | Description                       |
| ------ | ------ | -------- | --------------------------------- |
| format | string | No       | "csv", "xlsx", "pdf"              |
| type   | string | No       | "overview", "students", "lessons" |

---

## Error Codes

| Code               | HTTP Status | Description                      |
| ------------------ | ----------- | -------------------------------- |
| `COURSE_NOT_FOUND` | 404         | Course not found                 |
| `LESSON_NOT_FOUND` | 404         | Lesson not found                 |
| `NOT_AUTHORIZED`   | 403         | Not authorized to view analytics |
| `NO_DATA`          | 200         | No analytics data available yet  |

---

## Implementation Checklist

### Backend

- [ ] Course analytics overview endpoint
- [ ] Student analytics endpoint
- [ ] Lesson analytics endpoint
- [ ] Drop-off analysis algorithm
- [ ] Engagement metrics calculation
- [ ] Export functionality (CSV, Excel, PDF)
- [ ] Data aggregation queries
- [ ] Caching for heavy queries
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Course analytics page
- [x] Overview cards
- [x] Enrollment trend chart
- [x] Lesson progress chart
- [x] Student distribution pie chart
- [x] Drop-off funnel visualization
- [x] Engagement heatmap
- [x] Student list with analytics
- [x] Lesson detail analytics
- [x] Export buttons
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
