import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
  requireProjectPermission,
  withProjectAccessFromExportParam,
  withProjectAccessFromProjectParam
} from "../../middleware/project-authorization";
import { validate } from "../../middleware/validate";
import { exportsController } from "./exports.controller";
import { createExportSchema } from "./exports.validation";

const projectExportsRouter = Router({ mergeParams: true });
const exportsRouter = Router();

projectExportsRouter.use(authenticate, withProjectAccessFromProjectParam());
projectExportsRouter.post("/export", requireProjectPermission("artifact:write"), validate(createExportSchema), exportsController.createExport);
projectExportsRouter.get("/exports", requireProjectPermission("project:read"), exportsController.listProjectExports);

exportsRouter.use(authenticate);
exportsRouter.get("/:exportId", withProjectAccessFromExportParam(), requireProjectPermission("project:read"), exportsController.getExportById);

export { exportsRouter, projectExportsRouter };