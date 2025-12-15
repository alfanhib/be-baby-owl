# Technical Specification

**Document Type:** Technical Specification  
**Project:** LMS Baby Owl  
**Version:** 1.0  
**Date:** December 1, 2025  
**Status:** Ready for Implementation

---

## 📑 Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Specification](#api-specification)
5. [Integration Specifications](#integration-specifications)
6. [Security Specifications](#security-specifications)
7. [Performance Requirements](#performance-requirements)
8. [Infrastructure & DevOps](#infrastructure--devops)

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Student Web App          Instructor Web App            │
│  (Next.js 14)             (Next.js 14)                  │
│                                                          │
│  Admin Dashboard          Landing Page                   │
│  (Next.js 14)             (Next.js / Separate)          │
│                                                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS / REST API
                     │
┌────────────────────▼────────────────────────────────────┐
│                  API GATEWAY                             │
│           (Next.js API Routes / Express)                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Authentication    Course Service    Class Service      │
│  User Service      Content Service   Progress Service   │
│  Payment Service   Gamification      Notification       │
│                                                          │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼──────┐ ┌──▼──────────┐
│              │ │         │ │             │
│  PostgreSQL  │ │  Redis  │ │  S3/Cloud   │
│  (Database)  │ │ (Cache) │ │ (Files)     │
│              │ │         │ │             │
└──────────────┘ └─────────┘ └─────────────┘

EXTERNAL SERVICES:
- Email Service (Resend/SendGrid)
- WhatsApp Business API (Future)
- Payment Gateway (Future - Midtrans/Xendit)
```

### Microservices Architecture (Future)

For MVP: Monolithic Next.js app
For Scale (1000+ users): Microservices

```
API Gateway
├── Auth Service
├── User Service
├── Course Service
├── Class Service
├── Progress Service
├── Gamification Service
├── Notification Service
└── Payment Service
```

---

## 💻 Technology Stack

### Frontend

| Component            | Technology               | Version | Justification                                      |
| -------------------- | ------------------------ | ------- | -------------------------------------------------- |
| **Framework**        | Next.js                  | 14.x    | SSR, SEO, API routes, file-based routing           |
| **Language**         | TypeScript               | 5.x     | Type safety, better DX, fewer bugs                 |
| **Styling**          | Tailwind CSS             | 3.x     | Utility-first, fast development, consistent design |
| **UI Components**    | shadcn/ui                | Latest  | Accessible, customizable, Tailwind-based           |
| **State Management** | Zustand                  | 4.x     | Lightweight, simple API, TypeScript support        |
| **Data Fetching**    | React Query              | 5.x     | Caching, optimistic updates, loading states        |
| **Forms**            | React Hook Form          | 7.x     | Performance, validation, TypeScript support        |
| **Validation**       | Zod                      | 3.x     | Schema validation, TypeScript inference            |
| **HTTP Client**      | Axios                    | 1.x     | Interceptors, request cancellation                 |
| **Testing**          | Vitest + Testing Library | Latest  | Fast, modern, React-focused                        |
| **Code Editor**      | Monaco Editor            | 0.45.x  | VS Code engine, syntax highlighting, autocomplete  |
| **Python Runtime**   | Pyodide                  | 0.25.x  | WebAssembly Python, browser-based execution        |

### Backend

| Component          | Technology                    | Version    | Justification                                 |
| ------------------ | ----------------------------- | ---------- | --------------------------------------------- |
| **Runtime**        | Node.js                       | 20.x LTS   | JavaScript/TypeScript, large ecosystem        |
| **Framework**      | Next.js API Routes OR Express | 14.x / 4.x | Integrated with frontend OR standalone        |
| **Language**       | TypeScript                    | 5.x        | Type safety, maintainability                  |
| **Database**       | PostgreSQL                    | 15.x       | Relational data, ACID compliance, scalability |
| **ORM**            | Prisma                        | 5.x        | Type-safe queries, migrations, great DX       |
| **Authentication** | JWT + bcrypt                  | -          | Stateless, secure password hashing            |
| **Email**          | Resend                        | Latest     | Modern API, reliable delivery                 |
| **File Storage**   | AWS S3 OR Cloudinary          | -          | Scalable, CDN-backed                          |
| **Caching**        | Redis                         | 7.x        | Session storage, rate limiting, caching       |
| **Testing**        | Jest                          | 29.x       | Unit tests, integration tests                 |

### Infrastructure

| Component              | Technology                   | Justification                                  |
| ---------------------- | ---------------------------- | ---------------------------------------------- |
| **Hosting (Frontend)** | Vercel                       | Next.js optimized, global CDN, easy deployment |
| **Hosting (Backend)**  | AWS / DigitalOcean / Railway | Scalable, managed services                     |
| **Database**           | Supabase / AWS RDS           | Managed PostgreSQL, backups, scaling           |
| **CDN**                | Cloudflare / Vercel Edge     | Fast asset delivery, DDoS protection           |
| **Monitoring**         | Sentry + LogRocket           | Error tracking, session replay                 |
| **Analytics**          | Google Analytics + Mixpanel  | User behavior, conversion tracking             |
| **CI/CD**              | GitHub Actions               | Automated testing, deployment                  |

---

## 🗄️ Database Schema

### Core Tables

#### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- bcrypt hashed, nullable for OAuth users
  full_name VARCHAR(255) NOT NULL,
  avatar VARCHAR(500),
  bio TEXT,
  role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'instructor', 'staff', 'super_admin')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  email_verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### courses

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  code VARCHAR(20),
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  cover_image VARCHAR(500),
  category VARCHAR(100),
  level VARCHAR(50) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  language VARCHAR(50) DEFAULT 'indonesian',
  estimated_duration INT, -- hours
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_category ON courses(category);
```

#### sections

```sql
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sections_course ON sections(course_id);
```

#### lessons

```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  estimated_duration INT, -- minutes (sum of all exercises)
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lessons_section ON lessons(section_id);
```

#### exercises

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('video', 'quiz', 'material', 'assignment', 'coding')),
  content JSONB NOT NULL, -- Flexible content storage based on type
  order_index INT NOT NULL,
  estimated_duration INT, -- minutes
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exercises_lesson ON exercises(lesson_id);
CREATE INDEX idx_exercises_type ON exercises(type);
```

**Coding Exercise Content Schema (JSONB):**

```json
{
  "mode": "challenge | playground",
  "language": "python",
  "instructions": "<h2>HTML instructions</h2>",
  "starterCode": "def solve():\n    pass",
  "testCases": [
    {
      "id": "tc1",
      "name": "Test 1: Basic case",
      "input": "solve(5, 3)",
      "expectedOutput": "15",
      "isHidden": false,
      "points": 10
    }
  ],
  "requiredPackages": ["numpy", "matplotlib"],
  "hints": ["Hint 1", "Hint 2"],
  "solutionCode": "def solve():\n    return 15",
  "timeLimit": 30,
  "maxPoints": 30,
  "outputType": "console | visual | auto",
  "completionCriteria": "all_tests_pass | run_once"
}
```

#### classes

```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  course_id UUID REFERENCES courses(id),
  instructor_id UUID REFERENCES users(id),
  type VARCHAR(50) CHECK (type IN ('group', 'private')),
  max_capacity INT CHECK (max_capacity > 0),
  current_capacity INT DEFAULT 0,

  -- Package Configuration (CLASS LEVEL)
  -- 1 Meeting = 1 Lesson (fixed ratio)
  total_meetings INT NOT NULL CHECK (total_meetings > 0), -- Package: 10, 20, 30, 50 or custom
  -- Note: total_meetings = max lessons accessible

  -- Meeting Progress Tracking
  meetings_completed INT DEFAULT 0,
  meetings_scheduled INT DEFAULT 0,
  -- meetings_remaining is calculated: total_meetings - meetings_completed

  -- Lesson Progress (class-level unlocking)
  lessons_unlocked INT DEFAULT 0,
  -- Note: lessons_unlocked should not exceed meetings_completed (1:1 enforcement)

  -- Schedule & Dates
  schedule JSONB, -- { days: ['Monday', 'Thursday'], time: '19:00-21:00' }
  enrollment_deadline DATE, -- Required for group classes
  start_date DATE,
  end_date DATE,

  -- Status (updated to include enrollment_open)
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'enrollment_open', 'active', 'completed', 'cancelled')),
  -- draft: being set up
  -- enrollment_open: accepting students (group only)
  -- active: class started, meetings ongoing (no new enrollments for group)
  -- completed: all meetings done
  -- cancelled: cancelled

  -- Continuation tracking (for private class that continues from group)
  continued_from_class_id UUID REFERENCES classes(id),
  -- NULL for original classes
  -- Set when creating private class as continuation of group class

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_classes_instructor ON classes(instructor_id);
CREATE INDEX idx_classes_course ON classes(course_id);
CREATE INDEX idx_classes_status ON classes(status);
CREATE INDEX idx_classes_type ON classes(type);
```

**Business Rules Enforced:**

```
1. GROUP CLASS:
   - Cannot change total_meetings after status is 'active'
   - Cannot add students after status is 'active'
   - All students share the same package (total_meetings)
   - Cannot upgrade within class

2. PRIVATE CLASS:
   - Can update total_meetings anytime (add more meetings)
   - No enrollment_deadline needed
   - Package tied to individual student

3. MEETING-LESSON RELATIONSHIP:
   - 1 meeting = 1 lesson (fixed)
   - lessons_unlocked should not exceed meetings_completed
   - Instructor unlocks lesson after conducting meeting
```

#### class_enrollments

```sql
CREATE TABLE class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id),
  student_id UUID REFERENCES users(id),

  -- Package inherited from class (no individual package for group)
  -- All students in a group class share the same package

  -- Credit-Based Attendance System
  meeting_credits INT NOT NULL,       -- Initial credits (= class.total_meetings)
  credits_used INT DEFAULT 0,         -- Incremented when attendance = Present/Late
  -- credits_remaining = meeting_credits - credits_used (calculated)

  -- Individual Progress Tracking
  lessons_completed INT DEFAULT 0,    -- Individual student's completed lessons
  exercises_completed INT DEFAULT 0,  -- Individual student's completed exercises
  attendance_rate DECIMAL(5, 2),      -- Percentage of meetings attended (auto-calculated)

  -- Payment
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'refunded')),
  payment_amount DECIMAL(15, 2),

  -- Dates
  enrolled_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,

  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'withdrawn')),

  UNIQUE(class_id, student_id)
);

