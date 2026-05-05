import type {
  PortalPageKey,
  PortalPageViewModel,
  PortalStatusViewModel,
} from "./types.js";

export const PORTAL_PAGE_PATHS: Record<PortalPageKey, string> = {
  welcome: "/portal",
  profile: "/portal/profile",
  requirements: "/portal/requirements",
  application: "/portal/application",
};

const PORTAL_PAGE_VIEWS: Record<PortalPageKey, PortalPageViewModel> = {
  welcome: {
    heroEyebrow: "KeNIC",
    heroDescription:
      "A short walkthrough before the live application workspace.",
    heroTitleHtml:
      '<span class="hero-title-primary">KeNIC</span> <span class="hero-title-muted">Registrar Accreditation</span>',
    introActionMessage:
      "Move into the onboarding process when you are ready.",
    introActionTitle: "Start here",
    introDescription:
      "A clean welcome screen before you choose the registrar pathway.",
    introProgressLabel: "",
    introTitle: "Welcome to the accreditation platform.",
    nextLabel: "Profile selection",
    nextPageKey: "profile",
    previousLabel: "",
    proceedLabel: "Start process",
    screenLabel: "Welcome screen",
  },
  profile: {
    heroEyebrow: "KeNIC",
    heroDescription:
      "Choose the path that matches the applying registrar.",
    heroTitleHtml:
      '<span class="hero-title-primary">KeNIC</span> <span class="hero-title-muted">Registrar Accreditation</span>',
    introActionMessage:
      "Select local or international. International applicants must also choose the country of incorporation.",
    introActionTitle: "Choose a pathway",
    introDescription:
      "One decision here shapes the form and document guidance that follow.",
    introProgressLabel: "",
    introTitle: "Choose the registrar pathway.",
    nextLabel: "Requirements review",
    nextPageKey: "requirements",
    previousLabel: "Welcome screen",
    previousPageKey: "welcome",
    proceedLabel: "Continue",
    screenLabel: "Profile selection",
  },
  requirements: {
    heroEyebrow: "KeNIC",
    heroDescription:
      "A quick preview of the details and documents needed before the live application workspace opens.",
    heroTitleHtml:
      '<span class="hero-title-primary">KeNIC</span> <span class="hero-title-muted">Registrar Accreditation</span>',
    introActionMessage:
      "We'll ask for company details, operational and technical information, legal details, and supporting documents.",
    introActionTitle: "What you'll need",
    introDescription:
      "A short preview of what the application will ask for before you start.",
    introProgressLabel: "",
    introTitle: "See what the application will ask for.",
    nextLabel: "Application workspace",
    nextPageKey: "application",
    previousLabel: "Profile selection",
    previousPageKey: "profile",
    proceedLabel: "Start application",
    screenLabel: "Application preview",
  },
  application: {
    heroEyebrow: "KeNIC",
    heroDescription:
      "The working area is separated from the intro screens so applicants can focus on the actual accreditation flow, uploads, and progress.",
    heroTitleHtml:
      '<span class="hero-title-primary">Application</span> <span class="hero-title-muted">workspace</span> <span class="hero-title-secondary">open</span>',
    introActionMessage: "",
    introActionTitle: "",
    introDescription: "",
    introProgressLabel: "",
    introTitle: "",
    nextLabel: "",
    previousLabel: "Requirements review",
    previousPageKey: "requirements",
    proceedLabel: "",
    screenLabel: "Application workspace",
  },
};

export const getDefaultPortalStatus = (): PortalStatusViewModel => ({
  portalKey: "applicant_portal",
  status: "active",
  reason: "",
  updatedBy: "system",
  updatedAt: "",
});

export const getPortalPageKey = (value: unknown): PortalPageKey => {
  if (value === "profile" || value === "requirements" || value === "application") {
    return value;
  }

  return "welcome";
};

export const getPortalPagePath = (pageKey: PortalPageKey) => PORTAL_PAGE_PATHS[pageKey];

export const getPortalPageView = (pageKey: PortalPageKey): PortalPageViewModel =>
  PORTAL_PAGE_VIEWS[pageKey] ?? PORTAL_PAGE_VIEWS.welcome;
