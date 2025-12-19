# Implementation TODO List - LMS Baby Owl

**Last Updated:** December 18, 2025  
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
- [x] Create `create-user/` (Super Admin/Staff - create user accounts)
- [x] Create `update-user/` (Super Admin - update any user)
- [x] Create `deactivate-user/` (Super Admin - suspend/deactivate user)
- [x] Create `change-user-role/` (Super Admin only)
- [x] Create `commands/index.ts` with CommandHandlers array

**✅ Section 2.2 Complete** (admin commands done, email-related pending)

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
- [x] Create `user.mapper.ts`
  - [x] `toDomain()` - Prisma model → Domain entity
  - [x] `toPersistence()` - Domain entity → Prisma model
  - [x] `toUpdateData()` - Partial update data
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
  - [x] `POST /users` (Super Admin/Staff - create user)
  - [x] `PUT /users/:id` (Super Admin)
  - [x] `DELETE /users/:id` (Super Admin - deactivate)
  - [x] `PUT /users/:id/role` (Super Admin - change role)
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
  - [x] `create-user.dto.ts`
  - [x] `update-user.dto.ts`
  - [x] `deactivate-user.dto.ts`
  - [x] `change-user-role.dto.ts`
  - [x] `user-response.dto.ts`

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

**✅ Phase 2: ~92% Complete - Core Auth, User Management & Admin Commands Implemented**
_Remaining: Email features (depends on Phase 16), Activity Log, Tests_

---

## Phase 3: Learning Context (Courses, Lessons, Exercises) - PRD M03, M04, M07

### 3.1 Domain Layer

- [x] Create `src/modules/learning/domain/` structure
- [x] Create Value Objects:
  - [x] `course-id.vo.ts`
  - [x] `section-id.vo.ts`
  - [x] `lesson-id.vo.ts`
  - [x] `exercise-id.vo.ts`
  - [x] `course-status.vo.ts` (draft, published, archived)
  - [x] `course-level.vo.ts` (beginner, intermediate, advanced)
  - [x] `exercise-type.vo.ts` (video, quiz, material, assignment, coding)
  - [x] `slug.vo.ts`
  - [x] `quiz-type.vo.ts` (multiple_choice, match_pairs, fill_blanks, true_false, sentence_building, listening)
- [x] Create Course Aggregate:
  - [x] `course.aggregate.ts`
  - [x] Contains Sections (entities)
  - [x] Business methods:
    - [x] `addSection()`
    - [x] `removeSection()`
    - [x] `reorderSections()`
    - [x] `publish()`
    - [x] `archive()`
- [x] Create Section Entity:
  - [x] `section.entity.ts`
  - [x] Contains Lessons
  - [x] `addLesson()`, `removeLesson()`, `reorderLessons()`
- [x] Create Lesson Entity:
  - [x] `lesson.entity.ts`
  - [x] Contains Exercises
  - [x] `addExercise()`, `removeExercise()`, `reorderExercises()`
- [x] Create Exercise Entity:
  - [x] `exercise.entity.ts`
  - [x] Type-specific content handling:
    - [x] Video: YouTube embed, duration
    - [x] Quiz: 6 types (MCQ, Match, Fill, T/F, Sentence, Listening)
    - [x] Material: Rich text, images
    - [x] Assignment: Instructions, rubric, due date
    - [x] Coding: Test cases, auto-grading, playground
- [x] Create StudentProgress Aggregate:
  - [x] `student-progress.aggregate.ts`
  - [x] Track lesson completion
  - [x] Track exercise completion
  - [x] `progress-id.vo.ts` (ProgressId, LessonProgressId, ExerciseProgressId)
  - [x] `lesson-progress.entity.ts`
  - [x] `exercise-progress.entity.ts`
- [x] Create Domain Events:
  - [x] `course-created.event.ts`
  - [x] `course-published.event.ts`
  - [x] `section-added.event.ts`
  - [x] `lesson-added.event.ts`
  - [x] `exercise-added.event.ts`
  - [x] `exercise-completed.event.ts`
  - [x] `lesson-completed.event.ts`
