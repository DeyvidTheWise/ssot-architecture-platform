# FRONTEND_UI_IMPLEMENTATION_CONTRACT.md

## Purpose

This document defines exactly what the frontend must implement for the **SSOT Architecture Platform**.

The frontend is a Next.js application that consumes a separate Express.js backend through REST APIs and WebSocket events.  
The frontend must not contain database logic or backend business rules. It displays, edits, validates, visualizes, and exports software engineering artifacts through the backend API.

---

## 1. Frontend Technology Requirements

Use the following stack:

```text
Next.js App Router
React
TypeScript
Tailwind CSS
shadcn/ui
React Flow
Monaco Editor or similar code editor
Markdown editor with live preview
Mermaid rendering
Zustand or React Query for client state
REST API client wrapper
WebSocket client
```

Recommended UI style:

```text
Modern SaaS dashboard
Dark/light mode support
Left sidebar navigation
Top project/action bar
Card-based layouts
Graph-first visual experience
Clean engineering aesthetic
```

---

## 2. Global Frontend Rules

```text
1. Frontend must never access the database directly.
2. All data must be loaded through REST API endpoints.
3. Reusable API client functions must be placed in /src/lib/api.
4. Shared TypeScript types must be placed in /src/types.
5. Forms must validate inputs before sending requests.
6. Backend validation errors must be displayed clearly.
7. Loading, empty, error, and success states must exist for all major pages.
8. Components must be reusable and not tied to one page unless necessary.
9. Business logic must stay out of presentational components.
10. WebSocket updates should refresh affected views without full page reloads.
```

---

## 3. Suggested Frontend Folder Structure

```text
/frontend
  /src
    /app
      /(auth)
        /login
        /register
      /(dashboard)
        /dashboard
        /projects
        /projects/[projectId]
        /projects/[projectId]/artifacts
        /projects/[projectId]/graph
        /projects/[projectId]/docs/[artifactId]
        /projects/[projectId]/api
        /projects/[projectId]/diagrams
        /projects/[projectId]/database
        /projects/[projectId]/validation
        /projects/[projectId]/versions
        /projects/[projectId]/export
    /components
      /layout
      /projects
      /artifacts
      /documents
      /graph
      /api
      /diagrams
      /database
      /validation
      /versions
      /export
      /shared
    /lib
      /api
      /auth
      /websocket
      /utils
    /types
    /hooks
    /store
```

---

## 4. Core Data Types

### User

```ts
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "architect" | "developer" | "viewer";
  createdAt: string;
  updatedAt: string;
};
```

### Project

```ts
type Project = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};
```

### Artifact

```ts
type Artifact = {
  id: string;
  projectId: string;
  title: string;
  type:
    | "documentation"
    | "api"
    | "endpoint"
    | "service"
    | "database"
    | "diagram"
    | "requirement"
    | "security_policy";
  description?: string;
  status: "draft" | "active" | "deprecated";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};
```

### ArtifactRelation

```ts
type ArtifactRelation = {
  id: string;
  sourceArtifactId: string;
  targetArtifactId: string;
  relationType:
    | "depends_on"
    | "documents"
    | "implements"
    | "uses"
    | "exposes"
    | "belongs_to"
    | "secures"
    | "communicates_with";
  description?: string;
  createdAt: string;
};
```

### DocumentationPage

```ts
type DocumentationPage = {
  id: string;
  artifactId: string;
  markdownContent: string;
  renderedHtml?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
};
```

### ApiSpec

```ts
type ApiSpec = {
  id: string;
  artifactId: string;
  format: "openapi" | "custom";
  rawContent: string;
  parsedContent?: unknown;
  version: number;
  createdAt: string;
  updatedAt: string;
};
```

### ApiEndpoint

```ts
type ApiEndpoint = {
  id: string;
  apiSpecId: string;
  artifactId?: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  summary?: string;
  requestSchema?: unknown;
  responseSchema?: unknown;
  requiresAuth: boolean;
  createdAt: string;
  updatedAt: string;
};
```

### Diagram

```ts
type Diagram = {
  id: string;
  artifactId: string;
  diagramType: "uml" | "erd" | "flow" | "architecture";
  sourceCode: string;
  renderedPreviewUrl?: string;
  createdAt: string;
  updatedAt: string;
};
```

### ValidationIssue

```ts
type ValidationIssue = {
  id: string;
  projectId: string;
  artifactId?: string;
  severity: "info" | "warning" | "error" | "critical";
  category: "api" | "database" | "security" | "documentation" | "architecture";
  message: string;
  status: "open" | "resolved" | "ignored";
  createdAt: string;
  updatedAt: string;
};
```

