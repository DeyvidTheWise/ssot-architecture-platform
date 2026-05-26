import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
  requireProjectPermission,
  withProjectAccessFromProjectParam
} from "../../middleware/project-authorization";
import { validate } from "../../middleware/validate";
import { projectsController } from "./projects.controller";
import { createProjectSchema, updateProjectSchema } from "./projects.validation";

const projectsRouter = Router();

projectsRouter.use(authenticate);

projectsRouter.post("/", validate(createProjectSchema), projectsController.createProject);
projectsRouter.get("/", projectsController.listProjects);
projectsRouter.get("/:projectId", withProjectAccessFromProjectParam(), requireProjectPermission("project:read"), projectsController.getProjectById);
projectsRouter.patch("/:projectId", withProjectAccessFromProjectParam(), requireProjectPermission("project:update"), validate(updateProjectSchema), projectsController.updateProject);
projectsRouter.delete("/:projectId", withProjectAccessFromProjectParam(), requireProjectPermission("project:delete"), projectsController.deleteProject);

export { projectsRouter };