- [x] Create Repository Interfaces:
  - [x] `course.repository.interface.ts`
  - [x] `progress.repository.interface.ts`
- [x] Create Domain Errors:
  - [x] `course-not-found.error.ts`
  - [x] `lesson-not-found.error.ts`
  - [x] `exercise-not-found.error.ts`
  - [x] `duplicate-slug.error.ts`
  - [x] `course-not-published.error.ts`
  - [x] `lesson-locked.error.ts`
  - [x] `section-not-found.error.ts`

**✅ Section 3.1 Complete**

### 3.2 Application Layer - Commands

- [x] Course Commands:
  - [x] `create-course/` (command + handler)
  - [x] `update-course/`
  - [x] `publish-course/`
  - [x] `archive-course/`
  - [x] `delete-course/`
- [x] Section Commands:
  - [x] `add-section/`
  - [x] `update-section/`
  - [x] `delete-section/`
  - [x] `reorder-sections/`
- [x] Lesson Commands:
  - [x] `add-lesson/`
  - [x] `update-lesson/`
  - [x] `delete-lesson/`
  - [x] `reorder-lessons/`
- [x] Exercise Commands:
  - [x] `add-exercise/`
  - [x] `update-exercise/`
  - [x] `delete-exercise/`
  - [x] `reorder-exercises/`
- [x] Progress Commands:
  - [x] `complete-exercise/`
  - [x] `update-video-progress/`
  - [x] `update-material-progress/`
  - [x] `submit-quiz-answer/`

**✅ Section 3.2 Complete**

### 3.3 Application Layer - Queries

- [x] `get-courses/` - Course catalog with filters (published, category, level, search)
- [x] `get-course/` - Course detail by ID or slug
- [x] `get-lesson-detail/` - Lesson with exercises and progress
- [x] `get-exercise-detail/` - Single exercise detail with progress
- [x] `get-student-progress/` - Progress for a course
- [x] `get-course-stats/` - Course statistics (instructor view)
- [x] `get-student-courses/` - All enrolled courses

**✅ Section 3.3 Complete**

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

- [x] `course.repository.ts`
- [x] `course.mapper.ts`
- [x] `progress.repository.ts`
- [x] `progress.mapper.ts`

**✅ Section 3.6 Complete**

### 3.7 Interface Layer - HTTP

- [x] `courses.controller.ts`
  - [x] `GET /courses/catalog` - Public catalog with filters
  - [x] `GET /courses/:idOrSlug` - Detail by ID or slug
  - [x] `POST /courses` - Create (Instructor/Super Admin)
  - [x] `PUT /courses/:id` - Update
  - [x] `DELETE /courses/:id` - Delete
  - [x] `POST /courses/:id/publish`
  - [x] `POST /courses/:id/archive`
- [x] DTOs:
  - [x] `create-course.dto.ts`
  - [x] `update-course.dto.ts`
  - [x] `course-query.dto.ts`
  - [x] `add-section.dto.ts`, `update-section.dto.ts`, `reorder-sections.dto.ts`
  - [x] `add-lesson.dto.ts`, `update-lesson.dto.ts`, `reorder-lessons.dto.ts`
  - [x] `add-exercise.dto.ts`, `update-exercise.dto.ts`, `reorder-exercises.dto.ts`
  - [x] `complete-exercise.dto.ts`, `update-video-progress.dto.ts`, `update-material-progress.dto.ts`, `submit-quiz.dto.ts`
- [x] `sections.controller.ts`
  - [x] `POST /courses/:courseId/sections`
  - [x] `PUT /courses/:courseId/sections/:sectionId`
  - [x] `DELETE /courses/:courseId/sections/:sectionId`
  - [x] `PUT /courses/:courseId/sections/reorder`
- [x] `lessons.controller.ts`
  - [x] `GET /courses/:cid/sections/:sid/lessons/:lid`
  - [x] `POST /courses/:cid/sections/:sid/lessons`
  - [x] `PUT /courses/:cid/sections/:sid/lessons/:lid`
  - [x] `DELETE /courses/:cid/sections/:sid/lessons/:lid`
  - [x] `PUT /courses/:cid/sections/:sid/lessons/reorder`