### VersionHistory

```ts
type VersionHistory = {
  id: string;
  entityType: string;
  entityId: string;
  changeType: "created" | "updated" | "deleted" | "linked" | "unlinked";
  oldValue?: unknown;
  newValue?: unknown;
  changedBy: string;
  createdAt: string;
};
```

---

## 5. Standard API Response Shape

All frontend API client functions must expect this structure:

### Success

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {}
  }
}
```

---

## 6. Authentication Pages

### Page: `/login`

Purpose:

```text
Allow existing users to authenticate.
```

UI elements:

```text
Email input
Password input
Login button
Error message area
Link to register
```

API:

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Deyvid",
      "lastName": "Popov",
      "role": "admin"
    }
  }
}
```

Frontend behavior:

```text
Store JWT securely according to selected auth strategy.
Redirect to /dashboard after successful login.
Show backend error message on failed login.
```

---

### Page: `/register`

Purpose:

```text
Allow user registration.
```

UI elements:

```text
First name input
Last name input
Email input
Password input
Confirm password input
Register button
Link to login
```

API:

```http
POST /api/auth/register
```

Request:

```json
{
  "firstName": "Deyvid",
  "lastName": "Popov",
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Deyvid",
    "lastName": "Popov",
    "role": "developer"
  }
}
```

Frontend behavior:

```text
Validate password confirmation locally.
Redirect to /login or /dashboard depending on backend behavior.
```

---

## 7. Dashboard Page

### Page: `/dashboard`

Purpose:

```text
Main overview of user projects, recent activity, and validation status.
```

UI sections:

```text
Project cards
Recent artifacts
Open validation issues
Quick search
Create project button
```

APIs:

```http
GET /api/projects
GET /api/dashboard/summary
```

Example response for dashboard summary:

```json
{
  "success": true,
  "data": {
    "projectCount": 3,
    "artifactCount": 42,
    "openValidationIssues": 7,
    "recentActivity": [
      {
        "id": "uuid",
        "type": "artifact_updated",
        "message": "Authentication API was updated",
        "createdAt": "2026-05-26T10:00:00.000Z"
      }
    ]
  }
}
```

Acceptance criteria:

```text
User can see all accessible projects.
User can create a new project.
User can navigate to project workspace.
Dashboard handles empty state.
```

---

## 8. Projects Pages

### Page: `/projects`

Purpose:

```text
Show all projects available to the current user.
```

APIs:

```http
GET /api/projects
POST /api/projects
```

Create project request:

```json
{
  "name": "Diploma Platform",
  "description": "Integrated software documentation and architecture platform"
}
```

Project list response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Diploma Platform",
      "description": "Integrated software documentation and architecture platform",
      "ownerId": "uuid",
      "createdAt": "2026-05-26T10:00:00.000Z",
      "updatedAt": "2026-05-26T10:00:00.000Z"
    }
  ]
}
```

---

### Page: `/projects/[projectId]`

Purpose:

```text
Project workspace landing page.
```

UI sections:

```text
Project title and description
Artifact count
Knowledge graph preview
Open validation issues
Recent versions
Navigation cards to modules
```

APIs:

```http
GET /api/projects/:projectId
GET /api/projects/:projectId/summary
```

---

## 9. Artifacts Page

### Page: `/projects/[projectId]/artifacts`

Purpose:

```text
Create, view, edit, filter, and connect artifacts.
```

UI elements:

```text
Artifact table/list
Create artifact button
Type filter
Status filter
Search input
Artifact detail drawer
Relation editor
```

APIs:

```http
GET    /api/projects/:projectId/artifacts
POST   /api/projects/:projectId/artifacts
GET    /api/artifacts/:artifactId
PATCH  /api/artifacts/:artifactId
DELETE /api/artifacts/:artifactId
```

Create artifact request:

```json
{
  "title": "Authentication Service",
  "type": "service",
  "description": "Handles user login, registration, and JWT authentication",
  "status": "active"
}
```

Update artifact request:

```json
{
  "title": "Authentication Service",
  "description": "Updated service description",
  "status": "active"
}
```

Artifact response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "title": "Authentication Service",
    "type": "service",
    "description": "Handles user login, registration, and JWT authentication",
    "status": "active",
    "createdBy": "uuid",
    "createdAt": "2026-05-26T10:00:00.000Z",
    "updatedAt": "2026-05-26T10:00:00.000Z"
  }
}
```

Acceptance criteria:

