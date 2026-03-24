import { z } from "zod";

export const APPLICANT_TYPES = ["local", "international"] as const;
export type ApplicantType = (typeof APPLICANT_TYPES)[number];

export const SECTION_CODES = [
  "SECTION_A_GENERAL_INFORMATION",
  "SECTION_B_BUSINESS_INFORMATION",
  "SECTION_C_DOMAIN_ADMINISTRATION",
  "SECTION_D_BUSINESS_DEVELOPMENT",
  "SECTION_E_LEGAL_STRUCTURE",
  "SECTION_F_DECLARATION",
  "SECTION_G_DOCUMENTS",
] as const;

export type SectionCode = (typeof SECTION_CODES)[number];

export type SectionValidationContext = {
  applicantType?: ApplicantType | null;
  countryOfIncorporation?: string | null;
};

export const COUNTRY_OF_INCORPORATION_MAX_LENGTH = 120;

const NAME_MAX_LENGTH = 160;
const IDENTIFIER_MAX_LENGTH = 120;
const ADDRESS_MAX_LENGTH = 255;
const EMAIL_MAX_LENGTH = 254;
const PHONE_MAX_LENGTH = 30;
const URL_MAX_LENGTH = 255;
const SHORT_TEXT_MAX_LENGTH = 160;
const LONG_TEXT_MAX_LENGTH = 2000;
const SIGNATURE_DATE_MAX_LENGTH = 32;
const PHONE_ALLOWED_CHARACTERS = /^[0-9+()\-\s]+$/;
const UNSAFE_CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const UNSAFE_CONTROL_CHAR_GLOBAL_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_TAG_PATTERN = /<[^>]*>/i;
const DANGEROUS_PROTOCOL_PATTERN = /\b(?:javascript|data|vbscript|file):/i;
const ANY_URL_PATTERN = /\b(?:https?:\/\/|www\.)\S+/i;
const INSECURE_URL_PATTERN = /\b(?:http:\/\/|www\.)\S+/i;
const COMMAND_LIKE_PATTERN = /(^|[\r\n])\s*(?:sudo\b|rm\s+-rf\b|curl\s+\S+|wget\s+\S+|bash\s+-c\b|sh\s+-c\b|powershell\b|cmd\s*\/c\b)/i;
const SQL_LIKE_PATTERN = /\b(?:drop\s+table|truncate\s+table|delete\s+from|select\s+\*\s+from)\b/i;
const HOSTNAME_PATTERN =
  /^(?=.{1,255}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export const SECTION_FIELD_MAX_LENGTHS = {
  nameOfApplicant: NAME_MAX_LENGTH,
  companyName: NAME_MAX_LENGTH,
  companyTin: IDENTIFIER_MAX_LENGTH,
  addressOfApplicant: ADDRESS_MAX_LENGTH,
  companyRegistrationNumber: IDENTIFIER_MAX_LENGTH,
  telephoneNumber: PHONE_MAX_LENGTH,
  emailAddress: EMAIL_MAX_LENGTH,
  websiteUrl: URL_MAX_LENGTH,
  contactPerson: NAME_MAX_LENGTH,
  contactPersonTelephoneNumber: PHONE_MAX_LENGTH,
  contactPersonEmailAddress: EMAIL_MAX_LENGTH,
  experienceDescription: LONG_TEXT_MAX_LENGTH,
  numberOfDomainsUnderManagement: SHORT_TEXT_MAX_LENGTH,
  averageMonthlyRegistrations: SHORT_TEXT_MAX_LENGTH,
  otherRelatedServices: LONG_TEXT_MAX_LENGTH,
  managementSystems: LONG_TEXT_MAX_LENGTH,
  policyComplianceSystems: LONG_TEXT_MAX_LENGTH,
  supportSystems: LONG_TEXT_MAX_LENGTH,
  billingSystems: LONG_TEXT_MAX_LENGTH,
  complaintsSystems: LONG_TEXT_MAX_LENGTH,
  resellerArrangements: LONG_TEXT_MAX_LENGTH,
  securityCapability: LONG_TEXT_MAX_LENGTH,
  ns1: URL_MAX_LENGTH,
  ns2: URL_MAX_LENGTH,
  adminContact: NAME_MAX_LENGTH,
  adminEmail: EMAIL_MAX_LENGTH,
  billingContact: NAME_MAX_LENGTH,
  billingEmail: EMAIL_MAX_LENGTH,
  targetMarket: LONG_TEXT_MAX_LENGTH,
  thirdLevelDomains: LONG_TEXT_MAX_LENGTH,
  secondLevelSalesStrategy: LONG_TEXT_MAX_LENGTH,
  otherRegistrarDomains: LONG_TEXT_MAX_LENGTH,
  projectedMonthlyKeRegistrations: SHORT_TEXT_MAX_LENGTH,
  promotionStrategy: LONG_TEXT_MAX_LENGTH,
  businessLocation: LONG_TEXT_MAX_LENGTH,
  companyOwnership: LONG_TEXT_MAX_LENGTH,
  dishonestyConvictionDetails: LONG_TEXT_MAX_LENGTH,
  fullLegalNameOfApplicant: NAME_MAX_LENGTH,
  representativeSignature: NAME_MAX_LENGTH,
  nameTitle: NAME_MAX_LENGTH,
  dateOfSignature: SIGNATURE_DATE_MAX_LENGTH,
} as const;

type SectionFieldName = keyof typeof SECTION_FIELD_MAX_LENGTHS;
type SafeTextOptions = {
  allowSecureLinks?: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const trimString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const sanitizeDraftString = (value: unknown, maxLength: number) =>
  trimString(value)
    .replace(UNSAFE_CONTROL_CHAR_GLOBAL_PATTERN, "")
    .replace(/[<>]/g, "")
    .slice(0, maxLength);

const normalizeHttpsUrlInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const candidate =
      /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
    const url = new URL(candidate);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    url.protocol = "https:";

    const pathname = url.pathname === "/" ? "" : url.pathname;
    return `${url.protocol}//${url.host}${pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
};

const normalizeDateInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  let year = 0;
  let month = 0;
  let day = 0;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const slashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else if (slashMatch) {
    day = Number(slashMatch[1]);
    month = Number(slashMatch[2]);
    year = Number(slashMatch[3]);
  } else {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const normalizeCountry = (value?: string | null) =>
  value?.trim().toLowerCase().replace(/\s+/g, " ") || "";

const normalizeBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value === "true";
  return false;
};

const validationText = (label: string, maxLength: number) =>
  z.preprocess(
    (value) => trimString(value),
    z
      .string()
      .min(1, `${label} is required`)
      .max(maxLength, `${label} must be ${maxLength} characters or fewer`)
  );

const draftText = (fieldName: SectionFieldName) =>
  z.preprocess(
    (value) => sanitizeDraftString(value, SECTION_FIELD_MAX_LENGTHS[fieldName]),
    z.string().default("")
  );

const applySafeTextRules = (
  schema: z.ZodType<string, z.ZodTypeDef, unknown>,
  label: string,
  options: SafeTextOptions = {}
) =>
  schema
    .refine((value) => !UNSAFE_CONTROL_CHAR_PATTERN.test(value), {
      message: `${label} contains unsupported control characters`,
    })
    .refine((value) => !HTML_TAG_PATTERN.test(value), {
      message: `${label} may not contain HTML or script tags`,
    })
    .refine((value) => !DANGEROUS_PROTOCOL_PATTERN.test(value), {
      message: `${label} may not contain unsafe link schemes`,
    })
    .refine((value) => !COMMAND_LIKE_PATTERN.test(value) && !SQL_LIKE_PATTERN.test(value), {
      message: `${label} may not contain command-style or executable input`,
    })
    .refine(
      (value) =>
        options.allowSecureLinks
          ? !INSECURE_URL_PATTERN.test(value)
          : !ANY_URL_PATTERN.test(value),
      {
        message: options.allowSecureLinks
          ? `${label} may only include secure https:// links`
          : `${label} may not contain web links`,
      }
    );

