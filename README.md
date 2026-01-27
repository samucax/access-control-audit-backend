# Access Control & Audit Logging System

A production-grade backend system demonstrating **Role-Based Access Control (RBAC)** and **Audit Logging** using Clean Architecture principles. This project is designed to showcase backend engineering skills and serve as a reference implementation for enterprise-level access control systems.

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Authentication & Authorization](#authentication--authorization)
- [Audit Logging](#audit-logging)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [Interviewer Notes](#interviewer-notes)
- [Credits](#credits)

## Project Overview

This system provides a complete implementation of:

- **JWT-based Authentication** with access and refresh tokens
- **Role-Based Access Control (RBAC)** with dynamic permission assignment
- **Comprehensive Audit Logging** for compliance and security monitoring
- **Clean Architecture** with strict separation of concerns

The project is intentionally **generic and infrastructure-level** - no business-specific logic is included, making it suitable for use as a foundation for any application requiring robust access control.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **TypeScript** | Type-safe JavaScript |
| **Express** | Web framework |
| **MongoDB** | Database (NoSQL) |
| **Mongoose** | MongoDB ODM |
| **Zod** | Schema validation |
| **JWT** | Token-based authentication |
| **bcryptjs** | Password hashing |

## Architecture Overview

This project follows **Clean Architecture** principles:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│         (Controllers, Routes, Validators, Middleware)        │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                         │
│              (Use Cases, Services, DTOs)                     │
├─────────────────────────────────────────────────────────────┤
│                      Domain Layer                            │
│        (Entities, Repository Interfaces, Business Rules)     │
├─────────────────────────────────────────────────────────────┤
│                   Infrastructure Layer                       │
│    (Database, External Services, Framework Implementations)  │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Dependency Rule**: Dependencies point inward. Inner layers know nothing about outer layers.
2. **Separation of Concerns**: Each layer has a single responsibility.
3. **Framework Independence**: Business logic is framework-agnostic.
4. **Testability**: Each component can be tested in isolation.

## Folder Structure

```
backend/
├── src/
│   ├── domain/                    # Enterprise business rules
│   │   ├── entities/              # Domain models (User, Role, Permission, AuditLog)
│   │   └── repositories/          # Repository interfaces
│   │
│   ├── application/               # Application business rules
│   │   ├── use-cases/             # Use case implementations
│   │   │   ├── auth/              # Login, Logout, RefreshToken
│   │   │   ├── users/             # User CRUD operations
│   │   │   ├── roles/             # Role CRUD operations
│   │   │   ├── permissions/       # Permission management
│   │   │   └── audit-logs/        # Audit log queries
│   │   └── services/              # Domain services (PolicyService)
│   │
│   ├── infrastructure/            # Frameworks & drivers
│   │   ├── config/                # Environment configuration
│   │   ├── database/              # Database connection & models
│   │   │   └── mongoose/
│   │   │       ├── models/        # Mongoose schemas
│   │   │       └── repositories/  # Repository implementations
│   │   └── middleware/            # Express middleware
│   │
│   ├── presentation/              # Interface adapters
│   │   ├── controllers/           # HTTP request handlers
│   │   ├── routes/                # Route definitions
│   │   └── validators/            # Zod validation schemas
│   │
│   ├── shared/                    # Shared utilities
│   │   ├── errors/                # Custom error classes
│   │   └── utils/                 # Helper functions
│   │
│   ├── scripts/                   # Database scripts
│   │   └── seed.ts                # Initial data seeder
│   │
│   ├── app.ts                     # Express app configuration
│   └── index.ts                   # Entry point
│
├── .env.example                   # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Authentication & Authorization

### Authentication Flow

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│  Client │         │   API   │         │   DB    │
└────┬────┘         └────┬────┘         └────┬────┘
     │                   │                   │
     │  POST /auth/login │                   │
     │──────────────────>│                   │
     │                   │  Verify user      │
     │                   │──────────────────>│
     │                   │<──────────────────│
     │                   │                   │
     │  Access + Refresh │                   │
     │<──────────────────│                   │
     │                   │                   │
     │  Protected Request│                   │
     │  (Bearer Token)   │                   │
     │──────────────────>│                   │
     │                   │  Verify JWT       │
     │                   │  Check Permission │
     │                   │──────────────────>│
     │                   │<──────────────────│
     │  Response         │                   │
     │<──────────────────│                   │
```

### JWT Token Structure

**Access Token** (short-lived, 15 minutes):
```json
{
  "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "email": "user@example.com",
  "roleId": "64a1b2c3d4e5f6g7h8i9j0k2",
  "iat": 1688000000,
  "exp": 1688000900
}
```

**Refresh Token** (long-lived, 7 days):
- Stored in database for revocation support
- Implements token rotation for security

### Authorization (RBAC)

The system uses a hierarchical permission model:

```
User → Role → Permissions
```

**Permission Format**: `resource:action`
- Examples: `users:create`, `roles:manage`, `audit-logs:read`

**Special Permission**: `manage` grants all actions on a resource.

### Policy Service

The `PolicyService` evaluates permissions:

```typescript
// Check if user can create users
await policyService.hasPermission(userId, 'users', 'create');

// Check if user has any of these permissions
await policyService.hasAnyPermission(userId, ['users:create', 'users:manage']);

// Get all user permissions
await policyService.getUserPermissions(userId);
```

## Audit Logging

Every significant action is logged with:

| Field | Description |
|-------|-------------|
| `actorId` | User who performed the action |
| `actorEmail` | Email for quick identification |
| `action` | Action type (CREATE, UPDATE, DELETE, LOGIN, etc.) |
| `resource` | Resource affected (users, roles, etc.) |
| `resourceId` | Specific resource ID |
| `metadata` | Additional context (changes, previous values) |
| `ipAddress` | Client IP address |
| `userAgent` | Client user agent |
| `timestamp` | When the action occurred |

### Audit Log Actions

- `CREATE`, `READ`, `UPDATE`, `DELETE` - CRUD operations
- `LOGIN`, `LOGOUT`, `LOGIN_FAILED` - Authentication events
- `PASSWORD_CHANGE` - Security-sensitive changes
- `PERMISSION_DENIED` - Access control violations

### Aggregation Queries

The system includes MongoDB aggregation pipelines for:

- **By Action**: Count of each action type over a period
- **By Resource**: Activity breakdown per resource
- **By Actor**: Most active users
- **Resource Trail**: Complete history of a specific entity

## Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB 6.0+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Seed the database**
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/access-control-db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=12

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Running the Project

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

### Database Seeding
```bash
npx ts-node src/scripts/seed.ts
```

### Default Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin@123 |
| Manager | manager@example.com | Admin@123 |
| Viewer | viewer@example.com | Admin@123 |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Authenticate user |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout (revoke tokens) |
| GET | `/api/v1/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List all users |
| GET | `/api/v1/users/:id` | Get user by ID |
| POST | `/api/v1/users` | Create user |
| PATCH | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user |

### Roles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/roles` | List all roles |
| GET | `/api/v1/roles/:id` | Get role by ID |
| POST | `/api/v1/roles` | Create role |
| PATCH | `/api/v1/roles/:id` | Update role |
| DELETE | `/api/v1/roles/:id` | Delete role |

### Permissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/permissions` | List all permissions |
| GET | `/api/v1/permissions/:id` | Get permission by ID |
| POST | `/api/v1/permissions` | Create permission |
| DELETE | `/api/v1/permissions/:id` | Delete permission |

### Audit Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/audit-logs` | List audit logs |
| GET | `/api/v1/audit-logs/stats` | Get statistics |
| GET | `/api/v1/audit-logs/trail/:resource/:resourceId` | Get resource trail |

## Interviewer Notes

This project demonstrates the following skills and best practices:

### Architecture & Design Patterns
- ✅ **Clean Architecture** - Clear separation between domain, application, and infrastructure layers
- ✅ **Repository Pattern** - Abstracts data access behind interfaces
- ✅ **Dependency Injection** - Manual DI for clear dependency flow
- ✅ **Factory Pattern** - Route and middleware factories

### Security
- ✅ **JWT Authentication** - Secure token-based auth with refresh tokens
- ✅ **Password Hashing** - bcrypt with configurable salt rounds
- ✅ **RBAC** - Flexible role-based access control
- ✅ **Token Rotation** - Refresh tokens are rotated on use
- ✅ **Audit Trail** - Comprehensive logging of all actions

### Code Quality
- ✅ **TypeScript** - Full type safety throughout
- ✅ **Zod Validation** - Runtime schema validation
- ✅ **Error Handling** - Centralized, consistent error responses
- ✅ **Documentation** - Comprehensive README and code comments

### Database
- ✅ **MongoDB** - Proper schema design with indexes
- ✅ **Aggregation Pipelines** - Complex queries for analytics
- ✅ **Reference Population** - Efficient data loading

### Production Readiness
- ✅ **Environment Configuration** - Secure config management
- ✅ **Graceful Shutdown** - Proper cleanup on termination
- ✅ **Health Checks** - Monitoring endpoint
- ✅ **CORS** - Configurable cross-origin support

---

## Credits

**Created by Owais Zakir**

This project is open source and available for educational purposes. Feel free to use it as a reference or starting point for your own projects.

---

*This is a portfolio project demonstrating backend engineering skills. It is not affiliated with any company or organization.*
