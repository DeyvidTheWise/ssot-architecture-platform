import { apiClient } from "@/lib/api/client";
import type { VersionHistoryDto } from "@/types/dto";

export const versionApi = {
  listByProject: (projectId: string, filters?: { entityType?: string; changeType?: string }): Promise<VersionHistoryDto[]> => {
    const query = new URLSearchParams();
    if (filters?.entityType) query.set("entityType", filters.entityType);
    if (filters?.changeType) query.set("changeType", filters.changeType);
    const suffix = query.toString();
    return apiClient.get(`/projects/${projectId}/versions${suffix ? `?${suffix}` : ""}`);
  },
  listByArtifact: (artifactId: string): Promise<VersionHistoryDto[]> => apiClient.get(`/artifacts/${artifactId}/versions`)
};