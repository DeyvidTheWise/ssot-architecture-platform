import { apiClient } from "@/lib/api/client";
import type { ValidationCategory, ValidationIssueDto, ValidationIssueStatus, ValidationSeverity } from "@/types/dto";

export interface ValidationSummaryDto {
  total: number;
  info: number;
  warning: number;
  error: number;
  critical: number;
}

export const validationApi = {
  runByProject: (projectId: string): Promise<ValidationSummaryDto> => apiClient.post(`/projects/${projectId}/validate`),
  listByProject: (
    projectId: string,
    filters?: { status?: ValidationIssueStatus; severity?: ValidationSeverity; category?: ValidationCategory }
  ): Promise<ValidationIssueDto[]> => {
    const query = new URLSearchParams();
    if (filters?.status) query.set("status", filters.status);
    if (filters?.severity) query.set("severity", filters.severity);
    if (filters?.category) query.set("category", filters.category);
    const suffix = query.toString();
    return apiClient.get(`/projects/${projectId}/validation-issues${suffix ? `?${suffix}` : ""}`);
  },
  updateIssue: (issueId: string, status: "RESOLVED" | "IGNORED"): Promise<ValidationIssueDto> =>
    apiClient.patch(`/validation-issues/${issueId}`, { status })
};