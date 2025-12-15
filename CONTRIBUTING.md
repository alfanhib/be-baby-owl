# Contributing to LMS Baby Owl (Inntexia Academy)

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

---

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Git Workflow](#git-workflow)
4. [Commit Convention](#commit-convention)
5. [Code Style](#code-style)
6. [Testing](#testing)
7. [Pull Request Process](#pull-request-process)

---

## Development Setup

### Prerequisites

- Node.js 20.x LTS
- Yarn 1.22+
- Docker & Docker Compose
- Git

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd be-baby-owl

# Install dependencies
yarn install

# Copy environment file
cp env.example .env

# Start infrastructure (PostgreSQL + Redis)
yarn docker:up:dev

# Generate Prisma client
yarn db:generate

# Push database schema
yarn db:push

# Start development server
yarn start:dev
```

### Available Scripts

| Script           | Description                          |
| ---------------- | ------------------------------------ |
| `yarn dev`       | Start Docker + NestJS dev server     |
| `yarn dev:full`  | Start Docker with dev tools + NestJS |
| `yarn start:dev` | Start NestJS in watch mode           |
| `yarn build`     | Build the project                    |
| `yarn lint`      | Run ESLint                           |
| `yarn format`    | Format code with Prettier            |
| `yarn test`      | Run unit tests                       |
| `yarn test:e2e`  | Run e2e tests                        |
| `yarn db:studio` | Open Prisma Studio                   |

### Dev Tools Access

| Tool            | URL                            | Credentials                |
| --------------- | ------------------------------ | -------------------------- |
| API             | http://localhost:3000          | -                          |
| Swagger         | http://localhost:3000/api/docs | -                          |
| pgAdmin         | http://localhost:5050          | admin@inntexia.com / admin |
| Redis Commander | http://localhost:8081          | admin / admin              |
| Mailpit         | http://localhost:8025          | -                          |

---

## Project Structure

```
src/
├── shared/                 # Shared kernel (base classes, utilities)
│   ├── domain/            # Domain building blocks
│   ├── application/       # Application utilities
│   ├── infrastructure/    # Prisma, Redis, etc.
│   └── interfaces/        # Decorators, guards, filters
│
├── config/                # Configuration modules
│
├── modules/               # Bounded contexts
│   ├── identity/         # Auth & Users
│   ├── learning/         # Courses, Lessons, Exercises
│   ├── class-management/ # Classes, Enrollments
│   ├── gamification/     # XP, Badges, Leaderboard
│   └── ...
│
└── infrastructure/        # Cross-cutting infrastructure
```

### Module Structure (DDD)

```
modules/<context>/
├── domain/
│   ├── aggregates/       # Aggregate roots
│   ├── entities/         # Child entities
│   ├── value-objects/    # Value objects
│   ├── events/           # Domain events
│   ├── services/         # Domain services
│   ├── repositories/     # Repository interfaces
│   └── errors/           # Domain errors
│
├── application/
│   ├── commands/         # Write operations
│   ├── queries/          # Read operations
│   ├── event-handlers/   # Event listeners
│   └── services/         # Application services
│
├── infrastructure/
│   └── persistence/      # Repository implementations
│
├── interfaces/
│   └── http/             # Controllers & DTOs
│
└── <context>.module.ts
```

---

## Git Workflow

### Branches

```
main                    # Production-ready code
├── develop            # Integration branch
│   ├── feature/*     # New features
│   ├── fix/*         # Bug fixes
│   ├── refactor/*    # Refactoring
│   └── docs/*        # Documentation
└── release/*          # Release preparation
```

### Workflow

1. Create branch from `develop`

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make changes and commit

   ```bash
   git add .
   git commit -m "feat(scope): your message"
   ```

3. Push and create PR

   ```bash
   git push origin feature/your-feature-name
   ```

4. After review, merge to `develop`

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description                                         |
| ---------- | --------------------------------------------------- |
| `feat`     | New feature                                         |
| `fix`      | Bug fix                                             |
| `docs`     | Documentation only                                  |
| `style`    | Code style (formatting, semicolons)                 |
| `refactor` | Code change that neither fixes bug nor adds feature |
| `perf`     | Performance improvement                             |
| `test`     | Adding or fixing tests                              |
| `chore`    | Maintenance tasks                                   |
| `build`    | Build system or dependencies                        |
| `ci`       | CI configuration                                    |
| `revert`   | Revert previous commit                              |

### Scopes (optional)

- `auth` - Authentication
- `user` - User management
- `course` - Course management
- `class` - Class management
- `gamification` - Gamification
- `api` - API changes
- `db` - Database changes
- `config` - Configuration

### Examples

```bash
# Feature
feat(auth): add JWT refresh token endpoint

# Bug fix
fix(class): resolve enrollment validation error

# Documentation
docs: update API documentation

# Refactoring
refactor(user): extract password validation to value object

# Breaking change
feat(api)!: change response format for pagination

BREAKING CHANGE: pagination response now uses 'meta' instead of 'pagination'
```

---

## Code Style

### General Rules

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use meaningful variable names
- Keep functions small and focused
- Follow DDD patterns for domain code

### Naming Conventions

| Type       | Convention               | Example              |
| ---------- | ------------------------ | -------------------- |
| Files      | kebab-case               | `user.repository.ts` |
| Classes    | PascalCase               | `UserRepository`     |
| Interfaces | PascalCase with I prefix | `IUserRepository`    |
| Functions  | camelCase                | `findByEmail()`      |
| Variables  | camelCase                | `userEmail`          |
| Constants  | SCREAMING_SNAKE_CASE     | `MAX_LOGIN_ATTEMPTS` |
| Enums      | PascalCase               | `UserRole`           |

### File Naming

```
# Domain
user.aggregate.ts
email.vo.ts
user-created.event.ts

# Application
create-user.command.ts
create-user.handler.ts
get-user.query.ts

# Infrastructure
user.repository.ts
user.mapper.ts

# Interface
users.controller.ts
create-user.dto.ts
```

### Import Order

```typescript
// 1. Node.js built-ins
import { randomUUID } from 'crypto';

// 2. External packages
import { Injectable } from '@nestjs/common';

// 3. Internal shared modules
import { Result } from '@shared/application';

// 4. Same module imports
import { User } from '../domain/aggregates/user.aggregate';
```

---

## Testing

### Test Structure

```
test/
├── unit/                 # Unit tests
│   └── modules/
│       └── identity/
│           ├── domain/
│           └── application/
├── integration/          # Integration tests
└── e2e/                  # End-to-end tests
```

### Running Tests

```bash
# Unit tests
yarn test

# Watch mode
yarn test:watch

# Coverage
yarn test:cov

# E2E tests
yarn test:e2e
```

### Test Naming

```typescript
describe('User Aggregate', () => {
  describe('create', () => {
    it('should create user with valid data', () => {
      // ...
    });

    it('should fail when email is invalid', () => {
      // ...
    });
  });
});
```

---

## Pull Request Process

### Before Creating PR

1. Ensure all tests pass

   ```bash
   yarn test
   yarn lint
   ```

2. Update documentation if needed

3. Self-review your code

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Closes #123

## Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No linting errors
- [ ] Self-reviewed code
```

### Review Process

1. At least 1 approval required
2. All CI checks must pass
3. No merge conflicts
4. Squash and merge preferred

---

## Questions?

If you have questions, please:

1. Check existing documentation in `docs/`
2. Search existing issues
3. Create a new issue with the question label

---

**Happy coding!**
