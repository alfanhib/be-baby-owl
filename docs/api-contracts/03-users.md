# API Contract: User Management

**Module:** User Management  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for managing users (students, instructors, staff, super admins). Used by Staff and Super Admin roles.

**Base URL:** `{API_BASE_URL}/users`

---

## Authentication

All endpoints require Bearer token:

```
Authorization: Bearer {accessToken}
```

**Required Roles:** `staff`, `super_admin`

---

## Types

```typescript
type UserRole = 'student' | 'instructor' | 'staff' | 'super_admin';
type UserStatus = 'active' | 'inactive' | 'suspended';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string; // ISO datetime
  lastLogin?: string; // ISO datetime
}

interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string; // Search by name or email
  page?: number; // Default: 1
  limit?: number; // Default: 10
}

interface UserStats {
  total: number;
  byRole: {
    student: number;
    instructor: number;
    staff: number;
    super_admin: number;
  };
  byStatus: {
    active: number;
    inactive: number;
    suspended: number;
  };
}
```

---

## Endpoints

### 1. GET `/users`

**Description:** Get paginated list of users with optional filters

**Query Parameters:**

| Param  | Type       | Required | Description                  |
| ------ | ---------- | -------- | ---------------------------- |
| role   | UserRole   | No       | Filter by role               |
| status | UserStatus | No       | Filter by status             |
| search | string     | No       | Search by name or email      |
| page   | number     | No       | Page number (default: 1)     |
| limit  | number     | No       | Items per page (default: 10) |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "usr_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+6281234567890",
      "role": "student",
      "status": "active",
      "avatar": "https://example.com/avatars/john.jpg",
      "createdAt": "2025-01-15T10:30:00Z",
      "lastLogin": "2025-12-14T08:45:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

---

### 2. GET `/users/:id`

**Description:** Get single user by ID

**Path Parameters:**

| Param | Type   | Required | Description |
| ----- | ------ | -------- | ----------- |
| id    | string | Yes      | User ID     |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "usr_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+6281234567890",
    "role": "student",
    "status": "active",
    "avatar": "https://example.com/avatars/john.jpg",
    "createdAt": "2025-01-15T10:30:00Z",
    "lastLogin": "2025-12-14T08:45:00Z"
  }
}
```

**Errors:**

- `404 Not Found` - User not found

---

### 3. GET `/users/stats`

**Description:** Get user statistics

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User stats fetched successfully",
  "data": {
    "total": 500,
    "byRole": {
      "student": 450,
      "instructor": 30,
      "staff": 15,
      "super_admin": 5
    },
    "byStatus": {
      "active": 480,
      "inactive": 15,
      "suspended": 5
    }
  }
}
```

---

### 4. POST `/users`

**Description:** Create a new user (staff-created account)

**Request Body:**

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+6281234567890",
  "role": "student"
}
```

| Field | Type     | Required | Description                    |
| ----- | -------- | -------- | ------------------------------ |
| name  | string   | Yes      | Full name (min 2 chars)        |
| email | string   | Yes      | Valid email address            |
| phone | string   | No       | Phone number with country code |
| role  | UserRole | Yes      | User role                      |

**Response (201 Created):**

```json
{
  "success": true,
  "message": "User created successfully. Setup email sent.",
  "data": {
    "id": "usr_xyz789",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+6281234567890",
    "role": "student",
    "status": "inactive",
    "avatar": null,
    "createdAt": "2025-12-15T10:00:00Z",
    "lastLogin": null
  }
}
```

**Notes:**

- User is created with `status: inactive`
- System sends setup email with password setup link
- User becomes `active` after setting password

**Errors:**

- `400 Bad Request` - Invalid input
- `409 Conflict` - Email already exists

---

### 5. PATCH `/users/:id`

**Description:** Update user details

**Path Parameters:**

| Param | Type   | Required | Description |
| ----- | ------ | -------- | ----------- |
| id    | string | Yes      | User ID     |

**Request Body:**

```json
{
  "name": "Jane Smith Updated",
  "email": "jane.new@example.com",
  "phone": "+6281234567891",
  "role": "instructor",
  "status": "active"
}
```

| Field  | Type       | Required | Description   |
| ------ | ---------- | -------- | ------------- |
| name   | string     | No       | Full name     |
| email  | string     | No       | Email address |
| phone  | string     | No       | Phone number  |
| role   | UserRole   | No       | User role     |
| status | UserStatus | No       | User status   |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "usr_xyz789",
    "name": "Jane Smith Updated",
    "email": "jane.new@example.com",
    "phone": "+6281234567891",
    "role": "instructor",
    "status": "active",
    "avatar": null,
    "createdAt": "2025-12-15T10:00:00Z",
    "lastLogin": null
  }
}
```

