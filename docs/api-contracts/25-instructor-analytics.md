# API Contract: Instructor Analytics

**Module:** Instructor Analytics (PRD 14, 16, 18, 22)  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for instructor-specific analytics and performance insights. Provides detailed metrics on teaching performance, student engagement, course performance, and revenue.

**Base URL:** `{API_BASE_URL}/instructor/analytics`

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
interface DateRange {
  from: string;
  to: string;
}

interface InstructorOverview {
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  totalCourses: number;
  activeCourses: number;
  totalClasses: number;
  activeClasses: number;
  completedClasses: number;
  averageCompletionRate: number;
  averageScore: number;
  averageRating: number;
  totalRevenue: number;
  pendingAssignments: number;
  atRiskStudents: number;
}

interface EnrollmentTrendItem {
  date: string;
  enrollments: number;
  completions: number;
}

interface RevenueItem {
  date: string;
  revenue: number;
}

interface CoursePerformance {
  courseId: string;
  courseTitle: string;
  thumbnail: string;
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  completionRate: number;
  averageScore: number;
  averageProgress: number;
  rating: number;
  totalRevenue: number;
  enrollmentTrend: number; // percentage change
}

interface StudentEngagement {
  date: string;
  activeUsers: number;
  lessonsCompleted: number;
  quizzesSubmitted: number;
  assignmentsSubmitted: number;
  averageTimeSpent: number; // minutes
}

interface AtRiskStudent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  courseId: string;
  courseName: string;
  classId: string;
  className: string;
  riskLevel: 'high' | 'medium' | 'low';
  riskFactors: string[];
  lastActiveAt: string;
  progress: number;
  suggestedAction: string;
}

interface ClassPerformance {
  classId: string;
  className: string;
  courseName: string;
  type: 'group' | 'private';
  studentCount: number;
  avgProgress: number;
  avgScore: number;
  attendanceRate: number;
  completionRate: number;
  status: 'active' | 'completed';
}

interface TopPerformer {
  studentId: string;
  studentName: string;
  studentAvatar: string;
  className: string;
  progress: number;
  averageScore: number;
  streak: number;
  xp: number;
}
```

---

## Endpoints

### Overview

#### 1. GET `/instructor/analytics/overview`

**Description:** Get instructor analytics overview

**Query Parameters:**

| Param  | Type   | Required | Description                        |
| ------ | ------ | -------- | ---------------------------------- |
| period | string | No       | "week", "month", "quarter", "year" |
| from   | string | No       | Start date (ISO)                   |
| to     | string | No       | End date (ISO)                     |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalStudents": 150,
    "activeStudents": 120,
    "completedStudents": 25,
    "totalCourses": 3,
    "activeCourses": 3,
    "totalClasses": 8,
    "activeClasses": 5,
    "completedClasses": 3,
    "averageCompletionRate": 78,
    "averageScore": 82,
    "averageRating": 4.8,
    "totalRevenue": 450000000,
    "pendingAssignments": 15,
    "atRiskStudents": 5
  }
}
```

---

### Enrollment Trends

#### 2. GET `/instructor/analytics/enrollments`

**Description:** Get enrollment trends over time

**Query Parameters:**

| Param    | Type   | Required | Description                        |
| -------- | ------ | -------- | ---------------------------------- |
| period   | string | No       | "week", "month", "quarter", "year" |
| courseId | string | No       | Filter by course                   |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalEnrollments": 150,
      "newThisPeriod": 25,
      "completedThisPeriod": 10,
      "growthRate": 15.5
    },
    "trend": [
      { "date": "2025-10", "enrollments": 40, "completions": 5 },
      { "date": "2025-11", "enrollments": 55, "completions": 8 },
      { "date": "2025-12", "enrollments": 55, "completions": 12 }
    ]
  }
}
```

---

### Revenue Analytics

#### 3. GET `/instructor/analytics/revenue`

**Description:** Get revenue analytics

**Query Parameters:**

| Param    | Type   | Required | Description                        |
| -------- | ------ | -------- | ---------------------------------- |
| period   | string | No       | "week", "month", "quarter", "year" |
| courseId | string | No       | Filter by course                   |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRevenue": 450000000,
      "thisMonth": 75000000,
      "lastMonth": 65000000,
      "growthRate": 15.4,
      "averagePerStudent": 3000000
    },
    "trend": [
      { "date": "2025-10", "revenue": 110000000 },
      { "date": "2025-11", "revenue": 130000000 },
      { "date": "2025-12", "revenue": 150000000 }
    ],
    "byCourse": [
      {
        "courseId": "course-1",
        "courseName": "101 React Native",
        "revenue": 225000000,
        "percentage": 50
      },
      {
        "courseId": "course-2",
        "courseName": "UI/UX Design",
        "revenue": 135000000,
        "percentage": 30
      }
    ]
  }
}
```

---

### Course Performance

#### 4. GET `/instructor/analytics/courses`

