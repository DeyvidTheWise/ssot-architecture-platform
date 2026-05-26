import { apiClient } from "@/lib/api/client";
import type { ApiEndpointDto, ApiSpecDto, ApiSpecFormat } from "@/types/dto";

export const apiSpecApi = {
  listByProject: (projectId: string): Promise<ApiSpecDto[]> => apiClient.get(`/projects/${projectId}/api-specs`),
  import: (projectId: string, payload: { name: string; format: ApiSpecFormat; rawContent: string; artifactId?: string }): Promise<ApiSpecDto> =>
    apiClient.post(`/projects/${projectId}/api-specs/import`, payload),
  getById: (apiSpecId: string): Promise<ApiSpecDto> => apiClient.get(`/api-specs/${apiSpecId}`),
  remove: (apiSpecId: string): Promise<{ id: string }> => apiClient.delete(`/api-specs/${apiSpecId}`),
  listEndpoints: (apiSpecId: string): Promise<ApiEndpointDto[]> => apiClient.get(`/api-specs/${apiSpecId}/endpoints`),
  linkEndpointArtifact: (apiEndpointId: string, artifactId: string): Promise<ApiEndpointDto> =>
    apiClient.patch(`/api-endpoints/${apiEndpointId}/link-artifact`, { artifactId })
};