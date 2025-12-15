# Implementation TODO List - LMS Baby Owl

**Last Updated:** December 15, 2025  
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
- [ ] Test Redis connection from NestJS
- [ ] Test Prisma queries from NestJS

**✅ Phase 0 Complete** (except CI/CD - skipped)

---

## Phase 1: Shared Kernel & Infrastructure

### 1.1 Create Shared Domain Building Blocks

- [ ] Create `src/shared/` directory structure
- [ ] Create `src/shared/domain/entity.base.ts`
  - [ ] Generic Entity class with ID
  - [ ] `equals()` method
  - [ ] `createdAt`, `updatedAt` fields
- [ ] Create `src/shared/domain/aggregate-root.base.ts`
  - [ ] Extends Entity
  - [ ] Domain events collection
  - [ ] `addDomainEvent()` method
  - [ ] `clearEvents()` method
  - [ ] Version for optimistic locking
- [ ] Create `src/shared/domain/value-object.base.ts`
  - [ ] Immutable props
  - [ ] `equals()` method
- [ ] Create `src/shared/domain/identifier.base.ts`
  - [ ] UUID generation
  - [ ] `toString()` method
- [ ] Create `src/shared/domain/domain-event.base.ts`
  - [ ] Event ID
  - [ ] Occurred timestamp
  - [ ] Event name
  - [ ] `toPayload()` abstract method

### 1.2 Create Shared Application Building Blocks

- [ ] Create `src/shared/application/result.ts`
  - [ ] `Result<T, E>` class
  - [ ] `isSuccess`, `isFailure` getters
  - [ ] `ok()`, `fail()` static methods
  - [ ] `combine()` for multiple results
- [ ] Create `src/shared/application/command.base.ts`
- [ ] Create `src/shared/application/query.base.ts`
- [ ] Create `src/shared/application/pagination.dto.ts`
  - [ ] `page`, `limit`, `offset`
  - [ ] `PaginatedResult<T>` generic

### 1.3 Create Shared Infrastructure

- [ ] Create `src/shared/infrastructure/prisma/prisma.module.ts`
- [ ] Create `src/shared/infrastructure/prisma/prisma.service.ts`
  - [ ] `onModuleInit()` - connect
  - [ ] `onModuleDestroy()` - disconnect
  - [ ] `enableShutdownHooks()`
- [ ] Create `src/shared/infrastructure/redis/redis.module.ts`
- [ ] Create `src/shared/infrastructure/redis/redis.service.ts`
- [ ] Create `src/shared/infrastructure/event-bus/event-bus.module.ts`
- [ ] Create `src/shared/infrastructure/event-bus/event-bus.service.ts`
  - [ ] `publish()` method
  - [ ] `publishAll()` method
  - [ ] Integration with NestJS CQRS
- [ ] Create `src/shared/infrastructure/logger/logger.service.ts`

### 1.4 Create Shared Interfaces

- [ ] Create `src/shared/interfaces/decorators/`
  - [ ] `roles.decorator.ts` - `@Roles('admin', 'instructor')`
  - [ ] `current-user.decorator.ts` - `@CurrentUser()`
  - [ ] `public.decorator.ts` - `@Public()`
- [ ] Create `src/shared/interfaces/guards/`
  - [ ] `jwt-auth.guard.ts`
  - [ ] `roles.guard.ts`
- [ ] Create `src/shared/interfaces/filters/`
  - [ ] `domain-exception.filter.ts`
  - [ ] `http-exception.filter.ts`
  - [ ] `all-exceptions.filter.ts`
- [ ] Create `src/shared/interfaces/interceptors/`
  - [ ] `transform.interceptor.ts` - Standard response format
  - [ ] `logging.interceptor.ts`
  - [ ] `timeout.interceptor.ts`
- [ ] Create `src/shared/interfaces/pipes/`
  - [ ] `validation.pipe.ts`

### 1.5 Configuration Module

- [ ] Create `src/config/config.module.ts`
- [ ] Create `src/config/app.config.ts`
  - [ ] PORT, NODE_ENV, API_PREFIX
- [ ] Create `src/config/database.config.ts`
  - [ ] DATABASE_URL, pool settings
