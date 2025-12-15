# API Contract: System Analytics

**Module:** System Analytics  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for system-wide analytics and reporting. Used by Staff and Super Admin for business intelligence.

**Base URL:** `{API_BASE_URL}/analytics`

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
interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface EnrollmentAnalytics {
  summary: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    thisWeek: number;
    growthRate: number; // percentage
    trend: 'up' | 'down' | 'stable';
  };
  byStatus: {
    active: number;
    completed: number;
    cancelled: number;
    pending: number;
  };
  byClassType: {
    group: number;
    private: number;
  };
  daily: TimeSeriesDataPoint[];
  weekly: TimeSeriesDataPoint[];
  monthly: TimeSeriesDataPoint[];
  byCourse: {
    courseId: string;
    courseName: string;
    count: number;
    percentage: number;
  }[];
}

interface RevenueAnalytics {
  summary: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    thisWeek: number;
    growthRate: number;
    trend: 'up' | 'down' | 'stable';
    averageOrderValue: number;
  };
  byPaymentStatus: {
    verified: number;
    pending: number;
    rejected: number;
  };
  byPackage: {
    packageName: string;
    amount: number;
    count: number;
    percentage: number;
  }[];
  byCourse: {
    courseId: string;
    courseName: string;
    amount: number;
    percentage: number;
  }[];
  daily: TimeSeriesDataPoint[];
  monthly: TimeSeriesDataPoint[];
}

interface CourseAnalytics {
  summary: {
    totalCourses: number;
    publishedCourses: number;
    totalEnrollments: number;
    avgCompletionRate: number;
    avgRating: number;
  };
  topCourses: {
    courseId: string;
    courseName: string;
    enrollments: number;
    revenue: number;
    completionRate: number;
    rating: number;
  }[];
  byCategory: {
    category: string;
    count: number;
    enrollments: number;
    revenue: number;
  }[];
}

interface InstructorAnalytics {
  summary: {
    totalInstructors: number;
    activeInstructors: number;
    totalStudentsTaught: number;
    avgRating: number;
  };
  topInstructors: {
    instructorId: string;
    instructorName: string;
    totalStudents: number;
    totalClasses: number;
    avgRating: number;
    revenue: number;
  }[];
  performanceDistribution: {
    rating: string; // "4.5-5.0", "4.0-4.5", etc.
    count: number;
  }[];
}
```

---

## Endpoints

### Enrollment Analytics

#### 1. GET `/analytics/enrollments`

**Description:** Get enrollment analytics

**Query Parameters:**

| Param     | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| period    | string | No       | "week", "month", "quarter", "year" |
| startDate | string | No       | ISO date                           |
| endDate   | string | No       | ISO date                           |
| courseId  | string | No       | Filter by course                   |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 1500,
      "thisMonth": 150,
      "lastMonth": 130,
      "thisWeek": 35,
      "growthRate": 15.4,
      "trend": "up"
    },
    "byStatus": {
      "active": 850,
      "completed": 500,
      "cancelled": 120,
      "pending": 30
    },
    "byClassType": {
      "group": 1100,
      "private": 400
    },
    "daily": [
      { "date": "2025-12-01", "value": 5 },
      { "date": "2025-12-02", "value": 8 }
    ],
    "monthly": [
      { "date": "2025-10", "value": 120, "label": "Oct" },
      { "date": "2025-11", "value": 130, "label": "Nov" },
      { "date": "2025-12", "value": 150, "label": "Dec" }
    ],
    "byCourse": [
      {
        "courseId": "course-1",
        "courseName": "101 React Native",
        "count": 450,
        "percentage": 30
      },
      {
        "courseId": "course-2",
        "courseName": "UI/UX Design",
        "count": 380,
        "percentage": 25.3
      }
    ]
  }
}
```

---

### Revenue Analytics

#### 2. GET `/analytics/revenue`

**Description:** Get revenue analytics

**Query Parameters:**

