import { z } from "zod";

export const linkApiEndpointArtifactSchema = z.object({
  body: z.object({
    artifactId: z.string().uuid()
  })
});