- [x] `exercises.controller.ts`
  - [x] `GET /courses/:cid/sections/:sid/lessons/:lid/exercises/:eid`
  - [x] `POST /courses/:cid/sections/:sid/lessons/:lid/exercises`
  - [x] `PUT /courses/:cid/sections/:sid/lessons/:lid/exercises/:eid`
  - [x] `DELETE /courses/:cid/sections/:sid/lessons/:lid/exercises/:eid`
  - [x] `PUT /courses/:cid/sections/:sid/lessons/:lid/exercises/reorder`
- [x] `progress.controller.ts`
  - [x] `POST /progress/exercises/:id/complete`
  - [x] `PUT /progress/exercises/:id/video`
  - [x] `PUT /progress/exercises/:id/material`
  - [x] `POST /progress/exercises/:id/quiz`
  - [x] `GET /progress/courses/:id` - Student progress
  - [x] `GET /progress/courses/:id/stats` - Course statistics
  - [x] `GET /progress/my-courses` - Student enrolled courses
  - [x] `POST /progress/courses/:id/certificate` - Generate certificate

**✅ Section 3.7 Complete**

### 3.8 Learning Module

- [x] Create `learning.module.ts`
- [x] Register in `app.module.ts`
- [x] Seed data for courses (5 courses with sections, lessons, exercises)
- [x] Seed data for student progress (3 students with various progress levels)

### 3.9 Tests - Learning

- [ ] Unit tests for domain
- [ ] Integration tests for repository
- [ ] E2E tests for API

**✅ Phase 3: 100% Complete - Learning Context Fully Implemented**
_Remaining: Tests (deferred to Phase 18)_

---

## Phase 4: Class Management Context - PRD M12, M13, M14, M15

### 4.1 Domain Layer

- [x] Create Value Objects:
  - [x] `class-id.vo.ts`
  - [x] `enrollment-id.vo.ts`
  - [x] `class-type.vo.ts` (group, private)
  - [x] `class-status.vo.ts` (draft, enrollment_open, active, completed, cancelled)
  - [x] `meeting-credit.vo.ts`
  - [x] `attendance-status.vo.ts` (present, absent, late)
  - [x] `schedule.vo.ts`
  - [x] `enrollment-status.vo.ts` (active, completed, withdrawn)
- [x] Create Class Aggregate:
  - [x] `class.aggregate.ts`
  - [x] Contains Enrollments
  - [x] Business rules:
    - [x] 1 Meeting = 1 Lesson (fixed ratio)
    - [x] Package is at class level
    - [x] Group: No enroll after active status
    - [x] Private: Can add meetings anytime
  - [x] Business methods:
    - [x] `enrollStudent()` - with enrollment rules
    - [x] `removeStudent()`
    - [x] `markAttendance()` - affects credits
    - [x] `adjustCredits()` - manual adjustment
    - [x] `unlockLesson()` - unlock lesson + all exercises
    - [x] `activate()`
    - [x] `complete()`
    - [x] `cancel()`
    - [x] `openEnrollment()`
    - [x] `addMeetings()` - for private classes
- [x] Create Enrollment Entity:
  - [x] `enrollment.entity.ts`
  - [x] `meetingCredits` - initial = class.totalMeetings
  - [x] `creditsUsed` - incremented on attendance
  - [x] `creditsRemaining` - for makeup classes
  - [x] Progress tracking
- [x] Create Attendance Entity:
  - [x] `attendance.entity.ts`
  - [x] Meeting number, Date, Status
  - [x] Credit impact (present/late = -1, absent = 0)
  - [x] `updateStatus()` - edit with credit delta handling
- [x] Create LessonUnlock Entity:
  - [x] `lesson-unlock.entity.ts`
  - [x] Unlocking lesson unlocks ALL exercises inside
- [x] Create CreditAdjustment Entity:
  - [x] `credit-adjustment.entity.ts`
  - [x] Amount (+/-), Reason, Adjusted by, Timestamp