| Param     | Type   | Required | Description                        |
| --------- | ------ | -------- | ---------------------------------- |
| period    | string | No       | "week", "month", "quarter", "year" |
| startDate | string | No       | ISO date                           |
| endDate   | string | No       | ISO date                           |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 4500000000,
      "thisMonth": 450000000,
      "lastMonth": 380000000,
      "thisWeek": 105000000,
      "growthRate": 18.4,
      "trend": "up",
      "averageOrderValue": 3000000
    },
    "byPaymentStatus": {
      "verified": 4200000000,
      "pending": 250000000,
      "rejected": 50000000
    },
    "byPackage": [
      {
        "packageName": "20 Meetings",
        "amount": 1800000000,
        "count": 600,
        "percentage": 40
      },
      {
        "packageName": "50 Meetings",
        "amount": 1500000000,
        "count": 300,
        "percentage": 33.3
      }
    ],
    "byCourse": [
      {
        "courseId": "course-1",
        "courseName": "101 React Native",
        "amount": 1350000000,
        "percentage": 30
      }
    ],
    "monthly": [
      { "date": "2025-10", "value": 350000000, "label": "Oct" },
      { "date": "2025-11", "value": 380000000, "label": "Nov" },
      { "date": "2025-12", "value": 450000000, "label": "Dec" }
    ]
  }
}
```

---

### Course Analytics

#### 3. GET `/analytics/courses`

**Description:** Get course performance analytics

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalCourses": 25,
      "publishedCourses": 20,
      "totalEnrollments": 1500,
      "avgCompletionRate": 78,
      "avgRating": 4.6
    },
    "topCourses": [
      {
        "courseId": "course-1",
        "courseName": "101 React Native",
        "enrollments": 450,
        "revenue": 1350000000,
        "completionRate": 85,
        "rating": 4.8
      }
    ],
    "byCategory": [
      {
        "category": "Mobile Development",
        "count": 5,
        "enrollments": 600,
        "revenue": 1800000000
      },
      {
        "category": "Web Development",
        "count": 8,
        "enrollments": 400,
        "revenue": 1200000000
      }
    ]
  }
}
```

---

### Instructor Analytics

#### 4. GET `/analytics/instructors`

**Description:** Get instructor performance analytics

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalInstructors": 30,
      "activeInstructors": 25,
      "totalStudentsTaught": 1500,
      "avgRating": 4.6
    },
    "topInstructors": [
      {
        "instructorId": "instructor-1",
        "instructorName": "Dr. Smith",
        "totalStudents": 250,
        "totalClasses": 8,
        "avgRating": 4.9,
        "revenue": 750000000
      }
    ],
    "performanceDistribution": [
      { "rating": "4.5-5.0", "count": 15 },
      { "rating": "4.0-4.5", "count": 8 },
      { "rating": "3.5-4.0", "count": 5 },
      { "rating": "< 3.5", "count": 2 }
    ]
  }
}
```

---

### Dashboard Summary

#### 5. GET `/analytics/dashboard`

**Description:** Get admin dashboard summary

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalStudents": 500,
      "totalInstructors": 30,
      "totalCourses": 25,
      "totalClasses": 80,
      "activeEnrollments": 850,
      "monthlyRevenue": 450000000
    },
    "trends": {
      "enrollments": { "value": 150, "change": 15.4, "trend": "up" },
      "revenue": { "value": 450000000, "change": 18.4, "trend": "up" },
      "students": { "value": 500, "change": 12.0, "trend": "up" }
    },
    "recentActivity": [
      {
        "type": "enrollment",
        "message": "New enrollment: John Doe → RN101",
        "at": "2025-12-15T10:00:00Z"
      },
      {
        "type": "payment",
        "message": "Payment verified: Rp 3,000,000",
        "at": "2025-12-15T09:45:00Z"
      }
    ],
    "alerts": [
      {
        "type": "warning",
        "message": "5 pending payments need verification",
        "count": 5
      },
      { "type": "info", "message": "3 classes starting next week", "count": 3 }
    ]
  }
}
```

---

### Export Reports

#### 6. GET `/analytics/export`

**Description:** Export analytics data as CSV/Excel

**Query Parameters:**

| Param     | Type   | Required | Description                          |
| --------- | ------ | -------- | ------------------------------------ |
| type      | string | Yes      | "enrollments", "revenue", "students" |
| format    | string | No       | "csv", "xlsx" (default: csv)         |
| startDate | string | No       | ISO date                             |
| endDate   | string | No       | ISO date                             |

**Response:** File download

---

## Error Codes

| Code                 | HTTP Status | Description              |
| -------------------- | ----------- | ------------------------ |
| `INVALID_DATE_RANGE` | 400         | Invalid date range       |
| `EXPORT_FAILED`      | 500         | Export generation failed |

---

## Implementation Checklist

### Backend

- [ ] Enrollment analytics endpoint
- [ ] Revenue analytics endpoint
- [ ] Course analytics endpoint
- [ ] Instructor analytics endpoint
- [ ] Dashboard summary endpoint
- [ ] CSV/Excel export
- [ ] Data aggregation queries
- [ ] Caching for heavy queries
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Analytics dashboard page
- [x] Enrollment charts
- [x] Revenue charts
- [x] Course performance table
- [x] Instructor leaderboard
- [x] Export functionality
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