CREATE INDEX idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX idx_class_enrollments_status ON class_enrollments(status);
```

**Credit System Rules:**

```
CREDIT-BASED ATTENDANCE:
━━━━━━━━━━━━━━━━━━━━━━━━━
1. INITIAL CREDITS:
   - On enrollment, meeting_credits = class.total_meetings
   - Example: 10 meeting class → 10 credits

2. CREDIT USAGE:
   - Attendance = Present → credits_used += 1
   - Attendance = Late → credits_used += 1
   - Attendance = Absent → credits_used unchanged (credit saved)

3. REMAINING CREDITS:
   - credits_remaining = meeting_credits - credits_used
   - Student can use remaining credits for makeup class later
   - Instructor/Staff can manually adjust credits

4. MANUAL ADJUSTMENT:
   - Use case: Student attended makeup → Deduct credit manually
   - Use case: Refund/error → Add credit manually
   - All adjustments logged in credit_adjustments table
```

**Enrollment Rules Enforced:**

```
1. GROUP CLASS ENROLLMENT:
   - Can only enroll when class.status IN ('draft', 'enrollment_open')
   - Cannot enroll when class.status = 'active' (class has started)
   - Cannot join mid-class
   - All students pay same package price

2. PRIVATE CLASS ENROLLMENT:
   - Only 1 student per class (max_capacity = 1)
   - Can create and start anytime
   - No enrollment deadline needed