- [x] Create Domain Events:
  - [x] `class-created.event.ts`
  - [x] `class-activated.event.ts`
  - [x] `student-enrolled.event.ts`
  - [x] `student-removed.event.ts`
  - [x] `attendance-marked.event.ts`
  - [x] `credit-adjusted.event.ts`
  - [x] `lesson-unlocked.event.ts`
  - [x] `class-completed.event.ts`
- [ ] Create Domain Services:
  - [ ] `credit-calculator.service.ts` (logic embedded in aggregate)
- [x] Business Rules (implemented in aggregate):
  - [x] Group: No enroll after active
  - [x] Group: Check deadline
  - [x] Private: Max 1 student
  - [x] Only instructor can unlock
  - [x] Cannot exceed package limit
  - [x] Lessons unlocked ≤ Meetings completed
- [x] Create Repository Interface:
  - [x] `class.repository.interface.ts`
- [x] Create Domain Errors:
  - [x] `class-not-found.error.ts`
  - [x] `class-full.error.ts`
  - [x] `enrollment-closed.error.ts`
  - [x] `already-enrolled.error.ts`
  - [x] `enrollment-not-found.error.ts`
  - [x] `unauthorized-unlock.error.ts`
  - [x] `insufficient-credits.error.ts`

**✅ Section 4.1 Complete**

### 4.2 Application Layer - Commands

- [x] Class Commands:
  - [x] `create-class/` - Staff/Super Admin
  - [x] `update-class/`
  - [x] `open-enrollment/`
  - [x] `activate-class/`
  - [x] `complete-class/`
  - [x] `cancel-class/`
  - [ ] `duplicate-class/`
- [x] Enrollment Commands:
  - [x] `enroll-student/` - with enrollment rules validation
  - [x] `remove-student/`
  - [ ] `transfer-student/`
  - [ ] `bulk-enroll-students/` - CSV upload
- [x] Attendance Commands:
  - [x] `mark-attendance/` - affects credits
  - [x] `update-attendance/`
  - [ ] `bulk-mark-attendance/`
- [x] Credit Commands:
  - [x] `adjust-credits/` - manual adjustment with reason
- [x] Unlock Commands:
  - [x] `unlock-lesson/` - unlocks lesson + all exercises
  - [ ] `bulk-unlock-lessons/`
  - [ ] `lock-lesson/` - revert (rare)

**✅ Section 4.2 ~85% Complete**

### 4.3 Application Layer - Queries

- [x] `get-classes/` - Filter by status, instructor, course
- [x] `get-class/` - Class detail
- [x] `get-class-roster/` - Students in class with progress & credits
- [x] `get-class-attendance/` - Attendance history
- [ ] `get-attendance-report/` - Export
- [x] `get-credit-history/` - Adjustments log
- [x] `get-unlocked-lessons/` - For a class
- [ ] `get-unlock-history/` - Audit log
- [x] `get-instructor-classes/`
- [x] `get-student-classes/`
- [x] `get-student-attendance/`
- [ ] `get-class-analytics/` - Avg completion, engagement

**✅ Section 4.3 ~80% Complete**

### 4.4 Application Layer - Read Models

- [x] Read models integrated in query handlers (ClassRosterResult, etc.)

### 4.5 Infrastructure Layer

- [x] `class.repository.ts`
- [x] `class.mapper.ts`

**✅ Section 4.5 Complete**

### 4.6 Interface Layer - HTTP

- [x] `classes.controller.ts` (all endpoints in single controller)
  - [x] `GET /classes` - Staff/Super Admin
  - [x] `GET /classes/:id`
  - [x] `GET /classes/my-classes` - Instructor
  - [x] `GET /classes/enrolled` - Student
  - [x] `POST /classes` - Staff/Super Admin
  - [x] `PUT /classes/:id`
  - [x] `POST /classes/:id/open-enrollment`
  - [x] `POST /classes/:id/activate`
  - [x] `POST /classes/:id/complete`
  - [x] `DELETE /classes/:id` - Cancel
  - [x] `POST /classes/:id/enroll`
  - [x] `DELETE /classes/:id/students/:studentId`
  - [x] `GET /classes/:id/roster`
  - [x] `POST /classes/:id/attendance`
  - [x] `GET /classes/:id/attendance`
  - [x] `GET /classes/:id/attendance/students/:studentId`
  - [x] `PUT /classes/:id/attendance/:attendanceId`
  - [x] `POST /classes/:id/credits`
  - [x] `GET /classes/:id/enrollments/:enrollmentId/credits/history`
  - [x] `POST /classes/:id/unlock-lesson`
  - [x] `GET /classes/:id/unlocked-lessons`

