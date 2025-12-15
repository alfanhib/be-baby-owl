# API Contract: Attendance Management

**Module:** Attendance (PRD 14)  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for detailed attendance tracking with credit-based system. Each student has meeting credits; attendance determines credit usage.

**Base URL:** `{API_BASE_URL}`

---

## Authentication

All endpoints require Bearer token:

```
Authorization: Bearer {accessToken}
```

---

## Credit System

```
CREDIT RULES:
- Each student has meeting credits (= class.totalMeetings)
- Present = credit used (-1)
- Late = credit used (-1)
- Absent = credit saved (no deduction) - can use for makeup
- Excused = credit saved (no deduction) - special case
```

---

## Types

```typescript
type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

interface StudentAttendance {
  studentId: string;
  studentName: string;
  studentEmail: string;
  enrollmentId: string;
  status: AttendanceStatus;
  creditDeducted: boolean;
  notes?: string;
  markedAt?: string;
  credits: {
    total: number;
    used: number;
    remaining: number;
  };
}

interface ClassMeeting {
  id: string;
  classId: string;
  meetingNumber: number;
  date: string;
  startTime: string;
  endTime: string;
  topic?: string;
  status: MeetingStatus;
  location?: string;
  meetingLink?: string;
  lessonToUnlock?: { id: string; title: string };
  attendance?: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    notMarked: number;
  };
  notes?: string;
  markedBy?: string;
  markedAt?: string;
}

interface AttendanceRecord {
  id: string;
  meetingId: string;
  studentId: string;
  status: AttendanceStatus;
  creditDeducted: boolean;
  notes?: string;
  markedAt: string;
  markedBy: string;
}

interface AttendanceStats {
  studentId: string;
  classId: string;
  totalMeetings: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
  credits: {
    total: number;
    used: number;
    remaining: number;
  };
}
```

---

## Endpoints

### Class Meetings

#### 1. GET `/classes/:classId/meetings`

**Description:** Get all meetings for a class

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "classId": "class-1",
    "className": "RN101 - Batch 1",
    "totalMeetings": 20,
    "stats": {
      "scheduled": 12,
      "completed": 8,
      "cancelled": 0,
      "remaining": 8
    },
    "meetings": [
      {
        "id": "meeting-1",
        "meetingNumber": 1,
        "date": "2025-11-04",
        "startTime": "19:00",
        "endTime": "21:00",
        "topic": "Introduction to React Native",
        "status": "completed",
        "location": "Online - Zoom",
        "lessonToUnlock": { "id": "lesson-1", "title": "Getting Started" },
        "attendance": {
          "total": 12,
          "present": 10,
          "absent": 1,
          "late": 1,
          "excused": 0,
          "notMarked": 0
        },
        "markedAt": "2025-11-04T21:00:00Z",
        "markedBy": "instructor-1"
      },
      {
        "id": "meeting-9",
        "meetingNumber": 9,
        "date": "2025-12-16",
        "startTime": "19:00",
        "endTime": "21:00",
        "topic": "Navigation",
        "status": "scheduled"
      }
    ]
  }
}
```

---

#### 2. GET `/classes/:classId/meetings/:meetingId`

**Description:** Get meeting detail with attendance

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "meeting-8",
    "classId": "class-1",
    "meetingNumber": 8,
    "date": "2025-12-12",
    "startTime": "19:00",
    "endTime": "21:00",
    "topic": "State Management",
    "status": "completed",
    "students": [
      {
        "studentId": "student-1",
        "studentName": "John Doe",
        "studentEmail": "john@example.com",
        "enrollmentId": "enrollment-1",
        "status": "present",
        "creditDeducted": true,
        "notes": null,
        "markedAt": "2025-12-12T19:05:00Z",
        "credits": {
          "total": 20,
          "used": 8,
          "remaining": 12
        }
      },
      {
        "studentId": "student-2",
        "studentName": "Jane Student",
        "enrollmentId": "enrollment-2",
        "status": "absent",
        "creditDeducted": false,
        "notes": "Will use makeup class",
        "credits": {
          "total": 20,
          "used": 7,
          "remaining": 13
        }
      }
    ]
  }
}
```

---

### Attendance Marking

#### 3. POST `/classes/:classId/meetings/:meetingId/attendance`

**Description:** Mark attendance for a meeting (bulk)

**Request Body:**

```json
{
  "attendance": [
    { "studentId": "student-1", "status": "present" },
    { "studentId": "student-2", "status": "absent", "notes": "Sick" },
    { "studentId": "student-3", "status": "late", "notes": "Traffic" },
    {
      "studentId": "student-4",
      "status": "excused",
      "notes": "Family emergency"
    }
  ],
  "unlockLesson": true,
  "meetingNotes": "Covered state management basics"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Attendance marked for 12 students",
  "data": {
    "meetingId": "meeting-8",
    "status": "completed",
    "attendance": {
      "present": 9,
      "absent": 1,
      "late": 1,
      "excused": 1
    },
    "creditsDeducted": 10,
    "lessonUnlocked": { "id": "lesson-8", "title": "State Management" }
  }
}
```

