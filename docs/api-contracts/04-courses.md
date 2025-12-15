# API Contract: Course Management

**Module:** Course Management  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for managing courses, including course structure (sections/chapters, lessons, exercises). Used by Instructors and Super Admin.

**Base URL:** `{API_BASE_URL}/courses`

---

## Authentication

All endpoints require Bearer token:

```
Authorization: Bearer {accessToken}
```

**Required Roles:** `instructor` (own courses), `super_admin` (all courses)

---

## Types

```typescript
type CourseStatus = 'draft' | 'published' | 'archived';
type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
type CourseCategory =
  | 'web_development'
  | 'mobile_development'
  | 'data_science'
  | 'design'
  | 'marketing'
  | 'business'
  | 'programming'
  | 'devops';
type CourseLanguage = 'indonesian' | 'english';
type ExerciseType =
  | 'video'
  | 'reading'
  | 'quiz'
  | 'assignment'
  | 'material'
  | 'coding';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  category: CourseCategory;
  level: CourseLevel;
  language: CourseLanguage;
  status: CourseStatus;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  stats: {
    totalSections: number;
    totalLessons: number;
    totalExercises: number;
    totalDuration: number; // in minutes
    enrolledStudents: number;
    avgRating: number;
    reviewCount: number;
  };
  pricing?: {
    basePrice: number;
    currency: string;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface Section {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  order: number;
  estimatedDuration: number; // in minutes
  xpReward: number;
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  lessonId: string;
  type: ExerciseType;
  title: string;
  order: number;
  content: ExerciseContent; // Varies by type
  xpReward: number;
}
```

---

## Endpoints

### Course CRUD

#### 1. GET `/courses`

**Description:** Get paginated list of courses with filters

**Query Parameters:**

