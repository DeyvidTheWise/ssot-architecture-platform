import { apiClient } from "@/lib/api/client";
import type { ArtifactRelationDto, RelationType } from "@/types/dto";

export interface ArtifactGraphRelationsDto {
  artifactId: string;
  nodes: Array<{ id: string; label: string; type: string; status: string }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    description?: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export const relationApi = {
  listByArtifact: (artifactId: string): Promise<ArtifactGraphRelationsDto> => apiClient.get(`/artifacts/${artifactId}/relations`),
  create: (
    artifactId: string,
    payload: { sourceArtifactId: string; targetArtifactId: string; relationType: RelationType; description?: string }
  ): Promise<ArtifactRelationDto> => apiClient.post(`/artifacts/${artifactId}/relations`, payload),
  remove: (relationId: string): Promise<{ id: string }> => apiClient.delete(`/relations/${relationId}`)
};