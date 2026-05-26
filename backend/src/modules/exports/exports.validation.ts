import { z } from "zod";

const exportSectionSchema = z.enum([
  "ARTIFACTS",
  "RELATIONS",
  "GRAPH",
  "API_SPECS",
  "DIAGRAMS",
  "VALIDATION_REPORT",
  "VERSION_HISTORY"
]);

export const createExportSchema = z.object({
  body: z.object({
    format: z.enum(["JSON", "MARKDOWN", "ZIP"]),
    sections: z.array(exportSectionSchema).min(1)
  })
});