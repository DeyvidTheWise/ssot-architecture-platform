import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
  requireProjectPermission,
  withProjectAccessFromProjectParam
} from "../../middleware/project-authorization";
import { validate } from "../../middleware/validate";
import { projectMembersController } from "./project-members.controller";
import { addProjectMemberSchema } from "./project-members.validation";

const projectMembersRouter = Router({ mergeParams: true });

projectMembersRouter.use(authenticate, withProjectAccessFromProjectParam());

projectMembersRouter.get("/", requireProjectPermission("project:read"), projectMembersController.listMembers);
projectMembersRouter.post("/", requireProjectPermission("members:manage"), validate(addProjectMemberSchema), projectMembersController.addMember);
projectMembersRouter.delete("/:memberId", requireProjectPermission("members:manage"), projectMembersController.removeMember);

export { projectMembersRouter };