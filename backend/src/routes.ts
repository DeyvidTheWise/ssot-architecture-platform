import { Router } from "express";
import { apiEndpointsRouter, apiSpecEndpointsRouter } from "./modules/api-endpoints/api-endpoints.routes";
import { apiSpecsRouter, projectApiSpecsRouter } from "./modules/api-specs/api-specs.routes";
import { artifactsRouter, projectArtifactsRouter } from "./modules/artifacts/artifacts.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { artifactDocumentationRouter, projectDocumentationRouter } from "./modules/documentation-pages/documentation-pages.routes";
import { diagramsRouter, projectDiagramsRouter } from "./modules/diagrams/diagrams.routes";
import { exportsRouter, projectExportsRouter } from "./modules/exports/exports.routes";
import { graphsRouter } from "./modules/graphs/graphs.routes";
import { projectMembersRouter } from "./modules/project-members/project-members.routes";
import { projectsRouter } from "./modules/projects/projects.routes";
import { artifactRelationsRouter, relationsRouter } from "./modules/relations/relations.routes";
import { searchRouter } from "./modules/search/search.routes";
import { artifactVersionsRouter, projectVersionsRouter } from "./modules/version-history/version-history.routes";
import { projectValidationRouter, validationIssuesRouter } from "./modules/validation/validation.routes";
import { sendSuccess } from "./utils/response";

const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  sendSuccess(
    res,
    {
      status: "ok"
    },
    "Operation successful"
  );
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/projects", projectsRouter);
apiRouter.use("/projects/:projectId/members", projectMembersRouter);
apiRouter.use("/projects/:projectId/artifacts", projectArtifactsRouter);
apiRouter.use("/projects/:projectId/docs", projectDocumentationRouter);
apiRouter.use("/projects/:projectId/api-specs", projectApiSpecsRouter);
apiRouter.use("/projects/:projectId/diagrams", projectDiagramsRouter);
apiRouter.use("/projects/:projectId/graph", graphsRouter);
apiRouter.use("/projects/:projectId", projectValidationRouter);
apiRouter.use("/projects/:projectId/search", searchRouter);
apiRouter.use("/projects/:projectId/versions", projectVersionsRouter);
apiRouter.use("/projects/:projectId", projectExportsRouter);
apiRouter.use("/artifacts", artifactsRouter);
apiRouter.use("/artifacts/:artifactId/relations", artifactRelationsRouter);
apiRouter.use("/artifacts/:artifactId/documentation", artifactDocumentationRouter);
apiRouter.use("/artifacts/:artifactId/versions", artifactVersionsRouter);
apiRouter.use("/relations", relationsRouter);
apiRouter.use("/api-specs", apiSpecsRouter);
apiRouter.use("/api-specs/:apiSpecId/endpoints", apiSpecEndpointsRouter);
apiRouter.use("/api-endpoints", apiEndpointsRouter);
apiRouter.use("/diagrams", diagramsRouter);
apiRouter.use("/validation-issues", validationIssuesRouter);
apiRouter.use("/exports", exportsRouter);

export { apiRouter };
