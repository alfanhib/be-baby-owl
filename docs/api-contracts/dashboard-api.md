# Dashboard API Contract

Dokumentasi API contract untuk Dashboard endpoints. File ini digunakan sebagai referensi untuk backend development.

## Base URL

```
{API_BASE_URL}/dashboard
```

## Authentication

Semua endpoint memerlukan authentication dengan Bearer token di header:

```
Authorization: Bearer {token}
```

---

## 1. Get Dashboard Stats

**Endpoint:** `GET /dashboard/stats`

**Description:** Mengambil statistik dashboard (jumlah courses, assignments, monthly quests)

**Response:**

```json
{
  "success": true,
  "message": "Dashboard stats fetched successfully",
  "data": {
    "courses": {
      "current": 3,
      "total": 8
    },
    "assignments": {
      "current": 3,
      "total": 10
    },
    "monthlyQuests": {
      "current": 5,
      "total": 20
    }
  }
}
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `500` - Internal Server Error

---

## 2. Get Hour Spent Chart Data

**Endpoint:** `GET /dashboard/hour-spent`

**Description:** Mengambil data chart hour spent dengan categories dan data harian

**Response:**

```json
{
  "success": true,
  "message": "Hour spent data fetched successfully",
  "data": {
    "categories": [
      {
        "name": "UI/UX Design",
        "dotColor": "bg-purple-400",
        "color": "#C084FC",
        "stripeAngle": "0deg"
      },
      {
        "name": "Digital Marketing",
        "dotColor": "bg-cyan-400",
        "color": "#22D3EE",
        "stripeAngle": "45deg"
      },
      {
        "name": "Design Graphic",
        "dotColor": "bg-amber-400",
        "color": "#FBBF24",
        "stripeAngle": "90deg"
      }
    ],
    "data": [
      {
        "day": "Mon",
        "spent": [
          { "cat": "UI/UX Design", "hrs": 4.5 },
          { "cat": "Digital Marketing", "hrs": 2 }
        ]
      },
      {
        "day": "Tue",
        "spent": [
          { "cat": "UI/UX Design", "hrs": 3 },
          { "cat": "Digital Marketing", "hrs": 4 }
        ]
      }
      // ... days lainnya (Wed, Thu, Fri, Sat, Sun)
    ]
  }
}
```

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `500` - Internal Server Error

---

## 3. Get Dashboard Assignments

**Endpoint:** `GET /dashboard/assignments`

**Description:** Mengambil daftar assignments untuk dashboard

**Response:**

```json
{
  "success": true,
  "message": "Dashboard assignments fetched successfully",
  "data": [
    {
      "id": "assignment-1",
      "number": 1,
      "title": "Creating Logo",
      "subtitle": "Design Graphic",
      "icon": "assignment",
      "dueDate": "May 15",
      "score": null,
      "maxScore": 100,
      "status": "assigned"
    },
    {
      "id": "assignment-2",
      "number": 2,
      "title": "Tone of Voice",
      "subtitle": "Digital Marketing",
      "icon": "assignment",
      "dueDate": "May 7",
      "score": 95,
      "maxScore": 100,
      "status": "completed"
    }
  ]
}
```

**Field Descriptions:**

- `id`: Unique assignment identifier
- `number`: Assignment number/order
- `title`: Assignment title
- `subtitle`: Course name or category
- `icon`: Icon identifier (e.g., "assignment")
- `dueDate`: Due date in format "Month Day" (e.g., "May 15")
- `score`: Score value (null if not graded yet)
- `maxScore`: Maximum possible score
- `status`: Assignment status - `"assigned" | "completed" | "overdue" | "graded"`

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `500` - Internal Server Error

---

## 4. Get Ongoing Courses

**Endpoint:** `GET /dashboard/ongoing-courses`

**Description:** Mengambil daftar ongoing courses dengan progress

**Response:**

```json
{
  "success": true,
  "message": "Ongoing courses fetched successfully",
  "data": [
    {
      "id": "course-1",
      "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop",
      "title": "UI/UX Design",
      "lecturesCompleted": 23,
      "totalLectures": 40,
      "rating": 4.9,
      "reviewCount": 1500,
      "progress": 95
    }
  ]
}
```

**Field Descriptions:**

- `id`: Unique course identifier
- `image`: Course thumbnail image URL
- `title`: Course title
- `lecturesCompleted`: Number of completed lectures
- `totalLectures`: Total number of lectures
- `rating`: Course rating (0-5)
- `reviewCount`: Number of reviews
- `progress`: Progress percentage (0-100)

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `500` - Internal Server Error

---

## 5. Get Level Rewards

**Endpoint:** `GET /dashboard/level-rewards`

**Description:** Mengambil data level rewards termasuk current level dan claimable levels

**Response:**

```json
{
  "success": true,
  "message": "Level rewards fetched successfully",
  "data": {
    "currentLevel": 5,
    "claimedLevels": [5],
    "levels": [
      {
        "level": 5,
        "reward": 250,
        "icon": "💎",
        "backgroundColor": "bg-green-100",
        "arrow": "left"
      },
      {
        "level": 6,
        "reward": 350,
        "icon": "🪙",
        "backgroundColor": "bg-green-100"
      },
      {
        "level": 7,
        "reward": 450,
        "icon": "🪙",
        "backgroundColor": "bg-green-100"
      },
      {
        "level": 8,
        "reward": 600,
        "icon": "🗝️",
        "backgroundColor": "bg-green-100",
        "arrow": "right"
      }
    ]
  }
}
```

**Field Descriptions:**

- `currentLevel`: User's current level
- `claimedLevels`: Array of level numbers that have been claimed
- `levels`: Array of level reward objects
  - `level`: Level number
  - `reward`: Reward amount (points/coins)
  - `icon`: Emoji or icon identifier
  - `backgroundColor`: Tailwind CSS class for background color
  - `arrow`: Optional arrow indicator - `"left" | "right"`

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `500` - Internal Server Error

---

## 6. Get Dashboard Quests

**Endpoint:** `GET /dashboard/quests`

**Description:** Mengambil daftar active quests untuk dashboard

**Response:**

```json
{
  "success": true,
  "message": "Dashboard quests fetched successfully",
  "data": [
    {
      "id": "quest-1",
      "title": "Join 2 Workshops",
      "subtitle": "Today",
      "reward": 250,
      "icon": "assignment",
      "rewardBadgeColor": "bg-purple-400",
      "progress": {
        "current": 1,
        "total": 2
      },
      "status": "in-progress"
    },
    {
      "id": "quest-2",
      "title": "Finish 2 Assignments",
      "subtitle": "2 Days",
      "reward": 500,
      "icon": "chests",
      "rewardBadgeColor": "bg-cyan-400",
      "status": "claimable",
      "backgroundColor": "bg-amber-50"
    }
  ]
}
```

**Field Descriptions:**

- `id`: Unique quest identifier
- `title`: Quest title
- `subtitle`: Time remaining or status (e.g., "Today", "2 Days")
- `reward`: Reward amount (points/coins)
- `icon`: Icon identifier (e.g., "assignment", "chests")
- `rewardBadgeColor`: Tailwind CSS class for reward badge background
- `progress`: Optional progress object
  - `current`: Current progress value
  - `total`: Total required value
- `status`: Quest status - `"in-progress" | "claimable"`
- `backgroundColor`: Optional Tailwind CSS class for card background

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `500` - Internal Server Error

---

## 7. Get Schedules

**Endpoint:** `GET /dashboard/schedules`

**Description:** Mengambil daftar schedules/events untuk dashboard

**Response:**

```json
{
  "success": true,
  "message": "Schedules fetched successfully",
  "data": [
    {
      "id": "schedule-1",
      "title": "UI/UX Design",
      "subtitle": "Zoom Meeting",
      "time": "08:00 am",
      "type": "live-class",
      "date": "2025-11-29"
    },
    {
      "id": "schedule-2",
      "title": "Digital Marketi..",
      "subtitle": "Video Lecture",
      "time": "09:30 am",
      "type": "live-class",
      "date": "2025-11-29"
    },
    {
      "id": "schedule-3",
      "title": "Digital Marketi..",
      "subtitle": "New Assignment",
      "time": "11:00 am",
      "type": "submit-assignment",
      "date": "2025-11-29"
    }
  ]
}
```

**Field Descriptions:**

- `id`: Unique schedule identifier
- `title`: Schedule title
- `subtitle`: Schedule type or description (e.g., "Zoom Meeting", "Video Lecture", "New Assignment")
- `time`: Time in format "HH:mm am/pm" (e.g., "08:00 am")
- `type`: Event type - `"live-class" | "workshop" | "quiz" | "special-quest" | "submit-assignment"`. This determines the visual styling (colors) of the schedule item.
- `date`: ISO date string (YYYY-MM-DD) for filtering schedules by selected calendar date. Schedules are filtered based on the date selected in the calendar component.

**Note:** The `type` field uses the same event types as weekly schedule calendar events for consistency. Colors are automatically applied based on the event type using `EVENT_STYLES` constants.

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `500` - Internal Server Error

---

## 8. Get Profile Data

**Endpoint:** `GET /dashboard/profile`

**Description:** Mengambil user profile data untuk dashboard sidebar

**Response:**

```json
{
  "success": true,
  "message": "Profile data fetched successfully",
  "data": {
    "avatarUrl": "https://api.dicebear.com/7.x/adventurer/svg?seed=felix",
    "level": 7,
    "totalXP": 5400,
    "unreadMessagesCount": 5,
    "messagesAvatarUrl": "https://api.dicebear.com/7.x/adventurer/svg?seed=felix"
  }
}
```

**Field Descriptions:**

- `avatarUrl`: User avatar image URL
- `level`: User's current level
- `totalXP`: Total experience points
- `unreadMessagesCount`: Number of unread messages
- `messagesAvatarUrl`: Optional avatar URL for messages widget (defaults to avatarUrl if not provided)

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `500` - Internal Server Error

---

## 9. Get Promo Data

**Endpoint:** `GET /dashboard/promo`

**Description:** Mengambil promo/banner data untuk dashboard sidebar

**Response:**

```json
{
  "success": true,
  "message": "Promo data fetched successfully",
  "data": {
    "title": "Get 20% OFF for All Courses!",
    "description": "Level up your skills in design, branding, and more. Limited slots available!",
    "buttonText": "Buy Now",
    "backgroundImage": "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg"
  }
}
```

**Field Descriptions:**

- `title`: Promo title/headline
- `description`: Promo description text
- `buttonText`: Text for the CTA button
- `backgroundImage`: Background image URL for the promo card

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `500` - Internal Server Error

---

## 10. Get Calendar Data

**Endpoint:** `GET /dashboard/calendar`

**Description:** Mengambil calendar data termasuk initial selected date dan marked dates (dates yang memiliki events/schedules)

**Response:**

```json
{
  "success": true,
  "message": "Calendar data fetched successfully",
  "data": {
    "initialSelectedDate": "2025-05-03",
    "markedDates": [
      "2025-05-01",
      "2025-05-03",
      "2025-05-05",
      "2025-05-07",
      "2025-05-10",
      "2025-05-15",
      "2025-05-20"
    ]
  }
}
```

**Field Descriptions:**

- `initialSelectedDate`: Optional initial selected date in ISO format (YYYY-MM-DD). If not provided, defaults to today's date
- `markedDates`: Array of ISO date strings (YYYY-MM-DD) representing dates that have events/schedules. These dates will be visually marked on the calendar

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `500` - Internal Server Error

---

## 11. Get Weekly Schedule Calendar Events

**Endpoint:** `GET /dashboard/weekly-schedule-events`

**Description:** Mengambil weekly schedule calendar events untuk work week view (Monday-Friday). Events ini digunakan untuk menampilkan schedule di calendar component dengan format yang lebih detail.

**Response:**

```json
{
  "success": true,
  "message": "Weekly schedule events fetched successfully",
  "data": [
    {
      "id": "weekly-event-1",
      "type": "live-class",
      "title": "Design Protototyping",
      "subtitle": "Live Class",
      "start": "2025-11-25T07:30:00.000Z",
      "end": "2025-11-25T09:00:00.000Z",
      "hasZoom": true,
      "participants": {
        "avatars": [
          "https://i.pravatar.cc/150?img=1",
          "https://i.pravatar.cc/150?img=2",
          "https://i.pravatar.cc/150?img=3",
          "https://i.pravatar.cc/150?img=4"
        ],
        "totalCount": 24
      }
    },
    {
      "id": "weekly-event-2",
      "type": "special-quest",
      "title": "Digital Marketing",
      "subtitle": "Special Quest",
      "start": "2025-11-25T10:00:00.000Z",
      "end": "2025-11-25T11:00:00.000Z",
      "deadline": "11:00 AM",
      "iconType": "book"
    }
  ]
}
```

**Field Descriptions:**

- `id`: Unique event identifier
- `type`: Event type - `"live-class" | "workshop" | "quiz" | "special-quest" | "submit-assignment"`
- `title`: Event title
- `subtitle`: Optional event subtitle/description
- `start`: ISO datetime string for event start time
- `end`: ISO datetime string for event end time
- `hasZoom`: Optional boolean indicating if event has Zoom meeting
- `participants`: Optional participant information
  - `avatars`: Array of avatar image URLs (max 4 shown in UI)
  - `totalCount`: Total number of participants
- `deadline`: Optional deadline time string (e.g., "12:00 PM") - used for quiz/assignment events
- `iconType`: Optional icon identifier (e.g., "book") - will be converted to React icon component in frontend

**Notes:**

- All datetime fields use ISO 8601 format (UTC)
- Events are typically for the current work week (Monday-Friday)
- Frontend will convert ISO datetime strings to Date objects
- Frontend will convert `iconType` to React.ReactNode based on the type

**Status Codes:**

- `200` - Success
- `401` - Unauthorized
- `500` - Internal Server Error

---

## Error Response Format

Semua endpoint mengembalikan error dalam format berikut:

```json
{
  "success": false,
  "message": "Error message description",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

## Common Status Codes

- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

1. Semua endpoint menggunakan GET method
2. Semua endpoint memerlukan authentication
3. Response format konsisten dengan `success`, `message`, dan `data` fields
4. Date formats menggunakan string (bisa disesuaikan dengan backend preference)
5. Color values menggunakan Tailwind CSS classes untuk konsistensi dengan frontend
6. Icon values adalah identifier yang akan di-mapping ke icon component di frontend