3. CONTINUATION (Group → Private):
   - When group class ends, student can continue as private
   - Staff creates new private class with:
     - continued_from_class_id = original group class ID
     - Course: same course
     - total_meetings: remaining lessons (e.g., 40 if course has 50 and group had 10)
   - Student's history shows both classes linked
```

#### class_attendance

```sql
CREATE TABLE class_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id),
  enrollment_id UUID REFERENCES class_enrollments(id),
  meeting_number INT NOT NULL,        -- Meeting #1, #2, #3, etc.
  meeting_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  credit_deducted BOOLEAN DEFAULT FALSE, -- TRUE if credit was deducted for this attendance
  marked_by UUID REFERENCES users(id), -- Instructor/Staff who marked
  marked_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id), -- If edited later
  updated_at TIMESTAMP,
  notes TEXT,

  UNIQUE(enrollment_id, meeting_number) -- One attendance record per student per meeting
);

CREATE INDEX idx_class_attendance_class ON class_attendance(class_id);
CREATE INDEX idx_class_attendance_enrollment ON class_attendance(enrollment_id);
CREATE INDEX idx_class_attendance_meeting ON class_attendance(meeting_number);
CREATE INDEX idx_class_attendance_date ON class_attendance(meeting_date);
```

**Attendance Workflow:**

```
TAKE ATTENDANCE FLOW:
━━━━━━━━━━━━━━━━━━━━━━
1. Instructor opens class → "Take Attendance" button
2. Select meeting number + date
3. For each student:
   - Mark: Present / Absent / Late
   - System shows credit impact