const safeText = (
  label: string,
  fieldName: SectionFieldName,
  options: SafeTextOptions = {}
) => applySafeTextRules(validationText(label, SECTION_FIELD_MAX_LENGTHS[fieldName]), label, options);

const wholeNumberText = (
  label: string,
  fieldName: Extract<
    SectionFieldName,
    "numberOfDomainsUnderManagement" | "averageMonthlyRegistrations" | "projectedMonthlyKeRegistrations"
  >
) =>
  safeText(label, fieldName).refine((value) => /^\d+$/.test(value), {
    message: `${label} must be a whole number`,
  });

const hostnameText = (
  label: string,
  fieldName: Extract<SectionFieldName, "ns1" | "ns2">
) =>
  safeText(label, fieldName).refine((value) => HOSTNAME_PATTERN.test(value), {
    message: `${label} must be a valid host name such as ns1.example.ke`,
  });

const signatureDateText = (label: string) =>
  z.preprocess(
    (value) => trimString(value),
    z
      .string()
      .min(1, `${label} is required`)
      .max(
        SECTION_FIELD_MAX_LENGTHS.dateOfSignature,
        `${label} must be ${SECTION_FIELD_MAX_LENGTHS.dateOfSignature} characters or fewer`
      )
  )
    .refine((value) => Boolean(normalizeDateInput(value)), {
      message: `${label} must be a valid date`,
    })
    .refine((value) => {
      const normalized = normalizeDateInput(value);
      return Boolean(normalized && normalized <= new Date().toISOString().slice(0, 10));
    }, {
      message: `${label} may not be in the future`,
    })
    .transform((value) => normalizeDateInput(value) || value);

