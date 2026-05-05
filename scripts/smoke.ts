import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT ?? "3200";
const BASE_URL = (process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`).replace(/\/+$/, "");
const BASE_ORIGIN = new URL(BASE_URL).origin;
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN ?? "onboard-admin-token";
const APPLICANT_SESSION_COOKIE = "onboard_applicant_session";

type ApiEnvelope<T> = {
  data: T;
  error: { message: string; details?: unknown } | null;
};

type RequestOptions = RequestInit & {
  cookie?: string;
};

type RequestFailure = Error & {
  details: unknown | undefined;
  statusCode: number | undefined;
};

type ResponsePayload<T> = {
  data: T;
  response: Response;
};

const createFailure = (
  message: string,
  statusCode?: number,
  details?: unknown
) => {
  const error = new Error(message) as RequestFailure;
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

const getCookieHeader = (response: Response) => {
  const headerBag = response.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookies = typeof headerBag.getSetCookie === "function"
    ? headerBag.getSetCookie()
    : [response.headers.get("set-cookie") || ""].filter(Boolean);

  const applicantCookie = setCookies.find((value) =>
    String(value || "").startsWith(`${APPLICANT_SESSION_COOKIE}=`)
  );

  if (!applicantCookie) {
    return "";
  }

  return applicantCookie.split(";")[0] || "";
};

const request = async <T>(
  path: string,
  init: RequestOptions = {},
  extraHeaders: Record<string, string> = {}
): Promise<ResponsePayload<T>> => {
  const headers = new Headers(init.headers ?? {});
  headers.set("Origin", BASE_ORIGIN);
  headers.set("Referer", `${BASE_URL}/portal`);

  if (init.cookie) {
    headers.set("Cookie", init.cookie);
  }

  Object.entries(extraHeaders).forEach(([key, value]) => headers.set(key, value));

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw createFailure(await response.text(), response.status);
  }

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || payload.error) {
    throw createFailure(
      payload.error?.message ?? `Request failed with ${response.status}`,
      response.status,
      payload.error?.details
    );
  }

  return {
    data: payload.data,
    response,
  };
};

const expectRequestError = async (
  label: string,
  operation: () => Promise<unknown>,
  expectedMessage: string
) => {
  try {
    await operation();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message !== expectedMessage) {
      throw error;
    }

    console.log(label, message);
    return;
  }

  throw new Error(label + " unexpectedly succeeded");
};

const uploadDocument = async (
  applicationId: string,
  applicantCookie: string,
  requirementCode: string,
  mimeType: string,
  filename: string
) => {
  const formData = new FormData();
  formData.append("requirementCode", requirementCode);
  formData.append("source", "upload");
  formData.append(
    "file",
    new Blob([`sample content for ${requirementCode}`], { type: mimeType }),
    filename
  );

  return request(
    `/portal/api/applications/${applicationId}/documents`,
    {
      method: "POST",
      body: formData,
      cookie: applicantCookie,
    }
  );
};

const main = async () => {
  const runId = Date.now().toString().slice(-6);
  const companyName = `DotKE Registrar ${runId}`;
  const companyTin = `A${runId.padStart(9, "0")}B`;
  const companyRegistrationNumber = `PVT-${runId}`;
  const registrarEmail = `registrar.${runId}@example.ke`;
  const operationsEmail = `ops.${runId}@example.ke`;
  const adminEmail = `admin.${runId}@example.ke`;
  const financeEmail = `finance.${runId}@example.ke`;
  const websiteUrl = `registrar-${runId}.example.ke`;
  const registrarPhone = `+2547${runId.padStart(8, "0").slice(-8)}`;

  const health = await fetch(`${BASE_URL}/health`).then((res) => res.json());
  console.log("health", health);

  const created = await request<{
    application: { id: string; status: string };
    checklist: {
      sections: Array<{ sectionCode: string; isComplete: boolean }>;
      documents: Array<{ requirementCode: string; uploaded: boolean }>;
    };
  }>("/portal/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      applicantType: "local",
      countryOfIncorporation: "Kenya",
    }),
  });

  const applicationId = created.data.application.id;
  const applicantCookie = getCookieHeader(created.response);

  if (!applicationId || !applicantCookie) {
    throw new Error("FAILED_TO_ESTABLISH_APPLICANT_SESSION");
  }

  console.log("created application", applicationId);

  const hydrated = await request<{
    application: { id: string; status: string };
    sections: Array<{ sectionCode: string }>;
    checklist: { documents: Array<{ requirementCode: string }> };
  }>(
    `/portal/api/applications/${applicationId}`,
    {
      method: "GET",
      cookie: applicantCookie,
    }
  );

  console.log("hydrated application", hydrated.data.application.status);

  const sections: Array<[string, Record<string, unknown>]> = [
    [
      "SECTION_A_GENERAL_INFORMATION",
      {
        nameOfApplicant: "Daniel France",
        companyName,
        companyTin,
        addressOfApplicant: "Nairobi, Kenya",
        companyRegistrationNumber,
        telephoneNumber: registrarPhone,
        emailAddress: registrarEmail,
        websiteUrl,
        contactPerson: "Daniel France",
        contactPersonTelephoneNumber: registrarPhone,
        contactPersonEmailAddress: operationsEmail,
      },
    ],
    [
      "SECTION_B_BUSINESS_INFORMATION",
      {
        experienceDescription: "We manage domain operations and reseller services.",
        numberOfDomainsUnderManagement: "150",
        averageMonthlyRegistrations: "25",
        otherRelatedServices: "Hosting, DNS management, SSL",
        managementSystems: "CRM, ticketing, and internal registrar console",
        policyComplianceSystems: "Manual checks plus staff review",
        supportSystems: "Email and phone support backed by a ticket queue",
        billingSystems: "Invoice generation and reconciliation tooling",
        complaintsSystems: "Dedicated escalation workflow with timelines",
        resellerArrangements: "No external reseller arrangements in v1",
        securityCapability: "Access control, audit logs, backups, and incident response",
      },
    ],
    [
      "SECTION_C_DOMAIN_ADMINISTRATION",
      {
        ns1: "ns1.example.ke",
        ns2: "ns2.example.ke",
        adminContact: "Daniel France",
        adminEmail,
        billingContact: "Finance Team",
        billingEmail: financeEmail,
      },
    ],
    [
      "SECTION_D_BUSINESS_DEVELOPMENT",
      {
        targetMarket: "SMEs and digital agencies in East Africa",
        thirdLevelDomains: "co.ke, or.ke, me.ke",
        intendsSecondLevelSales: true,
        secondLevelSalesStrategy: "Promote brand visibility and premium positioning",
        otherRegistrarDomains: ".com, .org, .africa",
        projectedMonthlyKeRegistrations: "20",
        promotionStrategy: "Bundles, campaigns, and partnerships",
        businessLocation: "Nairobi, CAK Centre, Floor 2",
      },
    ],
    [
      "SECTION_E_LEGAL_STRUCTURE",
      {
        companyOwnership: "Privately held limited company",
        dishonestyConvictionDetails: "No convictions relating to dishonesty",
      },
    ],
    [
      "SECTION_F_DECLARATION",
      {
        fullLegalNameOfApplicant: "Daniel France",
        representativeSignature: "Daniel France",
        nameTitle: "Director",
        contactPerson: "Daniel France",
        dateOfSignature: "23/03/2026",
      },
    ],
  ];

  for (const [sectionCode, payload] of sections) {
    const result = await request(
      `/portal/api/applications/${applicationId}/sections/${sectionCode}`,
      {
        method: "PATCH",
        cookie: applicantCookie,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    console.log("saved", sectionCode, result.data);
  }

  await expectRequestError(
    "submit blocked before document upload",
    () =>
      request(
        `/portal/api/applications/${applicationId}/submit`,
        {
          method: "POST",
          cookie: applicantCookie,
        }
      ),
    "APPLICATION_NOT_READY_FOR_SUBMISSION"
  );

  await uploadDocument(applicationId, applicantCookie, "CR12_OR_EQUIVALENT", "application/pdf", "cr12.pdf");
  await uploadDocument(applicationId, applicantCookie, "TAX_COMPLIANCE_OR_EQUIVALENT", "application/pdf", "tax.pdf");
  await uploadDocument(applicationId, applicantCookie, "TIN_CERTIFICATE_OR_EQUIVALENT", "application/pdf", "tin.pdf");
  await uploadDocument(applicationId, applicantCookie, "CERTIFICATE_OF_INCORPORATION", "application/pdf", "incorporation.pdf");
  await uploadDocument(applicationId, applicantCookie, "PASSPORT_PHOTO", "image/jpeg", "passport.jpg");
  console.log("uploaded documents");

  const submitted = await request<{ application: { status: string }; reviewTaskId: string }>(
    `/portal/api/applications/${applicationId}/submit`,
    {
      method: "POST",
      cookie: applicantCookie,
    }
  );
  console.log("submitted", submitted.data);

  const adminList = await request<Array<{ id: string; status: string }>>(
    "/onboard/v1/admin/applications?status=submitted",
    {},
    {
      "x-admin-token": ADMIN_API_TOKEN,
    }
  );
  console.log("admin list size", adminList.data.length);

  const approved = await request<{ status: string }>(
    `/onboard/v1/admin/applications/${applicationId}/review`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nextStatus: "approved",
        assignedTo: "admin@dotke.local",
        reviewerNotes: "Smoke test approval",
      }),
    },
    {
      "x-admin-token": ADMIN_API_TOKEN,
    }
  );

  const finalStatus = await request<{ application: { status: string } }>(
    `/onboard/v1/admin/applications/${applicationId}`,
    {},
    {
      "x-admin-token": ADMIN_API_TOKEN,
    }
  );

  console.log("approved", approved.data);
  console.log("final status", finalStatus.data.application.status);
};

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  const details = typeof error === "object" && error ? (error as RequestFailure).details : undefined;
  const statusCode = typeof error === "object" && error ? (error as RequestFailure).statusCode : undefined;

  console.error("smoke test failed", {
    message,
    statusCode,
    details,
  });
  process.exit(1);
});
