import { z } from "zod";

export const importApiSpecSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    format: z.enum(["OPENAPI", "CUSTOM"]),
    rawContent: z.string().min(1),
    artifactId: z.string().uuid().optional()
  })
});