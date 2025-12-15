# Modules 7-25: Consolidated User Stories

**Document Type:** User Stories - Consolidated  
**Modules:** M07-M25 (19 modules)  
**Total Story Points:** 667 points  
**Status:** Ready for detailed breakdown per module

---

## 📑 Contents

This consolidated document contains condensed user stories for modules 7-25. Each module summary includes:

- Module overview & business value
- Key user stories with acceptance criteria
- API contracts
- Dependencies
- Test scenarios

For full detailed documentation (comparable to M01-M06), each module can be expanded into separate files.

---

## MODULE 7: Progress Tracking

**Priority:** 🟠 High | **Story Points:** 32 | **Sprint:** 5

### Purpose

Track student progress across exercises, lessons, quizzes, and assignments. Calculate completion percentages at both exercise and lesson levels.

### Key Concepts

- **Exercise Progress:** Track individual exercise completion (video watched, material read, quiz passed, assignment submitted)
- **Lesson Progress:** Track lesson completion (all exercises in lesson complete)
- **Course Progress:** Track course completion (all lessons complete)

### Key Stories

**7.1: Exercise Completion Tracking (5 pts)**

- Track when exercise completed:
  - Video: >80% watched
  - Material: Read (scrolled to bottom)
  - Quiz: Passed (≥70% score)
  - Assignment: Submitted
- Store completion timestamp per exercise
- Mark exercise with checkmark
- API: `POST /api/exercises/:id/complete`

**7.2: Lesson Completion Tracking (5 pts)**

- Track lesson progress: "3/5 exercises complete"
- Auto-complete lesson when all exercises done
- Store lesson completion timestamp
- Mark lesson with checkmark
- API: `POST /api/lessons/:id/complete`

**7.3: Quiz Score Tracking (3 pts)**

- Record all quiz attempts (per exercise)
- Save best score per quiz exercise
- Track correctness per question
- API: `GET /api/exercises/:id/quiz/attempts`

**7.4: Assignment Status Tracking (3 pts)**

- Track: Not Submitted, Submitted, Graded, Late
- Display status badges (per assignment exercise)
- Link to submission details

**7.5: Overall Progress Calculation (5 pts)**

- **Exercise Level:** (Completed Exercises / Total Exercises in Lesson) × 100
- **Lesson Level:** (Completed Lessons / Total Unlocked Lessons) × 100
- **Course Level:** (Completed Lessons / Total Lessons) × 100
- Update real-time as exercises/lessons complete
- Display on dashboard, course page, lesson page

**7.6: Progress Indicators (3 pts)**

- Progress bars (lesson level, course level)
- Exercise checkmarks (green when complete)
- Lesson checkmarks (green when all exercises complete)
- Percentage display: "Lesson 1: 3/5 exercises (60%)"

**7.7: Progress History (5 pts)**

- Timeline view of completed exercises & lessons
- Filterable by date, course, lesson
- Export CSV

**7.8: Certificate Generation (3 pts)**

- Trigger: 100% course completion (all lessons, all exercises)
- PDF certificate with:
  - Student name
  - Course title
  - Completion date
  - Certificate ID (for verification)
- Downloadable from dashboard
- API: `POST /api/courses/:id/certificate/generate`

---

## MODULE 8: XP & Leveling

**Priority:** 🟡 Medium | **Story Points:** 28 | **Sprint:** 14

### Purpose

Gamification through XP (experience points) and leveling system. Motivate students through visible progress.

### XP Earning Rules

- Complete video lesson: +10 XP
- Complete reading: +10 XP
- Complete quiz (pass): +15 XP
- Submit assignment: +20 XP
- Graded assignment: +50 XP
- Daily login: +5 XP
- Complete daily quest: +25 XP

### Leveling Formula

```
XP Required for Level N = 100 * N + 50 * (N - 1)

Level 1: 0 XP
Level 2: 150 XP
Level 3: 350 XP
Level 4: 600 XP
Level 5: 900 XP
...
Level 50: 125,000 XP
```

### Key Stories

**8.1: XP Earning Rules (5 pts)**

- Define XP per action
- Award XP on completion
- Store in database
- API: `POST /api/xp/earn`

**8.2: XP Calculation & Storage (5 pts)**

- Real-time XP updates
- Total XP per user
- XP history log

**8.3: Leveling System (8 pts)**

- Level thresholds table
- Auto-level-up when XP threshold reached
- Prevent level down (even if XP removed)
- API: `GET /api/users/:id/level`

**8.4: XP Display (5 pts)**

- Dashboard widget: "Level 5 - 450/900 XP"
- Progress bar to next level
- XP earned notification (toast)

**8.5: Level-Up Notifications (5 pts)**

- Congratulations modal
- Confetti animation
- "Level 6 Reached!" message
- Email notification (optional)

---

## MODULE 9: Badges & Achievements

**Priority:** 🟡 Medium | **Story Points:** 30 | **Sprint:** 14-15

### Purpose

Award badges for milestones. Display in profile, add collectibility aspect.

### Badge Types

- **First Lesson** - Complete 1st lesson
- **10 Lessons** - Complete 10 lessons
- **50 Lessons** - Complete 50 lessons
- **Course Complete** - Finish a course (100%)
- **Quiz Master** - Pass 10 quizzes with 100%
- **Assignment Pro** - Submit 5 assignments on time
- **7 Day Streak** - Login 7 consecutive days
- **Speedster** - Complete course in <2 weeks
- **Perfectionist** - Complete course with 100% on all quizzes

### Key Stories

**9.1: Badge Definition (5 pts)**

- Define badge criteria
- Badge images (SVG/PNG)
- Badge metadata (name, description, rarity)
- Store in database

**9.2: Badge Unlocking Logic (8 pts)**

- Check criteria on every action
- Trigger badge unlock when criteria met
- Prevent duplicate unlocks
- API: `POST /api/badges/check`

**9.3: Badge Collection Display (5 pts)**

- Profile page: Grid of badges
- Earned badges: Color
- Locked badges: Grayscale + lock icon
- Tooltip: How to unlock

**9.4: Achievement Notifications (5 pts)**

- Badge unlock modal
- "You earned: First Lesson!" message
- Badge image displayed
- Share button (future)

**9.5: Rare Badges (7 pts)**

- Limited-time badges (e.g., "Early Bird" - first 100 students)
- Event badges (e.g., "Halloween 2025")
- Challenge badges (difficult criteria)
- Rarity tiers: Common, Rare, Epic, Legendary

---

## MODULE 10: Leaderboard & Competition

