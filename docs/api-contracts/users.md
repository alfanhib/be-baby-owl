# Users API Contract

## Overview

This document defines the API contract for user management endpoints.

**Base URL:** `/api/users`

---

## Data Types

### User

```typescript
interface User {
  id: string; // Unique identifier (e.g., "usr-001")
  name: string; // Full name
  email: string; // Email address (unique)
  phone?: string; // Phone number (optional)
  role: UserRole; // User role
  status: UserStatus; // Account status
  avatar?: string; // Avatar URL (optional)
  createdAt: string; // ISO 8601 datetime
  lastLogin?: string; // ISO 8601 datetime (optional)
}

type UserRole = 'student' | 'instructor' | 'staff' | 'super_admin';
type UserStatus = 'active' | 'inactive' | 'suspended';
```

### UserStats

```typescript
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

### 1. Get Users

**GET** `/api/users`

Retrieves a paginated list of users with optional filters.

#### Query Parameters

| Parameter | Type       | Required | Description                         |
| --------- | ---------- | -------- | ----------------------------------- |
| page      | number     | No       | Page number (default: 1)            |
| limit     | number     | No       | Items per page (default: 12)        |
| role      | UserRole   | No       | Filter by role                      |
| status    | UserStatus | No       | Filter by status                    |
| search    | string     | No       | Search by name, email, phone, or ID |

#### Response

```json
{
  "data": [
    {
      "id": "usr-001",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+62 812 1111 1111",
      "role": "student",
      "status": "active",
      "avatar": null,
      "createdAt": "2025-10-01T00:00:00Z",
      "lastLogin": "2025-12-02T08:00:00Z"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 12,
    "totalPages": 9
  }
}
```

---

### 2. Get User by ID

**GET** `/api/users/:id`

Retrieves a single user by ID.

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | User ID     |

#### Response

```json
{
  "id": "usr-001",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+62 812 1111 1111",
  "role": "student",
  "status": "active",
  "avatar": null,
  "createdAt": "2025-10-01T00:00:00Z",
  "lastLogin": "2025-12-02T08:00:00Z"
}
```

#### Error Response (404)

```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 3. Get User Stats

**GET** `/api/users/stats`

Retrieves user statistics.

#### Response

```json
{
  "total": 100,
  "byRole": {
    "student": 75,
    "instructor": 15,
    "staff": 8,
    "super_admin": 2
  },
  "byStatus": {
    "active": 85,
    "inactive": 10,
    "suspended": 5
  }
}
```

---

### 4. Create User

**POST** `/api/users`

Creates a new user.

#### Request Body

```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "phone": "+62 812 0000 0000",
  "role": "student"
}
```

| Field | Type     | Required | Description    |
| ----- | -------- | -------- | -------------- |
| name  | string   | Yes      | Full name      |
| email | string   | Yes      | Email (unique) |
| phone | string   | No       | Phone number   |
| role  | UserRole | Yes      | User role      |

#### Response (201)

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "usr-101",
    "name": "New User",
    "email": "newuser@example.com",
    "phone": "+62 812 0000 0000",
    "role": "student",
    "status": "active",
    "avatar": null,
    "createdAt": "2025-12-03T10:00:00Z"
  }
}
```

#### Error Response (400)

```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

### 5. Update User

**PUT** `/api/users/:id`

Updates user information.

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | User ID     |

#### Request Body

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "phone": "+62 812 9999 9999"
}
```

All fields are optional.

#### Response

```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "usr-001",
    "name": "Updated Name",
    "email": "updated@example.com",
    ...
  }
}
```

---

### 6. Update User Status

**PATCH** `/api/users/:id/status`

Updates user account status.

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | User ID     |

#### Request Body

```json
{
  "status": "inactive"
}
```

| Field  | Type       | Required | Description                            |
| ------ | ---------- | -------- | -------------------------------------- |
| status | UserStatus | Yes      | New status (active/inactive/suspended) |

#### Response

```json
{
  "success": true,
  "message": "User status updated to inactive",
  "data": {
    "id": "usr-001",
    "status": "inactive",
    ...
  }
}
```

---

### 7. Update User Role

**PATCH** `/api/users/:id/role`

Updates user role.

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | User ID     |

#### Request Body

```json
{
  "role": "instructor"
}
```

| Field | Type     | Required | Description |
| ----- | -------- | -------- | ----------- |
| role  | UserRole | Yes      | New role    |

#### Response

```json
{
  "success": true,
  "message": "User role updated to instructor",
  "data": {
    "id": "usr-001",
    "role": "instructor",
    ...
  }
}
```

---

### 8. Delete User

**DELETE** `/api/users/:id`

Deletes a user.

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | User ID     |

#### Response

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### Error Response (404)

```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 9. Send Password Reset

**POST** `/api/users/:id/reset-password`

Sends a password reset email to the user.

#### Path Parameters

| Parameter | Type   | Required | Description |
| --------- | ------ | -------- | ----------- |
| id        | string | Yes      | User ID     |

#### Response

```json
{
  "success": true,
  "message": "Password reset email sent to john.doe@example.com"
}
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Success               |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 500  | Internal Server Error |

---

## Data Source

Dummy data is stored in: `src/lib/api/dummy/data/users.json`

This JSON file serves as the reference for API responses and can be used for:

- Frontend development without backend
- API contract validation
- Testing
