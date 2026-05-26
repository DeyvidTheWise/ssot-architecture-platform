import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
  requireProjectPermission,
  withProjectAccessFromDiagramParam,
  withProjectAccessFromProjectParam
} from "../../middleware/project-authorization";
import { validate } from "../../middleware/validate";
import { diagramsController } from "./diagrams.controller";
import { createDiagramSchema, updateDiagramSchema } from "./diagrams.validation";

const projectDiagramsRouter = Router({ mergeParams: true });
const diagramsRouter = Router();

projectDiagramsRouter.use(authenticate, withProjectAccessFromProjectParam());
projectDiagramsRouter.get("/", requireProjectPermission("project:read"), diagramsController.listProjectDiagrams);
projectDiagramsRouter.post("/", requireProjectPermission("artifact:write"), validate(createDiagramSchema), diagramsController.createDiagram);

diagramsRouter.use(authenticate);
diagramsRouter.get("/:diagramId", withProjectAccessFromDiagramParam(), requireProjectPermission("project:read"), diagramsController.getDiagramById);
diagramsRouter.patch("/:diagramId", withProjectAccessFromDiagramParam(), requireProjectPermission("artifact:write"), validate(updateDiagramSchema), diagramsController.updateDiagram);
diagramsRouter.delete("/:diagramId", withProjectAccessFromDiagramParam(), requireProjectPermission("artifact:delete"), diagramsController.deleteDiagram);

export { diagramsRouter, projectDiagramsRouter };