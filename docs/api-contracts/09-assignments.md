# API Contract: Assignment System

**Module:** Assignment System  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for managing assignments, submissions, and grading. Assignments are exercises within lessons that require instructor grading.

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
type SubmissionType = 'file' | 'text' | 'link';
type AssignmentStatus = 'draft' | 'published' | 'closed';
type SubmissionStatus = 'pending' | 'graded' | 'late' | 'resubmitted';

interface RubricCriteria {
  id: string;
  name: string;
  points: number;
  description: string;
}

interface Assignment {
  id: string;
  title: string;
  course: { id: string; title: string };
  class: { id: string; name: string };
  instructor: { id: string; name: string; avatar: string };
  lesson: { id: string; title: string };
  instructions: string; // HTML content
  submissionTypes: SubmissionType[];
  maxFileSize: number; // in bytes
  allowedFileTypes: string[]; // e.g., [".pdf", ".docx"]
  dueDate: string | null; // ISO datetime
  points: number; // Max points
  rubric: RubricCriteria[];
  autoUnlockNext: boolean; // Auto unlock next lesson after grading
  status: AssignmentStatus;
  submissionStats: {
    total: number;
    submitted: number;
    graded: number;
    pending: number;
    late: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface Submission {
  id: string;
  assignmentId: string;
  student: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  type: SubmissionType;
  content: {
    text?: string; // For text submissions
    fileUrl?: string; // For file submissions
    fileName?: string;
    fileSize?: number;
    linkUrl?: string; // For link submissions
  };
  status: SubmissionStatus;
  submittedAt: string;
  gradedAt?: string;
  gradedBy?: string;
  score?: number;
  feedback?: string;
  rubricScores?: RubricScore[];
  isLate: boolean;
  resubmissionCount: number;
}

interface RubricScore {
  criteriaId: string;
  criteriaName: string;
  score: number;
  maxScore: number;
}
```

---

## Endpoints

### Assignments (Instructor/Admin)

#### 1. GET `/assignments`

**Description:** Get paginated list of assignments

**Query Parameters:**

| Param        | Type             | Required | Description          |
| ------------ | ---------------- | -------- | -------------------- |
| courseId     | string           | No       | Filter by course     |
| classId      | string           | No       | Filter by class      |
| instructorId | string           | No       | Filter by instructor |
| status       | AssignmentStatus | No       | Filter by status     |
| page         | number           | No       | Page number          |
| limit        | number           | No       | Items per page       |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "assignment-1",
      "title": "Creating Logo Design",
      "course": { "id": "course-1", "title": "Design Graphic" },
      "class": { "id": "class-1", "name": "DG101 - Batch 1" },
      "instructor": {
        "id": "instructor-1",
        "name": "Sarah Designer",
        "avatar": "https://example.com/sarah.jpg"
      },
      "lesson": { "id": "lesson-5", "title": "Logo Design Fundamentals" },
      "dueDate": "2025-12-20T23:59:00Z",
      "points": 100,
      "status": "published",
      "submissionStats": {
        "total": 15,
        "submitted": 12,
        "graded": 8,
        "pending": 4,
        "late": 2
      }
    }
  ],
  "meta": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
}
```

---

#### 2. GET `/assignments/:id`

**Description:** Get assignment details with rubric

---

#### 3. POST `/lessons/:lessonId/assignments`

**Description:** Create assignment for a lesson

**Request Body:**

```json
{
  "title": "Logo Design Project",
  "instructions": "<p>Create a logo for...</p>",
  "submissionTypes": ["file", "link"],
  "maxFileSize": 10485760,
  "allowedFileTypes": [".pdf", ".png", ".jpg", ".ai", ".psd"],
  "dueDate": "2025-12-20T23:59:00Z",
  "points": 100,
  "rubric": [
    {
      "name": "Creativity",
      "points": 30,
      "description": "Original and creative design"
    },
    {
      "name": "Technical Execution",
      "points": 40,
      "description": "Clean vectors, proper resolution"
    },
    {
      "name": "Brand Alignment",
      "points": 30,
      "description": "Matches brand guidelines"
    }
  ],
  "autoUnlockNext": true
}
```

---

#### 4. PATCH `/assignments/:id`

**Description:** Update assignment

---

#### 5. DELETE `/assignments/:id`

**Description:** Delete assignment (only if no submissions)

---

### Submissions

#### 6. GET `/assignments/:id/submissions`

**Description:** Get all submissions for an assignment

**Query Parameters:**

| Param  | Type             | Required | Description      |
| ------ | ---------------- | -------- | ---------------- |
| status | SubmissionStatus | No       | Filter by status |
| page   | number           | No       | Page number      |
| limit  | number           | No       | Items per page   |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "submission-1",
      "assignmentId": "assignment-1",
      "student": {
        "id": "student-1",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar": "https://example.com/john.jpg"
      },
      "type": "file",
      "content": {
        "fileUrl": "https://storage.example.com/submissions/logo.pdf",
        "fileName": "logo-design-john.pdf",
        "fileSize": 2048576
      },
      "status": "pending",
      "submittedAt": "2025-12-18T14:30:00Z",
      "isLate": false,
      "resubmissionCount": 0
    }
  ],
  "meta": { "total": 12, "page": 1, "limit": 10, "totalPages": 2 }
}
```

---

#### 7. GET `/submissions/:id`

**Description:** Get single submission with details

---

#### 8. POST `/assignments/:id/submissions`

**Description:** Submit assignment (Student)

**Request Body (File):**

```json
{
  "type": "file",
  "file": "<multipart file upload>"
}
```

**Request Body (Text):**

```json
{
  "type": "text",
  "text": "My submission content..."
}
```

**Request Body (Link):**

```json
{
  "type": "link",
  "linkUrl": "https://figma.com/file/..."
}
```

---

#### 9. PATCH `/submissions/:id/resubmit`

**Description:** Resubmit assignment (Student)

---

### Grading

#### 10. POST `/submissions/:id/grade`

**Description:** Grade a submission (Instructor)

**Request Body:**

```json
{
  "score": 85,
  "feedback": "Great work on the creativity! Consider improving the technical execution.",
  "rubricScores": [
    { "criteriaId": "rubric-1", "score": 28 },
    { "criteriaId": "rubric-2", "score": 32 },
    { "criteriaId": "rubric-3", "score": 25 }
  ]
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
        "criteriaId": "rubric-1",
        "criteriaName": "Creativity",
        "score": 28,
        "maxScore": 30
      },
      {
        "criteriaId": "rubric-2",
        "criteriaName": "Technical Execution",
        "score": 32,
        "maxScore": 40
      },
      {
        "criteriaId": "rubric-3",
        "criteriaName": "Brand Alignment",
        "score": 25,
        "maxScore": 30
      }
    ],
    "gradedAt": "2025-12-19T10:00:00Z",
    "gradedBy": "instructor-1"
  }
}
```

**Side Effects:**

- If `autoUnlockNext` is true, unlocks next lesson
- Awards XP to student
- Sends notification to student

---

#### 11. PATCH `/submissions/:id/grade`

**Description:** Update grade (Instructor)

---

#### 12. GET `/instructors/:id/pending-submissions`

**Description:** Get pending submissions for instructor

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "total": 15,
    "submissions": [
      {
        "id": "submission-1",
        "assignment": { "id": "assignment-1", "title": "Creating Logo" },
        "student": { "id": "student-1", "name": "John Doe" },
        "class": { "id": "class-1", "name": "DG101 - Batch 1" },
        "submittedAt": "2025-12-18T14:30:00Z",
        "isLate": false,
        "daysWaiting": 1
      }
    ]
  }
}
```

