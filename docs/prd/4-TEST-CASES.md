# Test Cases & QA Strategy

**Document Type:** Test Cases & QA Strategy  
**Project:** LMS Baby Owl  
**Version:** 1.0  
**Date:** December 1, 2025

---

## 📑 Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [E2E Tests](#e2e-tests)
5. [QA Checklist](#qa-checklist)
6. [Bug Tracking](#bug-tracking)

---

## 🎯 Testing Strategy

### Testing Pyramid

```
       /\
      /E2E\      (10% - Critical user flows)
     /------\
    /  Integ \   (30% - API, component integration)
   /----------\
  /    Unit    \ (60% - Functions, utilities, components)
 /--------------\
```

### Test Coverage Goals

| Layer                 | Coverage Target     | Priority |
| --------------------- | ------------------- | -------- |
| **Unit Tests**        | >80%                | High     |
| **Integration Tests** | >60%                | High     |
| **E2E Tests**         | Critical flows only | Medium   |

### Testing Tools

| Type                  | Tool                     | Purpose                     |
| --------------------- | ------------------------ | --------------------------- |
| **Unit (Frontend)**   | Vitest + Testing Library | React components, utilities |
| **Unit (Backend)**    | Jest                     | API logic, database queries |
| **Integration**       | Jest + Supertest         | API endpoints               |
| **E2E**               | Playwright / Cypress     | User flows                  |
| **Visual Regression** | Chromatic / Percy        | UI changes                  |
| **Performance**       | Lighthouse               | Page speed                  |
| **Accessibility**     | axe DevTools             | WCAG compliance             |

---

## 🧪 Unit Tests

### Frontend (React Components)

**Example: Button Component**

```typescript
// button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDisabled();
  });
});
```

**Example: Progress Calculation Utility**

```typescript
// progress.test.ts
import { calculateProgress } from './progress';

describe('calculateProgress', () => {
  it('returns 0% when no lessons completed', () => {
    expect(calculateProgress(0, 10)).toBe(0);
  });

  it('returns 100% when all lessons completed', () => {
    expect(calculateProgress(10, 10)).toBe(100);
  });

  it('returns 50% when half completed', () => {
    expect(calculateProgress(5, 10)).toBe(50);
  });

  it('handles division by zero', () => {
    expect(calculateProgress(0, 0)).toBe(0);
  });
});
```

### Backend (API Logic)

**Example: XP Calculation**

```typescript
// xp.service.test.ts
import { calculateXP, levelForXP } from './xp.service';

describe('XP Service', () => {
  describe('calculateXP', () => {
    it('awards 10 XP for video lesson', () => {
      expect(calculateXP('video_complete')).toBe(10);
    });

    it('awards 15 XP for quiz pass', () => {
      expect(calculateXP('quiz_pass')).toBe(15);
    });

    it('awards 50 XP for graded assignment', () => {
      expect(calculateXP('assignment_graded')).toBe(50);
    });
  });

  describe('levelForXP', () => {
    it('returns level 1 for 0-149 XP', () => {
      expect(levelForXP(0)).toBe(1);
      expect(levelForXP(149)).toBe(1);
    });

    it('returns level 2 for 150-349 XP', () => {
      expect(levelForXP(150)).toBe(2);
      expect(levelForXP(349)).toBe(2);
    });

    it('returns level 5 for 900 XP', () => {
      expect(levelForXP(900)).toBe(5);
    });
  });
});
```

### Critical Unit Test Cases

**Authentication:**

- ✓ Password hashing (bcrypt)
- ✓ JWT token generation
- ✓ JWT token validation
- ✓ Role-based access control

**Progress Tracking:**

- ✓ Progress percentage calculation
- ✓ Completion detection (>80% watched)
- ✓ Quiz score storage

**Gamification:**

- ✓ XP calculation per action
- ✓ Level calculation from XP
- ✓ Badge unlock criteria check

**Class Management:**

- ✓ Package limit enforcement (based on class meeting count)
- ✓ Lesson unlock validation
- ✓ Capacity check (prevent over-enrollment)

---

## 🔗 Integration Tests

### API Endpoint Tests

**Example: POST /api/auth/login**

```typescript
// auth.integration.test.ts
import request from 'supertest';
import app from '../app';

describe('POST /api/auth/login', () => {
  it('returns JWT token on successful login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'student@test.com',
      password: 'Test1234!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('student');
  });

  it('returns 401 on invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'student@test.com',
      password: 'WrongPassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 429 after 5 failed attempts (rate limiting)', async () => {
    // Attempt 5 times with wrong password
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/auth/login').send({
        email: 'student@test.com',
        password: 'Wrong',
      });
    }

    // 6th attempt should be blocked
    const res = await request(app).post('/api/auth/login').send({
      email: 'student@test.com',
      password: 'Wrong',
    });

    expect(res.status).toBe(429);
    expect(res.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });
});
```

**Example: POST /api/classes/:id/unlock-lesson**

```typescript
// classes.integration.test.ts
describe('POST /api/classes/:id/unlock-lesson', () => {
  let token: string;
  let classId: string;

  beforeAll(async () => {
    // Login as instructor, create class
    token = await loginAsInstructor();
    classId = await createTestClass();
  });

  it('unlocks lesson successfully', async () => {
    const res = await request(app)
      .post(`/api/classes/${classId}/unlock-lesson`)
      .set('Authorization', `Bearer ${token}`)
      .send({ lessonId: 'lesson_1' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('blocks unlock if package limit reached', async () => {
    // Enroll student with 10x package, unlock 10 lessons
    const studentId = await enrollStudent(classId, '10x');
    for (let i = 1; i <= 10; i++) {
      await unlockLesson(classId, `lesson_${i}`);
    }

    // Try to unlock 11th lesson
    const res = await request(app)
      .post(`/api/classes/${classId}/unlock-lesson`)
      .set('Authorization', `Bearer ${token}`)
      .send({ lessonId: 'lesson_11' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('PACKAGE_LIMIT_REACHED');
  });

  it('sends email notification to all students', async () => {
    const res = await request(app)
      .post(`/api/classes/${classId}/unlock-lesson`)
      .set('Authorization', `Bearer ${token}`)
      .send({ lessonId: 'lesson_2' });

    expect(res.status).toBe(200);
    // Verify email sent (mock email service)
    expect(mockEmailService.send).toHaveBeenCalledWith({
      to: expect.any(String),
      subject: 'New Lesson Unlocked: [Lesson Title]',
      template: 'lesson_unlocked',
    });
  });
});
```

### Critical Integration Test Cases

**Authentication Flow:**

- ✓ Register → Verify Email → Login → Get Token
- ✓ Login → JWT expires → 401 on protected route
- ✓ Forgot Password → Receive Email → Reset Password → Login

**Role-Based Access Control (RBAC):**

- ✓ Student login → Redirected to `/student/dashboard`
- ✓ Instructor login → Redirected to `/instructor/dashboard`
- ✓ Staff login → Redirected to `/staff/dashboard`
- ✓ Super Admin login → Redirected to `/super-admin/dashboard`
- ✓ Student tries to access `/instructor/*` → 403 Forbidden
- ✓ Student tries to access `/staff/*` → 403 Forbidden
- ✓ Staff tries to access `/instructor/*` → 403 Forbidden
- ✓ Instructor tries to access `/staff/*` → 403 Forbidden
- ✓ Super Admin can access ALL routes (override)
- ✓ `POST /api/courses` by Instructor → 200 OK (authorized)
- ✓ `POST /api/courses` by Staff → 403 Forbidden (not authorized)
- ✓ `POST /api/classes` by Staff → 200 OK (authorized)
- ✓ `POST /api/classes` by Instructor → 403 Forbidden (not authorized)
- ✓ `POST /api/staff/enrollment/quick` by Staff → 200 OK
- ✓ `POST /api/staff/enrollment/quick` by Student → 403 Forbidden
- ✓ `POST /api/users` with role="staff" by Super Admin → 200 OK
- ✓ `POST /api/users` with role="staff" by Staff → 403 Forbidden
- ✓ `POST /api/users` with role="student" by Staff → 200 OK
- ✓ `GET /api/super-admin/users` by Super Admin → 200 OK
- ✓ `GET /api/super-admin/users` by Staff → 403 Forbidden

**Course Enrollment:**

- ✓ Staff creates class → Enrolls student → Student can access course
- ✓ Student enrolls in class → Class capacity updated
- ✓ Student already enrolled → Prevent duplicate enrollment

**Lesson Unlocking:**

- ✓ Instructor unlocks lesson → Students receive email → Lesson accessible
- ✓ Unlock beyond package limit → Blocked with error
- ✓ Unlock lesson → Progress tracking initialized

**Assignment Submission:**

- ✓ Student submits file → File uploaded to S3 → Submission saved
- ✓ Instructor grades → Student receives email → XP awarded

---

## 🎭 E2E Tests

### Critical User Flows

**E2E Test 1: Student Registration & First Lesson**

```typescript
// student-registration.e2e.ts
import { test, expect } from '@playwright/test';

test('Student can register, enroll, and complete first lesson', async ({
  page,
}) => {
  // 1. Navigate to registration page
  await page.goto('https://lms.babyowl.com/register');

  // 2. Fill registration form
  await page.fill('input[name="fullName"]', 'Test Student');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'Test1234!');
  await page.fill('input[name="confirmPassword"]', 'Test1234!');
  await page.check('input[name="agreeToTerms"]');

  // 3. Submit registration
  await page.click('button[type="submit"]');

  // 4. Verify redirect to onboarding
  await expect(page).toHaveURL(/\/onboarding/);

  // 5. Complete onboarding (4 steps)
  for (let i = 0; i < 4; i++) {
    await page.click('button:has-text("Next")');
  }

  // 6. Verify redirect to dashboard
  await expect(page).toHaveURL(/\/student\/dashboard/);

  // 7. Navigate to course (assume enrolled by admin)
  await page.click('text=101 React Native');

  // 8. Start first lesson
  await page.click('button:has-text("Continue Learning")');

  // 9. Watch video (simulate)
  await page.waitForSelector('iframe'); // YouTube embed
  await page.waitForTimeout(5000); // Simulate watching

  // 10. Mark as complete
  await page.click('button:has-text("Mark as Complete")');

  // 11. Verify XP notification
  await expect(page.locator('text=+10 XP')).toBeVisible();

  // 12. Verify lesson marked complete
  await expect(page.locator('svg.checkmark')).toBeVisible();
});
```

**E2E Test 2: Instructor Unlocks Lesson & Student Accesses**

```typescript
// instructor-unlock-lesson.e2e.ts
test('Instructor unlocks lesson, student receives notification and accesses it', async ({
  browser,
}) => {
  // Create 2 browser contexts (instructor + student)
  const instructorContext = await browser.newContext();
  const studentContext = await browser.newContext();

  const instructorPage = await instructorContext.newPage();
  const studentPage = await studentContext.newPage();

  // ===== Instructor Flow =====
  // 1. Login as instructor
  await instructorPage.goto('https://lms.babyowl.com/login');
  await instructorPage.fill('input[name="email"]', 'instructor@test.com');
  await instructorPage.fill('input[name="password"]', 'Test1234!');
  await instructorPage.click('button[type="submit"]');

  // 2. Navigate to class
  await instructorPage.click('text=RN101 - Batch 5');

  // 3. Unlock Lesson 5
  await instructorPage.click('button:has-text("Unlock Next Lesson")');
  await instructorPage.click('button:has-text("Confirm")');

  // 4. Verify success toast
  await expect(instructorPage.locator('text=Lesson 5 unlocked!')).toBeVisible();

  // ===== Student Flow =====
  // 1. Login as student
  await studentPage.goto('https://lms.babyowl.com/login');
  await studentPage.fill('input[name="email"]', 'student@test.com');
  await studentPage.fill('input[name="password"]', 'Test1234!');
  await studentPage.click('button[type="submit"]');

  // 2. Check notification (bell icon)
  await expect(studentPage.locator('.notification-badge')).toHaveText('1');

  // 3. Navigate to course
  await studentPage.click('text=101 React Native');

  // 4. Verify Lesson 5 is now unlocked (not locked icon)
  await expect(
    studentPage.locator('text=Lesson 5').locator('..').locator('svg.lock-icon'),
  ).not.toBeVisible();

  // 5. Click Lesson 5
  await studentPage.click('text=Lesson 5');

  // 6. Verify lesson content loads
  await expect(studentPage).toHaveURL(/\/learn\/lesson_5/);
  await expect(studentPage.locator('h1:has-text("Lesson 5")')).toBeVisible();
});
```

**E2E Test 3: Staff Quick Enrollment**

```typescript
// staff-quick-enrollment.e2e.ts
test('Staff enrolls student via Quick Enrollment Tool', async ({ page }) => {
  // 1. Login as staff
  await page.goto('https://lms.babyowl.com/login');
  await page.fill('input[name="email"]', 'staff@test.com');
  await page.fill('input[name="password"]', 'Staff1234!');
  await page.click('button[type="submit"]');

  // 2. Navigate to Quick Enrollment Tool
  await page.click('text=Quick Enrollment');

  // 3. Fill form
  await page.fill('input[name="fullName"]', 'New Student');
  await page.fill('input[name="email"]', 'newstudent@test.com');
  await page.fill('input[name="phone"]', '+6281234567890');
  await page.selectOption('select[name="classId"]', {
    label: 'RN101 - Batch 5',
  });
  await page.selectOption('select[name="packageType"]', '20x');
  await page.selectOption('select[name="paymentStatus"]', 'verified');

  // 4. Submit
  await page.click('button:has-text("Create & Enroll")');

  // 5. Verify success modal
  await expect(
    page.locator('text=Student enrolled successfully!'),
  ).toBeVisible();

  // 6. Verify set-password link displayed
  await expect(page.locator('text=Set Password Link')).toBeVisible();

  // 7. Close modal
  await page.click('button:has-text("Close")');

  // 8. Verify student appears in class roster
  await page.click('text=RN101 - Batch 5');
  await page.click('text=Roster');
  await expect(page.locator('text=New Student')).toBeVisible();
});
```

### E2E Test Coverage

**Critical Flows (Must Test):**

- ✓ Student registration → onboarding → first lesson
- ✓ Staff quick enrollment → student sets password → accesses course
- ✓ Instructor creates course → publishes → visible in catalog
- ✓ Staff creates class → assigns instructor → ready for enrollment
- ✓ Instructor unlocks lesson → students notified → students access
- ✓ Student submits assignment → instructor grades → student sees grade
- ✓ Student completes quiz → score saved → XP awarded
- ✓ Student completes course → certificate generated
- ✓ Super Admin creates staff account → staff logs in → can access staff features

**Important Flows (Should Test):**

- ✓ Student upgrades package (via WhatsApp mock)
- ✓ Instructor grades multiple assignments (bulk grading)
- ✓ Staff tracks payment → enrolls student
- ✓ Student reaches level up → notification displayed
- ✓ Super Admin views analytics → exports report
- ✓ Super Admin manages users → changes role → permissions updated

---

## ✅ QA Checklist

### Pre-Launch Checklist

**Functionality:**

- [ ] All user roles can login (student, instructor, admin)
- [ ] Course catalog displays published courses
- [ ] Course enrollment working (admin enrolls student)
- [ ] Lesson unlocking working (instructor unlocks, students access)
- [ ] Video lessons play (YouTube embed)
- [ ] Quizzes submit and grade correctly
- [ ] Assignments submit and instructors can grade
- [ ] XP system working (earn XP, level up)
- [ ] Progress tracking accurate (% complete)
- [ ] Notifications sent (email + in-app)
- [ ] WhatsApp deep links working (pre-filled messages)

**Security:**

- [ ] Passwords hashed (bcrypt)
- [ ] JWT tokens working (login, logout, session expiry)
- [ ] RBAC working (students can't access admin routes)
- [ ] Rate limiting working (prevent brute force)
- [ ] HTTPS enabled (all requests encrypted)
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (input sanitization)

**Performance:**

- [ ] Dashboard loads <1.5s
- [ ] Lesson page loads <2s
- [ ] API responses <500ms (95th percentile)
- [ ] Images optimized (WebP, lazy loading)
- [ ] No memory leaks (Chrome DevTools profiling)

**Accessibility:**

- [ ] Keyboard navigation working (tab order logical)
- [ ] Screen reader friendly (ARIA labels)
- [ ] Color contrast meets WCAG AA (4.5:1 text)
- [ ] Focus states visible (2px outline)
- [ ] Forms have labels (htmlFor)

**Responsive:**

- [ ] Mobile (375px) - all features work
- [ ] Tablet (768px) - layout adapts
- [ ] Desktop (1280px) - optimal layout
- [ ] Touch targets >44x44px (mobile)

**Browser Compatibility:**

- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 🐛 Bug Tracking

### Bug Severity Levels

| Level             | Definition             | Response Time | Examples                                           |
| ----------------- | ---------------------- | ------------- | -------------------------------------------------- |
| **P0 - Critical** | System down, data loss | <1 hour       | Login broken, database down                        |
| **P1 - High**     | Major feature broken   | <4 hours      | Video lessons won't play, assignments can't submit |
| **P2 - Medium**   | Minor feature broken   | <24 hours     | Progress bar incorrect, notification not sent      |
| **P3 - Low**      | Cosmetic issue         | <1 week       | Typo, misaligned button                            |

### Bug Report Template

```markdown
**Title:** [Concise description]

**Severity:** P1 - High

**Steps to Reproduce:**

1. Login as student
2. Navigate to course
3. Click lesson
4. [Bug occurs]

**Expected Behavior:**
Lesson content should load

**Actual Behavior:**
Blank page, console error: "TypeError: undefined"

**Environment:**

- Browser: Chrome 120
- OS: Windows 11
- URL: https://lms.babyowl.com/courses/123/learn/456

**Screenshots/Video:**
[Attach screenshot]

**Console Errors:**
```

TypeError: Cannot read property 'title' of undefined
at LessonPage.tsx:45

```

**Assigned To:** [Developer]
**Status:** In Progress
**Fixed In:** [Version/PR number]
```

---

## 🔄 Continuous Testing

### CI/CD Pipeline Tests

**On Every Commit:**

1. Lint (ESLint)
2. Type check (TypeScript)
3. Unit tests (Vitest/Jest)
4. Build (Next.js)

**On Pull Request:**

1. All commit checks
2. Integration tests (API tests)
3. E2E tests (critical flows only)
4. Visual regression tests (Chromatic)

**Pre-Production Deploy:**

1. Full test suite (unit + integration + E2E)
2. Performance tests (Lighthouse)
3. Accessibility tests (axe)
4. Security scan (Snyk)

---

**End of Test Cases & QA Strategy**

_Next Document: [Implementation Plan →](./5-IMPLEMENTATION-PLAN.md)_