**Side Effects:**

- Updates meeting status to "completed"
- Deducts credits for present/late students
- Unlocks associated lesson if specified
- Sends notifications to students

---

#### 4. PATCH `/classes/:classId/meetings/:meetingId/attendance/:studentId`

**Description:** Update single student attendance

**Request Body:**

```json
{
  "status": "present",
  "notes": "Late arrival corrected to present"
}
```

---

### Student Attendance History

#### 5. GET `/classes/:classId/students/:studentId/attendance`

**Description:** Get attendance history for student in class

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "student": {
      "id": "student-1",
      "name": "John Doe"
    },
    "class": {
      "id": "class-1",
      "name": "RN101 - Batch 1"
    },
    "stats": {
      "totalMeetings": 8,
      "present": 6,
      "absent": 1,
      "late": 1,
      "excused": 0,
      "attendanceRate": 87.5
    },
    "credits": {
      "total": 20,
      "used": 7,
      "remaining": 13
    },
    "history": [
      {
        "meetingId": "meeting-1",
        "meetingNumber": 1,
        "date": "2025-11-04",
        "topic": "Introduction",
        "status": "present",
        "creditDeducted": true
      },
      {
        "meetingId": "meeting-5",
        "meetingNumber": 5,
        "date": "2025-11-25",
        "topic": "Components",
        "status": "absent",
        "creditDeducted": false,
        "notes": "Will use for makeup"
      }
    ]
  }
}
```

---

### Makeup Classes

#### 6. GET `/classes/:classId/makeup-eligible`

**Description:** Get students eligible for makeup class (have unused credits due to absence)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "studentId": "student-2",
      "studentName": "Jane Student",
      "enrollmentId": "enrollment-2",
      "unusedCredits": 2,
      "absences": [
        {
          "meetingId": "meeting-5",
          "date": "2025-11-25",
          "topic": "Components"
        },
        { "meetingId": "meeting-7", "date": "2025-12-09", "topic": "Hooks" }
      ]
    }
  ]
}
```

---

#### 7. POST `/classes/:classId/makeup`

**Description:** Schedule makeup class

**Request Body:**

```json
{
  "studentIds": ["student-2"],
  "date": "2025-12-20",
  "startTime": "14:00",
  "endTime": "16:00",
  "topics": ["Components", "Hooks"],
  "location": "Online - Zoom",
  "meetingLink": "https://zoom.us/j/..."
}
```

---

### Attendance Reports

#### 8. GET `/classes/:classId/attendance/report`

**Description:** Get attendance report for class

**Query Parameters:**

| Param  | Type   | Required | Description          |
| ------ | ------ | -------- | -------------------- |
| format | string | No       | "json", "csv", "pdf" |

**Response (JSON):**

```json
{
  "success": true,
  "data": {
    "classId": "class-1",
    "className": "RN101 - Batch 1",
    "period": {
      "start": "2025-11-04",
      "end": "2025-12-16"
    },
    "summary": {
      "totalMeetings": 8,
      "totalStudents": 12,
      "averageAttendance": 92.5
    },
    "students": [
      {
        "studentId": "student-1",
        "studentName": "John Doe",
        "attendanceRate": 87.5,
        "present": 6,
        "absent": 1,
        "late": 1,
        "creditsRemaining": 13
      }
    ],
    "meetings": [
      {
        "meetingNumber": 1,
        "date": "2025-11-04",
        "attendanceRate": 95,
        "present": 11,
        "absent": 1
      }
    ]
  }
}
```

---

## Error Codes

| Code                    | HTTP Status | Description                   |
| ----------------------- | ----------- | ----------------------------- |
| `MEETING_NOT_FOUND`     | 404         | Meeting not found             |
| `STUDENT_NOT_IN_CLASS`  | 404         | Student not enrolled in class |
| `ALREADY_MARKED`        | 400         | Attendance already marked     |
| `MEETING_NOT_COMPLETED` | 400         | Cannot mark future meeting    |
| `NO_CREDITS_REMAINING`  | 400         | Student has no credits        |

---

## Role-Based Access

| Endpoint          | instructor | staff | super_admin |
| ----------------- | ---------- | ----- | ----------- |
| GET /meetings     | ✅ (own)   | ✅    | ✅          |
| POST /attendance  | ✅ (own)   | ❌    | ✅          |
| PATCH /attendance | ✅ (own)   | ❌    | ✅          |
| GET /report       | ✅ (own)   | ✅    | ✅          |
| POST /makeup      | ✅ (own)   | ✅    | ✅          |

---

## Implementation Checklist

### Backend

- [ ] Class meetings CRUD
- [ ] Bulk attendance marking
- [ ] Credit deduction logic
- [ ] Student attendance history
- [ ] Makeup class scheduling
- [ ] Attendance reports
- [ ] Export (CSV/PDF)
- [ ] Notifications
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Meeting list page
- [x] Attendance marking dialog
- [x] Student attendance card
- [x] Makeup class scheduler
- [x] Attendance report page
- [x] Export buttons
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
