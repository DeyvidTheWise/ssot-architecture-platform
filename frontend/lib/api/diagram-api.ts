import { apiClient } from "@/lib/api/client";
import type { DiagramDto, DiagramType } from "@/types/dto";

export const diagramApi = {
  listByProject: (projectId: string): Promise<DiagramDto[]> => apiClient.get(`/projects/${projectId}/diagrams`),
  create: (projectId: string, payload: { title: string; diagramType: DiagramType; sourceCode: string; artifactId?: string }): Promise<DiagramDto> =>
    apiClient.post(`/projects/${projectId}/diagrams`, payload),
  getById: (diagramId: string): Promise<DiagramDto> => apiClient.get(`/diagrams/${diagramId}`),
  update: (
    diagramId: string,
    payload: { title?: string; diagramType?: DiagramType; sourceCode?: string; artifactId?: string }
  ): Promise<DiagramDto> => apiClient.patch(`/diagrams/${diagramId}`, payload),
  remove: (diagramId: string): Promise<{ id: string }> => apiClient.delete(`/diagrams/${diagramId}`)
};