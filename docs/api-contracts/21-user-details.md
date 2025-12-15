# API Contract: User Details (Extended)

**Module:** User Details  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

Extended API endpoints for detailed user profiles. Provides comprehensive data for staff/instructor detail pages including classes, schedules, students, and activity.

**Base URL:** `{API_BASE_URL}/users`

---

## Authentication

All endpoints require Bearer token:

```
Authorization: Bearer {accessToken}
```

**Required Roles:** `staff`, `super_admin`

---

## Types

### Staff/Instructor Details

```typescript
interface StaffInstructorClass {
  id: string;
  name: string;
  courseCode: string;
  courseName: string;
  type: 'group' | 'private';
  status: 'active' | 'completed' | 'upcoming';
  studentsCount: number;
  maxStudents: number;
  startDate: string;
  endDate?: string;
  progress: number;
  nextMeeting?: {
    date: string;
    time: string;
    topic: string;
  };
}

interface StaffInstructorSchedule {
  id: string;
  title: string;
  type: 'live_class' | 'meeting' | 'consultation' | 'workshop';
  date: string;
  startTime: string;
  endTime: string;
  className?: string;
  location: string;
  isOnline: boolean;
}

interface StaffInstructorStudent {
  id: string;
  name: string;
  avatar?: string;
  className: string;
  progress: number;
  lastActive: string;
  status: 'active' | 'at_risk' | 'completed';
}

interface StaffInstructorActivity {
  id: string;
  type:
    | 'class_completed'
    | 'assignment_graded'
    | 'lesson_unlocked'
    | 'meeting_scheduled';
  title: string;
  description: string;
  relatedEntity?: { type: string; id: string; name: string };
  timestamp: string;
}

interface StaffInstructorDetails {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: 'instructor' | 'staff';
    status: 'active' | 'inactive';
    createdAt: string;
    lastLogin?: string;
  };
  stats: {
    totalClasses: number;
    activeClasses: number;
    completedClasses: number;
    totalStudents: number;
    activeStudents: number;
    avgRating: number;
    totalReviews: number;
    completionRate: number;
  };
  classes: StaffInstructorClass[];
  upcomingSchedule: StaffInstructorSchedule[];
  students: StaffInstructorStudent[];
  recentActivity: StaffInstructorActivity[];
  performance: {
    ratings: { month: string; rating: number }[];
    studentGrowth: { month: string; count: number }[];
  };
}
```

### Student Details

```typescript
interface StudentEnrollment {
  id: string;
  classId: string;
  className: string;
  courseId: string;
  courseName: string;
  instructorName: string;
  type: 'group' | 'private';
  status: 'active' | 'completed' | 'paused';
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  enrolledAt: string;
  completedAt?: string;
}

interface StudentAssignment {
  id: string;
  title: string;
  className: string;
  dueDate?: string;
  submittedAt?: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  score?: number;
  maxScore: number;
}

interface StudentPayment {
  id: string;
  enrollmentId: string;
  className: string;
  amount: number;
  status: 'pending' | 'verified' | 'rejected';
  paidAt?: string;
  verifiedAt?: string;
}

interface StudentDetails {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    lastLogin?: string;
  };
  stats: {
    totalEnrollments: number;
    activeEnrollments: number;
    completedCourses: number;
    totalHoursLearned: number;
    avgProgress: number;
    avgScore: number;
    attendanceRate: number;
  };
  gamification: {
    xp: number;
    level: number;
    levelName: string;
    xpToNextLevel: number;
    streak: number;
    longestStreak: number;
    badges: { id: string; name: string; icon: string; earnedAt: string }[];
    rank: number;
    totalUsers: number;
  };
  enrollments: StudentEnrollment[];
  assignments: StudentAssignment[];
  payments: StudentPayment[];
  activityLog: {
    id: string;
    type: string;
    title: string;
    timestamp: string;
  }[];
}
```

---

## Endpoints

### Staff/Instructor Details

#### 1. GET `/users/:id/instructor-details`