**Priority:** 🟡 Medium | **Story Points:** 35 | **Sprint:** 15

### Purpose

Competitive leaderboard based on weekly XP. League system for progression.

### League System

- **Ruby League** - New users (default)
- **Emerald League** - Top 20% promoted from Ruby
- **Diamond League** - Top 20% from Emerald
- **Platinum League** - Top 10% from Diamond
- **Champion League** - Top 5% from Platinum

Promotion/Demotion: Weekly reset (Sunday midnight)

### Key Stories

**10.1: Leaderboard Calculation (8 pts)**

- Weekly XP sum per user
- Reset every Sunday midnight (cron job)
- Calculate rankings (1st, 2nd, 3rd, ...)
- API: `GET /api/leaderboard?league=ruby&week=2025-W49`

**10.2: League System (8 pts)**

- Assign league to each user
- Promote top performers
- Demote bottom performers (optional, or stay in league)
- Store league history

**10.3: Class Leaderboard (5 pts)**

- Leaderboard filtered by class (classmates only)
- Useful for class competition
- API: `GET /api/leaderboard/class/:classId`

**10.4: Global Leaderboard (5 pts)**

- All students across all leagues
- Top 100 displayed
- Search for own rank

**10.5: Leaderboard UI (5 pts)**

- List view: Rank, Name, XP, Badge icon
- Highlight current user row (bold, different color)
- Top 3: Gold/Silver/Bronze medals
- Animations (climb/drop indicators)

**10.6: Weekly Reset (4 pts)**

- Cron job: Reset XP weekly
- Archive previous week's rankings
- Send email: "You finished #3 in Ruby League!"

---

## MODULE 11: Daily Quests & Streaks

**Priority:** 🟡 Medium | **Story Points:** 32 | **Sprint:** 15-16

### Purpose

Daily quests encourage daily activity. Streaks reward consistency.

### Quest Types

- **Complete 5 Exercises** - Any quiz/assignment (+25 XP)
- **Earn 50 XP** - From any activity (+25 XP bonus)
- **Watch 2 Videos** - Complete 2 video lessons (+20 XP)
- **Submit 1 Assignment** - On time (+30 XP)
- **Login Daily** - Just login (+5 XP)

Quests reset daily (midnight local time)

### Streak Rules

- **Streak Day:** User completes at least 1 quest or lesson
- **Streak Bonus:** Every 7 days, +50 XP bonus
- **Streak Broken:** Miss a day → reset to 0
- **Freeze:** (Future) Use "Streak Freeze" item to skip 1 day

### Key Stories

**11.1: Daily Quest Definition (5 pts)**

- Define quest types + criteria
- Daily reset logic
- Store in database

**11.2: Quest Progress Tracking (8 pts)**

- Real-time progress updates
- Example: "Complete 5 Exercises: 3/5 ✓"
- Check completion after each action
- API: `GET /api/quests/daily`

**11.3: Quest Completion & Rewards (5 pts)**

- Mark quest complete when criteria met
- Award XP bonus
- Toast notification: "Quest Complete! +25 XP"

**11.4: Streak Tracking (8 pts)**

- Track consecutive days with activity
- Store streak count per user
- Reset to 0 if day missed
- API: `GET /api/users/:id/streak`

**11.5: Streak Rewards (3 pts)**

- Every 7 days: +50 XP bonus
- Special badges: 30-day streak, 100-day streak
- Streak milestones celebrated

**11.6: Quest UI (3 pts)**

- Dashboard widget: Today's quests
- Progress bars per quest
- "Streak: 7 days 🔥" display

---

## MODULE 12: Class Creation & Setup

**Priority:** 🔴 Critical | **Story Points:** 40 | **Sprint:** 8-9

### Purpose

**CORE FEATURE**: Staff creates classes (group or private) for cohort-based learning. Super Admin can also create classes for administrative purposes.

### Class Types

- **Group Class:** 2-20 students (shared meetings, same package for all)
- **Private Class:** 1 student (1-on-1, flexible package)

### Core Business Rules

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLASS BUSINESS RULES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ONE MEETING = ONE LESSON (Fixed Relationship)               │
│     - Each meeting covers exactly 1 lesson                      │
│     - 10 meetings = access to 10 lessons                        │
│     - Package determines max lessons accessible                 │
│                                                                  │
│  2. PACKAGE IS AT CLASS LEVEL                                   │
│     - All students in a class share the same package            │
│     - Package set when class is created                         │
│     - Group class: Package cannot be changed after start        │
│     - Private class: Package can be upgraded anytime            │
│                                                                  │
│  3. ENROLLMENT RULES                                            │
│     - Group class: Students must enroll BEFORE class starts     │
│     - Group class: No mid-class enrollment allowed              │
│     - Private class: Can start anytime                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Stories

**12.1: Create Class (8 pts)**

- Form fields:
  - Class name (e.g., "RN101 - Batch 5")
  - Type: Group/Private
  - Course selection (dropdown)
  - Total meetings (manual input, e.g., 10, 15, 20, 30, 50)
    - This equals max lessons accessible (1:1 ratio)
  - Instructor assignment
  - Max capacity (for group, 2-20)
  - Enrollment deadline (required for group)
  - Start date, end date (optional)
  - Meeting schedule (e.g., "Mon & Thu, 7-9 PM")
- API: `POST /api/classes`
- **Authorization:** `staff`, `super_admin`
- Success: Class created, ID generated

**12.2: Class Configuration (8 pts)**

- Edit class details
- Change instructor (reassign)
- Adjust capacity (group only, before class starts)
- Set schedule
- **Note:** Total meetings cannot be changed for group class after enrollment starts

**12.3: Instructor Assignment (5 pts)**

- Dropdown: List of instructors (role: instructor)
- One instructor per class (for MVP)
- Future: Multiple instructors (co-teaching)
- API: `PUT /api/classes/:id/instructor`

**12.4: Class Schedule (5 pts)**

- Define meeting days/times
- Stored in database, displayed on class detail page
- Future: Sync with calendar (Google Calendar, iCal)

**12.5: Class Status Management (5 pts)**

- Statuses:
  - **Draft** - Being set up (not visible to students)
  - **Enrollment Open** - Accepting student enrollments (group only)
  - **Active** - Class started, ongoing meetings (no new enrollments for group)
  - **Completed** - All meetings done (archived)
  - **Cancelled** - Cancelled (no longer active)
- Status transitions:
  - Draft → Enrollment Open (group) or Active (private)
  - Enrollment Open → Active (when class starts or deadline reached)
  - Active → Completed (when all meetings done)