| Param        | Type           | Required | Description                  |
| ------------ | -------------- | -------- | ---------------------------- |
| status       | CourseStatus   | No       | Filter by status             |
| category     | CourseCategory | No       | Filter by category           |
| level        | CourseLevel    | No       | Filter by level              |
| instructorId | string         | No       | Filter by instructor         |
| search       | string         | No       | Search by title              |
| page         | number         | No       | Page number (default: 1)     |
| limit        | number         | No       | Items per page (default: 10) |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Courses fetched successfully",
  "data": [
    {
      "id": "course-1",
      "title": "101 React Native",
      "slug": "101-react-native",
      "description": "Complete React Native course...",
      "thumbnail": "https://example.com/thumbnails/rn.jpg",
      "category": "mobile_development",
      "level": "beginner",
      "language": "indonesian",
      "status": "published",
      "instructor": {
        "id": "instructor-1",
        "name": "Dr. Smith",
        "avatar": "https://example.com/avatars/smith.jpg"
      },
      "stats": {
        "totalSections": 5,
        "totalLessons": 50,
        "totalExercises": 150,
        "totalDuration": 1200,
        "enrolledStudents": 250,
        "avgRating": 4.8,
        "reviewCount": 120
      },
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-12-01T08:30:00Z",
      "publishedAt": "2025-02-01T00:00:00Z"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

#### 2. GET `/courses/:id`

**Description:** Get single course with full details

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Course fetched successfully",
  "data": {
    "id": "course-1",
    "title": "101 React Native",
    "slug": "101-react-native",
    "description": "Complete React Native course...",
    "shortDescription": "Learn React Native from scratch",
    "thumbnail": "https://example.com/thumbnails/rn.jpg",
    "category": "mobile_development",
    "level": "beginner",
    "language": "indonesian",
    "status": "published",
    "instructor": {
      "id": "instructor-1",
      "name": "Dr. Smith",
      "avatar": "https://example.com/avatars/smith.jpg"
    },
    "stats": {
      "totalSections": 5,
      "totalLessons": 50,
      "totalExercises": 150,
      "totalDuration": 1200,
      "enrolledStudents": 250,
      "avgRating": 4.8,
      "reviewCount": 120
    },
    "pricing": {
      "basePrice": 3000000,
      "currency": "IDR"
    },
    "tags": ["react", "mobile", "javascript"],
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-12-01T08:30:00Z",
    "publishedAt": "2025-02-01T00:00:00Z"
  }
}
```

---

#### 3. GET `/courses/stats`

**Description:** Get course statistics

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Course stats fetched successfully",
  "data": {
    "total": 25,
    "byStatus": {
      "draft": 5,
      "published": 18,
      "archived": 2
    },
    "byCategory": {
      "web_development": 8,
      "mobile_development": 5,
      "data_science": 4,
      "design": 3,
      "marketing": 2,
      "business": 2,
      "programming": 1,
      "devops": 0
    },
    "totalEnrollments": 1500,
    "avgRating": 4.6
  }
}
```

---

#### 4. POST `/courses`

**Description:** Create a new course

**Request Body:**

```json
{
  "title": "Advanced TypeScript",
  "description": "Master TypeScript with advanced patterns...",
  "shortDescription": "Advanced TypeScript course",
  "category": "programming",
  "level": "advanced",
  "language": "english",
  "instructorId": "instructor-2",
  "tags": ["typescript", "programming"]
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "id": "course-new",
    "title": "Advanced TypeScript",
    "slug": "advanced-typescript",
    "status": "draft",
    ...
  }
}
```

---

#### 5. PATCH `/courses/:id`

**Description:** Update course details

**Request Body:** (all fields optional)

```json
{
  "title": "Advanced TypeScript 2.0",
  "description": "Updated description...",
  "category": "programming",
  "level": "advanced",
  "status": "published"
}
```

---

#### 6. PATCH `/courses/:id/status`

**Description:** Update course status only

**Request Body:**

```json
{
  "status": "published"
}
```

---

#### 7. DELETE `/courses/:id`

**Description:** Delete a course (soft delete)

**Notes:**

- Cannot delete courses with active enrollments
- Soft delete: course marked as deleted but data retained

---

### Course Structure

#### 8. GET `/courses/:id/structure`

**Description:** Get full course structure (sections, lessons, exercises)

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Course structure fetched successfully",
  "data": {
    "courseId": "course-1",
    "sections": [
      {
        "id": "section-1",
        "title": "Introduction",
        "description": "Getting started with React Native",
        "order": 1,
        "lessons": [
          {
            "id": "lesson-1",
            "title": "What is React Native?",
            "description": "Introduction to RN",
            "order": 1,
            "estimatedDuration": 15,
            "xpReward": 10,
            "exerciseCount": 3
          }
        ]
      }
    ]
  }
}
```

---

#### 9. POST `/courses/:id/sections`

**Description:** Add a new section to course

**Request Body:**

```json
{
  "title": "New Section",
  "description": "Section description",
  "order": 2
}
```

---

#### 10. PATCH `/courses/:courseId/sections/:sectionId`

**Description:** Update section

---

#### 11. DELETE `/courses/:courseId/sections/:sectionId`

**Description:** Delete section (and all its lessons)

---

#### 12. POST `/courses/:courseId/sections/:sectionId/lessons`

**Description:** Add lesson to section

**Request Body:**

```json
{
  "title": "New Lesson",
  "description": "Lesson description",
  "order": 1,
  "estimatedDuration": 30,
  "xpReward": 15
}
```

---

#### 13. GET `/lessons/:lessonId`

**Description:** Get lesson with exercises

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "lesson-1",
    "title": "What is React Native?",
    "description": "Introduction to RN",
    "order": 1,
    "estimatedDuration": 15,
    "xpReward": 10,
    "exercises": [
      {
        "id": "exercise-1",
        "type": "video",
        "title": "Introduction Video",
        "order": 1,
        "xpReward": 5,
        "content": {
          "videoUrl": "https://youtube.com/...",
          "duration": 300
        }
      },
      {
        "id": "exercise-2",
        "type": "quiz",
        "title": "Quick Check",
        "order": 2,
        "xpReward": 5,
        "content": {
          "questions": [...]
        }
      }
    ]
  }
}
```