**Errors:**

- `400 Bad Request` - Invalid input
- `404 Not Found` - User not found
- `409 Conflict` - Email already exists

---

### 6. PATCH `/users/:id/status`

**Description:** Update user status only

**Path Parameters:**

| Param | Type   | Required | Description |
| ----- | ------ | -------- | ----------- |
| id    | string | Yes      | User ID     |

**Request Body:**

```json
{
  "status": "suspended"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User status updated to suspended"
}
```

**Errors:**

- `400 Bad Request` - Invalid status
- `404 Not Found` - User not found

---

### 7. DELETE `/users/:id`

**Description:** Delete a user (soft delete)

**Path Parameters:**

| Param | Type   | Required | Description |
| ----- | ------ | -------- | ----------- |
| id    | string | Yes      | User ID     |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Notes:**

- Soft delete: user is marked as deleted but data retained
- Cannot delete users with active enrollments (return error)

**Errors:**

- `404 Not Found` - User not found
- `409 Conflict` - User has active enrollments

---

### 8. POST `/users/:id/resend-setup-email`

**Description:** Resend setup email for users who haven't set password

**Path Parameters:**

| Param | Type   | Required | Description |
| ----- | ------ | -------- | ----------- |
| id    | string | Yes      | User ID     |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Setup email sent successfully"
}
```

**Errors:**

- `400 Bad Request` - User already has password set
- `404 Not Found` - User not found

---

## Error Codes

| Code                     | HTTP Status | Description                                |
| ------------------------ | ----------- | ------------------------------------------ |
| `USER_NOT_FOUND`         | 404         | User with given ID not found               |
| `EMAIL_EXISTS`           | 409         | Email already registered                   |
| `INVALID_INPUT`          | 400         | Request validation failed                  |
| `HAS_ACTIVE_ENROLLMENTS` | 409         | Cannot delete user with active enrollments |
| `ALREADY_HAS_PASSWORD`   | 400         | User already has password set              |

---

## Role-Based Access

| Endpoint                           | staff | super_admin |
| ---------------------------------- | ----- | ----------- |
| GET /users                         | ✅    | ✅          |
| GET /users/:id                     | ✅    | ✅          |
| GET /users/stats                   | ✅    | ✅          |
| POST /users (student)              | ✅    | ✅          |
| POST /users (instructor)           | ❌    | ✅          |
| POST /users (staff)                | ❌    | ✅          |
| PATCH /users/:id                   | ❌    | ✅          |
| PATCH /users/:id/status            | ❌    | ✅          |
| DELETE /users/:id                  | ❌    | ✅          |
| POST /users/:id/resend-setup-email | ✅    | ✅          |

---

## Implementation Checklist

### Backend

- [ ] Setup User model with Prisma/TypeORM
- [ ] Implement pagination helper
- [ ] Implement search functionality (name, email)
- [ ] Add role-based access middleware
- [ ] Implement soft delete
- [ ] Add email service for setup email
- [ ] Add validation (Zod/Joi)
- [ ] Write unit tests

### Frontend

- [x] Users list page with DataTable
- [x] User filters (role, status, search)
- [x] Create user dialog
- [x] Edit user dialog
- [x] Delete confirmation dialog
- [x] Status update functionality
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