- [ ] Create `src/config/redis.config.ts`
  - [ ] REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- [ ] Create `src/config/jwt.config.ts`
  - [ ] JWT_SECRET, JWT_EXPIRES_IN
  - [ ] JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN
- [ ] Create `src/config/throttle.config.ts`
  - [ ] Rate limiting settings
- [ ] Create `src/config/s3.config.ts`
  - [ ] AWS credentials, bucket
- [ ] Create `src/config/email.config.ts`
  - [ ] RESEND_API_KEY, EMAIL_FROM
- [ ] Validate all configs on startup

### 1.6 Setup App Module

- [ ] Update `src/app.module.ts`
  - [ ] Import ConfigModule (global)
  - [ ] Import PrismaModule (global)
  - [ ] Import RedisModule (global)
  - [ ] Import ThrottlerModule (global)
  - [ ] Import CqrsModule
  - [ ] Setup global pipes
  - [ ] Setup global filters
  - [ ] Setup global interceptors

### 1.7 Setup Swagger

- [ ] Configure Swagger in `main.ts`
  - [ ] API title, description, version
  - [ ] Bearer auth setup
  - [ ] Tags for each module
- [ ] Add Swagger decorators to DTOs

---

## Phase 2: Identity Context (Authentication & Users)

### 2.1 Domain Layer

- [ ] Create `src/modules/identity/domain/` structure
- [ ] Create Value Objects:
  - [ ] `user-id.vo.ts`
  - [ ] `email.vo.ts`
    - [ ] Validation (format)
    - [ ] Normalization (lowercase, trim)
  - [ ] `password.vo.ts`
    - [ ] Validation (min 8, uppercase, lowercase, number, special)
    - [ ] DO NOT store raw password
  - [ ] `user-role.vo.ts` (student, instructor, staff, super_admin)
  - [ ] `user-status.vo.ts` (active, inactive, suspended)
- [ ] Create User Aggregate:
  - [ ] `user.aggregate.ts`
  - [ ] Factory method `create()`
  - [ ] Business methods:
    - [ ] `verifyEmail()`
    - [ ] `changePassword()`
    - [ ] `updateProfile()`
    - [ ] `deactivate()`
    - [ ] `reactivate()`
- [ ] Create Domain Events:
  - [ ] `user-registered.event.ts`
  - [ ] `user-verified.event.ts`
  - [ ] `password-changed.event.ts`
  - [ ] `user-deactivated.event.ts`
- [ ] Create Domain Services:
  - [ ] `password-hasher.interface.ts`
- [ ] Create Repository Interface:
  - [ ] `user.repository.interface.ts`
    - [ ] `findById()`
    - [ ] `findByEmail()`
    - [ ] `save()`
    - [ ] `exists()`
- [ ] Create Domain Errors:
  - [ ] `invalid-email.error.ts`
  - [ ] `weak-password.error.ts`
  - [ ] `user-not-found.error.ts`
  - [ ] `email-already-exists.error.ts`
  - [ ] `invalid-credentials.error.ts`

### 2.2 Application Layer - Commands

- [ ] Create `register-user/`
  - [ ] `register-user.command.ts`
  - [ ] `register-user.handler.ts`
  - [ ] Validate email unique
  - [ ] Hash password
  - [ ] Create user aggregate
  - [ ] Save to repository
  - [ ] Publish UserRegisteredEvent
- [ ] Create `login/`
  - [ ] `login.command.ts`
  - [ ] `login.handler.ts`
  - [ ] Validate credentials
  - [ ] Generate JWT tokens
  - [ ] Update lastLoginAt
- [ ] Create `refresh-token/`
  - [ ] `refresh-token.command.ts`
  - [ ] `refresh-token.handler.ts`
  - [ ] Validate refresh token
  - [ ] Issue new access token
- [ ] Create `logout/`
  - [ ] `logout.command.ts`
  - [ ] `logout.handler.ts`
  - [ ] Invalidate refresh token (Redis)
- [ ] Create `verify-email/`
  - [ ] `verify-email.command.ts`
  - [ ] `verify-email.handler.ts`
  - [ ] Validate token
  - [ ] Update emailVerified
