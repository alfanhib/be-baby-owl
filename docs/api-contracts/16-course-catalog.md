# API Contract: Course Catalog (Public)

**Module:** Course Catalog  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

Public API endpoints for course catalog, course details, and package information. Used by students and public visitors to browse available courses.

**Base URL:** `{API_BASE_URL}/catalog`

---

## Authentication

Most endpoints are **public** (no auth required).  
Some endpoints require Bearer token for personalized data.

---

## Types

```typescript
type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
type CourseCategory =
  | 'web-development'
  | 'mobile-development'
  | 'data-science'
  | 'design'
  | 'business'
  | 'marketing';

interface CourseInstructor {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  bio?: string;
  rating?: number;
  totalStudents?: number;
}

interface CoursePackage {
  id: string;
  name: string;
  meetings: number; // 10, 20, or 50
  price: number;
  priceFormatted: string; // "Rp 3.000.000"
  description: string;
  features: string[];
  popular?: boolean;
}

interface CourseCatalogItem {
  id: string;
  title: string;
  code?: string;
  description: string;
  shortDescription?: string;
  coverImage: string;
  category: CourseCategory;
  level: CourseLevel;
  language: string;
  instructor: CourseInstructor;
  stats: {
    totalLessons: number;
    totalDuration: number; // in minutes
    enrolledStudents: number;
    rating: number;
    reviewCount: number;
  };
  packages: CoursePackage[];
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  createdAt: string;
}

interface CourseDetail extends CourseCatalogItem {
  syllabus: CourseSyllabus[];
  learningOutcomes: string[];
  prerequisites: string[];
  targetAudience: string[];
  faqs: { question: string; answer: string }[];
  reviews: CourseReview[];
  relatedCourses: CourseCatalogItem[];
}

interface CourseSyllabus {
  id: string;
  title: string;
  description?: string;
  lessons: {
    id: string;
    title: string;
    duration: number;
    isPreview?: boolean;
  }[];
}

interface CourseReview {
  id: string;
  studentName: string;
  studentAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}
```

---

## Endpoints

### Course Listing

#### 1. GET `/catalog/courses`

**Description:** Get published courses for catalog

**Query Parameters:**

| Param    | Type           | Required | Description                                              |
| -------- | -------------- | -------- | -------------------------------------------------------- |
| category | CourseCategory | No       | Filter by category                                       |
| level    | CourseLevel    | No       | Filter by level                                          |
| search   | string         | No       | Search by title                                          |
| sort     | string         | No       | "popular", "newest", "rating", "price_low", "price_high" |
| page     | number         | No       | Page number                                              |
| limit    | number         | No       | Items per page                                           |

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "course-1",
      "title": "101 React Native",
      "code": "RN101",
      "description": "Learn to build mobile apps with React Native",
      "shortDescription": "Complete React Native course for beginners",
      "coverImage": "https://example.com/images/rn101.jpg",
      "category": "mobile-development",
      "level": "beginner",
      "language": "Indonesian",
      "instructor": {
        "id": "instructor-1",
        "name": "Dr. Smith",
        "avatar": "https://example.com/avatars/smith.jpg",
        "title": "Senior Mobile Developer",
        "rating": 4.9,
        "totalStudents": 500
      },
      "stats": {
        "totalLessons": 50,
        "totalDuration": 1500,
        "enrolledStudents": 250,
        "rating": 4.8,
        "reviewCount": 120
      },
      "packages": [
        {
          "id": "pkg-10",
          "name": "Starter",
          "meetings": 10,
          "price": 1500000,
          "priceFormatted": "Rp 1.500.000",
          "description": "10 live meetings",
          "features": ["10 live sessions", "Chat support", "Certificate"]
        },
        {
          "id": "pkg-20",
          "name": "Standard",
          "meetings": 20,
          "price": 3000000,
          "priceFormatted": "Rp 3.000.000",
          "description": "20 live meetings",
          "features": [
            "20 live sessions",
            "Priority support",
            "Certificate",
            "Project review"
          ],
          "popular": true
        }
      ],
      "tags": ["react-native", "mobile", "javascript"],
      "isFeatured": true,
      "isNew": false
    }
  ],
  "meta": { "total": 25, "page": 1, "limit": 12, "totalPages": 3 }
}
```

---

#### 2. GET `/catalog/courses/featured`

**Description:** Get featured courses for homepage

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    { "id": "course-1", "title": "101 React Native", ... },
    { "id": "course-2", "title": "UI/UX Design", ... }
  ]
}
```