```text
User can create artifacts.
User can edit artifacts.
User can delete artifacts after confirmation.
User can filter by type and status.
User can open artifact detail drawer.
```

---

## 10. Artifact Relations

Purpose:

```text
Create the knowledge graph between artifacts.
```

Frontend components:

```text
RelationEditor
RelationList
RelationCreateDialog
```

APIs:

```http
GET    /api/artifacts/:artifactId/relations
POST   /api/artifacts/:artifactId/relations
DELETE /api/relations/:relationId
```

Create relation request:

```json
{
  "targetArtifactId": "uuid",
  "relationType": "depends_on",
  "description": "Authentication Service depends on User Database"
}
```

Relation response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "sourceArtifactId": "uuid",
    "targetArtifactId": "uuid",
    "relationType": "depends_on",
    "description": "Authentication Service depends on User Database",
    "createdAt": "2026-05-26T10:00:00.000Z"
  }
}
```

Acceptance criteria:

```text
User can connect two artifacts.
User can choose relation type.
User can delete a relation.
Graph page updates after relation changes.
```

---

## 11. Knowledge Graph Page

### Page: `/projects/[projectId]/graph`

Purpose:

```text
Visualize interconnected artifacts as an interactive graph.
```

UI elements:

```text
React Flow canvas
Node type legend
Relation type legend
Search/highlight artifact
Filter by artifact type
Filter by relation type
Node detail side panel
Mini-map
Zoom controls
Auto-layout button
```

API:

```http
GET /api/projects/:projectId/graph
```

Response:

```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "artifact-uuid",
        "label": "Authentication Service",
        "type": "service",
        "status": "active",
        "metadata": {
          "description": "Handles auth"
        }
      }
    ],
    "edges": [
      {
        "id": "relation-uuid",
        "source": "source-artifact-uuid",
        "target": "target-artifact-uuid",
        "type": "depends_on",
        "label": "depends_on"
      }
    ]
  }
}
```

Acceptance criteria:

```text
Graph renders all artifacts as nodes.
Graph renders relations as edges.
Clicking node opens detail panel.
Filters affect visible graph.
Graph works with empty project state.
```

---

## 12. Documentation Editor Page

### Page: `/projects/[projectId]/docs/[artifactId]`

Purpose:

```text
Edit Markdown documentation connected to an artifact.
```

UI elements:

```text
Markdown editor
Live preview
Save button
Autosave indicator
Mermaid preview support
Version number
Relation sidebar
```

APIs:

```http
GET   /api/artifacts/:artifactId/documentation
PUT   /api/artifacts/:artifactId/documentation
```

Update documentation request:

```json
{
  "markdownContent": "# Authentication Service\n\nThis service handles login and JWT generation."
}
```

Response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "artifactId": "uuid",
    "markdownContent": "# Authentication Service\n\nThis service handles login and JWT generation.",
    "renderedHtml": "<h1>Authentication Service</h1><p>This service handles login and JWT generation.</p>",
    "version": 2,
    "createdAt": "2026-05-26T10:00:00.000Z",
    "updatedAt": "2026-05-26T10:05:00.000Z"
  }
}
```

Acceptance criteria:

```text
User can edit and save Markdown.
Preview updates while typing.
Mermaid diagrams render in preview.
Save creates version history.
```

---

## 13. API Module Page

### Page: `/projects/[projectId]/api`

Purpose:

```text
Import and inspect API specifications and endpoints.
```

UI elements:

```text
OpenAPI upload/import area
Manual API spec creation
Endpoint table
Method/path filters
Endpoint detail panel
Link endpoint to artifact
```

APIs:

```http
GET  /api/projects/:projectId/api-specs
POST /api/projects/:projectId/api-specs
GET  /api/api-specs/:apiSpecId/endpoints
POST /api/api-specs/:apiSpecId/parse
```

Create/import API spec request:

```json
{
  "artifactId": "uuid",
  "format": "openapi",
  "rawContent": "openapi: 3.0.0\ninfo:\n  title: Auth API\n  version: 1.0.0\npaths:\n  /auth/login:\n    post:\n      summary: Login user"
}
```