**✅ Section 4.6 ~90% Complete**

### 4.7 Class Management Module

- [x] Create `class-management.module.ts`

**✅ Section 4.7 Complete**

### 4.8 Tests - Class Management

- [ ] Unit tests for aggregate
- [ ] Policy tests
- [ ] Integration tests
- [ ] E2E tests

**✅ Phase 4: ~90% Complete - Core Class Management Implemented**
_Remaining: duplicate-class, transfer-student, bulk operations, analytics, tests_

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

- [x] Create Value Objects:
  - [x] `payment-id.vo.ts` - UUID generation & validation
  - [x] `payment-status.vo.ts` (pending, verified, rejected, refunded)
  - [x] `payment-method.vo.ts` (bank_transfer, e_wallet, credit_card, cash, other)
  - [x] `money.vo.ts` - Monetary value handling with currency
- [x] Create Payment Aggregate:
  - [x] `payment.aggregate.ts`
  - [x] Student info (name, email, phone), Amount, Course, Package
  - [x] Reference ID, Notes, Proof URL
  - [x] `verify()`, `reject()`, `refund()`, `updateDetails()`, `uploadProof()`
- [x] Create Domain Events:
  - [x] `payment-created.event.ts`
  - [x] `payment-verified.event.ts`
  - [x] `payment-rejected.event.ts`
  - [x] `payment-refunded.event.ts`
- [x] Create Domain Errors:
  - [x] `payment-not-found.error.ts`
  - [x] `payment-already-verified.error.ts`
  - [x] `payment-already-rejected.error.ts`
  - [x] `payment-already-refunded.error.ts`
  - [x] `invalid-refund-amount.error.ts`
- [x] Create Repository Interface

**✅ Section 7.1 Complete**

### 7.2 Application Layer - Commands

- [x] `create-payment/` - Staff/Super Admin
- [x] `update-payment/`
- [x] `verify-payment/`
- [x] `reject-payment/`
- [x] `refund-payment/`
- [x] `upload-proof/`

**✅ Section 7.2 Complete**

### 7.3 Application Layer - Queries

- [x] `get-payments/` - Filter, search, sort, pagination
- [x] `get-payment/` - Payment detail by ID
- [x] `get-payment-stats/` - Revenue analytics (total, verified, pending, refunded)

**✅ Section 7.3 Complete**

### 7.4 Infrastructure & Interface Layer

- [x] `payment.repository.ts` - Prisma implementation
- [x] `payment.mapper.ts` - Domain ↔ Persistence mapping
- [x] `payments.controller.ts`
  - [x] `GET /payments` - Staff/Super Admin (with filters, pagination)
  - [x] `GET /payments/stats` - Revenue statistics
  - [x] `GET /payments/:id`
  - [x] `POST /payments`
  - [x] `PUT /payments/:id`
  - [x] `POST /payments/:id/verify`
  - [x] `POST /payments/:id/reject`
  - [x] `POST /payments/:id/refund`
  - [x] `POST /payments/:id/proof`
  - [ ] `GET /payments/export` - CSV (TODO)
- [x] DTOs:
  - [x] `create-payment.dto.ts`
  - [x] `update-payment.dto.ts`
  - [x] `verify-payment.dto.ts`
  - [x] `reject-payment.dto.ts`
  - [x] `refund-payment.dto.ts`
  - [x] `payment-query.dto.ts`
  - [x] `payment.dto.ts` (response)

**✅ Section 7.4 ~95% Complete**

### 7.5 Billing Module

