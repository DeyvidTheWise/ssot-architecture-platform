# Backend Codex Prompt

You are implementing the backend for the Perfect Documentation Platform.

## Goal

Build a Node.js + Express.js + TypeScript backend with PostgreSQL, Prisma ORM, JWT authentication, Zod validation, REST APIs, WebSocket support, versioning, validation, and SSOT export.

## Required Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod
- JWT
- bcrypt
- ws or socket.io

## Must Follow

Read and follow these documents before coding:

- docs/01_SYSTEM_OVERVIEW.md
- docs/02_BACKEND_REQUIREMENTS.md
- docs/04_DATABASE_SCHEMA.md
- docs/05_API_CONTRACTS.md
- docs/06_WEBSOCKET_EVENTS.md
- docs/07_VALIDATION_RULES.md
- docs/09_SECURITY_MODEL.md
- docs/10_VERSIONING_AND_TRACEABILITY.md
- docs/11_AGENTS.md

## Implementation Requirements

Create backend folder structure:

```text
backend/
  src/
    config/
    middleware/
    modules/
    websocket/
    utils/
  prisma/
    schema.prisma
```

Implement:

1. Express app setup
2. Prisma setup
3. Auth module
4. User/project membership authorization
5. Project CRUD
6. Artifact CRUD
7. Artifact relations
8. Graph endpoint
9. Documentation page storage
10. API spec storage and endpoint parsing placeholder
11. Diagram storage
12. Database model storage
13. Validation engine with initial deterministic rules
14. Version history service
15. Search endpoint
16. SSOT export endpoint
17. WebSocket event emission

## Rules

- Use TypeScript strictly.
- Use Zod for request validation.
- Use centralized error middleware.
- Use standard response format.
- Do not expose password hashes.
- Do not allow cross-project relations.
- Do not allow unauthorized project access.
- Write version records after successful mutations.

## Deliverable

A working backend that can run locally with PostgreSQL and supports the documented API contracts.
