# Backend Architecture - LMS Baby Owl (Inntexia Academy)

**Version:** 1.0  
**Date:** December 15, 2025  
**Status:** Approved for Implementation

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Design Principles](#design-principles)
3. [Bounded Contexts](#bounded-contexts)
4. [Project Structure](#project-structure)
5. [DDD Building Blocks](#ddd-building-blocks)
6. [CQRS Pattern](#cqrs-pattern)
7. [Event-Driven Architecture](#event-driven-architecture)
8. [Infrastructure](#infrastructure)
9. [Scalability Strategy](#scalability-strategy)
10. [Security Architecture](#security-architecture)
11. [Development Guidelines](#development-guidelines)

---

## Architecture Overview

### Architecture Style: Modular Monolith with DDD + CQRS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│                    (REST Controllers / GraphQL Resolvers)                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
            ┌───────▼───────┐               ┌──────▼──────┐
            │   COMMANDS    │               │   QUERIES   │
            │  (Write Side) │               │ (Read Side) │
            └───────┬───────┘               └──────┬──────┘
                    │                               │
            ┌───────▼───────┐               ┌──────▼──────┐
            │  Command Bus  │               │  Query Bus  │
            │   (Handlers)  │               │  (Handlers) │
            └───────┬───────┘               └──────┬──────┘
                    │                               │
            ┌───────▼───────┐               ┌──────▼──────┐
            │    DOMAIN     │               │ READ MODELS │
            │  (Aggregates, │               │ (Optimized  │
            │   Entities,   │               │  Views/DTOs)│
            │   Services)   │               │             │
            └───────┬───────┘               └──────┬──────┘
                    │                               │
                    └───────────┬───────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   INFRASTRUCTURE      │
                    │  (Repositories, etc)  │
                    └───────────┬───────────┘
                                │
            ┌───────────────────┼───────────────────┐
            │                   │                   │
     ┌──────▼──────┐     ┌─────▼─────┐      ┌──────▼──────┐
     │  PostgreSQL │     │   Redis   │      │     S3      │
     │  (Primary)  │     │  (Cache)  │      │  (Storage)  │
     └─────────────┘     └───────────┘      └─────────────┘
```

### Why This Architecture?

| Aspect              | Decision         | Rationale                                                   |
| ------------------- | ---------------- | ----------------------------------------------------------- |
| **Pattern**         | Modular Monolith | Team size (2-3 BE), faster development, easier debugging    |
| **Domain Modeling** | DDD (Tactical)   | Complex business rules (classes, credits, gamification)     |
| **Data Access**     | CQRS             | Read-heavy dashboards, write consistency for business rules |
| **Communication**   | Event-Driven     | Loose coupling between bounded contexts                     |
| **Scalability**     | Horizontal Ready | Stateless API, Redis for shared state                       |

---

## Design Principles

### 1. Domain-Driven Design Principles

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DDD STRATEGIC DESIGN                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. UBIQUITOUS LANGUAGE                                                      │
│     - Use domain terms consistently (Class, Enrollment, Credit, Lesson)     │
│     - Code reflects business language                                        │
│                                                                              │
│  2. BOUNDED CONTEXTS                                                         │
│     - Each context has clear boundaries                                      │
│     - Contexts communicate via events or explicit APIs                       │
│     - No shared domain models between contexts                               │
│                                                                              │
│  3. AGGREGATE ROOTS                                                          │
│     - Enforce invariants within aggregate boundary                           │
│     - External access only through aggregate root                            │
│     - One transaction = one aggregate                                        │
│                                                                              │
│  4. DOMAIN EVENTS                                                            │
│     - Capture significant domain occurrences                                 │
│     - Enable loose coupling between contexts                                 │
│     - Support eventual consistency                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2. CQRS Principles

```
COMMAND SIDE (Write)                    QUERY SIDE (Read)
━━━━━━━━━━━━━━━━━━━━                    ━━━━━━━━━━━━━━━━━━
• Rich domain model                     • Flat DTOs
• Business rule validation              • Optimized queries
• Aggregate consistency                 • Denormalized data
• Domain events emission                • Cached results
• Single aggregate per command          • Multiple sources OK
```

### 3. Dependency Rule

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   OUTER LAYERS DEPEND ON INNER LAYERS (Never the reverse)       │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    INFRASTRUCTURE                        │   │
│   │   (Controllers, Repositories, External Services)         │   │
│   │   ┌─────────────────────────────────────────────────┐   │   │
│   │   │                  APPLICATION                     │   │   │
│   │   │   (Commands, Queries, Handlers, Services)        │   │   │
│   │   │   ┌─────────────────────────────────────────┐   │   │   │
│   │   │   │                 DOMAIN                   │   │   │   │
│   │   │   │   (Entities, Value Objects, Events)      │   │   │   │
│   │   │   │                                          │   │   │   │
│   │   │   │         NO EXTERNAL DEPENDENCIES         │   │   │   │
│   │   │   │                                          │   │   │   │
│   │   │   └─────────────────────────────────────────┘   │   │   │
│   │   └─────────────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Bounded Contexts

### Context Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BOUNDED CONTEXTS MAP                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐             │
│  │   IDENTITY   │──────▶│   LEARNING   │◀──────│    CLASS     │             │
│  │   CONTEXT    │       │   CONTEXT    │       │   CONTEXT    │             │
│  │              │       │              │       │              │             │
│  │  Core Domain │       │ Core Domain  │       │ Core Domain  │             │
│  └──────┬───────┘       └──────┬───────┘       └──────┬───────┘             │
│         │                      │                      │                      │
│         │                      ▼                      │                      │
│         │              ┌──────────────┐               │                      │
│         │              │ GAMIFICATION │◀──────────────┘                      │
│         │              │   CONTEXT    │                                      │
│         │              │              │                                      │
│         │              │ Core Domain  │                                      │
│         │              └──────────────┘                                      │
│         │                      ▲                                             │
│         ▼                      │                                             │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐             │
│  │  ASSESSMENT  │───────│  COMMUNITY   │       │   BILLING    │             │
│  │   CONTEXT    │       │   CONTEXT    │       │   CONTEXT    │             │
│  │              │       │              │       │              │             │
│  │  Supporting  │       │  Supporting  │       │  Supporting  │             │
│  └──────────────┘       └──────────────┘       └──────────────┘             │
│                                                                              │
│  ────────────────────────────────────────────────────────────────────────   │
│  SHARED KERNEL: Common value objects, Result pattern, Base classes          │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Context Definitions

#### 1. Identity Context (Core)

**Responsibility:** User authentication, authorization, profile management

| Aggregate | Entities | Value Objects                         |
| --------- | -------- | ------------------------------------- |
| User      | -        | Email, Password, UserRole, UserStatus |

**Domain Events:**

- `UserRegistered`
- `UserVerified`
- `PasswordChanged`
- `UserDeactivated`

---

#### 2. Learning Context (Core)

**Responsibility:** Course content, lessons, exercises, progress tracking

| Aggregate       | Entities                                        | Value Objects                                       |
| --------------- | ----------------------------------------------- | --------------------------------------------------- |
| Course          | Section, Lesson, Exercise                       | CourseId, CourseStatus, ExerciseType, LessonContent |
| StudentProgress | ExerciseProgress, QuizAttempt, CodingSubmission | ProgressStatus, Score                               |

**Domain Events:**

- `CourseCreated`
- `CoursePublished`
- `ExerciseCompleted`
- `LessonCompleted`
- `QuizSubmitted`
- `CodingExerciseSubmitted`

---

#### 3. Class Context (Core)

**Responsibility:** Class management, enrollments, attendance, lesson unlocking, credit system

| Aggregate | Entities                                               | Value Objects                                                    |
| --------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| Class     | Enrollment, Attendance, LessonUnlock, CreditAdjustment | ClassId, ClassType, ClassStatus, MeetingCredit, AttendanceStatus |

**Domain Events:**

- `ClassCreated`
- `ClassActivated`
- `StudentEnrolled`
- `AttendanceMarked`
- `CreditDeducted`
- `CreditAdjusted`
- `LessonUnlocked`
- `ClassCompleted`

**Business Rules:**

```
1. GROUP CLASS ENROLLMENT:
   - Cannot enroll after class status = 'active'
   - All students share same package (totalMeetings)
   - Cannot change package after activation

2. PRIVATE CLASS:
   - Can add meetings anytime
   - Flexible start date

3. CREDIT SYSTEM:
   - Present/Late = deduct 1 credit
   - Absent = no credit deduction
   - Manual adjustment with audit trail

4. LESSON UNLOCKING:
   - Only instructor can unlock
   - Cannot exceed totalMeetings limit
   - Unlock = all exercises in lesson accessible
```

---

#### 4. Gamification Context (Core)

**Responsibility:** XP, levels, badges, streaks, leaderboards, quests

| Aggregate     | Entities                                 | Value Objects                      |
| ------------- | ---------------------------------------- | ---------------------------------- |
| PlayerProfile | XpTransaction, BadgeAward, QuestProgress | XpAmount, Level, Streak, BadgeType |

**Domain Events:**

- `XpEarned`
- `LevelUp`
- `BadgeUnlocked`
- `StreakUpdated`
- `QuestCompleted`

**Event Subscriptions:**

- Listens to: `ExerciseCompleted`, `LessonCompleted`, `AttendanceMarked`

---

#### 5. Assessment Context (Supporting)

**Responsibility:** Assignments, submissions, grading

| Aggregate  | Entities             | Value Objects         |
| ---------- | -------------------- | --------------------- |
| Assignment | Submission, Feedback | SubmissionType, Grade |

---

#### 6. Community Context (Supporting)

**Responsibility:** Posts, comments, groups, events, messaging

| Aggregate    | Entities      | Value Objects |
| ------------ | ------------- | ------------- |
| Post         | Comment, Like | -             |
| Group        | Membership    | MemberRole    |
| Event        | RSVP          | EventStatus   |
| Conversation | Message       | -             |

---

#### 7. Billing Context (Supporting)

**Responsibility:** Payments, invoices (manual for MVP)

| Aggregate | Entities | Value Objects                |
| --------- | -------- | ---------------------------- |
| Payment   | -        | PaymentStatus, PaymentMethod |

---

## Project Structure

```
src/
├── main.ts                              # Application entry point
├── app.module.ts                        # Root module
│
├── shared/                              # ════════════════════════════════════
│   │                                    # SHARED KERNEL
│   ├── domain/                          # ────────────────────────────────────
│   │   ├── entity.base.ts               # Base entity class
│   │   ├── aggregate-root.base.ts       # Base aggregate root
│   │   ├── value-object.base.ts         # Base value object
│   │   ├── domain-event.base.ts         # Base domain event
│   │   ├── identifier.base.ts           # Base ID value object
│   │   └── repository.interface.ts      # Repository contract
│   │
│   ├── application/                     # ────────────────────────────────────
│   │   ├── command.base.ts              # Base command
│   │   ├── query.base.ts                # Base query
│   │   ├── result.ts                    # Result<T, E> pattern
│   │   └── pagination.dto.ts            # Shared pagination
│   │
│   ├── infrastructure/                  # ────────────────────────────────────
│   │   ├── prisma/                      # Prisma client & service
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── redis/                       # Redis client & service
│   │   │   ├── redis.module.ts
│   │   │   └── redis.service.ts
│   │   ├── event-bus/                   # Domain event bus
│   │   │   ├── event-bus.module.ts
│   │   │   └── event-bus.service.ts
│   │   └── logger/                      # Logging service
│   │       └── logger.service.ts
│   │
│   └── interfaces/                      # ────────────────────────────────────
│       ├── decorators/                  # @Roles, @CurrentUser, etc
│       │   ├── roles.decorator.ts
│       │   ├── current-user.decorator.ts
│       │   └── public.decorator.ts
│       ├── guards/                      # Auth guards
│       │   ├── jwt-auth.guard.ts
│       │   └── roles.guard.ts
│       ├── filters/                     # Exception filters
│       │   ├── domain-exception.filter.ts
│       │   └── http-exception.filter.ts
│       ├── interceptors/                # Response interceptors
│       │   ├── transform.interceptor.ts
│       │   └── logging.interceptor.ts
│       └── pipes/                       # Validation pipes
│           └── validation.pipe.ts
│
├── config/                              # ════════════════════════════════════
│   │                                    # CONFIGURATION
│   ├── config.module.ts                 # ────────────────────────────────────
│   ├── app.config.ts                    # App configuration
│   ├── database.config.ts               # Database configuration
│   ├── redis.config.ts                  # Redis configuration
│   ├── jwt.config.ts                    # JWT configuration
│   ├── s3.config.ts                     # S3 configuration
│   └── email.config.ts                  # Email configuration
│
├── modules/                             # ════════════════════════════════════
│   │                                    # BOUNDED CONTEXTS
│   │
│   ├── identity/                        # ════════════════════════════════════
│   │   │                                # IDENTITY CONTEXT
│   │   ├── domain/                      # ────────────────────────────────────
│   │   │   ├── aggregates/
│   │   │   │   └── user.aggregate.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── user-id.vo.ts
│   │   │   │   ├── email.vo.ts
│   │   │   │   ├── password.vo.ts
│   │   │   │   ├── user-role.vo.ts
│   │   │   │   └── user-status.vo.ts
│   │   │   ├── events/
│   │   │   │   ├── user-registered.event.ts
│   │   │   │   ├── user-verified.event.ts
│   │   │   │   └── password-changed.event.ts
│   │   │   ├── services/
│   │   │   │   └── password-hasher.interface.ts
│   │   │   ├── repositories/
│   │   │   │   └── user.repository.interface.ts
│   │   │   └── errors/
│   │   │       ├── invalid-email.error.ts
│   │   │       ├── weak-password.error.ts
│   │   │       └── user-not-found.error.ts
│   │   │
│   │   ├── application/                 # ────────────────────────────────────
│   │   │   ├── commands/
│   │   │   │   ├── register-user/
│   │   │   │   │   ├── register-user.command.ts
│   │   │   │   │   └── register-user.handler.ts
│   │   │   │   ├── login/
│   │   │   │   │   ├── login.command.ts
│   │   │   │   │   └── login.handler.ts
│   │   │   │   ├── verify-email/
│   │   │   │   ├── change-password/
│   │   │   │   ├── reset-password/
│   │   │   │   └── update-profile/
│   │   │   ├── queries/
│   │   │   │   ├── get-user-by-id/
│   │   │   │   │   ├── get-user-by-id.query.ts
│   │   │   │   │   └── get-user-by-id.handler.ts
│   │   │   │   ├── get-user-profile/
│   │   │   │   └── get-users-list/
│   │   │   ├── services/
│   │   │   │   └── jwt-token.service.ts
│   │   │   └── event-handlers/
│   │   │       └── send-welcome-email.handler.ts
│   │   │
│   │   ├── infrastructure/              # ────────────────────────────────────
│   │   │   ├── persistence/
│   │   │   │   ├── user.repository.ts
│   │   │   │   └── user.mapper.ts
│   │   │   └── services/
│   │   │       └── bcrypt-password-hasher.ts
│   │   │
│   │   ├── interfaces/                  # ────────────────────────────────────
│   │   │   └── http/
│   │   │       ├── auth.controller.ts
│   │   │       ├── users.controller.ts
│   │   │       └── dto/
│   │   │           ├── register.dto.ts
│   │   │           ├── login.dto.ts
│   │   │           └── user-response.dto.ts
│   │   │
│   │   └── identity.module.ts
│   │
│   ├── learning/                        # ════════════════════════════════════
│   │   │                                # LEARNING CONTEXT
│   │   ├── domain/
│   │   │   ├── aggregates/
│   │   │   │   ├── course.aggregate.ts
│   │   │   │   └── student-progress.aggregate.ts
│   │   │   ├── entities/
│   │   │   │   ├── section.entity.ts
│   │   │   │   ├── lesson.entity.ts
│   │   │   │   ├── exercise.entity.ts
│   │   │   │   ├── exercise-progress.entity.ts
│   │   │   │   ├── quiz-attempt.entity.ts
│   │   │   │   └── coding-submission.entity.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── course-id.vo.ts
│   │   │   │   ├── course-status.vo.ts
│   │   │   │   ├── exercise-type.vo.ts
│   │   │   │   ├── lesson-content.vo.ts
│   │   │   │   └── quiz-answer.vo.ts
│   │   │   ├── events/
│   │   │   │   ├── course-created.event.ts
│   │   │   │   ├── course-published.event.ts
│   │   │   │   ├── exercise-completed.event.ts
│   │   │   │   ├── lesson-completed.event.ts
│   │   │   │   └── quiz-submitted.event.ts
│   │   │   ├── services/
│   │   │   │   └── progress-calculator.service.ts
│   │   │   └── repositories/
│   │   │       ├── course.repository.interface.ts
│   │   │       └── progress.repository.interface.ts
│   │   │
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   ├── create-course/
│   │   │   │   ├── publish-course/
│   │   │   │   ├── add-section/
│   │   │   │   ├── add-lesson/
│   │   │   │   ├── add-exercise/
│   │   │   │   ├── complete-exercise/
│   │   │   │   ├── submit-quiz/
│   │   │   │   └── submit-coding-exercise/
│   │   │   ├── queries/
│   │   │   │   ├── get-course-catalog/
│   │   │   │   ├── get-course-detail/
│   │   │   │   ├── get-lesson-content/
│   │   │   │   ├── get-exercise/
│   │   │   │   └── get-student-progress/
│   │   │   └── read-models/
│   │   │       ├── course-catalog.read-model.ts
│   │   │       └── student-progress.read-model.ts
│   │   │
│   │   ├── infrastructure/
│   │   │   └── persistence/
│   │   │       ├── course.repository.ts
│   │   │       ├── course.mapper.ts
│   │   │       ├── progress.repository.ts
│   │   │       └── progress.mapper.ts
│   │   │
│   │   ├── interfaces/
│   │   │   └── http/
│   │   │       ├── courses.controller.ts
│   │   │       ├── lessons.controller.ts
│   │   │       ├── exercises.controller.ts
│   │   │       └── dto/
│   │   │
│   │   └── learning.module.ts
│   │
│   ├── class-management/                # ════════════════════════════════════
│   │   │                                # CLASS CONTEXT
│   │   ├── domain/
│   │   │   ├── aggregates/
│   │   │   │   └── class.aggregate.ts
│   │   │   ├── entities/
│   │   │   │   ├── enrollment.entity.ts
│   │   │   │   ├── attendance.entity.ts
│   │   │   │   ├── lesson-unlock.entity.ts
│   │   │   │   └── credit-adjustment.entity.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── class-id.vo.ts
│   │   │   │   ├── class-type.vo.ts
│   │   │   │   ├── class-status.vo.ts
│   │   │   │   ├── meeting-credit.vo.ts
│   │   │   │   ├── attendance-status.vo.ts
│   │   │   │   └── schedule.vo.ts
│   │   │   ├── events/
│   │   │   │   ├── class-created.event.ts
│   │   │   │   ├── class-activated.event.ts
│   │   │   │   ├── student-enrolled.event.ts
│   │   │   │   ├── attendance-marked.event.ts
│   │   │   │   ├── credit-deducted.event.ts
│   │   │   │   ├── credit-adjusted.event.ts
│   │   │   │   ├── lesson-unlocked.event.ts
│   │   │   │   └── class-completed.event.ts
│   │   │   ├── services/
│   │   │   │   └── credit-calculator.service.ts
│   │   │   ├── policies/
│   │   │   │   ├── enrollment.policy.ts
│   │   │   │   └── unlock.policy.ts
│   │   │   ├── repositories/
│   │   │   │   └── class.repository.interface.ts
│   │   │   └── errors/
│   │   │       ├── class-full.error.ts
│   │   │       ├── enrollment-closed.error.ts
│   │   │       ├── package-limit-reached.error.ts
│   │   │       └── unauthorized-unlock.error.ts
│   │   │
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   ├── create-class/
│   │   │   │   ├── activate-class/
│   │   │   │   ├── enroll-student/
│   │   │   │   ├── mark-attendance/
│   │   │   │   ├── adjust-credit/
│   │   │   │   ├── unlock-lesson/
│   │   │   │   └── complete-class/
│   │   │   ├── queries/
│   │   │   │   ├── get-class-list/
│   │   │   │   ├── get-class-detail/
│   │   │   │   ├── get-class-roster/
│   │   │   │   ├── get-attendance-report/
│   │   │   │   ├── get-credit-balance/
│   │   │   │   └── get-unlocked-lessons/
│   │   │   └── read-models/
│   │   │       ├── class-roster.read-model.ts
│   │   │       └── attendance-report.read-model.ts
│   │   │
│   │   ├── infrastructure/
│   │   │   └── persistence/
│   │   │       ├── class.repository.ts
│   │   │       └── class.mapper.ts
│   │   │
│   │   ├── interfaces/
│   │   │   └── http/
│   │   │       ├── classes.controller.ts
│   │   │       ├── enrollments.controller.ts
│   │   │       ├── attendance.controller.ts
│   │   │       └── dto/
│   │   │
│   │   └── class-management.module.ts
│   │
│   ├── gamification/                    # ════════════════════════════════════
│   │   │                                # GAMIFICATION CONTEXT
│   │   ├── domain/
│   │   │   ├── aggregates/
│   │   │   │   └── player-profile.aggregate.ts
│   │   │   ├── entities/
│   │   │   │   ├── xp-transaction.entity.ts
│   │   │   │   ├── badge-award.entity.ts
│   │   │   │   └── quest-progress.entity.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── xp-amount.vo.ts
│   │   │   │   ├── level.vo.ts
│   │   │   │   ├── streak.vo.ts
│   │   │   │   └── badge-type.vo.ts
│   │   │   ├── events/
│   │   │   │   ├── xp-earned.event.ts
│   │   │   │   ├── level-up.event.ts
│   │   │   │   ├── badge-unlocked.event.ts
│   │   │   │   ├── streak-updated.event.ts
│   │   │   │   └── quest-completed.event.ts
│   │   │   ├── services/
│   │   │   │   ├── xp-calculator.service.ts
│   │   │   │   ├── level-calculator.service.ts
│   │   │   │   └── badge-evaluator.service.ts
│   │   │   └── repositories/
│   │   │       └── player-profile.repository.interface.ts
│   │   │
│   │   ├── application/
│   │   │   ├── commands/
│   │   │   │   ├── award-xp/
│   │   │   │   ├── update-streak/
│   │   │   │   ├── unlock-badge/
│   │   │   │   └── complete-quest/
│   │   │   ├── queries/
│   │   │   │   ├── get-player-stats/
│   │   │   │   ├── get-leaderboard/
│   │   │   │   ├── get-badges/
│   │   │   │   └── get-daily-quests/
│   │   │   ├── event-handlers/
│   │   │   │   ├── on-exercise-completed.handler.ts
│   │   │   │   ├── on-lesson-completed.handler.ts
│   │   │   │   └── on-attendance-marked.handler.ts
│   │   │   └── read-models/
│   │   │       └── leaderboard.read-model.ts
│   │   │
│   │   ├── infrastructure/
│   │   │   └── persistence/
│   │   │
│   │   ├── interfaces/
│   │   │   └── http/
│   │   │       ├── gamification.controller.ts
│   │   │       ├── leaderboard.controller.ts
│   │   │       └── dto/
│   │   │
│   │   └── gamification.module.ts
│   │
│   ├── assessment/                      # ════════════════════════════════════
│   │   │                                # ASSESSMENT CONTEXT (Supporting)
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── interfaces/
│   │   └── assessment.module.ts
│   │
│   ├── community/                       # ════════════════════════════════════
│   │   │                                # COMMUNITY CONTEXT (Supporting)
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── interfaces/
│   │   └── community.module.ts
│   │
│   ├── billing/                         # ════════════════════════════════════
│   │   │                                # BILLING CONTEXT (Supporting)
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   ├── interfaces/
│   │   └── billing.module.ts
│   │
│   └── notification/                    # ════════════════════════════════════
│       │                                # NOTIFICATION (Infrastructure)
│       ├── email/
│       │   ├── email.service.ts
│       │   └── templates/
│       ├── push/
│       │   └── push.service.ts
│       └── notification.module.ts
│
├── infrastructure/                      # ════════════════════════════════════
│   │                                    # CROSS-CUTTING INFRASTRUCTURE
│   ├── cqrs/                            # ────────────────────────────────────
│   │   ├── cqrs.module.ts
│   │   ├── command-bus.service.ts
│   │   ├── query-bus.service.ts
│   │   └── event-bus.service.ts
│   │
│   ├── queue/                           # ────────────────────────────────────
│   │   ├── queue.module.ts
│   │   └── processors/
│   │       ├── email.processor.ts
│   │       └── notification.processor.ts
│   │
│   ├── cache/                           # ────────────────────────────────────
│   │   ├── cache.module.ts
│   │   └── cache.service.ts
│   │
│   └── storage/                         # ────────────────────────────────────
│       ├── storage.module.ts
│       └── s3.service.ts
│
├── prisma/                              # ════════════════════════════════════
│   ├── schema.prisma                    # DATABASE SCHEMA
│   ├── migrations/
│   └── seed.ts
│
└── test/                                # ════════════════════════════════════
    ├── unit/                            # TESTS
    ├── integration/
    └── e2e/
```

---

## DDD Building Blocks

### 1. Entity Base

```typescript
// src/shared/domain/entity.base.ts

export abstract class Entity<T> {
  protected readonly _id: T;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  constructor(id: T, createdAt?: Date) {
    this._id = id;
    this._createdAt = createdAt ?? new Date();
    this._updatedAt = this._createdAt;
  }

  get id(): T {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }

  equals(entity: Entity<T>): boolean {
    if (entity === null || entity === undefined) {
      return false;
    }
    if (this === entity) {
      return true;
    }
    return this._id === entity._id;
  }
}
```

### 2. Aggregate Root

```typescript
// src/shared/domain/aggregate-root.base.ts

import { Entity } from './entity.base';
import { DomainEvent } from './domain-event.base';

export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];
  private _version: number = 0;

  get domainEvents(): ReadonlyArray<DomainEvent> {
    return this._domainEvents;
  }

  get version(): number {
    return this._version;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  clearEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  incrementVersion(): void {
    this._version++;
  }
}
```

### 3. Value Object

```typescript
// src/shared/domain/value-object.base.ts

export abstract class ValueObject<T> {
  protected readonly props: T;

  protected constructor(props: T) {
    this.props = Object.freeze(props);
  }

  equals(vo?: ValueObject<T>): boolean {
    if (vo === null || vo === undefined) {
      return false;
    }
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}
```

### 4. Domain Event

```typescript
// src/shared/domain/domain-event.base.ts

import { randomUUID } from 'crypto';

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredOn: Date;
  public readonly eventName: string;

  constructor() {
    this.eventId = randomUUID();
    this.occurredOn = new Date();
    this.eventName = this.constructor.name;
  }

  abstract toPayload(): Record<string, unknown>;
}
```

### 5. Result Pattern

```typescript
// src/shared/application/result.ts

export class Result<T, E = Error> {
  private readonly _isSuccess: boolean;
  private readonly _value?: T;
  private readonly _error?: E;

  private constructor(isSuccess: boolean, value?: T, error?: E) {
    this._isSuccess = isSuccess;
    this._value = value;
    this._error = error;
  }

  get isSuccess(): boolean {
    return this._isSuccess;
  }

  get isFailure(): boolean {
    return !this._isSuccess;
  }

  get value(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this._value as T;
  }

  get error(): E {
    if (this._isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this._error as E;
  }

  static ok<T>(value?: T): Result<T, never> {
    return new Result<T, never>(true, value);
  }

  static fail<E>(error: E): Result<never, E> {
    return new Result<never, E>(false, undefined, error);
  }

  static combine(results: Result<unknown, unknown>[]): Result<void, unknown> {
    for (const result of results) {
      if (result.isFailure) {
        return Result.fail(result.error);
      }
    }
    return Result.ok();
  }
}
```

---

## CQRS Pattern

### Command Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Controller │────▶│   Command   │────▶│   Handler   │────▶│  Aggregate  │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └──────┬──────┘     └──────┬──────┘
                                               │                   │
                                               │                   │ Domain Events
                                               ▼                   ▼
                                        ┌─────────────┐     ┌─────────────┐
                                        │ Repository  │     │  Event Bus  │
                                        │   (Save)    │     │  (Publish)  │
                                        └─────────────┘     └─────────────┘
```

### Query Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Controller │────▶│    Query    │────▶│   Handler   │────▶│ Read Model  │
│             │     │             │     │             │     │   (Cache)   │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                   │
                                                                   ▼
                                                            ┌─────────────┐
                                                            │  Database   │
                                                            │  (Direct)   │
                                                            └─────────────┘
```

### Command Implementation

```typescript
// Command
export class EnrollStudentCommand {
  constructor(
    public readonly classId: string,
    public readonly studentId: string,
    public readonly paymentAmount: number,
  ) {}
}

// Handler
@CommandHandler(EnrollStudentCommand)
export class EnrollStudentHandler implements ICommandHandler<
  EnrollStudentCommand,
  Result<string>
> {
  constructor(
    private readonly classRepository: ClassRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: EnrollStudentCommand): Promise<Result<string>> {
    // 1. Load aggregate
    const classAggregate = await this.classRepository.findById(command.classId);
    if (!classAggregate) {
      return Result.fail(new ClassNotFoundError(command.classId));
    }

    // 2. Execute domain logic
    const result = classAggregate.enrollStudent(
      command.studentId,
      command.paymentAmount,
    );

    if (result.isFailure) {
      return Result.fail(result.error);
    }

    // 3. Persist
    await this.classRepository.save(classAggregate);

    // 4. Publish events
    const events = classAggregate.clearEvents();
    await this.eventBus.publishAll(events);

    return Result.ok(result.value);
  }
}
```

### Query Implementation

```typescript
// Query
export class GetLeaderboardQuery {
  constructor(
    public readonly type: 'weekly' | 'monthly' | 'all-time',
    public readonly limit: number = 100,
  ) {}
}

// Handler
@QueryHandler(GetLeaderboardQuery)
export class GetLeaderboardHandler implements IQueryHandler<
  GetLeaderboardQuery,
  LeaderboardDto[]
> {
  constructor(
    private readonly readModel: LeaderboardReadModel,
    private readonly cache: CacheService,
  ) {}

  async execute(query: GetLeaderboardQuery): Promise<LeaderboardDto[]> {
    const cacheKey = `leaderboard:${query.type}`;

    // Check cache
    const cached = await this.cache.get<LeaderboardDto[]>(cacheKey);
    if (cached) return cached;

    // Query read model
    const result = await this.readModel.getTopPlayers(query.type, query.limit);

    // Cache result
    await this.cache.set(cacheKey, result, 300); // 5 minutes

    return result;
  }
}
```

---

## Event-Driven Architecture

### Event Flow Between Contexts

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DOMAIN EVENTS FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  LEARNING CONTEXT                         GAMIFICATION CONTEXT               │
│  ┌─────────────────┐                      ┌─────────────────┐               │
│  │ Exercise        │   ExerciseCompleted  │ Award XP        │               │
│  │ Completed       │─────────────────────▶│ Handler         │               │
│  └─────────────────┘                      └─────────────────┘               │
│                                                                              │
│  CLASS CONTEXT                            GAMIFICATION CONTEXT               │
│  ┌─────────────────┐                      ┌─────────────────┐               │
│  │ Attendance      │   AttendanceMarked   │ Update Streak   │               │
│  │ Marked          │─────────────────────▶│ Handler         │               │
│  └─────────────────┘                      └─────────────────────────────────│
│                                                                              │
│  CLASS CONTEXT                            NOTIFICATION CONTEXT               │
│  ┌─────────────────┐                      ┌─────────────────┐               │
│  │ Lesson          │   LessonUnlocked     │ Send Email      │               │
│  │ Unlocked        │─────────────────────▶│ Handler         │               │
│  └─────────────────┘                      └─────────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Event Handler Example

```typescript
// Gamification listens to Learning events
@EventHandler(ExerciseCompletedEvent)
export class OnExerciseCompletedHandler {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly xpCalculator: XpCalculatorService,
  ) {}

  async handle(event: ExerciseCompletedEvent): Promise<void> {
    const xpAmount = this.xpCalculator.calculateForExercise(
      event.exerciseType,
      event.score,
    );

    await this.commandBus.execute(
      new AwardXpCommand(
        event.userId,
        xpAmount,
        `Completed ${event.exerciseType} exercise`,
        event.exerciseId,
      ),
    );
  }
}
```

---

## Infrastructure

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: inntexia_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${DB_USER:-inntexia}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-inntexia_secret}
      POSTGRES_DB: ${DB_NAME:-inntexia_lms}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${DB_USER:-inntexia}']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: inntexia_redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD:-redis_secret}
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test:
        [
          'CMD',
          'redis-cli',
          '--pass',
          '${REDIS_PASSWORD:-redis_secret}',
          'ping',
        ]
      interval: 10s
      timeout: 5s
      retries: 5

  # Development only
  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: inntexia_redis_ui
    restart: unless-stopped
    environment:
      REDIS_HOSTS: local:redis:6379:0:${REDIS_PASSWORD:-redis_secret}
    ports:
      - '8081:8081'
    depends_on:
      - redis
    profiles:
      - dev

volumes:
  postgres_data:
  redis_data:
```

### Technology Stack

| Layer          | Technology      | Purpose                   |
| -------------- | --------------- | ------------------------- |
| **Runtime**    | Node.js 20 LTS  | JavaScript runtime        |
| **Framework**  | NestJS 11       | Application framework     |
| **Language**   | TypeScript 5.x  | Type safety               |
| **Database**   | PostgreSQL 16   | Primary data store        |
| **ORM**        | Prisma 5.x      | Database access           |
| **Cache**      | Redis 7         | Caching, sessions, queues |
| **Queue**      | BullMQ          | Background jobs           |
| **Auth**       | JWT + Passport  | Authentication            |
| **Validation** | class-validator | Input validation          |
| **API Docs**   | Swagger         | API documentation         |
| **Testing**    | Jest            | Unit & integration tests  |

### Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "@nestjs/core": "^11.0.0",
    "@nestjs/config": "^3.2.0",
    "@nestjs/cqrs": "^10.2.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/cache-manager": "^2.2.0",
    "@nestjs/bullmq": "^10.0.0",
    "@nestjs/swagger": "^7.3.0",
    "@prisma/client": "^5.10.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-local": "^1.0.0",
    "bcrypt": "^5.1.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0",
    "cache-manager": "^5.4.0",
    "cache-manager-redis-yet": "^4.1.0",
    "bullmq": "^5.4.0",
    "resend": "^3.2.0",
    "@aws-sdk/client-s3": "^3.500.0",
    "helmet": "^7.1.0"
  }
}
```

---

## Scalability Strategy

### Phase 1: MVP (0-1000 users)

```
Single Instance Architecture
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────┐
│   NestJS App    │ (1 instance)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌───▼───┐
│Postgres│ │ Redis │
│  (1)   │ │  (1)  │
└────────┘ └───────┘
```

### Phase 2: Growth (1000-5000 users)

```
Horizontal Scaling
━━━━━━━━━━━━━━━━━━
         ┌─────────────────┐
         │  Load Balancer  │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐    ┌───▼───┐    ┌───▼───┐
│ App 1 │    │ App 2 │    │ App 3 │
└───┬───┘    └───┬───┘    └───┬───┘
    │             │             │
    └─────────────┼─────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼───┐    ┌───▼───┐    ┌───▼───┐
│Primary│    │Replica│    │ Redis │
│  DB   │───▶│  DB   │    │Cluster│
└───────┘    └───────┘    └───────┘
```

### Phase 3: Scale (5000+ users)

```
Service Extraction
━━━━━━━━━━━━━━━━━━
         ┌─────────────────┐
         │   API Gateway   │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┐
    │             │             │             │
┌───▼───┐    ┌───▼───┐    ┌───▼───┐    ┌───▼───┐
│ Main  │    │ Notif │    │ Gamif │    │Analyt │
│  API  │    │Service│    │Service│    │Service│
└───┬───┘    └───┬───┘    └───┬───┘    └───┬───┘
    │             │             │             │
    └─────────────┼─────────────┴─────────────┘
                  │
         ┌────────▼────────┐
         │   Message Bus   │
         │   (RabbitMQ)    │
         └─────────────────┘
```

---

## Security Architecture

### Authentication Flow

```
┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
│ Client │────▶│ Login  │────▶│ Verify │────▶│ Issue  │
│        │     │  API   │     │Password│     │  JWT   │
└────────┘     └────────┘     └────────┘     └───┬────┘
                                                 │
                                                 ▼
┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
│ Access │◀────│ Store  │◀────│Refresh │◀────│ Tokens │
│Resource│     │ Redis  │     │ Token  │     │        │
└────────┘     └────────┘     └────────┘     └────────┘
```

### Authorization (RBAC)

| Role            | Permissions                                     |
| --------------- | ----------------------------------------------- |
| **super_admin** | Full access to all resources                    |
| **staff**       | Create students, classes, enrollments, payments |
| **instructor**  | Manage own courses, classes, grade assignments  |
| **student**     | Access enrolled content, submit assignments     |

### Security Measures

- JWT with short expiry (15 min) + refresh tokens (30 days)
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 req/min per user)
- HTTPS only
- CORS whitelist
- Helmet security headers
- Input validation & sanitization
- SQL injection prevention (Prisma parameterized queries)
- XSS prevention

---

## Development Guidelines

### 1. Module Creation Checklist

```
□ Create domain/
  □ aggregates/ (if aggregate root)
  □ entities/
  □ value-objects/
  □ events/
  □ services/ (domain services)
  □ repositories/ (interfaces)
  □ errors/

□ Create application/
  □ commands/ (write operations)
  □ queries/ (read operations)
  □ event-handlers/ (cross-context)
  □ read-models/ (query optimization)

□ Create infrastructure/
  □ persistence/ (repository implementations)
  □ services/ (external integrations)

□ Create interfaces/
  □ http/ (controllers + DTOs)

□ Create module file
□ Register in app.module.ts
□ Write unit tests
□ Write integration tests
```

### 2. Naming Conventions

| Type         | Convention                   | Example                     |
| ------------ | ---------------------------- | --------------------------- |
| Aggregate    | `[Name].aggregate.ts`        | `class.aggregate.ts`        |
| Entity       | `[name].entity.ts`           | `enrollment.entity.ts`      |
| Value Object | `[name].vo.ts`               | `email.vo.ts`               |
| Domain Event | `[name].event.ts`            | `student-enrolled.event.ts` |
| Command      | `[verb]-[noun].command.ts`   | `enroll-student.command.ts` |
| Query        | `get-[noun].query.ts`        | `get-class-roster.query.ts` |
| Handler      | `[command/query].handler.ts` | `enroll-student.handler.ts` |
| Repository   | `[aggregate].repository.ts`  | `class.repository.ts`       |

### 3. Testing Strategy

| Layer          | Test Type          | Tools              |
| -------------- | ------------------ | ------------------ |
| Domain         | Unit               | Jest               |
| Application    | Unit + Integration | Jest               |
| Infrastructure | Integration        | Jest + Prisma Test |
| API            | E2E                | Supertest          |

### 4. Git Workflow

```
main
  │
  ├── develop
  │     │
  │     ├── feature/identity-context
  │     ├── feature/learning-context
  │     ├── feature/class-management
  │     └── feature/gamification
  │
  └── release/v1.0.0
```

---

## Implementation Priority

```
PHASE 1 (Month 1-2): Foundation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── Shared Kernel (base classes)
├── Infrastructure (Prisma, Redis, CQRS bus)
├── Identity Context (auth, users)
└── Learning Context (courses, lessons, exercises)

PHASE 2 (Month 3-4): Core Business
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── Class Management Context
├── Assessment Context
└── Progress tracking

PHASE 3 (Month 5-6): Engagement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── Gamification Context
├── Community Context
└── Messaging

PHASE 4 (Month 7): Operations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── Billing Context
├── Analytics
└── Admin tools

PHASE 5 (Month 8-9): Polish
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├── Performance optimization
├── Security hardening
└── Documentation
```

---

## References

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Implementing Domain-Driven Design by Vaughn Vernon](https://www.amazon.com/Implementing-Domain-Driven-Design-Vaughn-Vernon/dp/0321834577)
- [NestJS CQRS Documentation](https://docs.nestjs.com/recipes/cqrs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**Document Changelog:**

| Version | Date         | Author | Changes                       |
| ------- | ------------ | ------ | ----------------------------- |
| 1.0     | Dec 15, 2025 | Team   | Initial architecture document |
