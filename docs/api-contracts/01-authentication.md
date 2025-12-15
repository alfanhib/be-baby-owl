# API Contract: Authentication & Authorization

**Module:** Authentication  
**Version:** 1.0  
**Last Updated:** December 2, 2025  
**Status:** Ready for Implementation

---

## Overview

This document defines the API contracts for all authentication and authorization endpoints. These contracts serve as the agreement between Frontend and Backend teams.

**Base URL:** `https://api.babyowl.com/v1` (Production)  
**Base URL:** `http://localhost:8000/api/v1` (Development)

---

## Authentication Flow

```
1. User Registration/Login → Access Token + Refresh Token
2. Access Token stored in HTTP-only cookie (recommended) or localStorage
3. Access Token expires in 15 minutes
4. Refresh Token expires in 7 days
5. Frontend refreshes token automatically when expired
```

---

## Endpoints

### 1. POST `/auth/register`

**Description:** Register a new user account (self-registration)

**Request:**

```typescript
{
  name: string;          // Min 2 characters
  email: string;         // Valid email format
  password: string;      // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
  role?: 'student' | 'instructor';  // Optional, defaults to 'student'
}
```

**Response (201 Created):**

```typescript
{
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'staff' | 'super_admin';
    avatar?: string;
  };
  accessToken: string;   // JWT token, expires in 15 minutes
  refreshToken: string;  // Refresh token, expires in 7 days
}
```

**Errors:**

- `400 Bad Request` - Invalid input data
- `409 Conflict` - Email already exists

**Example Request:**

```bash
curl -X POST https://api.babyowl.com/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "role": "student"
  }'
```

**Example Response:**

```json
{
  "user": {
    "id": "usr_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "avatar": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. POST `/auth/login`

**Description:** Login with email and password

**Request:**

```typescript
{
  email: string;
  password: string;
}
```

**Response (200 OK):**

```typescript
{
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'staff' | 'super_admin';
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}
```

**Errors:**

- `400 Bad Request` - Missing email or password
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Account suspended

**Example Request:**

```bash
curl -X POST https://api.babyowl.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

---

### 3. POST `/auth/logout`

**Description:** Logout and invalidate refresh token

**Request Headers:**

```
Authorization: Bearer {accessToken}
```

**Request Body:** None

**Response (200 OK):**

```typescript
{
  message: string; // "Logged out successfully"
}
```

**Errors:**

- `401 Unauthorized` - Invalid or missing token

---

### 4. POST `/auth/refresh`

**Description:** Refresh access token using refresh token

**Request:**

```typescript
{
  refreshToken: string;
}
```

**Response (200 OK):**

```typescript
{
  accessToken: string;
  refreshToken?: string;  // Optional: new refresh token (token rotation)
}
```

**Errors:**

- `401 Unauthorized` - Invalid or expired refresh token

---

### 5. GET `/auth/me`

**Description:** Get current user profile

**Request Headers:**

```
Authorization: Bearer {accessToken}
```

**Response (200 OK):**

```typescript
{
  user: {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'staff' | 'super_admin';
    avatar?: string;
  }
}
```

**Errors:**

- `401 Unauthorized` - Invalid or expired token

---

### 6. POST `/auth/forgot-password`

**Description:** Request password reset link via email

**Request:**

```typescript
{
  email: string;
}
```

**Response (200 OK):**

```typescript
{
  message: string; // "Password reset link sent to your email"
}
```

**Notes:**

- Always return 200 even if email doesn't exist (security best practice)
- Send email with reset link: `https://app.babyowl.com/reset-password/{token}`
- Token should expire in 1 hour

**Errors:**

- `400 Bad Request` - Invalid email format

---

### 7. POST `/auth/reset-password/confirm`

**Description:** Confirm password reset with token

**Request:**

```typescript
{
  token: string; // From reset email link
  newPassword: string; // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
}
```

**Response (200 OK):**

```typescript
{
  message: string; // "Password has been reset successfully"
}
```

**Errors:**

- `400 Bad Request` - Invalid password format
- `401 Unauthorized` - Invalid or expired token

---

### 8. POST `/auth/set-password`

**Description:** Set password for staff-created user (first login)

**Request:**

```typescript
{
  token: string; // From setup email link
  newPassword: string; // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
}
```

**Response (200 OK):**

```typescript
{
  message: string; // "Password has been set successfully"
}
```

**Notes:**

- Similar to `/auth/reset-password/confirm` but for new accounts
- Staff creates user → System sends setup email → User sets password
- Token should expire in 7 days (longer than reset token)

**Errors:**

- `400 Bad Request` - Invalid password format
- `401 Unauthorized` - Invalid or expired token

---

### 9. POST `/auth/change-password`

**Description:** Change password for authenticated user

**Request Headers:**

