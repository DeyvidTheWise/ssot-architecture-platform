import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireProjectPermission, withProjectAccessFromProjectParam } from "../../middleware/project-authorization";
import { graphsController } from "./graphs.controller";

const graphsRouter = Router({ mergeParams: true });

graphsRouter.use(authenticate, withProjectAccessFromProjectParam());
graphsRouter.get("/", requireProjectPermission("project:read"), graphsController.getProjectGraph);

export { graphsRouter };