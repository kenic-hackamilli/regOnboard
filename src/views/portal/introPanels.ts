import { COUNTRY_OF_INCORPORATION_MAX_LENGTH } from "../../utils/sections.js";
import type { PortalPageKey, PortalPageViewModel } from "./types.js";

export const renderPortalProfileStateStore = () => `
  <div class="portal-profile-state-store" hidden aria-hidden="true">
    <select id="applicantType" class="visually-hidden-control" tabindex="-1">
      <option value="" selected disabled hidden>Select registrar type</option>
      <option value="local">Local Registrar</option>
      <option value="international">International Registrar</option>
    </select>
    <input
      id="countryOfIncorporation"
      maxlength="${COUNTRY_OF_INCORPORATION_MAX_LENGTH}"
      autocomplete="off"
      autocapitalize="words"
      spellcheck="false"
      tabindex="-1"
    />
    <div id="countrySuggestionList" class="country-suggestion-list" role="listbox" hidden></div>
    <span id="countrySearchFeedback" class="hint" hidden></span>
  </div>
`;

export const renderProfileSwitchOverlay = () => `
  <div
    id="profileSwitchOverlay"
    class="profile-switch-overlay"
    hidden
    aria-hidden="true"
    role="dialog"
    aria-modal="true"
    aria-labelledby="profileSwitchTitle"
  >
    <article class="profile-switch-dialog">
      <div class="profile-switch-dialog-copy">
        <h3 id="profileSwitchTitle">Change application pathway?</h3>
        <p>
          Switching the pathway after work has started will open a fresh application so the guidance,
          checklist, and stored draft stay consistent.
        </p>
      </div>

      <div class="profile-switch-compare">
        <div class="profile-switch-state">
          <span>Current pathway</span>
          <strong id="profileSwitchCurrentValue">Local Registrar • Kenya</strong>
        </div>
        <div class="profile-switch-arrow" aria-hidden="true"></div>
        <div class="profile-switch-state">
          <span>New pathway</span>
          <strong id="profileSwitchNextValue">International Registrar</strong>
        </div>
      </div>

      <div class="profile-switch-note">
        Continue only if you are ready to start a new application workspace with the newly selected profile.
      </div>

      <div class="profile-switch-actions">
        <button id="profileSwitchCancel" type="button" class="ghost">Keep current</button>
        <button id="profileSwitchConfirm" type="button">Switch pathway</button>
      </div>
    </article>
  </div>
`;

