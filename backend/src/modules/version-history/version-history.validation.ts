import { z } from "zod";

export const projectVersionQuerySchema = z.object({
  query: z.object({
    entityType: z.string().optional(),
    changeType: z.enum(["CREATED", "UPDATED", "DELETED", "LINKED", "UNLINKED", "IMPORTED", "VALIDATED", "EXPORTED"]).optional()
  })
});