4. Submit attendance
5. System:
   - Creates attendance record
   - If Present/Late: credits_used += 1, credit_deducted = TRUE
   - If Absent: credits_used unchanged, credit_deducted = FALSE
   - Recalculates attendance_rate on enrollment
```

#### credit_adjustments

```sql
CREATE TABLE credit_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES class_enrollments(id),
  adjustment INT NOT NULL,            -- Positive (add) or negative (deduct)
  credits_before INT NOT NULL,        -- credits_used before adjustment
  credits_after INT NOT NULL,         -- credits_used after adjustment
  reason VARCHAR(100) NOT NULL,       -- 'makeup_class', 'refund', 'error_correction', 'other'
  reason_detail TEXT,                 -- Additional details if reason = 'other'
  adjusted_by UUID REFERENCES users(id), -- Staff/Instructor who adjusted
  adjusted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_credit_adjustments_enrollment ON credit_adjustments(enrollment_id);
CREATE INDEX idx_credit_adjustments_adjusted_by ON credit_adjustments(adjusted_by);
CREATE INDEX idx_credit_adjustments_date ON credit_adjustments(adjusted_at);
```

**Credit Adjustment Reasons:**

```
ADJUSTMENT REASONS:
━━━━━━━━━━━━━━━━━━━
- 'makeup_class'     : Student attended makeup/replacement class
- 'refund'           : Partial refund given, credits added back
- 'error_correction' : Fix incorrect attendance marking
- 'bonus'            : Bonus credit given (promotion, compensation)
- 'other'            : Other reason (requires reason_detail)
```

#### lesson_unlocks

```sql
CREATE TABLE lesson_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES classes(id),
  lesson_id UUID REFERENCES lessons(id),
  unlocked_by UUID REFERENCES users(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(class_id, lesson_id)
);

CREATE INDEX idx_lesson_unlocks_class ON lesson_unlocks(class_id);
```

#### lesson_progress

```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  lesson_id UUID REFERENCES lessons(id),
  completed BOOLEAN DEFAULT FALSE,
  exercises_completed INT DEFAULT 0,
  total_exercises INT DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
```

#### exercise_progress

```sql
CREATE TABLE exercise_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  exercise_id UUID REFERENCES exercises(id),
  completed BOOLEAN DEFAULT FALSE,
  watched_seconds INT DEFAULT 0, -- for videos
  scroll_depth INT DEFAULT 0, -- for materials
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

CREATE INDEX idx_exercise_progress_user ON exercise_progress(user_id);
CREATE INDEX idx_exercise_progress_exercise ON exercise_progress(exercise_id);
```

#### quiz_attempts

```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  exercise_id UUID REFERENCES exercises(id),
  score INT NOT NULL,
  max_score INT NOT NULL,
  answers JSONB NOT NULL, -- Store all answers
  attempt_number INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_exercise ON quiz_attempts(exercise_id);
```

#### coding_submissions

```sql
CREATE TABLE coding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  exercise_id UUID REFERENCES exercises(id),
  code TEXT NOT NULL, -- Submitted Python code
  score INT, -- For challenge mode (NULL for playground)
  max_score INT, -- For challenge mode
  test_results JSONB, -- Array of test case results
  execution_time INT, -- milliseconds
  execution_output TEXT, -- Console output
  execution_error TEXT, -- Error message if any
  attempt_number INT DEFAULT 1,
  passed BOOLEAN DEFAULT FALSE, -- All tests passed
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coding_submissions_user ON coding_submissions(user_id);
CREATE INDEX idx_coding_submissions_exercise ON coding_submissions(exercise_id);
CREATE INDEX idx_coding_submissions_passed ON coding_submissions(passed);
```

**Test Results Schema (JSONB):**

```json
[
  {
    "testCaseId": "tc1",
    "name": "Test 1: Basic case",
    "passed": true,
    "input": "solve(5, 3)",
    "expectedOutput": "15",
    "actualOutput": "15",
    "executionTime": 50,
    "error": null
  }
]
```

#### assignment_submissions

```sql
CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID REFERENCES exercises(id),
  student_id UUID REFERENCES users(id),
  type VARCHAR(50) CHECK (type IN ('file', 'text', 'link')),
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  file_size INT,
  text_content TEXT,
  link_url VARCHAR(500),
  comment TEXT,
  version INT DEFAULT 1,
  submitted_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'graded', 'returned')),
  grade INT,
  max_grade INT,
  feedback TEXT,
  graded_by UUID REFERENCES users(id),
  graded_at TIMESTAMP
);

