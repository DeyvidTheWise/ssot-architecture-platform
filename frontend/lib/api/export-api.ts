import { apiClient } from "@/lib/api/client";
import type { ExportFormat, ExportPackageDto } from "@/types/dto";

export const exportApi = {
  create: (projectId: string, payload: { format: ExportFormat; sections: string[] }): Promise<ExportPackageDto> =>
    apiClient.post(`/projects/${projectId}/export`, payload),
  listByProject: (projectId: string): Promise<ExportPackageDto[]> => apiClient.get(`/projects/${projectId}/exports`),
  getById: (exportId: string): Promise<ExportPackageDto> => apiClient.get(`/exports/${exportId}`)
};