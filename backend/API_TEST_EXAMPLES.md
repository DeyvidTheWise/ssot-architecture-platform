# Backend API Test Examples

This document provides ready-to-run backend API examples for frontend integration and manual testing.

## 1) Run Backend Locally

From repository root:

```powershell
cd backend
npm install
npm run typecheck
npm run build
npm run dev
```

Expected local backend URL:

```text
http://localhost:4000
```

Health check:

```http
GET /api/health
```

## 2) Required Environment Variables

Use `.env.example` as the base.

Required keys:

- `PORT` (default `4000`)
- `NODE_ENV` (`development` for local)
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET` (minimum 16 chars)
- `JWT_EXPIRES_IN` (for example `1d`)
- `CORS_ORIGIN` (for example `http://localhost:3000`)

## 3) Response Envelope

Successful response:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

Error response:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error"
  }
}
```

## 4) Auth Flow

1. Register user
2. Login user
3. Store `token`
4. Send `Authorization: Bearer <token>` for protected routes

### 4.1 Register

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "email": "architect@example.com",
  "password": "StrongPassword123!",
  "firstName": "Deyvid",
  "lastName": "Popov"
}
```

### 4.2 Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "architect@example.com",
  "password": "StrongPassword123!"
}
```

Expected `data` shape:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "architect@example.com",
    "firstName": "Deyvid",
    "lastName": "Popov",
    "role": "DEVELOPER"
  }
}
```

### 4.3 Protected Request Example

```http
GET /api/auth/me
Authorization: Bearer <token>
```

## 5) Project Creation

```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "SSOT Demo Project",
  "description": "Integration test workspace"
}
```

## 6) Artifact Creation

```http
POST /api/projects/:projectId/artifacts
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "title": "Authentication Service",
  "type": "SERVICE",
  "description": "Handles registration and login",
  "status": "ACTIVE"
}
```

## 7) Relation Creation

Path artifact id must match `sourceArtifactId`.

```http
POST /api/artifacts/:artifactId/relations
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "sourceArtifactId": "source-artifact-uuid",
  "targetArtifactId": "target-artifact-uuid",
  "relationType": "DEPENDS_ON",
  "description": "Authentication service depends on user model"
}
```

## 8) Graph Fetch

```http
GET /api/projects/:projectId/graph
Authorization: Bearer <token>
```

Expected `data` shape:

```json
{
  "nodes": [
    {
      "id": "artifact-id",
      "label": "Authentication Service",
      "type": "SERVICE",
      "status": "ACTIVE"
    }
  ],
  "edges": [
    {
      "id": "relation-id",
      "source": "source-artifact-id",
      "target": "target-artifact-id",
      "type": "DEPENDS_ON",
      "label": "depends on"
    }
  ]
}
```

## 9) Validation Run

```http
POST /api/projects/:projectId/validate
Authorization: Bearer <token>
```

Expected summary in `data`:

```json
{
  "total": 5,
  "info": 0,
  "warning": 4,
  "error": 1,
  "critical": 0
}
```

## 10) Export Request

```http
POST /api/projects/:projectId/export
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "format": "JSON",
  "sections": [
    "ARTIFACTS",
    "RELATIONS",
    "GRAPH",
    "API_SPECS",
    "DIAGRAMS",
    "VALIDATION_REPORT",
    "VERSION_HISTORY"
  ]
}
```

## 11) Common Error Examples

Unauthorized (missing/invalid token):

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

Forbidden (no project access / insufficient role):

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient project permissions"
  }
}
```

Validation error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

Not found:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

## 12) WebSocket Event Names

Current backend event foundation emits to project subscribers with:

- `artifact:created`
- `artifact:updated`
- `artifact:deleted`
- `relation:created`
- `relation:deleted`
- `validation:completed`
- `version:created`
- `export:completed`

Expected payload patterns:

```json
{
  "artifact:created": { "artifactId": "uuid" },
  "artifact:updated": { "artifactId": "uuid" },
  "artifact:deleted": { "artifactId": "uuid" },
  "relation:created": { "relationId": "uuid" },
  "relation:deleted": { "relationId": "uuid" },
  "validation:completed": {
    "total": 0,
    "info": 0,
    "warning": 0,
    "error": 0,
    "critical": 0
  },
  "version:created": {
    "id": "uuid",
    "entityType": "Artifact",
    "entityId": "uuid",
    "changeType": "UPDATED",
    "createdAt": "ISO timestamp"
  },
  "export:completed": {
    "exportId": "uuid",
    "format": "JSON"
  }
}
```