# Implementation TODO List - LMS Baby Owl

**Last Updated:** December 16, 2025  
**Total Estimated Time:** 9 months (36 weeks)

---

## Progress Legend

- ⬜ Not Started
- 🚧 In Progress
- ✅ Completed
- ⏸️ Blocked
- ❌ Cancelled

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

## Phase 2: Identity Context (Authentication & Users)

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
- [ ] Create `create-user/` (Admin only - TODO: later)
- [x] Create `commands/index.ts` with CommandHandlers array

**✅ Section 2.2 Complete** (core commands done, email-related pending)

### 2.3 Application Layer - Queries

- [ ] Create `get-user-by-id/`
  - [ ] `get-user-by-id.query.ts`
  - [ ] `get-user-by-id.handler.ts`
- [ ] Create `get-user-profile/`
  - [ ] `get-user-profile.query.ts`
  - [ ] `get-user-profile.handler.ts`
- [ ] Create `get-users-list/` (Admin)
  - [ ] `get-users-list.query.ts`
  - [ ] `get-users-list.handler.ts`
  - [ ] Pagination
  - [ ] Filter by role, status
  - [ ] Search by name, email
- [ ] Create `check-email-exists/`
  - [ ] `check-email-exists.query.ts`
  - [ ] `check-email-exists.handler.ts`

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
  - [ ] `GET /users` (Admin)
  - [x] `GET /users/:id`
  - [x] `GET /users/me`
  - [x] `PUT /users/me`
  - [ ] `POST /users` (Admin - create user)
  - [ ] `PUT /users/:id` (Admin)
  - [ ] `DELETE /users/:id` (Admin - deactivate)
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

## Phase 3: Learning Context (Courses, Lessons, Exercises)

### 3.1 Domain Layer

- [ ] Create `src/modules/learning/domain/` structure
- [ ] Create Value Objects:
  - [ ] `course-id.vo.ts`
  - [ ] `section-id.vo.ts`
  - [ ] `lesson-id.vo.ts`
  - [ ] `exercise-id.vo.ts`
  - [ ] `course-status.vo.ts` (draft, published, archived)
  - [ ] `course-level.vo.ts` (beginner, intermediate, advanced)
  - [ ] `exercise-type.vo.ts` (video, quiz, material, assignment, coding)
  - [ ] `slug.vo.ts`
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
  - [ ] Type-specific content handling
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

### 3.4 Application Layer - Read Models

- [ ] `course-catalog.read-model.ts`
  - [ ] Optimized for listing
  - [ ] Category filtering
  - [ ] Search
- [ ] `course-detail.read-model.ts`
- [ ] `student-progress.read-model.ts`

### 3.5 Infrastructure Layer

- [ ] `course.repository.ts`
- [ ] `course.mapper.ts`
- [ ] `progress.repository.ts`
- [ ] `progress.mapper.ts`

### 3.6 Interface Layer - HTTP

- [ ] `courses.controller.ts`
  - [ ] `GET /courses` - Catalog
  - [ ] `GET /courses/:id` - Detail
  - [ ] `POST /courses` - Create (Instructor)
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
- [ ] `progress.controller.ts`
  - [ ] `GET /courses/:id/progress`
  - [ ] `GET /users/me/courses`

### 3.7 Learning Module

- [ ] Create `learning.module.ts`

### 3.8 Tests - Learning

- [ ] Unit tests for domain
- [ ] Integration tests for repository
- [ ] E2E tests for API

---

## Phase 4: Class Management Context

### 4.1 Domain Layer

- [ ] Create Value Objects:
  - [ ] `class-id.vo.ts`
  - [ ] `enrollment-id.vo.ts`
  - [ ] `class-type.vo.ts` (group, private)
  - [ ] `class-status.vo.ts`
  - [ ] `meeting-credit.vo.ts`
  - [ ] `attendance-status.vo.ts`
  - [ ] `schedule.vo.ts`
- [ ] Create Class Aggregate:
  - [ ] `class.aggregate.ts`
  - [ ] Contains Enrollments
  - [ ] Business methods:
    - [ ] `enrollStudent()` - with business rules
    - [ ] `removeStudent()`
    - [ ] `markAttendance()`
    - [ ] `adjustCredit()`
    - [ ] `unlockLesson()`
    - [ ] `activate()`
    - [ ] `complete()`