CREATE INDEX idx_assignment_submissions_exercise ON assignment_submissions(exercise_id);
CREATE INDEX idx_assignment_submissions_student ON assignment_submissions(student_id);
CREATE INDEX idx_assignment_submissions_status ON assignment_submissions(status);
```

#### xp_transactions

```sql
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  amount INT NOT NULL,
  reason VARCHAR(255), -- 'lesson_complete', 'quiz_complete', 'assignment_graded'
  reference_id UUID, -- lesson_id, quiz_id, assignment_id
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
```

#### user_levels

```sql
CREATE TABLE user_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  current_level INT DEFAULT 1,
  total_xp INT DEFAULT 0,
  current_streak INT DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_levels_user ON user_levels(user_id);
```

#### badges

```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  criteria JSONB, -- Unlock criteria
  rarity VARCHAR(50) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### user_badges

```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  badge_id UUID REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
```

#### payments

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name VARCHAR(255),
  student_email VARCHAR(255),
  student_phone VARCHAR(50),
  course_id UUID REFERENCES courses(id),
  package_type VARCHAR(50),
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(100),
  payment_ref VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'refunded')),
  notes TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_email ON payments(student_email);
CREATE INDEX idx_payments_status ON payments(status);
```

#### notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(100), -- 'lesson_unlocked', 'assignment_graded', 'badge_earned'
  title VARCHAR(255),
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  reference_id UUID, -- lesson_id, assignment_id, badge_id
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
```

### Community & Messaging Tables

#### community_posts

```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls JSONB DEFAULT '[]', -- Array of image/video URLs
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_community_posts_author ON community_posts(author_id);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
```

#### community_post_likes

```sql
CREATE TABLE community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post ON community_post_likes(post_id);
```

#### community_comments

```sql
CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON community_comments(post_id);
```

#### community_groups

```sql
CREATE TABLE community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_by UUID REFERENCES users(id),
  members_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### community_group_members

```sql
CREATE TABLE community_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('member', 'admin', 'creator')),
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group ON community_group_members(group_id);
CREATE INDEX idx_group_members_user ON community_group_members(user_id);
```

#### community_events

```sql
CREATE TABLE community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location VARCHAR(255), -- 'Online' or physical location
  attendees_count INT DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### community_event_rsvps

```sql
CREATE TABLE community_event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'attending' CHECK (status IN ('attending', 'maybe', 'declined')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_rsvps_event ON community_event_rsvps(event_id);
```

#### messages

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]', -- Array of attachment URLs
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

#### conversations

```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_2 UUID REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participant_1, participant_2)
);

CREATE INDEX idx_conversations_participants ON conversations(participant_1, participant_2);
```

#### announcements

```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  scheduled_at TIMESTAMP, -- NULL for immediate send
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_announcements_instructor ON announcements(instructor_id);
CREATE INDEX idx_announcements_class ON announcements(class_id);
```

#### announcement_reads

```sql
CREATE TABLE announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

CREATE INDEX idx_announcement_reads_announcement ON announcement_reads(announcement_id);
```

### Total Tables: 38

**Tables Added (Credit-Based Attendance):**

- `class_attendance` - Tracks attendance per student per meeting
- `credit_adjustments` - Audit log for manual credit adjustments

**Tables Added (Community & Messaging):**

- `community_posts` - User posts in community feed
- `community_post_likes` - Post like tracking
- `community_comments` - Comments on posts
- `community_groups` - Study groups
- `community_group_members` - Group membership
- `community_events` - Community events/workshops
- `community_event_rsvps` - Event RSVPs
- `messages` - Direct messages
- `conversations` - Message conversation threads
- `announcements` - Class announcements
- `announcement_reads` - Announcement read tracking

**Note:** Lessons are containers that group related exercises. Each lesson can have multiple exercises (video, quiz, material, assignment, coding). Students progress through exercises within a lesson.

---

## 🔌 API Specification

### API Design Principles

1. **RESTful** - Standard HTTP methods (GET, POST, PUT, DELETE)
2. **JSON** - Request/response format
3. **Versioned** - `/api/v1/...` (future-proof)
4. **Authenticated** - JWT in `Authorization: Bearer <token>` header
5. **Error Handling** - Consistent error response format
6. **Pagination** - Limit/offset or cursor-based
7. **Rate Limiting** - Prevent abuse (100 req/min per user)

