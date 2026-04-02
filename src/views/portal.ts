import {
  COUNTRY_OF_INCORPORATION_MAX_LENGTH,
  SECTION_FIELD_MAX_LENGTHS,
} from "../utils/sections.js";
import { documentWorkflowClientScript } from "./portal/documentWorkflow.js";
import { renderShell } from "./shared.js";

const serializeForScript = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

type PortalStatusViewModel = {
  portalKey: string;
  status: "active" | "inactive";
  reason: string;
  updatedBy: string;
  updatedAt: string;
};

const getDefaultPortalStatus = (): PortalStatusViewModel => ({
  portalKey: "applicant_portal",
  status: "active",
  reason: "",
  updatedBy: "system",
  updatedAt: "",
});

const buildPortalBody = (options: {
  portalStatus?: PortalStatusViewModel;
} = {}) => {
  const body = `
    <section id="portalStatusBanner" class="portal-status-banner" hidden aria-live="polite">
      <div class="portal-status-banner-kicker">Application status</div>
      <strong id="portalStatusTitle">Registrar applications are temporarily unavailable</strong>
      <p id="portalStatusReason">Update in progress.</p>
      <div id="portalStatusMeta" class="portal-status-meta"></div>
    </section>

    <section id="portalEntry" class="portal-entry">
        <div class="profile-setup-panel">
          <div class="profile-setup-main">
            <div class="field-block applicant-type-field">
              <div class="field-label-row">
                <span>Application Profile<span class="required-mark">*</span></span>
              </div>
              <select id="applicantType" class="visually-hidden-control" tabindex="-1" aria-hidden="true">
                <option value="local">Local Registrar</option>
                <option value="international">International Registrar</option>
              </select>
              <div class="inline-choice-group" role="radiogroup" aria-label="Registrar type">
                <button type="button" class="inline-choice" data-applicant-type-option="local" aria-pressed="true">
                  <span class="inline-choice-indicator" aria-hidden="true"></span>
                  <span class="inline-choice-label">Local Registrar</span>
                </button>
                <button type="button" class="inline-choice" data-applicant-type-option="international" aria-pressed="false">
                  <span class="inline-choice-indicator" aria-hidden="true"></span>
                  <span class="inline-choice-label">International Registrar</span>
                </button>
              </div>
              <span id="applicantTypeHint" class="hint">Kenya is used automatically for local applications.</span>
            </div>

            <label class="profile-country-field">
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

          <div class="profile-selection-bar">
            <span class="profile-selection-kicker">Selected pathway</span>
            <div class="profile-selection-summary" aria-live="polite">
              <strong id="applicationProfileApplicantType">Local Registrar</strong>
              <span class="profile-selection-separator" aria-hidden="true"></span>
              <strong id="applicationProfileCountry">Kenya</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="portal-entry-grid">
        <article class="portal-entry-card">
          <div class="portal-entry-card-head">
            <span class="portal-entry-badge">What you'll provide</span>
            <span class="portal-entry-meta">Application</span>
          </div>
          <div class="portal-entry-list">
            <div class="portal-entry-item">
              <span class="portal-entry-item-kicker">Identity</span>
              <strong id="portalOverviewIdentityTitle">Kenyan applicant and company details</strong>
              <p id="portalOverviewIdentityDescription">Provide the applicant identity, contact person, Kenyan company registration, and tax information.</p>
            </div>
            <div class="portal-entry-item">
              <span class="portal-entry-item-kicker">Operations</span>
              <strong>Business and service capability</strong>
              <p>Describe your domain operations, support processes, billing systems, and security controls.</p>
            </div>
            <div class="portal-entry-item">
              <span class="portal-entry-item-kicker">Technical</span>
              <strong>Domain administration setup</strong>
              <p>Capture name servers, billing contacts, and administrative contacts for the registrar workflow.</p>
            </div>
            <div class="portal-entry-item">
              <span class="portal-entry-item-kicker">Review</span>
              <strong>Legal declaration and documents</strong>
              <p>Declaration, supporting documents, and final submission.</p>
            </div>
          </div>
        </article>

        <article class="portal-entry-card">
          <div class="portal-entry-card-head">
            <span class="portal-entry-badge is-secondary">Required documents</span>
            <span id="portalChecklistMeta" class="portal-entry-meta">5 documents</span>
          </div>
          <div id="portalChecklistPreview" class="portal-entry-list"></div>
        </article>
      </div>

      <div class="portal-entry-actions">
        <button id="portalProceedButton" type="button" class="secondary">Continue</button>
      </div>

      <div class="flash" id="flashBox"></div>
    </section>

    <div id="portalMainExperience" class="portal-main-experience" hidden>
      <section class="flow-header">
        <div class="flow-header-copy">
          <div id="flowCurrentStepLabel" class="section-kicker">Section A</div>
          <h2 id="flowCurrentStepTitle">General Information</h2>
          <p id="flowCurrentStepDescription">Applicant and contact details.</p>
          <div id="flowProfileContext" class="flow-profile-context" hidden>
            <span class="flow-profile-context-label">Selected pathway:</span>
            <strong id="flowProfileContextValue">Local Registrar • Kenya</strong>
          </div>
        </div>
        <div class="flow-header-meta">
          <div id="flowStepCounter" class="flow-step-counter">Step 1 of 8</div>
          <div class="flow-progress-track" aria-hidden="true">
            <span id="flowProgressValue" class="flow-progress-value"></span>
          </div>
        </div>
        <div id="flowStepTabs" class="flow-step-tabs" aria-label="Application steps"></div>
      </section>

      <div id="applicationFlow" class="application-flow is-paged">
      <section class="application-section is-current" data-flow-section="SECTION_A_GENERAL_INFORMATION">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section A</div>
            <h2>General Information</h2>
            <p>Applicant and contact details.</p>
            <div class="mini-pill pending section-status" data-section-status="SECTION_A_GENERAL_INFORMATION">Not started</div>
          </div>
          <div class="section-main">
            <form data-section="SECTION_A_GENERAL_INFORMATION">
              <div class="section-group">
                <h3 class="section-group-title">1. Applicant Information</h3>
                <div class="row">
                  <label>Name of Applicant<span class="required-mark">*</span><input name="nameOfApplicant" placeholder="Name of Applicant" /></label>
                  <label>Company Name<span class="required-mark">*</span><input name="companyName" placeholder="Company Name" /></label>
                </div>
                <div class="row">
                  <label>Company PIN Number / Tax Identification Number (TIN)<span class="required-mark">*</span><input name="companyTin" placeholder="Company PIN Number / Tax Identification Number (TIN)" /><span class="hint">Kenyan applicants: KRA PIN. International applicants: provide your country's equivalent tax identification number.</span></label>
                  <label>Address of Applicant<span class="required-mark">*</span><textarea name="addressOfApplicant" placeholder="Address of Applicant"></textarea></label>
                </div>
                <div class="row">
                  <label>Company Registration Number<span class="required-mark">*</span><input name="companyRegistrationNumber" placeholder="Company Registration Number" /><span class="hint">International applicants: provide your equivalent company or business registration number.</span></label>
                  <label>
                    Telephone Number<span class="required-mark">*</span>
                    <div class="input-with-prefix">
                      <span id="telephoneNumberPrefix" class="input-prefix">🇰🇪 +254</span>
                      <input
                        name="telephoneNumber"
                        type="tel"
                        inputmode="tel"
                        autocomplete="tel"
                        maxlength="30"
                        placeholder="712 345 678"
                      />
                    </div>
                    <span id="telephoneNumberHint" class="hint">For Kenya, enter the number in +254 or 0XXXXXXXXX format.</span>
                  </label>
                </div>
                <div class="row">
                  <label>Email Address<span class="required-mark">*</span><input name="emailAddress" type="email" maxlength="254" autocomplete="email" placeholder="Email Address" /></label>
                  <label>Website URL (.KE)<span class="required-mark">*</span><input name="websiteUrl" type="url" inputmode="url" autocapitalize="none" spellcheck="false" autocomplete="url" placeholder="https://example.ke" /></label>
                </div>
              </div>

              <div class="section-group">
                <h3 class="section-group-title">2. Contact Person Information</h3>
                <div class="row">
                  <label>Contact Person<span class="required-mark">*</span><input name="contactPerson" placeholder="Contact Person" /></label>
                  <label>
                    Contact Person's Telephone Number<span class="required-mark">*</span>
                    <div class="input-with-prefix">
                      <span id="contactPersonTelephoneNumberPrefix" class="input-prefix">🇰🇪 +254</span>
                      <input
                        name="contactPersonTelephoneNumber"
                        type="tel"
                        inputmode="tel"
                        autocomplete="tel"
                        maxlength="30"
                        placeholder="712 345 678"
                      />
                    </div>
                    <span id="contactPersonTelephoneNumberHint" class="hint">Between 7 and 15 digits including the country code where applicable.</span>
                  </label>
                  <label>Email Address of Contact Person<span class="required-mark">*</span><input name="contactPersonEmailAddress" type="email" maxlength="254" autocomplete="email" placeholder="Email Address of Contact Person" /></label>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section class="application-section" data-flow-section="SECTION_B_BUSINESS_INFORMATION">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section B</div>
            <h2>Business Information</h2>
            <p>Operations, support, billing, and security.</p>
            <div class="mini-pill pending section-status" data-section-status="SECTION_B_BUSINESS_INFORMATION">Not started</div>
          </div>
          <div class="section-main">
            <form data-section="SECTION_B_BUSINESS_INFORMATION" class="stack">
              <div class="section-group">
                <label>Previous experience in domain name registration<span class="required-mark">*</span><textarea name="experienceDescription" placeholder="Describe your current reseller operations"></textarea></label>
                <div class="row">
                  <label>Number of domains currently under your management (.ke and other)<span class="required-mark">*</span><input name="numberOfDomainsUnderManagement" type="text" inputmode="numeric" pattern="[0-9]*" data-input-kind="whole-number" autocomplete="off" placeholder="0" /></label>
                  <label>Average number of monthly registrations (.ke and other)<span class="required-mark">*</span><input name="averageMonthlyRegistrations" type="text" inputmode="numeric" pattern="[0-9]*" data-input-kind="whole-number" autocomplete="off" placeholder="0" /></label>
                </div>
                <label>Other related services you provide<span class="required-mark">*</span><textarea name="otherRelatedServices" placeholder="Other related services you provide"></textarea></label>
              </div>
              <label>Management, communication, and information processing systems<span class="required-mark">*</span><textarea name="managementSystems" placeholder="Include the system link or URL"></textarea></label>
              <label>Policy compliance checks for registrations<span class="required-mark">*</span><textarea name="policyComplianceSystems" placeholder="Provide detailed information"></textarea></label>
              <label>Customer enquiries and support services<span class="required-mark">*</span><textarea name="supportSystems" placeholder="Include system link, email address, and phone numbers"></textarea></label>
              <label>Customer billing systems and procedures<span class="required-mark">*</span><textarea name="billingSystems" placeholder="Include system link"></textarea></label>
              <label>Customer complaints systems and procedures<span class="required-mark">*</span><textarea name="complaintsSystems" placeholder="Include email address and phone numbers"></textarea></label>
              <label>Arrangements with domain name resellers<span class="required-mark">*</span><textarea name="resellerArrangements" placeholder="Describe any arrangements with domain name resellers"></textarea></label>
              <label>Information systems security procedures and capability<span class="required-mark">*</span><textarea name="securityCapability" placeholder="Provide detailed information"></textarea></label>
            </form>
          </div>
        </div>
      </section>

      <section class="application-section" data-flow-section="SECTION_C_DOMAIN_ADMINISTRATION">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section C</div>
            <h2>Domain Administration</h2>
            <p>Nameservers and key contacts.</p>
            <div class="mini-pill pending section-status" data-section-status="SECTION_C_DOMAIN_ADMINISTRATION">Not started</div>
          </div>
          <div class="section-main">
            <form data-section="SECTION_C_DOMAIN_ADMINISTRATION">
              <div class="row">
                <label>NS 1<span class="required-mark">*</span><input name="ns1" autocapitalize="none" spellcheck="false" placeholder="NS 1" /></label>
                <label>NS 2<span class="required-mark">*</span><input name="ns2" autocapitalize="none" spellcheck="false" placeholder="NS 2" /></label>
              </div>
              <div class="row">
                <label>Admin Contact<span class="required-mark">*</span><input name="adminContact" placeholder="Admin Contact" /></label>
                <label>Admin Email<span class="required-mark">*</span><input name="adminEmail" type="email" maxlength="254" autocomplete="email" placeholder="Admin Email" /></label>
              </div>
              <div class="row">
                <label>Billing Contact<span class="required-mark">*</span><input name="billingContact" placeholder="Billing Contact" /></label>
                <label>Billing Email<span class="required-mark">*</span><input name="billingEmail" type="email" maxlength="254" autocomplete="email" placeholder="Billing Email" /></label>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section class="application-section" data-flow-section="SECTION_D_BUSINESS_DEVELOPMENT">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section D</div>
            <h2>Business Development</h2>
            <p>Target market and growth plans.</p>
            <div class="mini-pill pending section-status" data-section-status="SECTION_D_BUSINESS_DEVELOPMENT">Not started</div>
          </div>
          <div class="section-main">
            <form data-section="SECTION_D_BUSINESS_DEVELOPMENT" class="stack">
              <label>What is your target market?<span class="required-mark">*</span><textarea name="targetMarket" placeholder="What is your target market?"></textarea></label>
              <label>Which Third Level Domains will you be selling?<span class="required-mark">*</span><textarea name="thirdLevelDomains" placeholder="List all Third Level Domains"></textarea></label>
              <div class="row">
                <div class="field-block">
                  <div class="field-label-row">
                    <span>Do you intend to sell Second Level Domains?<span class="required-mark">*</span></span>
                  </div>
                  <select
                    name="intendsSecondLevelSales"
                    class="visually-hidden-control"
                    tabindex="-1"
                    aria-hidden="true"
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                  <div class="inline-choice-group" role="radiogroup" aria-label="Second Level Domain sales">
                    <button type="button" class="inline-choice" data-second-level-sales-option="false" aria-pressed="true">
                      <span class="inline-choice-indicator" aria-hidden="true"></span>
                      <span class="inline-choice-label">No</span>
                    </button>
                    <button type="button" class="inline-choice" data-second-level-sales-option="true" aria-pressed="false">
                      <span class="inline-choice-indicator" aria-hidden="true"></span>
                      <span class="inline-choice-label">Yes</span>
                    </button>
                  </div>
                </div>
                <label>If yes, what strategies do you intend to use?<span class="required-mark">*</span><textarea name="secondLevelSalesStrategy" placeholder="If yes, what strategies do you intend to use?"></textarea></label>
              </div>
              <label>Are you currently a Registrar for other domains?<span class="required-mark">*</span><textarea name="otherRegistrarDomains" placeholder="List the domains if applicable"></textarea></label>
              <label>What volume of .KE registrations do you reasonably project to do per month?<span class="required-mark">*</span><input name="projectedMonthlyKeRegistrations" type="text" inputmode="numeric" pattern="[0-9]*" data-input-kind="whole-number" autocomplete="off" placeholder="0" /></label>
              <label>What strategies will you use to promote the uptake of .KE domains?<span class="required-mark">*</span><textarea name="promotionStrategy" placeholder="What strategies will you use to promote the uptake of .KE domains?"></textarea></label>
              <label>Where will you operate your business from?<span class="required-mark">*</span><textarea name="businessLocation" placeholder="Include location, building, and address"></textarea></label>
            </form>
          </div>
        </div>
      </section>

      <section class="application-section" data-flow-section="SECTION_E_LEGAL_STRUCTURE">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section E</div>
            <h2>Legal Structure</h2>
            <p>Ownership and legal disclosures.</p>
            <div class="mini-pill pending section-status" data-section-status="SECTION_E_LEGAL_STRUCTURE">Not started</div>
          </div>
          <div class="section-main">
            <form data-section="SECTION_E_LEGAL_STRUCTURE" class="stack">
              <label>Company Ownership<span class="required-mark">*</span><textarea name="companyOwnership" placeholder="Company Ownership"></textarea></label>
              <label>Have any of the directors, shareholders, or relevant staff of your business entity been convicted of an offence relating to dishonesty?<span class="required-mark">*</span><textarea name="dishonestyConvictionDetails" placeholder="Provide details. If none, state None."></textarea></label>
            </form>
          </div>
        </div>
      </section>

      <section class="application-section" data-flow-section="SECTION_F_DECLARATION">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section F</div>
            <h2>Declaration</h2>
            <p>Review and confirm the declaration.</p>
            <div class="mini-pill pending section-status" data-section-status="SECTION_F_DECLARATION">Not started</div>
          </div>
          <div class="section-main">
            <div class="declaration-box">
              <div class="declaration-item">All information contained in this application form and supporting documents is true and accurate to the best of my knowledge.</div>
              <div class="declaration-item">I have read and understood KeNIC's Registrar Agreement and Published Policies.</div>
              <div class="declaration-item">I understand KeNIC may carry out due diligence and verify the information provided in this application.</div>
              <div class="declaration-item">I give KeNIC permission to contact third parties, request additional information where necessary, and verify the information contained in this application.</div>
              <div class="declaration-item">I waive liability on the part of KeNIC for its actions in verifying the information provided, and on the part of any third parties who provide truthful, material, relevant information as requested.</div>
            </div>
            <form data-section="SECTION_F_DECLARATION">
              <div class="row">
                <label>Full Legal Name of Applicant<span class="required-mark">*</span><input name="fullLegalNameOfApplicant" placeholder="Full Legal Name of Applicant" /></label>
                <label>Representative Signature<span class="required-mark">*</span><input name="representativeSignature" placeholder="Representative Signature" /></label>
              </div>
              <div class="row">
                <label>Name Title<span class="required-mark">*</span><input name="nameTitle" placeholder="Name Title" /></label>
                <label>Contact Person<span class="required-mark">*</span><input name="contactPerson" placeholder="Contact Person" /></label>
                <label>Date of Signature<span class="required-mark">*</span><input name="dateOfSignature" type="date" /></label>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section class="application-section" data-flow-section="SECTION_G_SUPPORTING_DOCUMENTS">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section G</div>
            <h2>Supporting Documents</h2>
            <p>Required uploads.</p>
          </div>
          <div class="section-main">
            <div id="documentUploadFeedback" class="submission-feedback info">Save your application profile first to unlock document uploads.</div>
            <div id="documentRequirementsList" class="list"></div>
          </div>
        </div>
      </section>

      <section class="application-section" data-flow-section="FINAL_REVIEW">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Final step</div>
            <h2>Ready to submit</h2>
            <p>Submit when ready.</p>
          </div>
          <div class="section-main">
            <div class="submission-box">
              <div id="submissionFeedback" class="submission-feedback" aria-live="polite">Submit when ready.</div>
              <div class="toolbar">
                <button id="submitApplicationButton" type="button" disabled>Submit</button>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>

    <div id="profileSwitchOverlay" class="profile-switch-overlay" aria-hidden="true" hidden>
      <div
        class="profile-switch-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profileSwitchTitle"
        aria-describedby="profileSwitchDescription"
      >
        <div class="profile-switch-dialog-copy">
          <div class="section-kicker">Change profile</div>
          <h3 id="profileSwitchTitle">Start a fresh application?</h3>
          <p id="profileSwitchDescription">Switching the profile now clears the current application details and uploaded documents so the new pathway can start cleanly.</p>
        </div>
        <div class="profile-switch-compare">
          <div class="profile-switch-state">
            <span>Current</span>
            <strong id="profileSwitchCurrentValue">Local Registrar • Kenya</strong>
          </div>
          <span class="profile-switch-arrow" aria-hidden="true"></span>
          <div class="profile-switch-state">
            <span>New</span>
            <strong id="profileSwitchNextValue">International Registrar • Brazil</strong>
          </div>
        </div>
        <div class="profile-switch-note">You can keep the current application, or continue with the updated pathway.</div>
        <div class="profile-switch-actions">
          <button id="profileSwitchCancel" type="button" class="ghost">Keep current</button>
          <button id="profileSwitchConfirm" type="button" class="secondary">Start fresh</button>
        </div>
      </div>
    </div>
    <template id="portalBootData">${serializeForScript({
      portalStatus: options.portalStatus ?? getDefaultPortalStatus(),
    })}</template>
  `;

  return body;
};

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
    const uiStateKey = stateKey + ".ui";
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
    let committedProfileState = { applicantType: "local", country: "Kenya" };
    let profileSwitchRequest = null;
    let visibleCountrySuggestions = [];
    let activeCountrySuggestionIndex = -1;
    let portalFlowUnlocked = false;
    let portalStatusPollTimer = null;
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
    const portalChecklistMeta = document.getElementById("portalChecklistMeta");
    const portalChecklistPreview = document.getElementById("portalChecklistPreview");
    const portalOverviewIdentityTitle = document.getElementById("portalOverviewIdentityTitle");
    const portalOverviewIdentityDescription = document.getElementById("portalOverviewIdentityDescription");
    const portalProceedButton = document.getElementById("portalProceedButton");
    const portalMainExperience = document.getElementById("portalMainExperience");
    const portalStatusBanner = document.getElementById("portalStatusBanner");
    const portalStatusTitle = document.getElementById("portalStatusTitle");
    const portalStatusReason = document.getElementById("portalStatusReason");
    const portalStatusMeta = document.getElementById("portalStatusMeta");
    const profileSetupPanel = document.querySelector(".profile-setup-panel");
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
          "You selected the Kenyan registrar pathway. This application is for registrars incorporated in Kenya.",
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
          "You selected the international registrar pathway. This application is for registrars incorporated outside Kenya.",
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

    function getPortalPreviewProfileKey() {
      return applicantTypeInput?.value === "international" ? "international" : "local";
    }

    function getPortalPreviewConfig() {
      return PORTAL_ENTRY_PREVIEW[getPortalPreviewProfileKey()] || PORTAL_ENTRY_PREVIEW.local;
    }

    function getApplicantTypeSelectionHint(lockIdentity = Boolean(state.applicationId)) {
      const preview = getPortalPreviewConfig();
      const isLocal = applicantTypeInput?.value !== "international";

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
      if (applicantTypeInput?.value !== "international") {
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

      if (portalChecklistMeta) {
        portalChecklistMeta.textContent = preview.documents.length + " documents";
      }
    }

    function syncPortalEntryPreview() {
      const preview = getPortalPreviewConfig();

      if (portalOverviewIdentityTitle) {
        portalOverviewIdentityTitle.textContent = preview.overviewIdentityTitle;
      }
      if (portalOverviewIdentityDescription) {
        portalOverviewIdentityDescription.textContent = preview.overviewIdentityDescription;
      }
      if (portalProceedButton) {
        portalProceedButton.textContent = portalFlowUnlocked
          ? "Return to application"
          : preview.continueLabel;
        portalProceedButton.disabled = portalFlowUnlocked
          ? false
          : isPortalInactive() || !isOnboardingProfileReady();
      }

      renderPortalChecklistPreview();
    }

    function setPortalEntryCompact(compact = false) {
      portalEntry?.classList.toggle("is-compact", compact);
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
          const rawCountry = getRawCountrySelection();
          const message = !rawCountry
            ? "Choose the country of incorporation to continue."
            : isBlockedInternationalCountry(rawCountry)
              ? "Kenya is only available for local registrar applications."
              : "Choose a country from the suggested list to continue.";
          setFlash(message, true);
          scrollToProfileSetup();
          return false;
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
            error?.message === "COUNTRY_OF_INCORPORATION_REQUIRED"
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
        const heading = sectionNode.querySelector(".section-rail h2");
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
              applicantType: applicantTypeInput?.value || "local",
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
      return value === "international" ? "International Registrar" : "Local Registrar";
    }

    function getProfileState(overrides = {}) {
      const applicantType = hasOwn(overrides, "applicantType")
        ? (overrides.applicantType === "international" ? "international" : "local")
        : (applicantTypeInput?.value === "international" ? "international" : "local");
      const rawCountry = hasOwn(overrides, "country")
        ? String(overrides.country || "").trim()
        : String(countryOfIncorporationInput?.value || "").trim();

      return {
        applicantType,
        country: applicantType === "local"
          ? "Kenya"
          : String(resolveCountryOption(rawCountry, true) || rawCountry || "").trim(),
      };
    }

    function getProfileFingerprint(profile = getProfileState()) {
      return profile.applicantType + "::" + normalizeCountryName(profile.country || "");
    }

    function formatProfileLabel(profile = getProfileState()) {
      const normalizedProfile = getProfileState(profile);
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
      const value = applicantTypeInput?.value === "international" ? "international" : "local";

      applicantTypeOptionButtons.forEach((button) => {
        const selected = button.getAttribute("data-applicant-type-option") === value;
        button.dataset.selected = selected ? "true" : "false";
        button.setAttribute("aria-pressed", selected ? "true" : "false");
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
      const applicantTypeLabel = getApplicantTypeLabel(applicantTypeInput?.value);
      if (applicationProfileApplicantType) {
        applicationProfileApplicantType.textContent = applicantTypeLabel;
      }

      const rawCountry = String(countryOfIncorporationInput?.value || "").trim();
      const resolvedCountry = resolveCountryOption(countryOfIncorporationInput?.value);
      const countryLabel = applicantTypeInput?.value === "local"
        ? "Kenya"
        : isBlockedInternationalCountry(rawCountry)
          ? "Choose another country"
          : resolvedCountry || rawCountry || "Select country before submission";

      if (applicationProfileCountry) {
        applicationProfileCountry.textContent = countryLabel;
      }
      if (flowProfileContextValue) {
        flowProfileContextValue.textContent = applicantTypeLabel + " • " + countryLabel;
      }
    }

    function syncCountryFieldState(lockIdentity = Boolean(state.applicationId)) {
      if (!applicantTypeInput || !countryOfIncorporationInput) {
        return;
      }

      const isLocal = applicantTypeInput.value === "local";
      const wasAutoLocal = countryOfIncorporationInput.dataset.autoLocal === "true";

      if (isLocal) {
        countryOfIncorporationInput.value = "Kenya";
        countryOfIncorporationInput.dataset.autoLocal = "true";
      } else if (wasAutoLocal && normalizeCountryName(countryOfIncorporationInput.value) === "kenya") {
        countryOfIncorporationInput.value = "";
        countryOfIncorporationInput.dataset.autoLocal = "false";
      } else if (!wasAutoLocal) {
        countryOfIncorporationInput.dataset.autoLocal = "false";
      }

      applicantTypeInput.disabled = false;
      countryOfIncorporationInput.disabled = isLocal;
      profileSetupPanel?.classList.remove("is-locked");

      if (applicantTypeHint) {
        applicantTypeHint.textContent = getApplicantTypeSelectionHint(lockIdentity);
      }

      updateCountrySuggestions(countryOfIncorporationInput.value);
      updateCountrySearchFeedback();
      refreshPhoneFieldDecorators();
      syncApplicantTypeControls();
      updateApplicationProfileSummary();
      syncPortalEntryPreview();

      if (isLocal) {
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

    function resetLockedPortal() {
      resetPortalStateForNewApplication();
      setFormsEnabled(true);
      setSavingState(false);
      setSubmittingState(false);
      setActivationState("idle");
      setFlowVisualState("active");
      setPortalFlowUnlocked(false);
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
        INVALID_FILE_ENCODING:
          "We could not read the selected document. Choose it again and try once more.",
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
        COUNTRY_OF_INCORPORATION_NOT_ALLOWED_FOR_INTERNATIONAL:
          "Kenya is only allowed for local registrar applications. Choose a different country for an international registrar.",
        COUNTRY_OF_INCORPORATION_TOO_LONG:
          "Country of incorporation is too long. Search and select a shorter country name.",
        APPLICATION_ALREADY_SUBMITTED:
          "This application has already been submitted and is now read-only.",
        APPLICATION_ALREADY_EXISTS_FOR_COMPANY:
          "An application already exists for this company PIN or registration number. Use the earlier application or contact support.",
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

      const applicantType = applicantTypeInput?.value || "local";
      const country = normalizeCountrySelection();

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
        setFlash(
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
      setPortalFlowUnlocked(false);
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
      revealFlowSection(getPreferredFlowSectionCode(), { remember: false });
      void refreshPortalOperationalStatus({ silent: true });
      startPortalStatusPolling();

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

      portalProceedButton?.addEventListener("click", () => {
        openPortalMainExperience();
      });

      const restoreMessage = restoreSessionState();

      if (state.applicationId) {
        try {
          await hydrate(restoreMessage);
          schedulePortalViewportRestore({ delay: 0 });
          return;
        } catch (error) {
          clearStoredApplicationState();
          setFlash(
            getFriendlyErrorMessage(
              error,
              "We could not reopen the application. Please start again."
            ),
            true
          );
          return;
        }
      }

      resetLockedPortal();
      clearLocalDraft("");
      clearPortalUiState();
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

export const renderPortalPage = (options: {
  nonce?: string;
  portalStatus?: PortalStatusViewModel;
} = {}) => {
  const body = buildPortalBody(
    options.portalStatus
      ? { portalStatus: options.portalStatus }
      : {}
  );

  return renderShell({
    eyebrow: "",
    title: "KeNIC Registrar Accreditation",
    titleHtml:
      '<span class="hero-title-primary">KeNIC</span> <span class="hero-title-muted">Registrar</span> <span class="hero-title-secondary">Accreditation</span>',
    description:
      "Complete the registrar accreditation application.",
    body,
    scriptSrc: `./portal/client.js?v=${encodeURIComponent(options.nonce || "portal-client")}`,
    ...(options.nonce ? { nonce: options.nonce } : {}),
  });
};
