import { apiClient } from "@/lib/api/client";
import type { GraphEdgeDto, GraphNodeDto } from "@/types/dto";

export interface GraphDto {
  nodes: GraphNodeDto[];
  edges: GraphEdgeDto[];
}

export const graphApi = {
  getByProject: (projectId: string): Promise<GraphDto> => apiClient.get(`/projects/${projectId}/graph`)
};