### Standard Response Format

**Success:**

```json
{
  "success": true,
  "data": {
    /* ... */
  },
  "meta": { "timestamp": "2025-12-01T10:00:00Z" }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": { "email": "Invalid format" }
  },
  "meta": { "timestamp": "2025-12-01T10:00:00Z" }
}
```

### Core API Endpoints (Summary)

Full API contracts are in user stories. Key endpoints:

#### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `PUT /api/auth/change-password` - Change password

#### Courses

- `GET /api/courses` - List courses (catalog)
- `POST /api/courses` - Create course
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `POST /api/courses/:id/sections` - Add section
- `POST /api/sections/:id/lessons` - Add lesson (container)
- `GET /api/lessons/:id/exercises` - Get exercises in lesson
- `POST /api/lessons/:id/exercises` - Add exercise to lesson
- `PUT /api/exercises/:id` - Update exercise
- `DELETE /api/exercises/:id` - Delete exercise

#### Classes

- `GET /api/classes` - List classes
- `POST /api/classes` - Create class
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update class
- `POST /api/classes/:id/enrollments` - Enroll student
- `POST /api/classes/:id/unlock-lesson` - Unlock lesson

#### Attendance & Credits

- `POST /api/classes/:id/attendance` - Take attendance for a meeting
- `GET /api/classes/:id/attendance` - Get attendance history for class
- `PUT /api/classes/:id/attendance/:meetingNumber` - Edit attendance for a meeting
- `GET /api/classes/:id/attendance/report` - Generate attendance report (CSV/PDF)
- `GET /api/enrollments/:id/credits` - Get credit balance for enrollment
- `POST /api/enrollments/:id/credits/adjust` - Adjust credits manually
- `GET /api/enrollments/:id/credits/history` - Get credit adjustment history

#### Progress

- `POST /api/lessons/:id/complete` - Mark lesson complete (all exercises)
- `POST /api/exercises/:id/complete` - Mark exercise complete
- `POST /api/exercises/:id/progress` - Update exercise progress
- `GET /api/users/:id/progress` - Get user progress
- `GET /api/lessons/:id/progress` - Get lesson progress (exercises completed)

#### Assignments

- `POST /api/assignments/:id/submissions` - Submit assignment
- `POST /api/submissions/:id/grade` - Grade submission

#### Gamification

- `GET /api/users/:id/level` - Get user level
- `POST /api/xp/earn` - Award XP
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/badges` - List badges
- `POST /api/badges/unlock` - Unlock badge

#### Coding Exercises

- `GET /api/exercises/:id` - Get coding exercise (includes test cases for challenge mode)
- `POST /api/exercises/:id/coding/run` - Run code without test cases (execution only)
- `POST /api/exercises/:id/coding/submit` - Submit code and run all test cases
- `GET /api/exercises/:id/coding/submissions` - Get user's submission history

---

## 🐍 Code Execution (Pyodide)

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (CLIENT)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │   Code Editor    │    │         Pyodide Runtime          │   │
│  │  (Monaco Editor) │───▶│    (WebAssembly Python 3.11)     │   │
│  │                  │    │                                  │   │
│  │  - Syntax HL     │    │  - numpy, matplotlib, pandas     │   │
│  │  - Autocomplete  │    │  - turtle (canvas rendering)     │   │
│  │  - Error markers │    │  - Standard library              │   │
│  └──────────────────┘    └───────────────┬──────────────────┘   │
│                                          │                       │
│                          ┌───────────────▼──────────────────┐   │
│                          │         Output Renderer          │   │
│                          │                                  │   │
│                          │  - Console (text output)         │   │
│                          │  - Canvas (turtle, matplotlib)   │   │
│                          │  - Test Results (pass/fail)      │   │
│                          └──────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Note: All Python code execution happens IN THE BROWSER.
      No server-side code execution required for MVP.
      Backend only stores submissions and test results.
```

### Pyodide Integration

**Loading Strategy:**

```typescript
// Lazy load Pyodide only when coding exercise is accessed
const loadPyodide = async () => {
  const pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/',
  });

  // Pre-load common packages
  await pyodide.loadPackage(['numpy', 'matplotlib']);

  return pyodide;
};
```

**Execution Flow:**

1. Student writes code in Monaco Editor
2. Click "Run" → Code sent to Pyodide (in-browser)
3. Pyodide executes Python code
4. Output captured (stdout, stderr, visual)
5. Results displayed in output panel