export const renderPortalWorkspaceBanner = (previousPath: string) => `
  <section class="portal-workspace-banner">
    <div class="portal-workspace-hero">
      <div class="portal-workspace-copy">
        <div class="portal-screen-header portal-screen-header--workspace">
          <a href="/portal" class="portal-brand" aria-label="Return to the portal welcome screen">
            <span class="portal-brand-mark">KeNIC</span>
            <span class="portal-brand-copy">Applicant onboarding</span>
          </a>
          <span class="portal-entry-badge">Live application workspace</span>
        </div>

        <span id="portalHeroSceneEyebrow" class="portal-stage-card-label">Application momentum</span>
        <h2 id="portalHeroSceneTitle" class="portal-workspace-title">
          Move through the registrar journey with clear progress signals.
        </h2>
        <p id="portalHeroSceneDescription" class="portal-workspace-copytext">
          Sections, document readiness, and submission status stay visible as the application takes shape.
        </p>

        <div class="portal-workspace-progress">
          <div class="portal-stage-progress-track" aria-hidden="true">
            <span id="portalHeroProgressBar" class="portal-stage-progress-value"></span>
          </div>
          <strong id="portalHeroProgressValue">Draft started</strong>
        </div>
      </div>

      <div class="portal-workspace-summary">
        <article class="portal-workspace-summary-card">
          <span class="portal-workspace-summary-label">Pathway</span>
          <strong id="portalHeroPathway">Local Registrar • Kenya</strong>
          <p>Guidance stays aligned to the selected applicant profile all the way through submission.</p>
        </article>

        <article class="portal-workspace-summary-card">
          <span class="portal-workspace-summary-label">Journey state</span>
          <strong id="portalHeroJourneyState">Guided flow ready</strong>
          <p>Use the sections below to move through company, business, technical, legal, and review steps.</p>
        </article>

        <article class="portal-workspace-summary-card">
          <span class="portal-workspace-summary-label">Documents</span>
          <strong id="portalHeroDocumentState">5 required</strong>
          <p>Requirements and upload readiness update as the application becomes more complete.</p>
        </article>
      </div>
    </div>

    <div class="portal-workspace-meta">
      <div class="hero-status-card">
        <div class="hero-status-row">
          <span class="hero-status-label">Application activity</span>
          <span id="activationIndicator" class="hero-status-indicator">Ready</span>
        </div>
        <p id="activationHint" class="hero-status-hint">Application ready.</p>
      </div>

      <div class="portal-live-grid" aria-live="polite">
        <div class="portal-live-card">
          <span class="portal-live-label">Pathway</span>
          <strong id="portalLivePathway" class="portal-live-value">Local Registrar • Kenya</strong>
          <p id="portalLivePathwayNote" class="portal-live-note">Kenya is used automatically for local applications.</p>
        </div>
        <div class="portal-live-card">
          <span class="portal-live-label">Draft status</span>
          <strong id="portalLiveDraftStatus" class="portal-live-value">Ready to start</strong>
          <p id="portalLiveDraftNote" class="portal-live-note">Progress is saved in this browser while you work.</p>
        </div>
        <div class="portal-live-card">
          <span class="portal-live-label">Documents</span>
          <strong id="portalLiveDocumentStatus" class="portal-live-value">5 required documents</strong>
          <p id="portalLiveDocumentNote" class="portal-live-note">Requirements adapt to the selected pathway.</p>
        </div>
      </div>

      <div class="portal-workspace-actions">
        <a href="${previousPath}" class="button ghost">Review requirements</a>
        <span class="portal-workspace-note">
          The workspace keeps draft progress, document uploads, and section readiness in one place.
        </span>
      </div>
    </div>
  </section>
`;

const renderWelcomeIntroPanel = () => `
  <section class="portal-intro-panel is-current" data-intro-step-panel="welcome" role="tabpanel">
    <article class="portal-screen-canvas portal-screen-canvas--welcome">
      <div class="portal-stage-copyblock portal-stage-copyblock--immersive portal-stage-copyblock--landing">
        <h2 id="portalWelcomeTitle" class="portal-stage-title portal-stage-title--brand portal-stage-title--landing">
          <span class="portal-title-primary">Welcome to KeNIC</span>
          <span class="portal-title-secondary">Registrar Accreditation Platform.</span>
        </h2>
        <button id="portalWelcomeStartButton" type="button" class="secondary portal-stage-cta">Start process</button>
      </div>
    </article>
  </section>
`;

const renderProfileIntroPanel = () => `
  <section class="portal-intro-panel is-current" data-intro-step-panel="profile" role="tabpanel">
    <article class="portal-screen-canvas portal-screen-canvas--profile">
      <div class="portal-profile-stage">
        <div class="portal-stage-copyblock portal-stage-copyblock--page portal-stage-copyblock--profile">
          <span class="portal-stage-kicker">Registrar type</span>
        </div>

        <div class="portal-profile-card portal-profile-card--centered">
          <div class="profile-setup-panel">
            <div class="profile-setup-main">
              <div class="field-block applicant-type-field">
                <select id="applicantType" class="visually-hidden-control" tabindex="-1" aria-hidden="true">
                  <option value="" selected disabled hidden>Select registrar type</option>
                  <option value="local">Local (within Kenya)</option>
                  <option value="international">International (outside Kenya)</option>
                </select>
                <div class="portal-pathway-choice-grid" role="radiogroup" aria-label="Registrar type">
                  <button
                    type="button"
                    class="inline-choice portal-pathway-choice"
                    data-applicant-type-option="local"
                    role="radio"
                    aria-checked="false"
                    tabindex="0"
                  >
                    <span class="portal-pathway-choice-indicator" aria-hidden="true"></span>
                    <span class="portal-pathway-choice-copy">
                      <span class="portal-pathway-choice-word">Local</span>
                      <span class="portal-pathway-choice-meta">(within Kenya)</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    class="inline-choice portal-pathway-choice"
                    data-applicant-type-option="international"
                    role="radio"
                    aria-checked="false"
                    tabindex="-1"
                  >
                    <span class="portal-pathway-choice-indicator" aria-hidden="true"></span>
                    <span class="portal-pathway-choice-copy">
                      <span class="portal-pathway-choice-word">International</span>
                      <span class="portal-pathway-choice-meta">(outside Kenya)</span>
                    </span>
                  </button>
                </div>
              </div>

              <label class="profile-country-field portal-country-field is-hidden">
                Country of Incorporation
                <div class="country-search-shell">
                  <span class="country-search-icon" aria-hidden="true"></span>
                  <input
                    id="countryOfIncorporation"
                    maxlength="${COUNTRY_OF_INCORPORATION_MAX_LENGTH}"
                    autocomplete="off"
                    autocapitalize="words"
                    spellcheck="false"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded="false"
                    aria-controls="countrySuggestionList"
                    placeholder="Search for a country"
                  />
                </div>
                <div id="countrySuggestionList" class="country-suggestion-list" role="listbox" hidden></div>
                <span id="countrySearchFeedback" class="hint" hidden></span>
              </label>
            </div>

            <div class="portal-stage-inline-actions portal-stage-inline-actions--profile">
              <button id="portalProfileBackButton" type="button" class="ghost">Back</button>
              <button id="portalProfileProceedButton" type="button" class="secondary">Continue</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  </section>
`;

