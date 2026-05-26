import { apiClient } from "@/lib/api/client";
import type { ArtifactDto, ArtifactStatus, ArtifactType } from "@/types/dto";

export const artifactApi = {
  listByProject: (projectId: string, params?: { type?: ArtifactType; status?: ArtifactStatus; q?: string }): Promise<ArtifactDto[]> => {
    const query = new URLSearchParams();
    if (params?.type) query.set("type", params.type);
    if (params?.status) query.set("status", params.status);
    if (params?.q) query.set("q", params.q);
    const suffix = query.toString();
    return apiClient.get(`/projects/${projectId}/artifacts${suffix ? `?${suffix}` : ""}`);
  },
  create: (
    projectId: string,
    payload: { title: string; type: ArtifactType; description?: string; status: ArtifactStatus }
  ): Promise<ArtifactDto> => apiClient.post(`/projects/${projectId}/artifacts`, payload),
  getById: (artifactId: string): Promise<ArtifactDto> => apiClient.get(`/artifacts/${artifactId}`),
  update: (artifactId: string, payload: { title?: string; description?: string; status?: ArtifactStatus }): Promise<ArtifactDto> =>
    apiClient.patch(`/artifacts/${artifactId}`, payload),
  remove: (artifactId: string): Promise<{ id: string }> => apiClient.delete(`/artifacts/${artifactId}`)
};