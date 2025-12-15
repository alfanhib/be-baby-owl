# API Contracts - LMS Baby Owl

**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Backend Development

---

## Overview

This directory contains all API contract specifications for the LMS Baby Owl backend. These contracts serve as the agreement between Frontend and Backend teams.

**Base URL (Production):** `https://api.babyowl.com/v1`  
**Base URL (Development):** `http://localhost:4000/api/v1`

---

## API Contract Index

### Authentication & Users

| #   | Document                                 | Description                               | Endpoints | Status   |
| --- | ---------------------------------------- | ----------------------------------------- | --------- | -------- |
| 01  | [Authentication](./01-authentication.md) | Login, register, password management, JWT | 9         | ✅ Ready |
| 03  | [User Management](./03-users.md)         | CRUD users, stats, filters                | 8         | ✅ Ready |

### Student Experience

| #   | Document                                   | Description                            | Endpoints | Status   |
| --- | ------------------------------------------ | -------------------------------------- | --------- | -------- |
| 02  | [Student Dashboard](./dashboard-api.md)    | Dashboard widgets, stats, calendar     | 11        | ✅ Ready |
| 07  | [Student Classes](./07-student-classes.md) | Student-facing class & enrollment view | 5         | ✅ Ready |
| 16  | [Course Catalog](./16-course-catalog.md)   | Public course catalog, detail, reviews | 9         | ✅ Ready |

### Course & Content

| #   | Document                                   | Description                                | Endpoints | Status   |
| --- | ------------------------------------------ | ------------------------------------------ | --------- | -------- |
| 04  | [Course Management](./04-courses.md)       | CRUD courses, chapters, lessons, exercises | 15        | ✅ Ready |
| 08  | [Lesson & Content](./08-lessons.md)        | Lesson detail, exercises, progress, unlock | 10        | ✅ Ready |
| 15  | [Content Library](./15-content-library.md) | Media library, quiz bank                   | 15        | ✅ Ready |

### Class & Enrollment

| #   | Document                                     | Description                                  | Endpoints | Status   |
| --- | -------------------------------------------- | -------------------------------------------- | --------- | -------- |
| 05  | [Class Management](./05-classes.md)          | CRUD classes, roster, meeting stats          | 12        | ✅ Ready |
| 06  | [Enrollment Management](./06-enrollments.md) | CRUD enrollments, transfer, upgrade, credits | 15        | ✅ Ready |
| 19  | [Attendance](./19-attendance.md)             | Attendance tracking, credits, makeup         | 8         | ✅ Ready |

### Assignment & Grading

| #   | Document                                 | Description                                | Endpoints | Status   |
| --- | ---------------------------------------- | ------------------------------------------ | --------- | -------- |
| 09  | [Assignment System](./09-assignments.md) | Assignments, submissions, grading, rubrics | 12        | ✅ Ready |

### Instructor Tools

| #   | Document                                                 | Description                            | Endpoints | Status   |
| --- | -------------------------------------------------------- | -------------------------------------- | --------- | -------- |
| 10  | [Instructor Dashboard](./10-instructor.md)               | Instructor-specific endpoints          | 15        | ✅ Ready |
| 12  | [Schedule & Meetings](./12-schedule.md)                  | Instructor schedule, meetings          | 11        | ✅ Ready |
| 22  | [Instructor Students](./22-instructor-students.md)       | Student monitoring, reports, messaging | 9         | ✅ Ready |
| 24  | [Instructor Assignments](./24-instructor-assignments.md) | Assignment grading workflow            | 9         | ✅ Ready |
| 25  | [Instructor Analytics](./25-instructor-analytics.md)     | Teaching performance analytics         | 10        | ✅ Ready |

### Staff & Admin

| #   | Document                                   | Description                           | Endpoints | Status   |
| --- | ------------------------------------------ | ------------------------------------- | --------- | -------- |
| 17  | [Staff Dashboard](./17-staff-dashboard.md) | Staff dashboard, quick enrollment     | 7         | ✅ Ready |
| 18  | [Super Admin](./18-super-admin.md)         | Admin dashboard, system config, audit | 15        | ✅ Ready |
| 20  | [Admin Students](./20-students-admin.md)   | Admin student management, bulk ops    | 12        | ✅ Ready |
| 21  | [User Details](./21-user-details.md)       | Extended user profiles                | 9         | ✅ Ready |

### Operations & Analytics

| #   | Document                                     | Description                         | Endpoints | Status   |
| --- | -------------------------------------------- | ----------------------------------- | --------- | -------- |
| 11  | [Analytics](./11-analytics.md)               | System analytics, reports           | 6         | ✅ Ready |
| 13  | [Payments](./13-payments.md)                 | Payment tracking, verification      | 10        | ✅ Ready |
| 14  | [Activity Logs](./14-activity-logs.md)       | Audit trail, activity tracking      | 6         | ✅ Ready |
| 23  | [Course Analytics](./23-course-analytics.md) | Course-specific analytics, drop-off | 6         | ✅ Ready |

---

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## Authentication

All endpoints (except auth) require Bearer token in Authorization header:

```
Authorization: Bearer {accessToken}
```

---

## Common HTTP Status Codes

| Code | Description                              |
| ---- | ---------------------------------------- |
| 200  | Success                                  |
| 201  | Created                                  |
| 400  | Bad Request - Invalid input              |
| 401  | Unauthorized - Missing/invalid token     |
| 403  | Forbidden - Insufficient permissions     |
| 404  | Not Found                                |
| 409  | Conflict - Resource already exists       |
| 422  | Unprocessable Entity - Validation failed |
| 500  | Internal Server Error                    |

---

## User Roles

| Role          | Description   | Access Level                    |
| ------------- | ------------- | ------------------------------- |
| `student`     | Learning user | Own data, enrolled courses      |
| `instructor`  | Teaching user | Own classes, assigned students  |
| `staff`       | Operations    | Students, enrollments, payments |
| `super_admin` | Full access   | All features, system config     |

---

## Development Notes

### Using Dummy Data

Frontend uses `NEXT_PUBLIC_USE_DUMMY_API=true` to switch between dummy and real API. All dummy data files are in `src/lib/api/dummy/`.

### API Client

Frontend API client is in `src/lib/api/client.ts` with:

- Axios instance with interceptors
- Token refresh handling
- Error handling

### React Query Hooks

All data fetching uses React Query hooks in `src/lib/hooks/`. Hooks follow naming pattern:

- `useXxx()` - GET single/list
- `useCreateXxx()` - POST
- `useUpdateXxx()` - PATCH
- `useDeleteXxx()` - DELETE

---

## Contact

**Backend Team:** @backend-team  
**Frontend Team:** @frontend-team  
**Slack Channel:** #dev-api

---

**Total Endpoints:** ~230+  
**Total Documents:** 25  
**Last Updated:** December 15, 2025
