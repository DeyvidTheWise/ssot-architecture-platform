import { z } from "zod";

export const createArtifactSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    type: z.enum([
      "DOCUMENTATION",
      "API_SPEC",
      "API_ENDPOINT",
      "SERVICE",
      "DATABASE_MODEL",
      "DATABASE_ENTITY",
      "DIAGRAM",
      "REQUIREMENT",
      "SECURITY_POLICY",
      "MODULE",
      "EXTERNAL_SYSTEM",
      "DEPLOYMENT"
    ]),
    description: z.string().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "DEPRECATED", "ARCHIVED"])
  })
});

export const updateArtifactSchema = z.object({
  body: z
    .object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      status: z.enum(["DRAFT", "ACTIVE", "DEPRECATED", "ARCHIVED"]).optional()
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required"
    })
});