- [x] Create `billing.module.ts`
- [x] Register in `app.module.ts`
- [x] Seed data for payments (11 records: 5 verified, 5 pending, 1 refunded)

**✅ Section 7.5 Complete**

**✅ Phase 7: ~95% Complete - Billing & Payment Context Implemented**
_Remaining: Export to CSV endpoint_

---

## Phase 8: Staff & Enrollment Management Context - PRD M19

### 8.1 Staff Module (Quick Enrollment Tool - Critical Feature)

- [x] Application Layer - Commands:
  - [x] `quick-enroll/` - Create user + Enroll + Create payment record
- [x] Application Layer - Queries:
  - [x] `get-staff-dashboard/` - Dashboard stats, quick stats, recent activity, pending actions
  - [x] `search-students/` - Search existing students for enrollment
  - [x] `get-available-classes/` - Classes available for enrollment with package options
- [x] Interface Layer:
  - [x] `staff.controller.ts`
    - [x] `GET /staff/dashboard` - Staff dashboard data
    - [x] `GET /staff/quick-enroll/search-student` - Search students
    - [x] `GET /staff/quick-enroll/available-classes` - Available classes
    - [x] `POST /staff/quick-enroll` - One-step enrollment (create student if new + enroll + payment)
    - [x] `GET /staff/pending-payments` - Pending payments for verification
- [x] Staff Module registered in app.module.ts

**✅ Section 8.1 Complete**

### 8.2 Enrollment Management Commands (Class Management)

- [x] `transfer-enrollment/` - Transfer student between classes (same course)
- [x] `cancel-enrollment/` - Cancel enrollment with refund tracking
- [ ] `bulk-enroll/` - CSV upload, validation, batch create (TODO)
- [ ] `get-enrollment-history/` - Audit log (TODO)
- [ ] `get-enrollment-analytics/` - Trends (TODO)

**✅ Section 8.2 ~60% Complete**

### 8.3 Integration with Payment Tracking

- [x] Quick enroll creates payment record automatically
- [ ] Pre-fill enrollment form from payment record (TODO)
- [ ] Link payment → enrollment (TODO)

**✅ Phase 8: ~70% Complete - Staff Module & Quick Enrollment Implemented**
_Remaining: Bulk enroll, enrollment analytics, payment prefill_

---

## Phase 9: Instructor Tools Context - PRD M16, M18

### 9.1 Instructor Dashboard (PRD M16)

- [x] Dashboard Overview:
  - [x] My Classes widget (3-5 classes)
  - [x] Pending Tasks (unlock lessons)
  - [x] Student Stats (total students, avg completion, at-risk count)
  - [x] Upcoming Meetings (schedule)
- [ ] Quick Actions (TODO):
  - [ ] Grade Next Assignment
  - [x] Unlock Next Lesson (via pending tasks)
  - [ ] Message Students
- [x] Class Management:
  - [x] Class list with filters
  - [x] Class detail view

**✅ Section 9.1 ~80% Complete**

### 9.2 Student Monitoring (PRD M18)

- [x] Individual Student Progress View:
  - [x] Detailed breakdown (lessons completed, progress %)
  - [x] Attendance stats
  - [ ] Quiz scores, Assignment grades (TODO: after Assessment module)
- [x] At-Risk Student Detection:
  - [x] No activity in 7+ days
  - [x] No progress with available lessons
  - [x] High absence rate (>30%)
  - [x] Alert on dashboard and dedicated endpoint
- [ ] Student Communication (TODO):
  - [ ] Send email from LMS
  - [ ] Pre-filled subject/body
- [ ] Progress Reports (TODO):
  - [ ] Generate PDF per student
  - [ ] Progress %, Grades, Attendance

**✅ Section 9.2 ~60% Complete**

### 9.3 Interface Layer - HTTP

- [x] `instructor.controller.ts`
  - [x] `GET /instructor/dashboard` - Dashboard data
  - [x] `GET /instructor/classes` - Instructor's classes with filters
  - [x] `GET /instructor/classes/:classId/students` - Students in class
  - [x] `GET /instructor/at-risk-students` - At-risk students
  - [ ] `GET /instructor/analytics` (TODO)

