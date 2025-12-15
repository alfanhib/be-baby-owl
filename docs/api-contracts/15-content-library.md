# API Contract: Content Library

**Module:** Content Library (Media + Quiz Bank)  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for managing reusable content: Media Library (videos, images, documents) and Quiz Bank (question pools). Content can be shared across multiple courses.

**Base URL:** `{API_BASE_URL}`

---

## Authentication

All endpoints require Bearer token:

```
Authorization: Bearer {accessToken}
```

**Required Roles:** `instructor` (own content), `super_admin` (all content)

---

## Types

### Media Library

```typescript
type MediaType = 'video' | 'image' | 'pdf' | 'document' | 'audio';
type MediaStatus = 'active' | 'archived';

interface MediaItem {
  id: string;
  name: string;
  description: string;
  type: MediaType;
  status: MediaStatus;
  url: string;
  thumbnailUrl?: string;
  fileSize: number; // in bytes
  mimeType: string;
  duration?: number; // for video/audio in seconds
  dimensions?: { width: number; height: number };
  uploadedBy: { id: string; name: string };
  uploadedAt: string;
  usedInCourses: number;
  tags: string[];
}

interface MediaFilters {
  type?: MediaType;
  status?: MediaStatus;
  uploadedBy?: string;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

interface MediaStats {
  total: number;
  byType: Record<MediaType, number>;
  totalSize: number; // in bytes
  usageCount: number;
}
```

### Quiz Bank

```typescript
type QuizType =
  | 'multiple_choice'
  | 'match_pairs'
  | 'fill_blanks'
  | 'true_false'
  | 'sentence_building'
  | 'listening';
type QuizStatus = 'published' | 'draft' | 'archived';
type QuizDifficulty = 'easy' | 'medium' | 'hard';

interface QuizQuestion {
  id: string;
  type: QuizType;
  status: QuizStatus;
  difficulty: QuizDifficulty;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string | number | number[];
  explanation?: string;
  points: number;
  tags: string[];
  category?: string;
  audioUrl?: string; // For listening questions
  imageUrl?: string;
  createdBy: { id: string; name: string };
  createdAt: string;
  usedInExercises: number;
}

interface QuizFilters {
  type?: QuizType;
  status?: QuizStatus;
  difficulty?: QuizDifficulty;
  category?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
}
```

---

## Endpoints

### Media Library

#### 1. GET `/media`

**Description:** Get paginated media items

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "media-1",
      "name": "Introduction Video",
      "description": "Course introduction video",
      "type": "video",
      "status": "active",
      "url": "https://storage.example.com/videos/intro.mp4",
      "thumbnailUrl": "https://storage.example.com/thumbs/intro.jpg",
      "fileSize": 52428800,
      "mimeType": "video/mp4",
      "duration": 300,
      "dimensions": { "width": 1920, "height": 1080 },
      "uploadedBy": { "id": "instructor-1", "name": "Dr. Smith" },
      "uploadedAt": "2025-11-01T10:00:00Z",
      "usedInCourses": 3,
      "tags": ["introduction", "welcome"]
    }
  ],
  "meta": { "total": 200, "page": 1, "limit": 20, "totalPages": 10 }
}
```

---

#### 2. GET `/media/:id`

**Description:** Get single media item

---

#### 3. GET `/media/stats`

**Description:** Get media library statistics

---

#### 4. POST `/media/upload`

**Description:** Upload new media file

**Request:** `multipart/form-data`

```
file: <binary>
name: "Introduction Video"
description: "Course introduction"
tags: ["intro", "welcome"]
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": {
    "id": "media-new",
    "url": "https://storage.example.com/videos/new.mp4",
    ...
  }
}
```

---

#### 5. PATCH `/media/:id`

**Description:** Update media metadata

---

#### 6. DELETE `/media/:id`

**Description:** Delete media (only if not used in any course)

---

### Quiz Bank

#### 7. GET `/quiz-bank`

**Description:** Get paginated quiz questions

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "quiz-1",
      "type": "multiple_choice",
      "status": "published",
      "difficulty": "easy",
      "question": "What is React Native?",
      "options": [
        "A JavaScript framework for mobile apps",
        "A database system",
        "A web server",
        "A CSS framework"
      ],
      "correctAnswer": 0,
      "explanation": "React Native is a framework for building native mobile apps using JavaScript and React.",
      "points": 10,
      "tags": ["react-native", "basics"],
      "category": "mobile-development",
      "createdBy": { "id": "instructor-1", "name": "Dr. Smith" },
      "createdAt": "2025-10-01T10:00:00Z",
      "usedInExercises": 5
    }
  ],
  "meta": { "total": 500, "page": 1, "limit": 20, "totalPages": 25 }
}
```

