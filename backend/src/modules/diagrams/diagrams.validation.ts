import { z } from "zod";

const diagramTypeSchema = z.enum(["MERMAID", "UML", "ERD", "ARCHITECTURE_FLOW", "SEQUENCE", "COMPONENT"]);

export const createDiagramSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    diagramType: diagramTypeSchema,
    sourceCode: z.string().min(1),
    artifactId: z.string().uuid().optional()
  })
});

export const updateDiagramSchema = z.object({
  body: z
    .object({
      title: z.string().min(1).optional(),
      diagramType: diagramTypeSchema.optional(),
      sourceCode: z.string().min(1).optional(),
      artifactId: z.string().uuid().optional()
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required"
    })
});