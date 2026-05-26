import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
  requireProjectPermission,
  withProjectAccessFromArtifactParam,
  withProjectAccessFromProjectParam
} from "../../middleware/project-authorization";
import { validate } from "../../middleware/validate";
import { documentationPagesController } from "./documentation-pages.controller";
import { upsertDocumentationSchema } from "./documentation-pages.validation";

const projectDocumentationRouter = Router({ mergeParams: true });
const artifactDocumentationRouter = Router({ mergeParams: true });

projectDocumentationRouter.use(authenticate, withProjectAccessFromProjectParam());
projectDocumentationRouter.get("/", requireProjectPermission("project:read"), documentationPagesController.listProjectDocumentation);

artifactDocumentationRouter.use(authenticate, withProjectAccessFromArtifactParam());
artifactDocumentationRouter.get("/", requireProjectPermission("project:read"), documentationPagesController.getArtifactDocumentation);
artifactDocumentationRouter.put("/", requireProjectPermission("artifact:write"), validate(upsertDocumentationSchema), documentationPagesController.upsertArtifactDocumentation);

export { artifactDocumentationRouter, projectDocumentationRouter };