**Test Case Execution (Challenge Mode):**

```typescript
const runTestCases = async (code: string, testCases: TestCase[]) => {
  const results = [];

  for (const testCase of testCases) {
    try {
      // Execute user's code
      await pyodide.runPythonAsync(code);

      // Run test input
      const result = await pyodide.runPythonAsync(testCase.input);
      const actualOutput = String(result);

      results.push({
        testCaseId: testCase.id,
        passed: actualOutput === testCase.expectedOutput,
        actualOutput,
        expectedOutput: testCase.expectedOutput,
      });
    } catch (error) {
      results.push({
        testCaseId: testCase.id,
        passed: false,
        error: error.message,
      });
    }
  }

  return results;
};
```

### Supported Packages

| Category          | Packages                 | Notes                     |
| ----------------- | ------------------------ | ------------------------- |
| **Data Science**  | numpy, pandas, scipy     | Core scientific computing |
| **Visualization** | matplotlib, seaborn      | Charts and plots          |
| **Graphics**      | turtle                   | Custom canvas rendering   |
| **Image**         | Pillow (PIL)             | Image manipulation        |
| **Math**          | math, statistics, random | Standard library          |
| **Text**          | re, string, json         | String processing         |
| **Date/Time**     | datetime, time           | Date handling             |

### Security Considerations

**Sandboxing:**

- Pyodide runs in browser sandbox (no file system access)
- No network access from Python code
- Memory limited by browser (typically 2-4GB)
- CPU time limited by timeout (30 seconds)

**Forbidden Operations:**

- File system read/write
- Network requests (no `requests`, `urllib`)
- System commands (no `os.system`, `subprocess`)
- Infinite loops (timeout protection)

### Performance Targets

| Metric                   | Target | Notes                           |
| ------------------------ | ------ | ------------------------------- |
| **Pyodide Initial Load** | <5s    | First load, cached after        |
| **Package Load**         | <2s    | Per package (numpy, matplotlib) |
| **Code Execution**       | <100ms | Simple code                     |
| **Test Case Execution**  | <30s   | Per test case, timeout after    |
| **Canvas Render**        | <500ms | Turtle/matplotlib output        |

---

## 🔐 Security Specifications

### Authentication & Authorization

**JWT Structure:**

```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "student",
  "iat": 1735689600,
  "exp": 1735776000
}
```

**Supported Roles:**

- `super_admin` - Full system access
- `staff` - Operations (enrollment, class creation, payment tracking)
- `instructor` - Course creation & teaching
- `student` - Learning

**JWT Secret:** Stored in environment variable (256-bit random)
**Token Expiry:** 24 hours (default), 30 days ("Remember Me")

### Password Security

- **Hashing:** bcrypt, salt rounds: 10-12
- **Requirements:**
  - Min 8 characters
  - 1 uppercase, 1 lowercase, 1 number, 1 special char
- **Storage:** NEVER store plaintext

### Role-Based API Authorization

**Authorization Middleware Examples:**

```typescript
// Course creation - Only instructor or super_admin
POST /api/courses
Authorization: Bearer <token>
Allowed Roles: ['instructor', 'super_admin']

// Class creation - Only staff or super_admin
POST /api/classes
Authorization: Bearer <token>
Allowed Roles: ['staff', 'super_admin']

// Student enrollment - Only staff or super_admin
POST /api/classes/:id/enrollments
Authorization: Bearer <token>
Allowed Roles: ['staff', 'super_admin']

// Unlock lesson - Only instructor (of that class) or super_admin
POST /api/classes/:id/unlock-lesson
Authorization: Bearer <token>
Allowed Roles: ['instructor', 'super_admin']
Additional Check: Instructor must be assigned to the class

// Create user - Only super_admin (for staff/instructor), staff (for students)
POST /api/users
Authorization: Bearer <token>
Allowed Roles: ['super_admin', 'staff']
Staff can only create role: 'student'
Super Admin can create any role
```

### API Security

1. **Rate Limiting** - 100 req/min per user, 10 req/min for auth endpoints
2. **CORS** - Whitelist frontend domain only
3. **CSRF Protection** - CSRF tokens for cookie-based auth
4. **SQL Injection** - Parameterized queries (Prisma prevents this)
5. **XSS Prevention** - Escape all user inputs, Content Security Policy
6. **HTTPS Only** - Redirect HTTP to HTTPS
7. **Security Headers:**
   ```
   Strict-Transport-Security: max-age=31536000
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   X-XSS-Protection: 1; mode=block
   ```

