# API Contract: Instructor Assignment Management

**Module:** Instructor Assignment Management (PRD 17)  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for instructor-specific assignment management and grading workflow. Includes submission review, rubric-based grading, bulk grading, and feedback.

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
type SubmissionStatus =
  | 'pending'
  | 'submitted'
  | 'graded'
  | 'late'
  | 'resubmitted';

interface RubricItem {
  id: string;
  criteria: string;
  description: string;
  maxPoints: number;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  courseId: string;
  courseName: string;
  classId: string;
  className: string;
  lessonId: string;
  lessonTitle: string;
  sectionTitle: string;
  dueDate: string;
  maxScore: number;
  rubric?: RubricItem[];
  attachments?: { name: string; url: string; size: string }[];
  allowLateSubmission: boolean;
  latePenalty: number; // percentage deducted
  createdAt: string;
  // Stats
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  pendingCount: number;
  lateCount: number;
  averageScore: number | null;
}

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string;
  courseName: string;
  className: string;
  submittedAt: string | null;
  status: SubmissionStatus;
  // Content
  content?: string;
  fileUrl?: string;
  fileName?: string;
  linkUrl?: string;
  // Grading
  score?: number;
  feedback?: string;
  rubricScores?: { criteriaId: string; score: number }[];
  gradedAt?: string;
  gradedBy?: string;
  isLate: boolean;
  latePenaltyApplied?: number;
  resubmissionCount: number;
}

interface GradePayload {
  score: number;
  feedback: string;
  rubricScores?: { criteriaId: string; score: number }[];
  applyLatePenalty?: boolean;
}

interface BulkGradePayload {
  submissions: {
    submissionId: string;
    score: number;
    feedback?: string;
  }[];
}

interface AssignmentFilters {
  classId?: string;
  courseId?: string;
  status?: 'all' | 'pending' | 'graded';
  search?: string;
  sortBy?: 'dueDate' | 'title' | 'pendingCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
```

---

## Endpoints

### Assignments List

#### 1. GET `/instructor/assignments`

**Description:** Get all assignments for instructor's classes

**Query Parameters:**

| Param     | Type   | Required | Description                |
| --------- | ------ | -------- | -------------------------- |
| classId   | string | No       | Filter by class            |
| courseId  | string | No       | Filter by course           |
| status    | string | No       | "all", "pending", "graded" |
| search    | string | No       | Search by title            |
| sortBy    | string | No       | Sort field                 |
| sortOrder | string | No       | "asc", "desc"              |
| page      | number | No       | Page number                |
| limit     | number | No       | Items per page             |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "assignment-1",
      "title": "Logo Design Project",
      "description": "Create a logo for a startup",
      "instructions": "<p>Design a modern logo...</p>",
      "courseId": "course-3",
      "courseName": "UI/UX Design",
      "classId": "class-5",
      "className": "DG101 - Batch 1",
      "lessonId": "lesson-15",
      "lessonTitle": "Logo Design",
      "sectionTitle": "Branding",
      "dueDate": "2025-12-20T23:59:00Z",
      "maxScore": 100,
      "rubric": [
        {
          "id": "r1",
          "criteria": "Creativity",
          "description": "Original design",
          "maxPoints": 30
        },
        {
          "id": "r2",
          "criteria": "Technical",
          "description": "Clean vectors",
          "maxPoints": 40
        },
        {
          "id": "r3",
          "criteria": "Branding",
          "description": "Matches brief",
          "maxPoints": 30
        }
      ],
      "attachments": [
        { "name": "brief.pdf", "url": "https://...", "size": "2.1 MB" }
      ],
      "allowLateSubmission": true,
      "latePenalty": 10,
      "createdAt": "2025-12-01T10:00:00Z",
      "totalStudents": 15,
      "submittedCount": 12,
      "gradedCount": 8,
      "pendingCount": 4,
      "lateCount": 2,
      "averageScore": 82
    }
  ],
  "meta": { "total": 25, "page": 1, "limit": 10, "totalPages": 3 }
}
```

---

#### 2. GET `/instructor/assignments/:id`

**Description:** Get single assignment details

---

### Submissions

#### 3. GET `/instructor/assignments/:id/submissions`

**Description:** Get all submissions for an assignment

**Query Parameters:**

| Param  | Type             | Required | Description                           |
| ------ | ---------------- | -------- | ------------------------------------- |
| status | SubmissionStatus | No       | Filter by status                      |
| search | string           | No       | Search by student name                |
| sortBy | string           | No       | "submittedAt", "score", "studentName" |
| page   | number           | No       | Page number                           |
| limit  | number           | No       | Items per page                        |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "submission-1",
      "assignmentId": "assignment-1",
      "assignmentTitle": "Logo Design Project",
      "studentId": "student-1",
      "studentName": "John Doe",
      "studentEmail": "john@example.com",
      "studentAvatar": "https://...",
      "courseName": "UI/UX Design",
      "className": "DG101 - Batch 1",
      "submittedAt": "2025-12-18T14:30:00Z",
      "status": "submitted",
      "fileUrl": "https://storage.../logo-john.pdf",
      "fileName": "logo-design-final.pdf",
      "isLate": false,
      "resubmissionCount": 0
    }
  ],
  "meta": { "total": 12, "page": 1, "limit": 10, "totalPages": 2 }
}
```

---

#### 4. GET `/instructor/submissions/:id`

**Description:** Get single submission with full details

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "submission-1",
    "assignmentId": "assignment-1",
    "assignmentTitle": "Logo Design Project",
    "assignment": {
      "title": "Logo Design Project",
      "instructions": "<p>...</p>",
      "maxScore": 100,
      "rubric": [...],
      "dueDate": "2025-12-20T23:59:00Z"
    },
    "studentId": "student-1",
    "studentName": "John Doe",
    "studentEmail": "john@example.com",
    "studentAvatar": "...",
    "submittedAt": "2025-12-18T14:30:00Z",
    "status": "submitted",
    "content": "Here is my logo design submission...",
    "fileUrl": "https://storage.../logo.pdf",
    "fileName": "logo-design-final.pdf",
    "isLate": false,
    "resubmissionCount": 0,
    "previousSubmissions": []
  }
}
```