- [ ] Create `forgot-password/`
  - [ ] `forgot-password.command.ts`
  - [ ] `forgot-password.handler.ts`
  - [ ] Generate reset token
  - [ ] Store in Redis (expiry 1h)
  - [ ] Publish event for email
- [ ] Create `reset-password/`
  - [ ] `reset-password.command.ts`
  - [ ] `reset-password.handler.ts`
  - [ ] Validate reset token
  - [ ] Update password
  - [ ] Invalidate token
- [ ] Create `change-password/`
  - [ ] `change-password.command.ts`
  - [ ] `change-password.handler.ts`
  - [ ] Validate current password
  - [ ] Update to new password
- [ ] Create `update-profile/`
  - [ ] `update-profile.command.ts`
  - [ ] `update-profile.handler.ts`
- [ ] Create `create-user/` (Admin only)
  - [ ] `create-user.command.ts`
  - [ ] `create-user.handler.ts`
  - [ ] Support creating any role
  - [ ] Generate temporary password
  - [ ] Send welcome email

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

- [ ] Create `jwt-token.service.ts`
  - [ ] `generateAccessToken()`
  - [ ] `generateRefreshToken()`
  - [ ] `verifyAccessToken()`
  - [ ] `verifyRefreshToken()`
  - [ ] `decodeToken()`

### 2.6 Infrastructure Layer

- [ ] Create `user.repository.ts`
  - [ ] Implement UserRepository interface
  - [ ] Prisma queries
- [ ] Create `user.mapper.ts`
  - [ ] `toDomain()` - Prisma model → Domain entity
  - [ ] `toPersistence()` - Domain entity → Prisma model
- [ ] Create `bcrypt-password-hasher.ts`
  - [ ] Implement PasswordHasher interface
  - [ ] `hash()` method
  - [ ] `compare()` method

### 2.7 Interface Layer - HTTP

- [ ] Create `auth.controller.ts`
  - [ ] `POST /auth/register`
  - [ ] `POST /auth/login`
  - [ ] `POST /auth/refresh`
  - [ ] `POST /auth/logout`
  - [ ] `POST /auth/forgot-password`
  - [ ] `POST /auth/reset-password`
  - [ ] `PUT /auth/change-password`
  - [ ] `POST /auth/verify-email`
- [ ] Create `users.controller.ts`
  - [ ] `GET /users` (Admin)
  - [ ] `GET /users/:id`
  - [ ] `GET /users/me`
  - [ ] `PUT /users/me`
  - [ ] `POST /users` (Admin - create user)
  - [ ] `PUT /users/:id` (Admin)
  - [ ] `DELETE /users/:id` (Admin - deactivate)
- [ ] Create DTOs:
  - [ ] `register.dto.ts`
  - [ ] `login.dto.ts`
  - [ ] `login-response.dto.ts`
  - [ ] `refresh-token.dto.ts`
  - [ ] `forgot-password.dto.ts`
  - [ ] `reset-password.dto.ts`
  - [ ] `change-password.dto.ts`
  - [ ] `update-profile.dto.ts`
  - [ ] `create-user.dto.ts`
  - [ ] `user-response.dto.ts`
  - [ ] `users-list.dto.ts`

### 2.8 Passport Strategies

- [ ] Create `jwt.strategy.ts`
  - [ ] Validate JWT
  - [ ] Attach user to request
- [ ] Create `jwt-refresh.strategy.ts`
- [ ] Create `local.strategy.ts`
  - [ ] Validate email/password

### 2.9 Identity Module

- [ ] Create `identity.module.ts`
  - [ ] Import dependencies
  - [ ] Register providers
  - [ ] Export services

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

- Each phase should be completed with tests before moving to next
- Deploy to staging after each major phase
- Get user feedback early (after Phase 4)
- Prioritize core features (Identity, Learning, Class) for MVP
- Gamification and Community can be simplified for MVP

---

**Document Changelog:**

| Version | Date         | Changes           |
| ------- | ------------ | ----------------- |
| 1.0     | Dec 15, 2025 | Initial TODO list |
