# API Contract: Schedule & Meetings

**Module:** Schedule & Meetings  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for instructor schedule management, meeting scheduling, and calendar features.

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
type EventType =
  | 'live-class'
  | 'workshop'
  | 'quiz'
  | 'special-quest'
  | 'submit-assignment'
  | 'office-hours';
type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

interface ScheduleEvent {
  id: string;
  type: EventType;
  title: string;
  subtitle?: string;
  description?: string;
  classId?: string;
  className?: string;
  courseId?: string;
  courseName?: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  location?: string; // "Online - Zoom", "Room 101"
  meetingLink?: string;
  status: MeetingStatus;
  participants?: {
    studentIds?: string[];
    avatars?: string[];
    totalCount: number;
  };
  isRecurring?: boolean;
  recurrenceRule?: string; // RRULE format
  createdBy: string;
  createdAt: string;
}

interface CreateEventPayload {
  type: EventType;
  title: string;
  description?: string;
  classId?: string;
  start: string;
  end: string;
  location?: string;
  meetingLink?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
}

interface Meeting {
  id: string;
  classId: string;
  className: string;
  courseId: string;
  courseName: string;
  meetingNumber: number; // Meeting 1, 2, 3...
  scheduledAt: string;
  duration: number; // in minutes
  status: MeetingStatus;
  location?: string;
  meetingLink?: string;
  lessonToUnlock?: {
    id: string;
    title: string;
  };
  attendance?: {
    present: number;
    absent: number;
    late: number;
  };
  notes?: string;
  completedAt?: string;
}
```

---

## Endpoints

### Instructor Schedule

#### 1. GET `/instructor/schedule`

**Description:** Get instructor's schedule/calendar

**Query Parameters:**

| Param     | Type      | Required | Description               |
| --------- | --------- | -------- | ------------------------- |
| startDate | string    | No       | Start of date range (ISO) |
| endDate   | string    | No       | End of date range (ISO)   |
| classId   | string    | No       | Filter by class           |
| type      | EventType | No       | Filter by event type      |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "event-1",
      "type": "live-class",
      "title": "React Native - Session 9",
      "subtitle": "Navigation Deep Dive",
      "classId": "class-1",
      "className": "RN101 - Batch 1",
      "courseId": "course-1",
      "courseName": "101 React Native",
      "start": "2025-12-16T19:00:00Z",
      "end": "2025-12-16T21:00:00Z",
      "location": "Online - Zoom",
      "meetingLink": "https://zoom.us/j/123456",
      "status": "scheduled",
      "participants": {
        "avatars": ["url1", "url2", "url3", "url4"],
        "totalCount": 12
      },
      "isRecurring": true,
      "createdBy": "instructor-1",
      "createdAt": "2025-10-01T10:00:00Z"
    },
    {
      "id": "event-2",
      "type": "office-hours",
      "title": "Office Hours",
      "description": "Open Q&A session",
      "start": "2025-12-17T14:00:00Z",
      "end": "2025-12-17T15:00:00Z",
      "location": "Online - Google Meet",
      "status": "scheduled",
      "createdBy": "instructor-1",
      "createdAt": "2025-12-01T10:00:00Z"
    }
  ]
}
```

---

#### 2. POST `/instructor/schedule`

**Description:** Create a new schedule event

**Request Body:**

```json
{
  "type": "live-class",
  "title": "React Native - Session 10",
  "description": "State Management with Redux",
  "classId": "class-1",
  "start": "2025-12-19T19:00:00Z",
  "end": "2025-12-19T21:00:00Z",
  "location": "Online - Zoom",
  "meetingLink": "https://zoom.us/j/123456"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "event-new",
    "type": "live-class",
    "title": "React Native - Session 10",
    ...
  }
}
```

---

#### 3. PATCH `/instructor/schedule/:eventId`

**Description:** Update a schedule event

---

#### 4. DELETE `/instructor/schedule/:eventId`

**Description:** Delete/cancel a schedule event

---

### Class Meetings

#### 5. GET `/instructor/classes/:classId/meetings`

