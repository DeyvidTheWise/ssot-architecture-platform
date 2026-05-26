import { apiClient } from "@/lib/api/client";
import type { ProjectDto, ProjectMemberDto, ProjectRole } from "@/types/dto";

export const projectApi = {
  list: (): Promise<ProjectDto[]> => apiClient.get("/projects"),
  create: (payload: { name: string; description?: string }): Promise<ProjectDto> => apiClient.post("/projects", payload),
  getById: (projectId: string): Promise<ProjectDto> => apiClient.get(`/projects/${projectId}`),
  update: (projectId: string, payload: { name?: string; description?: string }): Promise<ProjectDto> =>
    apiClient.patch(`/projects/${projectId}`, payload),
  remove: (projectId: string): Promise<{ id: string }> => apiClient.delete(`/projects/${projectId}`),
  listMembers: (projectId: string): Promise<ProjectMemberDto[]> => apiClient.get(`/projects/${projectId}/members`),
  addMember: (projectId: string, payload: { userId: string; role: ProjectRole }): Promise<ProjectMemberDto> =>
    apiClient.post(`/projects/${projectId}/members`, payload),
  removeMember: (projectId: string, memberId: string): Promise<{ id: string }> =>
    apiClient.delete(`/projects/${projectId}/members/${memberId}`)
};