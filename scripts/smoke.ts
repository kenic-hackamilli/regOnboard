const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3200";
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN ?? "onboard-admin-token";

type ApiEnvelope<T> = {
  data: T;
  error: { message: string; details?: unknown } | null;
};

const request = async <T>(
  path: string,
  init: RequestInit = {},
  extraHeaders: Record<string, string> = {}
): Promise<T> => {
  const headers = new Headers(init.headers ?? {});
  Object.entries(extraHeaders).forEach(([key, value]) => headers.set(key, value));

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? `Request failed with ${response.status}`);
  }
  return payload.data;
};

const uploadDocument = async (
  applicationId: string,
  draftToken: string,
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
    `/onboard/v1/public/applications/${applicationId}/documents`,
    {
      method: "POST",
      body: formData,
    },
    {
      "x-draft-token": draftToken,
    }
  );
};

const main = async () => {
  const health = await fetch(`${BASE_URL}/health`).then((res) => res.json());
  console.log("health", health);

  const created = await request<{
    application: { id: string };
    draftToken: string;
    resumeToken: string;
    resumeCode: string;
  }>("/onboard/v1/public/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      applicantType: "local",
      countryOfIncorporation: "Kenya",
    }),
  });

  const applicationId = created.application.id;
  const draftToken = created.draftToken;

  const sections: Array<[string, Record<string, unknown>]> = [
    [
      "SECTION_A_GENERAL_INFORMATION",
      {
        nameOfApplicant: "Daniel France",
        companyName: "DotKE Registrar Ltd",
        companyTin: "A12BCD34",
        addressOfApplicant: "Nairobi, Kenya",
        companyRegistrationNumber: "PVT-12345",
        telephoneNumber: "+254700123456",
        emailAddress: "registrar@example.ke",
        websiteUrl: "registrar.example.ke",
        contactPerson: "Daniel France",
        contactPersonTelephoneNumber: "+254700123456",
        contactPersonEmailAddress: "ops@example.ke",
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
        adminEmail: "admin@example.ke",
        billingContact: "Finance Team",
        billingEmail: "finance@example.ke",
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
      `/onboard/v1/public/applications/${applicationId}/sections/${sectionCode}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
      {
        "x-draft-token": draftToken,
      }
    );
    console.log("saved", sectionCode, result);
  }

  await uploadDocument(applicationId, draftToken, "CR12_OR_EQUIVALENT", "application/pdf", "cr12.pdf");
  await uploadDocument(applicationId, draftToken, "TAX_COMPLIANCE_OR_EQUIVALENT", "application/pdf", "tax.pdf");
  await uploadDocument(applicationId, draftToken, "TIN_CERTIFICATE_OR_EQUIVALENT", "application/pdf", "tin.pdf");
  await uploadDocument(applicationId, draftToken, "CERTIFICATE_OF_INCORPORATION", "application/pdf", "incorporation.pdf");
  await uploadDocument(applicationId, draftToken, "PASSPORT_PHOTO", "image/jpeg", "passport.jpg");
  console.log("uploaded documents");

  const submitted = await request<{ application: { status: string }; reviewTaskId: string }>(
    `/onboard/v1/public/applications/${applicationId}/submit`,
    {
      method: "POST",
    },
    {
      "x-draft-token": draftToken,
    }
  );
  console.log("submitted", submitted);

  const adminList = await request<Array<{ id: string; status: string }>>(
    "/onboard/v1/admin/applications?status=submitted",
    {},
    {
      "x-admin-token": ADMIN_API_TOKEN,
    }
  );
  console.log("admin list size", adminList.length);

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

  console.log("approved", approved);
  console.log("final status", finalStatus.application.status);
};

main().catch((error) => {
  console.error("smoke test failed", error);
  process.exit(1);
});