Endpoint response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "apiSpecId": "uuid",
      "artifactId": "uuid",
      "method": "POST",
      "path": "/auth/login",
      "summary": "Login user",
      "requestSchema": {},
      "responseSchema": {},
      "requiresAuth": false,
      "createdAt": "2026-05-26T10:00:00.000Z",
      "updatedAt": "2026-05-26T10:00:00.000Z"
    }
  ]
}
```

Acceptance criteria:

```text
User can add OpenAPI raw content.
Frontend can trigger backend parsing.
Parsed endpoints appear in a table.
Endpoints can be linked to artifacts.
```

---

## 14. Diagram Page

### Page: `/projects/[projectId]/diagrams`

Purpose:

```text
Create and render UML, ERD, flow, and architecture diagrams.
```

UI elements:

```text
Diagram list
Create diagram button
Diagram type selector
Source code editor
Live Mermaid preview
Save button
```

APIs:

```http
GET  /api/projects/:projectId/diagrams
POST /api/projects/:projectId/diagrams
GET  /api/diagrams/:diagramId
PATCH /api/diagrams/:diagramId
DELETE /api/diagrams/:diagramId
```

Create diagram request:

```json
{
  "artifactId": "uuid",
  "diagramType": "architecture",
  "sourceCode": "graph TD\nA[Frontend] --> B[Backend]\nB --> C[PostgreSQL]"
}
```

Diagram response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "artifactId": "uuid",
    "diagramType": "architecture",
    "sourceCode": "graph TD\nA[Frontend] --> B[Backend]\nB --> C[PostgreSQL]",
    "renderedPreviewUrl": null,
    "createdAt": "2026-05-26T10:00:00.000Z",
    "updatedAt": "2026-05-26T10:00:00.000Z"
  }
}
```

Acceptance criteria:

```text
User can create diagrams.
User can edit Mermaid source.
Preview renders source code.
Diagram is linked to artifact.
```

---

## 15. Database Modeling Page

### Page: `/projects/[projectId]/database`

Purpose:

```text
Display database models, entities, fields, and validation information.
```

UI elements:

```text
Database model list
Entity/table list
Field viewer
Relation viewer
Normalization status
Validation warnings
```

APIs:

```http
GET  /api/projects/:projectId/database-models
POST /api/projects/:projectId/database-models
GET  /api/database-models/:databaseModelId/entities
POST /api/database-models/:databaseModelId/entities
```

Create database entity request:

```json
{
  "name": "User",
  "type": "table",
  "fieldsJson": [
    {
      "name": "id",
      "type": "uuid",
      "primaryKey": true
    },
    {
      "name": "email",
      "type": "varchar",
      "unique": true
    }
  ],
  "relationsJson": [],
  "normalizationStatus": "3NF"
}
```

Acceptance criteria:

```text
User can view database model structure.
User can create entities/tables.
User can inspect fields.
User can see normalization or validation status.
```

---

## 16. Validation Page

### Page: `/projects/[projectId]/validation`

Purpose:

```text
Show cross-module consistency and architecture validation results.
```

UI elements:

```text
Run validation button
Issue summary cards
Issue table
Severity filter
Category filter
Resolve/ignore controls
Linked artifact button
```

APIs:

```http
POST  /api/projects/:projectId/validate
GET   /api/projects/:projectId/validation-issues
PATCH /api/validation-issues/:issueId
```

Run validation response:

```json
{
  "success": true,
  "data": {
    "issuesCreated": 3,
    "issues": [
      {
        "id": "uuid",
        "projectId": "uuid",
        "artifactId": "uuid",
        "severity": "warning",
        "category": "api",
        "message": "API endpoint exists without linked documentation.",
        "status": "open",
        "createdAt": "2026-05-26T10:00:00.000Z",
        "updatedAt": "2026-05-26T10:00:00.000Z"
      }
    ]
  }
}
```

Update issue request:

```json
{
  "status": "resolved"
}
```

Acceptance criteria:

```text
User can run validation.
Issues are grouped by severity and category.
User can resolve or ignore issues.
Issue can navigate to related artifact.
```

---

## 17. Version History Page

### Page: `/projects/[projectId]/versions`

Purpose:

```text
Show traceability and evolution of artifacts.
```

UI elements:

```text
Timeline
Entity type filter
Change type filter
Artifact filter
Diff viewer
```

APIs:

```http
GET /api/projects/:projectId/versions
GET /api/versions/:versionId
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "entityType": "Artifact",
      "entityId": "uuid",
      "changeType": "updated",
      "oldValue": {
        "title": "Auth Service"
      },
      "newValue": {
        "title": "Authentication Service"
      },
      "changedBy": "uuid",
      "createdAt": "2026-05-26T10:00:00.000Z"
    }
  ]
}
```

Acceptance criteria:

```text
User can see historical changes.
User can filter by entity/change type.
User can inspect old and new values.
```

---

## 18. Export Page

### Page: `/projects/[projectId]/export`

Purpose:

```text
Generate Single Source of Truth export package.
```

UI elements:

