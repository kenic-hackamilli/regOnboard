import {
  getDefaultPortalStatus,
  getPortalPageKey,
  getPortalPagePath,
  getPortalPageView,
} from "./pageConfig.js";
import {
  renderPortalIntroShell,
  renderPortalProfileStateStore,
  renderProfileSwitchOverlay,
} from "./introPanels.js";
import type { RenderPortalBodyOptions } from "./types.js";
import { renderApplicationFlow } from "./applicationFlow.js";

const serializeForScript = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

export const buildPortalBody = (options: RenderPortalBodyOptions = {}) => {
  const pageKey = getPortalPageKey(options.pageKey);
  const pageView = getPortalPageView(pageKey);
  const previousPath = pageView.previousPageKey ? getPortalPagePath(pageView.previousPageKey) : "";
  const isApplicationPage = pageKey === "application";

  return `
    <section id="portalStatusBanner" class="portal-status-banner" hidden aria-live="polite">
      <div class="portal-status-banner-kicker">Application status</div>
      <strong id="portalStatusTitle">Registrar applications are temporarily unavailable</strong>
      <p id="portalStatusReason">Update in progress.</p>
      <div id="portalStatusMeta" class="portal-status-meta"></div>
    </section>

    <section id="portalEntry" class="portal-entry${isApplicationPage ? " portal-entry--application" : ""}">
      ${isApplicationPage ? renderPortalProfileStateStore() : ""}
      ${isApplicationPage
        ? ""
        : renderPortalIntroShell({ pageKey, pageView, previousPath })}

      <div class="flash" id="flashBox"></div>
    </section>

    ${renderApplicationFlow({ hidden: !isApplicationPage })}
    ${renderProfileSwitchOverlay()}
    <template id="portalBootData">${serializeForScript({
      pageKey,
      portalStatus: options.portalStatus ?? getDefaultPortalStatus(),
    })}</template>
  `;
};