---

#### 14. POST `/lessons/:lessonId/exercises`

**Description:** Add exercise to lesson

**Request Body (Video):**

```json
{
  "type": "video",
  "title": "Setup Tutorial",
  "order": 1,
  "xpReward": 5,
  "content": {
    "videoUrl": "https://youtube.com/watch?v=...",
    "duration": 600
  }
}
```

**Request Body (Quiz):**

```json
{
  "type": "quiz",
  "title": "Chapter Quiz",
  "order": 2,
  "xpReward": 10,
  "content": {
    "questions": [
      {
        "type": "multiple_choice",
        "question": "What is React Native?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0
      }
    ],
    "passingScore": 70
  }
}
```

---

#### 15. GET `/courses/lookups/categories`

**Description:** Get categories for dropdown

**Response:**

```json
{
  "success": true,
  "data": [
    { "value": "web_development", "label": "Web Development" },
    { "value": "mobile_development", "label": "Mobile Development" },
    { "value": "data_science", "label": "Data Science" },
    { "value": "design", "label": "Design" },
    { "value": "marketing", "label": "Marketing" },
    { "value": "business", "label": "Business" },
    { "value": "programming", "label": "Programming" },
    { "value": "devops", "label": "DevOps" }
  ]
}
```

---

## Exercise Content Types

### Video Exercise

```typescript
interface VideoContent {
  videoUrl: string; // YouTube or Vimeo URL
  duration: number; // in seconds
  transcript?: string;
  attachments?: FileAttachment[];
}
```

### Quiz Exercise

```typescript
interface QuizContent {
  questions: QuizQuestion[];
  passingScore: number; // 0-100
  timeLimit?: number; // in minutes
  allowRetry: boolean;
  shuffleQuestions: boolean;
}

type QuizQuestionType =
  | 'multiple_choice'
  | 'match_pairs'
  | 'fill_blanks'
  | 'true_false'
  | 'sentence_building'
  | 'listening';
```

### Reading/Material Exercise

```typescript
interface ReadingContent {
  body: string; // HTML content
  attachments?: FileAttachment[];
  estimatedReadTime: number; // in minutes
}
```

### Assignment Exercise

```typescript
interface AssignmentContent {
  instructions: string; // HTML content
  submissionTypes: ('file' | 'text' | 'link')[];
  maxFileSize: number; // in bytes
  allowedFileTypes: string[];
  dueDate?: string;
  rubric?: RubricCriteria[];
}
```

### Coding Exercise

```typescript
interface CodingContent {
  mode: 'challenge' | 'playground';
  language: 'python';
  instructions: string;
  starterCode: string;
  testCases?: TestCase[]; // For challenge mode
  hints?: string[];
  solutionCode?: string;
  timeLimit?: number;
}
```

---

## Error Codes

| Code                       | HTTP Status | Description                           |
| -------------------------- | ----------- | ------------------------------------- |
| `COURSE_NOT_FOUND`         | 404         | Course not found                      |
| `SECTION_NOT_FOUND`        | 404         | Section not found                     |
| `LESSON_NOT_FOUND`         | 404         | Lesson not found                      |
| `HAS_ENROLLMENTS`          | 409         | Cannot delete course with enrollments |
| `INVALID_COURSE_STRUCTURE` | 400         | Invalid course structure              |

---

## Implementation Checklist

### Backend

- [ ] Course CRUD endpoints
- [ ] Section CRUD endpoints
- [ ] Lesson CRUD endpoints
- [ ] Exercise CRUD endpoints
- [ ] Course structure endpoint
- [ ] File upload for thumbnails
- [ ] Slug generation
- [ ] Validation for each exercise type
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Course list page
- [x] Course detail page
- [x] Course form (create/edit)
- [x] Section/lesson editor
- [x] Exercise editors (by type)
- [x] Quiz builder component
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
