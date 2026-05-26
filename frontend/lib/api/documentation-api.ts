import { apiClient } from "@/lib/api/client";
import type { DocumentationPageDto } from "@/types/dto";

export interface ArtifactDocumentationDto {
  artifact: {
    id: string;
    title: string;
    type: string;
    status: string;
  };
  documentation: DocumentationPageDto | null;
}

export const documentationApi = {
  listByProject: (projectId: string): Promise<ArtifactDocumentationDto[]> => apiClient.get(`/projects/${projectId}/docs`),
  getByArtifact: (artifactId: string): Promise<ArtifactDocumentationDto> => apiClient.get(`/artifacts/${artifactId}/documentation`),
  upsertByArtifact: (artifactId: string, payload: { markdownContent: string; renderedHtml?: string }): Promise<ArtifactDocumentationDto> =>
    apiClient.put(`/artifacts/${artifactId}/documentation`, payload)
};