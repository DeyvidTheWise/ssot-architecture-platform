import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
  requireProjectPermission,
  withProjectAccessFromArtifactParam,
  withProjectAccessFromProjectParam
} from "../../middleware/project-authorization";
import { validate } from "../../middleware/validate";
import { versionHistoryController } from "./version-history.controller";
import { projectVersionQuerySchema } from "./version-history.validation";

const projectVersionsRouter = Router({ mergeParams: true });
const artifactVersionsRouter = Router({ mergeParams: true });

projectVersionsRouter.use(authenticate, withProjectAccessFromProjectParam());
projectVersionsRouter.get("/", requireProjectPermission("project:read"), validate(projectVersionQuerySchema), versionHistoryController.listProjectVersions);

artifactVersionsRouter.use(authenticate, withProjectAccessFromArtifactParam());
artifactVersionsRouter.get("/", requireProjectPermission("project:read"), versionHistoryController.listArtifactVersions);

export { artifactVersionsRouter, projectVersionsRouter };