- [ ] Create Enrollment Entity:
  - [ ] `enrollment.entity.ts`
  - [ ] Credit management
  - [ ] Progress tracking
- [ ] Create Attendance Entity:
  - [ ] `attendance.entity.ts`
- [ ] Create LessonUnlock Entity:
  - [ ] `lesson-unlock.entity.ts`
- [ ] Create CreditAdjustment Entity:
  - [ ] `credit-adjustment.entity.ts`
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
  - [ ] `create-class/`
  - [ ] `update-class/`
  - [ ] `activate-class/`
  - [ ] `complete-class/`
  - [ ] `cancel-class/`
- [ ] Enrollment Commands:
  - [ ] `enroll-student/`
  - [ ] `remove-student/`
  - [ ] `transfer-student/`
- [ ] Attendance Commands:
  - [ ] `mark-attendance/`
  - [ ] `update-attendance/`
  - [ ] `bulk-mark-attendance/`
- [ ] Credit Commands:
  - [ ] `adjust-credit/`
- [ ] Unlock Commands:
  - [ ] `unlock-lesson/`
  - [ ] `unlock-all-lessons/`

### 4.3 Application Layer - Queries

- [ ] `get-classes-list/` - Filter by status, instructor
- [ ] `get-class-detail/`
- [ ] `get-class-roster/` - Students in class
- [ ] `get-class-attendance/` - Attendance history
- [ ] `get-attendance-report/` - Export
- [ ] `get-credit-balance/` - Student credits
- [ ] `get-credit-history/` - Adjustments
- [ ] `get-unlocked-lessons/` - For a class
- [ ] `get-instructor-classes/`
- [ ] `get-student-classes/`

### 4.4 Application Layer - Read Models

- [ ] `class-roster.read-model.ts`
- [ ] `attendance-report.read-model.ts`
- [ ] `class-progress.read-model.ts`

### 4.5 Infrastructure Layer

- [ ] `class.repository.ts`
- [ ] `class.mapper.ts`

### 4.6 Interface Layer - HTTP

- [ ] `classes.controller.ts`
  - [ ] `GET /classes`
  - [ ] `GET /classes/:id`
  - [ ] `POST /classes`
  - [ ] `PUT /classes/:id`
  - [ ] `POST /classes/:id/activate`
  - [ ] `POST /classes/:id/complete`
- [ ] `enrollments.controller.ts`
  - [ ] `GET /classes/:id/enrollments`
  - [ ] `POST /classes/:id/enrollments`
  - [ ] `DELETE /classes/:classId/enrollments/:studentId`
  - [ ] `GET /enrollments/:id/credits`
  - [ ] `POST /enrollments/:id/credits/adjust`
- [ ] `attendance.controller.ts`
  - [ ] `GET /classes/:id/attendance`
  - [ ] `POST /classes/:id/attendance`
  - [ ] `PUT /classes/:id/attendance/:meetingNumber`
  - [ ] `GET /classes/:id/attendance/report`
- [ ] `lesson-unlocks.controller.ts`
  - [ ] `GET /classes/:id/unlocked-lessons`
  - [ ] `POST /classes/:id/unlock-lesson`

### 4.7 Class Management Module

- [ ] Create `class-management.module.ts`

### 4.8 Tests - Class Management

- [ ] Unit tests for aggregate
- [ ] Policy tests
- [ ] Integration tests
- [ ] E2E tests

---

## Phase 5: Assessment Context

### 5.1 Domain Layer

- [ ] Create Value Objects
- [ ] Create Assignment Aggregate
- [ ] Create Submission Entity
- [ ] Create Domain Events
- [ ] Create Repository Interface

### 5.2 Application Layer

- [ ] Commands:
  - [ ] `submit-assignment/`
  - [ ] `resubmit-assignment/`
  - [ ] `grade-submission/`
  - [ ] `return-for-revision/`
- [ ] Queries:
  - [ ] `get-pending-submissions/`
  - [ ] `get-student-submissions/`
  - [ ] `get-submission-detail/`

### 5.3 Infrastructure & Interface Layer

- [ ] Repository implementation
- [ ] Controllers
- [ ] DTOs

### 5.4 Assessment Module

- [ ] Create `assessment.module.ts`

---

## Phase 6: Gamification Context

### 6.1 Domain Layer

