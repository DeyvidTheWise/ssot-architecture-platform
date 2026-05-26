# Coding Standards, Naming Conventions and Project Task Tracker

## 1. Purpose

This document defines the coding style, clean-code principles, naming conventions, Git workflow, and implementation task tracking rules for the **SSOT Architecture Platform**.

The goal is to keep the project consistent across backend, frontend, shared types, documentation, and AI-generated code.

This file should be used by all contributors and AI coding agents before modifying the codebase.

---

## 2. General Engineering Principles

### 2.1 Single Responsibility

Each module, component, function, and file should have one clear responsibility.

Good:

```ts
artifact.service.ts
artifact.controller.ts
artifact.routes.ts
artifact.validation.ts
```

Bad:

```ts
artifactEverything.ts
```

### 2.2 Separation of Concerns

The project must keep clear boundaries:

```text
Frontend = UI and user interaction
Backend = business logic, validation, persistence
Database = structured data storage
Shared = reusable types and schemas
Docs = architecture and implementation contracts
```

Frontend components must not contain backend business logic.

Backend services must not contain UI-specific logic.

### 2.3 Contract-First Development

Before implementing a feature, verify that the related API contract, entity, payload, or frontend requirement exists in `/docs`.

If not, update the documentation first.

### 2.4 No Hidden Magic

Avoid unclear abstractions and implicit behavior.

Code should be understandable to another developer without needing to inspect many unrelated files.

### 2.5 Predictable Error Handling

All backend errors must follow the standard error response format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input"
  }
}
```

### 2.6 Consistent Response Format

All successful API responses must follow:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

---

## 3. TypeScript Rules

### 3.1 Use TypeScript Strict Mode

The project should use strict TypeScript settings.

Required:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

### 3.2 Avoid `any`

Do not use `any` unless there is a strong reason.

Preferred:

```ts
type ArtifactType = "DOCUMENTATION" | "API" | "DATABASE" | "DIAGRAM";
```

Avoid:

```ts
const artifact: any = {};
```

### 3.3 Explicit Return Types for Services

Backend service functions should define return types.

Good:

```ts
async function getProjectById(projectId: string): Promise<ProjectDto> {}
```

### 3.4 DTOs for API Boundaries

Use DTOs for request and response payloads.

Example:

```ts
export interface CreateArtifactDto {
  title: string;
  type: ArtifactType;
  description?: string;
}
```

---

## 4. Backend Coding Style

### 4.1 Backend Folder Structure

```text
backend/
  src/
    config/
    middleware/
    modules/
      auth/
        auth.controller.ts
        auth.routes.ts
        auth.service.ts
        auth.validation.ts
      artifacts/
        artifact.controller.ts
        artifact.routes.ts
        artifact.service.ts
        artifact.validation.ts
        artifact.types.ts
    websocket/
    utils/
  prisma/
    schema.prisma
```

### 4.2 Backend File Naming

Use kebab-case or domain-based names.

```text
artifact.service.ts
artifact.controller.ts
artifact.routes.ts
artifact.validation.ts
project-member.service.ts
```

### 4.3 Backend Function Naming

Use verbs that explain the action.

Good:

```ts
createArtifact()
updateArtifact()
deleteArtifact()
getProjectGraph()
validateProjectConsistency()
```

Bad:

```ts
handleData()
processThing()
doStuff()
```

### 4.4 Controllers

Controllers should only:

```text
Read request data
Call service methods
Return response
Forward errors
```

Controllers should not contain business logic.

### 4.5 Services

Services contain:

```text
Business logic
Database operations
Validation coordination
Version tracking
Relationship logic
```

### 4.6 Routes

Routes define:

```text
HTTP method
URL path
Middleware
Controller action
```

Example:

```ts
router.post(
  "/projects/:projectId/artifacts",
  authenticate,
  authorizeProjectAccess,
  validate(createArtifactSchema),
  artifactController.createArtifact
);
```

### 4.7 Validation

Use Zod schemas for incoming request payloads.

Example:

```ts
export const createArtifactSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["DOCUMENTATION", "API", "DATABASE", "DIAGRAM"]),
  description: z.string().optional()
});
```

---

## 5. Frontend Coding Style

### 5.1 Frontend Folder Structure

```text
frontend/
  app/
    login/
    register/
    dashboard/
    projects/
  components/
    layout/
    projects/
    artifacts/
    graph/
    editor/
    validation/
  lib/
    api/
    auth/
    websocket/
  hooks/
  stores/
  types/
