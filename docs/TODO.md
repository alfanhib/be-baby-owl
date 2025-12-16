# Implementation TODO List - LMS Baby Owl

**Last Updated:** December 16, 2025  
**Total Estimated Time:** 9 months (36 weeks)
**PRD Reference:** [docs/prd/0-PRD-OVERVIEW.md](./prd/0-PRD-OVERVIEW.md)

---

## Progress Legend

- ⬜ Not Started
- 🚧 In Progress
- ✅ Completed
- ⏸️ Blocked
- ❌ Cancelled

---

## Role Hierarchy (PRD Reference)

```
Super Admin → Full system access, create staff/instructors, system analytics
     │
     ├── Staff → Enrollments, class management, payments (NOT course creation)
     │
     ├── Instructor → Teach classes, grade, unlock lessons, create courses
     │
     └── Student → Learn, submit assignments, view progress
```

---

## Phase 0: Project Setup & Infrastructure

### 0.1 Repository & Configuration

- [x] Initialize NestJS project
- [x] Setup ESLint & Prettier
- [x] Setup TypeScript configuration
- [x] Create `docs/ARCHITECTURE.md`
- [x] Create `docker-compose.yml` (PostgreSQL + Redis)
- [x] Create `env.example`
- [x] Setup Prisma schema
- [x] Create `.env` file dari `env.example`
- [x] Setup Git hooks (husky + lint-staged)
- [x] Create `CONTRIBUTING.md`
- [ ] ⏸️ Setup CI/CD (GitHub Actions) - Skipped for now
  - [ ] Lint workflow
  - [ ] Test workflow
  - [ ] Build workflow

### 0.2 Install Core Dependencies

- [x] Install NestJS packages (`@nestjs/config`, `@nestjs/swagger`)
- [x] Install Authentication packages (`@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `passport-local`, `bcrypt`)
- [x] Install CQRS package (`@nestjs/cqrs`)
- [x] Install Validation packages (`class-validator`, `class-transformer`)
- [x] Install Caching packages (`@nestjs/cache-manager`, `cache-manager`, `cache-manager-redis-yet`, `ioredis`)
- [x] Install Queue packages (`@nestjs/bullmq`, `bullmq`)
- [x] Install Security packages (`helmet`, `@nestjs/throttler`)
- [x] Install Email package (`resend`)
- [x] Install Storage packages (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`, `multer`)

### 0.3 Verify Infrastructure

- [x] PostgreSQL running & accessible
- [x] Redis running & accessible
- [x] Prisma connected to database
- [x] All tables created (32 tables)
- [x] Test Redis connection from NestJS
- [x] Test Prisma queries from NestJS

**✅ Phase 0 Complete** (except CI/CD - skipped)

---

## Phase 1: Shared Kernel & Infrastructure

### 1.1 Create Shared Domain Building Blocks

- [x] Create `src/shared/` directory structure
- [x] Create `src/shared/domain/entity.base.ts`
  - [x] Generic Entity class with ID
  - [x] `equals()` method
  - [x] `createdAt`, `updatedAt` fields
- [x] Create `src/shared/domain/aggregate-root.base.ts`
  - [x] Extends Entity
  - [x] Domain events collection
  - [x] `addDomainEvent()` method
  - [x] `clearEvents()` method
  - [x] Version for optimistic locking
- [x] Create `src/shared/domain/value-object.base.ts`
  - [x] Immutable props
  - [x] `equals()` method
- [x] Create `src/shared/domain/identifier.base.ts`
  - [x] UUID generation
  - [x] `toString()` method
- [x] Create `src/shared/domain/domain-event.base.ts`
  - [x] Event ID
  - [x] Occurred timestamp
  - [x] Event name
  - [x] `toPayload()` abstract method
- [x] Create `src/shared/domain/repository.interface.ts`
- [x] Create `src/shared/domain/domain-error.base.ts`
- [x] Create `src/shared/domain/index.ts` (barrel export)

**✅ Section 1.1 Complete**

### 1.2 Create Shared Application Building Blocks

- [x] Create `src/shared/application/result.ts`
  - [x] `Result<T, E>` class
  - [x] `isSuccess`, `isFailure` getters
  - [x] `ok()`, `fail()` static methods
  - [x] `combine()`, `combineAll()` for multiple results
  - [x] `map()`, `flatMap()` for chaining
- [x] Create `src/shared/application/use-case.interface.ts`
  - [x] `IUseCase<TRequest, TResponse>`
  - [x] `ICommandHandler<TCommand, TResult>`
  - [x] `IQueryHandler<TQuery, TResult>`
- [x] Create `src/shared/application/pagination.dto.ts`
  - [x] `PaginationDto` with `page`, `limit`, `offset`, `skip`, `take`
  - [x] `PaginatedResult<T>` generic with metadata
  - [x] `SortOrder` enum
- [x] Create `src/shared/application/index.ts` (barrel export)

**✅ Section 1.2 Complete**

### 1.3 Create Shared Infrastructure

- [x] Create `src/shared/infrastructure/prisma/prisma.module.ts`
- [x] Create `src/shared/infrastructure/prisma/prisma.service.ts`
  - [x] `onModuleInit()` - connect
  - [x] `onModuleDestroy()` - disconnect
  - [x] `healthCheck()` method
  - [x] `cleanDatabase()` for testing
- [x] Create `src/shared/infrastructure/redis/redis.module.ts`
- [x] Create `src/shared/infrastructure/redis/redis.service.ts`
  - [x] String, JSON, Hash, Set, List, Sorted Set operations
  - [x] `getOrSet()` cache pattern
  - [x] `invalidatePattern()` for cache invalidation
- [x] Create `src/shared/infrastructure/event-bus/event-bus.module.ts`
- [x] Create `src/shared/infrastructure/event-bus/event-bus.service.ts`
  - [x] `publish()` method
  - [x] `publishAll()` method
  - [x] `publishFromAggregate()` method
  - [x] Integration with NestJS CQRS
- [x] Create `src/shared/infrastructure/logger/logger.service.ts`
- [x] Create `src/shared/infrastructure/index.ts` (barrel export)

**✅ Section 1.3 Complete**

### 1.4 Create Shared Interfaces

- [x] Create `src/shared/interfaces/decorators/`
  - [x] `roles.decorator.ts` - `@Roles('admin', 'instructor')`
  - [x] `current-user.decorator.ts` - `@CurrentUser()`
  - [x] `public.decorator.ts` - `@Public()`
- [x] Create `src/shared/interfaces/guards/`
  - [x] `jwt-auth.guard.ts`
  - [x] `roles.guard.ts`
- [x] Create `src/shared/interfaces/filters/`
  - [x] `domain-exception.filter.ts`
  - [x] `http-exception.filter.ts`
  - [x] `all-exceptions.filter.ts`
- [x] Create `src/shared/interfaces/interceptors/`
  - [x] `transform.interceptor.ts` - Standard response format
  - [x] `logging.interceptor.ts`
  - [x] `timeout.interceptor.ts`
- [x] Create `src/shared/interfaces/pipes/`
  - [x] `validation.pipe.ts`
- [x] Create `src/shared/interfaces/index.ts` (barrel export)

**✅ Section 1.4 Complete**

### 1.5 Configuration Module

- [x] Create `src/config/app.config.ts` (PORT, NODE_ENV, API_PREFIX, CORS)
- [x] Create `src/config/database.config.ts` (DATABASE_URL)
- [x] Create `src/config/redis.config.ts` (REDIS_HOST, REDIS_PORT, REDIS_PASSWORD)
- [x] Create `src/config/jwt.config.ts` (JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN)
- [x] Create `src/config/throttle.config.ts` (Rate limiting)
- [x] Create `src/config/storage.config.ts` (AWS S3 credentials)
- [x] Create `src/config/email.config.ts` (RESEND_API_KEY, EMAIL_FROM)
- [x] Create `src/config/index.ts` (barrel export with configurations array)

