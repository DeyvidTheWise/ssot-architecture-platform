import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
  requireProjectPermission,
  withProjectAccessFromArtifactParam,
  withProjectAccessFromRelationParam
} from "../../middleware/project-authorization";
import { validate } from "../../middleware/validate";
import { relationsController } from "./relations.controller";
import { createRelationSchema } from "./relations.validation";

const artifactRelationsRouter = Router({ mergeParams: true });
const relationsRouter = Router();

artifactRelationsRouter.use(authenticate, withProjectAccessFromArtifactParam());
artifactRelationsRouter.post("/", requireProjectPermission("relation:write"), validate(createRelationSchema), relationsController.createRelation);
artifactRelationsRouter.get("/", requireProjectPermission("project:read"), relationsController.listRelations);

relationsRouter.use(authenticate);
relationsRouter.delete("/:relationId", withProjectAccessFromRelationParam(), requireProjectPermission("relation:write"), relationsController.deleteRelation);

export { artifactRelationsRouter, relationsRouter };