import { SECTION_FIELD_MAX_LENGTHS } from "../utils/sections.js";
import { buildPortalBody } from "./portal/body.js";
import { documentWorkflowClientScript } from "./portal/documentWorkflow.js";
import { PORTAL_PAGE_PATHS, getPortalPageKey, getPortalPageView } from "./portal/pageConfig.js";
import type { RenderPortalPageOptions } from "./portal/types.js";
import { renderShell } from "./shared.js";

export const renderPortalClientScript = () => {
  const scripts = `
    const portalBootData = (() => {
      const node = document.getElementById("portalBootData");
      if (!node) {
        return {};
      }

      try {
        return JSON.parse(node.textContent || "{}");
      } catch {
        return {};
      }
    })();
    const portalBasePath = (() => {
      const pathname = String(window.location.pathname || "");
      const portalPathIndex = pathname.lastIndexOf("/portal");
      return portalPathIndex > 0 ? pathname.slice(0, portalPathIndex) : "";
    })();
    const stateKey = "dotke.onboard.portal";
    const draftStateKeyPrefix = stateKey + ".draft.";
    const pendingDraftStorageKey = draftStateKeyPrefix + "pending";
    const portalFlashNoticeKey = stateKey + ".flash";
    const uiStateKey = stateKey + ".ui";
    const PORTAL_PAGE_PATHS = ${JSON.stringify(PORTAL_PAGE_PATHS)};
    const bootPortalPageKey = (() => {
      const value = typeof portalBootData.pageKey === "string"
        ? portalBootData.pageKey.trim().toLowerCase()
        : "";
      return Object.prototype.hasOwnProperty.call(PORTAL_PAGE_PATHS, value)
        ? value
        : "welcome";
    })();
    const portalPageKey = getPortalPageKeyFromLocation() || bootPortalPageKey;
    const fieldMaxLengths = ${JSON.stringify(SECTION_FIELD_MAX_LENGTHS)};
    const initialPortalOperationalStatus = portalBootData.portalStatus || {};
    const UI_STATE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
    const DOCUMENT_SECTION_CODE = "SECTION_G_SUPPORTING_DOCUMENTS";
    const state = { applicationId: "" };
    let sessionRestoreSource = "none";
    let latestBundle = getEmptyBundle();
    let formsEnabled = false;
    let savingApplication = false;
    let submittingApplication = false;
    let sectionHighlightTimer = null;
    let localDraftSaveTimer = null;
    let viewportRestoreTimer = null;
    let documentHighlightTimer = null;
    let flowSectionSyncFrame = null;
    let flashToastTimer = null;
    let lastRememberedSectionCode = "";
    let committedProfileState = { applicantType: "", country: "" };
    let profileSwitchRequest = null;
    let visibleCountrySuggestions = [];
    let activeCountrySuggestionIndex = -1;
    let portalFlowUnlocked = false;
    let portalStatusPollTimer = null;
    let activeIntroStepKey = portalPageKey === "application" ? "requirements" : portalPageKey;
    let introTransitionTimer = null;
    let portalOperationalStatus = normalizePortalOperationalStatus(initialPortalOperationalStatus);

    const flashBox = document.getElementById("flashBox");
    const flashOverlay = document.getElementById("flashOverlay");
    const flashToast = document.getElementById("flashToast");
    const flashToastLabel = document.getElementById("flashToastLabel");
    const flashToastMessage = document.getElementById("flashToastMessage");
    const flashToastClose = document.getElementById("flashToastClose");
    const activationIndicator = document.getElementById("activationIndicator");
    const activationHint = document.getElementById("activationHint");
    const applicationFlow = document.getElementById("applicationFlow");
    const submitApplicationButton = document.getElementById("submitApplicationButton");
    const submissionFeedback = document.getElementById("submissionFeedback");
    const documentUploadFeedback = document.getElementById("documentUploadFeedback");
    const documentRequirementsList = document.getElementById("documentRequirementsList");
    const portalEntry = document.getElementById("portalEntry");
    const portalChecklistPreview = document.getElementById("portalChecklistPreview");
    const portalOverviewIdentityDescription = document.getElementById("portalOverviewIdentityDescription");
    const portalWelcomeStartButton = document.getElementById("portalWelcomeStartButton");
    const portalProfileBackButton = document.getElementById("portalProfileBackButton");
    const portalProfileProceedButton = document.getElementById("portalProfileProceedButton");
    const portalRequirementsBackButton = document.getElementById("portalRequirementsBackButton");
    const portalRequirementsProceedButton = document.getElementById("portalRequirementsProceedButton");
    const portalIntroShell = document.getElementById("portalIntroShell");
    const portalMainExperience = document.getElementById("portalMainExperience");
    const portalStatusBanner = document.getElementById("portalStatusBanner");
    const portalStatusTitle = document.getElementById("portalStatusTitle");
    const portalStatusReason = document.getElementById("portalStatusReason");
    const portalStatusMeta = document.getElementById("portalStatusMeta");
    const portalWelcomeEyebrow = document.getElementById("portalWelcomeEyebrow");
    const portalWelcomeTitle = document.getElementById("portalWelcomeTitle");
    const portalWelcomeMessage = document.getElementById("portalWelcomeMessage");
    const portalWelcomeAutoStatus = document.getElementById("portalWelcomeAutoStatus");
    const portalLivePathway = document.getElementById("portalLivePathway");
    const portalLivePathwayNote = document.getElementById("portalLivePathwayNote");
    const portalLiveDraftStatus = document.getElementById("portalLiveDraftStatus");
    const portalLiveDraftNote = document.getElementById("portalLiveDraftNote");
    const portalLiveDocumentStatus = document.getElementById("portalLiveDocumentStatus");
    const portalLiveDocumentNote = document.getElementById("portalLiveDocumentNote");
    const portalPathwayFocusTitle = document.getElementById("portalPathwayFocusTitle");
    const portalPathwayFocusDescription = document.getElementById("portalPathwayFocusDescription");
    const portalPathwayGuideLocal = document.getElementById("portalPathwayGuideLocal");
    const portalPathwayGuideInternational = document.getElementById("portalPathwayGuideInternational");
    const portalJourneyNoteTitle = document.getElementById("portalJourneyNoteTitle");
    const portalHeroSceneEyebrow = document.getElementById("portalHeroSceneEyebrow");
    const portalHeroSceneTitle = document.getElementById("portalHeroSceneTitle");
    const portalHeroSceneDescription = document.getElementById("portalHeroSceneDescription");
    const portalHeroPathway = document.getElementById("portalHeroPathway");
    const portalHeroJourneyState = document.getElementById("portalHeroJourneyState");
    const portalHeroDocumentState = document.getElementById("portalHeroDocumentState");
    const portalHeroProgressBar = document.getElementById("portalHeroProgressBar");
    const portalHeroProgressValue = document.getElementById("portalHeroProgressValue");
    const profileSetupPanel = document.querySelector(".profile-setup-panel");
    const profileCountryField = document.querySelector(".profile-country-field");
    const applicantTypeInput = document.getElementById("applicantType");
    const applicantTypeHint = document.getElementById("applicantTypeHint");
    const applicantTypeOptionButtons = Array.from(
      document.querySelectorAll("[data-applicant-type-option]")
    );
    const secondLevelSalesInput = document.querySelector('select[name="intendsSecondLevelSales"]');
    const secondLevelSalesOptionButtons = Array.from(
      document.querySelectorAll("[data-second-level-sales-option]")
    );
    const countryOfIncorporationInput = document.getElementById("countryOfIncorporation");
    const countrySuggestionList = document.getElementById("countrySuggestionList");
    const countrySearchFeedback = document.getElementById("countrySearchFeedback");
    const applicationProfileApplicantType = document.getElementById("applicationProfileApplicantType");
    const applicationProfileCountry = document.getElementById("applicationProfileCountry");
    const profileSwitchOverlay = document.getElementById("profileSwitchOverlay");
    const profileSwitchCurrentValue = document.getElementById("profileSwitchCurrentValue");
    const profileSwitchNextValue = document.getElementById("profileSwitchNextValue");
    const profileSwitchCancel = document.getElementById("profileSwitchCancel");
    const profileSwitchConfirm = document.getElementById("profileSwitchConfirm");
    const flowCurrentStepLabel = document.getElementById("flowCurrentStepLabel");
    const flowCurrentStepTitle = document.getElementById("flowCurrentStepTitle");
    const flowCurrentStepDescription = document.getElementById("flowCurrentStepDescription");
    const flowStepCounter = document.getElementById("flowStepCounter");
    const flowProgressValue = document.getElementById("flowProgressValue");
    const flowStepTabs = document.getElementById("flowStepTabs");
    const flowHeader = document.querySelector(".flow-header");
    const flowProfileContext = document.getElementById("flowProfileContext");
    const flowProfileContextValue = document.getElementById("flowProfileContextValue");
    const phoneFieldDecorators = [
      {
        input: document.querySelector('input[name="telephoneNumber"]'),
        prefix: document.getElementById("telephoneNumberPrefix"),
        hint: document.getElementById("telephoneNumberHint"),
      },
      {
        input: document.querySelector('input[name="contactPersonTelephoneNumber"]'),
        prefix: document.getElementById("contactPersonTelephoneNumberPrefix"),
        hint: document.getElementById("contactPersonTelephoneNumberHint"),
      },
    ];
    const flowSectionNodes = Array.from(document.querySelectorAll("[data-flow-section]"));
    const portalIntroStepButtons = Array.from(document.querySelectorAll("[data-intro-step-target]"));
    const portalIntroStepPanels = Array.from(document.querySelectorAll("[data-intro-step-panel]"));
    const flowSectionCodes = flowSectionNodes
      .map((node) => node.getAttribute("data-flow-section"))
      .filter((sectionCode) => typeof sectionCode === "string" && sectionCode);
    const flowSectionMeta = fromEntries(
      flowSectionNodes.map((node) => {
        const sectionCode = node.getAttribute("data-flow-section") || "";
        return [
          sectionCode,
          {
            step: String(node.querySelector(".section-step")?.textContent || "").trim(),
            title: String(node.querySelector(".section-rail h2")?.textContent || "").trim(),
            description: String(node.querySelector(".section-rail p")?.textContent || "").trim(),
          },
        ];
      })
    );
    const sectionStatusNodes = fromEntries(
      Array.from(document.querySelectorAll("[data-section-status]")).map((node) => [
        node.getAttribute("data-section-status"),
        node,
      ])
    );
    const pendingDocumentUploads = new Set();
    let activeFlowSectionCode = "";
    const IMAGE_UPLOAD_MAX_DIMENSION = 2200;
    const IMAGE_UPLOAD_QUALITY = 0.82;
    const SUBMISSION_RECEIVED_MESSAGE =
      "Application successfully received. Please await the next steps from KeNIC.";
    const FINAL_REVIEW_CODE = "FINAL_REVIEW";
    const SECTION_META = {
      SECTION_A_GENERAL_INFORMATION: { label: "Section A: General Information" },
      SECTION_B_BUSINESS_INFORMATION: { label: "Section B: Business Information" },
      SECTION_C_DOMAIN_ADMINISTRATION: { label: "Section C: Domain Administration" },
      SECTION_D_BUSINESS_DEVELOPMENT: { label: "Section D: Business Development" },
      SECTION_E_LEGAL_STRUCTURE: { label: "Section E: Legal Structure" },
      SECTION_F_DECLARATION: { label: "Section F: Declaration" },
    };
    const FLOW_TAB_LABELS = {
      SECTION_A_GENERAL_INFORMATION: "General Info",
      SECTION_B_BUSINESS_INFORMATION: "Business",
      SECTION_C_DOMAIN_ADMINISTRATION: "Domains",
      SECTION_D_BUSINESS_DEVELOPMENT: "Growth",
      SECTION_E_LEGAL_STRUCTURE: "Legal",
      SECTION_F_DECLARATION: "Declaration",
      SECTION_G_SUPPORTING_DOCUMENTS: "Documents",
      FINAL_REVIEW: "Review",
    };
    const PORTAL_ENTRY_PREVIEW = {
      local: {
        selectionHint:
          "This pathway is for registrars incorporated in Kenya.",
        continueLabel: "Continue",
        overviewIdentityTitle: "Kenyan applicant and company details",
        overviewIdentityDescription:
          "Provide the applicant identity, contact person, Kenyan company registration, and tax information.",
        documents: [
          {
            title: "Certificate of Incorporation",
            description: "Provide the Kenyan company formation document for the applying entity.",
          },
          {
            title: "Latest CR12",
            description: "Upload the latest company registry search or directorship and shareholding extract.",
          },
          {
            title: "KRA PIN Certificate",
            description: "Provide the applicant company's KRA PIN registration document.",
          },
          {
            title: "Tax Compliance Certificate",
            description: "Upload the current tax compliance certificate for the applicant company.",
          },
          {
            title: "Passport Photo",
            description: "Provide a passport-style image for the authorised representative.",
          },
        ],
      },
      international: {
        selectionHint:
          "This pathway is for registrars incorporated outside Kenya.",
        continueLabel: "Continue",
        overviewIdentityTitle: "Applicant and incorporation details",
        overviewIdentityDescription:
          "Provide the applicant identity, contact person, company registration, and tax information for your jurisdiction.",
        documents: [
          {
            title: "Company formation document",
            description: "Certificate of incorporation, registration, or the equivalent issued in your jurisdiction.",
          },
          {
            title: "Registry ownership extract",
            description: "Provide the registry search, good standing document, or equivalent directorship and shareholding disclosure.",
          },
          {
            title: "Tax registration document",
            description: "Upload the tax registration, TIN, VAT, or equivalent applicant tax record for your jurisdiction.",
          },
          {
            title: "Tax compliance evidence",
            description: "Provide tax clearance, good standing, or equivalent revenue authority evidence from your jurisdiction.",
          },
          {
            title: "Passport photo",
            description: "Provide a passport-style image for the authorised representative.",
          },
        ],
      },
    };
    const INTRO_STEP_META = {
      welcome: {
        title: "Welcome",
        progressTitle: "Welcome to the accreditation platform.",
        progressDescription: "Start with a clean welcome screen before pathway selection and final readiness.",
        actionTitle: "Start here",
        actionMessage: "Move into the onboarding process when you are ready.",
        primaryLabel: "Start process",
      },
      profile: {
        title: "Pathway",
        progressTitle: "Choose the registrar pathway.",
        progressDescription: "Select local or international. International applicants must also choose the country of incorporation.",
        actionTitle: "Pathway selection",
        actionMessage: "This decision shapes the form and document guidance that follow.",
        primaryLabel: "Continue",
      },
      requirements: {
        title: "Preview",
        progressTitle: "See what the application will ask for.",
        progressDescription: "Review the details and supporting documents needed before the live workspace opens.",
        actionTitle: "What you'll need",
        actionMessage: "We'll ask for company details, operational and technical information, legal details, and supporting documents.",
        primaryLabel: "Start application",
      },
    };
    const INTRO_STEP_ORDER = ["welcome", "profile", "requirements"];
    const PORTAL_AMBIENT_SCENES = {
      morning: [
        {
          imagePath: "images/morning/elephant.webp",
          eyebrow: "Morning welcome",
          title: "Start with a calm, guided accreditation pathway.",
          description: "Choose the right applicant profile first and the portal will tailor the form, checklist, and document guidance around it.",
          alt: "Elephants walking through a Kenyan wildlife landscape.",
        },
        {
          imagePath: "images/morning/bigElephant.webp",
          eyebrow: "Morning welcome",
          title: "Prepare the international pathway with confidence.",
          description: "The portal keeps local trust cues while adapting the guidance, document checklist, and phone formatting for your jurisdiction.",
          alt: "A large elephant in a Kenyan wildlife landscape.",
        },
      ],
      day: [
        {
          imagePath: "images/morning/zebras.webp",
          eyebrow: "Application momentum",
          title: "Move through the registrar journey with clear progress signals.",
          description: "Sections, document readiness, and submission status stay visible as the application takes shape.",
          alt: "Zebras crossing water in a Kenyan wildlife scene.",
        },
        {
          imagePath: "images/morning/cheetah.webp",
          eyebrow: "Application momentum",
          title: "Keep every requirement moving in one coordinated flow.",
          description: "Technical, legal, and document review expectations stay aligned so international applicants do not lose context.",
          alt: "A cheetah in a Kenyan wildlife scene.",
        },
      ],
      evening: [
        {
          imagePath: "images/evening/savana.webp",
          eyebrow: "Structured review",
          title: "Keep the experience premium without distracting from the work.",
          description: "Wildlife imagery adds atmosphere while the core actions stay legible, direct, and compliance-focused.",
          alt: "An evening savannah scene in Kenya.",
        },
        {
          imagePath: "images/evening/rhino.webp",
          eyebrow: "Structured review",
          title: "Present every requirement in a deliberate, professional rhythm.",
          description: "The portal keeps the applicant oriented from profile selection through document readiness and final submission.",
          alt: "A rhino in an evening Kenyan wildlife landscape.",
        },
      ],
      night: [
        {
          imagePath: "images/night/birdsBuffalo.webp",
          eyebrow: "Resume ready",
          title: "Return later and continue from your saved draft.",
          description: "This portal is designed for serious applications that may span multiple sessions, reviews, and supporting uploads.",
          alt: "A buffalo with birds in a Kenyan wildlife setting.",
        },
        {
          imagePath: "images/night/antelopes.webp",
          eyebrow: "Resume ready",
          title: "Stay oriented even when the application continues over time.",
          description: "The welcome surface, pathway summary, and live checklist keep applicants grounded whenever they come back.",
          alt: "Antelopes in a Kenyan wildlife scene.",
        },
      ],
    };

    const COUNTRY_PROFILES = {
      kenya: {
        key: "kenya",
        flag: "🇰🇪",
        dialCode: "+254",
        example: "712 345 678",
        hint: "For Kenya, enter the number in +254 or 0XXXXXXXXX format.",
      },
      uganda: {
        key: "uganda",
        flag: "🇺🇬",
        dialCode: "+256",
        example: "700 123 456",
      },
      tanzania: {
        key: "tanzania",
        flag: "🇹🇿",
        dialCode: "+255",
        example: "612 345 678",
      },
      rwanda: {
        key: "rwanda",
        flag: "🇷🇼",
        dialCode: "+250",
        example: "788 123 456",
      },
      burundi: {
        key: "burundi",
        flag: "🇧🇮",
        dialCode: "+257",
        example: "79 123 456",
      },
      nigeria: {
        key: "nigeria",
        flag: "🇳🇬",
        dialCode: "+234",
        example: "803 123 4567",
      },
      "south africa": {
        key: "south africa",
        flag: "🇿🇦",
        dialCode: "+27",
        example: "82 123 4567",
      },
      ghana: {
        key: "ghana",
        flag: "🇬🇭",
        dialCode: "+233",
        example: "23 123 4567",
      },
      "united kingdom": {
        key: "united kingdom",
        flag: "🇬🇧",
        dialCode: "+44",
        example: "20 7946 0958",
      },
      "united states": {
        key: "united states",
        flag: "🇺🇸",
        dialCode: "+1",
        example: "202 555 0147",
      },
      canada: {
        key: "canada",
        flag: "🇨🇦",
        dialCode: "+1",
        example: "416 555 0188",
      },
      india: {
        key: "india",
        flag: "🇮🇳",
        dialCode: "+91",
        example: "98765 43210",
      },
      "united arab emirates": {
        key: "united arab emirates",
        flag: "🇦🇪",
        dialCode: "+971",
        example: "50 123 4567",
      },
      australia: {
        key: "australia",
        flag: "🇦🇺",
        dialCode: "+61",
        example: "412 345 678",
      },
      germany: {
        key: "germany",
        flag: "🇩🇪",
        dialCode: "+49",
        example: "1512 3456789",
      },
      france: {
        key: "france",
        flag: "🇫🇷",
        dialCode: "+33",
        example: "6 12 34 56 78",
      },
    };

    const COUNTRY_PROFILE_ALIASES = {
      uk: "united kingdom",
      "u.k.": "united kingdom",
      england: "united kingdom",
      britain: "united kingdom",
      "great britain": "united kingdom",
      usa: "united states",
      us: "united states",
      "u.s.": "united states",
      uae: "united arab emirates",
      "south-africa": "south africa",
    };

    const COUNTRY_OPTIONS = [
      "Algeria",
      "Angola",
      "Australia",
      "Austria",
      "Belgium",
      "Botswana",
      "Brazil",
      "Burundi",
      "Cameroon",
      "Canada",
      "China",
      "Congo",
      "Cote d'Ivoire",
      "Denmark",
      "Djibouti",
      "Egypt",
      "Ethiopia",
      "Finland",
      "France",
      "Gambia",
      "Germany",
      "Ghana",
      "India",
      "Indonesia",
      "Ireland",
      "Israel",
      "Italy",
      "Japan",
      "Kenya",
      "Lesotho",
      "Madagascar",
      "Malawi",
      "Malaysia",
      "Mauritius",
      "Morocco",
      "Mozambique",
      "Namibia",
      "Netherlands",
      "New Zealand",
      "Nigeria",
      "Norway",
      "Pakistan",
      "Qatar",
      "Rwanda",
      "Saudi Arabia",
      "Senegal",
      "Seychelles",
      "Singapore",
      "Somalia",
      "South Africa",
      "South Sudan",
      "Spain",
      "Sudan",
      "Sweden",
      "Switzerland",
      "Tanzania",
      "Thailand",
      "Tunisia",
      "Turkey",
      "Uganda",
      "United Arab Emirates",
      "United Kingdom",
      "United States",
      "Zambia",
      "Zimbabwe",
    ];

    const COUNTRY_MATCH_LIMIT = 8;
    const COUNTRY_PREVIEW_LIMIT = 4;

    function resolvePortalPath(path) {
      const candidate = typeof path === "string" ? path.trim() : "";
      if (!candidate) {
        return candidate;
      }

      if (/^(?:[a-z]+:)?\\/\\//i.test(candidate) || candidate.startsWith("data:") || candidate.startsWith("blob:")) {
        return candidate;
      }

      if (portalBasePath && (candidate === portalBasePath || candidate.startsWith(portalBasePath + "/"))) {
        return candidate;
      }

      if (candidate.startsWith("/")) {
        return portalBasePath + candidate;
      }

      return candidate;
    }

    function buildPublicApiPath(path) {
      const suffix = typeof path === "string" ? path.trim() : "";
      return resolvePortalPath("/portal/api" + (suffix.startsWith("/") ? suffix : "/" + suffix));
    }

    function buildPortalAssetPath(path) {
      const suffix = typeof path === "string" ? path.trim().replace(/^\\/+/, "") : "";
      return resolvePortalPath("/portal/assets/" + suffix);
    }

    function buildPortalPagePath(pageKey) {
      const pagePath = PORTAL_PAGE_PATHS[pageKey] || PORTAL_PAGE_PATHS.welcome;
      return resolvePortalPath(pagePath);
    }

    function getPortalPageKeyFromLocation(pathname = window.location.pathname) {
      const normalizedPath = resolvePortalPath(String(pathname || ""));

      if (normalizedPath === buildPortalPagePath("profile")) {
        return "profile";
      }

      if (normalizedPath === buildPortalPagePath("requirements")) {
        return "requirements";
      }

      if (normalizedPath === buildPortalPagePath("application")) {
        return "application";
      }

      return "welcome";
    }

    function syncPortalIntroHistory(stepKey, options = {}) {
      if (!isIntroStepKey(stepKey) || portalPageKey === "application" || state.applicationId) {
        return false;
      }

      const nextPath = buildPortalPagePath(stepKey);
      if (!nextPath) {
        return false;
      }

      const currentPath = resolvePortalPath(String(window.location.pathname || ""));
      const currentState = isRecord(window.history.state) ? window.history.state : {};
      const nextState = {
        ...currentState,
        portalIntroStep: stepKey,
      };
      const historyMethod = options.mode === "replace" ? "replaceState" : "pushState";

      if (currentPath === nextPath && currentState.portalIntroStep === stepKey && options.force !== true) {
        return false;
      }

      window.history[historyMethod](nextState, document.title, nextPath);
      return true;
    }

    function navigateToPortalPage(pageKey, options = {}) {
      const nextPath = buildPortalPagePath(pageKey);
      if (!nextPath) {
        return false;
      }

      const currentPath = resolvePortalPath(String(window.location.pathname || ""));
      if (currentPath === nextPath) {
        setPortalIntroLoading(false);
        if (isIntroStepKey(pageKey)) {
          setActiveIntroStep(pageKey, { scrollIntoView: false });
        }
        return false;
      }

      persistLocalDraftNow();
      rememberPortalViewport();
      setPortalIntroLoading(options.loading !== false);

      const delay = Number.isFinite(options.delay) ? Math.max(0, options.delay) : 120;
      window.setTimeout(() => {
        window.location.assign(nextPath);
      }, delay);

      return true;
    }

    function fromEntries(entries) {
      const record = {};
      entries.forEach((entry) => {
        if (!Array.isArray(entry) || entry.length < 2) {
          return;
        }

        record[entry[0]] = entry[1];
      });
      return record;
    }

    function isRecord(value) {
      return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    function hasOwn(object, key) {
      return Boolean(object) && Object.prototype.hasOwnProperty.call(object, key);
    }

    function getEmptyBundle() {
      return {
        application: null,
        sections: [],
        checklist: {
          readyForSubmission: false,
          progressPercent: 0,
          sections: [],
          documents: [],
        },
        documents: [],
      };
    }

    function getDefaultPortalOperationalStatus() {
      return {
        portalKey: "applicant_portal",
        status: "active",
        reason: "",
        updatedBy: "system",
        updatedAt: "",
      };
    }

    function normalizePortalOperationalStatus(value) {
      const safeValue = isRecord(value) ? value : {};
      return {
        portalKey: typeof safeValue.portalKey === "string" && safeValue.portalKey
          ? safeValue.portalKey
          : "applicant_portal",
        status: safeValue.status === "inactive" ? "inactive" : "active",
        reason: typeof safeValue.reason === "string" ? safeValue.reason.trim() : "",
        updatedBy: typeof safeValue.updatedBy === "string" && safeValue.updatedBy.trim()
          ? safeValue.updatedBy.trim()
          : "system",
        updatedAt: typeof safeValue.updatedAt === "string" ? safeValue.updatedAt : "",
      };
    }

    function isPortalInactive() {
      return portalOperationalStatus.status === "inactive";
    }

    function getPortalInactiveMessage(status = portalOperationalStatus) {
      return status.reason || "Registrar applications are temporarily unavailable while updates are in progress.";
    }

    function syncPortalOperationalBanner() {
      if (!portalStatusBanner) {
        return;
      }

      if (!isPortalInactive()) {
        portalStatusBanner.hidden = true;
        return;
      }

      portalStatusBanner.hidden = false;

      if (portalStatusTitle) {
        portalStatusTitle.textContent = "Registrar applications are temporarily unavailable";
      }

      if (portalStatusReason) {
        portalStatusReason.textContent = getPortalInactiveMessage();
      }

      if (portalStatusMeta) {
        portalStatusMeta.textContent = "Please try again later.";
      }
    }

    function syncPortalOperationalState() {
      const inactive = isPortalInactive();

      syncPortalOperationalBanner();

      portalEntry?.classList.toggle("is-inactive", inactive);
      portalMainExperience?.classList.toggle("is-inactive", inactive);

      if (applicantTypeInput) {
        applicantTypeInput.disabled = inactive;
      }
      if (countryOfIncorporationInput) {
        countryOfIncorporationInput.disabled = inactive;
      }

      syncApplicantTypeControls();
      setFormsEnabled(formsEnabled);
      syncPortalEntryPreview();
      syncDocumentUploadFeedback(latestBundle);
      syncSubmissionFeedback(latestBundle);
      syncPortalExperienceSurface();
    }

    function normalizeBundle(bundle) {
      const safeBundle = isRecord(bundle) ? bundle : {};
      const safeChecklist = isRecord(safeBundle.checklist) ? safeBundle.checklist : {};

      return {
        ...getEmptyBundle(),
        ...safeBundle,
        sections: Array.isArray(safeBundle.sections) ? safeBundle.sections : [],
        checklist: {
          readyForSubmission: Boolean(safeChecklist.readyForSubmission),
          progressPercent: Number.isFinite(Number(safeChecklist.progressPercent))
            ? Number(safeChecklist.progressPercent)
            : 0,
          sections: Array.isArray(safeChecklist.sections) ? safeChecklist.sections : [],
          documents: Array.isArray(safeChecklist.documents) ? safeChecklist.documents : [],
        },
        documents: Array.isArray(safeBundle.documents) ? safeBundle.documents : [],
      };
    }

    function getEmptyUiState() {
      return {
        applicationId: "",
        activeSectionCode: "",
        activeRequirementCode: "",
        activeActionSource: "",
        awaitingDocumentReturn: false,
        updatedAt: "",
      };
    }

    function clearPortalUiState() {
      lastRememberedSectionCode = "";
      try {
        localStorage.removeItem(uiStateKey);
      } catch {}
    }

    function loadPortalUiState() {
      try {
        const raw = localStorage.getItem(uiStateKey);
        if (!raw) {
          return getEmptyUiState();
        }

        const parsed = JSON.parse(raw);
        if (!isRecord(parsed)) {
          return getEmptyUiState();
        }

        const updatedAt = typeof parsed.updatedAt === "string" ? parsed.updatedAt : "";
        if (updatedAt) {
          const ageMs = Date.now() - Date.parse(updatedAt);
          if (!Number.isFinite(ageMs) || ageMs > UI_STATE_MAX_AGE_MS) {
            clearPortalUiState();
            return getEmptyUiState();
          }
        }

        return {
          applicationId: typeof parsed.applicationId === "string" ? parsed.applicationId : "",
          activeSectionCode: typeof parsed.activeSectionCode === "string" ? parsed.activeSectionCode : "",
          activeRequirementCode: typeof parsed.activeRequirementCode === "string"
            ? parsed.activeRequirementCode
            : "",
          activeActionSource: typeof parsed.activeActionSource === "string"
            ? parsed.activeActionSource
            : "",
          awaitingDocumentReturn: Boolean(parsed.awaitingDocumentReturn),
          updatedAt,
        };
      } catch {
        return getEmptyUiState();
      }
    }

    function savePortalUiState(patch = {}) {
      const nextUiState = {
        ...loadPortalUiState(),
        applicationId: state.applicationId || "",
        updatedAt: new Date().toISOString(),
      };

      if (hasOwn(patch, "applicationId")) {
        nextUiState.applicationId = String(patch.applicationId || "");
      }
      if (hasOwn(patch, "activeSectionCode")) {
        nextUiState.activeSectionCode = String(patch.activeSectionCode || "");
      }
      if (hasOwn(patch, "activeRequirementCode")) {
        nextUiState.activeRequirementCode = String(patch.activeRequirementCode || "");
      }
      if (hasOwn(patch, "activeActionSource")) {
        nextUiState.activeActionSource = String(patch.activeActionSource || "");
      }
      if (hasOwn(patch, "awaitingDocumentReturn")) {
        nextUiState.awaitingDocumentReturn = Boolean(patch.awaitingDocumentReturn);
      }

      lastRememberedSectionCode = nextUiState.activeSectionCode;

      try {
        localStorage.setItem(uiStateKey, JSON.stringify(nextUiState));
      } catch {}

      return nextUiState;
    }

    function isPortalUiStateCompatible(uiState) {
      const storedApplicationId = String(uiState?.applicationId || "");
      return !storedApplicationId || !state.applicationId || storedApplicationId === state.applicationId;
    }

    function getFlowSectionNode(sectionCode) {
      return sectionCode
        ? document.querySelector('[data-flow-section="' + sectionCode + '"]')
        : null;
    }

    function getDocumentCardNode(requirementCode) {
      return requirementCode
        ? document.querySelector('[data-document-requirement="' + requirementCode + '"]')
        : null;
    }

    function getCurrentFlowSectionCode() {
      return activeFlowSectionCode || flowSectionCodes[0] || "";
    }

    function getFlowSectionIndex(sectionCode) {
      return flowSectionCodes.indexOf(sectionCode);
    }

    function getFlowSectionMeta(sectionCode) {
      return flowSectionMeta[sectionCode] || {
        step: "",
        title: getSectionLabel(sectionCode),
        description: "",
      };
    }

    function getFlowSectionTabLabel(sectionCode) {
      return FLOW_TAB_LABELS[sectionCode] || getFlowSectionMeta(sectionCode).title || sectionCode;
    }

    function normalizeApplicantTypeSelection(value) {
      return value === "international"
        ? "international"
        : value === "local"
          ? "local"
          : "";
    }

    function getPortalPreviewProfileKey() {
      return normalizeApplicantTypeSelection(applicantTypeInput?.value) === "international"
        ? "international"
        : "local";
    }

    function getPortalPreviewConfig() {
      return PORTAL_ENTRY_PREVIEW[getPortalPreviewProfileKey()] || PORTAL_ENTRY_PREVIEW.local;
    }

    function isIntroStepKey(stepKey) {
      return INTRO_STEP_ORDER.includes(stepKey);
    }

    function getIntroStepMeta(stepKey = activeIntroStepKey) {
      const resolvedStepKey = isIntroStepKey(stepKey) ? stepKey : getDefaultIntroStepKeyForPage();
      return INTRO_STEP_META[resolvedStepKey] || INTRO_STEP_META.welcome;
    }

    function getIntroStepIndex(stepKey = activeIntroStepKey) {
      const resolvedStepKey = isIntroStepKey(stepKey) ? stepKey : getDefaultIntroStepKeyForPage();
      return INTRO_STEP_ORDER.indexOf(resolvedStepKey);
    }

    function getNextIntroStepKey(stepKey = activeIntroStepKey) {
      const currentIndex = getIntroStepIndex(stepKey);
      return currentIndex >= 0 && currentIndex < INTRO_STEP_ORDER.length - 1
        ? INTRO_STEP_ORDER[currentIndex + 1]
        : "";
    }

    function getPreviousIntroStepKey(stepKey = activeIntroStepKey) {
      const currentIndex = getIntroStepIndex(stepKey);
      return currentIndex > 0 ? INTRO_STEP_ORDER[currentIndex - 1] : "";
    }

    function getDefaultIntroStepKeyForPage() {
      return portalPageKey === "application" ? "requirements" : portalPageKey;
    }

    function getRenderableIntroStepKey(stepKey = activeIntroStepKey) {
      const fallbackStepKey = getDefaultIntroStepKeyForPage();
      return isIntroStepKey(stepKey) ? stepKey : fallbackStepKey;
    }

    function setPortalIntroLoading(loading) {
      if (loading) {
        clearWelcomeAutoAdvance();
      }
      portalEntry?.classList.toggle("is-loading-intro", Boolean(loading));
      portalWelcomeStartButton?.classList.toggle("is-loading", Boolean(loading));
      portalProfileProceedButton?.classList.toggle("is-loading", Boolean(loading));
      portalProfileBackButton?.classList.toggle("is-loading", Boolean(loading));
    }

    function clearWelcomeAutoAdvance() {}

    function syncWelcomeAutoAdvance() {
      if (!portalWelcomeAutoStatus) {
        return;
      }

      if (isPortalInactive() && !state.applicationId) {
        portalWelcomeAutoStatus.textContent = "Applications will reopen here once the portal is active again.";
        return;
      }

      if (state.applicationId) {
        portalWelcomeAutoStatus.textContent = "Your saved draft is ready whenever you want to continue.";
        return;
      }

      portalWelcomeAutoStatus.textContent = "Start the process when you are ready.";
    }

    function setActiveIntroStep(stepKey, options = {}) {
      const nextStepKey = getRenderableIntroStepKey(stepKey);
      activeIntroStepKey = nextStepKey;
      if (portalIntroShell) {
        portalIntroShell.classList.remove(
          "portal-intro-shell--welcome",
          "portal-intro-shell--profile",
          "portal-intro-shell--requirements"
        );
        portalIntroShell.classList.add("portal-intro-shell--" + nextStepKey);
      }

      portalIntroStepButtons.forEach((button) => {
        const isCurrent = button.getAttribute("data-intro-step-target") === nextStepKey;
        button.classList.toggle("is-current", isCurrent);
        button.setAttribute("aria-selected", isCurrent ? "true" : "false");
        button.setAttribute("tabindex", isCurrent ? "0" : "-1");
      });

      portalIntroStepPanels.forEach((panel) => {
        const isCurrent = panel.getAttribute("data-intro-step-panel") === nextStepKey;
        panel.classList.toggle("is-current", isCurrent);
        panel.hidden = !isCurrent;
      });

      syncPortalEntryPreview();

      if (options.scrollIntoView && !portalFlowUnlocked) {
        portalIntroShell?.scrollIntoView({
          behavior: options.smooth === false ? "auto" : "smooth",
          block: "start",
        });
      }
    }

    async function transitionIntroStep(stepKey, options = {}) {
      const nextStepKey = getRenderableIntroStepKey(stepKey);

      if (portalEntry?.classList.contains("is-loading-intro")) {
        return false;
      }

      if (nextStepKey === activeIntroStepKey) {
        setActiveIntroStep(nextStepKey, options);
        return true;
      }

      setPortalIntroLoading(true);

      await new Promise((resolve) => {
        introTransitionTimer = window.setTimeout(resolve, 180);
      });

      introTransitionTimer = null;
      setActiveIntroStep(nextStepKey, options);
      if (options.history !== false) {
        syncPortalIntroHistory(nextStepKey, {
          mode: options.historyMode === "replace" ? "replace" : "push",
        });
      }
      setPortalIntroLoading(false);
      return true;
    }

    function getPortalGreeting() {
      const hour = new Date().getHours();

      if (hour < 12) {
        return "Good morning";
      }

      if (hour < 17) {
        return "Good afternoon";
      }

      if (hour < 21) {
        return "Good evening";
      }

      return "Welcome back";
    }

    function getPortalAmbientScenePeriod() {
      const hour = new Date().getHours();

      if (hour < 11) {
        return "morning";
      }

      if (hour < 17) {
        return "day";
      }

      if (hour < 20) {
        return "evening";
      }

      return "night";
    }

    function getPortalAmbientSceneFallback() {
      return {
        imagePath: "images/morning/elephant.webp",
        eyebrow: "Portal view",
        title: "Guided accreditation flow",
        description: "Choose the right pathway and move through the application with clear progress indicators.",
        alt: "Kenyan wildlife landscape.",
      };
    }

    function getPortalAmbientSceneOptions() {
      return PORTAL_AMBIENT_SCENES[getPortalAmbientScenePeriod()]
        || PORTAL_AMBIENT_SCENES.day
        || [];
    }

    function getPortalAmbientScene() {
      const sceneOptions = getPortalAmbientSceneOptions();
      const sceneIndex = applicantTypeInput?.value === "international"
        ? Math.min(1, Math.max(0, sceneOptions.length - 1))
        : 0;

      return sceneOptions[sceneIndex] || sceneOptions[0] || getPortalAmbientSceneFallback();
    }

    function getPortalAmbientBackdropScene() {
      const sceneOptions = getPortalAmbientSceneOptions();

      // Keep the shared portal backdrop steady while the pathway-specific copy updates.
      return sceneOptions[0] || getPortalAmbientSceneFallback();
    }

    function getPortalCountryLabel() {
      const applicantType = normalizeApplicantTypeSelection(applicantTypeInput?.value);
      const rawCountry = getRawCountrySelection();
      const resolvedCountry = resolveCountryOption(rawCountry);

      if (applicantType === "local") {
        return "Kenya";
      }

      if (!applicantType) {
        return "Choose registrar type first";
      }

      if (isBlockedInternationalCountry(rawCountry)) {
        return "Choose another country";
      }

      return resolvedCountry || rawCountry || "Select country";
    }

    function getPortalProgressPercent() {
      const progress = Number(latestBundle?.checklist?.progressPercent ?? 0);
      return Number.isFinite(progress)
        ? Math.max(0, Math.min(100, Math.round(progress)))
        : 0;
    }

    function escapePortalText(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function formatPortalWelcomeTitle(title) {
      const normalizedTitle = String(title || "").trim();

      if (normalizedTitle === "Welcome to KeNIC Registrar Accreditation Platform.") {
        return '<span class="portal-title-primary">Welcome to KeNIC</span> <span class="portal-title-secondary">Registrar Accreditation Platform.</span>';
      }

      if (normalizedTitle === "Welcome to KeNIC.") {
        return '<span class="portal-title-primary">Welcome</span> <span class="portal-title-secondary">to KeNIC.</span>';
      }

      if (normalizedTitle === "Welcome back.") {
        return '<span class="portal-title-primary">Welcome</span> <span class="portal-title-secondary">back.</span>';
      }

      if (normalizedTitle === "Your draft is ready.") {
        return '<span class="portal-title-primary">Your draft</span> <span class="portal-title-secondary">is ready.</span>';
      }

      if (normalizedTitle === "Applications are paused.") {
        return '<span class="portal-title-primary">Applications</span> <span class="portal-title-secondary">are paused.</span>';
      }

      return escapePortalText(normalizedTitle);
    }

    function setPortalWelcomeTitle(title) {
      if (!(portalWelcomeTitle instanceof HTMLElement)) {
        return;
      }

      portalWelcomeTitle.innerHTML = formatPortalWelcomeTitle(title);
    }

    function syncPortalExperienceSurface() {
      const preview = getPortalPreviewConfig();
      const greeting = getPortalGreeting();
      const applicantTypeLabel = getApplicantTypeLabel(applicantTypeInput?.value);
      const countryLabel = getPortalCountryLabel();
      const profileLabel = applicantTypeLabel + " • " + countryLabel;
      const progressPercent = getPortalProgressPercent();
      const hasDraft = Boolean(state.applicationId);
      const scene = getPortalAmbientScene();
      const ambientBackdropScene = getPortalAmbientBackdropScene();
      const sceneUrl = buildPortalAssetPath(ambientBackdropScene.imagePath);
      const checklistDocuments = getChecklistDocuments(latestBundle);
      const requiredDocuments = checklistDocuments.length
        ? checklistDocuments.filter((document) => document.isRequired)
        : [];
      const uploadedRequiredDocuments = requiredDocuments.filter((document) => document.uploaded).length;

      let welcomeEyebrow = "KeNIC accreditation";
      let welcomeTitle = "Welcome to KeNIC Registrar Accreditation Platform.";
      let welcomeMessage = "";
      let draftStatusValue = "Ready to start";
      let draftStatusNote = "Progress is saved in this browser while you work.";
      let documentStatusValue = preview.documents.length + " required documents";
      let documentStatusNote = "Requirements adapt to the selected pathway.";
      let heroJourneyValue = "Guided 8-step flow";
      let heroProgressLabel = "Choose a pathway to continue";
      let heroProgressWidth = isOnboardingProfileReady() ? 18 : 6;
      let sceneEyebrow = scene.eyebrow;
      let sceneTitle = scene.title;
      let sceneDescription = scene.description;

      if (requiredDocuments.length) {
        documentStatusValue = uploadedRequiredDocuments > 0
          ? uploadedRequiredDocuments + " of " + requiredDocuments.length + " uploaded"
          : requiredDocuments.length + " required documents";
        documentStatusNote = uploadedRequiredDocuments === requiredDocuments.length
          ? "All required supporting documents are in place."
          : "Upload each required document before final submission.";
      }

      const applicantType = normalizeApplicantTypeSelection(applicantTypeInput?.value);

      if (applicantType === "local") {
        if (portalLivePathwayNote) {
          portalLivePathwayNote.textContent = "Kenya is used automatically for local applications.";
        }
      } else if (applicantType === "international") {
        const rawCountry = getRawCountrySelection();
        const resolvedCountry = resolveCountryOption(rawCountry);
        if (portalLivePathwayNote) {
          portalLivePathwayNote.textContent = resolvedCountry
            ? "Country-specific phone and submission guidance adjusts automatically."
            : "Choose the country of incorporation from the suggested list to continue.";
        }
      } else if (portalLivePathwayNote) {
        portalLivePathwayNote.textContent = "Choose the registrar type to tailor the application guidance.";
      }

      if (isPortalInactive() && !hasDraft) {
        welcomeEyebrow = "Portal update";
        draftStatusValue = "Temporarily paused";
        draftStatusNote = "Please try again once the portal is re-opened.";
        heroProgressLabel = "Portal temporarily paused";
        heroProgressWidth = 0;
        sceneEyebrow = "Portal update";
        sceneTitle = "Applications are paused while the portal is updated.";
        sceneDescription = getPortalInactiveMessage();
      } else if (hasDraft) {
        welcomeEyebrow = "Welcome back";
        draftStatusValue = progressPercent > 0 ? progressPercent + "% complete" : "Draft active";
        draftStatusNote = "This browser can reopen your in-progress application while the session remains active.";
        heroJourneyValue = progressPercent > 0 ? progressPercent + "% complete" : "Draft active";
        heroProgressLabel = progressPercent > 0 ? progressPercent + "% ready for review" : "Draft started";
        heroProgressWidth = Math.max(progressPercent, 18);
        sceneEyebrow = "Welcome back";
        sceneTitle = "Your accreditation draft is ready to continue.";
        sceneDescription =
          "Return to the guided sections, keep documents moving, and track submission readiness from one place.";
      } else if (applicantTypeInput?.value === "international") {
        welcomeEyebrow = greeting;
        draftStatusValue = isOnboardingProfileReady() ? "Profile ready" : "Choose country";
        draftStatusNote = isOnboardingProfileReady()
          ? "Continue to open the guided application flow."
          : "Select the country of incorporation to tailor the application.";
        heroJourneyValue = isOnboardingProfileReady() ? "Guided flow ready" : "Awaiting country selection";
        heroProgressLabel = isOnboardingProfileReady() ? "Profile confirmed" : "Choose a country to continue";
        heroProgressWidth = isOnboardingProfileReady() ? 18 : 6;
      } else if (portalFlowUnlocked || isOnboardingProfileReady()) {
        welcomeEyebrow = greeting;
        draftStatusValue = "Profile ready";
        draftStatusNote = "Continue to open the guided application flow.";
        heroJourneyValue = portalFlowUnlocked ? "Flow open" : "Guided flow ready";
        heroProgressLabel = "Profile confirmed";
        heroProgressWidth = portalFlowUnlocked ? 28 : 18;
      } else {
        welcomeEyebrow = greeting;
      }

      if (portalWelcomeEyebrow) {
        portalWelcomeEyebrow.textContent = welcomeEyebrow;
      }
      setPortalWelcomeTitle(welcomeTitle);
      if (portalWelcomeMessage) {
        portalWelcomeMessage.textContent = welcomeMessage;
      }
      if (portalLivePathway) {
        portalLivePathway.textContent = profileLabel;
      }
      if (portalLiveDraftStatus) {
        portalLiveDraftStatus.textContent = draftStatusValue;
      }
      if (portalLiveDraftNote) {
        portalLiveDraftNote.textContent = draftStatusNote;
      }
      if (portalLiveDocumentStatus) {
        portalLiveDocumentStatus.textContent = documentStatusValue;
      }
      if (portalLiveDocumentNote) {
        portalLiveDocumentNote.textContent = documentStatusNote;
      }
      if (portalPathwayGuideLocal) {
        portalPathwayGuideLocal.dataset.selected = applicantTypeInput?.value === "international" ? "false" : "true";
      }
      if (portalPathwayGuideInternational) {
        portalPathwayGuideInternational.dataset.selected = applicantTypeInput?.value === "international" ? "true" : "false";
      }
      if (portalPathwayFocusTitle) {
        portalPathwayFocusTitle.textContent = applicantTypeInput?.value === "international"
          ? "International pathway selected"
          : "Local pathway selected";
      }
      if (portalPathwayFocusDescription) {
        portalPathwayFocusDescription.textContent = applicantTypeInput?.value === "international"
          ? (isOnboardingProfileReady()
            ? "Country-aware guidance is ready, and the portal will adapt document expectations around the selected jurisdiction."
            : "Choose the country of incorporation so the portal can tailor phone guidance and supporting document language.")
          : "This flow assumes the applying registrar is incorporated in Kenya.";
      }
      if (portalJourneyNoteTitle) {
        portalJourneyNoteTitle.textContent = hasDraft
          ? "Your saved application is ready."
          : "Here's what the application will ask for.";
      }
      if (portalHeroPathway) {
        portalHeroPathway.textContent = profileLabel;
      }
      if (portalHeroJourneyState) {
        portalHeroJourneyState.textContent = heroJourneyValue;
      }
      if (portalHeroDocumentState) {
        portalHeroDocumentState.textContent = requiredDocuments.length
          ? uploadedRequiredDocuments + " of " + requiredDocuments.length + " uploaded"
          : preview.documents.length + " required";
      }
      if (portalHeroProgressBar) {
        portalHeroProgressBar.style.width = heroProgressWidth + "%";
      }
      if (portalHeroProgressValue) {
        portalHeroProgressValue.textContent = heroProgressLabel;
      }
      if (portalHeroSceneEyebrow) {
        portalHeroSceneEyebrow.textContent = sceneEyebrow;
      }
      if (portalHeroSceneTitle) {
        portalHeroSceneTitle.textContent = sceneTitle;
      }
      if (portalHeroSceneDescription) {
        portalHeroSceneDescription.textContent = sceneDescription;
      }
      document.documentElement.style.setProperty("--portal-ambient-image", 'url("' + sceneUrl + '")');
    }

    function syncPortalIntroState() {
      const introMeta = getIntroStepMeta();
      const introLoading = portalEntry?.classList.contains("is-loading-intro");
      const isFirstStep = getIntroStepIndex() <= 0;
      const isProfileStep = activeIntroStepKey === "profile";
      const isRequirementsStep = activeIntroStepKey === "requirements";
      const introProgressLabels = {
        welcome: "Welcome",
        profile: "Profile selection",
        requirements: "Application preview",
      };
      const introProgressWidths = {
        welcome: 18,
        profile: 56,
        requirements: 88,
      };

      if (portalWelcomeStartButton instanceof HTMLButtonElement) {
        portalWelcomeStartButton.disabled = Boolean(introLoading);
      }
      if (portalProfileBackButton instanceof HTMLButtonElement) {
        portalProfileBackButton.disabled = Boolean(introLoading) || portalFlowUnlocked || isFirstStep;
      }
      if (portalRequirementsBackButton instanceof HTMLButtonElement) {
        portalRequirementsBackButton.disabled = Boolean(introLoading) || portalFlowUnlocked || isFirstStep;
      }
      if (portalProfileProceedButton instanceof HTMLButtonElement) {
        const profileNeedsSelection = isProfileStep && !isOnboardingProfileReady();
        portalProfileProceedButton.textContent = "Continue";
        portalProfileProceedButton.disabled = Boolean(introLoading)
          || (
            !portalFlowUnlocked
            && (
              profileNeedsSelection
            )
          );
      }
      if (portalRequirementsProceedButton instanceof HTMLButtonElement) {
        portalRequirementsProceedButton.textContent = portalFlowUnlocked ? "Return to application" : introMeta.primaryLabel;
        portalRequirementsProceedButton.disabled = false;
      }
      if (!portalFlowUnlocked) {
        if (portalHeroProgressValue) {
          portalHeroProgressValue.textContent = introProgressLabels[activeIntroStepKey] || introProgressLabels.welcome;
        }
        if (portalHeroProgressBar) {
          portalHeroProgressBar.style.width = (introProgressWidths[activeIntroStepKey] || introProgressWidths.welcome) + "%";
        }
      }

      syncWelcomeAutoAdvance();
    }

    function getApplicantTypeSelectionHint(lockIdentity = Boolean(state.applicationId)) {
      const preview = getPortalPreviewConfig();
      const applicantType = normalizeApplicantTypeSelection(applicantTypeInput?.value);

      if (!applicantType) {
        return "Choose the pathway that matches the applying registrar.";
      }

      const isLocal = applicantType === "local";

      if (lockIdentity) {
        return isLocal
          ? "You selected the Kenyan registrar pathway. If you change it later, we will confirm before starting a fresh application."
          : "You selected the international registrar pathway. If you change it later, we will confirm before starting a fresh application.";
      }

      if (isLocal) {
        return preview.selectionHint + " Kenya will be used automatically.";
      }

      return preview.selectionHint + " Choose the country of incorporation to continue.";
    }

    function getRawCountrySelection() {
      return String(countryOfIncorporationInput?.value || "").trim();
    }

    function getResolvedCountrySelection() {
      return resolveCountryOption(getRawCountrySelection());
    }

    function isOnboardingProfileReady() {
      const applicantType = normalizeApplicantTypeSelection(applicantTypeInput?.value);

      if (!applicantType) {
        return false;
      }

      if (applicantType !== "international") {
        return true;
      }

      const rawCountry = getRawCountrySelection();
      if (!rawCountry || isBlockedInternationalCountry(rawCountry)) {
        return false;
      }

      return Boolean(getResolvedCountrySelection());
    }

    function renderPortalChecklistPreview() {
      if (!portalChecklistPreview) {
        return;
      }

      const preview = getPortalPreviewConfig();
      portalChecklistPreview.replaceChildren();

      preview.documents.forEach((previewDocument) => {
        const item = document.createElement("div");
        item.className = "portal-entry-item";

        const title = document.createElement("strong");
        title.textContent = previewDocument.title;

        const description = document.createElement("p");
        description.textContent = previewDocument.description;

        item.appendChild(title);
        item.appendChild(description);
        portalChecklistPreview.appendChild(item);
      });

    }

    function syncPortalEntryPreview() {
      const preview = getPortalPreviewConfig();

      if (portalOverviewIdentityDescription) {
        portalOverviewIdentityDescription.textContent = preview.overviewIdentityDescription;
      }

      renderPortalChecklistPreview();
      syncPortalExperienceSurface();
      syncPortalIntroState();
    }

    function setPortalEntryCompact(compact = false) {
      portalEntry?.classList.toggle("is-compact", compact);
      if (compact) {
        activeIntroStepKey = "profile";
      } else {
        activeIntroStepKey = getDefaultIntroStepKeyForPage();
      }
      portalIntroStepPanels.forEach((panel) => {
        const isCurrent = panel.getAttribute("data-intro-step-panel") === activeIntroStepKey;
        panel.classList.toggle("is-current", isCurrent);
        panel.hidden = !isCurrent;
      });
      portalIntroStepButtons.forEach((button) => {
        const isCurrent = button.getAttribute("data-intro-step-target") === activeIntroStepKey;
        button.classList.toggle("is-current", isCurrent);
        button.setAttribute("aria-selected", isCurrent ? "true" : "false");
        button.setAttribute("tabindex", isCurrent ? "0" : "-1");
      });
      syncPortalEntryPreview();
    }

    function setPortalFlowUnlocked(unlocked, options = {}) {
      portalFlowUnlocked = Boolean(unlocked);

      if (portalEntry) {
        portalEntry.classList.toggle("has-entered-flow", portalFlowUnlocked);
      }
      if (portalMainExperience) {
        portalMainExperience.hidden = !portalFlowUnlocked;
      }
      if (flowProfileContext) {
        flowProfileContext.hidden = !portalFlowUnlocked;
      }

      if (portalFlowUnlocked) {
        setPortalEntryCompact(options.compact !== false);
        return;
      }

      setPortalEntryCompact(false);
    }

    function focusProfileSetup() {
      const firstTarget = applicantTypeInput?.value === "international"
        ? (countryOfIncorporationInput || applicantTypeOptionButtons[0])
        : (applicantTypeOptionButtons[0] || countryOfIncorporationInput);
      if (!(firstTarget instanceof HTMLElement)) {
        return;
      }

      try {
        firstTarget.focus({ preventScroll: true });
      } catch {
        firstTarget.focus();
      }
    }

    function scrollToProfileSetup(options = {}) {
      if (portalPageKey === "application") {
        navigateToPortalPage("profile", { delay: 0 });
        return;
      }

      if (!portalFlowUnlocked) {
        setActiveIntroStep("profile", { scrollIntoView: false });
      }

      portalEntry?.scrollIntoView({
        behavior: options.smooth === false ? "auto" : "smooth",
        block: "start",
      });

      if (options.focus === false) {
        return;
      }

      window.setTimeout(() => {
        focusProfileSetup();
      }, 60);
    }

    function getFlowSectionStatusText(sectionCode) {
      if (sectionStatusNodes[sectionCode]) {
        return String(sectionStatusNodes[sectionCode].textContent || "").trim() || "Pending";
      }

      if (sectionCode === DOCUMENT_SECTION_CODE) {
        const checklistDocuments = getChecklistDocuments(latestBundle);
        if (!state.applicationId) {
          return "Draft";
        }
        if (pendingDocumentUploads.size > 0) {
          return "Uploading";
        }
        if (!checklistDocuments.length) {
          return "Preparing";
        }
        if (checklistDocuments.some((document) => document.isRequired && !document.uploaded)) {
          return "Pending";
        }
        return "Ready";
      }

      if (sectionCode === FINAL_REVIEW_CODE) {
        const status = latestBundle?.application?.status || "";
        if (status === "submitted" || status === "in_review") {
          return "Submitted";
        }
        if (status === "approved") {
          return "Approved";
        }
        if (status === "rejected") {
          return "Closed";
        }
        return latestBundle?.checklist?.readyForSubmission ? "Ready" : "Pending";
      }

      return "Pending";
    }

    function getFlowSectionStatusKind(sectionCode) {
      const statusText = getFlowSectionStatusText(sectionCode).toLowerCase();

      if (
        statusText.includes("complete")
        || statusText.includes("ready")
        || statusText.includes("submitted")
        || statusText.includes("approved")
      ) {
        return "complete";
      }

      if (
        statusText.includes("review")
        || statusText.includes("closed")
        || statusText.includes("error")
      ) {
        return "issue";
      }

      if (
        statusText.includes("progress")
        || statusText.includes("uploading")
      ) {
        return "active";
      }

      return "pending";
    }

    function getPreferredFlowSectionCode(bundle = latestBundle) {
      const rememberedSectionCode = loadPortalUiState().activeSectionCode;
      if (flowSectionCodes.includes(rememberedSectionCode)) {
        return rememberedSectionCode;
      }

      const firstIncompleteSection = Array.isArray(bundle?.checklist?.sections)
        ? bundle.checklist.sections.find((section) => !section?.isComplete)?.sectionCode || ""
        : "";
      if (flowSectionCodes.includes(firstIncompleteSection)) {
        return firstIncompleteSection;
      }

      const hasPendingDocuments = getChecklistDocuments(bundle).some(
        (document) => document.isRequired && !document.uploaded
      );
      if (hasPendingDocuments) {
        return DOCUMENT_SECTION_CODE;
      }

      if (bundle?.checklist?.readyForSubmission) {
        return FINAL_REVIEW_CODE;
      }

      return flowSectionCodes[0] || "";
    }

    function getPreviousFlowSectionCode(sectionCode) {
      const index = getFlowSectionIndex(sectionCode);
      return index > 0 ? flowSectionCodes[index - 1] : "";
    }

    function getNextFlowSectionCode(sectionCode) {
      const index = getFlowSectionIndex(sectionCode);
      return index >= 0 && index < flowSectionCodes.length - 1 ? flowSectionCodes[index + 1] : "";
    }

    function getNextFlowActionLabel(sectionCode) {
      return getNextFlowSectionCode(sectionCode) ? "Next" : "";
    }

    function syncFlowNavigationState() {
      const currentSectionCode = getCurrentFlowSectionCode();
      if (!currentSectionCode) {
        return;
      }

      const currentMeta = getFlowSectionMeta(currentSectionCode);
      const currentIndex = Math.max(0, getFlowSectionIndex(currentSectionCode));
      const totalSteps = flowSectionCodes.length || 1;
      const progressPercent = ((currentIndex + 1) / totalSteps) * 100;

      if (flowCurrentStepLabel) {
        flowCurrentStepLabel.textContent = currentMeta.step || "Application flow";
      }
      if (flowCurrentStepTitle) {
        flowCurrentStepTitle.textContent = currentMeta.title || getSectionLabel(currentSectionCode);
      }
      if (flowCurrentStepDescription) {
        flowCurrentStepDescription.textContent = currentMeta.description || "";
      }
      if (flowStepCounter) {
        flowStepCounter.textContent =
          "Step " + (currentIndex + 1) + " of " + totalSteps + " • " + getFlowSectionStatusText(currentSectionCode);
      }
      if (flowProgressValue) {
        flowProgressValue.style.width = progressPercent.toFixed(2) + "%";
      }

      if (flowStepTabs) {
        flowStepTabs.replaceChildren();
        flowSectionCodes.forEach((sectionCode) => {
          const button = document.createElement("button");
          const isActive = sectionCode === currentSectionCode;
          const statusKind = getFlowSectionStatusKind(sectionCode);
          const statusText = getFlowSectionStatusText(sectionCode);
          button.type = "button";
          button.className =
            "flow-step-tab is-" + statusKind + (isActive ? " is-active" : "");
          button.setAttribute("aria-pressed", isActive ? "true" : "false");
          button.setAttribute(
            "aria-label",
            getFlowSectionTabLabel(sectionCode) + " • " + statusText
          );

          const indicator = document.createElement("span");
          indicator.className = "flow-step-tab-indicator";
          indicator.setAttribute("aria-hidden", "true");

          const label = document.createElement("span");
          label.className = "flow-step-tab-label";
          label.textContent = getFlowSectionTabLabel(sectionCode);

          button.appendChild(indicator);
          button.appendChild(label);
          button.addEventListener("click", () => {
            void goToFlowSection(sectionCode, { focusHeading: true });
          });
          flowStepTabs.appendChild(button);
        });
      }

      document.querySelectorAll("[data-flow-nav-for]").forEach((node) => {
        const sectionCode = node.getAttribute("data-flow-nav-for") || "";
        const previousButton = node.querySelector("[data-flow-prev]");
        const nextButton = node.querySelector("[data-flow-next]");
        const meta = node.querySelector("[data-flow-nav-meta]");
        const sectionIndex = Math.max(0, getFlowSectionIndex(sectionCode));
        const previousSectionCode = getPreviousFlowSectionCode(sectionCode);
        const nextSectionCode = getNextFlowSectionCode(sectionCode);

        node.hidden = sectionCode !== currentSectionCode;

        if (previousButton instanceof HTMLButtonElement) {
          previousButton.disabled = !previousSectionCode;
          previousButton.hidden = !previousSectionCode;
        }

        if (nextButton instanceof HTMLButtonElement) {
          nextButton.disabled = !nextSectionCode;
          nextButton.hidden = !nextSectionCode;
          nextButton.textContent = getNextFlowActionLabel(sectionCode) || "Stay here";
        }

        node.classList.toggle("has-only-next", !previousSectionCode && Boolean(nextSectionCode));
        node.classList.toggle("has-only-prev", Boolean(previousSectionCode) && !nextSectionCode);
        node.classList.toggle("has-both-actions", Boolean(previousSectionCode) && Boolean(nextSectionCode));

        if (meta) {
          meta.textContent = "Step " + (sectionIndex + 1) + " of " + totalSteps;
        }
      });
    }

    function revealFlowSection(sectionCode, options = {}) {
      const targetSectionCode = flowSectionCodes.includes(sectionCode)
        ? sectionCode
        : flowSectionCodes[0] || "";
      if (!targetSectionCode) {
        return false;
      }

      activeFlowSectionCode = targetSectionCode;
      flowSectionNodes.forEach((node) => {
        const nodeSectionCode = node.getAttribute("data-flow-section") || "";
        const isCurrent = nodeSectionCode === targetSectionCode;
        node.classList.toggle("is-current", isCurrent);
        node.hidden = !isCurrent;
        node.setAttribute("aria-hidden", isCurrent ? "false" : "true");
      });

      syncFlowNavigationState();

      if (options.remember !== false) {
        const currentUiState = loadPortalUiState();
        rememberPortalViewport({
          sectionCode: targetSectionCode,
          requirementCode: hasOwn(options, "requirementCode")
            ? String(options.requirementCode || "")
            : targetSectionCode === DOCUMENT_SECTION_CODE
              ? currentUiState.activeRequirementCode || ""
              : "",
          actionSource: hasOwn(options, "actionSource")
            ? String(options.actionSource || "")
            : targetSectionCode === DOCUMENT_SECTION_CODE
              ? currentUiState.activeActionSource || ""
              : "",
          awaitingDocumentReturn: false,
        });
      }

      return true;
    }

    function openPortalMainExperience(options = {}) {
      if (isPortalInactive() && !portalFlowUnlocked) {
        setFlash(getPortalInactiveMessage(), "info");
        portalStatusBanner?.scrollIntoView({
          behavior: options.smooth === false ? "auto" : "smooth",
          block: "start",
        });
        return false;
      }

      if (!portalFlowUnlocked) {
        if (!isOnboardingProfileReady()) {
          const applicantType = normalizeApplicantTypeSelection(applicantTypeInput?.value);
          const rawCountry = getRawCountrySelection();
          const message = !applicantType
            ? "Choose the registrar type to continue."
            : !rawCountry
            ? "Choose the country of incorporation to continue."
            : isBlockedInternationalCountry(rawCountry)
              ? "Kenya is only available for local registrar applications."
              : "Choose a country from the suggested list to continue.";

          if (portalPageKey === "application") {
            navigateToPortalPage("profile", { delay: 0 });
            return false;
          }

          setFlash(message, true);
          setActiveIntroStep("profile", { scrollIntoView: false });
          scrollToProfileSetup();
          return false;
        }

        if (portalPageKey !== "application") {
          return navigateToPortalPage("application", { delay: 0, loading: false });
        }

        setPortalFlowUnlocked(true);
      } else {
        setPortalEntryCompact(true);
      }

      const scrollTarget = flowHeader || portalMainExperience;
      scrollTarget?.scrollIntoView({
        behavior: options.smooth === false ? "auto" : "smooth",
        block: "start",
      });

      if (options.focusFlow !== false) {
        window.setTimeout(() => {
          if (!(flowCurrentStepTitle instanceof HTMLElement)) {
            return;
          }

          flowCurrentStepTitle.setAttribute("tabindex", "-1");
          try {
            flowCurrentStepTitle.focus({ preventScroll: true });
          } catch {
            flowCurrentStepTitle.focus();
          }
        }, 60);
      }

      return true;
    }

    async function handlePortalIntroBackAction() {
      const previousStepKey = getPreviousIntroStepKey();
      if (!previousStepKey) {
        return false;
      }

      const initialStepIndex = getIntroStepIndex(getDefaultIntroStepKeyForPage());
      const currentStepIndex = getIntroStepIndex();

      if (currentStepIndex > initialStepIndex) {
        window.history.back();
        return true;
      }

      await transitionIntroStep(previousStepKey, {
        scrollIntoView: true,
        historyMode: "replace",
      });
      return true;
    }

    async function handlePortalProceedAction() {
      clearWelcomeAutoAdvance();

      if (portalFlowUnlocked) {
        return openPortalMainExperience();
      }

      if (activeIntroStepKey === "profile" && !isOnboardingProfileReady()) {
        const applicantType = normalizeApplicantTypeSelection(applicantTypeInput?.value);
        const rawCountry = getRawCountrySelection();
        const profileMessage = !applicantType
          ? "Choose the registrar type to continue."
          : !rawCountry
          ? "Choose the country of incorporation to continue."
          : isBlockedInternationalCountry(rawCountry)
            ? "Kenya is only available for local registrar applications."
            : "Choose a country from the suggested list to continue.";
        setFlash(profileMessage, true);
        scrollToProfileSetup();
        return false;
      }

      if (activeIntroStepKey === "requirements") {
        if (!portalFlowUnlocked && portalPageKey !== "application") {
          try {
            await ensureApplicationStarted();
          } catch (error) {
            const friendlyMessage = getFriendlyErrorMessage(
              error,
              "We could not start the application yet."
            );
            setFlash(friendlyMessage, true);
            if (
              error?.message === "APPLICANT_TYPE_REQUIRED"
              || error?.message === "COUNTRY_OF_INCORPORATION_REQUIRED"
              || error?.message === "COUNTRY_OF_INCORPORATION_NOT_ALLOWED_FOR_INTERNATIONAL"
            ) {
              scrollToProfileSetup();
            }
            return false;
          }

          return navigateToPortalPage("application", { delay: 0, loading: false });
        }

        return openPortalMainExperience();
      }

      const nextStepKey = getNextIntroStepKey();
      if (!nextStepKey) {
        return openPortalMainExperience();
      }

      await transitionIntroStep(nextStepKey, { scrollIntoView: true });

      if (nextStepKey === "profile") {
        window.setTimeout(() => {
          focusProfileSetup();
        }, 60);
      }

      return true;
    }

    function flowSectionRequiresLockedProfile(sectionCode) {
      return sectionCode === DOCUMENT_SECTION_CODE || sectionCode === FINAL_REVIEW_CODE;
    }

    async function goToFlowSection(sectionCode, options = {}) {
      const targetSectionCode = flowSectionCodes.includes(sectionCode)
        ? sectionCode
        : flowSectionCodes[0] || "";
      if (!targetSectionCode) {
        return false;
      }

      if (flowSectionRequiresLockedProfile(targetSectionCode) && !state.applicationId) {
        try {
          await ensureApplicationStarted();
          syncSubmissionFeedback(latestBundle);
        } catch (error) {
          const friendlyMessage = getFriendlyErrorMessage(
            error,
            "We could not prepare the application yet."
          );
          setFlash(friendlyMessage, true);
          if (
            error?.message === "APPLICANT_TYPE_REQUIRED"
            || error?.message === "COUNTRY_OF_INCORPORATION_REQUIRED"
            || error?.message === "COUNTRY_OF_INCORPORATION_NOT_ALLOWED_FOR_INTERNATIONAL"
          ) {
            scrollToProfileSetup();
          }
          return false;
        }
      }

      const revealed = revealFlowSection(targetSectionCode);
      if (!revealed) {
        return false;
      }

      const sectionNode = getFlowSectionNode(targetSectionCode);
      if (sectionNode && options.scroll !== false) {
        sectionNode.scrollIntoView({
          behavior: options.smooth === false ? "auto" : "smooth",
          block: "start",
        });
      }

      if (options.focusHeading && sectionNode) {
        const heading = flowCurrentStepTitle instanceof HTMLElement
          ? flowCurrentStepTitle
          : sectionNode.querySelector(".section-rail h2");
        if (heading instanceof HTMLElement) {
          heading.setAttribute("tabindex", "-1");
          setTimeout(() => {
            try {
              heading.focus({ preventScroll: true });
            } catch {
              heading.focus();
            }
          }, 180);
        }
      }

      return true;
    }

    function rememberPortalViewport(options = {}) {
      const currentUiState = loadPortalUiState();
      const nextSectionCode = hasOwn(options, "sectionCode")
        ? String(options.sectionCode || "")
        : getCurrentFlowSectionCode() || currentUiState.activeSectionCode || "";
      const isDocumentSection = nextSectionCode === DOCUMENT_SECTION_CODE;
      const nextRequirementCode = hasOwn(options, "requirementCode")
        ? String(options.requirementCode || "")
        : isDocumentSection
          ? currentUiState.activeRequirementCode || ""
          : "";
      const nextActionSource = hasOwn(options, "actionSource")
        ? String(options.actionSource || "")
        : isDocumentSection
          ? currentUiState.activeActionSource || ""
          : "";
      const nextAwaitingDocumentReturn = hasOwn(options, "awaitingDocumentReturn")
        ? Boolean(options.awaitingDocumentReturn)
        : currentUiState.awaitingDocumentReturn;

      return savePortalUiState({
        applicationId: state.applicationId || "",
        activeSectionCode: nextSectionCode,
        activeRequirementCode: nextRequirementCode,
        activeActionSource: nextActionSource,
        awaitingDocumentReturn: nextAwaitingDocumentReturn,
      });
    }

    function clearDocumentCardHighlight() {
      document.querySelectorAll("[data-document-requirement].is-targeted").forEach((node) => {
        node.classList.remove("is-targeted");
      });
    }

    function restorePortalViewport(options = {}) {
      const uiState = loadPortalUiState();
      if (!isPortalUiStateCompatible(uiState)) {
        clearPortalUiState();
        return false;
      }

      const sectionCode = String(options.sectionCode || uiState.activeSectionCode || "");
      if (!sectionCode) {
        return false;
      }

      const requirementCode = String(options.requirementCode || uiState.activeRequirementCode || "");
      const actionSource = String(options.actionSource || uiState.activeActionSource || "");
      const sectionNode = getFlowSectionNode(sectionCode);
      if (!sectionNode) {
        return false;
      }

      revealFlowSection(sectionCode, {
        remember: false,
        requirementCode,
        actionSource,
      });

      if (options.scroll !== false) {
        sectionNode.scrollIntoView({
          behavior: options.smooth ? "smooth" : "auto",
          block: "start",
        });
      }

      let focusTarget = null;
      if (sectionCode === DOCUMENT_SECTION_CODE && requirementCode) {
        const documentCard = getDocumentCardNode(requirementCode);
        if (documentCard) {
          clearDocumentCardHighlight();
          documentCard.classList.add("is-targeted");
          documentCard.scrollIntoView({
            behavior: options.smooth ? "smooth" : "auto",
            block: "center",
          });

          if (documentHighlightTimer) {
            clearTimeout(documentHighlightTimer);
          }

          documentHighlightTimer = setTimeout(() => {
            documentCard.classList.remove("is-targeted");
          }, 2400);

          if (actionSource) {
            focusTarget = documentCard.querySelector(
              '[data-document-action-source="' + actionSource + '"]:not([disabled])'
            );
          }

          if (!focusTarget) {
            focusTarget = documentCard.querySelector("button:not([disabled]), a.button");
          }
        }
      }

      if (options.focusTarget && focusTarget && typeof focusTarget.focus === "function") {
        setTimeout(() => {
          try {
            focusTarget.focus({ preventScroll: true });
          } catch {
            focusTarget.focus();
          }
        }, 180);
      }

      rememberPortalViewport({
        sectionCode,
        requirementCode,
        actionSource,
        awaitingDocumentReturn: false,
      });
      return true;
    }

    function schedulePortalViewportRestore(options = {}) {
      if (viewportRestoreTimer) {
        clearTimeout(viewportRestoreTimer);
      }

      const delay = Number.isFinite(Number(options.delay)) ? Number(options.delay) : 160;
      viewportRestoreTimer = setTimeout(() => {
        window.requestAnimationFrame(() => {
          restorePortalViewport(options);
        });
      }, delay);
    }

    function syncRememberedSectionFromViewport() {
      const nextSectionCode = getCurrentFlowSectionCode();
      if (!nextSectionCode || nextSectionCode === lastRememberedSectionCode) {
        return;
      }

      rememberPortalViewport({ sectionCode: nextSectionCode });
    }

    function saveState() {
      try {
        sessionStorage.setItem(stateKey, JSON.stringify(state));
      } catch {}
    }

    function savePortalFlashNotice(message, tone = "info") {
      const nextMessage = String(message || "").trim();
      if (!nextMessage) {
        return;
      }

      try {
        sessionStorage.setItem(
          portalFlashNoticeKey,
          JSON.stringify({
            message: nextMessage,
            tone: tone === "error" || tone === "success" ? tone : "info",
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {}
    }

    function consumePortalFlashNotice() {
      try {
        const raw = sessionStorage.getItem(portalFlashNoticeKey);
        if (!raw) {
          return null;
        }

        sessionStorage.removeItem(portalFlashNoticeKey);
        const parsed = JSON.parse(raw);
        if (!isRecord(parsed) || typeof parsed.message !== "string") {
          return null;
        }

        return {
          message: parsed.message.trim(),
          tone: parsed.tone === "error" || parsed.tone === "success" ? parsed.tone : "info",
        };
      } catch {
        return null;
      }
    }

    function loadStoredState() {
      try {
        const raw = sessionStorage.getItem(stateKey);
        if (!raw) {
          return;
        }

        const parsed = JSON.parse(raw);
        if (!isRecord(parsed)) {
          return;
        }

        state.applicationId = typeof parsed.applicationId === "string" ? parsed.applicationId : "";
      } catch {}
    }

    function getDraftStorageKey(applicationId = state.applicationId) {
      return applicationId ? draftStateKeyPrefix + applicationId : pendingDraftStorageKey;
    }

    function getDraftStorage(applicationId = state.applicationId) {
      return applicationId ? localStorage : sessionStorage;
    }

    function loadLocalDraft(applicationId = state.applicationId) {
      const draftKey = getDraftStorageKey(applicationId);
      if (!draftKey) {
        return null;
      }

      try {
        const raw = getDraftStorage(applicationId).getItem(draftKey);
        if (!raw) {
          return null;
        }

        const parsed = JSON.parse(raw);
        return isRecord(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }

    function clearLocalDraft(applicationId = state.applicationId) {
      const draftKey = getDraftStorageKey(applicationId);

      try {
        getDraftStorage(applicationId).removeItem(draftKey);
      } catch {}
    }

    function movePendingDraftToApplicationDraft(applicationId) {
      if (!applicationId) {
        return;
      }

      const pendingDraft = loadLocalDraft("");
      if (!pendingDraft) {
        return;
      }

      try {
        localStorage.setItem(getDraftStorageKey(applicationId), JSON.stringify(pendingDraft));
        clearLocalDraft("");
      } catch {}
    }

    function hasPendingProfileDraft() {
      const pendingDraft = loadLocalDraft("");
      const pendingProfile = pendingDraft && isRecord(pendingDraft.profile)
        ? pendingDraft.profile
        : null;
      return Boolean(normalizeApplicantTypeSelection(pendingProfile?.applicantType));
    }

    function restorePendingProfileSelection() {
      const pendingDraft = loadLocalDraft("");
      const pendingProfile = pendingDraft && isRecord(pendingDraft.profile)
        ? pendingDraft.profile
        : null;

      if (!pendingProfile || !applicantTypeInput || !countryOfIncorporationInput) {
        return false;
      }

      const applicantType = normalizeApplicantTypeSelection(pendingProfile.applicantType);
      if (!applicantType) {
        return false;
      }

      applyProfileSelection(
        {
          applicantType,
          country: typeof pendingProfile.countryOfIncorporation === "string"
            ? pendingProfile.countryOfIncorporation
            : "",
        },
        {
          persist: false,
          remember: true,
        }
      );

      return true;
    }

    function persistLocalDraftNow() {
      const draftKey = getDraftStorageKey();
      if (!draftKey) {
        return;
      }

      try {
        getDraftStorage().setItem(
          draftKey,
          JSON.stringify({
            profile: {
              applicantType: normalizeApplicantTypeSelection(applicantTypeInput?.value),
              countryOfIncorporation: String(countryOfIncorporationInput?.value || "").trim(),
            },
            sections: readAllSections(),
            updatedAt: new Date().toISOString(),
          })
        );
      } catch {}
    }

    function scheduleLocalDraftSave() {
      if (!formsEnabled) {
        return;
      }

      clearTimeout(localDraftSaveTimer);
      localDraftSaveTimer = setTimeout(() => {
        persistLocalDraftNow();
        updateSectionStatuses(latestBundle);
      }, 120);
    }

    function clearResumeQueryParams() {
      const currentUrl = new URL(window.location.href);
      if (
        !currentUrl.searchParams.has("applicationId")
        && !currentUrl.searchParams.has("token")
        && !currentUrl.searchParams.has("code")
      ) {
        return;
      }

      currentUrl.searchParams.delete("applicationId");
      currentUrl.searchParams.delete("token");
      currentUrl.searchParams.delete("code");
      const nextUrl = currentUrl.pathname + currentUrl.search + currentUrl.hash;
      window.history.replaceState({}, document.title, nextUrl);
    }

    function restoreSessionState() {
      const params = new URLSearchParams(window.location.search);
      const applicationId = String(params.get("applicationId") || "").trim();
      sessionRestoreSource = "none";

      if (applicationId) {
        state.applicationId = applicationId;
        sessionRestoreSource = "query";
        saveState();
        clearResumeQueryParams();
        return "Application reopened.";
      }

      loadStoredState();
      if (state.applicationId) {
        sessionRestoreSource = "storage";
        return "Application reopened.";
      }

      return "";
    }

    async function refreshPortalOperationalStatus(options = {}) {
      try {
        const nextStatus = normalizePortalOperationalStatus(
          await request(buildPublicApiPath("/portal-status"))
        );
        const previousStatus = portalOperationalStatus;
        portalOperationalStatus = nextStatus;
        syncPortalOperationalState();

        if (options.silent) {
          return nextStatus;
        }

        if (previousStatus.status !== nextStatus.status || previousStatus.reason !== nextStatus.reason) {
          if (nextStatus.status === "inactive") {
            setFlash(getPortalInactiveMessage(nextStatus), "info");
          } else if (previousStatus.status === "inactive") {
            setFlash("Registrar applications are available again.", "success");
          }
        }

        return nextStatus;
      } catch {
        return portalOperationalStatus;
      }
    }

    function startPortalStatusPolling() {
      if (portalStatusPollTimer) {
        clearInterval(portalStatusPollTimer);
      }

      portalStatusPollTimer = setInterval(() => {
        void refreshPortalOperationalStatus();
      }, 60000);
    }

    function normalizeCountryName(value) {
      return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
    }

    function isKenyaCountry(value) {
      return normalizeCountryName(value) === "kenya";
    }

    function isBlockedInternationalCountry(value) {
      return applicantTypeInput?.value === "international"
        && isKenyaCountry(resolveCountryOption(value, true) || value);
    }

    function getSelectableCountryOptions() {
      return applicantTypeInput?.value === "international"
        ? COUNTRY_OPTIONS.filter((country) => !isKenyaCountry(country))
        : COUNTRY_OPTIONS;
    }

    function getCountryMatches(query = "") {
      const normalized = normalizeCountryName(query);
      if (!normalized) {
        return getSelectableCountryOptions();
      }

      const aliasTarget = COUNTRY_PROFILE_ALIASES[normalized] || "";
      const startsWith = [];
      const contains = [];

      getSelectableCountryOptions().forEach((country) => {
        const countryKey = normalizeCountryName(country);
        if (aliasTarget && countryKey === aliasTarget) {
          startsWith.unshift(country);
          return;
        }

        if (countryKey.startsWith(normalized)) {
          startsWith.push(country);
          return;
        }

        if (countryKey.includes(normalized)) {
          contains.push(country);
        }
      });

      return [...new Set([...startsWith, ...contains])];
    }

    function resolveCountryOption(value, allowBlockedMatch = false) {
      const normalized = normalizeCountryName(value);
      if (!normalized) {
        return "";
      }

      const aliasTarget = COUNTRY_PROFILE_ALIASES[normalized] || normalized;

      if (!allowBlockedMatch && applicantTypeInput?.value === "international" && isKenyaCountry(aliasTarget)) {
        return "";
      }

      return getSelectableCountryOptions().find((country) => normalizeCountryName(country) === aliasTarget) || "";
    }

    function closeCountrySuggestions() {
      visibleCountrySuggestions = [];
      activeCountrySuggestionIndex = -1;

      if (countrySuggestionList) {
        countrySuggestionList.hidden = true;
        countrySuggestionList.replaceChildren();
      }

      countryOfIncorporationInput?.setAttribute("aria-expanded", "false");
      countryOfIncorporationInput?.removeAttribute("aria-activedescendant");
    }

    function setActiveCountrySuggestion(index) {
      if (!countrySuggestionList || !visibleCountrySuggestions.length || !countryOfIncorporationInput) {
        return;
      }

      const nextIndex = Math.max(0, Math.min(index, visibleCountrySuggestions.length - 1));
      activeCountrySuggestionIndex = nextIndex;
      const optionButtons = Array.from(countrySuggestionList.querySelectorAll("[data-country-option]"));

      optionButtons.forEach((button, buttonIndex) => {
        const isActive = buttonIndex === nextIndex;
        button.dataset.active = isActive ? "true" : "false";
        button.setAttribute("aria-selected", isActive ? "true" : "false");
        if (isActive) {
          countryOfIncorporationInput.setAttribute("aria-activedescendant", button.id);
        }
      });
    }

    async function commitCountryProfileChange(countryValue) {
      const nextProfile = getProfileState({ country: countryValue });
      const currentProfile = getProfileState(committedProfileState);

      if (getProfileFingerprint(nextProfile) === getProfileFingerprint(currentProfile)) {
        scheduleLocalDraftSave();
        return false;
      }

      return requestProfileSelectionChange(nextProfile);
    }

    async function commitCountrySelection(countryValue, options = {}) {
      if (!countryOfIncorporationInput) {
        return false;
      }

      countryOfIncorporationInput.value = countryValue;
      countryOfIncorporationInput.dataset.autoLocal = "false";
      closeCountrySuggestions();
      updateCountrySearchFeedback();
      updateApplicationProfileSummary();
      refreshPhoneFieldDecorators();

      const changed = await commitCountryProfileChange(countryValue);

      if (options.focusInput !== false) {
        try {
          countryOfIncorporationInput.focus({ preventScroll: true });
        } catch {
          countryOfIncorporationInput.focus();
        }
      }

      return changed;
    }

    function updateCountrySuggestions(query = "", settings = {}) {
      if (!countrySuggestionList || !countryOfIncorporationInput) {
        return;
      }

      if (applicantTypeInput?.value === "local") {
        closeCountrySuggestions();
        return;
      }

      const shouldOpen = settings.open === true
        || (settings.open !== false && document.activeElement === countryOfIncorporationInput);
      if (!shouldOpen) {
        closeCountrySuggestions();
        return;
      }

      const matches = getCountryMatches(query).slice(0, COUNTRY_MATCH_LIMIT);
      visibleCountrySuggestions = matches;

      if (!visibleCountrySuggestions.length) {
        activeCountrySuggestionIndex = -1;
        countrySuggestionList.hidden = false;
        const emptyState = document.createElement("div");
        emptyState.className = "country-suggestion-empty";
        emptyState.textContent = "No matching country yet. Try the full country name.";
        countrySuggestionList.replaceChildren(emptyState);
        countryOfIncorporationInput.setAttribute("aria-expanded", "true");
        countryOfIncorporationInput.removeAttribute("aria-activedescendant");
        return;
      }

      countrySuggestionList.hidden = false;
      countrySuggestionList.replaceChildren();
      visibleCountrySuggestions.forEach((country, index) => {
        const optionId = "countrySuggestionOption" + index;
        const button = document.createElement("button");
        button.type = "button";
        button.id = optionId;
        button.className = "country-suggestion-option";
        button.setAttribute("role", "option");
        button.setAttribute("aria-selected", "false");
        button.tabIndex = -1;
        button.setAttribute("data-country-option", country);

        const copy = document.createElement("span");
        copy.className = "country-suggestion-copy";

        const strong = document.createElement("strong");
        strong.textContent = country;

        copy.appendChild(strong);
        button.appendChild(copy);
        countrySuggestionList.appendChild(button);
      });
      countryOfIncorporationInput.setAttribute("aria-expanded", "true");

      countrySuggestionList.querySelectorAll("[data-country-option]").forEach((button) => {
        button.addEventListener("mousedown", (event) => {
          event.preventDefault();
        });
        button.addEventListener("click", async () => {
          const country = button.getAttribute("data-country-option") || "";
          await commitCountrySelection(country);
        });
      });

      const normalizedValue = normalizeCountryName(
        resolveCountryOption(countryOfIncorporationInput.value, true) || countryOfIncorporationInput.value
      );
      const activeIndex = visibleCountrySuggestions.findIndex((country) => normalizeCountryName(country) === normalizedValue);
      setActiveCountrySuggestion(activeIndex >= 0 ? activeIndex : 0);
    }

    function updateCountrySearchFeedback() {
      if (!countrySearchFeedback) {
        return;
      }

      if (applicantTypeInput?.value === "local") {
        countrySearchFeedback.textContent = "";
        countrySearchFeedback.hidden = true;
        return;
      }

      const rawValue = String(countryOfIncorporationInput?.value || "").trim();
      if (!rawValue) {
        countrySearchFeedback.textContent = "";
        countrySearchFeedback.hidden = true;
        return;
      }

      if (isBlockedInternationalCountry(rawValue)) {
        countrySearchFeedback.textContent = "Kenya is only available for local registrar applications.";
        countrySearchFeedback.hidden = false;
        return;
      }

      const resolvedCountry = resolveCountryOption(rawValue);
      if (resolvedCountry) {
        countrySearchFeedback.textContent = "Selected country: " + resolvedCountry + ".";
        countrySearchFeedback.hidden = false;
        return;
      }

      const matches = getCountryMatches(rawValue);
      if (matches.length === 0) {
        countrySearchFeedback.textContent = "No matching country yet. Try the full country name.";
        countrySearchFeedback.hidden = false;
        return;
      }

      const preview = matches.slice(0, COUNTRY_PREVIEW_LIMIT).join(", ");
      countrySearchFeedback.textContent =
        "Suggested matches: "
        + preview
        + (matches.length > COUNTRY_PREVIEW_LIMIT ? ", ..." : ".");
      countrySearchFeedback.hidden = false;
    }

    function normalizeCountrySelection() {
      if (!countryOfIncorporationInput || applicantTypeInput?.value === "local") {
        closeCountrySuggestions();
        return "";
      }

      const resolvedCountry = resolveCountryOption(countryOfIncorporationInput.value);
      if (resolvedCountry) {
        countryOfIncorporationInput.value = resolvedCountry;
      }

      updateCountrySuggestions(countryOfIncorporationInput.value);
      updateCountrySearchFeedback();
      updateApplicationProfileSummary();

      return String(countryOfIncorporationInput.value || "").trim();
    }

    function applyFieldMaxLengths() {
      document.querySelectorAll("[data-section] input[name], [data-section] textarea[name]").forEach((field) => {
        const maxLength = fieldMaxLengths[field.name];
        if (typeof maxLength === "number" && maxLength > 0) {
          field.maxLength = maxLength;
        }
      });

      const signatureDateInput = document.querySelector('input[name="dateOfSignature"]');
      if (signatureDateInput) {
        signatureDateInput.max = new Date().toISOString().slice(0, 10);
      }
    }

    function bindInputNormalization() {
      document.querySelectorAll('[data-input-kind="whole-number"]').forEach((field) => {
        field.addEventListener("input", () => {
          const normalized = normalizeWholeNumber(field.value, field.maxLength);
          if (field.value !== normalized) {
            field.value = normalized;
          }
        });

        field.addEventListener("blur", () => {
          field.value = normalizeWholeNumber(field.value, field.maxLength);
        });
      });

      const websiteInput = document.querySelector('input[name="websiteUrl"]');
      if (websiteInput) {
        websiteInput.addEventListener("blur", () => {
          websiteInput.value = normalizeWebsiteUrl(websiteInput.value);
        });
      }

      document.querySelectorAll('input[name="ns1"], input[name="ns2"]').forEach((field) => {
        field.addEventListener("input", () => {
          field.value = String(field.value || "").toLowerCase().replace(/\s+/g, "");
        });
      });
    }

    function getCountryProfile() {
      if (applicantTypeInput?.value === "local") {
        return COUNTRY_PROFILES.kenya;
      }

      const normalized = normalizeCountryName(resolveCountryOption(countryOfIncorporationInput?.value) || countryOfIncorporationInput?.value);
      if (isKenyaCountry(normalized)) {
        return null;
      }
      const mapped = COUNTRY_PROFILE_ALIASES[normalized] || normalized;
      return COUNTRY_PROFILES[mapped] || null;
    }

    function isKenyanProfile(profile) {
      return Boolean(profile && profile.key === "kenya");
    }

    function formatKenyanPhone(value) {
      const digits = String(value || "").replace(/\\D/g, "");

      if (digits.length === 10 && digits.startsWith("0")) {
        return "+254 " + digits.slice(1, 4) + " " + digits.slice(4, 7) + " " + digits.slice(7);
      }

      if (digits.length === 12 && digits.startsWith("254")) {
        return "+254 " + digits.slice(3, 6) + " " + digits.slice(6, 9) + " " + digits.slice(9);
      }

      return String(value || "").trim();
    }

    function normalizeWholeNumber(value, maxLength) {
      const digitsOnly = String(value || "").replace(/\\D/g, "");
      if (typeof maxLength === "number" && maxLength > 0) {
        return digitsOnly.slice(0, maxLength);
      }
      return digitsOnly;
    }

    function normalizeWebsiteUrl(value) {
      const trimmed = String(value || "").trim();
      if (!trimmed) {
        return "";
      }

      try {
        const candidate = /^(https?:)?\\/\\//i.test(trimmed) ? trimmed : "https://" + trimmed;
        const url = new URL(candidate);

        if (url.protocol !== "http:" && url.protocol !== "https:") {
          return trimmed;
        }

        url.protocol = "https:";
        const pathname = url.pathname === "/" ? "" : url.pathname;
        return url.protocol + "//" + url.host + pathname + url.search + url.hash;
      } catch {
        return trimmed;
      }
    }

    function refreshPhoneFieldDecorators() {
      const profile = getCountryProfile();
      const prefixLabel = profile
        ? profile.flag + " " + profile.dialCode
        : "🌍 Intl";
      const hintText = profile?.hint || (
        profile
          ? "Use the full phone number with " + profile.dialCode + "."
          : "Include the country code for the number you are providing."
      );
      const placeholder = profile?.example || "Phone number";

      phoneFieldDecorators.forEach((field) => {
        if (field.prefix) {
          field.prefix.textContent = prefixLabel;
        }
        if (field.hint) {
          field.hint.textContent = hintText;
        }
        if (field.input) {
          field.input.placeholder = placeholder;
        }
      });
    }

    function getApplicantTypeLabel(value) {
      return value === "international"
        ? "International Registrar"
        : value === "local"
          ? "Local Registrar"
          : "Choose registrar type";
    }

    function getProfileState(overrides = {}) {
      const applicantType = hasOwn(overrides, "applicantType")
        ? normalizeApplicantTypeSelection(overrides.applicantType)
        : normalizeApplicantTypeSelection(applicantTypeInput?.value);
      const rawCountry = hasOwn(overrides, "country")
        ? String(overrides.country || "").trim()
        : String(countryOfIncorporationInput?.value || "").trim();

      return {
        applicantType,
        country: applicantType === "local"
          ? "Kenya"
          : applicantType === "international"
            ? String(resolveCountryOption(rawCountry, true) || rawCountry || "").trim()
            : "",
      };
    }

    function getProfileFingerprint(profile = getProfileState()) {
      return profile.applicantType + "::" + normalizeCountryName(profile.country || "");
    }

    function formatProfileLabel(profile = getProfileState()) {
      const normalizedProfile = getProfileState(profile);
      if (!normalizedProfile.applicantType) {
        return "Registrar type not selected";
      }
      return getApplicantTypeLabel(normalizedProfile.applicantType)
        + " • "
        + (normalizedProfile.applicantType === "local"
          ? "Kenya"
          : normalizedProfile.country || "Country not selected");
    }

    function rememberCommittedProfile(profile = getProfileState()) {
      committedProfileState = getProfileState(profile);
    }

    function hasStartedApplicationWork() {
      if (state.applicationId || pendingDocumentUploads.size > 0) {
        return true;
      }

      return Object.values(readAllSections()).some((section) => sectionHasValues(section));
    }

    function isProfileChangeBusy() {
      return savingApplication || submittingApplication || pendingDocumentUploads.size > 0;
    }

    function applyProfileSelection(profile, options = {}) {
      if (!applicantTypeInput || !countryOfIncorporationInput) {
        return;
      }

      const nextProfile = getProfileState(profile);
      applicantTypeInput.value = nextProfile.applicantType;
      countryOfIncorporationInput.value = nextProfile.applicantType === "local"
        ? "Kenya"
        : nextProfile.country || "";
      countryOfIncorporationInput.dataset.autoLocal = nextProfile.applicantType === "local" ? "true" : "false";

      syncCountryFieldState(Boolean(state.applicationId));

      if (options.remember !== false) {
        rememberCommittedProfile(nextProfile);
      }

      if (options.persist !== false) {
        scheduleLocalDraftSave();
      }
    }

    function closeProfileSwitchOverlay(confirmed) {
      const activeRequest = profileSwitchRequest;
      if (!activeRequest) {
        return;
      }

      profileSwitchRequest = null;
      profileSwitchOverlay?.classList.remove("is-active");
      profileSwitchOverlay?.setAttribute("aria-hidden", "true");
      if (profileSwitchOverlay) {
        profileSwitchOverlay.hidden = true;
      }

      const restoreTarget = activeRequest.restoreFocus;
      window.setTimeout(() => {
        if (restoreTarget instanceof HTMLElement) {
          try {
            restoreTarget.focus({ preventScroll: true });
          } catch {
            restoreTarget.focus();
          }
        }
      }, 0);

      activeRequest.resolve(Boolean(confirmed));
    }

    function openProfileSwitchOverlay(nextProfile) {
      if (!profileSwitchOverlay) {
        return Promise.resolve(window.confirm("Switching profile will clear the current application details and documents. Continue?"));
      }

      if (profileSwitchCurrentValue) {
        profileSwitchCurrentValue.textContent = formatProfileLabel(committedProfileState);
      }
      if (profileSwitchNextValue) {
        profileSwitchNextValue.textContent = formatProfileLabel(nextProfile);
      }

      if (profileSwitchRequest) {
        closeProfileSwitchOverlay(false);
      }

      profileSwitchOverlay.hidden = false;
      profileSwitchOverlay.setAttribute("aria-hidden", "false");

      return new Promise((resolve) => {
        profileSwitchRequest = {
          resolve,
          restoreFocus: document.activeElement instanceof HTMLElement ? document.activeElement : null,
        };
        window.requestAnimationFrame(() => {
          profileSwitchOverlay.classList.add("is-active");
          try {
            profileSwitchCancel?.focus({ preventScroll: true });
          } catch {
            profileSwitchCancel?.focus();
          }
        });
      });
    }

    async function requestProfileSelectionChange(profile) {
      const nextProfile = getProfileState(profile);
      const currentProfile = getProfileState(committedProfileState);

      if (getProfileFingerprint(nextProfile) === getProfileFingerprint(currentProfile)) {
        applyProfileSelection(currentProfile, { persist: false, remember: false });
        return false;
      }

      if (isProfileChangeBusy()) {
        applyProfileSelection(currentProfile, { persist: false, remember: false });
        setFlash("Please wait for the current save or upload to finish before changing the application profile.", true);
        return false;
      }

      if (!hasStartedApplicationWork()) {
        applyProfileSelection(nextProfile);
        return true;
      }

      const confirmed = await openProfileSwitchOverlay(nextProfile);
      if (!confirmed) {
        applyProfileSelection(currentProfile, { persist: false, remember: false });
        return false;
      }

      clearStoredApplicationState();
      applyProfileSelection(nextProfile);
      setFlash("Application pathway updated.");
      return true;
    }

    function syncApplicantTypeControls() {
      const value = normalizeApplicantTypeSelection(applicantTypeInput?.value);

      applicantTypeOptionButtons.forEach((button, index) => {
        const selected = button.getAttribute("data-applicant-type-option") === value;
        button.dataset.selected = selected ? "true" : "false";
        button.setAttribute("aria-checked", selected ? "true" : "false");
        button.tabIndex = selected ? 0 : (!value && index === 0 ? 0 : -1);
        button.disabled = Boolean(applicantTypeInput?.disabled);
      });
    }

    function syncSecondLevelSalesControls() {
      const value = secondLevelSalesInput?.value === "true" ? "true" : "false";

      secondLevelSalesOptionButtons.forEach((button) => {
        const selected = button.getAttribute("data-second-level-sales-option") === value;
        button.dataset.selected = selected ? "true" : "false";
        button.setAttribute("aria-pressed", selected ? "true" : "false");
        button.disabled = Boolean(secondLevelSalesInput?.disabled);
      });
    }

    function updateApplicationProfileSummary() {
      const applicantType = normalizeApplicantTypeSelection(applicantTypeInput?.value);
      const applicantTypeLabel = getApplicantTypeLabel(applicantType);
      if (applicationProfileApplicantType) {
        applicationProfileApplicantType.textContent = applicantTypeLabel;
      }

      const rawCountry = String(countryOfIncorporationInput?.value || "").trim();
      const resolvedCountry = resolveCountryOption(countryOfIncorporationInput?.value);
      const countryLabel = applicantType === "local"
        ? "Kenya"
        : !applicantType
          ? "Choose registrar type first"
        : isBlockedInternationalCountry(rawCountry)
          ? "Choose another country"
          : resolvedCountry || rawCountry || "Select country before submission";

      if (applicationProfileCountry) {
        applicationProfileCountry.textContent = countryLabel;
      }
      if (flowProfileContextValue) {
        flowProfileContextValue.textContent = applicantTypeLabel + " • " + countryLabel;
      }

      syncPortalExperienceSurface();
    }

    function syncCountryFieldState(lockIdentity = Boolean(state.applicationId)) {
      if (!applicantTypeInput || !countryOfIncorporationInput) {
        return;
      }

      const applicantType = normalizeApplicantTypeSelection(applicantTypeInput.value);
      const isLocal = applicantType === "local";
      const isInternational = applicantType === "international";
      const wasAutoLocal = countryOfIncorporationInput.dataset.autoLocal === "true";

      if (isLocal) {
        countryOfIncorporationInput.value = "Kenya";
        countryOfIncorporationInput.dataset.autoLocal = "true";
      } else if (wasAutoLocal && normalizeCountryName(countryOfIncorporationInput.value) === "kenya") {
        countryOfIncorporationInput.value = "";
        countryOfIncorporationInput.dataset.autoLocal = "false";
      } else if (!wasAutoLocal || !isInternational) {
        countryOfIncorporationInput.dataset.autoLocal = "false";
      }

      applicantTypeInput.disabled = false;
      countryOfIncorporationInput.disabled = !isInternational;
      profileSetupPanel?.classList.remove("is-locked");
      profileCountryField?.classList.toggle("is-hidden", !isInternational);
      profileCountryField?.setAttribute("aria-hidden", !isInternational ? "true" : "false");

      if (applicantTypeHint) {
        applicantTypeHint.textContent = getApplicantTypeSelectionHint(lockIdentity);
      }

      updateCountrySuggestions(countryOfIncorporationInput.value);
      updateCountrySearchFeedback();
      refreshPhoneFieldDecorators();
      syncApplicantTypeControls();
      updateApplicationProfileSummary();
      syncPortalEntryPreview();

      if (!isInternational) {
        closeCountrySuggestions();
      }
    }

    function normalizePhoneFieldsForCountry() {
      const profile = getCountryProfile();
      if (!isKenyanProfile(profile)) {
        return;
      }

      phoneFieldDecorators.forEach((field) => {
        if (!field.input || !field.input.value.trim()) {
          return;
        }

        field.input.value = formatKenyanPhone(field.input.value);
      });
    }

    function getSubmitButtonIdleLabel() {
      return latestBundle?.application?.status === "changes_requested"
        ? "Resubmit"
        : "Submit";
    }

    function setSubmissionFeedback(message, tone = "info") {
      if (!submissionFeedback) {
        return;
      }

      submissionFeedback.textContent = message;
      submissionFeedback.className = "submission-feedback " + tone;
      syncFlowNavigationState();
    }

    function syncSubmissionFeedback(bundle) {
      const status = bundle?.application?.status || "";
      const missingRequiredDocuments = getChecklistDocuments(bundle).filter((document) =>
        document.isRequired && !document.uploaded
      );

      if (isPortalInactive()) {
        setSubmissionFeedback(getPortalInactiveMessage(), "info");
        return;
      }

      if (status === "submitted" || status === "in_review") {
        setSubmissionFeedback(SUBMISSION_RECEIVED_MESSAGE, "success");
        return;
      }

      if (status === "approved") {
        setSubmissionFeedback("Application processing is complete.", "success");
        return;
      }

      if (status === "rejected") {
        setSubmissionFeedback("Application processing is complete. Please contact KeNIC for guidance.", "error");
        return;
      }

      if (status === "changes_requested") {
        setSubmissionFeedback("We need a few updates before you submit again.", "info");
        return;
      }

      if (missingRequiredDocuments.length > 0) {
        setSubmissionFeedback("Complete the form and upload all required documents before submitting.", "info");
        return;
      }

      setSubmissionFeedback("Submit when ready.", "info");
    }

    function updateActionButtons() {
      if (submitApplicationButton) {
        submitApplicationButton.disabled =
          !formsEnabled
          || isPortalInactive()
          || savingApplication
          || submittingApplication;
        submitApplicationButton.textContent = submittingApplication
          ? "Submitting..."
          : getSubmitButtonIdleLabel();
      }
    }

    function setSavingState(isSaving) {
      savingApplication = isSaving;
      updateActionButtons();
    }

    function setSubmittingState(isSubmitting) {
      submittingApplication = isSubmitting;
      updateActionButtons();
    }

    function setFlowVisualState(mode = "locked") {
      if (!applicationFlow) {
        return;
      }

      applicationFlow.classList.toggle("is-locked", mode === "locked");
      applicationFlow.classList.toggle("is-readonly", mode === "readonly");
    }

    function setFormsEnabled(enabled) {
      formsEnabled = enabled;
      const allowEdits = enabled && !isPortalInactive();
      document.querySelectorAll("[data-section] input, [data-section] textarea, [data-section] select").forEach((field) => {
        field.disabled = !allowEdits;
      });
      syncSecondLevelSalesControls();
      updateActionButtons();
      renderDocumentRequirements(latestBundle);
    }

    function setActivationState(nextState = "idle") {
      activationIndicator?.classList.remove("is-active", "is-busy", "is-readonly");

      if (nextState === "activating") {
        activationIndicator?.classList.add("is-busy");
        if (activationIndicator) {
          activationIndicator.textContent = "Preparing";
        }
        if (activationHint) {
          activationHint.textContent = "Setting up the application.";
        }
        return;
      }

      if (nextState === "active") {
        activationIndicator?.classList.add("is-active");
        if (activationIndicator) {
          activationIndicator.textContent = "Active";
        }
        if (activationHint) {
          activationHint.textContent = "Application ready.";
        }
        return;
      }

      if (nextState === "readonly") {
        activationIndicator?.classList.add("is-active", "is-readonly");
        if (activationIndicator) {
          activationIndicator.textContent = "Submitted";
        }
        if (activationHint) {
          activationHint.textContent = "This submitted application can no longer be edited here.";
        }
        return;
      }

      if (activationIndicator) {
        activationIndicator.textContent = "Ready";
      }
      if (activationHint) {
        activationHint.textContent = "Application ready.";
      }
    }

    function resetSectionForms() {
      document.querySelectorAll("[data-section]").forEach((form) => {
        form.querySelectorAll("input, textarea, select").forEach((field) => {
          if (!field.name) return;
          if (field.tagName === "SELECT") {
            field.value = field.name === "intendsSecondLevelSales" ? "false" : field.options[0]?.value || "";
            return;
          }
          field.value = "";
        });
      });
      syncSecondLevelSalesControls();
    }

    function resetSectionStatuses() {
      Object.keys(sectionStatusNodes).forEach((sectionCode) => {
        setSectionStatus(sectionCode, "pending", "Not started");
      });
    }

    function resetPortalStateForNewApplication() {
      clearTimeout(localDraftSaveTimer);
      clearWelcomeAutoAdvance();
      if (introTransitionTimer) {
        clearTimeout(introTransitionTimer);
      }
      introTransitionTimer = null;
      setPortalIntroLoading(false);
      activeIntroStepKey = getDefaultIntroStepKeyForPage();
      resetSectionForms();
      resetSectionStatuses();
      latestBundle = getEmptyBundle();
      pendingDocumentUploads.clear();
      if (viewportRestoreTimer) {
        clearTimeout(viewportRestoreTimer);
      }
      clearDocumentCardHighlight();
      renderDocumentRequirements(latestBundle);
      syncDocumentUploadFeedback(latestBundle);
      syncCountryFieldState(false);
      revealFlowSection(flowSectionCodes[0] || "", { remember: false });
    }

    function resetLockedPortal(options = {}) {
      resetPortalStateForNewApplication();
      setFormsEnabled(true);
      setSavingState(false);
      setSubmittingState(false);
      setActivationState("idle");
      setFlowVisualState("active");
      if (options.keepFlowVisible) {
        setPortalFlowUnlocked(true, { compact: false });
      } else {
        setPortalFlowUnlocked(false);
      }
      syncCountryFieldState(false);
      syncSubmissionFeedback(getEmptyBundle());
      syncPortalEntryPreview();
      rememberCommittedProfile();
    }

    function clearStoredApplicationState() {
      const currentApplicationId = state.applicationId;
      if (currentApplicationId) {
        clearLocalDraft(currentApplicationId);
      }
      clearLocalDraft("");

      state.applicationId = "";
      sessionRestoreSource = "none";

      try {
        sessionStorage.removeItem(stateKey);
      } catch {}

      void fetch(buildPublicApiPath("/session/clear"), {
        method: "POST",
        credentials: "same-origin",
      }).catch(() => undefined);

      clearPortalUiState();
      clearResumeQueryParams();
      resetLockedPortal();
    }

    function setSectionStatus(sectionCode, tone, label) {
      const node = sectionStatusNodes[sectionCode];
      if (!node) return;
      node.className = "mini-pill section-status " + tone;
      node.textContent = label;
      syncFlowNavigationState();
    }

    function getSectionLabel(sectionCode) {
      return SECTION_META[sectionCode]?.label || sectionCode;
    }

    function getSectionForm(sectionCode) {
      return document.querySelector('[data-section="' + sectionCode + '"]');
    }

    function getSectionPanel(sectionCode) {
      const form = getSectionForm(sectionCode);
      return form ? form.closest(".application-section") : null;
    }

    function buildSectionNavigation() {
      flowSectionNodes.forEach((sectionNode) => {
        const sectionCode = sectionNode.getAttribute("data-flow-section") || "";
        const sectionMain = sectionNode.querySelector(".section-main");
        if (!sectionCode || !sectionMain || sectionMain.querySelector("[data-flow-nav-for]")) {
          return;
        }

        const navigation = document.createElement("div");
        navigation.className = "section-navigation";
        navigation.setAttribute("data-flow-nav-for", sectionCode);

        const previousButton = document.createElement("button");
        previousButton.type = "button";
        previousButton.className = "ghost";
        previousButton.setAttribute("data-flow-prev", sectionCode);
        previousButton.textContent = "Previous";
        previousButton.addEventListener("click", () => {
          const previousSectionCode = getPreviousFlowSectionCode(sectionCode);
          if (!previousSectionCode) {
            return;
          }
          void goToFlowSection(previousSectionCode, { focusHeading: true });
        });

        const meta = document.createElement("div");
        meta.className = "section-navigation-meta";
        meta.setAttribute("data-flow-nav-meta", sectionCode);

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.className = "secondary";
        nextButton.setAttribute("data-flow-next", sectionCode);
        nextButton.textContent = getNextFlowActionLabel(sectionCode) || "Stay here";
        nextButton.addEventListener("click", () => {
          const nextSectionCode = getNextFlowSectionCode(sectionCode);
          if (!nextSectionCode) {
            return;
          }
          void goToFlowSection(nextSectionCode, { focusHeading: true });
        });

        navigation.appendChild(previousButton);
        navigation.appendChild(meta);
        navigation.appendChild(nextButton);
        sectionMain.appendChild(navigation);
      });

      syncFlowNavigationState();
    }

    function clearFieldInvalidState(field) {
      if (!field || !field.classList) {
        return;
      }

      field.classList.remove("is-invalid");
      field.closest(".input-with-prefix")?.classList.remove("is-invalid");
      field.closest(".field-block")?.querySelector(".inline-choice-group")?.classList.remove("is-invalid");
    }

    function clearInvalidFieldHighlights() {
      document.querySelectorAll(".is-invalid").forEach((node) => {
        node.classList.remove("is-invalid");
      });
      document.querySelectorAll(".inline-choice-group.is-invalid").forEach((node) => {
        node.classList.remove("is-invalid");
      });
    }

    function markFieldInvalid(field) {
      if (!field || !field.classList) {
        return;
      }

      field.classList.add("is-invalid");

      const groupedField = field.closest(".input-with-prefix");
      if (groupedField) {
        groupedField.classList.add("is-invalid");
      }

      const inlineChoiceGroup = field.closest(".field-block")?.querySelector(".inline-choice-group");
      if (inlineChoiceGroup) {
        inlineChoiceGroup.classList.add("is-invalid");
      }
    }

    function formatValidationMessage(message) {
      const text = String(message || "").trim();
      if (!text) {
        return "";
      }

      return /[.!?]$/.test(text) ? text : text + ".";
    }

    function buildSectionIssue(sectionCode, validationError = null) {
      const formattedMessage = validationError?.message
        ? formatValidationMessage(validationError.message)
        : "";

      return {
        sectionCode,
        fieldPath: validationError?.path || "",
        message: formattedMessage
          ? "Please review " + getSectionLabel(sectionCode) + ". " + formattedMessage
          : "Please complete " + getSectionLabel(sectionCode) + " before continuing.",
      };
    }

    function getBlockingSectionIssueFromDetails(sectionDetails) {
      if (!Array.isArray(sectionDetails)) {
        return null;
      }

      for (const entry of sectionDetails) {
        if (typeof entry === "string" && entry.trim()) {
          return buildSectionIssue(entry);
        }

        if (!entry || typeof entry !== "object" || typeof entry.sectionCode !== "string") {
          continue;
        }

        const validationErrors = Array.isArray(entry.validationErrors)
          ? entry.validationErrors.filter(Boolean)
          : [];

        return buildSectionIssue(entry.sectionCode, validationErrors[0] || null);
      }

      return null;
    }

    function findFieldInSection(form, fieldPath) {
      if (!form || !fieldPath) {
        return null;
      }

      const fieldName = String(fieldPath).split(".")[0];
      if (!fieldName) {
        return null;
      }

      const escapedFieldName =
        typeof CSS !== "undefined" && typeof CSS.escape === "function"
          ? CSS.escape(fieldName)
          : fieldName.replace(/"/g, "");

      return form.querySelector('[name="' + escapedFieldName + '"]');
    }

    function guideUserToSectionIssue(issue) {
      if (!issue?.sectionCode) {
        return false;
      }

      const panel = getSectionPanel(issue.sectionCode);
      const form = getSectionForm(issue.sectionCode);

      setSectionStatus(issue.sectionCode, "error", "Needs review");
      setFlash(issue.message, "error");
      setSubmissionFeedback(issue.message, "error");

      document.querySelectorAll(".application-section.is-targeted").forEach((node) => {
        node.classList.remove("is-targeted");
      });

      if (panel) {
        revealFlowSection(issue.sectionCode);
        panel.classList.add("is-targeted");
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
        rememberPortalViewport({ sectionCode: issue.sectionCode });
      }

      if (sectionHighlightTimer) {
        clearTimeout(sectionHighlightTimer);
      }

      sectionHighlightTimer = setTimeout(() => {
        panel?.classList.remove("is-targeted");
      }, 2600);

      const focusTarget =
        findFieldInSection(form, issue.fieldPath)
        || form?.querySelector("input:not([disabled]), textarea:not([disabled]), select:not([disabled])")
        || null;
      const interactiveFocusTarget = focusTarget?.classList?.contains("visually-hidden-control")
        ? focusTarget.closest(".field-block")?.querySelector(".inline-choice:not([disabled])") || focusTarget
        : focusTarget;

      clearInvalidFieldHighlights();
      markFieldInvalid(focusTarget);

      if (interactiveFocusTarget && typeof interactiveFocusTarget.focus === "function") {
        setTimeout(() => {
          try {
            interactiveFocusTarget.focus({ preventScroll: true });
          } catch {
            interactiveFocusTarget.focus();
          }
        }, 260);
      }

      return true;
    }

    function sectionHasValues(data) {
      if (!data || typeof data !== "object") return false;
      return Object.values(data).some((value) => {
        if (typeof value === "boolean") return value;
        return String(value || "").trim().length > 0;
      });
    }

    function updateSectionStatuses(bundle) {
      const liveSectionData = readAllSections();
      const checklistSections = Array.isArray(bundle?.checklist?.sections) && bundle.checklist.sections.length
        ? bundle.checklist.sections
        : Object.keys(SECTION_META).map((sectionCode) => ({
            sectionCode,
            isComplete: false,
            validationErrors: [],
          }));

      checklistSections.forEach((section) => {
        if (section.isComplete) {
          setSectionStatus(section.sectionCode, "ready", "Complete");
          return;
        }

        const hasActionableErrors = Array.isArray(section.validationErrors)
          && section.validationErrors.some((item) => item && item.message && !String(item.message).endsWith(" is required"));

        if (hasActionableErrors) {
          setSectionStatus(section.sectionCode, "error", "Needs review");
          return;
        }

        if (sectionHasValues(liveSectionData[section.sectionCode])) {
          setSectionStatus(section.sectionCode, "loading", "In progress");
          return;
        }

        setSectionStatus(section.sectionCode, "pending", "Not started");
      });
    }

    function getReviewStatusMessage(status) {
      if (status === "submitted" || status === "in_review") {
        return SUBMISSION_RECEIVED_MESSAGE;
      }

      if (status === "changes_requested") {
        return "We have reviewed your application and need a few updates before the next submission.";
      }

      return "";
    }

    function getClosedApplicationMessage(status, flashMessage = "") {
      if (flashMessage) {
        return flashMessage;
      }

      if (status === "submitted" || status === "in_review") {
        return "This application has already been submitted and cannot be reopened here. Start a new application below.";
      }

      return "This application is closed and cannot be reopened here. Start a new application below.";
    }

    function hideFlashToast() {
      if (flashToastTimer) {
        clearTimeout(flashToastTimer);
        flashToastTimer = null;
      }

      if (!flashOverlay) {
        return;
      }

      flashOverlay.classList.remove("is-active");
      flashOverlay.setAttribute("aria-hidden", "true");
    }

    function showFlashToast(message, tone = "error") {
      if (!flashOverlay || !flashToastMessage || !message) {
        return;
      }

      if (flashToastTimer) {
        clearTimeout(flashToastTimer);
      }

      if (flashToast) {
        flashToast.dataset.tone = tone;
      }
      if (flashToastLabel) {
        flashToastLabel.textContent =
          tone === "error"
            ? "Needs attention"
            : tone === "success"
              ? "Saved"
              : "Notice";
      }
      flashToastMessage.textContent = message;
      flashOverlay.classList.add("is-active");
      flashOverlay.setAttribute("aria-hidden", "false");

      flashToastTimer = setTimeout(() => {
        hideFlashToast();
      }, tone === "error" ? 5000 : 3200);
    }

    function formatFileSizeLimit(sizeBytes) {
      const bytes = Number(sizeBytes);
      if (!Number.isFinite(bytes) || bytes <= 0) {
        return "";
      }

      if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(0) + " KB";
      }

      return (bytes / (1024 * 1024)).toFixed(bytes % (1024 * 1024) === 0 ? 0 : 1) + " MB";
    }

    function formatAllowedDocumentTypeLabel(mimeType) {
      const labels = {
        "application/pdf": "PDF",
        "image/jpeg": "JPG or JPEG",
        "image/png": "PNG",
        "image/webp": "WEBP",
      };

      return labels[mimeType] || String(mimeType || "").toUpperCase();
    }

    function buildSupportedDocumentTypesMessage(allowedMimeTypes) {
      if (!Array.isArray(allowedMimeTypes) || !allowedMimeTypes.length) {
        return "";
      }

      const labels = [];
      allowedMimeTypes.forEach((mimeType) => {
        const label = formatAllowedDocumentTypeLabel(mimeType);
        if (label && !labels.includes(label)) {
          labels.push(label);
        }
      });

      return labels.length ? " Supported formats: " + labels.join(", ") + "." : "";
    }

    function setFlash(message, toneOrIsError = "info") {
      const tone = toneOrIsError === true
        ? "error"
        : toneOrIsError === false
          ? "info"
          : toneOrIsError;

      flashBox.textContent = message;
      flashBox.dataset.tone = tone;
      flashBox.style.background =
        tone === "error"
          ? "rgba(220,53,69,0.12)"
          : tone === "success"
            ? "rgba(40,167,69,0.12)"
            : "rgba(23,162,184,0.12)";
      flashBox.style.borderColor =
        tone === "error"
          ? "rgba(220,53,69,0.2)"
          : tone === "success"
            ? "rgba(40,167,69,0.2)"
            : "rgba(23,162,184,0.18)";

      if (tone === "error") {
        showFlashToast(message, tone);
      } else {
        hideFlashToast();
      }
    }

    function getFriendlyErrorMessage(error, fallback) {
      const message = error && error.message ? String(error.message) : "";
      if (message === "PORTAL_INACTIVE") {
        const reason = typeof error?.details?.reason === "string" ? error.details.reason.trim() : "";
        return reason || "Registrar applications are temporarily unavailable while updates are in progress.";
      }

      const known = {
        APPLICATION_FORM_INVALID:
          "Please review the highlighted sections and try again.",
        APPLICATION_NOT_READY_FOR_SUBMISSION:
          "Please complete all required sections before submitting.",
        FILE_REQUIRED:
          "Select a document before uploading.",
        EMPTY_FILE:
          "The selected document is empty. Choose another file and try again.",
        FILE_TOO_LARGE:
          error?.details?.maxUploadBytes
            ? "The selected document is too large. Files must be "
              + formatFileSizeLimit(error.details.maxUploadBytes)
              + " or smaller."
            : "The selected document is too large. Choose a smaller file and try again.",
        INVALID_FILENAME:
          "Rename the selected document to a simple file name and try again.",
        INVALID_FILE_ENCODING:
          "We could not read the selected document. Choose it again and try once more.",
        FILE_SIGNATURE_MISMATCH:
          "The selected file does not look like a valid PDF or image for this upload. Choose the original file and try again.",
        FAILED_TO_READ_FILE:
          "This device could not read the selected document. Choose it again and retry.",
        FILE_READER_UNAVAILABLE:
          "This device does not support the fallback uploader. Try again or update the app.",
        UNSUPPORTED_MIME_TYPE:
          "This document type is not allowed for the selected requirement."
          + buildSupportedDocumentTypesMessage(error?.details?.allowedMimeTypes),
        DOCUMENT_SCAN_UNAVAILABLE:
          "The security scanner could not complete for this document right now. Please try again shortly.",
        INVALID_REQUIREMENT_CODE:
          "The selected checklist requirement is no longer valid. Refresh the page and try again.",
        REQUIREMENT_CODE_REQUIRED:
          "Choose a checklist requirement before uploading a document.",
        INVALID_APPLICATION_FORM_PAYLOAD:
          "We could not read the application form. Refresh the page and try again.",
        ORIGIN_REQUIRED:
          "We could not verify this browser request. Refresh the portal and try again.",
        UNTRUSTED_ORIGIN:
          "This request was blocked because it did not come from the trusted portal origin.",
        COUNTRY_OF_INCORPORATION_REQUIRED:
          "Select the country of incorporation before submitting an international application.",
        APPLICANT_TYPE_REQUIRED:
          "Choose the registrar type before starting the application.",
        COUNTRY_OF_INCORPORATION_NOT_ALLOWED_FOR_INTERNATIONAL:
          "Kenya is only allowed for local registrar applications. Choose a different country for an international registrar.",
        COUNTRY_OF_INCORPORATION_TOO_LONG:
          "Country of incorporation is too long. Search and select a shorter country name.",
        APPLICATION_ALREADY_SUBMITTED:
          "This application has already been submitted and is now read-only.",
        APPLICATION_DETAILS_ALREADY_IN_USE:
          "Sorry, we can't process your application right now. Please review your details and try again.",
        APPLICATION_ALREADY_EXISTS_FOR_COMPANY:
          "Sorry, we can't process your application right now. Please review your details and try again.",
        DRAFT_OR_RESUME_TOKEN_REQUIRED:
          "Please start a new application or reopen the application first.",
        INVALID_OR_EXPIRED_DRAFT_TOKEN:
          "This application session has expired. Start a new application to continue.",
      };

      if (message && known[message]) {
        return known[message];
      }
      if (message && !/^[A-Z0-9_]+$/.test(message)) {
        return message;
      }
      return fallback;
    }

    function resolvePortalRecoveryPageKey() {
      return isOnboardingProfileReady() || hasPendingProfileDraft()
        ? "requirements"
        : "profile";
    }

    function redirectToPortalRecoveryPage(message = "", tone = "info") {
      const recoveryPageKey = resolvePortalRecoveryPageKey();
      const recoveryPath = buildPortalPagePath(recoveryPageKey);
      if (!recoveryPath) {
        if (message) {
          setFlash(message, tone);
        }
        return false;
      }

      if (message) {
        savePortalFlashNotice(message, tone);
      }

      const currentPath = resolvePortalPath(String(window.location.pathname || ""));
      if (currentPath === recoveryPath) {
        setPortalIntroLoading(false);
        setPortalFlowUnlocked(false);
        setActiveIntroStep(recoveryPageKey, { scrollIntoView: false });
        if (message) {
          setFlash(message, tone);
        }
        if (recoveryPageKey === "profile" && !isOnboardingProfileReady()) {
          window.setTimeout(() => {
            focusProfileSetup();
          }, 60);
        }
        return false;
      }

      setPortalIntroLoading(false);
      window.location.replace(recoveryPath);
      return true;
    }

${documentWorkflowClientScript}

    function readSection(sectionCode) {
      const form = document.querySelector('[data-section="' + sectionCode + '"]');
      if (!form) return {};
      const payload = {};
      form.querySelectorAll("input, textarea, select").forEach((element) => {
        if (!element.name) return;
        if (element.tagName === "SELECT" && element.name === "intendsSecondLevelSales") {
          payload[element.name] = element.value === "true";
          return;
        }
        if (element.dataset.inputKind === "whole-number") {
          const normalized = normalizeWholeNumber(element.value, element.maxLength);
          element.value = normalized;
          payload[element.name] = normalized;
          return;
        }
        if (element.name === "websiteUrl") {
          const normalized = normalizeWebsiteUrl(element.value);
          element.value = normalized;
          payload[element.name] = normalized;
          return;
        }
        if (element.name === "ns1" || element.name === "ns2") {
          const normalized = String(element.value || "").toLowerCase().replace(/\\s+/g, "");
          element.value = normalized;
          payload[element.name] = normalized;
          return;
        }
        payload[element.name] = element.value;
      });
      return payload;
    }

    function readAllSections() {
      const sections = {};
      document.querySelectorAll("[data-section]").forEach((form) => {
        const sectionCode = form.getAttribute("data-section");
        if (!sectionCode) {
          return;
        }
        sections[sectionCode] = readSection(sectionCode);
      });
      return sections;
    }

    function fillSection(sectionCode, data) {
      const form = document.querySelector('[data-section="' + sectionCode + '"]');
      if (!form || !data) return;
      form.querySelectorAll("input, textarea, select").forEach((element) => {
        if (!element.name) return;
        const value = data[element.name];
        if (typeof value === "undefined" || value === null) return;
        if (element.tagName === "SELECT" && element.name === "intendsSecondLevelSales") {
          element.value = value ? "true" : "false";
          return;
        }
        element.value = String(value);
      });
      syncSecondLevelSalesControls();
    }

    function buildApplicationPayload() {
      normalizePhoneFieldsForCountry();
      return {
        sections: readAllSections(),
      };
    }

    async function ensureApplicationStarted() {
      if (state.applicationId) {
        return false;
      }

      const applicantType = normalizeApplicantTypeSelection(applicantTypeInput?.value);
      const country = normalizeCountrySelection();

      if (!applicantType) {
        throw new Error("APPLICANT_TYPE_REQUIRED");
      }

      if (applicantType === "international" && isBlockedInternationalCountry(country)) {
        throw new Error("COUNTRY_OF_INCORPORATION_NOT_ALLOWED_FOR_INTERNATIONAL");
      }

      if (applicantType === "international" && !country) {
        throw new Error("COUNTRY_OF_INCORPORATION_REQUIRED");
      }

      setActivationState("activating");
      const result = await request(buildPublicApiPath("/applications"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantType,
          countryOfIncorporation: country || null,
        }),
      });

      state.applicationId = result.application.id;
      saveState();
      rememberPortalViewport();
      movePendingDraftToApplicationDraft(state.applicationId);

      latestBundle = normalizeBundle({
        application: result.application,
        checklist: result.checklist,
        sections: Array.isArray(result.checklist?.sections)
          ? result.checklist.sections.map((section) => ({
              sectionCode: section.sectionCode,
              data: {},
              isComplete: section.isComplete,
              validationErrors: section.validationErrors,
            }))
          : [],
        documents: [],
      });

      syncCountryFieldState(true);
      rememberCommittedProfile();
      setFlowVisualState("active");
      setFormsEnabled(true);
      setActivationState("active");
      setPortalFlowUnlocked(true);
      persistLocalDraftNow();
      updateSectionStatuses(latestBundle);
      renderDocumentRequirements(latestBundle);
      syncDocumentUploadFeedback(latestBundle);

      return true;
    }

    function bindDraftTracking() {
      document.querySelectorAll("[data-section]").forEach((form) => {
        const sectionCode = form.getAttribute("data-section");
        if (!sectionCode) return;

        const syncSection = () => {
          const data = readSection(sectionCode);
          setSectionStatus(
            sectionCode,
            sectionHasValues(data) ? "loading" : "pending",
            sectionHasValues(data) ? "In progress" : "Not started"
          );
          scheduleLocalDraftSave();
        };

        form.querySelectorAll("input, textarea").forEach((field) => {
          field.addEventListener("input", syncSection);
          field.addEventListener("blur", syncSection);
        });

        form.querySelectorAll("select").forEach((field) => {
          field.addEventListener("change", syncSection);
        });
      });
    }

    function bindFlowViewportTracking() {
      flowSectionNodes.forEach((sectionNode) => {
        const sectionCode = sectionNode.getAttribute("data-flow-section");
        if (!sectionCode) {
          return;
        }

        sectionNode.addEventListener("focusin", (event) => {
          const requirementCode = event.target instanceof Element
            ? event.target.closest("[data-document-requirement]")?.getAttribute("data-document-requirement") || ""
            : "";
          rememberPortalViewport({
            sectionCode,
            requirementCode,
            awaitingDocumentReturn: false,
          });
        });

        sectionNode.addEventListener("click", (event) => {
          if (!(event.target instanceof Element)) {
            return;
          }

          const documentCard = event.target.closest("[data-document-requirement]");
          const actionButton = event.target.closest("[data-document-action-source]");
          rememberPortalViewport({
            sectionCode,
            requirementCode: documentCard?.getAttribute("data-document-requirement") || "",
            actionSource: actionButton?.getAttribute("data-document-action-source") || "",
            awaitingDocumentReturn: false,
          });
        });
      });

      window.addEventListener(
        "scroll",
        () => {
          if (flowSectionSyncFrame) {
            return;
          }

          flowSectionSyncFrame = window.requestAnimationFrame(() => {
            flowSectionSyncFrame = null;
            syncRememberedSectionFromViewport();
          });
        },
        { passive: true }
      );

      window.addEventListener("pagehide", () => {
        rememberPortalViewport();
      });

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          rememberPortalViewport();
          return;
        }

        const uiState = loadPortalUiState();
        if (uiState.awaitingDocumentReturn) {
          schedulePortalViewportRestore({ focusTarget: true, delay: 100 });
        }
      });

      window.addEventListener("focus", () => {
        const uiState = loadPortalUiState();
        if (uiState.awaitingDocumentReturn) {
          schedulePortalViewportRestore({ focusTarget: true, delay: 120 });
        }
      });
    }

    async function hydrate(flashMessage = "") {
      if (!state.applicationId) {
        resetLockedPortal();
        return;
      }

      const responseBundle = await request(buildPublicApiPath("/applications/" + state.applicationId));
      const bundle = normalizeBundle(responseBundle);
      const applicationStatus = bundle.application?.status || "";
      const isReadOnly = ["submitted", "in_review", "approved", "rejected"].includes(applicationStatus);
      latestBundle = bundle;

      if (isReadOnly) {
        const completionMessage = getClosedApplicationMessage(applicationStatus, flashMessage);
        clearStoredApplicationState();
        redirectToPortalRecoveryPage(
          completionMessage,
          applicationStatus === "submitted" || applicationStatus === "in_review" ? "success" : "info"
        );
        return;
      }

      if (bundle.application?.applicantType && applicantTypeInput) {
        applicantTypeInput.value = bundle.application.applicantType;
      }

      if (typeof bundle.application?.countryOfIncorporation === "string" && countryOfIncorporationInput) {
        countryOfIncorporationInput.value = bundle.application.countryOfIncorporation;
        countryOfIncorporationInput.dataset.autoLocal =
          normalizeCountryName(bundle.application.countryOfIncorporation) === "kenya" ? "true" : "false";
      }

      syncCountryFieldState(true);
      rememberCommittedProfile();
      resetSectionForms();
      bundle.sections.forEach((section) => fillSection(section.sectionCode, section.data));

      const localDraft = loadLocalDraft(state.applicationId);
      if (localDraft && isRecord(localDraft.sections)) {
        Object.keys(localDraft.sections).forEach((sectionCode) => {
          fillSection(sectionCode, localDraft.sections[sectionCode]);
        });
      }
      persistLocalDraftNow();

      setFormsEnabled(true);
      setSavingState(false);
      setSubmittingState(false);
      setActivationState("active");
      setFlowVisualState("active");
      setPortalFlowUnlocked(true);
      updateSectionStatuses(bundle);
      renderDocumentRequirements(bundle);
      syncDocumentUploadFeedback(bundle);
      syncSubmissionFeedback(bundle);
      revealFlowSection(getPreferredFlowSectionCode(bundle), { remember: false });
      saveState();

      if (flashMessage) {
        setFlash(
          flashMessage,
          flashMessage === getReviewStatusMessage(bundle.application?.status) ? "success" : "info"
        );
      } else {
        const reviewStatusMessage = getReviewStatusMessage(bundle.application?.status);
        if (reviewStatusMessage) {
          setFlash(reviewStatusMessage, "success");
        }
      }
    }

    submitApplicationButton?.addEventListener("click", async () => {
      if (savingApplication || submittingApplication) {
        return;
      }

      try {
        setSubmittingState(true);
        if (!state.applicationId) {
          await ensureApplicationStarted();
        }

        setFlash("Submitting your application. Please wait...");
        setSubmissionFeedback("Submitting your application. Please wait...", "info");
        await request(buildPublicApiPath("/applications/" + state.applicationId + "/submit"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildApplicationPayload()),
        });
        clearLocalDraft(state.applicationId);
        await hydrate(SUBMISSION_RECEIVED_MESSAGE);
      } catch (error) {
        setSubmittingState(false);

        if (!state.applicationId) {
          setActivationState("idle");
        }

        if (error && error.message === "APPLICATION_ALREADY_SUBMITTED") {
          try {
            clearLocalDraft(state.applicationId);
            await hydrate(SUBMISSION_RECEIVED_MESSAGE);
          } catch {
            clearLocalDraft(state.applicationId);
            setFormsEnabled(false);
            setSavingState(false);
            setActivationState("readonly");
            setFlowVisualState("readonly");
            setFlash(SUBMISSION_RECEIVED_MESSAGE, "success");
            setSubmissionFeedback(
              SUBMISSION_RECEIVED_MESSAGE,
              "success"
            );
            if (submitApplicationButton) {
              submitApplicationButton.disabled = true;
              submitApplicationButton.textContent = "Submitted";
            }
          }
          return;
        }

        const blockingIssue = getBlockingSectionIssueFromDetails(
          error && error.details ? error.details.sections : null
        );
        if (guideUserToSectionIssue(blockingIssue)) {
          return;
        }

        const blockingDocumentIssue = getBlockingDocumentIssueFromDetails(
          error && error.details ? error.details.documents : null
        );
        if (guideUserToDocumentIssue(blockingDocumentIssue)) {
          return;
        }

        const friendlyMessage = getFriendlyErrorMessage(
          error,
          "We could not submit your application yet. Please review the form and try again."
        );

        setFlash(
          friendlyMessage,
          true
        );
        setSubmissionFeedback(friendlyMessage, "error");
      }
    });

    async function initializePortal() {
      const restoreMessage = restoreSessionState();
      const restoredPendingProfile = restorePendingProfileSelection();
      const bootFlashNotice = consumePortalFlashNotice();
      const shouldBootFlowVisible = portalPageKey === "application" || Boolean(state.applicationId);
      setPortalFlowUnlocked(shouldBootFlowVisible, { compact: false });
      syncPortalOperationalState();
      updateCountrySuggestions();
      applyFieldMaxLengths();
      bindInputNormalization();
      bindDraftTracking();
      bindFlowViewportTracking();
      buildSectionNavigation();
      renderDocumentRequirements(latestBundle);
      syncDocumentUploadFeedback(latestBundle);
      syncApplicantTypeControls();
      syncSecondLevelSalesControls();
      syncPortalEntryPreview();
      setActiveIntroStep(getDefaultIntroStepKeyForPage(), { scrollIntoView: false });
      revealFlowSection(getPreferredFlowSectionCode(), { remember: false });
      void refreshPortalOperationalStatus({ silent: true });
      startPortalStatusPolling();

      portalIntroStepButtons.forEach((button) => {
        button.addEventListener("click", async () => {
          const targetStepKey = button.getAttribute("data-intro-step-target");
          if (!isIntroStepKey(targetStepKey) || portalFlowUnlocked) {
            return;
          }

          await transitionIntroStep(targetStepKey, { scrollIntoView: true });

          if (targetStepKey === "profile") {
            window.setTimeout(() => {
              focusProfileSetup();
            }, 60);
          }
        });
      });

      applicantTypeOptionButtons.forEach((button) => {
        button.addEventListener("click", async () => {
          const nextApplicantType = button.getAttribute("data-applicant-type-option");
          const nextCountry = nextApplicantType === "local"
            ? "Kenya"
            : applicantTypeInput?.value === "international"
              ? String(countryOfIncorporationInput?.value || "").trim()
              : "";
          await requestProfileSelectionChange({
            applicantType: nextApplicantType,
            country: nextCountry,
          });
        });
        button.addEventListener("keydown", async (event) => {
          if (button.disabled) {
            return;
          }

          if (event.key === " " || event.key === "Enter") {
            event.preventDefault();
            button.click();
            return;
          }

          const currentIndex = applicantTypeOptionButtons.indexOf(button);
          if (currentIndex < 0) {
            return;
          }

          let nextIndex = -1;
          if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            nextIndex = currentIndex === applicantTypeOptionButtons.length - 1 ? 0 : currentIndex + 1;
          } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            nextIndex = currentIndex === 0 ? applicantTypeOptionButtons.length - 1 : currentIndex - 1;
          }

          if (nextIndex < 0) {
            return;
          }

          event.preventDefault();
          const nextButton = applicantTypeOptionButtons[nextIndex];
          if (!(nextButton instanceof HTMLButtonElement)) {
            return;
          }

          nextButton.focus();
          nextButton.click();
        });
      });

      secondLevelSalesOptionButtons.forEach((button) => {
        button.addEventListener("click", () => {
          if (!secondLevelSalesInput || secondLevelSalesInput.disabled) {
            return;
          }

          const nextValue = button.getAttribute("data-second-level-sales-option") === "true"
            ? "true"
            : "false";

          if (secondLevelSalesInput.value === nextValue) {
            return;
          }

          secondLevelSalesInput.value = nextValue;
          secondLevelSalesInput.dispatchEvent(new Event("input", { bubbles: true }));
          secondLevelSalesInput.dispatchEvent(new Event("change", { bubbles: true }));
          syncSecondLevelSalesControls();
        });
      });

      countryOfIncorporationInput?.addEventListener("input", () => {
        updateCountrySuggestions(countryOfIncorporationInput.value, { open: true });
        updateCountrySearchFeedback();
        refreshPhoneFieldDecorators();
        updateApplicationProfileSummary();
        syncPortalEntryPreview();
        if (!hasStartedApplicationWork()) {
          scheduleLocalDraftSave();
        }
      });

      countryOfIncorporationInput?.addEventListener("focus", () => {
        if (applicantTypeInput?.value === "international") {
          updateCountrySuggestions(countryOfIncorporationInput.value, { open: true });
        }
      });

      countryOfIncorporationInput?.addEventListener("keydown", async (event) => {
        if (applicantTypeInput?.value !== "international") {
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          if (!visibleCountrySuggestions.length) {
            updateCountrySuggestions(countryOfIncorporationInput.value, { open: true });
            return;
          }
          setActiveCountrySuggestion(
            activeCountrySuggestionIndex < visibleCountrySuggestions.length - 1
              ? activeCountrySuggestionIndex + 1
              : 0
          );
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          if (!visibleCountrySuggestions.length) {
            updateCountrySuggestions(countryOfIncorporationInput.value, { open: true });
            return;
          }
          setActiveCountrySuggestion(
            activeCountrySuggestionIndex > 0
              ? activeCountrySuggestionIndex - 1
              : visibleCountrySuggestions.length - 1
          );
          return;
        }

        if (event.key === "Enter" && visibleCountrySuggestions.length && activeCountrySuggestionIndex >= 0) {
          event.preventDefault();
          await commitCountrySelection(visibleCountrySuggestions[activeCountrySuggestionIndex], { focusInput: false });
          return;
        }

        if (event.key === "Escape") {
          closeCountrySuggestions();
        }
      });

      countryOfIncorporationInput?.addEventListener("blur", async (event) => {
        const nextFocus = event.relatedTarget instanceof Element ? event.relatedTarget : null;
        if (nextFocus?.closest("[data-applicant-type-option]")) {
          return;
        }

        const normalizedCountry = normalizeCountrySelection();
        closeCountrySuggestions();
        await commitCountryProfileChange(normalizedCountry);
      });

      document.querySelectorAll("input, textarea, select").forEach((field) => {
        field.addEventListener("input", () => {
          clearFieldInvalidState(field);
        });
        field.addEventListener("change", () => {
          clearFieldInvalidState(field);
        });
      });

      flashToastClose?.addEventListener("click", () => {
        hideFlashToast();
      });

      flashOverlay?.addEventListener("click", (event) => {
        if (event.target === flashOverlay) {
          hideFlashToast();
        }
      });

      document.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) {
          return;
        }

        if (!event.target.closest(".profile-country-field")) {
          closeCountrySuggestions();
        }
      });

      profileSwitchCancel?.addEventListener("click", () => {
        closeProfileSwitchOverlay(false);
      });

      profileSwitchConfirm?.addEventListener("click", () => {
        closeProfileSwitchOverlay(true);
      });

      profileSwitchOverlay?.addEventListener("click", (event) => {
        if (event.target === profileSwitchOverlay) {
          closeProfileSwitchOverlay(false);
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          if (profileSwitchRequest) {
            closeProfileSwitchOverlay(false);
            event.preventDefault();
            return;
          }
          hideFlashToast();
        }
      });

      phoneFieldDecorators.forEach((field) => {
        field.input?.addEventListener("blur", () => {
          normalizePhoneFieldsForCountry();
          scheduleLocalDraftSave();
        });
      });

      portalWelcomeStartButton?.addEventListener("click", () => {
        void handlePortalProceedAction();
      });
      portalProfileBackButton?.addEventListener("click", () => {
        void handlePortalIntroBackAction();
      });
      portalProfileProceedButton?.addEventListener("click", () => {
        void handlePortalProceedAction();
      });
      portalRequirementsBackButton?.addEventListener("click", () => {
        void handlePortalIntroBackAction();
      });
      portalRequirementsProceedButton?.addEventListener("click", () => {
        void handlePortalProceedAction();
      });
      window.addEventListener("popstate", () => {
        if (introTransitionTimer) {
          window.clearTimeout(introTransitionTimer);
          introTransitionTimer = null;
        }

        if (portalPageKey === "application" || state.applicationId) {
          return;
        }

        const locationPageKey = getPortalPageKeyFromLocation();
        if (locationPageKey === "application") {
          navigateToPortalPage("application", { delay: 0, loading: false });
          return;
        }

        if (!isIntroStepKey(locationPageKey)) {
          return;
        }

        setPortalIntroLoading(false);
        setActiveIntroStep(locationPageKey, { scrollIntoView: false });

        if (locationPageKey === "profile" && !isOnboardingProfileReady()) {
          window.setTimeout(() => {
            focusProfileSetup();
          }, 60);
        }
      });

      if (state.applicationId) {
        if (portalPageKey !== "application") {
          navigateToPortalPage("application", { delay: 0 });
          return;
        }

        try {
          await hydrate(restoreMessage);
          schedulePortalViewportRestore({ delay: 0 });
          if (bootFlashNotice?.message) {
            setFlash(bootFlashNotice.message, bootFlashNotice.tone);
          }
          return;
        } catch (error) {
          const recoveryMessage = getFriendlyErrorMessage(
            error,
            "We could not reopen the application. Please start again."
          );
          clearStoredApplicationState();
          redirectToPortalRecoveryPage(recoveryMessage, "error");
          return;
        }
      }

      resetLockedPortal();
      clearPortalUiState();

      if (portalPageKey === "application") {
        redirectToPortalRecoveryPage(
          restoredPendingProfile || isOnboardingProfileReady()
            ? "Start from the requirements step so we can prepare the application workspace."
            : "Choose the registrar pathway before opening the application workspace.",
          "info"
        );
        return;
      }

      if (portalPageKey !== "application") {
        syncPortalIntroHistory(getRenderableIntroStepKey(), { mode: "replace" });
      }

      if (bootFlashNotice?.message) {
        setFlash(bootFlashNotice.message, bootFlashNotice.tone);
      }

      if (portalPageKey === "profile" && !isOnboardingProfileReady()) {
        window.setTimeout(() => {
          focusProfileSetup();
        }, 60);
      }
    }

    window.__DOTKE_PORTAL_READY = false;
    window.__DOTKE_PORTAL_INIT_ERROR = "";

    void initializePortal()
      .then(() => {
        window.__DOTKE_PORTAL_READY = true;
        window.__DOTKE_PORTAL_INIT_ERROR = "";
      })
      .catch((error) => {
        const message =
          error instanceof Error && error.message
            ? error.message
            : "PORTAL_INIT_FAILED";

        window.__DOTKE_PORTAL_INIT_ERROR = message;
        setFlash(
          "We could not finish loading the onboarding portal. Please refresh and try again.",
          true
        );

        if (typeof console !== "undefined" && typeof console.error === "function") {
          console.error("DotKE portal initialization failed", error);
        }
      });
  `;

  return scripts;
};