**✅ Section 1.5 Complete**

### 1.6 Setup App Module

- [x] Update `src/app.module.ts`
  - [x] Import ConfigModule (global)
  - [x] Import PrismaModule (global)
  - [x] Import RedisModule (global)
  - [x] Import ThrottlerModule (global)
  - [x] Import EventBusModule (CqrsModule)
  - [x] Setup global guards (JwtAuthGuard, RolesGuard)
  - [x] Setup global filters (AllExceptions, HttpException, DomainException)
  - [x] Setup global interceptors (Transform, Logging)
  - [x] Setup global pipes (CustomValidationPipe)

**✅ Section 1.6 Complete**

### 1.7 Setup Swagger & Main Entry

- [x] Configure Swagger in `main.ts`
  - [x] API title, description, version
  - [x] Bearer auth setup
- [x] Setup Helmet security
- [x] Setup CORS
- [x] Setup API prefix
- [x] Create `src/shared/index.ts` (barrel export)

**✅ Section 1.7 Complete**

**✅ Phase 1 Complete - Shared Kernel & Infrastructure**

---

## Phase 2: Identity Context (Authentication & Users) - PRD M01, M02

### 2.1 Domain Layer

- [x] Create `src/modules/identity/domain/` structure
- [x] Create Value Objects:
  - [x] `user-id.vo.ts` - UUID generation & validation
  - [x] `email.vo.ts` - Format validation, normalization
  - [x] `password.vo.ts` - Strength validation (min 8, uppercase, lowercase, number, special)
  - [x] `user-role.vo.ts` (student, instructor, staff, super_admin)
  - [x] `user-status.vo.ts` (active, inactive, suspended)
- [x] Create User Aggregate:
  - [x] `user.aggregate.ts`
  - [x] Factory methods: `create()`, `restore()`
  - [x] Business methods: `verifyEmail()`, `changePassword()`, `updateProfile()`, `deactivate()`, `reactivate()`, `suspend()`, `changeRole()`, `recordLogin()`, `completeOnboarding()`
- [x] Create Domain Events:
  - [x] `user-registered.event.ts`
  - [x] `user-verified.event.ts`
  - [x] `password-changed.event.ts`
  - [x] `user-deactivated.event.ts`
  - [x] `user-logged-in.event.ts`
- [x] Create Domain Services:
  - [x] `password-hasher.interface.ts`
- [x] Create Repository Interface:
  - [x] `user.repository.interface.ts` - findById, findByEmail, save, exists, emailExists, delete
- [x] Create Domain Errors:
  - [x] `invalid-email.error.ts`
  - [x] `weak-password.error.ts`
  - [x] `user-not-found.error.ts`
  - [x] `email-already-exists.error.ts`
  - [x] `invalid-credentials.error.ts`
  - [x] `user-suspended.error.ts`
- [x] Create `src/modules/identity/domain/index.ts` (barrel export)

**✅ Section 2.1 Complete**

### 2.2 Application Layer - Commands

- [x] Create `register-user/` - Register new user, hash password, publish event
- [x] Create `login/` - Validate credentials, generate JWT tokens, store refresh in Redis
- [x] Create `refresh-token/` - Validate & issue new access token
- [x] Create `logout/` - Invalidate refresh token in Redis
- [x] Create `verify-email/` - Validate token from Redis, update emailVerified
- [x] Create `change-password/` - Validate current, hash new password
- [x] Create `update-profile/` - Update fullName, avatar, bio
- [ ] Create `forgot-password/` (TODO: will add with email service)
- [ ] Create `reset-password/` (TODO: will add with email service)
- [ ] Create `create-user/` (Super Admin/Staff - create user accounts)
- [ ] Create `update-user/` (Super Admin - update any user)
- [ ] Create `deactivate-user/` (Super Admin - suspend/deactivate user)
- [ ] Create `change-user-role/` (Super Admin only)
- [x] Create `commands/index.ts` with CommandHandlers array

**✅ Section 2.2 Complete** (core commands done, admin commands pending)

### 2.3 Application Layer - Queries

- [x] Create `get-user-by-id/`
  - [x] `get-user-by-id.query.ts`
  - [x] `get-user-by-id.handler.ts`
- [x] Create `get-user-profile/`
  - [x] `get-user-profile.query.ts`
  - [x] `get-user-profile.handler.ts`
- [x] Create `get-users-list/` (Admin)
  - [x] `get-users-list.query.ts`
  - [x] `get-users-list.handler.ts`
  - [x] Pagination
  - [x] Filter by role, status
  - [x] Search by name, email
- [x] Create `check-email-exists/`
  - [x] `check-email-exists.query.ts`
  - [x] `check-email-exists.handler.ts`
- [ ] Create `get-user-activity-log/` (Admin - view user activity history)

### 2.4 Application Layer - Event Handlers

- [ ] Create `send-welcome-email.handler.ts`
  - [ ] Listen to UserRegisteredEvent
  - [ ] Queue welcome email
- [ ] Create `send-verification-email.handler.ts`
  - [ ] Generate verification token
  - [ ] Queue verification email
- [ ] Create `send-password-reset-email.handler.ts`

### 2.5 Application Layer - Services

- [x] Create `jwt-token.service.ts`
  - [x] `generateAccessToken()`
  - [x] `generateRefreshToken()`
  - [x] `verifyAccessToken()`
  - [x] `verifyRefreshToken()`
  - [x] `decodeToken()`

### 2.6 Infrastructure Layer

- [x] Create `user.repository.ts`
  - [x] Implement UserRepository interface
  - [x] Prisma queries
- [ ] Create `user.mapper.ts`
  - [ ] `toDomain()` - Prisma model → Domain entity
  - [ ] `toPersistence()` - Domain entity → Prisma model
- [x] Create `bcrypt-password-hasher.ts`
  - [x] Implement PasswordHasher interface
  - [x] `hash()` method
  - [x] `compare()` method

### 2.7 Interface Layer - HTTP

- [x] Create `auth.controller.ts`
  - [x] `POST /auth/register`
  - [x] `POST /auth/login`
  - [x] `POST /auth/refresh`
  - [x] `POST /auth/logout`
  - [ ] `POST /auth/forgot-password`
  - [ ] `POST /auth/reset-password`
  - [x] `PUT /auth/change-password`
  - [ ] `POST /auth/verify-email`
- [x] Create `users.controller.ts`
  - [x] `GET /users` (Admin)
  - [x] `GET /users/:id`
  - [x] `GET /users/me`
  - [x] `PUT /users/me`
  - [ ] `POST /users` (Super Admin/Staff - create user)
  - [ ] `PUT /users/:id` (Super Admin)
  - [ ] `DELETE /users/:id` (Super Admin - deactivate)
  - [ ] `PUT /users/:id/role` (Super Admin - change role)
  - [ ] `GET /users/:id/activity` (Admin - activity log)
- [x] Create DTOs:
  - [x] `register.dto.ts`
  - [x] `login.dto.ts`
  - [x] `login-response.dto.ts`
  - [x] `refresh-token.dto.ts`
  - [ ] `forgot-password.dto.ts`
  - [ ] `reset-password.dto.ts`
  - [x] `change-password.dto.ts`
  - [x] `update-profile.dto.ts`
  - [ ] `create-user.dto.ts`
  - [x] `user-response.dto.ts`
  - [ ] `users-list.dto.ts`

