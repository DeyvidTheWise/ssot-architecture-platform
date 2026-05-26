import type { HttpMethod, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/app-error";
import { createVersionRecord } from "../../utils/version-history";

const ALLOWED_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

const parseOpenApiRawContent = (rawContent: string): Record<string, unknown> => {
  try {
    return JSON.parse(rawContent) as Record<string, unknown>;
  } catch {
    throw new AppError(
      "OPENAPI import currently supports JSON only. YAML is not supported in this phase.",
      "VALIDATION_ERROR",
      400
    );
  }
};

const extractEndpoints = (parsed: Record<string, unknown>): Array<{
  method: HttpMethod;
  path: string;
  summary?: string;
  requestSchema?: Prisma.JsonValue;
  responseSchema?: Prisma.JsonValue;
  requiresAuth: boolean;
}> => {
  const endpoints: Array<{
    method: HttpMethod;
    path: string;
    summary?: string;
    requestSchema?: Prisma.JsonValue;
    responseSchema?: Prisma.JsonValue;
    requiresAuth: boolean;
  }> = [];

  const globalSecurity = Array.isArray(parsed.security) ? parsed.security : [];
  const paths = (parsed.paths ?? {}) as Record<string, unknown>;

  Object.entries(paths).forEach(([path, pathValue]) => {
    if (!pathValue || typeof pathValue !== "object") {
      return;
    }

    Object.entries(pathValue as Record<string, unknown>).forEach(([methodKey, operationValue]) => {
      const method = methodKey.toUpperCase() as HttpMethod;
      if (!ALLOWED_METHODS.includes(method)) {
        return;
      }
      if (!operationValue || typeof operationValue !== "object") {
        return;
      }

      const operation = operationValue as Record<string, unknown>;
      const operationSecurity = Array.isArray(operation.security) ? operation.security : [];
      const requiresAuth = operationSecurity.length > 0 || globalSecurity.length > 0;

      const requestSchema =
        ((operation.requestBody as Record<string, unknown> | undefined)?.content as Record<string, unknown> | undefined)?.[
          "application/json"
        ] &&
        (((operation.requestBody as Record<string, unknown>).content as Record<string, unknown>)["application/json"] as Record<string, unknown>).schema;

      const responses = (operation.responses ?? {}) as Record<string, unknown>;
      const preferredResponse =
        (responses["200"] as Record<string, unknown> | undefined) ??
        (responses["201"] as Record<string, unknown> | undefined) ??
        (responses.default as Record<string, unknown> | undefined);

      const responseSchema = preferredResponse
        ? ((preferredResponse.content as Record<string, unknown> | undefined)?.["application/json"] as Record<string, unknown> | undefined)
            ?.schema
        : undefined;

      endpoints.push({
        method,
        path,
        summary: (operation.summary as string | undefined) ?? undefined,
        requestSchema: (requestSchema as Prisma.JsonValue | undefined) ?? undefined,
        responseSchema: (responseSchema as Prisma.JsonValue | undefined) ?? undefined,
        requiresAuth
      });
    });
  });

  return endpoints;
};

export const apiSpecsService = {
  async listProjectApiSpecs(projectId: string) {
    return prisma.apiSpec.findMany({
      where: { projectId },
      include: {
        artifact: {
          select: { id: true, title: true, type: true, status: true }
        },
        _count: {
          select: { endpoints: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });
  },

  async importApiSpec(
    projectId: string,
    actorId: string,
    payload: { name: string; format: "OPENAPI" | "CUSTOM"; rawContent: string; artifactId?: string }
  ) {
    if (payload.artifactId) {
      const artifact = await prisma.artifact.findUnique({ where: { id: payload.artifactId } });
      if (!artifact || artifact.projectId !== projectId) {
        throw new AppError("artifactId must refer to an artifact in the same project", "VALIDATION_ERROR", 400);
      }
    }

    let parsedContent: Prisma.JsonValue | undefined;
    let extractedEndpoints: Array<{
      method: HttpMethod;
      path: string;
      summary?: string;
      requestSchema?: Prisma.JsonValue;
      responseSchema?: Prisma.JsonValue;
      requiresAuth: boolean;
    }> = [];

    if (payload.format === "OPENAPI") {
      const parsed = parseOpenApiRawContent(payload.rawContent);
      parsedContent = parsed as Prisma.JsonValue;
      extractedEndpoints = extractEndpoints(parsed);
    }

    const apiSpec = await prisma.apiSpec.create({
      data: {
        projectId,
        artifactId: payload.artifactId,
        name: payload.name,
        format: payload.format,
        rawContent: payload.rawContent,
        parsedContent,
        endpoints: {
          create: extractedEndpoints
        }
      },
      include: {
        endpoints: true
      }
    });

    await createVersionRecord({
      projectId,
      entityType: "ApiSpec",
      entityId: apiSpec.id,
      changeType: "IMPORTED",
      changedById: actorId,
      newValue: {
        name: apiSpec.name,
        format: apiSpec.format,
        endpointCount: apiSpec.endpoints.length
      }
    });

    return apiSpec;
  },

  async getApiSpecById(apiSpecId: string) {
    const apiSpec = await prisma.apiSpec.findUnique({
      where: { id: apiSpecId },
      include: {
        artifact: {
          select: { id: true, title: true, type: true, status: true }
        },
        _count: {
          select: { endpoints: true }
        }
      }
    });

    if (!apiSpec) {
      throw new AppError("API spec not found", "NOT_FOUND", 404);
    }

    return apiSpec;
  },

  async deleteApiSpec(apiSpecId: string, actorId: string) {
    const current = await prisma.apiSpec.findUnique({ where: { id: apiSpecId } });
    if (!current) {
      throw new AppError("API spec not found", "NOT_FOUND", 404);
    }

    await prisma.apiSpec.delete({ where: { id: apiSpecId } });

    await createVersionRecord({
      projectId: current.projectId,
      entityType: "ApiSpec",
      entityId: current.id,
      changeType: "DELETED",
      changedById: actorId,
      oldValue: {
        name: current.name,
        format: current.format
      }
    });

    return { id: apiSpecId };
  }
};