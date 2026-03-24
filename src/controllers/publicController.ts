import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  createApplication,
  getApplicationBundle,
  getChecklist,
  issueResumeToken,
  saveApplicationForm,
  saveSection,
  submitApplication,
} from "../services/applicationService.js";
import {
  getDocumentForApplicant,
  listDocuments,
  uploadDocument,
} from "../services/documentService.js";
import { ApiError } from "../utils/errors.js";
import { renderPortalPage } from "../views/portal.js";

const ok = (reply: FastifyReply, data: unknown) => reply.send({ data, error: null });

const getApplicantToken = (request: FastifyRequest) => {
  const draftToken = request.headers["x-draft-token"];
  const resumeToken = request.headers["x-resume-token"];
  const tokenFromQuery = (request.query as { token?: string } | undefined)?.token;

  const token =
    (typeof draftToken === "string" && draftToken.trim()) ||
    (typeof resumeToken === "string" && resumeToken.trim()) ||
    (typeof tokenFromQuery === "string" && tokenFromQuery.trim()) ||
    "";

  if (!token) {
    throw new ApiError(401, "DRAFT_OR_RESUME_TOKEN_REQUIRED");
  }

  return token;
};

export const registerPublicRoutes = async (app: FastifyInstance) => {
  app.get("/portal", async (_request, reply) => {
    reply.type("text/html").send(renderPortalPage());
  });

  app.post("/onboard/v1/public/applications", async (request, reply) => {
    const body = (request.body ?? {}) as {
      applicantType?: string;
      countryOfIncorporation?: string | null;
    };

    const result = await createApplication({
      applicantType: body.applicantType ?? "",
      countryOfIncorporation: body.countryOfIncorporation ?? null,
    });

    return ok(reply, result);
  });

  app.get("/onboard/v1/public/applications/:id", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    return ok(reply, await getApplicationBundle(params.id, token));
  });

  app.patch("/onboard/v1/public/applications/:id/sections/:sectionCode", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string; sectionCode: string };
    return ok(reply, await saveSection(params.id, token, params.sectionCode, request.body));
  });

  app.put("/onboard/v1/public/applications/:id/form", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    return ok(reply, await saveApplicationForm(params.id, token, request.body));
  });

  app.get("/onboard/v1/public/applications/:id/checklist", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    return ok(reply, await getChecklist(params.id, token));
  });

  app.get("/onboard/v1/public/applications/:id/documents", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    return ok(reply, await listDocuments(params.id, token));
  });

  app.post("/onboard/v1/public/applications/:id/documents", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    const file = await request.file();

    if (!file) {
      throw new ApiError(400, "FILE_REQUIRED");
    }

    const fields = file.fields as Record<string, { value?: string }>;
    const requirementCode = fields.requirementCode?.value;
    const source = fields.source?.value ?? "upload";

    if (!requirementCode) {
      throw new ApiError(400, "REQUIREMENT_CODE_REQUIRED");
    }

    const content = await file.toBuffer();

    const result = await uploadDocument({
      applicationId: params.id,
      token,
      requirementCode,
      source,
      filename: file.filename,
      mimeType: file.mimetype,
      content,
    });

    return ok(reply, result);
  });

  app.get("/onboard/v1/public/applications/:id/documents/:documentId/download", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string; documentId: string };
    const document = await getDocumentForApplicant(params.id, params.documentId, token);
    reply.header("Content-Disposition", `attachment; filename="${document.filename}"`);
    reply.type(document.mimeType).send(document.content);
  });

  app.post("/onboard/v1/public/applications/:id/resume/request", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    return ok(reply, await issueResumeToken(params.id, token));
  });

  app.post("/onboard/v1/public/applications/:id/submit", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    return ok(reply, await submitApplication(params.id, token, request.body));
  });

  app.get("/onboard/v1/public/applications/:id/status", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    const bundle = await getApplicationBundle(params.id, token);
    return ok(reply, {
      application: bundle.application,
      checklist: bundle.checklist,
    });
  });
};