export const renderPortalPage = (options: RenderPortalPageOptions = {}) => {
  const pageKey = getPortalPageKey(options.pageKey);
  const pageView = getPortalPageView(pageKey);
  const isIntroPage = pageKey !== "application";
  const body = buildPortalBody({
    ...(options.portalStatus ? { portalStatus: options.portalStatus } : {}),
    pageKey,
  });

  return renderShell({
    bodyClassName: `portal-body ${isIntroPage ? "portal-body--intro" : "portal-body--workspace"}`,
    hideHero: true,
    shellClassName: "portal-shell",
    heroClassName: `portal-hero${isIntroPage ? " portal-hero--walkthrough" : ""}`,
    eyebrow: isIntroPage ? "Onboarding portal" : pageView.heroEyebrow,
    title: "KeNIC Registrar Accreditation",
    titleHtml: isIntroPage
      ? '<span class="hero-title-primary">KeNIC</span> <span class="hero-title-muted">Registrar Accreditation</span>'
      : pageView.heroTitleHtml,
    description: isIntroPage
      ? "A short walkthrough before the live application workspace."
      : pageView.heroDescription,
    body,
    scriptSrc: `/portal/client.js?v=${encodeURIComponent(options.nonce || "portal-client")}`,
    ...(options.nonce ? { nonce: options.nonce } : {}),
  });
};