### Data Privacy

- **GDPR-like Compliance** (for Indonesia)
- **Data Encryption:** At rest (database encryption), In transit (HTTPS)
- **PII Handling:** Email, phone, name stored securely
- **Right to Delete:** User can request account deletion

---

## ⚡ Performance Requirements

### Response Time Targets

| Endpoint Type                        | Target Response Time | Max   |
| ------------------------------------ | -------------------- | ----- |
| **Authentication** (login, register) | <500ms               | 1s    |
| **Course List** (catalog)            | <300ms               | 500ms |
| **Lesson Content** (video, quiz)     | <200ms               | 500ms |
| **API (CRUD)**                       | <500ms               | 1s    |
| **Dashboard**                        | <1s                  | 2s    |
| **File Upload**                      | <3s (10MB file)      | 10s   |

### Page Load Targets

| Page               | Target Load Time | Max |
| ------------------ | ---------------- | --- |
| **Landing Page**   | <1s              | 2s  |
| **Dashboard**      | <1.5s            | 3s  |
| **Lesson Page**    | <2s              | 4s  |
| **Course Catalog** | <1s              | 2s  |

### Optimization Strategies

1. **Caching:**
   - Redis for session data, leaderboard, frequent queries
   - Browser caching for static assets (24h)
   - CDN for images, videos

2. **Database:**
   - Indexes on frequently queried columns
   - Connection pooling (max 20 connections)
   - Read replicas for analytics (future)

3. **Frontend:**
   - Code splitting (Next.js automatic)
   - Image optimization (next/image)
   - Lazy loading
   - Prefetching critical resources

4. **API:**
   - Pagination (limit: 20 items/page)
   - Selective fields (GraphQL future)
   - Response compression (gzip)

---

## 🚀 Infrastructure & DevOps

### Environments

1. **Development** - Local (localhost:3000)
2. **Staging** - staging.babyowl.com (pre-production testing)
3. **Production** - lms.babyowl.com (live)

### CI/CD Pipeline

```
GitHub Push → GitHub Actions → Build → Test → Deploy
```

**Pipeline Steps:**

1. Lint (ESLint, Prettier)
2. Type check (TypeScript)
3. Unit tests (Vitest)
4. Build (Next.js)
5. Deploy to Vercel (automatic)

### Monitoring & Alerts

**Error Tracking:**

- Sentry for frontend + backend errors
- Alert on critical errors (email/Slack)

**Performance Monitoring:**

- LogRocket for session replay
- Vercel Analytics for page performance

**Uptime Monitoring:**

- UptimeRobot (ping every 5 min)
- Alert if down >2 minutes

### Backup Strategy

**Database:**

- Automated daily backups (retained 30 days)
- Point-in-time recovery (7 days)
- Weekly full backup (offsite storage)

**Files (S3):**

- Versioning enabled (recover deleted files)
- Cross-region replication (disaster recovery)

---

## 📊 Scalability Plan

### Current Capacity (MVP)

- **Users:** 100-500 concurrent
- **Database:** Single PostgreSQL instance (16GB RAM)
- **API:** Serverless (Vercel), auto-scales

### Scale Plan (1000+ users)

**Phase 1: Optimize (500-1000 users)**

- Add Redis caching
- Database query optimization
- CDN for all static assets

**Phase 2: Horizontal Scaling (1000-5000 users)**

- Read replicas (database)
- Load balancer (multiple API instances)
- Background job queue (Bull/BullMQ)

**Phase 3: Microservices (5000+ users)**

- Split services (Auth, Course, Class, etc.)
- Message queue (RabbitMQ/Kafka)
- Kubernetes for orchestration

---

## ✅ Technical Checklist

Implementation is ready when:

- [ ] All database tables created & migrated
- [ ] All API endpoints implemented & tested
- [ ] Authentication & authorization working
- [ ] File upload/download working
- [ ] Email service integrated & tested
- [ ] Caching implemented (Redis)
- [ ] Rate limiting configured
- [ ] Security headers configured
- [ ] Error tracking setup (Sentry)
- [ ] Performance monitoring setup
- [ ] CI/CD pipeline working
- [ ] Staging environment deployed
- [ ] Production environment deployed
- [ ] Backups configured & tested
- [ ] Documentation complete (API docs, README)

---

**End of Technical Specification**

_Next Document: [UI/UX Specification →](./3-UI-UX-SPECIFICATION.md)_