```

### 5.2 Frontend Component Naming

React components use PascalCase.

```text
ProjectSidebar.tsx
ArtifactEditor.tsx
GraphViewer.tsx
ValidationPanel.tsx
```

### 5.3 Frontend Function Naming

Use descriptive verbs.

```ts
fetchProjectArtifacts()
createArtifactRelation()
handleArtifactSave()
openValidationIssue()
```

### 5.4 Component Rules

Components should be small and focused.

A component should usually handle only one of these:

```text
Layout
Data display
Form input
Graph rendering
Modal interaction
Editor interaction
```

### 5.5 API Calls

All API calls must go through a central API client.

Good:

```ts
import { artifactApi } from "@/lib/api/artifact-api";
```

Bad:

```ts
fetch("http://localhost:4000/api/artifacts")
```

### 5.6 State Management

Use local component state for simple UI behavior.

Use a global store only for:

```text
Authenticated user
Selected project
Shared graph state
Global notifications
```

---

## 6. Naming Conventions

### 6.1 General

| Item | Convention | Example |
|---|---|---|
| Variables | camelCase | `selectedProjectId` |
| Functions | camelCase | `createArtifact()` |
| React Components | PascalCase | `ArtifactEditor` |
| Types / Interfaces | PascalCase | `ArtifactDto` |
| Enums | PascalCase | `ArtifactType` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Files | kebab-case or domain.case | `artifact.service.ts` |
| Database Tables | snake_case | `artifact_relations` |
| Database Columns | snake_case | `created_at` |
| API Paths | kebab-case/plural | `/api/projects/:projectId/artifacts` |

### 6.2 Entity Names

Use singular names for models:

```text
User
Project
Artifact
ArtifactRelation
DocumentationPage
ApiSpec
ApiEndpoint
Diagram
DatabaseModel
DatabaseEntity
VersionHistory
ValidationIssue
```

### 6.3 API Route Naming

Use plural nouns:

```text
/projects
/artifacts
/relations
/validation-issues
/api-specs
```

### 6.4 Boolean Naming

Use clear prefixes:

```ts
isPublic
hasAccess
canEdit
shouldValidate
requiresAuth
```

Avoid:

```ts
public
access
edit
validate
```

---

## 7. Clean Code Rules

### 7.1 Keep Functions Small

A function should usually fit on one screen.

If a function becomes too long, split it into smaller helper functions.

### 7.2 Avoid Deep Nesting

Bad:

```ts
if (user) {
  if (project) {
    if (artifact) {
      // logic
    }
  }
}
```

Good:

```ts
if (!user) throw new UnauthorizedError();
if (!project) throw new NotFoundError();
if (!artifact) throw new NotFoundError();
```

### 7.3 Prefer Clear Names Over Comments

Good code should explain itself through naming.

Good:

```ts
validateArtifactBelongsToProject()
```

Bad:

```ts
// checks if artifact belongs to project
check()
```

### 7.4 Comments

Use comments only for:

```text
Non-obvious decisions
Complex algorithms
Security-sensitive logic
Temporary TODOs with context
```

### 7.5 No Dead Code

Remove unused code, unused imports, and commented-out blocks.

---

## 8. Git Workflow

### 8.1 Branch Naming

```text
feature/auth-system
feature/artifact-crud
feature/knowledge-graph
fix/login-validation
refactor/api-client
docs/update-api-contracts
```

### 8.2 Commit Message Format

Use short, clear commit messages:

```text
feat: add artifact CRUD endpoints
fix: correct project access validation
docs: update frontend API contract
refactor: split artifact service logic
```

### 8.3 Pull Request Checklist

Before merging:

```text
[ ] Code follows naming conventions
[ ] API contract is respected
[ ] Request validation exists
[ ] Error handling is implemented
[ ] Authorization rules are checked
[ ] Version tracking is added where needed
[ ] Frontend uses central API client
[ ] No console logs or dead code
[ ] Documentation updated if behavior changed
```

---

## 9. AI Agent Rules

AI agents must follow these rules:

```text
Do not invent new entities without updating docs.
Do not change API payloads without updating API contracts.
Do not place business logic in React components.
Do not bypass backend validation.
Do not access the database directly from frontend.
Do not create duplicate types if shared types already exist.
Do not rename fields randomly.
Do not introduce large libraries without justification.
```

Before implementation, AI agents should inspect:

```text
/docs/01_SYSTEM_OVERVIEW.md
/docs/04_DATABASE_SCHEMA.md
/docs/05_API_CONTRACTS.md
/docs/FRONTEND_UI_IMPLEMENTATION_CONTRACT.md
/AGENTS.md
```

---

## 10. Task Tracker

Use this checklist to track implementation progress.

Status values:

```text
[ ] Open
[/] In Progress
[x] Done
[!] Blocked
```

---

# Phase 1: Repository and Documentation

| Status | Task | Notes |
|---|---|---|
| [ ] | Create GitHub repository | Recommended name: `ssot-architecture-platform` |
| [ ] | Create `/frontend`, `/backend`, `/docs`, `/shared` folders | Monorepo structure |
| [ ] | Add project documentation to `/docs` | Use generated Markdown files |
| [ ] | Add root `AGENTS.md` | Global AI-agent rules |
| [ ] | Add `.gitignore` | Node, env, build outputs |
| [ ] | Add root `README.md` | Project overview and setup |

---

# Phase 2: Backend Foundation

| Status | Task | Notes |
|---|---|---|
| [ ] | Initialize Express backend | TypeScript setup |
| [ ] | Add Prisma | PostgreSQL ORM |
| [ ] | Create Prisma schema | Based on database docs |
| [ ] | Add database migrations | Initial migration |
| [ ] | Add environment config | `.env.example` required |
| [ ] | Add global error handler | Standard response shape |
| [ ] | Add request validation middleware | Zod |
| [ ] | Add authentication module | Register, login, JWT |
| [ ] | Add authorization middleware | Project access and roles |

---

# Phase 3: Core Backend Modules

| Status | Task | Notes |
|---|---|---|
| [ ] | Implement users module | User profile and lookup |
| [ ] | Implement projects module | CRUD |
| [ ] | Implement project members module | Roles per project |
| [ ] | Implement artifacts module | Main artifact CRUD |
| [ ] | Implement artifact relations module | Knowledge graph foundation |
| [ ] | Implement documentation pages module | Markdown storage |
| [ ] | Implement API specs module | OpenAPI import |
| [ ] | Implement API endpoints module | Parsed endpoints |
| [ ] | Implement diagrams module | UML/ERD/Mermaid source |
| [ ] | Implement validation issues module | Consistency problems |
| [ ] | Implement version history module | Change tracking |
| [ ] | Implement search module | Global project search |
| [ ] | Implement export module | SSOT export |

---

# Phase 4: WebSocket and Realtime

| Status | Task | Notes |
|---|---|---|
| [ ] | Add WebSocket server | Attached to backend |
| [ ] | Add project room subscription | Users subscribe to project |
| [ ] | Emit artifact updates | Create/update/delete |
| [ ] | Emit relation updates | Graph changes |
| [ ] | Emit validation updates | Issue changes |
| [ ] | Add frontend socket client | Realtime UI updates |

---

# Phase 5: Frontend Foundation

| Status | Task | Notes |
|---|---|---|
| [ ] | Initialize Next.js frontend | App Router |
| [ ] | Add Tailwind CSS | UI styling |
| [ ] | Add frontend layout | Sidebar/topbar |
| [ ] | Add auth pages | Login/register |
| [ ] | Add protected routes | Auth guard |
| [ ] | Add API client | Centralized fetch logic |
| [ ] | Add notification system | Success/error messages |
| [ ] | Add global state store | Auth/project state |

---

# Phase 6: Frontend Feature Pages

| Status | Task | Notes |
|---|---|---|
| [ ] | Dashboard page | Project overview |
| [ ] | Projects page | List and create projects |
| [ ] | Project workspace page | Main project hub |
| [ ] | Artifact list page | Filter and search artifacts |
| [ ] | Artifact editor page | Edit artifact metadata |
| [ ] | Markdown editor page | Docs editing |
| [ ] | API specs page | Import and view APIs |
| [ ] | Graph viewer page | React Flow |
| [ ] | Diagram editor page | Mermaid/UML/ERD |
| [ ] | Validation page | Issues and warnings |
| [ ] | Version history page | Timeline |
| [ ] | Export page | SSOT export |

---

# Phase 7: Validation and Traceability

| Status | Task | Notes |
|---|---|---|
| [ ] | Add orphan artifact detection | Artifact without relation |
| [ ] | Add API without documentation rule | Traceability |
| [ ] | Add deprecated dependency rule | Architecture consistency |
| [ ] | Add sensitive field exposure rule | Security |
| [ ] | Add missing RBAC rule | Security |
| [ ] | Add graph consistency rule | Knowledge graph |
| [ ] | Add validation result UI | Severity and resolution |

---

# Phase 8: Polish and Thesis Support

| Status | Task | Notes |
|---|---|---|
| [ ] | Add seed data | Demo project |
| [ ] | Add screenshots | For thesis |
| [ ] | Add architecture diagrams | For thesis appendix |
| [ ] | Add API documentation | For appendix |
| [ ] | Add final README | Setup and usage |
| [ ] | Add deployment notes | Local/server deployment |
| [ ] | Add demo scenario | Walkthrough for defense |
| [ ] | Add limitations section | Honest thesis evaluation |
| [ ] | Add future work section | Improvements |

---

## 11. Definition of Done

A feature is considered done only when:

```text
[ ] It matches the documentation
[ ] Backend endpoint exists if needed
[ ] Request validation exists
[ ] Authorization is checked
[ ] Database persistence works
[ ] Frontend UI consumes the real API
[ ] Error states are handled
[ ] Loading states are handled
[ ] Version history is stored where relevant
[ ] WebSocket update is emitted if relevant
[ ] Documentation is updated if needed
```

---

## 12. Final Rule

When in doubt, prefer:

```text
Clear structure over clever shortcuts.
Explicit contracts over assumptions.
Small modules over large files.
Documented behavior over hidden behavior.
```