**Description:** Get all meetings for a class

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "classId": "class-1",
    "className": "RN101 - Batch 1",
    "totalMeetings": 20,
    "meetingsScheduled": 10,
    "meetingsCompleted": 8,
    "meetings": [
      {
        "id": "meeting-1",
        "meetingNumber": 1,
        "scheduledAt": "2025-11-04T19:00:00Z",
        "duration": 120,
        "status": "completed",
        "lessonToUnlock": {
          "id": "lesson-1",
          "title": "Introduction to RN"
        },
        "attendance": {
          "present": 11,
          "absent": 1,
          "late": 0
        },
        "completedAt": "2025-11-04T21:00:00Z"
      },
      {
        "id": "meeting-9",
        "meetingNumber": 9,
        "scheduledAt": "2025-12-16T19:00:00Z",
        "duration": 120,
        "status": "scheduled",
        "lessonToUnlock": {
          "id": "lesson-9",
          "title": "Navigation"
        }
      }
    ]
  }
}
```

---

#### 6. POST `/instructor/classes/:classId/meetings`

**Description:** Schedule a new meeting for class

**Request Body:**

```json
{
  "scheduledAt": "2025-12-19T19:00:00Z",
  "duration": 120,
  "location": "Online - Zoom",
  "meetingLink": "https://zoom.us/j/123456",
  "lessonId": "lesson-10",
  "notes": "State management session"
}
```

---

#### 7. PATCH `/instructor/classes/:classId/meetings/:meetingId`

**Description:** Update meeting details

---

#### 8. POST `/instructor/classes/:classId/meetings/:meetingId/complete`

**Description:** Mark meeting as completed

**Request Body:**

```json
{
  "attendance": [
    { "studentId": "student-1", "status": "present" },
    { "studentId": "student-2", "status": "absent" }
  ],
  "unlockLesson": true,
  "notes": "Covered navigation basics"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Meeting completed",
  "data": {
    "meetingId": "meeting-9",
    "status": "completed",
    "completedAt": "2025-12-16T21:00:00Z",
    "attendance": {
      "present": 10,
      "absent": 2,
      "late": 0
    },
    "lessonUnlocked": {
      "id": "lesson-9",
      "title": "Navigation"
    },
    "creditsDeducted": 10
  }
}
```

**Side Effects:**

- Marks meeting as completed
- Records attendance
- Deducts credits from present/late students
- Unlocks associated lesson (if specified)
- Sends notifications to students

---

### Office Hours

#### 9. GET `/instructor/office-hours`

**Description:** Get instructor's office hours

---

#### 10. POST `/instructor/office-hours`

**Description:** Create office hours slot

**Request Body:**

```json
{
  "title": "Weekly Office Hours",
  "description": "Open Q&A for all students",
  "start": "2025-12-17T14:00:00Z",
  "end": "2025-12-17T15:00:00Z",
  "location": "Online - Google Meet",
  "meetingLink": "https://meet.google.com/abc-def-ghi",
  "isRecurring": true,
  "recurrenceRule": "FREQ=WEEKLY;BYDAY=TU"
}
```

---

### Calendar View

#### 11. GET `/instructor/calendar/week`

**Description:** Get week view calendar data

**Query Parameters:**

| Param     | Type   | Required | Description                                        |
| --------- | ------ | -------- | -------------------------------------------------- |
| weekStart | string | No       | Start of week (ISO date, defaults to current week) |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "weekStart": "2025-12-15",
    "weekEnd": "2025-12-21",
    "events": [
      {
        "id": "event-1",
        "type": "live-class",
        "title": "React Native - Session 9",
        "start": "2025-12-16T19:00:00Z",
        "end": "2025-12-16T21:00:00Z",
        "className": "RN101 - Batch 1",
        "hasZoom": true,
        "participants": { "totalCount": 12 }
      }
    ],
    "summary": {
      "totalEvents": 8,
      "liveClasses": 4,
      "officeHours": 2,
      "workshops": 1,
      "other": 1
    }
  }
}
```

---

## Error Codes

| Code                     | HTTP Status | Description                             |
| ------------------------ | ----------- | --------------------------------------- |
| `EVENT_NOT_FOUND`        | 404         | Schedule event not found                |
| `MEETING_NOT_FOUND`      | 404         | Meeting not found                       |
| `SCHEDULE_CONFLICT`      | 409         | Time slot conflicts with existing event |
| `PAST_DATE`              | 400         | Cannot schedule in the past             |
| `MEETING_LIMIT_EXCEEDED` | 400         | Exceeded class meeting limit            |
| `NOT_YOUR_CLASS`         | 403         | Class not assigned to instructor        |

---

## Implementation Checklist

### Backend

- [ ] Instructor schedule CRUD
- [ ] Class meetings CRUD
- [ ] Meeting completion with attendance
- [ ] Office hours management
- [ ] Week/month calendar views
- [ ] Recurring events (RRULE)
- [ ] Conflict detection
- [ ] Notifications on schedule changes
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Instructor schedule page
- [x] Weekly calendar view
- [x] Day view
- [x] Event creation modal
- [x] Event detail modal
- [x] Meeting completion dialog
- [x] Office hours management
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