**✅ Section 9.3 ~80% Complete**

### 9.4 Instructor Module

- [x] Create `instructor.module.ts`
- [x] Register in `app.module.ts`

**✅ Section 9.4 Complete**

**✅ Phase 9: ~70% Complete - Instructor Tools Implemented**
_Remaining: Analytics, student messaging, PDF reports, assignment grading_

---

## Phase 10: Student Dashboard Context - PRD M06

### 10.1 Dashboard Overview

- [x] My Courses widget:
  - [x] Enrolled courses with progress bars
  - [x] Next lesson to continue
  - [x] Enrolled date
- [x] Stats widget:
  - [x] Total lessons completed
  - [x] Active/Completed enrollments
  - [ ] Current streak (TODO: Gamification module)
  - [ ] XP earned (TODO: Gamification module)
  - [ ] Current level (TODO: Gamification module)
- [x] Next Steps widget:
  - [x] Next lesson to continue
  - [ ] Pending assignments (TODO: Assessment module)
- [x] Schedule & Deadlines:
  - [x] Upcoming classes from active enrollments

**✅ Section 10.1 ~80% Complete**

### 10.2 Course Detail View

- [x] Syllabus with sections/lessons
- [x] Progress indicators per section
- [x] Locked/Unlocked visual
- [x] Next lesson highlight
- [x] Lesson access check endpoint

**✅ Section 10.2 Complete**

### 10.3 Learning Interface

- [ ] Exercise renderer (video, quiz, material, coding)
- [ ] Navigation (prev/next)
- [ ] Progress auto-save
- [ ] Completion confirmation

### 10.4 Interface Layer - HTTP

- [x] `student.controller.ts`
  - [x] `GET /student/dashboard` - Full dashboard data
  - [x] `GET /student/courses` - All enrolled courses
  - [x] `GET /student/courses/active` - Active courses only
  - [x] `GET /student/courses/completed` - Completed courses only
  - [x] `GET /student/classes/:classId` - Course/class detail
  - [x] `GET /student/classes/:classId/lessons/:lessonId/access` - Lesson access check
  - [x] `GET /student/:studentId/dashboard` - Admin view of student dashboard
  - [x] `GET /student/:studentId/courses` - Admin view of student courses

**✅ Section 10.4 Complete**

### 10.5 Student Module

- [x] Create `student.module.ts`
- [x] Register in `app.module.ts`

**✅ Section 10.5 Complete**

**✅ Phase 10: ~85% Complete - Student Dashboard Implemented**
_Remaining: Learning interface, gamification stats, assignments integration_

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

| PRD Module                  | TODO Phase | Status  |
| --------------------------- | ---------- | ------- |
| M01: Authentication         | Phase 2    | ✅ 92%  |
| M02: User Registration      | Phase 2    | ✅ 92%  |
| M03: Course Management      | Phase 3    | ✅ 100% |
| M04: Content Delivery       | Phase 3    | 🚧 70%  |
| M05: Assignment System      | Phase 5    | ⬜      |
| M06: Student Dashboard      | Phase 10   | 🚧 85%  |
| M07: Progress Tracking      | Phase 3    | ✅ 100% |
| M08: XP & Leveling          | Phase 6    | ⬜      |
| M09: Badges                 | Phase 6    | ⬜      |
| M10: Leaderboard            | Phase 6    | ⬜      |
| M11: Daily Quests           | Phase 6    | ⬜      |
| M12: Class Creation         | Phase 4    | ✅ 90%  |
| M13: Student Assignment     | Phase 4    | ✅ 90%  |
| M14: Class Roster & Credits | Phase 4    | ✅ 90%  |
| M15: Lesson Unlocking       | Phase 4    | ✅ 90%  |
| M16: Instructor Dashboard   | Phase 9    | 🚧 70%  |
| M17: Grading & Feedback     | Phase 5    | ⬜      |
| M18: Student Monitoring     | Phase 9    | 🚧 60%  |
| M19: Enrollment Management  | Phase 8    | 🚧 70%  |
| M20: Payment Tracking       | Phase 7    | ✅ 95%  |
| M21: User Management        | Phase 11   | ⬜      |
| M22: System Analytics       | Phase 11   | ⬜      |
| M23: Email Notifications    | Phase 16   | ⬜      |
| M24: WhatsApp Integration   | Phase 12   | ⬜      |
| M25: Package & Upgrade      | Phase 13   | ⬜      |
| M26: Community              | Phase 14   | ⬜      |
| M27: Messaging              | Phase 15   | ⬜      |

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