**Description:** Get extended details for instructor/staff user

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "instructor-1",
      "name": "Dr. Smith",
      "email": "smith@example.com",
      "phone": "+6281234567890",
      "avatar": "https://example.com/smith.jpg",
      "role": "instructor",
      "status": "active",
      "createdAt": "2024-01-15T10:00:00Z",
      "lastLogin": "2025-12-14T08:00:00Z"
    },
    "stats": {
      "totalClasses": 12,
      "activeClasses": 5,
      "completedClasses": 7,
      "totalStudents": 150,
      "activeStudents": 45,
      "avgRating": 4.8,
      "totalReviews": 95,
      "completionRate": 85
    },
    "classes": [
      {
        "id": "class-1",
        "name": "RN101 - Batch 1",
        "courseCode": "RN101",
        "courseName": "101 React Native",
        "type": "group",
        "status": "active",
        "studentsCount": 12,
        "maxStudents": 15,
        "startDate": "2025-10-01",
        "progress": 45,
        "nextMeeting": {
          "date": "2025-12-16",
          "time": "19:00",
          "topic": "Navigation"
        }
      }
    ],
    "upcomingSchedule": [
      {
        "id": "schedule-1",
        "title": "RN101 Session 9",
        "type": "live_class",
        "date": "2025-12-16",
        "startTime": "19:00",
        "endTime": "21:00",
        "className": "RN101 - Batch 1",
        "location": "Zoom",
        "isOnline": true
      }
    ],
    "students": [
      {
        "id": "student-1",
        "name": "John Doe",
        "avatar": "...",
        "className": "RN101 - Batch 1",
        "progress": 55,
        "lastActive": "2025-12-14T10:00:00Z",
        "status": "active"
      }
    ],
    "recentActivity": [
      {
        "id": "activity-1",
        "type": "assignment_graded",
        "title": "Graded assignment",
        "description": "Graded 'Logo Design' for John Doe - Score: 85",
        "relatedEntity": {
          "type": "assignment",
          "id": "a-1",
          "name": "Logo Design"
        },
        "timestamp": "2025-12-14T09:00:00Z"
      }
    ],
    "performance": {
      "ratings": [
        { "month": "Oct", "rating": 4.7 },
        { "month": "Nov", "rating": 4.8 },
        { "month": "Dec", "rating": 4.9 }
      ],
      "studentGrowth": [
        { "month": "Oct", "count": 35 },
        { "month": "Nov", "count": 42 },
        { "month": "Dec", "count": 45 }
      ]
    }
  }
}
```

---

#### 2. GET `/users/:id/instructor-details/classes`

**Description:** Get instructor's classes

---

#### 3. GET `/users/:id/instructor-details/students`

**Description:** Get instructor's students

**Query Parameters:**

| Param   | Type   | Required | Description      |
| ------- | ------ | -------- | ---------------- |
| classId | string | No       | Filter by class  |
| status  | string | No       | Filter by status |

---

#### 4. GET `/users/:id/instructor-details/schedule`

**Description:** Get instructor's schedule

**Query Parameters:**

| Param     | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| startDate | string | No       | From date   |
| endDate   | string | No       | To date     |

---

### Student Details

#### 5. GET `/users/:id/student-details`

**Description:** Get extended details for student user

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "student-1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+6281234567890",
      "avatar": "...",
      "status": "active",
      "createdAt": "2025-06-01T10:00:00Z",
      "lastLogin": "2025-12-14T10:00:00Z"
    },
    "stats": {
      "totalEnrollments": 3,
      "activeEnrollments": 2,
      "completedCourses": 1,
      "totalHoursLearned": 45,
      "avgProgress": 65,
      "avgScore": 85,
      "attendanceRate": 90
    },
    "gamification": {
      "xp": 1500,
      "level": 5,
      "levelName": "Rising Star",
      "xpToNextLevel": 500,
      "streak": 7,
      "longestStreak": 14,
      "badges": [
        { "id": "badge-1", "name": "First Lesson", "icon": "star", "earnedAt": "2025-06-01" }
      ],
      "rank": 15,
      "totalUsers": 500
    },
    "enrollments": [...],
    "assignments": [...],
    "payments": [...],
    "activityLog": [...]
  }
}
```

---

#### 6. GET `/users/:id/student-details/enrollments`

**Description:** Get student's enrollments

---

#### 7. GET `/users/:id/student-details/assignments`

**Description:** Get student's assignments

---

#### 8. GET `/users/:id/student-details/payments`

**Description:** Get student's payment history

---

#### 9. GET `/users/:id/student-details/progress`

**Description:** Get student's learning progress over time

---

## Error Codes

| Code             | HTTP Status | Description               |
| ---------------- | ----------- | ------------------------- |
| `USER_NOT_FOUND` | 404         | User not found            |
| `NOT_INSTRUCTOR` | 400         | User is not an instructor |
| `NOT_STUDENT`    | 400         | User is not a student     |

---

## Implementation Checklist

### Backend

- [ ] Instructor details endpoint
- [ ] Instructor classes endpoint
- [ ] Instructor students endpoint
- [ ] Instructor schedule endpoint
- [ ] Student details endpoint
- [ ] Student enrollments endpoint
- [ ] Student assignments endpoint
- [ ] Student payments endpoint
- [ ] Student progress endpoint
- [ ] Aggregation queries
- [ ] Write unit tests

### Frontend

- [x] Instructor detail page
- [x] Instructor classes tab
- [x] Instructor students tab
- [x] Instructor schedule tab
- [x] Student detail page
- [x] Student enrollments tab
- [x] Student assignments tab
- [x] Student payments tab
- [x] Gamification display
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