- [ ] Create Value Objects:
  - [ ] `xp-amount.vo.ts`
  - [ ] `level.vo.ts`
  - [ ] `streak.vo.ts`
  - [ ] `badge-type.vo.ts`
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
- [ ] Create Domain Services:
  - [ ] `xp-calculator.service.ts`
    - [ ] XP rules per action
  - [ ] `level-calculator.service.ts`
    - [ ] XP thresholds per level
  - [ ] `badge-evaluator.service.ts`
    - [ ] Badge criteria checking

### 6.2 Application Layer - Commands

- [ ] `award-xp/`
- [ ] `update-streak/`
- [ ] `unlock-badge/`
- [ ] `complete-quest/`
- [ ] `reset-daily-quests/`

### 6.3 Application Layer - Queries

- [ ] `get-player-stats/`
- [ ] `get-leaderboard/` - Weekly/Monthly/All-time
- [ ] `get-badges/` - All + user's earned
- [ ] `get-daily-quests/`

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
- [ ] `badges.controller.ts`
  - [ ] `GET /badges`
  - [ ] `GET /badges/earned`
- [ ] `quests.controller.ts`
  - [ ] `GET /quests/daily`

### 6.8 Gamification Module

- [ ] Create `gamification.module.ts`

---

## Phase 7: Billing Context

### 7.1 Domain Layer

- [ ] Create Payment Aggregate
- [ ] Create Domain Events
- [ ] Create Repository Interface

### 7.2 Application Layer

- [ ] Commands:
  - [ ] `record-payment/`
  - [ ] `verify-payment/`
  - [ ] `refund-payment/`
- [ ] Queries:
  - [ ] `get-payments-list/`
  - [ ] `get-payment-detail/`
  - [ ] `get-payment-stats/`

### 7.3 Infrastructure & Interface Layer

- [ ] Repository
- [ ] Controller
- [ ] DTOs

### 7.4 Billing Module

- [ ] Create `billing.module.ts`

---

## Phase 8: Community Context

### 8.1 Domain Layer

- [ ] Create Post Aggregate
- [ ] Create Group Aggregate
- [ ] Create Event Aggregate
- [ ] Create Domain Events

### 8.2 Application Layer

- [ ] Post Commands & Queries
- [ ] Comment Commands & Queries
- [ ] Group Commands & Queries
- [ ] Event Commands & Queries

### 8.3 Infrastructure & Interface Layer

- [ ] Repositories
- [ ] Controllers

### 8.4 Community Module

- [ ] Create `community.module.ts`

---

## Phase 9: Messaging Context

### 9.1 Domain Layer

- [ ] Create Conversation Aggregate
- [ ] Create Announcement Aggregate
- [ ] Create Domain Events

### 9.2 Application Layer

- [ ] Commands & Queries for messaging
- [ ] Commands & Queries for announcements

### 9.3 Infrastructure & Interface Layer

- [ ] Repositories
- [ ] Controllers

### 9.4 Messaging Module

- [ ] Create `messaging.module.ts`

---

## Phase 10: Notification Module

### 10.1 Email Service

- [ ] Create `email.service.ts`
  - [ ] Resend integration
  - [ ] Template rendering
- [ ] Create email templates:
  - [ ] Welcome email
  - [ ] Email verification
  - [ ] Password reset
  - [ ] Course enrolled
  - [ ] Lesson unlocked
  - [ ] Assignment graded
  - [ ] Badge earned

### 10.2 Push Notification Service

- [ ] Create `push.service.ts`
- [ ] In-app notification storage
- [ ] Real-time updates (optional WebSocket)

### 10.3 Queue Processors

- [ ] `email.processor.ts`
- [ ] `notification.processor.ts`

### 10.4 Notification Module

- [ ] Create `notification.module.ts`

---

## Phase 11: Infrastructure Services

### 11.1 File Storage

- [ ] Create `storage.module.ts`
- [ ] Create `s3.service.ts`
  - [ ] `upload()`
  - [ ] `getSignedUrl()`
  - [ ] `delete()`
- [ ] Create upload controller
  - [ ] `POST /upload/image`
  - [ ] `POST /upload/file`
  - [ ] `POST /upload/video`

### 11.2 Caching Service

- [ ] Create `cache.module.ts`
- [ ] Create `cache.service.ts`
  - [ ] `get()`, `set()`, `del()`
  - [ ] TTL management