const draftDateText = (fieldName: Extract<SectionFieldName, "dateOfSignature">) =>
  z.preprocess((value) => {
    const sanitized = sanitizeDraftString(value, SECTION_FIELD_MAX_LENGTHS[fieldName]);
    return normalizeDateInput(sanitized) || sanitized;
  }, z.string().default(""));

const booleanField = () =>
  z.preprocess((value) => normalizeBoolean(value), z.boolean());

const draftBooleanField = () =>
  z.preprocess((value) => normalizeBoolean(value), z.boolean().default(false));

const isKenyanContext = (context: SectionValidationContext) =>
  context.applicantType === "local" || normalizeCountry(context.countryOfIncorporation) === "kenya";

const getDigits = (value: string) => value.replace(/\D/g, "");

const hasActionableValidationErrors = (errors: Array<{ path: string; message: string }>) =>
  errors.some((error) => !error.message.endsWith(" is required"));

const isValidKenyanPhone = (value: string) => {
  const digits = getDigits(value);

  if (digits.length === 10 && digits.startsWith("0")) {
    return true;
  }

  if (digits.length === 12 && digits.startsWith("254")) {
    return true;
  }

  return false;
};

const phoneText = (label: string, fieldName: Extract<SectionFieldName, "telephoneNumber" | "contactPersonTelephoneNumber">) =>
  validationText(label, SECTION_FIELD_MAX_LENGTHS[fieldName])
    .refine((value) => PHONE_ALLOWED_CHARACTERS.test(value), {
      message: `${label} may only include numbers, spaces, parentheses, hyphens, and +`,
    })
    .refine((value) => {
      const digits = getDigits(value);
      return digits.length >= 7 && digits.length <= 15;
    }, `${label} must contain between 7 and 15 digits`);

const emailText = (
  label: string,
  fieldName: Extract<SectionFieldName, "emailAddress" | "contactPersonEmailAddress" | "adminEmail" | "billingEmail">
) =>
  z.preprocess(
    (value) => trimString(value),
    z
      .string()
      .min(1, `${label} is required`)
      .max(
        SECTION_FIELD_MAX_LENGTHS[fieldName],
        `${label} must be ${SECTION_FIELD_MAX_LENGTHS[fieldName]} characters or fewer`
      )
      .email(`${label} must be a valid email`)
  );

const websiteText = z.preprocess(
  (value) => trimString(value),
  z
    .string()
    .min(1, "Website URL (.KE) is required")
    .max(
      SECTION_FIELD_MAX_LENGTHS.websiteUrl,
      `Website URL (.KE) must be ${SECTION_FIELD_MAX_LENGTHS.websiteUrl} characters or fewer`
    )
)
  .refine((value) => !HTML_TAG_PATTERN.test(value), {
    message: "Website URL (.KE) may not contain HTML or script tags",
  })
  .refine((value) => !DANGEROUS_PROTOCOL_PATTERN.test(value), {
    message: "Website URL (.KE) may not contain unsafe link schemes",
  })
  .refine((value) => Boolean(normalizeHttpsUrlInput(value)), {
    message: "Website URL (.KE) must be a valid https:// URL",
  })
  .transform((value) => normalizeHttpsUrlInput(value) || value);

