import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/env.js";
import { portalClientScript } from "../generated/portalClient.generated.js";
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
import {
  assertApplicantPortalAcceptingWrites,
  getApplicantPortalStatus,
} from "../services/portalStatusService.js";
import {
  applyHtmlSecurityHeaders,
  clearApplicantSessionCookie,
  createAssetNonce,
  getApplicantSessionToken,
  setApplicantSessionCookie,
} from "../utils/httpSecurity.js";
import { ApiError } from "../utils/errors.js";
import { renderPortalClientScript, renderPortalPage } from "../views/portal.js";

const ok = (reply: FastifyReply, data: unknown) => reply.send({ data, error: null });
const BASE64_CONTENT_PATTERN =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

const coerceString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const decodeBase64DocumentContent = (value: string) => {
  const normalized = value
    .replace(/^data:[^,]+;base64,/, "")
    .replace(/\s+/g, "");

  if (!normalized) {
    throw new ApiError(400, "FILE_REQUIRED");
  }

  if (!BASE64_CONTENT_PATTERN.test(normalized)) {
    throw new ApiError(400, "INVALID_FILE_ENCODING");
  }

  const content = Buffer.from(normalized, "base64");
  if (!content.byteLength) {
    throw new ApiError(400, "EMPTY_FILE");
  }

  return content;
};

