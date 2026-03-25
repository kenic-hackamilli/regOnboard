import type { FastifyInstance, FastifyRequest } from "fastify";
import { env } from "../config/env.js";
import { getDocumentForAdmin } from "../services/documentService.js";
import {
  getApplicationForAdmin,
  listApplicationsForAdmin,
  updateReviewState,
} from "../services/reviewService.js";
import { ApiError } from "../utils/errors.js";
import { renderAdminPage } from "../views/admin.js";

const getAdminToken = (request: FastifyRequest) => {
  const header = request.headers["x-admin-token"];
  const authHeader = request.headers.authorization;
  if (typeof header === "string" && header.trim()) return header.trim();
  if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice(7).trim();
  }
  throw new ApiError(401, "ADMIN_TOKEN_REQUIRED");
};

const assertAdmin = (request: FastifyRequest) => {
  const token = getAdminToken(request);
  if (token !== env.ADMIN_API_TOKEN) {
    throw new ApiError(403, "INVALID_ADMIN_TOKEN");
  }
};

const ok = (reply: any, data: unknown) => reply.send({ data, error: null });

export const registerAdminRoutes = async (app: FastifyInstance) => {
  app.get("/admin", async (_request, reply) => {
    if (!env.ADMIN_PORTAL_ENABLED) {
      throw new ApiError(404, "NOT_FOUND");
    }
    reply.type("text/html").send(renderAdminPage());
  });

  app.get("/onboard/v1/admin/applications", async (request, reply) => {
    assertAdmin(request);
    const query = request.query as { status?: string };
    return ok(reply, await listApplicationsForAdmin(query.status));
  });

  app.get("/onboard/v1/admin/applications/:id", async (request, reply) => {
    assertAdmin(request);
    const params = request.params as { id: string };
    return ok(reply, await getApplicationForAdmin(params.id));
  });

  app.patch("/onboard/v1/admin/applications/:id/review", async (request, reply) => {
    assertAdmin(request);
    const params = request.params as { id: string };
    const body = (request.body ?? {}) as {
      nextStatus?: "in_review" | "changes_requested" | "approved" | "rejected";
      reviewerNotes?: string;
      assignedTo?: string;
    };

    if (!body.nextStatus) {
      throw new ApiError(400, "NEXT_STATUS_REQUIRED");
    }

    return ok(reply, await updateReviewState({
      applicationId: params.id,
      nextStatus: body.nextStatus,
      reviewerNotes: body.reviewerNotes,
      assignedTo: body.assignedTo,
    }));
  });

  app.post("/onboard/v1/admin/applications/:id/request-changes", async (request, reply) => {
    assertAdmin(request);
    const params = request.params as { id: string };
    const body = (request.body ?? {}) as { reviewerNotes?: string; assignedTo?: string };
    return ok(reply, await updateReviewState({
      applicationId: params.id,
      nextStatus: "changes_requested",
      reviewerNotes: body.reviewerNotes,
      assignedTo: body.assignedTo,
    }));
  });

  app.post("/onboard/v1/admin/applications/:id/approve", async (request, reply) => {
    assertAdmin(request);
    const params = request.params as { id: string };
    const body = (request.body ?? {}) as { reviewerNotes?: string; assignedTo?: string };
    return ok(reply, await updateReviewState({
      applicationId: params.id,
      nextStatus: "approved",
      reviewerNotes: body.reviewerNotes,
      assignedTo: body.assignedTo,
    }));
  });

  app.post("/onboard/v1/admin/applications/:id/reject", async (request, reply) => {
    assertAdmin(request);
    const params = request.params as { id: string };
    const body = (request.body ?? {}) as { reviewerNotes?: string; assignedTo?: string };
    return ok(reply, await updateReviewState({
      applicationId: params.id,
      nextStatus: "rejected",
      reviewerNotes: body.reviewerNotes,
      assignedTo: body.assignedTo,
    }));
  });

  app.get("/onboard/v1/admin/documents/:documentId/download", async (request, reply) => {
    assertAdmin(request);
    const params = request.params as { documentId: string };
    const document = await getDocumentForAdmin(params.documentId);
    reply.header("Content-Disposition", `attachment; filename="${document.filename}"`);
    reply.type(document.mimeType).send(document.content);
  });
};