### 2.8 Passport Strategies

- [x] Create `jwt.strategy.ts`
  - [x] Validate JWT
  - [x] Attach user to request
- [x] Create `jwt-refresh.strategy.ts`
- [x] Create `local.strategy.ts`
  - [x] Validate email/password

### 2.9 Identity Module

- [x] Create `identity.module.ts`
  - [x] Import dependencies
  - [x] Register providers
  - [x] Export services

### 2.10 Tests - Identity

- [ ] Unit Tests:
  - [ ] `email.vo.spec.ts`
  - [ ] `password.vo.spec.ts`
  - [ ] `user.aggregate.spec.ts`
  - [ ] `register-user.handler.spec.ts`
  - [ ] `login.handler.spec.ts`
- [ ] Integration Tests:
  - [ ] `user.repository.spec.ts`
  - [ ] `auth.controller.spec.ts`
- [ ] E2E Tests:
  - [ ] Registration flow
  - [ ] Login flow
  - [ ] Password reset flow

**Phase 2: ~85% Complete - Core Authentication & User Management Implemented**

---

## Phase 3: Learning Context (Courses, Lessons, Exercises) - PRD M03, M04, M07

### 3.1 Domain Layer

- [ ] Create `src/modules/learning/domain/` structure
- [ ] Create Value Objects:
  - [ ] `course-id.vo.ts`
  - [ ] `section-id.vo.ts`
  - [ ] `lesson-id.vo.ts`
  - [ ] `exercise-id.vo.ts`
  - [ ] `course-status.vo.ts` (draft, published, archived)
  - [ ] `course-level.vo.ts` (beginner, intermediate, advanced)
  - [ ] `exercise-type.vo.ts` (video, quiz, material, assignment, coding_challenge, coding_playground)
  - [ ] `slug.vo.ts`
  - [ ] `quiz-type.vo.ts` (multiple_choice, match_pairs, fill_blanks, true_false, sentence_building, listening)
- [ ] Create Course Aggregate:
  - [ ] `course.aggregate.ts`
  - [ ] Contains Sections (entities)
  - [ ] Business methods:
    - [ ] `addSection()`
    - [ ] `removeSection()`
    - [ ] `reorderSections()`
    - [ ] `publish()`
    - [ ] `archive()`
- [ ] Create Section Entity:
  - [ ] `section.entity.ts`
  - [ ] Contains Lessons
  - [ ] `addLesson()`, `removeLesson()`, `reorderLessons()`
- [ ] Create Lesson Entity:
  - [ ] `lesson.entity.ts`
  - [ ] Contains Exercises
  - [ ] `addExercise()`, `removeExercise()`, `reorderExercises()`
- [ ] Create Exercise Entity:
  - [ ] `exercise.entity.ts`
  - [ ] Type-specific content handling:
    - [ ] Video: YouTube embed, duration
    - [ ] Quiz: 6 types (MCQ, Match, Fill, T/F, Sentence, Listening)
    - [ ] Material: Rich text, images
    - [ ] Assignment: Instructions, rubric, due date
    - [ ] Coding Challenge: Test cases, auto-grading
    - [ ] Coding Playground: Turtle, matplotlib, interactive
- [ ] Create StudentProgress Aggregate:
  - [ ] `student-progress.aggregate.ts`
  - [ ] Track lesson completion
  - [ ] Track exercise completion
- [ ] Create Domain Events:
  - [ ] `course-created.event.ts`
  - [ ] `course-published.event.ts`
  - [ ] `section-added.event.ts`
  - [ ] `lesson-added.event.ts`
  - [ ] `exercise-added.event.ts`
  - [ ] `exercise-completed.event.ts`
  - [ ] `lesson-completed.event.ts`
- [ ] Create Repository Interfaces:
  - [ ] `course.repository.interface.ts`
  - [ ] `progress.repository.interface.ts`
- [ ] Create Domain Errors:
  - [ ] `course-not-found.error.ts`
  - [ ] `lesson-not-found.error.ts`
  - [ ] `exercise-not-found.error.ts`
  - [ ] `duplicate-slug.error.ts`
  - [ ] `course-not-published.error.ts`
  - [ ] `lesson-locked.error.ts`

### 3.2 Application Layer - Commands

- [ ] Course Commands:
  - [ ] `create-course/` (command + handler)
  - [ ] `update-course/`
  - [ ] `publish-course/`
  - [ ] `archive-course/`
  - [ ] `delete-course/`
- [ ] Section Commands:
  - [ ] `add-section/`
  - [ ] `update-section/`
  - [ ] `delete-section/`
  - [ ] `reorder-sections/`
- [ ] Lesson Commands:
  - [ ] `add-lesson/`
  - [ ] `update-lesson/`
  - [ ] `delete-lesson/`
  - [ ] `reorder-lessons/`
- [ ] Exercise Commands:
  - [ ] `add-exercise/`
  - [ ] `update-exercise/`
  - [ ] `delete-exercise/`
  - [ ] `reorder-exercises/`
- [ ] Progress Commands:
  - [ ] `complete-exercise/`
  - [ ] `update-video-progress/`
  - [ ] `submit-quiz/`
  - [ ] `submit-coding-exercise/`

### 3.3 Application Layer - Queries

- [ ] `get-course-catalog/` - Public course list
- [ ] `get-course-detail/` - Full course with sections/lessons
- [ ] `get-course-for-edit/` - Admin/Instructor view
- [ ] `get-section/`
- [ ] `get-lesson-content/` - Lesson with exercises
- [ ] `get-exercise/` - Single exercise detail
- [ ] `get-student-progress/` - Progress for a course
- [ ] `get-student-courses/` - All enrolled courses

### 3.4 Content Delivery - Exercise Types (PRD M04)

- [ ] Video Exercise:
  - [ ] YouTube embed
  - [ ] Progress tracking (>80% watched = complete)
  - [ ] Resume position
- [ ] Quiz Exercise (6 types):
  - [ ] Multiple Choice - single/multiple answers
  - [ ] Match Pairs - drag and drop matching
  - [ ] Fill in Blanks - text input
  - [ ] True/False - binary choice
  - [ ] Sentence Building - word ordering
  - [ ] Listening - audio + questions
  - [ ] Auto-grading (≥70% = pass)
  - [ ] Attempts tracking, best score
- [ ] Material Exercise:
  - [ ] Rich text (HTML/Markdown)
  - [ ] Images, embedded content
  - [ ] Scroll to bottom = complete
- [ ] Coding Exercise - Challenge Mode:
  - [ ] Test cases definition
  - [ ] Auto-grading against test cases
  - [ ] Python execution (Pyodide - WebAssembly)
  - [ ] Monaco Editor integration
  - [ ] Pass all tests = complete
- [ ] Coding Exercise - Playground Mode:
  - [ ] Interactive output (turtle graphics, matplotlib charts, console)
  - [ ] No test cases, free exploration
  - [ ] Manual completion by student

### 3.5 Progress Tracking (PRD M07)

- [ ] Exercise-level tracking:
  - [ ] Completion status per exercise
  - [ ] Timestamps, attempts
- [ ] Lesson-level tracking:
  - [ ] All exercises complete = lesson complete
  - [ ] Progress percentage: (completed/total exercises)
- [ ] Course-level tracking:
  - [ ] (Completed lessons / Total unlocked lessons) × 100
  - [ ] Overall course percentage
- [ ] Progress indicators:
  - [ ] Checkmarks, progress bars
  - [ ] Color-coded status
- [ ] Certificate generation:
  - [ ] Trigger on 100% course completion
  - [ ] PDF with student name, course, date, certificate ID

