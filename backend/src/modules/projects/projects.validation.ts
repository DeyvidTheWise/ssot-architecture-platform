import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional()
  })
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional()
  }).refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required"
  })
});