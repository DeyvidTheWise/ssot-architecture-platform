import { z } from "zod";

export const validationIssueQuerySchema = z.object({
  query: z.object({
    status: z.enum(["OPEN", "RESOLVED", "IGNORED"]).optional(),
    severity: z.enum(["INFO", "WARNING", "ERROR", "CRITICAL"]).optional(),
    category: z.enum(["DOCUMENTATION", "API", "DATABASE", "SECURITY", "ARCHITECTURE", "RELATIONSHIP", "VERSIONING"]).optional()
  })
});

export const updateValidationIssueSchema = z.object({
  body: z.object({
    status: z.enum(["RESOLVED", "IGNORED"])
  })
});