### 3.6 Infrastructure Layer

- [ ] `course.repository.ts`
- [ ] `course.mapper.ts`
- [ ] `progress.repository.ts`
- [ ] `progress.mapper.ts`

### 3.7 Interface Layer - HTTP

- [ ] `courses.controller.ts`
  - [ ] `GET /courses` - Catalog
  - [ ] `GET /courses/:id` - Detail
  - [ ] `POST /courses` - Create (Instructor/Super Admin)
  - [ ] `PUT /courses/:id` - Update
  - [ ] `DELETE /courses/:id` - Delete
  - [ ] `POST /courses/:id/publish`
  - [ ] `POST /courses/:id/archive`
- [ ] `sections.controller.ts`
  - [ ] `POST /courses/:courseId/sections`
  - [ ] `PUT /sections/:id`
  - [ ] `DELETE /sections/:id`
  - [ ] `PUT /courses/:courseId/sections/reorder`
- [ ] `lessons.controller.ts`
  - [ ] `GET /lessons/:id`
  - [ ] `POST /sections/:sectionId/lessons`
  - [ ] `PUT /lessons/:id`
  - [ ] `DELETE /lessons/:id`
- [ ] `exercises.controller.ts`
  - [ ] `GET /exercises/:id`
  - [ ] `POST /lessons/:lessonId/exercises`
  - [ ] `PUT /exercises/:id`
  - [ ] `DELETE /exercises/:id`
  - [ ] `POST /exercises/:id/complete`
  - [ ] `POST /exercises/:id/quiz/submit`
  - [ ] `POST /exercises/:id/coding/submit`
  - [ ] `POST /exercises/:id/coding/run` (playground)
- [ ] `progress.controller.ts`
  - [ ] `GET /courses/:id/progress`
  - [ ] `GET /users/me/courses`
  - [ ] `POST /courses/:id/certificate/generate`

### 3.8 Learning Module

- [ ] Create `learning.module.ts`

### 3.9 Tests - Learning

- [ ] Unit tests for domain
- [ ] Integration tests for repository
- [ ] E2E tests for API

---

## Phase 4: Class Management Context - PRD M12, M13, M14, M15

### 4.1 Domain Layer

- [ ] Create Value Objects:
  - [ ] `class-id.vo.ts`
  - [ ] `enrollment-id.vo.ts`
  - [ ] `class-type.vo.ts` (group, private)
  - [ ] `class-status.vo.ts` (draft, enrollment_open, active, completed, cancelled)
  - [ ] `meeting-credit.vo.ts`
  - [ ] `attendance-status.vo.ts` (present, absent, late)
  - [ ] `schedule.vo.ts`
- [ ] Create Class Aggregate:
  - [ ] `class.aggregate.ts`
  - [ ] Contains Enrollments
  - [ ] Business rules:
    - [ ] 1 Meeting = 1 Lesson (fixed ratio)
    - [ ] Package is at class level
    - [ ] Group: No enroll after active status
    - [ ] Private: Can add meetings anytime
  - [ ] Business methods:
    - [ ] `enrollStudent()` - with enrollment rules
    - [ ] `removeStudent()`
    - [ ] `markAttendance()` - affects credits
    - [ ] `adjustCredit()` - manual adjustment
    - [ ] `unlockLesson()` - unlock lesson + all exercises
    - [ ] `activate()`
    - [ ] `complete()`
- [ ] Create Enrollment Entity:
  - [ ] `enrollment.entity.ts`
  - [ ] `meetingCredits` - initial = class.totalMeetings
  - [ ] `creditsUsed` - incremented on attendance
  - [ ] `creditsRemaining` - for makeup classes
  - [ ] Progress tracking
- [ ] Create Attendance Entity:
  - [ ] `attendance.entity.ts`
  - [ ] Meeting number, Date, Status
  - [ ] Credit impact (present/late = -1, absent = 0)
- [ ] Create LessonUnlock Entity:
  - [ ] `lesson-unlock.entity.ts`
  - [ ] Unlocking lesson unlocks ALL exercises inside
- [ ] Create CreditAdjustment Entity:
  - [ ] `credit-adjustment.entity.ts`
  - [ ] Amount (+/-), Reason, Adjusted by, Timestamp
- [ ] Create Domain Events:
  - [ ] `class-created.event.ts`
  - [ ] `class-activated.event.ts`
  - [ ] `student-enrolled.event.ts`
  - [ ] `student-removed.event.ts`
  - [ ] `attendance-marked.event.ts`
  - [ ] `credit-deducted.event.ts`
  - [ ] `credit-adjusted.event.ts`
  - [ ] `lesson-unlocked.event.ts`
  - [ ] `class-completed.event.ts`
- [ ] Create Domain Services:
  - [ ] `credit-calculator.service.ts`
- [ ] Create Policies:
  - [ ] `enrollment.policy.ts`
    - [ ] Group: No enroll after active
    - [ ] Group: Check deadline
    - [ ] Private: Max 1 student
  - [ ] `unlock.policy.ts`
    - [ ] Only instructor can unlock
    - [ ] Cannot exceed package limit
    - [ ] Lessons unlocked ≤ Meetings completed
- [ ] Create Repository Interface:
  - [ ] `class.repository.interface.ts`
- [ ] Create Domain Errors:
  - [ ] `class-not-found.error.ts`
  - [ ] `class-full.error.ts`
  - [ ] `enrollment-closed.error.ts`
  - [ ] `already-enrolled.error.ts`
  - [ ] `package-limit-reached.error.ts`
  - [ ] `unauthorized-unlock.error.ts`
  - [ ] `insufficient-credits.error.ts`

### 4.2 Application Layer - Commands

- [ ] Class Commands:
  - [ ] `create-class/` - Staff/Super Admin
  - [ ] `update-class/`
  - [ ] `activate-class/`
  - [ ] `complete-class/`
  - [ ] `cancel-class/`
  - [ ] `duplicate-class/`
- [ ] Enrollment Commands:
  - [ ] `enroll-student/` - with enrollment rules validation
  - [ ] `remove-student/`
  - [ ] `transfer-student/`
  - [ ] `bulk-enroll-students/` - CSV upload
- [ ] Attendance Commands:
  - [ ] `mark-attendance/` - affects credits
  - [ ] `update-attendance/`
  - [ ] `bulk-mark-attendance/`
- [ ] Credit Commands:
  - [ ] `adjust-credit/` - manual adjustment with reason
- [ ] Unlock Commands:
  - [ ] `unlock-lesson/` - unlocks lesson + all exercises
  - [ ] `bulk-unlock-lessons/`
  - [ ] `lock-lesson/` - revert (rare)

### 4.3 Application Layer - Queries

- [ ] `get-classes-list/` - Filter by status, instructor, course
- [ ] `get-class-detail/`
- [ ] `get-class-roster/` - Students in class with progress & credits
- [ ] `get-class-attendance/` - Attendance history
- [ ] `get-attendance-report/` - Export
- [ ] `get-credit-balance/` - Student credits for enrollment
- [ ] `get-credit-history/` - Adjustments log
- [ ] `get-unlocked-lessons/` - For a class
- [ ] `get-unlock-history/` - Audit log
- [ ] `get-instructor-classes/`
- [ ] `get-student-classes/`
- [ ] `get-class-analytics/` - Avg completion, engagement

### 4.4 Application Layer - Read Models

- [ ] `class-roster.read-model.ts`
- [ ] `attendance-report.read-model.ts`
- [ ] `class-progress.read-model.ts`

### 4.5 Infrastructure Layer

