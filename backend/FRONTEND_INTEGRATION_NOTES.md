# Frontend Integration Notes

This file summarizes backend behavior that frontend integration must follow.

## Base API

- Base URL: `http://localhost:4000/api`
- All responses use centralized envelope:
  - success: `{ success: true, data, message }`
  - error: `{ success: false, error: { code, message } }`

## Authentication

- Login/register endpoints are public.
- All project/artifact/domain endpoints require `Authorization: Bearer <token>`.
- Frontend should centralize token injection in one API client layer.

## Authorization and Access

- Backend is source of truth for permission checks.
- Project-scoped access is enforced server-side.
- Typical mutation permissions require `OWNER`, `ARCHITECT`, or `DEVELOPER`.
- Delete-level actions are stricter (`OWNER`/`ARCHITECT` depending on route).

## OpenAPI Import Scope (Current)

- OpenAPI import is **JSON-only** in current backend.
- YAML is not supported in current phase and should surface backend validation error to user.

## Core Integration Routes (High Use)

- Auth:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
- Projects:
  - `GET /projects`
  - `POST /projects`
  - `GET/PATCH/DELETE /projects/:projectId`
- Artifacts:
  - `GET/POST /projects/:projectId/artifacts`
  - `GET/PATCH/DELETE /artifacts/:artifactId`
- Relations:
  - `GET/POST /artifacts/:artifactId/relations`
  - `DELETE /relations/:relationId`
- Graph:
  - `GET /projects/:projectId/graph`
- Validation:
  - `POST /projects/:projectId/validate`
  - `GET /projects/:projectId/validation-issues`
  - `PATCH /validation-issues/:issueId`
- Search:
  - `GET /projects/:projectId/search?q=...`
- Exports:
  - `POST /projects/:projectId/export`
  - `GET /projects/:projectId/exports`
  - `GET /exports/:exportId`

## Expected Frontend Handling

- Handle `401` by redirecting to login / clearing auth state.
- Handle `403` with clear “no access” UI.
- Handle `VALIDATION_ERROR` by showing field-level or form-level feedback.
- Do not assume raw payloads; always unwrap `data` from response envelope.

## WebSocket Integration Notes

Current backend provides project event foundation with event names:

- `artifact:created`
- `artifact:updated`
- `artifact:deleted`
- `relation:created`
- `relation:deleted`
- `validation:completed`
- `version:created`
- `export:completed`

Frontend should map these events to refresh/invalidate related views:

- artifact list and details
- relations/graph
- validation dashboard
- version timeline
- export history

## Minimal Integration Sequence

1. Register/login and store token.
2. Fetch projects.
3. Open project workspace:
   - load artifacts
   - load graph
   - load validation issues
4. Mutate resources with optimistic UI only if desired, but always trust backend response.
5. Trigger validation and export on demand.