const buildSectionSchemas = (context: SectionValidationContext = {}) =>
  ({
    SECTION_A_GENERAL_INFORMATION: z
      .object({
        nameOfApplicant: safeText("Name of Applicant", "nameOfApplicant"),
        companyName: safeText("Company Name", "companyName"),
        companyTin: safeText("Company PIN Number / Tax Identification Number (TIN)", "companyTin"),
        addressOfApplicant: safeText("Address of Applicant", "addressOfApplicant"),
        companyRegistrationNumber: safeText(
          "Company Registration Number",
          "companyRegistrationNumber"
        ),
        telephoneNumber: phoneText("Telephone Number", "telephoneNumber"),
        emailAddress: emailText("Email Address", "emailAddress"),
        websiteUrl: websiteText,
        contactPerson: safeText("Contact Person", "contactPerson"),
        contactPersonTelephoneNumber: phoneText(
          "Contact Person's Telephone Number",
          "contactPersonTelephoneNumber"
        ),
        contactPersonEmailAddress: emailText(
          "Email Address of Contact Person",
          "contactPersonEmailAddress"
        ),
      })
      .superRefine((value, ctx) => {
        if (!isKenyanContext(context)) {
          return;
        }

        const phoneFields = [
          {
            field: "telephoneNumber",
            label: "Telephone Number",
            value: value.telephoneNumber,
          },
          {
            field: "contactPersonTelephoneNumber",
            label: "Contact Person's Telephone Number",
            value: value.contactPersonTelephoneNumber,
          },
        ] as const;

        phoneFields.forEach((entry) => {
          if (!isValidKenyanPhone(entry.value)) {
            ctx.addIssue({
              code: "custom",
              path: [entry.field],
              message: `${entry.label} must use a valid Kenyan format such as +254 7XX XXX XXX or 0XXXXXXXXX`,
            });
          }
        });
      }),
    SECTION_B_BUSINESS_INFORMATION: z.object({
      experienceDescription: safeText("Experience description", "experienceDescription"),
      numberOfDomainsUnderManagement: wholeNumberText(
        "Number of domains under management",
        "numberOfDomainsUnderManagement"
      ),
      averageMonthlyRegistrations: wholeNumberText(
        "Average monthly registrations",
        "averageMonthlyRegistrations"
      ),
      otherRelatedServices: safeText("Other related services", "otherRelatedServices"),
      managementSystems: safeText("Management systems", "managementSystems", {
        allowSecureLinks: true,
      }),
      policyComplianceSystems: safeText(
        "Policy compliance systems",
        "policyComplianceSystems"
      ),
      supportSystems: safeText("Support systems", "supportSystems", {
        allowSecureLinks: true,
      }),
      billingSystems: safeText("Billing systems", "billingSystems", {
        allowSecureLinks: true,
      }),
      complaintsSystems: safeText("Complaints systems", "complaintsSystems", {
        allowSecureLinks: true,
      }),
      resellerArrangements: safeText("Reseller arrangements", "resellerArrangements"),
      securityCapability: safeText("Security capability", "securityCapability"),
    }),
    SECTION_C_DOMAIN_ADMINISTRATION: z.object({
      ns1: hostnameText("NS 1", "ns1"),
      ns2: hostnameText("NS 2", "ns2"),
      adminContact: safeText("Admin Contact", "adminContact"),
      adminEmail: emailText("Admin Email", "adminEmail"),
      billingContact: safeText("Billing Contact", "billingContact"),
      billingEmail: emailText("Billing Email", "billingEmail"),
    }),
    SECTION_D_BUSINESS_DEVELOPMENT: z
      .object({
        targetMarket: safeText("Target market", "targetMarket"),
        thirdLevelDomains: safeText("Third Level Domains", "thirdLevelDomains"),
        intendsSecondLevelSales: booleanField(),
        secondLevelSalesStrategy: safeText(
          "Second Level Domain strategy",
          "secondLevelSalesStrategy"
        ).or(z.literal("")),
        otherRegistrarDomains: safeText("Registrar for other domains", "otherRegistrarDomains"),
        projectedMonthlyKeRegistrations: wholeNumberText(
          "Projected monthly .KE registrations",
          "projectedMonthlyKeRegistrations"
        ),
        promotionStrategy: safeText("Promotion strategy", "promotionStrategy"),
        businessLocation: safeText("Business location", "businessLocation"),
      })
      .superRefine((value, ctx) => {
        if (value.intendsSecondLevelSales && !value.secondLevelSalesStrategy.trim()) {
          ctx.addIssue({
            code: "custom",
            path: ["secondLevelSalesStrategy"],
            message: "Second Level Domain strategy is required when Second Level Domain sales are enabled",
          });
        }
      }),
    SECTION_E_LEGAL_STRUCTURE: z.object({
      companyOwnership: safeText("Company ownership", "companyOwnership"),
      dishonestyConvictionDetails: safeText(
        "Conviction disclosure",
        "dishonestyConvictionDetails"
      ),
    }),
    SECTION_F_DECLARATION: z.object({
      fullLegalNameOfApplicant: safeText(
        "Full legal name of applicant",
        "fullLegalNameOfApplicant"
      ),
      representativeSignature: safeText(
        "Representative signature",
        "representativeSignature"
      ),
      nameTitle: safeText("Name title", "nameTitle"),
      contactPerson: safeText("Contact person", "contactPerson"),
      dateOfSignature: signatureDateText("Date of signature"),
    }),
  }) as const;