- [ ] `class.repository.ts`
- [ ] `class.mapper.ts`

### 4.6 Interface Layer - HTTP

- [ ] `classes.controller.ts`
  - [ ] `GET /classes` - Staff/Super Admin
  - [ ] `GET /classes/:id`
  - [ ] `POST /classes` - Staff/Super Admin
  - [ ] `PUT /classes/:id`
  - [ ] `POST /classes/:id/activate`
  - [ ] `POST /classes/:id/complete`
  - [ ] `POST /classes/:id/duplicate`
  - [ ] `DELETE /classes/:id`
- [ ] `enrollments.controller.ts`
  - [ ] `GET /classes/:id/enrollments`
  - [ ] `POST /classes/:id/enrollments`
  - [ ] `POST /classes/:id/enrollments/bulk` - CSV
  - [ ] `DELETE /classes/:classId/enrollments/:studentId`
  - [ ] `POST /classes/:classId/enrollments/:enrollmentId/transfer`
  - [ ] `GET /enrollments/:id/credits`
  - [ ] `GET /enrollments/:id/credits/history`
  - [ ] `POST /enrollments/:id/credits/adjust`
- [ ] `attendance.controller.ts`
  - [ ] `GET /classes/:id/attendance`
  - [ ] `POST /classes/:id/attendance`
  - [ ] `PUT /classes/:id/attendance/:meetingNumber`
  - [ ] `GET /classes/:id/attendance/report`
- [ ] `lesson-unlocks.controller.ts`
  - [ ] `GET /classes/:id/unlocked-lessons`
  - [ ] `POST /classes/:id/unlock-lesson`
  - [ ] `POST /classes/:id/unlock-lessons/bulk`
  - [ ] `GET /classes/:id/unlock-history`

### 4.7 Class Management Module

- [ ] Create `class-management.module.ts`

### 4.8 Tests - Class Management

- [ ] Unit tests for aggregate
- [ ] Policy tests
- [ ] Integration tests
- [ ] E2E tests

---

## Phase 5: Assessment Context - PRD M05, M17

### 5.1 Domain Layer

- [ ] Create Value Objects:
  - [ ] `assignment-id.vo.ts`
  - [ ] `submission-id.vo.ts`
  - [ ] `assignment-status.vo.ts` (draft, published)
  - [ ] `submission-status.vo.ts` (pending, submitted, graded, late, returned)
  - [ ] `grade.vo.ts`
- [ ] Create Assignment Aggregate:
  - [ ] `assignment.aggregate.ts`
  - [ ] Instructions, rubric, due date, max score
- [ ] Create Submission Entity:
  - [ ] `submission.entity.ts`
  - [ ] Content (file URL, text, link)
  - [ ] Submitted at, Grade, Feedback
- [ ] Create Domain Events:
  - [ ] `assignment-created.event.ts`
  - [ ] `assignment-submitted.event.ts`
  - [ ] `assignment-graded.event.ts`
  - [ ] `assignment-returned.event.ts`
- [ ] Create Repository Interface

### 5.2 Application Layer - Commands

- [ ] Assignment Commands:
  - [ ] `create-assignment/`
  - [ ] `update-assignment/`
  - [ ] `delete-assignment/`
- [ ] Submission Commands:
  - [ ] `submit-assignment/`
  - [ ] `resubmit-assignment/`
  - [ ] `grade-submission/`
  - [ ] `bulk-grade-submissions/`
  - [ ] `return-for-revision/`

### 5.3 Application Layer - Queries

- [ ] `get-pending-submissions/` - Instructor queue
  - [ ] `get-student-submissions/`
  - [ ] `get-submission-detail/`
- [ ] `get-grading-history/`

### 5.4 Grading & Feedback (PRD M17)

- [ ] Grading Interface:
  - [ ] View submission content
  - [ ] Score input (numeric)
  - [ ] Rubric-based grading (if rubric exists)
  - [ ] Rich text feedback
  - [ ] Template feedback (pre-written comments)
- [ ] Bulk grading:
  - [ ] Select multiple submissions
  - [ ] Apply same score + feedback
- [ ] Grading history:
  - [ ] Audit log of grade changes

### 5.5 Infrastructure & Interface Layer

- [ ] Repository implementation
- [ ] `assignments.controller.ts`
  - [ ] `GET /assignments/:id`
  - [ ] `POST /lessons/:lessonId/assignments`
  - [ ] `PUT /assignments/:id`
  - [ ] `DELETE /assignments/:id`
- [ ] `submissions.controller.ts`
  - [ ] `POST /assignments/:id/submit`
  - [ ] `GET /assignments/:id/submissions` - Instructor
  - [ ] `GET /submissions/:id`
  - [ ] `PUT /submissions/:id/grade`
  - [ ] `PUT /submissions/:id/return`
- [ ] `grading.controller.ts`
  - [ ] `GET /instructor/grading/pending`
  - [ ] `POST /instructor/grading/bulk`
- [ ] DTOs

### 5.6 Assessment Module

- [ ] Create `assessment.module.ts`

---

## Phase 6: Gamification Context - PRD M08, M09, M10, M11

### 6.1 Domain Layer

- [ ] Create Value Objects:
  - [ ] `xp-amount.vo.ts`
  - [ ] `level.vo.ts`
  - [ ] `streak.vo.ts`
  - [ ] `badge-type.vo.ts`
  - [ ] `league.vo.ts` (ruby, emerald, diamond, platinum, champion)
- [ ] Create PlayerProfile Aggregate:
  - [ ] `player-profile.aggregate.ts`
  - [ ] `awardXp()` - with level up logic
  - [ ] `updateStreak()`
  - [ ] `awardBadge()`
- [ ] Create XpTransaction Entity
- [ ] Create BadgeAward Entity
- [ ] Create QuestProgress Entity
- [ ] Create Domain Events:
  - [ ] `xp-earned.event.ts`
  - [ ] `level-up.event.ts`
  - [ ] `badge-unlocked.event.ts`
  - [ ] `streak-updated.event.ts`
  - [ ] `quest-completed.event.ts`
  - [ ] `league-promotion.event.ts`
- [ ] Create Domain Services:
  - [ ] `xp-calculator.service.ts`
    - [ ] Video complete: +10 XP
    - [ ] Material complete: +10 XP
    - [ ] Quiz pass: +15 XP
    - [ ] Assignment submit: +20 XP
    - [ ] Assignment graded: +50 XP
    - [ ] Daily login: +5 XP
    - [ ] Quest complete: +25 XP
  - [ ] `level-calculator.service.ts`
    - [ ] XP thresholds per level (formula: 100*N + 50*(N-1))
  - [ ] `badge-evaluator.service.ts`
    - [ ] Badge criteria checking

### 6.2 Application Layer - Commands

- [ ] `award-xp/`
- [ ] `update-streak/`
- [ ] `unlock-badge/`
- [ ] `complete-quest/`
- [ ] `reset-daily-quests/`
- [ ] `update-leaderboard/`
- [ ] `promote-demote-league/` (weekly cron)

### 6.3 Application Layer - Queries

- [ ] `get-player-stats/`
- [ ] `get-leaderboard/` - Weekly/Monthly/All-time
- [ ] `get-class-leaderboard/`
- [ ] `get-badges/` - All + user's earned
- [ ] `get-daily-quests/`
- [ ] `get-xp-history/`
- [ ] `get-streak-info/`

### 6.4 Application Layer - Event Handlers

- [ ] `on-exercise-completed.handler.ts`
  - [ ] Award XP based on type
- [ ] `on-lesson-completed.handler.ts`
  - [ ] Award bonus XP
  - [ ] Check badge criteria
