import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { requireProjectPermission, withProjectAccessFromProjectParam } from "../../middleware/project-authorization";
import { validate } from "../../middleware/validate";
import { searchController } from "./search.controller";
import { searchQuerySchema } from "./search.validation";

const searchRouter = Router({ mergeParams: true });

searchRouter.use(authenticate, withProjectAccessFromProjectParam());
searchRouter.get("/", requireProjectPermission("project:read"), validate(searchQuerySchema), searchController.searchProject);

export { searchRouter };