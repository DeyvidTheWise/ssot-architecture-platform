import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
  requireProjectPermission,
  withProjectAccessFromApiEndpointParam,
  withProjectAccessFromApiSpecParam
} from "../../middleware/project-authorization";
import { validate } from "../../middleware/validate";
import { apiEndpointsController } from "./api-endpoints.controller";
import { linkApiEndpointArtifactSchema } from "./api-endpoints.validation";

const apiSpecEndpointsRouter = Router({ mergeParams: true });
const apiEndpointsRouter = Router();

apiSpecEndpointsRouter.use(authenticate, withProjectAccessFromApiSpecParam());
apiSpecEndpointsRouter.get("/", requireProjectPermission("project:read"), apiEndpointsController.listApiSpecEndpoints);

apiEndpointsRouter.use(authenticate);
apiEndpointsRouter.patch(
  "/:apiEndpointId/link-artifact",
  withProjectAccessFromApiEndpointParam(),
  requireProjectPermission("artifact:write"),
  validate(linkApiEndpointArtifactSchema),
  apiEndpointsController.linkEndpointToArtifact
);

export { apiEndpointsRouter, apiSpecEndpointsRouter };