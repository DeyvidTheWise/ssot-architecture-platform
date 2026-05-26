import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
  requireProjectPermission,
  withProjectAccessFromProjectParam,
  withProjectAccessFromValidationIssueParam
} from "../../middleware/project-authorization";
import { validate } from "../../middleware/validate";
import { validationController } from "./validation.controller";
import { updateValidationIssueSchema, validationIssueQuerySchema } from "./validation.validation";

const projectValidationRouter = Router({ mergeParams: true });
const validationIssuesRouter = Router();

projectValidationRouter.use(authenticate, withProjectAccessFromProjectParam());
projectValidationRouter.post("/validate", requireProjectPermission("artifact:write"), validationController.runValidation);
projectValidationRouter.get("/validation-issues", requireProjectPermission("project:read"), validate(validationIssueQuerySchema), validationController.listIssues);

validationIssuesRouter.use(authenticate);
validationIssuesRouter.patch(
  "/:issueId",
  withProjectAccessFromValidationIssueParam(),
  requireProjectPermission("artifact:write"),
  validate(updateValidationIssueSchema),
  validationController.updateIssue
);

export { projectValidationRouter, validationIssuesRouter };