import { z } from "zod";

export const addProjectMemberSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    role: z.enum(["OWNER", "ARCHITECT", "DEVELOPER", "VIEWER"])
  })
});