- [ ] `on-attendance-marked.handler.ts`
  - [ ] Update streak
  - [ ] Award attendance XP

### 6.5 Application Layer - Read Models

- [ ] `leaderboard.read-model.ts`
  - [ ] Redis cached
  - [ ] ZSET for ranking

### 6.6 Infrastructure Layer

- [ ] `player-profile.repository.ts`
- [ ] Leaderboard Redis implementation

### 6.7 Interface Layer - HTTP

- [ ] `gamification.controller.ts`
  - [ ] `GET /gamification/stats`
  - [ ] `GET /gamification/xp-history`
- [ ] `leaderboard.controller.ts`
  - [ ] `GET /leaderboard`
  - [ ] `GET /leaderboard/class/:classId`
  - [ ] `GET /leaderboard/global`
- [ ] `badges.controller.ts`
  - [ ] `GET /badges`
  - [ ] `GET /badges/earned`
- [ ] `quests.controller.ts`
  - [ ] `GET /quests/daily`

### 6.8 Gamification Module

- [ ] Create `gamification.module.ts`

---

## Phase 7: Billing & Payment Context - PRD M20

### 7.1 Domain Layer

- [ ] Create Value Objects:
  - [ ] `payment-id.vo.ts`
  - [ ] `payment-status.vo.ts` (pending, verified, refunded)
  - [ ] `payment-method.vo.ts` (bank_transfer, ewallet, cash)
- [ ] Create Payment Aggregate:
  - [ ] `payment.aggregate.ts`
  - [ ] Student info, Amount, Course, Package
  - [ ] Reference ID, Notes
  - [ ] `verify()`, `refund()`
- [ ] Create Domain Events:
  - [ ] `payment-recorded.event.ts`
  - [ ] `payment-verified.event.ts`
  - [ ] `payment-refunded.event.ts`
- [ ] Create Repository Interface

### 7.2 Application Layer - Commands

- [ ] `record-payment/` - Staff/Super Admin
  - [ ] `verify-payment/`
  - [ ] `refund-payment/`

### 7.3 Application Layer - Queries

- [ ] `get-payments-list/` - Filter, search, sort
  - [ ] `get-payment-detail/`
- [ ] `get-payment-stats/` - Revenue analytics
- [ ] `get-pending-payments/`

### 7.4 Infrastructure & Interface Layer

- [ ] Repository
- [ ] `payments.controller.ts`
  - [ ] `GET /payments` - Staff/Super Admin
  - [ ] `GET /payments/:id`
  - [ ] `POST /payments`
  - [ ] `PUT /payments/:id/verify`
  - [ ] `PUT /payments/:id/refund`
  - [ ] `GET /payments/stats`
  - [ ] `GET /payments/export` - CSV

### 7.5 Billing Module

- [ ] Create `billing.module.ts`

---

## Phase 8: Enrollment Management Context - PRD M19

### 8.1 Quick Enrollment Tool (Critical Feature)

- [ ] Domain:
  - [ ] Enrollment process combining user creation + class enrollment
- [ ] Application Layer - Commands:
  - [ ] `quick-enroll/` - Create user + Enroll + Send email (5 min process)
  - [ ] `bulk-enroll/` - CSV upload, validation, batch create
- [ ] Application Layer - Queries:
  - [ ] `get-enrollment-history/` - Audit log
  - [ ] `get-enrollment-analytics/` - Trends
- [ ] Interface Layer:
  - [ ] `enrollment-management.controller.ts`
    - [ ] `POST /staff/quick-enroll` - One-step enrollment
    - [ ] `POST /staff/bulk-enroll` - CSV upload
    - [ ] `GET /staff/enrollments/history`
    - [ ] `GET /staff/enrollments/analytics`
    - [ ] `POST /staff/enrollments/pre-fill/:paymentId` - Pre-fill from payment

### 8.2 Integration with Payment Tracking

- [ ] Pre-fill enrollment form from payment record
- [ ] Link payment → enrollment
- [ ] Prevent enrollment without verified payment (optional)

### 8.3 Enrollment Management Module

- [ ] Create `enrollment-management.module.ts`

---

## Phase 9: Instructor Tools Context - PRD M16, M18

### 9.1 Instructor Dashboard (PRD M16)

- [ ] Dashboard Overview:
  - [ ] My Classes widget (3-5 classes)
  - [ ] Pending Tasks (assignments to grade count)
  - [ ] Student Stats (total students, avg completion)
  - [ ] Upcoming Meetings (schedule)
- [ ] Quick Actions:
  - [ ] Grade Next Assignment
  - [ ] Unlock Next Lesson
  - [ ] Message Students
- [ ] Class Management:
  - [ ] Class list with filters
  - [ ] Class selection (switch context)
  - [ ] Teaching analytics

### 9.2 Student Monitoring (PRD M18)

- [ ] Individual Student Progress View:
  - [ ] Detailed breakdown (lessons, exercises)
  - [ ] Quiz scores, Assignment grades
  - [ ] Activity timeline
- [ ] At-Risk Student Detection:
  - [ ] No activity in 7+ days
  - [ ] Progress <30% after 4 weeks
  - [ ] Multiple failed quizzes
  - [ ] Alert on dashboard
- [ ] Student Communication:
  - [ ] Send email from LMS
  - [ ] Pre-filled subject/body
- [ ] Progress Reports:
  - [ ] Generate PDF per student
  - [ ] Progress %, Grades, Attendance

### 9.3 Interface Layer - HTTP

- [ ] `instructor-dashboard.controller.ts`
  - [ ] `GET /instructor/dashboard`
  - [ ] `GET /instructor/classes`
  - [ ] `GET /instructor/pending-tasks`
  - [ ] `GET /instructor/analytics`
- [ ] `student-monitoring.controller.ts`
  - [ ] `GET /instructor/classes/:id/students/:studentId/progress`
  - [ ] `GET /instructor/classes/:id/at-risk`
  - [ ] `POST /instructor/students/:studentId/message`
  - [ ] `GET /instructor/classes/:id/students/:studentId/report`

### 9.4 Instructor Tools Module

- [ ] Create `instructor-tools.module.ts`

---

## Phase 10: Student Dashboard Context - PRD M06

### 10.1 Dashboard Overview

- [ ] My Courses widget:
  - [ ] Enrolled courses with progress bars
  - [ ] Next lesson to continue
  - [ ] Last accessed timestamp
- [ ] Stats widget:
  - [ ] Total lessons completed
  - [ ] Current streak
  - [ ] XP earned this week
  - [ ] Current level
- [ ] Next Steps widget:
  - [ ] Continue lesson
  - [ ] Pending assignments
  - [ ] Upcoming deadlines
- [ ] Schedule & Deadlines:
  - [ ] Assignment due dates
  - [ ] Class meeting schedule

### 10.2 Course Detail View

- [ ] Syllabus with sections/lessons
- [ ] Progress indicators
- [ ] Locked/Unlocked visual
- [ ] Next lesson highlight

### 10.3 Learning Interface

- [ ] Exercise renderer (video, quiz, material, coding)
- [ ] Navigation (prev/next)
- [ ] Progress auto-save
- [ ] Completion confirmation

### 10.4 Interface Layer - HTTP

- [ ] `student-dashboard.controller.ts`
  - [ ] `GET /student/dashboard`
  - [ ] `GET /student/courses`
  - [ ] `GET /student/courses/:id`
  - [ ] `GET /student/schedule`
  - [ ] `GET /student/deadlines`

### 10.5 Student Dashboard Module

- [ ] Create `student-dashboard.module.ts`

---

## Phase 11: Admin Context - PRD M21, M22

