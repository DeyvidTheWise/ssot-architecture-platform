import { z } from "zod";

export const createRelationSchema = z.object({
  body: z.object({
    sourceArtifactId: z.string().uuid(),
    targetArtifactId: z.string().uuid(),
    relationType: z.enum([
      "DEPENDS_ON",
      "DOCUMENTS",
      "IMPLEMENTS",
      "USES",
      "EXPOSES",
      "BELONGS_TO",
      "SECURES",
      "VALIDATES",
      "COMMUNICATES_WITH"
    ]),
    description: z.string().optional()
  })
});