```text
Export options
Include documentation checkbox
Include API specs checkbox
Include diagrams checkbox
Include validation report checkbox
Export button
Export history list
Download button
```

APIs:

```http
POST /api/projects/:projectId/export
GET  /api/projects/:projectId/exports
GET  /api/exports/:exportId/download
```

Export request:

```json
{
  "includeDocumentation": true,
  "includeApiSpecs": true,
  "includeDiagrams": true,
  "includeValidationReport": true,
  "format": "json"
}
```

Export response:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "projectId": "uuid",
    "format": "json",
    "status": "completed",
    "downloadUrl": "/api/exports/uuid/download",
    "createdAt": "2026-05-26T10:00:00.000Z"
  }
}
```

Acceptance criteria:

```text
User can configure export.
User can trigger SSOT export.
User can download generated package.
Export history is visible.
```

---

## 19. Search

Purpose:

```text
Search across projects, artifacts, documentation, APIs, diagrams, and validation issues.
```

UI component:

```text
GlobalSearchBar
```

API:

```http
GET /api/projects/:projectId/search?q=authentication&type=artifact
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "resultType": "artifact",
      "id": "uuid",
      "title": "Authentication Service",
      "description": "Handles login and JWT authentication",
      "url": "/projects/uuid/artifacts?selected=uuid"
    }
  ]
}
```

Acceptance criteria:

```text
Search works from project workspace.
Results are grouped by type.
Clicking a result navigates to the correct page.
```

---

## 20. WebSocket Events

WebSocket connection:

```text
ws://backend-url/ws
```

Frontend must listen for:

```text
artifact.created
artifact.updated
artifact.deleted
relation.created
relation.deleted
validation.completed
version.created
export.completed
```

Example event:

```json
{
  "event": "artifact.updated",
  "projectId": "uuid",
  "payload": {
    "artifactId": "uuid",
    "title": "Authentication Service"
  }
}
```

Frontend behavior:

```text
If user is inside affected project, refresh related data.
Show small notification/toast for relevant updates.
Do not full reload the page.
```

---

## 21. Navigation Layout

Global layout:

```text
Left sidebar:
- Dashboard
- Projects
- Current Project
  - Overview
  - Artifacts
  - Knowledge Graph
  - Documentation
  - APIs
  - Diagrams
  - Database
  - Validation
  - Versions
  - Export

Top bar:
- Current project selector
- Global search
- User menu
- Theme toggle
```

---

## 22. Required Reusable Components

```text
AppShell
Sidebar
TopBar
ProjectCard
ProjectCreateDialog
ArtifactTable
ArtifactCreateDialog
ArtifactDetailDrawer
RelationEditor
GraphViewer
MarkdownEditor
MarkdownPreview
ApiSpecImporter
EndpointTable
DiagramEditor
DatabaseEntityTable
ValidationIssueTable
VersionTimeline
ExportPanel
GlobalSearchBar
LoadingState
EmptyState
ErrorState
ConfirmDialog
```

---

## 23. UI Acceptance Criteria

The frontend is considered acceptable when:

```text
1. User can register and login.
2. User can create and open projects.
3. User can create, edit, and delete artifacts.
4. User can connect artifacts with relationships.
5. User can view the knowledge graph.
6. User can write documentation in Markdown.
7. User can import or create API specifications.
8. User can create diagrams.
9. User can view database models.
10. User can run validation and inspect issues.
11. User can view version history.
12. User can export a Single Source of Truth package.
13. Frontend displays loading, error, and empty states.
14. Frontend consumes the backend API only through centralized API client functions.
15. WebSocket updates are reflected without full reload.
```

---

## 24. Instruction for Claude / Frontend AI

Use this exact instruction when giving this document to a frontend AI:

```text
Build the Next.js frontend for the SSOT Architecture Platform using this document as the implementation contract.

Do not invent backend endpoints.
Do not access the database directly.
Use only the API endpoints and payloads described here.
Create reusable components.
Use mock data only if the backend is not available yet, but keep the API client structure ready.
Focus on clean SaaS UI, graph visualization, documentation editing, and clear engineering workflows.
All pages must include loading, empty, and error states.
Use TypeScript strictly.
```

---

## 25. Implementation Priority

Recommended build order:

```text
1. App layout, sidebar, topbar
2. Auth pages
3. Project list and project detail page
4. Artifact CRUD
5. Relation editor
6. Knowledge graph page
7. Documentation editor
8. API module
9. Diagram module
10. Database module
11. Validation page
12. Version history
13. Export page
14. WebSocket integration
15. UI polish
```