```
Authorization: Bearer {accessToken}
```

**Request:**

```typescript
{
  oldPassword: string;
  newPassword: string;
}
```

**Response (200 OK):**

```typescript
{
  message: string; // "Password changed successfully"
}
```

**Errors:**

- `400 Bad Request` - Invalid password format
- `401 Unauthorized` - Invalid token or wrong old password

---

## JWT Token Structure

### Access Token Payload

```typescript
{
  userId: string;
  email: string;
  role: 'student' | 'instructor' | 'staff' | 'super_admin';
  iat: number; // Issued at
  exp: number; // Expires at (15 minutes from iat)
}
```

### Refresh Token Payload

```typescript
{
  userId: string;
  tokenId: string; // Unique token ID for revocation
  iat: number;
  exp: number; // Expires at (7 days from iat)
}
```

---

## Authorization Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Error Response Format

All errors should follow this format:

```typescript
{
  error: {
    code: string;        // Machine-readable error code
    message: string;     // Human-readable error message
    details?: any;       // Optional: Additional error details
  }
}
```

**Example Error Response:**

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": null
  }
}
```

---

## Common Error Codes

| Code                       | HTTP Status | Description                            |
| -------------------------- | ----------- | -------------------------------------- |
| `INVALID_INPUT`            | 400         | Request validation failed              |
| `EMAIL_EXISTS`             | 409         | Email already registered               |
| `INVALID_CREDENTIALS`      | 401         | Wrong email or password                |
| `TOKEN_EXPIRED`            | 401         | Access/refresh token expired           |
| `TOKEN_INVALID`            | 401         | Malformed or invalid token             |
| `ACCOUNT_SUSPENDED`        | 403         | User account is suspended              |
| `INSUFFICIENT_PERMISSIONS` | 403         | User doesn't have required permissions |

---

## Security Requirements

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Optional: 1 special character (recommended)

### Token Storage

- **Access Token:** HTTP-only cookie (recommended) or localStorage
- **Refresh Token:** HTTP-only cookie (recommended)
- Never expose tokens in URLs or logs

### Rate Limiting

- Login: 5 attempts per 15 minutes per IP
- Register: 3 attempts per hour per IP
- Forgot Password: 3 attempts per hour per email

### CORS

- Allow origins: `https://app.babyowl.com`, `http://localhost:3000`
- Allow credentials: `true`
- Allow headers: `Authorization`, `Content-Type`

---

## Email Templates

### Password Reset Email

**Subject:** Reset Your Password - Inntexia Academy

**Body:**

```
Hi {user.name},

You requested to reset your password. Click the link below to create a new password:

{resetLink}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
Inntexia Academy Team
```

### Account Setup Email (Staff-Created User)

**Subject:** Welcome to Inntexia Academy - Set Your Password

**Body:**

```
Hi {user.name},

Welcome to Inntexia Academy! Your account has been created by our staff.

Click the link below to set your password and get started:

{setupLink}

This link will expire in 7 days.

If you didn't expect this email, please contact support@inntexia.com.

Best regards,
Inntexia Academy Team
```

---

## Testing

### Dummy Users for Development

```typescript
// Student
{
  email: 'student@test.com',
  password: 'password123',
  role: 'student'
}

// Instructor
{
  email: 'instructor@test.com',
  password: 'password123',
  role: 'instructor'
}

// Staff
{
  email: 'staff@test.com',
  password: 'password123',
  role: 'staff'
}

// Super Admin
{
  email: 'admin@test.com',
  password: 'password123',
  role: 'super_admin'
}
```

---

## Implementation Checklist

### Backend Team

- [ ] Set up JWT authentication middleware
- [ ] Implement token refresh rotation
- [ ] Configure email service (SendGrid/AWS SES)
- [ ] Set up rate limiting
- [ ] Implement password hashing (bcrypt, cost factor 10)
- [ ] Create email templates
- [ ] Add token blacklist for logout
- [ ] Configure CORS properly
- [ ] Add request validation (Joi/Zod)
- [ ] Write API tests

### Frontend Team

- [ ] ✅ Implement login page
- [ ] ✅ Implement register page
- [ ] ✅ Implement forgot password page
- [ ] ✅ Implement reset password page
- [ ] ✅ Implement set password page
- [ ] ✅ Implement AuthContext
- [ ] ✅ Implement route protection middleware
- [ ] ✅ Implement role-based redirects
- [ ] ⏳ Add token refresh interceptor
- [ ] ⏳ Add error handling for auth failures

---

## Questions or Issues?

**Backend Lead:** [Name] (@slack-handle)  
**Frontend Lead:** [Name] (@slack-handle)  
**Slack Channel:** #dev-auth

---

**Last Updated:** December 2, 2025  
**Next Review:** Before Sprint 1 Backend Development