---

#### 8. GET `/quiz-bank/:id`

**Description:** Get single quiz question

---

#### 9. GET `/quiz-bank/stats`

**Description:** Get quiz bank statistics

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 500,
    "byType": {
      "multiple_choice": 200,
      "true_false": 100,
      "fill_blanks": 80,
      "match_pairs": 60,
      "sentence_building": 40,
      "listening": 20
    },
    "byDifficulty": {
      "easy": 200,
      "medium": 200,
      "hard": 100
    },
    "byCategory": [{ "category": "mobile-development", "count": 150 }]
  }
}
```

---

#### 10. POST `/quiz-bank`

**Description:** Create new quiz question

**Request Body:**

```json
{
  "type": "multiple_choice",
  "difficulty": "medium",
  "question": "Which hook is used for side effects in React?",
  "options": ["useState", "useEffect", "useContext", "useReducer"],
  "correctAnswer": 1,
  "explanation": "useEffect is used for handling side effects.",
  "points": 10,
  "tags": ["react", "hooks"],
  "category": "web-development"
}
```

---

#### 11. POST `/quiz-bank/bulk`

**Description:** Bulk import quiz questions (CSV/JSON)

**Request Body:**

```json
{
  "format": "json",
  "questions": [
    { "type": "multiple_choice", "question": "...", ... },
    { "type": "true_false", "question": "...", ... }
  ]
}
```

---

#### 12. PATCH `/quiz-bank/:id`

**Description:** Update quiz question

---

#### 13. DELETE `/quiz-bank/:id`

**Description:** Delete quiz question (only if not used)

---

#### 14. GET `/quiz-bank/categories`

**Description:** Get available categories

---

#### 15. GET `/quiz-bank/tags`

**Description:** Get all unique tags

---

## Error Codes

| Code                | HTTP Status | Description                          |
| ------------------- | ----------- | ------------------------------------ |
| `MEDIA_NOT_FOUND`   | 404         | Media item not found                 |
| `QUIZ_NOT_FOUND`    | 404         | Quiz question not found              |
| `MEDIA_IN_USE`      | 409         | Cannot delete media used in courses  |
| `QUIZ_IN_USE`       | 409         | Cannot delete quiz used in exercises |
| `FILE_TOO_LARGE`    | 400         | File exceeds size limit              |
| `INVALID_FILE_TYPE` | 400         | File type not supported              |

---

## File Upload Limits

| Type     | Max Size | Allowed Extensions      |
| -------- | -------- | ----------------------- |
| Video    | 500MB    | .mp4, .webm, .mov       |
| Audio    | 100MB    | .mp3, .wav, .ogg        |
| Image    | 10MB     | .jpg, .png, .gif, .webp |
| PDF      | 50MB     | .pdf                    |
| Document | 20MB     | .docx, .xlsx, .pptx     |

---

## Implementation Checklist

### Backend

- [ ] Media CRUD endpoints
- [ ] File upload to S3/Cloudinary
- [ ] Video transcoding (optional)
- [ ] Thumbnail generation
- [ ] Quiz bank CRUD
- [ ] Bulk import (CSV/JSON)
- [ ] Usage tracking
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Media library page
- [x] Upload dialog with drag-drop
- [x] Quiz bank page
- [x] Question editor (by type)
- [x] Bulk import dialog
- [x] Category/tag management
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