**Description:** Get course performance analytics

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "courseId": "course-1",
      "courseTitle": "101 React Native",
      "thumbnail": "https://...",
      "totalStudents": 75,
      "activeStudents": 60,
      "completedStudents": 15,
      "completionRate": 20,
      "averageScore": 85,
      "averageProgress": 62,
      "rating": 4.9,
      "totalRevenue": 225000000,
      "enrollmentTrend": 12.5
    }
  ]
}
```

---

### Class Performance

#### 5. GET `/instructor/analytics/classes`

**Description:** Get class performance analytics

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "classId": "class-1",
      "className": "RN101 - Batch 1",
      "courseName": "101 React Native",
      "type": "group",
      "studentCount": 12,
      "avgProgress": 55,
      "avgScore": 82,
      "attendanceRate": 90,
      "completionRate": 25,
      "status": "active"
    }
  ]
}
```

---

### Student Engagement

#### 6. GET `/instructor/analytics/engagement`

**Description:** Get student engagement metrics

**Query Parameters:**

| Param   | Type   | Required | Description     |
| ------- | ------ | -------- | --------------- |
| period  | string | No       | "week", "month" |
| classId | string | No       | Filter by class |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "averageDailyActive": 45,
      "averageSessionDuration": 52,
      "peakDay": "Thursday",
      "peakHour": "20:00"
    },
    "daily": [
      {
        "date": "2025-12-14",
        "activeUsers": 52,
        "lessonsCompleted": 28,
        "quizzesSubmitted": 15,
        "assignmentsSubmitted": 5,
        "averageTimeSpent": 48
      }
    ],
    "byDayOfWeek": [
      { "day": "Monday", "avgActive": 40 },
      { "day": "Tuesday", "avgActive": 35 },
      { "day": "Wednesday", "avgActive": 42 },
      { "day": "Thursday", "avgActive": 55 },
      { "day": "Friday", "avgActive": 38 }
    ]
  }
}
```

---

### At-Risk Students

#### 7. GET `/instructor/analytics/at-risk`

**Description:** Get students at risk

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "student-15",
      "name": "Jane Struggling",
      "email": "jane@example.com",
      "avatar": "...",
      "courseId": "course-1",
      "courseName": "101 React Native",
      "classId": "class-1",
      "className": "RN101 - Batch 1",
      "riskLevel": "high",
      "riskFactors": [
        "No activity for 10 days",
        "2 missed assignments",
        "Attendance below 70%"
      ],
      "lastActiveAt": "2025-12-05T10:00:00Z",
      "progress": 25,
      "suggestedAction": "Personal phone call recommended"
    }
  ]
}
```

---

### Top Performers

#### 8. GET `/instructor/analytics/top-performers`

**Description:** Get top performing students

**Query Parameters:**

| Param   | Type   | Required | Description                      |
| ------- | ------ | -------- | -------------------------------- |
| classId | string | No       | Filter by class                  |
| limit   | number | No       | Number of students (default: 10) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "studentId": "student-1",
      "studentName": "John Doe",
      "studentAvatar": "...",
      "className": "RN101 - Batch 1",
      "progress": 85,
      "averageScore": 92,
      "streak": 14,
      "xp": 2500
    }
  ]
}
```

---

### Progress Distribution

#### 9. GET `/instructor/analytics/progress-distribution`

**Description:** Get student progress distribution

**Query Parameters:**

| Param   | Type   | Required | Description     |
| ------- | ------ | -------- | --------------- |
| classId | string | No       | Filter by class |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "distribution": [
      { "range": "0-25%", "count": 10, "percentage": 8 },
      { "range": "26-50%", "count": 25, "percentage": 20 },
      { "range": "51-75%", "count": 55, "percentage": 45 },
      { "range": "76-100%", "count": 30, "percentage": 25 }
    ],
    "averageProgress": 62,
    "medianProgress": 58
  }
}
```

---

### Export

#### 10. GET `/instructor/analytics/export`

**Description:** Export analytics report

**Query Parameters:**

| Param  | Type   | Required | Description                       |
| ------ | ------ | -------- | --------------------------------- |
| format | string | No       | "csv", "xlsx", "pdf"              |
| type   | string | No       | "overview", "students", "courses" |
| period | string | No       | Date period                       |

---

## Error Codes

| Code                 | HTTP Status | Description                  |
| -------------------- | ----------- | ---------------------------- |
| `NO_DATA`            | 200         | No analytics data for period |
| `INVALID_DATE_RANGE` | 400         | Invalid date range           |
| `EXPORT_FAILED`      | 500         | Export generation failed     |

---

## Implementation Checklist

### Backend

- [ ] Overview endpoint
- [ ] Enrollment trends endpoint
- [ ] Revenue analytics endpoint
- [ ] Course performance endpoint
- [ ] Class performance endpoint
- [ ] Student engagement endpoint
- [ ] At-risk detection algorithm
- [ ] Top performers endpoint
- [ ] Progress distribution endpoint
- [ ] Export functionality
- [ ] Data aggregation queries
- [ ] Caching for performance
- [ ] Write unit tests

### Frontend

- [x] Analytics dashboard page
- [x] Overview cards
- [x] Enrollment chart
- [x] Revenue chart
- [x] Course performance table
- [x] Class performance table
- [x] Engagement heatmap
- [x] At-risk students list
- [x] Top performers leaderboard
- [x] Progress distribution chart
- [x] Export buttons
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