- API: `PATCH /api/classes/:id/status`

**12.6: Class Duplication (5 pts)**

- "Duplicate Class" button
- Creates copy with same settings
- New batch number (e.g., Batch 5 → Batch 6)
- Useful for recurring classes
- Duplicated class starts in Draft status

**12.7: Class Deletion (3 pts)**

- Soft delete (mark as deleted, don't remove from DB)
- Confirmation: "Delete class? All enrollments will be archived."
- Only allow if no active students (or force delete with warning)

**12.8: Class List View (3 pts)**

- Staff page: `/staff/classes`
- List all classes (table or cards)
- Filter by: Status, Instructor, Course
- Sort by: Start date, Name
- Actions: Edit, View, Delete
- **Note:** Super Admin can access via `/super-admin/classes`

**12.9: Meeting & Lesson Tracking (3 pts)**

- Track meetings: Total, Completed, Scheduled, Remaining
- Track lessons: Unlocked, Total in Course
- Display: "8/20 meetings completed" and "8/20 lessons unlocked"
- Meetings completed should match lessons unlocked (1:1)

---

## MODULE 13: Student Assignment to Classes

**Priority:** 🔴 Critical | **Story Points:** 35 | **Sprint:** 9

### Purpose

Staff assigns students to classes after purchase. Includes bulk assignment tools. Super Admin can also assign students.

### Enrollment Rules by Class Type

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENROLLMENT RULES                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GROUP CLASS:                                                    │
│  ├── ✅ Can enroll during "Enrollment Open" status              │
│  ├── ❌ Cannot enroll after class status is "Active"            │
│  ├── ❌ Cannot join mid-class (after first meeting)             │
│  ├── ✅ All students get same package (class-level)             │
│  └── ✅ Can transfer to another group (same package or higher)  │
│                                                                  │
│  PRIVATE CLASS:                                                  │
│  ├── ✅ Can create and start anytime                            │
│  ├── ✅ Package is flexible (student negotiates)                │
│  ├── ✅ Can add more meetings anytime (upgrade)                 │
│  └── ❌ Cannot transfer (only 1 student)                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Stories

**13.1: Assign Student to Class (5 pts)**

- From Quick Enrollment Tool (Module 19)
- Or from class roster page: "Add Student" button
- Select student (dropdown or search)
- Select class
- **Validation for Group Class:**
  - Check class status is "Enrollment Open" or "Draft"
  - If status is "Active": Block enrollment with error message
  - Error: "Cannot enroll in active class. Enrollment deadline has passed."
- Confirm assignment
- API: `POST /api/classes/:id/enrollments`
- **Authorization:** `staff`, `super_admin`
- Result: Student enrolled, can access class

**13.2: Bulk Student Assignment (8 pts)**

- Upload CSV file (columns: Name, Email, Class)
- Validate data
- **Group class validation:** All target classes must be in "Enrollment Open" status
- Create enrollments in batch
- Success summary: "25 students enrolled"
- Error report: "3 errors (duplicate emails, 2 errors: class not accepting enrollments)"
- API: `POST /api/classes/enrollments/bulk`

**13.3: Transfer Student Between Classes (5 pts)**

- Move student from Class A to Class B
- **Group class restrictions:**
  - Can only transfer to class with same or higher package
  - Target class must be in "Enrollment Open" status OR be a new private class
  - Cannot transfer to active group class
- Preserve progress (lessons completed carry over if applicable)
- Notify student via email
- API: `POST /api/classes/:id/enrollments/:enrollmentId/transfer`

**13.4: Remove Student from Class (3 pts)**

- "Withdraw" student from class
- Confirmation: "Remove student? Progress will be archived."
- Student loses access to class
- API: `DELETE /api/classes/:id/enrollments/:enrollmentId`

**13.5: Class Capacity Enforcement (5 pts)**

- Check capacity before assignment
- If full (e.g., 20/20 students):
  - Block assignment
  - Error: "Class is full. Max capacity: 20 students"
- Allow override (staff/super_admin can force enroll)

**13.6: Enrollment Validation (5 pts)**

- Prevent duplicate enrollment (same student, same class)
- Check if student already enrolled in overlapping class (same course, different class)
- Warning: "Student already enrolled in RN101 - Batch 4. Continue?"
- **Group class:** Check class status allows enrollment

**13.7: Student Class History (4 pts)**

- View all classes student has been in (past + current)
- Display: Class name, Dates, Status, Progress, Grade
- Useful for staff/instructor/super_admin reference

**13.8: Continue as Private (New - 5 pts)**

- When group class package is exhausted, student wants to continue:
- Staff creates NEW private class for the student
- Select same course
- Set remaining lessons as package (e.g., course has 50 lessons, completed 20, new private = 30 meetings)
- Student pays private rate
- Link enrollment history to show continuation
- API: `POST /api/classes/continue-as-private`

---

## MODULE 14: Class Roster & Monitoring

**Priority:** 🟠 High | **Story Points:** 55 | **Sprint:** 10

### Purpose

Instructor/Staff views class roster, monitors student progress, tracks attendance with credit-based system. Super Admin has full access.

### Credit-Based Attendance System

```
┌─────────────────────────────────────────────────────────────────┐
│                    CREDIT-BASED ATTENDANCE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CONCEPT:                                                       │
│  ├── Each enrollment has meeting_credits (= class.total_meetings)│
│  ├── Credits represent paid meetings student can attend          │
│  ├── Attendance affects credit balance                          │
│                                                                  │
│  ATTENDANCE IMPACT:                                             │
│  ├── Present → Credit -1 (used)                                 │
│  ├── Late    → Credit -1 (used)                                 │
│  ├── Absent  → Credit unchanged (saved for later)               │
│                                                                  │
│  REMAINING CREDITS:                                             │
│  ├── Student absent → Still has credits remaining               │
│  ├── Can be used for makeup/replacement class later             │
│  ├── Instructor can manually adjust credits                     │
│  └── Staff/Admin can also adjust credits                        │
│                                                                  │
│  EXAMPLE:                                                       │
│  ├── Package: 10 meetings → 10 credits                          │
│  ├── Attended: 8 meetings → 8 credits used                      │
│  ├── Absent: 2 meetings → 2 credits remaining                   │
│  └── Student can use 2 remaining credits for makeup later       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Stories

**14.1: Class Roster View (5 pts)**

- Instructor page: `/instructor/classes/:id/roster`
- Staff page: `/staff/classes/:id/roster`
- Table view: All students in class
- Columns:
  - Name, Email, Avatar
  - Progress (%)
  - Attendance (e.g., "8/10 meetings")
  - Credits Remaining (e.g., "2 credits")
  - Last Active (timestamp)
  - Status (Active, Inactive)
  - Actions (View Profile, Edit Credits, Message)
- Sortable, searchable
- Color-coded credits: Green (0), Yellow (1-2), Red (3+)

**14.2: Student Progress in Class (8 pts)**

- Per-student progress bars
- Show: Lessons completed / Total unlocked
- Color-coded: Green (>70%), Yellow (40-70%), Red (<40%)
- Click student → detailed progress view

**14.3: Class Analytics (8 pts)**

- Aggregate stats:
  - Average completion: 65%
  - Students at risk: 3 (falling behind)
  - Avg quiz score: 78%
  - Attendance rate: 85%
  - Total credits remaining: 5 (across all students)
- Charts: Progress over time, Quiz scores distribution
- API: `GET /api/classes/:id/analytics`

**14.4: Attendance Tracking with Credits (13 pts)**

- **Take Attendance Interface:**
  - Button: "Take Attendance" on class page
  - Modal shows: Meeting number, Date, List of students
  - Per student: Radio buttons (Present, Absent, Late)
  - Show credit impact: "Present = -1 credit, Absent = no change"
  - Submit → Records attendance + updates credits
- **Credit Impact Rules:**
  - Present → `credits_used += 1`
  - Late → `credits_used += 1`
  - Absent → `credits_used` unchanged (credit saved)
- **Attendance History:**
  - View all past attendance records per class
  - Filter by meeting, date, student
  - Edit past attendance (with audit log)
- **API Endpoints:**
  - `POST /api/classes/:id/attendance` - Take attendance for a meeting
  - `GET /api/classes/:id/attendance` - Get attendance history
  - `PUT /api/classes/:id/attendance/:meetingNumber` - Edit attendance

**14.5: Credit Management (8 pts)**

- **View Credits:**
  - Display per student: "Credits: 2 remaining (8/10 used)"
  - Show in roster table and student detail modal
- **Manual Credit Adjustment:**
  - Instructor/Staff can adjust student's credits
  - Use cases:
    - Student attended makeup class → Deduct credit
    - Refund/compensation → Add credit
    - Error correction → Adjust credit
  - Interface: "Adjust Credit" button → Modal
    - Current credits display
    - Adjustment input (+/- number)
    - Reason (required): Dropdown + text field
      - "Attended makeup class"
      - "Refund"
      - "Error correction"
      - "Other" (requires text)
  - All adjustments logged with timestamp, user, reason
- **Credit History:**
  - View all credit changes for a student
  - Shows: Date, Change (+/-), Reason, Adjusted by
  - Useful for audit and disputes
- **API Endpoints:**
  - `GET /api/enrollments/:id/credits` - Get credit balance
  - `POST /api/enrollments/:id/credits/adjust` - Adjust credits
  - `GET /api/enrollments/:id/credits/history` - Get credit history

**14.6: Roster Export (3 pts)**

- Export class roster to CSV or PDF
- Includes: Name, Email, Progress, Attendance, Credits Remaining
- Useful for reporting

**14.7: Student Details Modal (5 pts)**

- Click student in roster → modal opens
- Shows:
  - Full profile
  - Progress (lessons, exercises)
  - Attendance summary (present/absent/late counts)
  - Credit balance and history
  - Grades
  - Contact info
- Quick actions: Message, Adjust Credits, View submissions

**14.8: Class Communication (3 pts)**

- Broadcast announcement to all students in class
- Email sent to all
- Future: In-app notifications

**14.9: Attendance Report (5 pts)**

- Generate attendance report per class
- Summary: Total meetings, Average attendance rate
- Per student: Attendance count, Credit balance
- Export to CSV/PDF
- API: `GET /api/classes/:id/attendance/report`

---

## MODULE 15: Progressive Lesson Unlocking

**Priority:** 🔴 Critical | **Story Points:** 45 | **Sprint:** 10-11

### Purpose

**CORE DIFFERENTIATOR**: Instructor manually unlocks lessons for class after each meeting. Students can only access unlocked lessons (based on class package). Unlocking a lesson unlocks all exercises within it.

### Core Concept: 1 Meeting = 1 Lesson

```
┌─────────────────────────────────────────────────────────────────┐
│              MEETING-LESSON RELATIONSHIP                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FIXED 1:1 RATIO:                                               │
│  ├── 1 Meeting (live session) = 1 Lesson unlocked              │
│  ├── 10 Meetings package = Max 10 lessons accessible           │
│  ├── 20 Meetings package = Max 20 lessons accessible           │
│  └── 50 Meetings package = Max 50 lessons accessible           │
│                                                                  │
│  WORKFLOW:                                                       │
│  ├── Instructor conducts Meeting #1                             │
│  ├── After meeting, Instructor unlocks Lesson 1                 │
│  ├── Students can now access Lesson 1 (all exercises inside)   │
│  └── Repeat for each meeting                                    │
│                                                                  │
│  PACKAGE LIMIT = CLASS LEVEL:                                   │
│  ├── Group class: All students share same limit                 │
│  ├── Private class: Individual limit, can be upgraded           │
│  └── Limit enforced when instructor tries to unlock             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Unlocking Logic

- **Package-based limits (at CLASS level):**
  - 10 meetings → Can unlock max 10 lessons (all exercises within those 10 lessons)
  - 20 meetings → Can unlock max 20 lessons
  - 50 meetings → Can unlock all 50 lessons
- **Manual unlock:** Instructor clicks "Unlock Lesson X" after each meeting
- **Progressive:** Can't skip ahead (must unlock in order)
- **Lesson = Container:** When lesson unlocked, all exercises inside are accessible
- **1:1 Enforcement:** Lessons unlocked should not exceed meetings completed

### Example

```
Course: "101 React Native" (50 lessons total)
Class: RN101-Batch5 (Group, 4 students, 10 meetings package)

Meeting 1 completed:
  → Instructor unlocks Lesson 1 for the CLASS
  → All 4 students can access Lesson 1:
    - Exercise 1: Welcome Video ✓ accessible
    - Exercise 2: Quiz - Basics ✓ accessible
    - Exercise 3: Setup Guide ✓ accessible
    - Exercise 4: Assignment ✓ accessible

Meetings 2-10 completed:
  → 10 lessons unlocked for ALL students in class
  → Lessons 11-50 remain locked
  → Package limit reached

Students want to continue:
  → Group class: Cannot upgrade existing class
  → Option: Create new PRIVATE class for individual students
  → Private class can have remaining 40 lessons as package
```

### Key Stories

**15.1: Unlock Logic & Rules (8 pts)**

- Check package limit before unlocking
- Example: 10x package, 9 lessons unlocked → can unlock 1 more
- If limit reached:
  - Block unlock
  - Show message: "Package limit reached (10/10). Student must upgrade."
  - Display "Upgrade Package" link
- Unlocking lesson = unlocking all exercises inside
- API: `POST /api/classes/:id/unlock-lesson`

**15.2: Instructor Unlock Controls (8 pts)**

- Instructor page: Class detail → Course Structure
- Each lesson shows:
  - 🔓 Unlocked (green) - "Lesson 1: 5 exercises" (clickable)
  - 🔒 Locked (gray) - "Lesson 2: 3 exercises" (not clickable)
  - "Unlock" button (if locked, within limit)
  - "Lock" button (if unlocked, to revert - rare)
- Click "Unlock Lesson 5":
  - Confirmation: "Unlock Lesson 5 (with 4 exercises) for all students in this class?"
  - Confirm → Lesson + all exercises unlocked for entire class
  - Success toast: "Lesson 5 unlocked! Email sent to 15 students."

**15.3: Bulk Unlock (5 pts)**

- "Unlock Multiple Lessons" button
- Checkbox list of locked lessons (shows exercise count per lesson)
- Select 3 lessons, click "Unlock Selected"
- Useful for unlocking several lessons at once (e.g., after break)
- Confirmation: "Unlock 3 lessons (12 exercises total)?"

**15.4: Student Locked View (5 pts)**

- Student sees locked lessons in course syllabus
- Lock icon 🔒 next to lesson title
- Shows exercise count: "Lesson 5: 4 exercises 🔒"
- Tooltip: "This lesson will be unlocked by your instructor"
- Grayed out, not clickable
- No exercise preview

**15.5: Student Unlocked View (3 pts)**

- Unlocked lessons: Open padlock or checkmark icon
- Shows exercise count: "Lesson 1: 5 exercises ✓"
- Shows progress: "3/5 exercises complete (60%)"
- Clickable → can access lesson and all exercises
- Notification appears when lesson unlocked (in-app + email)

**15.6: Unlock Notifications (8 pts)**

- **Email:**
  - Subject: "New Lesson Unlocked: [Lesson Title]"
  - Body: "Your instructor has unlocked Lesson 5 (4 exercises). [Link to lesson]"
  - Sent to all students in class
- **In-App:**
  - Toast notification: "Lesson 5 unlocked! 4 new exercises available."
  - Bell icon badge (notification count)
- API: `POST /api/notifications/send` (integrated with Module 23)

**15.7: Unlock History (5 pts)**

- Audit log: When each lesson was unlocked
- Table: Lesson, Exercise Count, Unlocked By, Unlocked At, Class
- Useful for troubleshooting, reporting
- API: `GET /api/classes/:id/unlock-history`

**15.8: Package Limit Warnings (3 pts)**

- Instructor dashboard widget:
  - "Class RN101-Batch5: 9/10 lessons unlocked (1 remaining)"
  - "Total exercises unlocked: 38 across 9 lessons"
  - Color-coded: Green (plenty left), Yellow (2-3 left), Red (0-1 left)
- Encourages instructor to remind students to upgrade

**15.9: Exercise-Level Access Control (5 pts)**

- Backend validates: When student tries to access exercise, check if parent lesson is unlocked
- If lesson locked → Block access to all exercises inside
- If lesson unlocked → Allow access to all exercises
- Frontend: Show all exercises in unlocked lessons, hide exercises in locked lessons

---

## MODULE 16: Instructor Dashboard

**Priority:** 🟠 High | **Story Points:** 32 | **Sprint:** 7

### Purpose

Instructor's command center. View classes, students, pending tasks.

### Key Stories

**16.1: Dashboard Overview (8 pts)**

- Page: `/instructor/dashboard`
- Widgets:
  - **My Classes** - List of active classes (3-5 classes)
  - **Pending Tasks** - Assignments to grade (count badge)
  - **Student Stats** - Total students taught, Avg completion rate
  - **Upcoming Meetings** - Next scheduled class sessions
- Quick actions: Grade Assignments, Unlock Lesson, Message Students

**16.2: Class List (5 pts)**

- Table: All classes instructor is assigned to
- Columns: Class name, Course, Students, Progress, Status
- Click class → class detail page

**16.3: Class Selection (3 pts)**

- Dropdown: Switch between classes
- Selected class persists (stored in session/state)
- All class-specific pages use selected class

**16.4: Teaching Analytics (8 pts)**

- Total students taught: 47
- Total classes: 5 (3 active, 2 completed)
- Avg course completion: 72%
- Avg assignment grade: 81%
- Charts: Student progress over time

**16.5: Schedule Management (5 pts)**

- Calendar view: Upcoming class meetings
- Integration with class schedule (from Module 12)
- Mark meetings complete, track attendance

**16.6: Quick Actions (3 pts)**

- Shortcut buttons:
  - "Grade Next Assignment" → pending submissions queue
  - "Unlock Next Lesson" → class detail page
  - "Message Students" → email compose

---

## MODULE 17: Grading & Feedback

**Priority:** 🟠 High | **Story Points:** 38 | **Sprint:** 11

### Purpose

Instructor grades assignments efficiently. Bulk grading tools.

### Key Stories

**17.1: Pending Assignments Queue (5 pts)**

- Page: `/instructor/grading`
- List of submissions awaiting grading
- Filter: By class, By assignment, By date
- Sort: Oldest first, Newest first
- Each entry: Student name, Assignment, Submitted date, "Grade" button

**17.2: Grading Interface (8 pts)**

- Detailed in Module 5, Story 2.3.5
- View submission, Enter score, Provide feedback
- Rubric-based grading (if rubric exists)
- "Submit Grade" button

**17.3: Score Assignment (5 pts)**

- Numeric score input (e.g., 85/100)
- Validation: Score ≤ max score
- Auto-calculate from rubric (if used)

**17.4: Feedback System (8 pts)**

- Rich text editor for feedback
- Supports: Bold, italic, lists, links
- Template feedback (pre-written comments for common issues)
- Example: "Great job! However, consider improving [...]"

**17.5: Bulk Grading (8 pts)**

- Select multiple submissions (checkboxes)
- "Grade Selected" button
- Apply same score + feedback to all
- Useful for participation assignments (all get 100/100)
- Confirmation: "Grade 15 submissions with 100/100?"

**17.6: Grading History (4 pts)**

- View all graded assignments (past)
- Filter: By student, By assignment, By date
- Useful for re-evaluating, audit

---

## MODULE 18: Student Monitoring

**Priority:** 🟠 High | **Story Points:** 35 | **Sprint:** 12

### Purpose

Instructor monitors student progress, identifies at-risk students.

### Key Stories

**18.1: Individual Student Progress View (8 pts)**

- Click student in roster → detailed progress page
- Shows: All lessons (complete/incomplete), Quiz scores, Assignment grades
- Timeline: Activity history
- Useful for 1-on-1 discussions

**18.2: At-Risk Student Detection (8 pts)**

- Algorithm:
  - No activity in 7+ days → At risk
  - Progress <30% after 4 weeks → At risk
  - Multiple failed quizzes → At risk
- Dashboard alert: "3 students at risk"
- List: Students flagged as at-risk
- Recommended action: Message student, Offer help

**18.3: Student Communication (5 pts)**

- "Message Student" button (opens email compose)
- Pre-fill: Student's email, Subject (Re: [Class name])
- Send email directly from LMS
- Future: In-app messaging

**18.4: Progress Reports (8 pts)**

- Generate PDF report per student
- Includes: Progress %, Grades, Attendance, Feedback
- Useful for parent meetings, progress reviews
- API: `GET /api/classes/:id/students/:studentId/report`

**18.5: Student Activity Timeline (6 pts)**

- Chronological view: Logins, Lessons, Quizzes, Submissions
- Visualize engagement patterns
- Identify drop-offs

---

## MODULE 19: Enrollment Management

**Priority:** 🔴 Critical | **Story Points:** 42 | **Sprint:** 12-13

### Purpose

Admin enrolls students quickly after WhatsApp purchase. Bulk enrollment tools.

### Key Stories

**19.1: Quick Enrollment Tool (13 pts)**

- **Detailed in Module 2, Story 1.2.3**
- Form: Name, Email, Phone, Class, Package, Payment Status
- Click "Create & Enroll" → User created + Enrolled + Email sent
- Time: 5 minutes per student (vs 15 min manual)

**19.2: Bulk Enrollment (8 pts)**

- Upload CSV: Name, Email, Class, Package
- Validate rows
- Create users in batch
- Success: "20 students enrolled"
- Errors: "2 duplicates skipped"

**19.3: Enrollment History (5 pts)**

- Log all enrollments (audit trail)
- Table: Student, Class, Enrolled By (staff name), Date
- Filter: By date, By staff member, By class
- Export CSV

**19.4: Enrollment Verification (5 pts)**

- After WhatsApp purchase, staff verifies payment
- Mark payment as "Verified" (from Module 20)
- Then enroll student
- Prevent enrollment without verified payment

**19.5: Pre-fill from Payment Tracking (8 pts)**

- Payment Tracking Dashboard (Module 20) lists payments
- Click "Enroll" button next to payment record
- Quick Enrollment Tool opens with data pre-filled
- Staff reviews and submits

**19.6: Enrollment Analytics (3 pts)**

- Daily/weekly/monthly enrollment trends
- Chart: Enrollments over time
- Total enrollments: 47 this month

---

## MODULE 20: Payment Tracking

**Priority:** 🟠 High | **Story Points:** 40 | **Sprint:** 13

### Purpose

Staff tracks WhatsApp payments manually (for MVP). Mark as verified, link to enrollments. Super Admin has full access.

### Key Stories

**20.1: Payment Record Management (8 pts)**

- Page: `/staff/payments`
- **Authorization:** `staff`, `super_admin`
- Add payment record manually:
  - Student name, Email, Phone
  - Course, Package (flexible meeting count)
  - Amount (Rupiah)
  - Payment method (Bank Transfer, E-wallet, Cash)
  - Payment ref (transaction ID)
  - Status: Pending, Verified, Refunded
  - Notes (optional)
- API: `POST /api/payments`

**20.2: Payment Verification (5 pts)**

- Mark payment as "Verified" (checked bank statement)
- Button: "Mark as Verified"
- Verification timestamp recorded
- Verified by: Staff user ID

**20.3: Payment Status Tracking (5 pts)**

- Statuses:
  - **Pending** - Awaiting verification (yellow)
  - **Verified** - Confirmed payment (green)
  - **Refunded** - Money returned (red)
- Status badge in table

**20.4: Payment Search & Filter (5 pts)**

- Search: By name, email, ref
- Filter: By status, By date range, By package
- Sort: Newest first, Amount (high/low)

**20.5: Payment Analytics (8 pts)**

- Total revenue: Rp 45,000,000 (this month)
- Pending payments: 5 (Rp 7,500,000)
- Verified payments: 20 (Rp 37,500,000)
- Charts: Revenue over time, Revenue by package

**20.6: Export & Reports (5 pts)**

- Export CSV: All payments (for accounting)
- Columns: Date, Name, Amount, Status, Ref
- Filter before export (date range)

**20.7: Payment Reminders (4 pts)**

- Auto-reminder: If payment pending >3 days
- Email to student: "Payment confirmation needed"
- Staff dashboard alert: "5 pending payments"

---

## MODULE 21: User Management

**Priority:** 🟠 High | **Story Points:** 35 | **Sprint:** 13-14

### Purpose

**Super Admin** manages all users (staff, instructors, students). **Staff** can view/edit student profiles only.

### Access Levels

- **Super Admin:** Full access (create/edit staff, instructors, students)
- **Staff:** View/edit students only (read-only for instructors)

### Key Stories

**21.1: User Search & Filter (8 pts)**

- Super Admin page: `/super-admin/users`
- Staff page: `/staff/students` (students only)
- Search: By name, email
- Filter: By role (for super_admin), By status (Active, Inactive)
- Results: Table with Name, Email, Role, Status, Created date
- **Authorization:** `super_admin` (all users), `staff` (students only)

**21.2: User Profile Management (8 pts)**

- Click user → profile page
- View: Full profile, Enrollments, Activity log
- Edit: Name, Email, Avatar, Bio
- API: `PUT /api/users/:id`

**21.3: Role Assignment (5 pts)**

- **Super Admin only**
- Change user role (dropdown: Student, Instructor, Staff, Super Admin)
- Example: Promote student to instructor, Create staff account
- Confirmation: "Change role to Instructor?"
- Updates permissions immediately
- **Authorization:** `super_admin` only

**21.4: User Deactivation (5 pts)**

- "Deactivate Account" button
- Confirmation: "Deactivate user? They will lose access."
- Soft delete (mark as inactive, don't delete data)
- Can reactivate later

**21.5: User Activity Log (5 pts)**

- View user's activity history:
  - Logins, Lessons, Submissions, Enrollments
- Useful for troubleshooting, support

**21.6: User Export (4 pts)**

- Export user list to CSV
- Columns: Name, Email, Role, Status, Enrollments
- Filter before export

---

## MODULE 22: System Analytics

**Priority:** 🟡 Medium | **Story Points:** 38 | **Sprint:** 14

### Purpose

**Super Admin** views business intelligence. Enrollment trends, revenue, course performance, platform-wide analytics.

**Authorization:** `super_admin` only (sensitive business data)

### Key Stories

**22.1: Enrollment Analytics (8 pts)**

- Charts: Enrollments over time (daily, weekly, monthly)
- Total enrollments: 150 (all time), 20 (this month)
- Trends: Growing, Steady, Declining
- API: `GET /api/analytics/enrollments`

**22.2: Revenue Tracking (8 pts)**

- Total revenue: Rp 150,000,000 (all time)
- Revenue by course: RN101 (Rp 50M), RN102 (Rp 30M)
- Revenue by package: Distribution across different meeting counts
- Revenue by instructor: John (Rp 40M), Jane (Rp 35M)
- Charts: Revenue over time, Package distribution

**22.3: Course Performance (8 pts)**

- Per-course metrics:
  - Total enrollments
  - Avg completion rate
  - Avg quiz score
  - Student satisfaction (rating)
- Compare courses (which is most popular?)
- API: `GET /api/analytics/courses/:id`

**22.4: Instructor Performance (8 pts)**

- Per-instructor metrics:
  - Total students taught
  - Total classes taught
  - Avg student completion rate
  - Avg student rating (future)
- Useful for performance reviews
- API: `GET /api/analytics/instructors/:id`

**22.5: Dashboard Visualizations (6 pts)**

- Interactive charts (Chart.js, Recharts)
- Line charts, Bar charts, Pie charts
- Date range selector (last 7 days, 30 days, 3 months, all time)

---

## MODULE 23: Email Notifications

**Priority:** 🔴 Critical | **Story Points:** 35 | **Sprint:** 2

### Purpose

Send transactional emails for key events. Welcome, Course added, Lesson unlocked, etc.

### Email Service Options

- **Resend** (recommended, modern API)
- **SendGrid** (popular, reliable)
- **AWS SES** (cost-effective, scalable)

### Email Templates

1. **Welcome Email** (new user)
   - Subject: "Welcome to LMS Baby Owl"
   - Content: Greeting, Set password link, Get started steps

2. **Course Added** (after enrollment)
   - Subject: "You're enrolled in [Course Name]"
   - Content: Course info, First lesson link, Instructor info

3. **Lesson Unlocked**
   - Subject: "New Lesson Unlocked: [Lesson Title]"
   - Content: Lesson title, Start lesson link, Encouragement

4. **Assignment Due Soon** (3 days before)
   - Subject: "Reminder: [Assignment] due in 3 days"
   - Content: Assignment title, Due date, Submit link

5. **Assignment Graded**
   - Subject: "Your assignment has been graded"
   - Content: Grade, Feedback excerpt, View full feedback link

6. **Certificate Earned**
   - Subject: "Congratulations! You completed [Course Name]"
   - Content: Congrats message, Certificate download link

### Key Stories

**23.1: Email Service Integration (8 pts)**

- Setup API keys (Resend/SendGrid/SES)
- Configuration: Sender email, Domain verification
- Test email sending
- API wrapper: `emailService.send()`

**23.2: Email Templates (8 pts)**

- Design HTML templates (responsive, branded)
- Variables: {{name}}, {{courseTitle}}, {{link}}
- Template storage: Database or files
- Preview tool (test templates)

**23.3: Triggered Emails (8 pts)**

- Event-based automation:
  - User created → Send welcome email
  - Enrolled → Send course added email
  - Lesson unlocked → Send unlock email
  - Assignment graded → Send graded email
- Queue system (background jobs)
- Retry logic (if send fails)

**23.4: Email Delivery Tracking (5 pts)**

- Track email status: Sent, Delivered, Opened, Clicked
- Webhook from email service (delivery confirmation)
- Store delivery status in database
- Dashboard: Email delivery stats

**23.5: Email Retry Logic (3 pts)**

- If send fails (network error, rate limit):
  - Retry 3 times (exponential backoff)
  - Log error if all retries fail
  - Admin alert: "Email sending failed"

**23.6: Unsubscribe Management (3 pts)**

- "Unsubscribe" link in emails (legal requirement)
- User preferences: Which emails to receive
- Opt-out handling (don't send if unsubscribed)

---

## MODULE 24: WhatsApp Integration

**Priority:** 🟠 High | **Story Points:** 25 | **Sprint:** 13

### Purpose

Enable students to purchase via WhatsApp (wa.me deep link). Pre-fill messages.

### WhatsApp Deep Link Format

```
https://wa.me/6281234567890?text=Hi!%20I'm%20interested%20in%20[Course]
```

### Key Stories

**24.1: WhatsApp Deep Links (5 pts)**

- Generate wa.me links with phone number
- Phone number: From settings (admin config)
- Example: `https://wa.me/6281234567890`

**24.2: Pre-filled Messages (8 pts)**

- Template message:

  ```
  Hi! I'm interested in the course:
  [Course Title]

  Package: [X meetings] (as configured for the class)
  Name: [User Name]
  Email: [User Email]

  Please let me know the payment details.
  ```

- URL encode message
- Variables: Course, Package, User info (if logged in)

**24.3: Purchase Initiation Flow (8 pts)**

- Course catalog → Course detail page
- "Buy via WhatsApp" button
- If logged in: Pre-fill name + email
- If not logged in: Generic message
- Click button → Opens WhatsApp (new tab)
- User sends message to admin/staff

**24.4: WhatsApp Button Component (4 pts)**

- Reusable React component: `<WhatsAppButton />`
- Props: phone, message, buttonText
- Styling: Green button with WhatsApp icon
- Used across: Course catalog, Course detail, Dashboard

---

## MODULE 25: Package & Upgrade Management

**Priority:** 🟠 High | **Story Points:** 40 | **Sprint:** 16

### Purpose

Define packages with flexible meeting counts (manual input). Handle upgrade scenarios differently for group vs private classes. Upsell notifications.

### Package Definition

- **10 Meetings:** Access to first 10 lessons, Rp 1,500,000
- **20 Meetings:** Access to first 20 lessons, Rp 2,500,000
- **30 Meetings:** Access to first 30 lessons, Rp 3,500,000
- **50 Meetings:** Access to all 50 lessons, Rp 5,000,000
- **Custom:** Staff can input any number (manual)

### Upgrade Rules by Class Type

```
┌─────────────────────────────────────────────────────────────────┐
│                    UPGRADE RULES                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GROUP CLASS:                                                    │
│  ├── ❌ Cannot upgrade package within existing class            │
│  ├── Reason: All students must have same package                │
│  ├── ❌ Cannot add more meetings to group class                 │
│  └── ✅ Alternative: Create new PRIVATE class to continue       │
│                                                                  │
│  PRIVATE CLASS:                                                  │
│  ├── ✅ Can add more meetings anytime                           │
│  ├── ✅ Same class continues (no new class needed)              │
│  ├── Staff updates totalMeetings on the class                   │
│  └── Student pays difference                                     │
│                                                                  │
│  UPGRADE PATH (Group → Continue):                               │
│  ├── Group class package exhausted (e.g., 10/10 meetings done)  │
│  ├── Student wants to continue                                   │
│  ├── Staff creates NEW private class for this student           │
│  ├── Course: Same course                                         │
│  ├── Package: Remaining lessons (e.g., 40 more meetings)        │
│  ├── Student pays private rate                                   │
│  └── Progress from group class is preserved in history          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Stories

**25.1: Package Definition (8 pts)**

- Packages stored at CLASS level (not separate table)
- Staff inputs total meetings when creating class
- Meetings count = Max lessons accessible (1:1 ratio)
- Price calculated based on meetings count
- API: `GET /api/classes/:id` returns package info

**25.2: Package Display (5 pts)**

- Student sees current class package on dashboard
- Example: "Class Package: 20 Meetings (18/20 lessons unlocked)"
- Color-coded: Green (plenty left), Yellow (3-5 left), Red (0-2 left)
- Show different message for group vs private:
  - Group: "Contact us to continue as private class"
  - Private: "Add more meetings to continue"

**25.3: Group Class - Continue as Private (8 pts)**

- When group class package is exhausted:
- Student clicks "Continue Learning" button
- Opens WhatsApp with message:

  ```
  Hi! I'd like to continue learning [Course Name].

  My group class (RN101-Batch5) has completed all 10 meetings.
  I'd like to continue with a private class.

  Lessons remaining: 40
  Please let me know the pricing and schedule options.
  ```

- Student sends message
- Staff creates NEW private class (Story 25.4)

**25.4: Staff Creates Continuation Private Class (8 pts)**

- Staff navigates to student's enrollment
- Click "Continue as Private" button
- System pre-fills:
  - Course: Same course
  - Type: Private
  - Suggested meetings: Remaining lessons count
- Staff confirms and creates class
- Student is enrolled in new private class
- API: `POST /api/classes/continue-as-private`
- Result: New private class created, student can continue learning

**25.5: Private Class - Add Meetings (5 pts)**

- For PRIVATE classes only
- Staff can add more meetings to existing class
- Navigate to class detail → "Add Meetings" button
- Enter additional meetings count (e.g., +10)
- System updates totalMeetings
- Student pays difference
- API: `PATCH /api/classes/:id/add-meetings`
- Result: Same class continues with higher limit

**25.6: Package Limits Enforcement (5 pts)**

- Instructor cannot unlock more lessons than package limit
- Example: 10 meetings class, 10 lessons unlocked → "Unlock" button disabled
- Error message differs by class type:
  - Group: "Package limit reached. Students can continue as private class."
  - Private: "Package limit reached. Add more meetings to continue."
- Link to appropriate action

**25.7: Upsell Notifications (6 pts)**

- When class approaches package limit (2 meetings left):
  - Toast notification: "2 meetings remaining in this class!"
  - Email: "Your class has 2 meetings left."
  - Dashboard banner (different by type):
    - Group: "Want to continue after this class? Contact us for private options."
    - Private: "Add more meetings to keep learning!"
- Target: 20-30% continuation rate

---

## 📊 Consolidated Summary

### Total Story Points (M07-M25): 667

| Module | Title                  | Points | Priority    | Sprint |
| ------ | ---------------------- | ------ | ----------- | ------ |
| M07    | Progress Tracking      | 32     | 🟠 High     | 5      |
| M08    | XP & Leveling          | 28     | 🟡 Medium   | 14     |
| M09    | Badges & Achievements  | 30     | 🟡 Medium   | 14-15  |
| M10    | Leaderboard            | 35     | 🟡 Medium   | 15     |
| M11    | Daily Quests & Streaks | 32     | 🟡 Medium   | 15-16  |
| M12    | Class Creation         | 40     | 🔴 Critical | 8-9    |
| M13    | Student Assignment     | 35     | 🔴 Critical | 9      |
| M14    | Class Roster & Credits | 55     | 🟠 High     | 10     |
| M15    | Lesson Unlocking       | 45     | 🔴 Critical | 10-11  |
| M16    | Instructor Dashboard   | 32     | 🟠 High     | 7      |
| M17    | Grading & Feedback     | 38     | 🟠 High     | 11     |
| M18    | Student Monitoring     | 35     | 🟠 High     | 12     |
| M19    | Enrollment Management  | 42     | 🔴 Critical | 12-13  |
| M20    | Payment Tracking       | 40     | 🟠 High     | 13     |
| M21    | User Management        | 35     | 🟠 High     | 13-14  |
| M22    | System Analytics       | 38     | 🟡 Medium   | 14     |
| M23    | Email Notifications    | 35     | 🔴 Critical | 2      |
| M24    | WhatsApp Integration   | 25     | 🟠 High     | 13     |
| M25    | Package Upgrades       | 40     | 🟠 High     | 16     |

---

## ✅ Next Steps for Complete PRD

### Option A: Expand Each Module into Separate Files

Similar to M01-M06, create detailed files for each module (M07-M25) with:

- Full user stories (10-20 pages each)
- Complete acceptance criteria
- Detailed API contracts
- Comprehensive test scenarios
- UI mockups

**Total pages:** ~400-500 pages

### Option B: Use This Consolidated Document

This consolidated document provides sufficient detail for:

- Sprint planning
- Story point estimation
- Technical specification (Module 2)
- Implementation

**Recommendation:** Start development with this consolidated doc. Expand specific modules into detailed files as needed during implementation.

---

**End of Modules 7-25 Consolidated Documentation**

_Return to: [User Stories Index](./1.0-USER-STORIES-INDEX.md) | [PRD Overview](../0-PRD-OVERVIEW.md)_