const renderRequirementsIntroPanel = () => `
  <section class="portal-intro-panel is-current" data-intro-step-panel="requirements" role="tabpanel">
    <article class="portal-screen-canvas portal-screen-canvas--requirements">
      <div class="portal-requirements-stage">
        <div class="portal-stage-copyblock portal-stage-copyblock--page portal-stage-copyblock--requirements">
          <span class="portal-stage-kicker">What you'll need</span>
        </div>

        <div class="portal-requirements-content">
          <article class="portal-requirements-block">
            <span class="portal-requirements-label">Company and applicant details</span>
            <p id="portalOverviewIdentityDescription">
              Provide the applicant identity, contact person, Kenyan company registration, and tax information.
            </p>
          </article>

          <article class="portal-requirements-block">
            <span class="portal-requirements-label">The rest of the application</span>
            <ul class="portal-requirements-list" aria-label="Application sections">
              <li>Business profile and operations</li>
              <li>Domain administration and technical setup</li>
              <li>Business development details</li>
              <li>Legal structure and declarations</li>
              <li>Final review before submission</li>
            </ul>
          </article>

          <article class="portal-requirements-block">
            <div class="portal-requirements-documents-head">
              <span class="portal-requirements-label">Supporting documents</span>
            </div>
            <div id="portalChecklistPreview" class="portal-commitment-documents portal-commitment-documents--compact"></div>
          </article>
        </div>

        <div class="portal-stage-inline-actions portal-stage-inline-actions--requirements">
          <button id="portalRequirementsBackButton" type="button" class="ghost">Back</button>
          <button id="portalRequirementsProceedButton" type="button" class="secondary">Start application</button>
        </div>
      </div>
    </article>
  </section>
`;

const renderPortalIntroPanels = (pageKey: PortalPageKey) => [
  { key: "welcome", markup: renderWelcomeIntroPanel() },
  { key: "profile", markup: renderProfileIntroPanel() },
  { key: "requirements", markup: renderRequirementsIntroPanel() },
].map((panel) => {
  const isCurrent = panel.key === pageKey;

  return panel.markup
    .replace('class="portal-intro-panel is-current"', `class="portal-intro-panel${isCurrent ? " is-current" : ""}"`)
    .replace('role="tabpanel">', `role="tabpanel"${isCurrent ? "" : " hidden"}>`);
}).join("");

export const renderPortalIntroShell = (options: {
  pageKey: PortalPageKey;
  pageView: PortalPageViewModel;
  previousPath: string;
}) => {
  const { pageKey } = options;

  return `
    <div id="portalIntroShell" class="portal-intro-shell portal-intro-shell--${pageKey}">
      <div class="portal-intro-backdrop" aria-hidden="true">
        <div class="portal-intro-backdrop-image"></div>
        <div class="portal-intro-backdrop-scrim"></div>
      </div>
      <div class="portal-intro-panels">
        ${renderPortalIntroPanels(pageKey)}
      </div>
    </div>
  `;
};