---

## File Upload

### Upload Submission File

**Endpoint:** `POST /assignments/:id/submissions/upload`

**Request:** `multipart/form-data`

```
file: <binary>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "fileUrl": "https://storage.example.com/submissions/abc123.pdf",
    "fileName": "logo-design.pdf",
    "fileSize": 2048576
  }
}
```

**Validation:**

- Check file size against `maxFileSize`
- Check file type against `allowedFileTypes`
- Scan for malware (recommended)

---

## Error Codes

| Code                   | HTTP Status | Description                |
| ---------------------- | ----------- | -------------------------- |
| `ASSIGNMENT_NOT_FOUND` | 404         | Assignment not found       |
| `SUBMISSION_NOT_FOUND` | 404         | Submission not found       |
| `ALREADY_SUBMITTED`    | 409         | Student already submitted  |
| `DEADLINE_PASSED`      | 400         | Submission deadline passed |
| `FILE_TOO_LARGE`       | 400         | File exceeds max size      |
| `INVALID_FILE_TYPE`    | 400         | File type not allowed      |
| `ALREADY_GRADED`       | 400         | Submission already graded  |
| `NOT_YOUR_ASSIGNMENT`  | 403         | Not instructor's class     |

---

## Role-Based Access

| Endpoint                | student | instructor | staff | super_admin |
| ----------------------- | ------- | ---------- | ----- | ----------- |
| GET /assignments        | ❌      | ✅ (own)   | ✅    | ✅          |
| POST /assignments       | ❌      | ✅         | ❌    | ✅          |
| GET /submissions        | ❌      | ✅ (own)   | ✅    | ✅          |
| POST /submissions       | ✅      | ❌         | ❌    | ❌          |
| POST /submissions/grade | ❌      | ✅         | ❌    | ✅          |

---

## Implementation Checklist

### Backend

- [ ] Assignment CRUD endpoints
- [ ] Submission endpoints
- [ ] File upload with S3/Cloudinary
- [ ] Grading endpoint with rubric
- [ ] Late submission detection
- [ ] Auto unlock next lesson
- [ ] Email notifications
- [ ] XP award on grading
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Assignment list (instructor)
- [x] Assignment detail page
- [x] Submission list
- [x] Grading interface with rubric
- [x] Student submission form
- [x] File upload component
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