### 11.1 User Management (PRD M21)

- [ ] User Search & Filter:
  - [ ] By name, email
  - [ ] By role (Super Admin only sees all roles)
  - [ ] By status (active, inactive)
- [ ] User Profile Management:
  - [ ] View full profile
  - [ ] Edit user details
  - [ ] View enrollments
  - [ ] View activity log
- [ ] Role Assignment (Super Admin only):
  - [ ] Change user role
  - [ ] Confirmation required
- [ ] User Deactivation:
  - [ ] Soft delete
  - [ ] Can reactivate
- [ ] User Export:
  - [ ] CSV with filters

### 11.2 System Analytics (PRD M22) - Super Admin Only

- [ ] Enrollment Analytics:
  - [ ] Daily/weekly/monthly trends
  - [ ] Total enrollments
- [ ] Revenue Tracking:
  - [ ] By course, package, instructor
  - [ ] Revenue over time charts
- [ ] Course Performance:
  - [ ] Completion rates
  - [ ] Quiz scores
  - [ ] Student satisfaction
- [ ] Instructor Performance:
  - [ ] Students taught
  - [ ] Classes completed
  - [ ] Avg completion rate
- [ ] Dashboard Visualizations:
  - [ ] Line/bar/pie charts
  - [ ] Date range selectors

### 11.3 Interface Layer - HTTP

- [ ] `super-admin.controller.ts`
  - [ ] `GET /super-admin/users`
  - [ ] `GET /super-admin/users/:id`
  - [ ] `PUT /super-admin/users/:id`
  - [ ] `PUT /super-admin/users/:id/role`
  - [ ] `DELETE /super-admin/users/:id`
  - [ ] `GET /super-admin/users/export`
- [ ] `analytics.controller.ts`
  - [ ] `GET /super-admin/analytics/enrollments`
  - [ ] `GET /super-admin/analytics/revenue`
  - [ ] `GET /super-admin/analytics/courses/:id`
  - [ ] `GET /super-admin/analytics/instructors/:id`
  - [ ] `GET /super-admin/analytics/dashboard`

### 11.4 Admin Module

- [ ] Create `admin.module.ts`

---

## Phase 12: WhatsApp Integration - PRD M24

### 12.1 WhatsApp Deep Links

- [ ] Generate wa.me links
- [ ] Phone number from settings
- [ ] URL encoding

### 12.2 Pre-filled Messages

- [ ] Course purchase template:
  ```
  Hi! I'm interested in:
  [Course Title]
  Package: [X meetings]
  Name: [User Name]
  Email: [User Email]
  Please send payment details.
  ```
- [ ] Variables substitution
- [ ] Logged-in vs anonymous handling

### 12.3 Purchase Initiation Flow

- [ ] Course catalog → "Buy via WhatsApp" button
- [ ] Pre-fill user info if logged in
- [ ] Open WhatsApp (new tab)

### 12.4 Continue as Private Flow

- [ ] Group class completed → "Continue Learning" button
- [ ] Pre-filled message:
  ```
  Hi! I'd like to continue [Course Name].
  Group class [Class Name] completed.
  Lessons remaining: [X]
  Please send private class options.
  ```

### 12.5 WhatsApp Component

- [ ] Reusable `WhatsAppButton` component
- [ ] Props: phone, message, buttonText
- [ ] Green button with WhatsApp icon

### 12.6 Interface Layer - HTTP

- [ ] `whatsapp.controller.ts`
  - [ ] `GET /whatsapp/purchase-link/:courseId`
  - [ ] `GET /whatsapp/continue-link/:enrollmentId`
  - [ ] `GET /whatsapp/settings` - Admin

### 12.7 WhatsApp Module

- [ ] Create `whatsapp.module.ts`

---

## Phase 13: Package & Upgrade Management - PRD M25

### 13.1 Package Definition

- [ ] Package stored at CLASS level
- [ ] totalMeetings = Max lessons accessible
- [ ] Price calculation based on meetings
- [ ] Flexible input (10, 15, 20, 30, 50, custom)

### 13.2 Package Display

- [ ] Student dashboard: "Class Package: 20 Meetings (18/20 lessons unlocked)"
- [ ] Color coding: Green (plenty), Yellow (3-5 left), Red (0-2 left)
- [ ] Different messages for group vs private

### 13.3 Upgrade Rules

- [ ] Group Class:
  - [ ] Cannot upgrade within existing class
  - [ ] Cannot add meetings
  - [ ] Alternative: Continue as private class
- [ ] Private Class:
  - [ ] Can add meetings anytime
  - [ ] Staff updates totalMeetings
  - [ ] Student pays difference

### 13.4 Continue as Private (Group → Private)

- [ ] Trigger: Group class package exhausted
- [ ] Staff creates NEW private class
- [ ] Course: Same
- [ ] Package: Remaining lessons
- [ ] Student pays private rate
- [ ] Progress history linked

### 13.5 Private Class - Add Meetings

- [ ] Staff → Class detail → "Add Meetings"
- [ ] Input additional meetings
- [ ] System updates totalMeetings
- [ ] Unlock limit increased

### 13.6 Upsell Notifications

- [ ] 2-3 meetings remaining:
  - [ ] Toast notification
  - [ ] Email notification
  - [ ] Dashboard banner
- [ ] Different messages by class type

### 13.7 Interface Layer - HTTP

- [ ] `packages.controller.ts`
  - [ ] `GET /classes/:id/package`
  - [ ] `PATCH /classes/:id/add-meetings` - Private only
  - [ ] `POST /classes/continue-as-private`

### 13.8 Package Module

- [ ] Integrated into `class-management.module.ts`

---

## Phase 14: Community Context - PRD M26

### 14.1 Domain Layer

- [ ] Create Post Aggregate
- [ ] Create Group Aggregate
- [ ] Create Event Aggregate
- [ ] Create Domain Events

### 14.2 Application Layer

- [ ] Post Commands & Queries
- [ ] Comment Commands & Queries
- [ ] Group Commands & Queries
- [ ] Event Commands & Queries

### 14.3 Infrastructure & Interface Layer

- [ ] Repositories
- [ ] Controllers

### 14.4 Community Module

- [ ] Create `community.module.ts`

---

## Phase 15: Messaging Context - PRD M27

### 15.1 Domain Layer

- [ ] Create Conversation Aggregate
- [ ] Create Announcement Aggregate
- [ ] Create Domain Events

### 15.2 Application Layer

- [ ] Commands & Queries for messaging
- [ ] Commands & Queries for announcements

### 15.3 Infrastructure & Interface Layer

- [ ] Repositories
- [ ] Controllers

### 15.4 Messaging Module

- [ ] Create `messaging.module.ts`

---

## Phase 16: Notification Module - PRD M23

### 16.1 Email Service

- [ ] Create `email.service.ts`
  - [ ] Resend integration
  - [ ] Template rendering
- [ ] Create email templates:
  - [ ] Welcome email (new user)
  - [ ] Email verification
  - [ ] Password reset
  - [ ] Course enrolled
  - [ ] Lesson unlocked
  - [ ] Assignment due soon (3 days)
  - [ ] Assignment graded
  - [ ] Badge earned
  - [ ] Certificate earned
  - [ ] Payment confirmation

### 16.2 Push Notification Service

- [ ] Create `push.service.ts`
- [ ] In-app notification storage
- [ ] Real-time updates (optional WebSocket)

### 16.3 Queue Processors

- [ ] `email.processor.ts`
- [ ] `notification.processor.ts`

### 16.4 Triggered Emails (Event-based)

