export type PortalStatusViewModel = {
  portalKey: string;
  status: "active" | "inactive";
  reason: string;
  updatedBy: string;
  updatedAt: string;
};

export type PortalPageKey = "welcome" | "profile" | "requirements" | "application";

export type PortalPageViewModel = {
  heroEyebrow: string;
  heroDescription: string;
  heroTitleHtml: string;
  introActionMessage: string;
  introActionTitle: string;
  introDescription: string;
  introProgressLabel: string;
  introTitle: string;
  nextLabel: string;
  nextPageKey?: PortalPageKey;
  previousLabel: string;
  previousPageKey?: PortalPageKey;
  proceedLabel: string;
  screenLabel: string;
};

export type RenderPortalBodyOptions = {
  pageKey?: PortalPageKey;
  portalStatus?: PortalStatusViewModel;
};

export type RenderPortalPageOptions = RenderPortalBodyOptions & {
  nonce?: string;
};
