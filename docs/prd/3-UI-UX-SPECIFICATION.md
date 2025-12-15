# UI/UX Specification

**Document Type:** UI/UX Specification  
**Project:** LMS Baby Owl  
**Version:** 1.0  
**Date:** December 1, 2025  
**Design System:** Tailwind CSS + shadcn/ui

---

## 📑 Table of Contents

1. [Design System](#design-system)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Components](#components)
5. [User Flows](#user-flows)
6. [Responsive Design](#responsive-design)
7. [Accessibility](#accessibility)

---

## 🎨 Design System

### Design Principles

1. **Clarity** - Clear, intuitive interface
2. **Consistency** - Reusable patterns across platform
3. **Simplicity** - Minimal cognitive load
4. **Accessibility** - WCAG AA compliant
5. **Performance** - Fast load times, smooth animations

### Component Library

**Base:** shadcn/ui (headless, accessible components)
**Customization:** Tailwind CSS utility classes

---

## 🌈 Color Palette

### Greyscale

```css
--GREYSCALE-900: rgb(13, 13, 18); /* Darkest text */
--GREYSCALE-800: rgb(26, 27, 37);
--GREYSCALE-700: rgb(39, 40, 53);
--GREYSCALE-600: rgb(54, 57, 74);
--GREYSCALE-500: rgb(102, 109, 128); /* Body text */
--GREYSCALE-400: rgb(129, 136, 152);
--GREYSCALE-300: rgb(164, 172, 185); /* Borders */
--GREYSCALE-200: rgb(193, 199, 208);
--GREYSCALE-100: rgb(223, 225, 231);
--GREYSCALE-50: rgb(236, 239, 243);
--GREYSCALE-25: rgb(246, 248, 250);
--GREYSCALE-0: rgb(248, 250, 251); /* Background */
```

### Primary (Purple)

```css
--PRIMARY-300: rgb(161, 104, 190); /* Dark purple */
--PRIMARY-200: rgb(201, 130, 237); /* Main brand color */
--PRIMARY-100: rgb(212, 155, 241);
--PRIMARY-50: rgb(223, 180, 244);
--PRIMARY-25: rgb(233, 205, 248);
--PRIMARY-0: rgb(244, 230, 251);
```

### Secondary (Gray)

```css
--SECONDARY-300: rgb(44, 44, 45);
--SECONDARY-200: rgb(86, 86, 87);
--SECONDARY-100: rgb(128, 128, 129);
--SECONDARY-50: rgb(171, 171, 171);
--SECONDARY-25: rgb(213, 213, 213);
--SECONDARY-0: rgb(231, 231, 231);
```

### Alert Colors

```css
/* Error */
--ALERT-ERROR-300: rgb(113, 14, 33);
--ALERT-ERROR-200: rgb(150, 19, 44);
--ALERT-ERROR-100: rgb(223, 28, 65); /* Main error */
--ALERT-ERROR-50: rgb(237, 130, 150);
--ALERT-ERROR-25: rgb(250, 219, 225);
--ALERT-ERROR-0: rgb(255, 240, 243);

/* Warning */
--ALERT-WARNING-300: rgb(92, 61, 31);
--ALERT-WARNING-100: rgb(255, 190, 76); /* Main warning */
--ALERT-WARNING-25: rgb(250, 237, 204);
--ALERT-WARNING-0: rgb(255, 246, 224);

/* Success */
--ALERT-SUCCESS-300: rgb(24, 78, 68);
--ALERT-SUCCESS-100: rgb(64, 196, 170); /* Main success */
--ALERT-SUCCESS-25: rgb(221, 243, 239);
--ALERT-SUCCESS-0: rgb(239, 254, 250);

/* Info (Sky) */
--ADDITIONAL-SKY-300: rgb(12, 78, 110);
--ADDITIONAL-SKY-100: rgb(51, 207, 255); /* Main info */
--ADDITIONAL-SKY-25: rgb(209, 240, 250);
--ADDITIONAL-SKY-0: rgb(240, 251, 255);
```

### Usage Guidelines

| Element                  | Color       | Variable            |
| ------------------------ | ----------- | ------------------- |
| **Primary Button**       | Purple      | `PRIMARY-200`       |
| **Primary Button Hover** | Dark Purple | `PRIMARY-300`       |
| **Text (Heading)**       | Dark Gray   | `GREYSCALE-900`     |
| **Text (Body)**          | Medium Gray | `GREYSCALE-500`     |
| **Background**           | Light Gray  | `GREYSCALE-0`       |
| **Border**               | Light Gray  | `GREYSCALE-300`     |
| **Success**              | Green       | `ALERT-SUCCESS-100` |
| **Error**                | Red         | `ALERT-ERROR-100`   |
| **Warning**              | Yellow      | `ALERT-WARNING-100` |

---

## 🔤 Typography

### Font Family

**Primary:** Inter (sans-serif)

- Source: Google Fonts
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

**Code:** Fira Code (monospace)

- For code blocks, inline code
- Weight: 400

### Type Scale

| Element   | Size | Weight | Line Height | Usage               |
| --------- | ---- | ------ | ----------- | ------------------- |
| **H1**    | 36px | 700    | 1.2         | Page titles         |
| **H2**    | 30px | 700    | 1.3         | Section headers     |
| **H3**    | 24px | 600    | 1.4         | Subsection headers  |
| **H4**    | 20px | 600    | 1.5         | Card titles         |
| **Body**  | 16px | 400    | 1.6         | Paragraph text      |
| **Small** | 14px | 400    | 1.5         | Helper text, labels |
| **Tiny**  | 12px | 400    | 1.4         | Captions, metadata  |

### Tailwind Classes

```css
/* Headings */
.text-h1 {
  @apply text-4xl font-bold leading-tight text-greyscale-900;
}
.text-h2 {
  @apply text-3xl font-bold leading-snug text-greyscale-900;
}
.text-h3 {
  @apply text-2xl font-semibold leading-normal text-greyscale-900;
}
.text-h4 {
  @apply text-xl font-semibold leading-relaxed text-greyscale-800;
}

/* Body */
.text-body {
  @apply text-base font-normal leading-relaxed text-greyscale-500;
}
.text-small {
  @apply text-sm font-normal leading-normal text-greyscale-500;
}
.text-tiny {
  @apply text-xs font-normal leading-tight text-greyscale-400;
}
```

---

## 🧩 Components

### Buttons

**Primary Button**

```tsx
<button
  className="
  bg-primary-200 hover:bg-primary-300
  text-white font-semibold
  px-6 py-3 rounded-lg
  transition-colors duration-200
  shadow-sm hover:shadow-md
"
>
  Continue Learning
</button>
```

**Secondary Button**

```tsx
<button
  className="
  bg-greyscale-100 hover:bg-greyscale-200
  text-greyscale-800 font-semibold
  px-6 py-3 rounded-lg
  transition-colors duration-200
"
>
  Cancel
</button>
```

**Danger Button (Delete, etc.)**

```tsx
<button
  className="
  bg-alert-error-100 hover:bg-alert-error-200
  text-white font-semibold
  px-6 py-3 rounded-lg
  transition-colors duration-200
"
>
  Delete
</button>
```

**Ghost Button (Minimal)**

```tsx
<button
  className="
  text-primary-200 hover:text-primary-300 hover:bg-primary-0
  font-semibold px-4 py-2 rounded-lg
  transition-colors duration-200
"
>
  Learn More
</button>
```

---

### Cards

**Course Card**

```tsx
<div
  className="
  bg-white rounded-xl shadow-sm hover:shadow-md
  transition-shadow duration-200
  overflow-hidden border border-greyscale-200
"
>
  <img src="..." alt="..." className="w-full h-48 object-cover" />
  <div className="p-4">
    <h4 className="text-h4 mb-2">101 React Native</h4>
    <p className="text-small text-greyscale-500 mb-4">
      Learn React Native from scratch...
    </p>
    <div className="flex items-center justify-between">
      <span className="text-tiny text-greyscale-400">Beginner</span>
      <button className="btn-primary-sm">View Details</button>
    </div>
  </div>
</div>
```

---

### Forms

**Input Field**

```tsx
<div className="mb-4">
  <label className="block text-small font-medium text-greyscale-700 mb-2">
    Email
  </label>
  <input
    type="email"
    className="
      w-full px-4 py-3 rounded-lg
      border border-greyscale-300
      focus:border-primary-200 focus:ring-2 focus:ring-primary-50
      transition-colors duration-200
      text-greyscale-800 placeholder-greyscale-400
    "
    placeholder="your@email.com"
  />
</div>
```

**Error State**

```tsx
<input className="
  border-alert-error-100 focus:ring-alert-error-25
" />
<p className="text-small text-alert-error-100 mt-1">
  Email is required
</p>
```

---

### Progress Bars

**Linear Progress**

```tsx
<div className="w-full bg-greyscale-100 rounded-full h-2">
  <div
    className="bg-primary-200 h-2 rounded-full transition-all duration-300"
    style={{ width: '65%' }}
  />
</div>
<p className="text-small text-greyscale-500 mt-1">65% Complete</p>
```

**Circular Progress (Using shadcn/ui)**

```tsx
<Progress value={65} className="w-16 h-16" />
```

---

### Badges

**Status Badges**

```tsx
/* Completed */
<span className="
  inline-flex items-center px-3 py-1 rounded-full
  bg-alert-success-25 text-alert-success-300
  text-tiny font-medium
">
  ✓ Completed
</span>

/* Pending */
<span className="
  inline-flex items-center px-3 py-1 rounded-full
  bg-additional-sky-25 text-additional-sky-300
  text-tiny font-medium
">
  Pending
</span>

/* Overdue */
<span className="
  inline-flex items-center px-3 py-1 rounded-full
  bg-alert-error-25 text-alert-error-300
  text-tiny font-medium
">
  Overdue
</span>
```

---

### Modals

**Standard Modal (shadcn/ui Dialog)**

```tsx
<Dialog>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this course?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### Toasts (Notifications)

**Success Toast**

```tsx
<Toast className="bg-alert-success-0 border-alert-success-100">
  <ToastTitle>Success!</ToastTitle>
  <ToastDescription>Course created successfully.</ToastDescription>
</Toast>
```

**Error Toast**

```tsx
<Toast className="bg-alert-error-0 border-alert-error-100">
  <ToastTitle>Error</ToastTitle>
  <ToastDescription>Failed to save. Please try again.</ToastDescription>
</Toast>
```

---

### Code Editor (Coding Exercises)

**Monaco Editor Integration**

```tsx
<div className="coding-exercise">
  {/* Instructions Panel */}
  <div className="instructions bg-white rounded-xl border border-greyscale-200 p-4 mb-4">
    <h3 className="text-h4 mb-2">Instructions</h3>
    <div
      className="prose prose-sm"
      dangerouslySetInnerHTML={{ __html: instructions }}
    />
  </div>

  {/* Code Editor */}
  <div className="editor-container flex gap-4">
    <div className="editor flex-1">
      <MonacoEditor
        language="python"
        theme="vs-dark"
        height="400px"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          automaticLayout: true,
        }}
      />
    </div>

    {/* Output Panel */}
    <div className="output flex-1 bg-greyscale-900 rounded-xl p-4">
      <div className="console text-greyscale-100 font-mono text-sm">
        {/* Console output */}
      </div>
      <div className="canvas bg-white rounded-lg mt-4">
        {/* Visual output (turtle, matplotlib) */}
      </div>
    </div>
  </div>

  {/* Action Buttons */}
  <div className="actions flex gap-3 mt-4">
    <Button className="bg-primary-200 hover:bg-primary-300">▶️ Run Code</Button>
    <Button variant="outline">🔄 Reset</Button>
    <Button className="bg-alert-success-100 hover:bg-alert-success-200">
      ✅ Submit
    </Button>
  </div>

  {/* Test Results (Challenge Mode) */}
  <div className="test-results mt-4 bg-greyscale-25 rounded-xl p-4">
    <h4 className="text-h4 mb-3">Test Results</h4>
    <div className="space-y-2">
      <div className="test-case flex items-center gap-2 p-2 bg-alert-success-0 rounded-lg">
        <span className="text-alert-success-100">✅</span>
        <span>Test 1: Basic case</span>
        <span className="text-greyscale-500 ml-auto">10 pts</span>
      </div>
      <div className="test-case flex items-center gap-2 p-2 bg-alert-error-0 rounded-lg">
        <span className="text-alert-error-100">❌</span>
        <span>Test 2: Edge case</span>
        <span className="text-greyscale-500 ml-auto">10 pts</span>
      </div>
    </div>
  </div>
</div>
```

**Editor Theme Colors:**

```css
/* Dark Theme (default for code) */
--editor-bg: rgb(30, 30, 30); /* VS Code dark */
--editor-text: rgb(212, 212, 212);
--editor-keyword: rgb(86, 156, 214); /* blue */
--editor-string: rgb(206, 145, 120); /* orange */
--editor-comment: rgb(106, 153, 85); /* green */
--editor-function: rgb(220, 220, 170); /* yellow */
--editor-number: rgb(181, 206, 168); /* light green */

/* Console Output */
--console-bg: rgb(13, 13, 18); /* GREYSCALE_900 */
--console-text: rgb(223, 225, 231); /* GREYSCALE_100 */
--console-error: rgb(223, 28, 65); /* ALERT_ERROR_100 */
--console-success: rgb(64, 196, 170); /* ALERT_SUCCESS_100 */
```

**Coding Exercise Layout (Split View):**

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Lesson           Exercise 2 of 5           [Hints ▾] │
├─────────────────────────────────────────────────────────────────┤
│  📝 Instructions                                    [Collapse ▾]│
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Write a function that calculates the area...              │ │
│  └───────────────────────────────────────────────────────────┘ │
├────────────────────────────────┬────────────────────────────────┤
│  💻 Code Editor (Monaco)       │  📺 Output                     │
│  ┌────────────────────────────┐│  ┌────────────────────────────┐│
│  │  1│ def calculate_area():  ││  │ 🎨 Canvas                  ││
│  │  2│     # Your code here   ││  │  (turtle/matplotlib)       ││
│  │  3│     pass               ││  │                            ││
│  │  4│                        ││  ├────────────────────────────┤│
│  │  5│                        ││  │ 📝 Console                 ││
│  │  6│                        ││  │ > 15                       ││
│  │  7│                        ││  │ > Program finished         ││
│  └────────────────────────────┘│  └────────────────────────────┘│
├────────────────────────────────┴────────────────────────────────┤
│  [ ▶️ Run Code ]  [ 🔄 Reset ]  [ ✅ Submit ]     Score: 20/30  │
├─────────────────────────────────────────────────────────────────┤
│  📊 Test Results                                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ ✅ Test 1: Basic case (10 pts)                            │ │
│  │ ✅ Test 2: Zero input (10 pts)                            │ │
│  │ 🔒 Hidden Test 1 (10 pts)                       ❌ Failed  │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 User Flows

### Student Journey

**1. Registration → Dashboard**

```
Landing Page → Sign Up → Email Verify (optional) → Onboarding (4 steps) → Dashboard
```

**2. Browse → Purchase → Learn**

```
Dashboard → Browse Courses → Course Detail → Buy via WhatsApp
  → WhatsApp Chat → Payment → Staff Enrolls → Email (Set Password)
  → Set Password → Dashboard → My Courses → Course View → Lesson
```

**3. Learning Flow**

```
Course View → Lesson 1 (Video) → Watch → Mark Complete (+10 XP)
  → Next Lesson → Lesson 2 (Quiz) → Answer → Submit → See Results (+15 XP)
  → Next Lesson → Lesson 3 (Assignment) → Read Instructions → Upload File
  → Submit → Wait for Grading → Receive Grade (+50 XP)
```

**4. Coding Exercise Flow (Challenge Mode)**

```
Lesson → Coding Challenge → Read Instructions → Write Code in Editor
  → Click "Run Code" → See Output in Console → Fix Errors
  → Click "Submit" → Test Cases Execute → See Results
  → All Tests Pass → Exercise Complete (+30 XP)
  → Some Tests Fail → Review Results → Retry → Submit Again
```

**5. Coding Exercise Flow (Playground Mode)**

```
Lesson → Coding Playground → Read Instructions → Write Code in Editor
  → Click "Run Code" → See Output (Console + Canvas)
  → Experiment with Code → Reset if Needed
  → Click "Mark as Complete" → Exercise Complete (+15 XP)
```

---

### Instructor Journey

**1. Login → Dashboard**

```
Login → Instructor Dashboard → View My Classes → Select Class → Class Roster
```

**2. Create Course**

```
Dashboard → Courses → Create New Course → Enter Details (Title, Description)
  → Upload Cover Image → Add Sections → Add Lessons → Add Exercises
  → Publish Course → Course Live
```

**3. Unlock Lesson**

```
Class Detail → Course Structure → Lesson List → Click "Unlock Lesson 5"
  → Confirm → Email Sent to Students → Lesson Unlocked
```

**4. Grade Assignment**

```
Dashboard → Pending Assignments (5) → Click "Grade" → View Submission
  → Enter Score (85/100) → Enter Rubric Scores → Write Feedback
  → Submit Grade → Student Notified → Next Submission
```

---

### Staff Journey

**1. Enroll Student (Quick Enrollment)**

```
Staff Dashboard → Quick Enrollment Tool → Enter Student Details
  → Select Class → Select Package (20x) → Mark Payment Verified
  → Click "Create & Enroll" → User Created → Enrolled in Class
  → Set Password Email Sent → Success!
```

**2. Track Payment**

```
Dashboard → Payment Tracking → Add Payment Record → Enter Details
  → Mark as "Verified" → Click "Enroll" → Pre-fills Quick Enrollment Tool
  → Submit → Student Enrolled
```

**3. Create Class & Assign Instructor**

```
Dashboard → Classes → Create New Class → Enter Details (Name, Type, Course)
  → Input Meeting Count (number) → Assign Instructor (dropdown)
  → Set Max Capacity → Set Schedule → Save → Class Created → Ready for Enrollment
```

---

### Super Admin Journey

**1. User Management**

```
Super Admin Dashboard → Users → Search/Filter → View User Profile
  → Edit Details OR Change Role → Confirm → User Updated
```

**2. Create Staff Account**

```
Dashboard → Users → Create New User → Enter Details (Name, Email, Phone)
  → Select Role: "Staff" → Generate Set Password Link
  → Send Email → Staff Account Created
```

**3. System Analytics**

```
Dashboard → Analytics → Select Date Range (Last 30 days)
  → View Enrollment Trends → View Revenue Charts → View Course Performance
  → Export Report (CSV)
```

**4. Override & Troubleshoot**

```
Dashboard → Access Any Feature (Classes, Courses, Enrollments)
  → View/Edit/Delete → Resolve Issues → Monitor System Health
```

---

## 📱 Responsive Design

### Breakpoints

| Breakpoint | Width  | Device             |
| ---------- | ------ | ------------------ |
| **sm**     | 640px  | Mobile (landscape) |
| **md**     | 768px  | Tablet             |
| **lg**     | 1024px | Desktop            |
| **xl**     | 1280px | Large desktop      |
| **2xl**    | 1536px | Extra large        |

### Layout Adaptations

**Mobile (<768px):**

- Single column layout
- Collapsible sidebar (hamburger menu)
- Stacked cards
- Bottom navigation (fixed)
- Touch-friendly buttons (min 44x44px)

**Tablet (768px-1024px):**

- 2-column grid for course cards
- Sidebar visible (collapsible)
- Larger touch targets

**Desktop (>1024px):**

- 3-column grid for course cards
- Persistent sidebar
- Hover effects enabled
- Multi-column dashboard

---

## ♿ Accessibility

### WCAG AA Compliance

**Keyboard Navigation:**

- Tab order: Logical flow
- Focus states: Visible outline (2px, primary color)
- Skip links: "Skip to main content"

**Screen Readers:**

- ARIA labels: All interactive elements
- Alt text: All images
- Semantic HTML: `<nav>`, `<main>`, `<article>`, etc.

**Color Contrast:**

- Text: 4.5:1 minimum (AA)
- Large text (18px+): 3:1 minimum
- Interactive elements: 3:1 minimum

**Forms:**

- Labels: Associated with inputs (`htmlFor`)
- Error messages: Announced by screen readers (`aria-describedby`)
- Required fields: Marked with `aria-required="true"`

**Testing Tools:**

- axe DevTools (Chrome extension)
- WAVE (Web Accessibility Evaluation Tool)
- Lighthouse (Chrome DevTools)

---

## ✅ UI/UX Checklist

Design is ready when:

- [ ] Design system documented (colors, typography)
- [ ] All components designed (buttons, cards, forms)
- [ ] User flows mapped (student, instructor, admin)
- [ ] Responsive breakpoints defined
- [ ] Mobile views designed
- [ ] Accessibility guidelines followed (WCAG AA)
- [ ] Color contrast tested (all text legible)
- [ ] Focus states designed (keyboard navigation)
- [ ] Error states designed (validation messages)
- [ ] Loading states designed (skeletons, spinners)
- [ ] Empty states designed (no data)
- [ ] Success states designed (confirmations)
- [ ] Figma mockups created (optional but recommended)

---

**End of UI/UX Specification**

_Next Document: [Test Cases →](./4-TEST-CASES.md)_