const getApplicantToken = (request: FastifyRequest) => {
  const cookieToken = getApplicantSessionToken(request);
  const draftToken = request.headers["x-draft-token"];
  const resumeToken = request.headers["x-resume-token"];
  const tokenFromQuery = (request.query as { token?: string } | undefined)?.token;

  const token =
    (typeof cookieToken === "string" && cookieToken.trim()) ||
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
  type PublicRouteHandler = (request: FastifyRequest, reply: FastifyReply) => unknown;
  const publicApiPaths = (suffix: string) => [
    `/onboard/v1/public${suffix}`,
    `/portal/api${suffix}`,
  ];
  const registerPublicGet = (suffix: string, handler: PublicRouteHandler) => {
    publicApiPaths(suffix).forEach((path) => {
      app.get(path, handler);
    });
  };
  const registerPublicPost = (suffix: string, handler: PublicRouteHandler) => {
    publicApiPaths(suffix).forEach((path) => {
      app.post(path, handler);
    });
  };
  const registerPublicPatch = (suffix: string, handler: PublicRouteHandler) => {
    publicApiPaths(suffix).forEach((path) => {
      app.patch(path, handler);
    });
  };
  const registerPublicPut = (suffix: string, handler: PublicRouteHandler) => {
    publicApiPaths(suffix).forEach((path) => {
      app.put(path, handler);
    });
  };

  app.get("/portal/client.js", async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    reply.type("application/javascript").send(
      env.NODE_ENV === "production"
        ? portalClientScript
        : renderPortalClientScript()
    );
  });

  app.get("/portal", async (request, reply) => {
    const query = (request.query ?? {}) as { applicationId?: string; token?: string };
    const applicationId = coerceString(query.applicationId);
    const token = coerceString(query.token);

    if (applicationId && token) {
      setApplicantSessionCookie(reply, token);
      return reply.redirect(`/portal?applicationId=${encodeURIComponent(applicationId)}`);
    }

    const portalStatus = await getApplicantPortalStatus();
    const nonce = createAssetNonce();
    applyHtmlSecurityHeaders(reply, nonce);
    reply.type("text/html").send(renderPortalPage({ nonce, portalStatus }));
  });

  app.get("/portal/resume", async (request, reply) => {
    const query = (request.query ?? {}) as { applicationId?: string; token?: string };
    const applicationId = coerceString(query.applicationId);
    const token = coerceString(query.token);

    if (!applicationId || !token) {
      throw new ApiError(400, "INVALID_RESUME_LINK");
    }

    setApplicantSessionCookie(reply, token);
    return reply.redirect(`/portal?applicationId=${encodeURIComponent(applicationId)}`);
  });

  registerPublicPost("/session/clear", async (_request, reply) => {
    clearApplicantSessionCookie(reply);
    return ok(reply, { cleared: true });
  });

  registerPublicGet("/portal-status", async (_request, reply) =>
    ok(reply, await getApplicantPortalStatus())
  );

  registerPublicPost("/applications", async (request, reply) => {
    await assertApplicantPortalAcceptingWrites();
    const body = (request.body ?? {}) as {
      applicantType?: string;
      countryOfIncorporation?: string | null;
    };

    const result = await createApplication({
      applicantType: body.applicantType ?? "",
      countryOfIncorporation: body.countryOfIncorporation ?? null,
    });

    setApplicantSessionCookie(reply, result.draftToken);

    return ok(reply, {
      application: result.application,
      checklist: result.checklist,
    });
  });

  registerPublicGet("/applications/:id", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    return ok(reply, await getApplicationBundle(params.id, token));
  });

  registerPublicPatch("/applications/:id/sections/:sectionCode", async (request, reply) => {
    await assertApplicantPortalAcceptingWrites();
    const token = getApplicantToken(request);
    const params = request.params as { id: string; sectionCode: string };
    return ok(reply, await saveSection(params.id, token, params.sectionCode, request.body));
  });

  registerPublicPut("/applications/:id/form", async (request, reply) => {
    await assertApplicantPortalAcceptingWrites();
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    return ok(reply, await saveApplicationForm(params.id, token, request.body));
  });

  registerPublicGet("/applications/:id/checklist", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    return ok(reply, await getChecklist(params.id, token));
  });

  registerPublicGet("/applications/:id/documents", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    return ok(reply, await listDocuments(params.id, token));
  });

  registerPublicPost("/applications/:id/documents", async (request, reply) => {
    await assertApplicantPortalAcceptingWrites();
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    const contentType = String(request.headers["content-type"] ?? "");
    let requirementCode = "";
    let source = "upload";
    let filename = "document.bin";
    let mimeType = "application/octet-stream";
    let content: Buffer = Buffer.alloc(0);

    if (contentType.includes("multipart/form-data")) {
      const file = await request.file();

      if (!file) {
        throw new ApiError(400, "FILE_REQUIRED");
      }

      const fields = file.fields as Record<string, { value?: string }>;
      requirementCode = fields.requirementCode?.value?.trim() ?? "";
      source = fields.source?.value?.trim() || "upload";
      filename = file.filename;
      mimeType = file.mimetype;
      content = await file.toBuffer();
    } else {
      const body = (request.body ?? {}) as {
        requirementCode?: unknown;
        source?: unknown;
        filename?: unknown;
        mimeType?: unknown;
        contentBase64?: unknown;
      };

      requirementCode = coerceString(body.requirementCode);
      source = coerceString(body.source) || "upload";
      filename = coerceString(body.filename) || filename;
      mimeType = coerceString(body.mimeType) || mimeType;
      content = decodeBase64DocumentContent(coerceString(body.contentBase64));
    }

    if (!requirementCode) {
      throw new ApiError(400, "REQUIREMENT_CODE_REQUIRED");
    }

    const result = await uploadDocument({
      applicationId: params.id,
      token,
      requirementCode,
      source,
      filename,
      mimeType,
      content,
    });

    return ok(reply, result);
  });

  registerPublicGet("/applications/:id/documents/:documentId/download", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string; documentId: string };
    const document = await getDocumentForApplicant(params.id, params.documentId, token);
    reply.header("Content-Disposition", `attachment; filename="${document.filename}"`);
    reply.type(document.mimeType).send(document.content);
  });

  registerPublicPost("/applications/:id/resume/request", async (request, reply) => {
    await assertApplicantPortalAcceptingWrites();
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    return ok(reply, await issueResumeToken(params.id, token));
  });

  registerPublicPost("/applications/:id/submit", async (request, reply) => {
    await assertApplicantPortalAcceptingWrites();
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    return ok(reply, await submitApplication(params.id, token, request.body));
  });

  registerPublicGet("/applications/:id/status", async (request, reply) => {
    const token = getApplicantToken(request);
    const params = request.params as { id: string };
    const bundle = await getApplicationBundle(params.id, token);
    return ok(reply, {
      application: bundle.application,
      checklist: bundle.checklist,
    });
  });
};