---

#### 5. GET `/instructor/submissions/pending`

**Description:** Get all pending submissions across all assignments

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalPending": 15,
    "submissions": [
      {
        "id": "submission-1",
        "assignmentId": "assignment-1",
        "assignmentTitle": "Logo Design",
        "studentId": "student-1",
        "studentName": "John Doe",
        "studentAvatar": "...",
        "className": "DG101 - Batch 1",
        "submittedAt": "2025-12-18T14:30:00Z",
        "daysWaiting": 2,
        "isLate": false,
        "priority": "high"
      }
    ]
  }
}
```

---

### Grading

#### 6. POST `/instructor/submissions/:id/grade`

**Description:** Grade a submission

**Request Body:**

```json
{
  "score": 85,
  "feedback": "Great work on the creativity! Consider improving the technical execution of the vectors.",
  "rubricScores": [
    { "criteriaId": "r1", "score": 28 },
    { "criteriaId": "r2", "score": 32 },
    { "criteriaId": "r3", "score": 25 }
  ],
  "applyLatePenalty": false
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Submission graded successfully",
  "data": {
    "id": "submission-1",
    "status": "graded",
    "score": 85,
    "feedback": "Great work on the creativity!...",
    "rubricScores": [
      {
        "criteriaId": "r1",
        "criteria": "Creativity",
        "score": 28,
        "maxPoints": 30
      },
      {
        "criteriaId": "r2",
        "criteria": "Technical",
        "score": 32,
        "maxPoints": 40
      },
      {
        "criteriaId": "r3",
        "criteria": "Branding",
        "score": 25,
        "maxPoints": 30
      }
    ],
    "gradedAt": "2025-12-19T10:00:00Z",
    "gradedBy": "instructor-1",
    "xpAwarded": 50,
    "nextLessonUnlocked": true
  }
}
```

**Side Effects:**

- Updates submission status to "graded"
- Awards XP to student
- Unlocks next lesson if configured
- Sends notification to student

---

#### 7. PATCH `/instructor/submissions/:id/grade`

**Description:** Update existing grade

---

#### 8. POST `/instructor/submissions/bulk-grade`

**Description:** Bulk grade multiple submissions

**Request Body:**

```json
{
  "submissions": [
    { "submissionId": "sub-1", "score": 85, "feedback": "Good work!" },
    { "submissionId": "sub-2", "score": 78, "feedback": "Needs improvement" },
    { "submissionId": "sub-3", "score": 92, "feedback": "Excellent!" }
  ]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "3 submissions graded successfully",
  "data": {
    "graded": 3,
    "failed": 0,
    "results": [
      { "submissionId": "sub-1", "status": "success", "score": 85 },
      { "submissionId": "sub-2", "status": "success", "score": 78 },
      { "submissionId": "sub-3", "status": "success", "score": 92 }
    ]
  }
}
```

---

### Assignment Stats

#### 9. GET `/instructor/assignments/stats`

**Description:** Get assignment statistics

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalAssignments": 25,
    "totalPendingSubmissions": 15,
    "averageGradingTime": 2.5, // days
    "submissionStats": {
      "total": 300,
      "submitted": 280,
      "graded": 250,
      "pending": 30,
      "late": 25
    },
    "averageScores": {
      "overall": 82,
      "byClass": [
        { "classId": "class-1", "className": "RN101", "avgScore": 85 }
      ]
    }
  }
}
```

---

## Error Codes

| Code                   | HTTP Status | Description                           |
| ---------------------- | ----------- | ------------------------------------- |
| `ASSIGNMENT_NOT_FOUND` | 404         | Assignment not found                  |
| `SUBMISSION_NOT_FOUND` | 404         | Submission not found                  |
| `NOT_YOUR_ASSIGNMENT`  | 403         | Assignment not in instructor's class  |
| `ALREADY_GRADED`       | 400         | Submission already graded (use PATCH) |
| `INVALID_SCORE`        | 400         | Score exceeds max score               |
| `RUBRIC_MISMATCH`      | 400         | Rubric scores don't match criteria    |

---

## Grading Workflow

```
1. Instructor opens pending submissions
2. Reviews submission content/file
3. (Optional) Uses rubric for scoring
4. Enters score and feedback
5. Submit grade
6. System:
   - Updates submission status
   - Awards XP to student
   - Unlocks next lesson (if configured)
   - Sends notification to student
```

---

## Implementation Checklist

### Backend

- [ ] Assignments list endpoint
- [ ] Assignment detail endpoint
- [ ] Submissions list endpoint
- [ ] Submission detail endpoint
- [ ] Pending submissions endpoint
- [ ] Grade submission endpoint
- [ ] Update grade endpoint
- [ ] Bulk grade endpoint
- [ ] Stats endpoint
- [ ] Late penalty calculation
- [ ] XP award on grading
- [ ] Notification sending
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Assignments list page
- [x] Assignment detail page
- [x] Submissions list
- [x] Grading interface
- [x] Rubric grading component
- [x] Bulk grade dialog
- [x] Pending submissions widget
- [x] Stats dashboard
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
