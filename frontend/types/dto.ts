export type ProjectRole = "OWNER" | "ARCHITECT" | "DEVELOPER" | "VIEWER";

export type ArtifactType =
  | "DOCUMENTATION"
  | "API_SPEC"
  | "API_ENDPOINT"
  | "SERVICE"
  | "DATABASE_MODEL"
  | "DATABASE_ENTITY"
  | "DIAGRAM"
  | "REQUIREMENT"
  | "SECURITY_POLICY"
  | "MODULE"
  | "EXTERNAL_SYSTEM"
  | "DEPLOYMENT";

export type ArtifactStatus = "DRAFT" | "ACTIVE" | "DEPRECATED" | "ARCHIVED";

export type RelationType =
  | "DEPENDS_ON"
  | "DOCUMENTS"
  | "IMPLEMENTS"
  | "USES"
  | "EXPOSES"
  | "BELONGS_TO"
  | "SECURES"
  | "REPRESENTS"
  | "VALIDATES"
  | "COMMUNICATES_WITH"
  | "STORES_DATA_IN"
  | "GENERATED_FROM";

export type ApiSpecFormat = "OPENAPI" | "CUSTOM";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

export type DiagramType = "MERMAID" | "UML" | "ERD" | "ARCHITECTURE_FLOW" | "SEQUENCE" | "COMPONENT";

export type ValidationSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export type ValidationCategory =
  | "DOCUMENTATION"
  | "API"
  | "DATABASE"
  | "SECURITY"
  | "ARCHITECTURE"
  | "RELATIONSHIP"
  | "VERSIONING";

export type ValidationIssueStatus = "OPEN" | "RESOLVED" | "IGNORED";

export type ExportFormat = "JSON" | "MARKDOWN" | "ZIP";

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "ARCHITECT" | "DEVELOPER" | "VIEWER";
}

export interface ProjectDto {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMemberDto {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  createdAt: string;
  updatedAt: string;
  user?: UserDto;
}

export interface ArtifactDto {
  id: string;
  projectId: string;
  title: string;
  type: ArtifactType;
  description?: string | null;
  status: ArtifactStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArtifactRelationDto {
  id: string;
  projectId: string;
  sourceArtifactId: string;
  targetArtifactId: string;
  relationType: RelationType;
  description?: string | null;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentationPageDto {
  id: string;
  projectId: string;
  artifactId: string;
  markdownContent: string;
  renderedHtml?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiSpecDto {
  id: string;
  projectId: string;
  artifactId?: string | null;
  name: string;
  format: ApiSpecFormat;
  rawContent: string;
  parsedContent?: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface ApiEndpointDto {
  id: string;
  apiSpecId: string;
  artifactId?: string | null;
  method: HttpMethod;
  path: string;
  summary?: string | null;
  requestSchema?: unknown;
  responseSchema?: unknown;
  requiresAuth: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiagramDto {
  id: string;
  projectId: string;
  artifactId?: string | null;
  title: string;
  diagramType: DiagramType;
  sourceCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface GraphNodeDto {
  id: string;
  label: string;
  type: ArtifactType;
  status: ArtifactStatus;
}

export interface GraphEdgeDto {
  id: string;
  source: string;
  target: string;
  type: RelationType;
  label: string;
}

export interface ValidationIssueDto {
  id: string;
  projectId: string;
  artifactId?: string | null;
  severity: ValidationSeverity;
  category: ValidationCategory;
  message: string;
  status: ValidationIssueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface VersionHistoryDto {
  id: string;
  projectId: string;
  entityType: string;
  entityId: string;
  changeType: "CREATED" | "UPDATED" | "DELETED" | "LINKED" | "UNLINKED" | "IMPORTED" | "VALIDATED" | "EXPORTED";
  oldValue?: unknown;
  newValue?: unknown;
  changedById: string;
  createdAt: string;
}

export interface ExportPackageDto {
  id: string;
  projectId: string;
  format: ExportFormat;
  sections: string[];
  content: unknown;
  createdById: string;
  createdAt: string;
}