---

#### 3. GET `/catalog/courses/popular`

**Description:** Get most popular courses

---

#### 4. GET `/catalog/courses/new`

**Description:** Get newest courses

---

### Course Detail

#### 5. GET `/catalog/courses/:slug`

**Description:** Get course detail by slug

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "course-1",
    "title": "101 React Native",
    "slug": "101-react-native",
    "description": "Complete React Native course...",
    "coverImage": "...",
    "category": "mobile-development",
    "level": "beginner",
    "instructor": { ... },
    "stats": { ... },
    "packages": [ ... ],
    "syllabus": [
      {
        "id": "section-1",
        "title": "Getting Started",
        "description": "Introduction to React Native",
        "lessons": [
          { "id": "lesson-1", "title": "What is React Native?", "duration": 15, "isPreview": true },
          { "id": "lesson-2", "title": "Setting Up Environment", "duration": 30 }
        ]
      }
    ],
    "learningOutcomes": [
      "Build cross-platform mobile apps",
      "Understand React Native components",
      "Implement navigation and state management"
    ],
    "prerequisites": [
      "Basic JavaScript knowledge",
      "Familiarity with React (optional)"
    ],
    "targetAudience": [
      "Developers wanting to learn mobile development",
      "React developers expanding to mobile"
    ],
    "faqs": [
      {
        "question": "Do I need prior mobile development experience?",
        "answer": "No, this course starts from the basics."
      }
    ],
    "reviews": [
      {
        "id": "review-1",
        "studentName": "John D.",
        "studentAvatar": "...",
        "rating": 5,
        "comment": "Excellent course! Very comprehensive.",
        "createdAt": "2025-11-15T10:00:00Z"
      }
    ],
    "relatedCourses": [
      { "id": "course-3", "title": "Advanced React Native", ... }
    ]
  }
}
```

---

### Categories & Filters

#### 6. GET `/catalog/categories`

**Description:** Get all course categories with counts

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "web-development",
      "name": "Web Development",
      "count": 8,
      "icon": "globe"
    },
    {
      "id": "mobile-development",
      "name": "Mobile Development",
      "count": 5,
      "icon": "smartphone"
    },
    {
      "id": "data-science",
      "name": "Data Science",
      "count": 4,
      "icon": "chart"
    },
    { "id": "design", "name": "Design", "count": 3, "icon": "palette" }
  ]
}
```

---

#### 7. GET `/catalog/levels`

**Description:** Get course levels

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "beginner",
      "name": "Beginner",
      "description": "No prior experience needed"
    },
    {
      "id": "intermediate",
      "name": "Intermediate",
      "description": "Some experience required"
    },
    {
      "id": "advanced",
      "name": "Advanced",
      "description": "Expert level content"
    }
  ]
}
```

---

### Reviews (Authenticated)

#### 8. POST `/catalog/courses/:courseId/reviews`

**Description:** Submit a review (requires auth, must be enrolled)

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Great course, learned a lot!"
}
```

---

### Instructor Profile

#### 9. GET `/catalog/instructors/:id`

**Description:** Get instructor public profile

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "instructor-1",
    "name": "Dr. Smith",
    "avatar": "...",
    "title": "Senior Mobile Developer",
    "bio": "10+ years of experience in mobile development...",
    "rating": 4.9,
    "totalStudents": 500,
    "totalCourses": 3,
    "courses": [
      { "id": "course-1", "title": "101 React Native", ... }
    ],
    "socialLinks": {
      "linkedin": "...",
      "github": "..."
    }
  }
}
```

---

## Error Codes

| Code                   | HTTP Status | Description                |
| ---------------------- | ----------- | -------------------------- |
| `COURSE_NOT_FOUND`     | 404         | Course not found           |
| `INSTRUCTOR_NOT_FOUND` | 404         | Instructor not found       |
| `NOT_ENROLLED`         | 403         | Must be enrolled to review |
| `ALREADY_REVIEWED`     | 409         | Already submitted a review |

---

## Implementation Checklist

### Backend

- [ ] Course catalog endpoints
- [ ] Category/level lookups
- [ ] Course detail with syllabus
- [ ] Reviews endpoint
- [ ] Instructor profile endpoint
- [ ] Search & filtering
- [ ] Caching for performance
- [ ] Write unit tests

### Frontend

- [x] Course catalog page
- [x] Category filters
- [x] Course detail page
- [x] Syllabus accordion
- [x] Package selection
- [x] Reviews section
- [x] Instructor profile modal
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
