# API Contract: Super Admin Dashboard

**Module:** Super Admin (PRD 22)  
**Version:** 1.0  
**Last Updated:** December 15, 2025  
**Status:** Ready for Implementation

---

## Overview

API endpoints for super admin dashboard, system configuration, and administrative functions. Full access to all system features.

**Base URL:** `{API_BASE_URL}/admin`

---

## Authentication

All endpoints require Bearer token:

```
Authorization: Bearer {accessToken}
```

**Required Roles:** `super_admin`

---

## Types

```typescript
type SystemHealth = 'healthy' | 'warning' | 'critical';

interface SuperAdminDashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalStaff: number;
  totalCourses: number;
  totalClasses: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeClasses: number;
  systemHealth: SystemHealth;
  completedClasses: number;
  pendingPayments: number;
  pendingPaymentsAmount: number;
  atRiskStudents: number;
  averageCourseCompletion: number;
  newStudentsThisMonth: number;
  newStudentsLastMonth: number;
}

interface SystemMetrics {
  apiResponseTime: number; // in ms
  databaseSize: number; // in bytes
  activeUsers: number;
  errorRate: number; // percentage
  uptime: number; // percentage
  requestsPerMinute: number;
  peakUsageTime: string;
}

interface UserGrowthData {
  labels: string[];
  students: number[];
  instructors: number[];
  staff: number[];
}

interface RevenueData {
  labels: string[];
  revenue: number[];
  enrollments: number[];
}

interface SystemConfig {
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  maxUploadSize: number;
  sessionTimeout: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ipAddress: string;
  timestamp: string;
}
```

---

## Endpoints

### Dashboard

#### 1. GET `/admin/dashboard`

**Description:** Get super admin dashboard data

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 550,
      "totalStudents": 500,
      "totalInstructors": 30,
      "totalStaff": 15,
      "totalCourses": 25,
      "totalClasses": 80,
      "totalRevenue": 4500000000,
      "monthlyRevenue": 450000000,
      "activeClasses": 45,
      "systemHealth": "healthy",
      "completedClasses": 120,
      "pendingPayments": 8,
      "pendingPaymentsAmount": 24000000,
      "atRiskStudents": 15,
      "averageCourseCompletion": 78,
      "newStudentsThisMonth": 45,
      "newStudentsLastMonth": 38
    },
    "systemMetrics": {
      "apiResponseTime": 125,
      "databaseSize": 5368709120,
      "activeUsers": 150,
      "errorRate": 0.02,
      "uptime": 99.95,
      "requestsPerMinute": 450,
      "peakUsageTime": "19:00-21:00"
    },
    "userGrowth": {
      "labels": ["Oct", "Nov", "Dec"],
      "students": [420, 460, 500],
      "instructors": [25, 28, 30],
      "staff": [12, 14, 15]
    },
    "revenueData": {
      "labels": ["Oct", "Nov", "Dec"],
      "revenue": [350000000, 400000000, 450000000],
      "enrollments": [35, 42, 50]
    },
    "alerts": [
      {
        "type": "warning",
        "message": "Database size approaching limit",
        "severity": "medium"
      },
      {
        "type": "info",
        "message": "15 at-risk students need attention",
        "severity": "low"
      }
    ]
  }
}
```

---

### System Configuration

#### 2. GET `/admin/config`

**Description:** Get system configuration

**Response:**

```json
{
  "success": true,
  "data": {
    "maintenanceMode": false,
    "registrationEnabled": true,
    "maxUploadSize": 104857600,
    "sessionTimeout": 3600,
    "emailNotifications": true,
    "smsNotifications": false,
    "features": {
      "quizzes": true,
      "codingExercises": true,
      "liveClasses": true,
      "officeHours": true
    },
    "limits": {
      "maxStudentsPerGroupClass": 20,
      "maxFileSizeVideo": 524288000,
      "maxFileSizeDocument": 52428800
    }
  }
}
```

---

#### 3. PATCH `/admin/config`

**Description:** Update system configuration

**Request Body:**

```json
{
  "maintenanceMode": true,
  "sessionTimeout": 7200
}
```

---

### User Management (Admin Level)

#### 4. GET `/admin/users/overview`

**Description:** Get user statistics overview

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 550,
    "byRole": {
      "student": 500,
      "instructor": 30,
      "staff": 15,
      "super_admin": 5
    },
    "byStatus": {
      "active": 520,
      "inactive": 25,
      "suspended": 5
    },
    "recentSignups": [
      {
        "id": "user-1",
        "name": "John Doe",
        "role": "student",
        "createdAt": "..."
      }
    ],
    "topActiveUsers": [
      { "id": "student-1", "name": "Jane Student", "activityScore": 95 }
    ]
  }
}
```

