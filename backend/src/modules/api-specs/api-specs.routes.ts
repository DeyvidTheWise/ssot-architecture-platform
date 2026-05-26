import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
  requireProjectPermission,
  withProjectAccessFromApiSpecParam,
  withProjectAccessFromProjectParam
} from "../../middleware/project-authorization";
import { validate } from "../../middleware/validate";
import { apiSpecsController } from "./api-specs.controller";
import { importApiSpecSchema } from "./api-specs.validation";

const projectApiSpecsRouter = Router({ mergeParams: true });
const apiSpecsRouter = Router();

projectApiSpecsRouter.use(authenticate, withProjectAccessFromProjectParam());
projectApiSpecsRouter.get("/", requireProjectPermission("project:read"), apiSpecsController.listProjectApiSpecs);
projectApiSpecsRouter.post("/import", requireProjectPermission("artifact:write"), validate(importApiSpecSchema), apiSpecsController.importApiSpec);

apiSpecsRouter.use(authenticate);
apiSpecsRouter.get("/:apiSpecId", withProjectAccessFromApiSpecParam(), requireProjectPermission("project:read"), apiSpecsController.getApiSpecById);
apiSpecsRouter.delete("/:apiSpecId", withProjectAccessFromApiSpecParam(), requireProjectPermission("artifact:delete"), apiSpecsController.deleteApiSpec);

export { apiSpecsRouter, projectApiSpecsRouter };