const buildDraftSectionSchemas = () =>
  ({
    SECTION_A_GENERAL_INFORMATION: z.object({
      nameOfApplicant: draftText("nameOfApplicant"),
      companyName: draftText("companyName"),
      companyTin: draftText("companyTin"),
      addressOfApplicant: draftText("addressOfApplicant"),
      companyRegistrationNumber: draftText("companyRegistrationNumber"),
      telephoneNumber: draftText("telephoneNumber"),
      emailAddress: draftText("emailAddress"),
      websiteUrl: draftText("websiteUrl"),
      contactPerson: draftText("contactPerson"),
      contactPersonTelephoneNumber: draftText("contactPersonTelephoneNumber"),
      contactPersonEmailAddress: draftText("contactPersonEmailAddress"),
    }),
    SECTION_B_BUSINESS_INFORMATION: z.object({
      experienceDescription: draftText("experienceDescription"),
      numberOfDomainsUnderManagement: draftText("numberOfDomainsUnderManagement"),
      averageMonthlyRegistrations: draftText("averageMonthlyRegistrations"),
      otherRelatedServices: draftText("otherRelatedServices"),
      managementSystems: draftText("managementSystems"),
      policyComplianceSystems: draftText("policyComplianceSystems"),
      supportSystems: draftText("supportSystems"),
      billingSystems: draftText("billingSystems"),
      complaintsSystems: draftText("complaintsSystems"),
      resellerArrangements: draftText("resellerArrangements"),
      securityCapability: draftText("securityCapability"),
    }),
    SECTION_C_DOMAIN_ADMINISTRATION: z.object({
      ns1: draftText("ns1"),
      ns2: draftText("ns2"),
      adminContact: draftText("adminContact"),
      adminEmail: draftText("adminEmail"),
      billingContact: draftText("billingContact"),
      billingEmail: draftText("billingEmail"),
    }),
    SECTION_D_BUSINESS_DEVELOPMENT: z.object({
      targetMarket: draftText("targetMarket"),
      thirdLevelDomains: draftText("thirdLevelDomains"),
      intendsSecondLevelSales: draftBooleanField(),
      secondLevelSalesStrategy: draftText("secondLevelSalesStrategy"),
      otherRegistrarDomains: draftText("otherRegistrarDomains"),
      projectedMonthlyKeRegistrations: draftText("projectedMonthlyKeRegistrations"),
      promotionStrategy: draftText("promotionStrategy"),
      businessLocation: draftText("businessLocation"),
    }),
    SECTION_E_LEGAL_STRUCTURE: z.object({
      companyOwnership: draftText("companyOwnership"),
      dishonestyConvictionDetails: draftText("dishonestyConvictionDetails"),
    }),
    SECTION_F_DECLARATION: z.object({
      fullLegalNameOfApplicant: draftText("fullLegalNameOfApplicant"),
      representativeSignature: draftText("representativeSignature"),
      nameTitle: draftText("nameTitle"),
      contactPerson: draftText("contactPerson"),
      dateOfSignature: draftDateText("dateOfSignature"),
    }),
  }) as const;

export const sectionSchemas = buildSectionSchemas();

const draftSectionSchemas = buildDraftSectionSchemas();

export const FORM_SECTION_CODES = Object.keys(sectionSchemas) as Array<
  keyof typeof sectionSchemas
>;

export type SectionPayloadMap = {
  [K in keyof typeof sectionSchemas]: z.infer<(typeof sectionSchemas)[K]>;
};

export const isSectionCode = (value: string): value is keyof typeof sectionSchemas =>
  value in sectionSchemas;

export const sanitizeSectionDraft = (
  sectionCode: keyof typeof sectionSchemas,
  payload: unknown
) => {
  const result = draftSectionSchemas[sectionCode].safeParse(isRecord(payload) ? payload : {});
  return result.success ? result.data : {};
};

export const validateSection = (
  sectionCode: keyof typeof sectionSchemas,
  payload: unknown,
  context: SectionValidationContext = {}
) => {
  const schemas = buildSectionSchemas(context);
  const result = schemas[sectionCode].safeParse(isRecord(payload) ? payload : {});
  if (result.success) {
    return {
      ok: true as const,
      data: result.data,
      errors: [] as Array<{ path: string; message: string }>,
      isComplete: true,
      hasActionableErrors: false,
    };
  }

  const errors = result.error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

  return {
    ok: false as const,
    data: sanitizeSectionDraft(sectionCode, payload),
    errors,
    isComplete: false,
    hasActionableErrors: hasActionableValidationErrors(errors),
  };
};