---

#### 5. POST `/admin/users/:id/impersonate`

**Description:** Impersonate a user (for debugging)

**Response:**

```json
{
  "success": true,
  "data": {
    "impersonationToken": "temp_token_xyz",
    "expiresIn": 3600,
    "targetUser": { "id": "user-1", "name": "John Doe", "role": "student" }
  }
}
```

---

#### 6. POST `/admin/users/:id/reset-password`

**Description:** Force password reset for user

---

### Audit Logs

#### 7. GET `/admin/audit-logs`

**Description:** Get system audit logs

**Query Parameters:**

| Param     | Type   | Required | Description        |
| --------- | ------ | -------- | ------------------ |
| userId    | string | No       | Filter by user     |
| action    | string | No       | Filter by action   |
| resource  | string | No       | Filter by resource |
| startDate | string | No       | From date          |
| endDate   | string | No       | To date            |
| page      | number | No       | Page number        |
| limit     | number | No       | Items per page     |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "audit-1",
      "userId": "admin-1",
      "userName": "Super Admin",
      "action": "update_config",
      "resource": "system_config",
      "details": {
        "field": "maintenanceMode",
        "oldValue": false,
        "newValue": true
      },
      "ipAddress": "192.168.1.1",
      "timestamp": "2025-12-15T10:00:00Z"
    }
  ],
  "meta": { "total": 1000, "page": 1, "limit": 50, "totalPages": 20 }
}
```

---

### System Operations

#### 8. POST `/admin/system/backup`

**Description:** Trigger database backup

**Response:**

```json
{
  "success": true,
  "message": "Backup initiated",
  "data": {
    "backupId": "backup-2025-12-15",
    "status": "in_progress",
    "estimatedTime": 300
  }
}
```

---

#### 9. GET `/admin/system/backups`

**Description:** Get list of backups

---

#### 10. POST `/admin/system/cache/clear`

**Description:** Clear system cache

---

#### 11. GET `/admin/system/health`

**Description:** Get detailed system health

**Response:**

```json
{
  "success": true,
  "data": {
    "overall": "healthy",
    "services": {
      "api": { "status": "healthy", "responseTime": 50 },
      "database": {
        "status": "healthy",
        "connections": 25,
        "maxConnections": 100
      },
      "cache": { "status": "healthy", "hitRate": 95 },
      "storage": { "status": "healthy", "used": 50, "total": 100 },
      "email": { "status": "healthy", "queue": 5 }
    },
    "lastCheck": "2025-12-15T10:00:00Z"
  }
}
```

---

### Reports

#### 12. GET `/admin/reports/financial`

**Description:** Get financial report

**Query Parameters:**

| Param     | Type   | Required | Description                |
| --------- | ------ | -------- | -------------------------- |
| period    | string | No       | "month", "quarter", "year" |
| startDate | string | No       | From date                  |
| endDate   | string | No       | To date                    |

---

#### 13. GET `/admin/reports/user-growth`

**Description:** Get user growth report

---

#### 14. GET `/admin/reports/course-performance`

**Description:** Get course performance report

---

#### 15. POST `/admin/reports/export`

**Description:** Export report as PDF/Excel

---

## Error Codes

| Code                       | HTTP Status | Description                     |
| -------------------------- | ----------- | ------------------------------- |
| `NOT_SUPER_ADMIN`          | 403         | User is not super admin         |
| `BACKUP_IN_PROGRESS`       | 409         | Backup already in progress      |
| `CANNOT_IMPERSONATE_ADMIN` | 403         | Cannot impersonate other admins |
| `CONFIG_VALIDATION_FAILED` | 400         | Invalid configuration value     |

---

## Implementation Checklist

### Backend

- [ ] Super admin dashboard endpoint
- [ ] System config CRUD
- [ ] User overview endpoint
- [ ] Impersonation (with audit)
- [ ] Audit logs endpoint
- [ ] Backup/restore endpoints
- [ ] Cache management
- [ ] Health check endpoint
- [ ] Report generation
- [ ] Authorization middleware
- [ ] Write unit tests

### Frontend

- [x] Super admin dashboard
- [x] System metrics cards
- [x] User growth charts
- [x] Revenue charts
- [x] System config page
- [x] Audit logs page
- [x] Backup management
- [x] Health status panel
- [x] React Query hooks

---

**Last Updated:** December 15, 2025