- [ ] Implement caching for:
  - [ ] Course catalog
  - [ ] Leaderboard
  - [ ] User sessions

### 11.3 Queue Service

- [ ] Create `queue.module.ts`
- [ ] Setup BullMQ queues:
  - [ ] Email queue
  - [ ] Notification queue
  - [ ] Analytics queue

---

## Phase 12: Testing & Quality

### 12.1 Unit Tests

- [ ] All value objects
- [ ] All aggregates
- [ ] All command handlers
- [ ] All query handlers
- [ ] Domain services

### 12.2 Integration Tests

- [ ] All repositories
- [ ] Database transactions
- [ ] Redis operations

### 12.3 E2E Tests

- [ ] Authentication flow
- [ ] Course management flow
- [ ] Class enrollment flow
- [ ] Progress tracking flow
- [ ] Gamification flow

### 12.4 Performance Tests

- [ ] API response times
- [ ] Database query optimization
- [ ] Cache hit rates

---

## Phase 13: Security & Hardening

### 13.1 Security Implementation

- [ ] Rate limiting per endpoint
- [ ] CORS configuration
- [ ] Helmet security headers
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma)
- [ ] XSS prevention

### 13.2 Audit & Logging

- [ ] Activity logging
- [ ] Error logging
- [ ] Security event logging

### 13.3 Security Testing

- [ ] Penetration testing
- [ ] Dependency vulnerability scan
- [ ] Security audit

---

## Phase 14: Documentation

### 14.1 API Documentation

- [ ] Swagger complete for all endpoints
- [ ] Request/response examples
- [ ] Error codes documentation

### 14.2 Developer Documentation

- [ ] README.md update
- [ ] Setup guide
- [ ] Architecture guide
- [ ] Contribution guide

### 14.3 Deployment Documentation

- [ ] Environment setup
- [ ] Docker deployment
- [ ] Cloud deployment guide

---

## Phase 15: Deployment & Launch

### 15.1 Staging Environment

- [ ] Setup staging server
- [ ] Deploy to staging
- [ ] Configure staging database
- [ ] Configure staging Redis
- [ ] Test all features

### 15.2 Production Environment

- [ ] Setup production server
- [ ] Configure production database (managed)
- [ ] Configure production Redis
- [ ] Setup SSL certificates
- [ ] Configure CDN
- [ ] Setup monitoring (Sentry)
- [ ] Setup uptime monitoring

### 15.3 Launch Checklist

- [ ] All tests passing
- [ ] Security audit complete
- [ ] Performance benchmarks met
- [ ] Documentation complete
- [ ] Backup strategy verified
- [ ] Rollback plan ready
- [ ] Team trained
- [ ] Go live! 🚀

---

## Quick Reference: File Counts by Phase

| Phase       | Files to Create            | Estimated Time |
| ----------- | -------------------------- | -------------- |
| Phase 0-1   | ~30 files                  | 2 weeks        |
| Phase 2     | ~40 files                  | 3 weeks        |
| Phase 3     | ~50 files                  | 4 weeks        |
| Phase 4     | ~45 files                  | 4 weeks        |
| Phase 5     | ~20 files                  | 2 weeks        |
| Phase 6     | ~35 files                  | 3 weeks        |
| Phase 7-9   | ~40 files                  | 4 weeks        |
| Phase 10-11 | ~20 files                  | 2 weeks        |
| Phase 12-15 | Documentation + Deployment | 4 weeks        |

**Total: ~280 files, 28 weeks core development**

---

## Notes

- **Development Approach:** Focus on core implementation first, testing will be done at the end when all features are complete
- **Phase Completion:** Each phase focuses on feature implementation without immediate testing
- **Testing Strategy:** Comprehensive testing (unit, integration, E2E) will be implemented after all phases are complete
- Deploy to staging after each major phase
- Get user feedback early (after Phase 4)
- Prioritize core features (Identity, Learning, Class) for MVP
- Gamification and Community can be simplified for MVP

---

**Document Changelog:**

| Version | Date         | Changes                          |
| ------- | ------------ | -------------------------------- |
| 1.2     | Dec 16, 2025 | Update development approach - testing at end |
| 1.1     | Dec 16, 2025 | Update Phase 2 status to 85% complete |
| 1.0     | Dec 15, 2025 | Initial TODO list                |
