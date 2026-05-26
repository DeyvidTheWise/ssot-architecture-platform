import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
  requireProjectPermission,
  withProjectAccessFromArtifactParam,
  withProjectAccessFromProjectParam
} from "../../middleware/project-authorization";
import { validate } from "../../middleware/validate";
import { artifactsController } from "./artifacts.controller";
import { createArtifactSchema, updateArtifactSchema } from "./artifacts.validation";

const projectArtifactsRouter = Router({ mergeParams: true });
const artifactsRouter = Router();

projectArtifactsRouter.use(authenticate, withProjectAccessFromProjectParam());
projectArtifactsRouter.post("/", requireProjectPermission("artifact:write"), validate(createArtifactSchema), artifactsController.createArtifact);
projectArtifactsRouter.get("/", requireProjectPermission("project:read"), artifactsController.listArtifacts);

artifactsRouter.use(authenticate);
artifactsRouter.get("/:artifactId", withProjectAccessFromArtifactParam(), requireProjectPermission("project:read"), artifactsController.getArtifactById);
artifactsRouter.patch("/:artifactId", withProjectAccessFromArtifactParam(), requireProjectPermission("artifact:write"), validate(updateArtifactSchema), artifactsController.updateArtifact);
artifactsRouter.delete("/:artifactId", withProjectAccessFromArtifactParam(), requireProjectPermission("artifact:delete"), artifactsController.deleteArtifact);

export { artifactsRouter, projectArtifactsRouter };