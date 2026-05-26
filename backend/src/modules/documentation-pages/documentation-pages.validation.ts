import { z } from "zod";

export const upsertDocumentationSchema = z.object({
  body: z.object({
    markdownContent: z.string().min(1),
    renderedHtml: z.string().optional()
  })
});