| Version | Date         | Changes                                                             |
| ------- | ------------ | ------------------------------------------------------------------- |
| 2.8     | Dec 18, 2025 | Phase 10 ~85% - Student Dashboard implemented                       |
|         |              | - Student module with dashboard and course views                    |
|         |              | - Queries: Dashboard, MyCourses, CourseDetail, LessonAccess         |
|         |              | - StudentController with 8 endpoints                                |
|         |              | - Full course syllabus with unlock/completion status                |
| 2.7     | Dec 18, 2025 | Phase 9 ~70% - Instructor Tools implemented                         |
|         |              | - Instructor module with dashboard & student monitoring             |
|         |              | - Queries: Dashboard, Classes, ClassStudents, AtRiskStudents        |
|         |              | - InstructorController with 4 endpoints                             |
|         |              | - At-risk detection: inactivity, no progress, high absence          |
| 2.6     | Dec 18, 2025 | Phase 8 ~70% - Staff & Enrollment Management implemented            |
|         |              | - Staff module with quick enrollment workflow                       |
|         |              | - Commands: QuickEnroll, TransferEnrollment, CancelEnrollment       |
|         |              | - Queries: StaffDashboard, SearchStudents, AvailableClasses         |
|         |              | - StaffController with 5 endpoints                                  |
|         |              | - Auto-creates user + enrollment + payment in single transaction    |
| 2.5     | Dec 18, 2025 | Phase 7 ~95% - Billing & Payment Context implemented                |
|         |              | - Payment aggregate with full business logic                        |
|         |              | - Value objects: PaymentId, PaymentStatus, PaymentMethod, Money     |
|         |              | - Domain events: Created, Verified, Rejected, Refunded              |
|         |              | - Commands: Create, Update, Verify, Reject, Refund, UploadProof     |
|         |              | - Queries: GetPayments, GetPayment, GetPaymentStats                 |
|         |              | - PaymentsController with 9 endpoints                               |
|         |              | - Seed data: 11 payment records (5 verified, 5 pending, 1 refunded) |
| 2.4     | Dec 17, 2025 | Phase 4 ~90% - Class Management Context implemented                 |
|         |              | - Cancel class command & endpoint                                   |
|         |              | - Get unlocked lessons query & endpoint                             |
|         |              | - Get credit history query & endpoint                               |
|         |              | - Update attendance command & endpoint                              |
| 2.3     | Dec 17, 2025 | Phase 3 100% - Added certificate & get-student-courses              |
| 2.2     | Dec 17, 2025 | Phase 3 ~95% complete - Full Learning Context implemented           |
|         |              | - StudentProgress aggregate & entities                              |
|         |              | - Progress repository & mapper                                      |
|         |              | - All Section/Lesson/Exercise CRUD commands                         |
|         |              | - All Progress commands (complete, video, material, quiz)           |
|         |              | - All controllers & DTOs                                            |
|         |              | - Progress queries (student progress, course stats)                 |
|         |              | - Seed data for student progress                                    |
| 2.1     | Dec 17, 2025 | Phase 3 progress update - Course CRUD & catalog APIs done           |
| 2.0     | Dec 16, 2025 | Major update - Full PRD alignment (27 modules)                      |
| 1.3     | Dec 16, 2025 | Mark Phase 2.3 queries as complete                                  |
| 1.2     | Dec 16, 2025 | Update development approach - testing at end                        |
| 1.1     | Dec 16, 2025 | Update Phase 2 status to 85% complete                               |
| 1.0     | Dec 15, 2025 | Initial TODO list                                                   |