- [ ] UserRegisteredEvent → Welcome email
- [ ] StudentEnrolledEvent → Course added email
- [ ] LessonUnlockedEvent → Unlock email
- [ ] AssignmentGradedEvent → Graded email
- [ ] BadgeUnlockedEvent → Badge email

### 16.5 Notification Module

- [ ] Create `notification.module.ts`

---

## Phase 17: Infrastructure Services

### 17.1 File Storage

- [ ] Create `storage.module.ts`
- [ ] Create `s3.service.ts`
  - [ ] `upload()`
  - [ ] `getSignedUrl()`
  - [ ] `delete()`
- [ ] Create upload controller
  - [ ] `POST /upload/image`
  - [ ] `POST /upload/file`
  - [ ] `POST /upload/video`

### 17.2 Caching Service

- [ ] Create `cache.module.ts`
- [ ] Create `cache.service.ts`
  - [ ] `get()`, `set()`, `del()`
  - [ ] TTL management
- [ ] Implement caching for:
  - [ ] Course catalog
  - [ ] Leaderboard
  - [ ] User sessions

### 17.3 Queue Service

- [ ] Create `queue.module.ts`
- [ ] Setup BullMQ queues:
  - [ ] Email queue
  - [ ] Notification queue
  - [ ] Analytics queue

---

## Phase 18: Testing & Quality

### 18.1 Unit Tests

- [ ] All value objects
- [ ] All aggregates
- [ ] All command handlers
- [ ] All query handlers
- [ ] Domain services

### 18.2 Integration Tests

- [ ] All repositories
- [ ] Database transactions
- [ ] Redis operations

### 18.3 E2E Tests

- [ ] Authentication flow
- [ ] Course management flow
- [ ] Class enrollment flow
- [ ] Progress tracking flow
- [ ] Gamification flow

### 18.4 Performance Tests

- [ ] API response times
- [ ] Database query optimization
- [ ] Cache hit rates

---

## Phase 19: Security & Hardening

### 19.1 Security Implementation

- [ ] Rate limiting per endpoint
- [ ] CORS configuration
- [ ] Helmet security headers
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention

### 19.2 Audit & Logging

- [ ] Activity logging
- [ ] Error logging
- [ ] Security event logging

### 19.3 Security Testing

- [ ] Penetration testing
- [ ] Dependency vulnerability scan
- [ ] Security audit

---

## Phase 20: Documentation

### 20.1 API Documentation

- [ ] Swagger complete for all endpoints
- [ ] Request/response examples
- [ ] Error codes documentation

### 20.2 Developer Documentation

- [ ] README.md update
- [ ] Setup guide
- [ ] Architecture guide
- [ ] Contribution guide

### 20.3 Deployment Documentation

- [ ] Environment setup
- [ ] Docker deployment
- [ ] Cloud deployment guide

---

## Phase 21: Deployment & Launch

### 21.1 Staging Environment

- [ ] Setup staging server
- [ ] Deploy to staging
- [ ] Configure staging database
- [ ] Configure staging Redis
- [ ] Test all features

### 21.2 Production Environment

- [ ] Setup production server
- [ ] Configure production database (managed)
- [ ] Configure production Redis
- [ ] Setup SSL certificates
- [ ] Configure CDN
- [ ] Setup monitoring (Sentry)
- [ ] Setup uptime monitoring

### 21.3 Launch Checklist

- [ ] All tests passing
- [ ] Security audit complete
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Backup strategy verified
- [ ] Rollback plan ready
- [ ] Team trained
- [ ] Go live!

---

## Quick Reference: PRD Module Mapping

| PRD Module                  | TODO Phase | Status |
| --------------------------- | ---------- | ------ |
| M01: Authentication         | Phase 2    | ✅ 85% |
| M02: User Registration      | Phase 2    | ✅ 85% |
| M03: Course Management      | Phase 3    | ⬜     |
| M04: Content Delivery       | Phase 3    | ⬜     |
| M05: Assignment System      | Phase 5    | ⬜     |
| M06: Student Dashboard      | Phase 10   | ⬜     |
| M07: Progress Tracking      | Phase 3    | ⬜     |
| M08: XP & Leveling          | Phase 6    | ⬜     |
| M09: Badges                 | Phase 6    | ⬜     |
| M10: Leaderboard            | Phase 6    | ⬜     |
| M11: Daily Quests           | Phase 6    | ⬜     |
| M12: Class Creation         | Phase 4    | ⬜     |
| M13: Student Assignment     | Phase 4    | ⬜     |
| M14: Class Roster & Credits | Phase 4    | ⬜     |
| M15: Lesson Unlocking       | Phase 4    | ⬜     |
| M16: Instructor Dashboard   | Phase 9    | ⬜     |
| M17: Grading & Feedback     | Phase 5    | ⬜     |
| M18: Student Monitoring     | Phase 9    | ⬜     |
| M19: Enrollment Management  | Phase 8    | ⬜     |
| M20: Payment Tracking       | Phase 7    | ⬜     |
| M21: User Management        | Phase 11   | ⬜     |
| M22: System Analytics       | Phase 11   | ⬜     |
| M23: Email Notifications    | Phase 16   | ⬜     |
| M24: WhatsApp Integration   | Phase 12   | ⬜     |
| M25: Package & Upgrade      | Phase 13   | ⬜     |
| M26: Community              | Phase 14   | ⬜     |
| M27: Messaging              | Phase 15   | ⬜     |

---

## Quick Reference: File Counts by Phase

| Phase       | Focus                          | Estimated Time |
| ----------- | ------------------------------ | -------------- |
| Phase 0-1   | Infrastructure                 | 2 weeks        |
| Phase 2     | Identity & Auth                | 3 weeks        |
| Phase 3     | Learning & Content             | 4 weeks        |
| Phase 4     | Class Management               | 4 weeks        |
| Phase 5     | Assessment                     | 2 weeks        |
| Phase 6     | Gamification                   | 3 weeks        |
| Phase 7     | Billing                        | 1 week         |
| Phase 8     | Enrollment                     | 1 week         |
| Phase 9     | Instructor Tools               | 2 weeks        |
| Phase 10    | Student Dashboard              | 1 week         |
| Phase 11    | Admin Tools                    | 2 weeks        |
| Phase 12    | WhatsApp                       | 1 week         |
| Phase 13    | Package Management             | 1 week         |
| Phase 14-15 | Community & Messaging          | 3 weeks        |
| Phase 16-17 | Notifications & Infrastructure | 2 weeks        |
| Phase 18-21 | Testing, Security, Deployment  | 4 weeks        |

**Total: ~36 weeks (9 months)**

---

## Notes

- **Development Approach:** Focus on core implementation first, testing will be done at the end when all features are complete
- **Phase Completion:** Each phase focuses on feature implementation without immediate testing
- **Testing Strategy:** Comprehensive testing (unit, integration, E2E) will be implemented after all phases are complete
- **MVP Priority:** Identity → Learning → Class Management → Enrollment → Instructor Tools
- **Post-MVP:** Gamification, Community, Advanced Analytics
- Deploy to staging after each major phase
- Get user feedback early (after Phase 4)

---

**Document Changelog:**

| Version | Date         | Changes                                        |
| ------- | ------------ | ---------------------------------------------- |
| 2.0     | Dec 16, 2025 | Major update - Full PRD alignment (27 modules) |
| 1.3     | Dec 16, 2025 | Mark Phase 2.3 queries as complete             |
| 1.2     | Dec 16, 2025 | Update development approach - testing at end   |
| 1.1     | Dec 16, 2025 | Update Phase 2 status to 85% complete          |
| 1.0     | Dec 15, 2025 | Initial TODO list                              |
