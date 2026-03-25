import {
  COUNTRY_OF_INCORPORATION_MAX_LENGTH,
  SECTION_FIELD_MAX_LENGTHS,
} from "../utils/sections.js";
import { renderShell } from "./shared.js";

export const renderPortalPage = () => {
  const body = `
    <section class="start-panel">
      <div class="start-intro">
        <div class="section-kicker">Registrar Application</div>
        <h2>Start your registrar application</h2>
        <p>Select the registrar type once, confirm the country of incorporation where needed, then continue directly to Section A and complete the form for review.</p>
      </div>

      <div class="row">
        <div class="field-block applicant-type-field">
          <div>Applicant Type<span class="required-mark">*</span></div>
          <select id="applicantType" class="visually-hidden-control" tabindex="-1" aria-hidden="true">
            <option value="local">Local Registrar</option>
            <option value="international">International Registrar</option>
          </select>
          <button
            id="applicantTypeTrigger"
            type="button"
            class="palette-trigger"
            aria-haspopup="dialog"
            aria-expanded="false"
            aria-controls="applicantTypeDialog"
          >
            <span class="palette-trigger-kicker">Registrar type</span>
            <strong id="applicantTypeDisplay">Local Registrar</strong>
            <span id="applicantTypeSummary" class="palette-trigger-summary">Kenya is used automatically for local applications.</span>
            <span class="palette-trigger-action">Choose registrar type</span>
          </button>
          <span id="applicantTypeHint" class="hint">Local applications use Kenya.</span>
          <dialog id="applicantTypeDialog" class="palette-dialog" aria-labelledby="applicantTypeDialogTitle">
            <div class="palette-dialog-shell">
              <div class="palette-dialog-header">
                <div class="section-kicker">Applicant Profile</div>
                <h3 id="applicantTypeDialogTitle">Choose registrar type</h3>
                <p>Select the profile that best matches this application. You can switch it any time before the application starts.</p>
              </div>
              <div class="palette-options">
                <button type="button" class="palette-option" data-applicant-type-option="local" aria-pressed="true">
                  <span class="palette-option-badge">Local</span>
                  <strong>Local Registrar</strong>
                  <p>Best for Kenya-based applicants. Kenya is filled automatically and the phone guidance stays local-friendly.</p>
                </button>
                <button type="button" class="palette-option" data-applicant-type-option="international" aria-pressed="false">
                  <span class="palette-option-badge">International</span>
                  <strong>International Registrar</strong>
                  <p>Best for applicants outside Kenya. You will choose the country of incorporation and get international phone guidance.</p>
                </button>
              </div>
              <div class="palette-dialog-footer">
                <button id="applicantTypeClose" type="button" class="ghost">Close</button>
              </div>
            </div>
          </dialog>
        </div>
        <label>
          Country of Incorporation
          <input
            id="countryOfIncorporation"
            list="countrySuggestions"
            maxlength="${COUNTRY_OF_INCORPORATION_MAX_LENGTH}"
            autocomplete="country-name"
            placeholder="Type to search for a country"
          />
          <datalist id="countrySuggestions"></datalist>
          <span id="countryOfIncorporationHint" class="hint">Start typing to search for the country of incorporation.</span>
          <span id="countrySearchFeedback" class="hint">Matching countries will appear as you type.</span>
        </label>
      </div>

      <div class="activation-panel">
        <div class="activation-copy">
          <div id="activationIndicator" class="activation-badge" aria-hidden="true">1</div>
          <div class="activation-copy-body">
            <div class="section-kicker">Next Step</div>
            <h2>Continue with Section A</h2>
            <p>Your registrar type and country are used throughout the form and become fixed once the application starts.</p>
          </div>
        </div>
        <div class="activation-actions">
          <div id="activationHint" class="hint">Set the registrar type and country above, then continue below with Section A.</div>
          <div class="profile-summary-grid">
            <div class="profile-summary-card">
              <span>Registrar Type</span>
              <strong id="applicationProfileApplicantType">Local Registrar</strong>
            </div>
            <div class="profile-summary-card">
              <span>Country</span>
              <strong id="applicationProfileCountry">Kenya</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="flash" id="flashBox">Continue below with Section A: General Information.</div>
    </section>

    <div id="applicationFlow" class="application-flow">
      <section class="application-section">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section A</div>
            <h2>General Information</h2>
            <p>Provide the required applicant and contact person information.</p>
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

      <section class="application-section">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section B</div>
            <h2>Business Information</h2>
            <p>Provide the required business information.</p>
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

      <section class="application-section">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section C</div>
            <h2>Domain Administration</h2>
            <p>Provide the required domain administration information.</p>
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

      <section class="application-section">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section D</div>
            <h2>Business Development</h2>
            <p>Provide the required business development information.</p>
            <div class="mini-pill pending section-status" data-section-status="SECTION_D_BUSINESS_DEVELOPMENT">Not started</div>
          </div>
          <div class="section-main">
            <form data-section="SECTION_D_BUSINESS_DEVELOPMENT" class="stack">
              <label>What is your target market?<span class="required-mark">*</span><textarea name="targetMarket" placeholder="What is your target market?"></textarea></label>
              <label>Which Third Level Domains will you be selling?<span class="required-mark">*</span><textarea name="thirdLevelDomains" placeholder="List all Third Level Domains"></textarea></label>
              <div class="row">
                <label>
                  <span>Do you intend to sell Second Level Domains?<span class="required-mark">*</span></span>
                  <select name="intendsSecondLevelSales">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </label>
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

      <section class="application-section">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section E</div>
            <h2>Legal Structure</h2>
            <p>Provide the required legal structure information.</p>
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

      <section class="application-section">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section F</div>
            <h2>Declaration</h2>
            <p>Review the declaration below and provide the confirmation details required for submission.</p>
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

      <section class="application-section">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Section G</div>
            <h2>Supporting Documents</h2>
            <p>Upload services are temporarily unavailable.</p>
          </div>
          <div class="section-main">
            <div class="info-box compact">
              <div class="stack">
                <strong>Form upload services are currently unavailable.</strong>
                <div class="subtle">Update in progress. Please continue with submission.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="application-section">
        <div class="application-shell">
          <div class="section-rail">
            <div class="section-step">Final step</div>
            <h2>Ready to submit</h2>
            <p>Review your entries, confirm the declaration, and submit when you are ready.</p>
          </div>
          <div class="section-main">
            <div class="submission-box">
              <div class="subtle">Review the completed form and submit when you are ready.</div>
              <div id="submissionFeedback" class="submission-feedback" aria-live="polite">Complete the form below and submit when you are ready.</div>
              <div class="toolbar">
                <button id="submitApplicationButton" type="button" disabled>Submit</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  const scripts = `
    const stateKey = "dotke.onboard.portal";
    const draftStateKeyPrefix = stateKey + ".draft.";
    const pendingDraftStorageKey = draftStateKeyPrefix + "pending";
    const fieldMaxLengths = ${JSON.stringify(SECTION_FIELD_MAX_LENGTHS)};
    const state = { applicationId: "", draftToken: "", resumeToken: "", resumeCode: "" };
    let latestBundle = getEmptyBundle();
    let formsEnabled = false;
    let savingApplication = false;
    let submittingApplication = false;
    let sectionHighlightTimer = null;
    let localDraftSaveTimer = null;

    const flashBox = document.getElementById("flashBox");
    const activationIndicator = document.getElementById("activationIndicator");
    const activationHint = document.getElementById("activationHint");
    const applicationFlow = document.getElementById("applicationFlow");
    const submitApplicationButton = document.getElementById("submitApplicationButton");
    const submissionFeedback = document.getElementById("submissionFeedback");
    const applicantTypeInput = document.getElementById("applicantType");
    const applicantTypeTrigger = document.getElementById("applicantTypeTrigger");
    const applicantTypeDisplay = document.getElementById("applicantTypeDisplay");
    const applicantTypeSummary = document.getElementById("applicantTypeSummary");
    const applicantTypeHint = document.getElementById("applicantTypeHint");
    const applicantTypeDialog = document.getElementById("applicantTypeDialog");
    const applicantTypeClose = document.getElementById("applicantTypeClose");
    const applicantTypeOptionButtons = Array.from(
      document.querySelectorAll("[data-applicant-type-option]")
    );
    const countryOfIncorporationInput = document.getElementById("countryOfIncorporation");
    const countrySuggestions = document.getElementById("countrySuggestions");
    const countryOfIncorporationHint = document.getElementById("countryOfIncorporationHint");
    const countrySearchFeedback = document.getElementById("countrySearchFeedback");
    const applicationProfileApplicantType = document.getElementById("applicationProfileApplicantType");
    const applicationProfileCountry = document.getElementById("applicationProfileCountry");
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
    const sectionStatusNodes = Object.fromEntries(
      Array.from(document.querySelectorAll("[data-section-status]")).map((node) => [
        node.getAttribute("data-section-status"),
        node,
      ])
    );
    const SECTION_META = {
      SECTION_A_GENERAL_INFORMATION: { label: "Section A: General Information" },
      SECTION_B_BUSINESS_INFORMATION: { label: "Section B: Business Information" },
      SECTION_C_DOMAIN_ADMINISTRATION: { label: "Section C: Domain Administration" },
      SECTION_D_BUSINESS_DEVELOPMENT: { label: "Section D: Business Development" },
      SECTION_E_LEGAL_STRUCTURE: { label: "Section E: Legal Structure" },
      SECTION_F_DECLARATION: { label: "Section F: Declaration" },
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

    function isRecord(value) {
      return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    function getEmptyBundle() {
      return {
        application: null,
        sections: [],
        checklist: {
          sections: [],
          documents: [],
        },
        documents: [],
      };
    }

    function normalizeBundle(bundle) {
      const safeBundle = isRecord(bundle) ? bundle : {};
      const safeChecklist = isRecord(safeBundle.checklist) ? safeBundle.checklist : {};

      return {
        ...getEmptyBundle(),
        ...safeBundle,
        sections: Array.isArray(safeBundle.sections) ? safeBundle.sections : [],
        checklist: {
          sections: Array.isArray(safeChecklist.sections) ? safeChecklist.sections : [],
          documents: Array.isArray(safeChecklist.documents) ? safeChecklist.documents : [],
        },
        documents: Array.isArray(safeBundle.documents) ? safeBundle.documents : [],
      };
    }

    function saveState() {
      try {
        localStorage.setItem(stateKey, JSON.stringify(state));
      } catch {}
    }

    function loadStoredState() {
      try {
        const raw = localStorage.getItem(stateKey);
        if (!raw) {
          return;
        }

        const parsed = JSON.parse(raw);
        if (!isRecord(parsed)) {
          return;
        }

        state.applicationId = typeof parsed.applicationId === "string" ? parsed.applicationId : "";
        state.draftToken = typeof parsed.draftToken === "string" ? parsed.draftToken : "";
        state.resumeToken = typeof parsed.resumeToken === "string" ? parsed.resumeToken : "";
        state.resumeCode = typeof parsed.resumeCode === "string" ? parsed.resumeCode : "";
      } catch {}
    }

    function getDraftStorageKey(applicationId = state.applicationId) {
      return applicationId ? draftStateKeyPrefix + applicationId : pendingDraftStorageKey;
    }

    function loadLocalDraft(applicationId = state.applicationId) {
      const draftKey = getDraftStorageKey(applicationId);
      if (!draftKey) {
        return null;
      }

      try {
        const raw = localStorage.getItem(draftKey);
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
        localStorage.removeItem(draftKey);
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
        localStorage.removeItem(pendingDraftStorageKey);
      } catch {}
    }

    function persistLocalDraftNow() {
      const draftKey = getDraftStorageKey();
      if (!draftKey) {
        return;
      }

      try {
        localStorage.setItem(
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
      ) {
        return;
      }

      currentUrl.searchParams.delete("applicationId");
      currentUrl.searchParams.delete("token");
      const nextUrl = currentUrl.pathname + currentUrl.search + currentUrl.hash;
      window.history.replaceState({}, document.title, nextUrl);
    }

    function restoreSessionState() {
      const params = new URLSearchParams(window.location.search);
      const applicationId = String(params.get("applicationId") || "").trim();
      const token = String(params.get("token") || "").trim();

      if (applicationId && token) {
        state.applicationId = applicationId;
        state.draftToken = "";
        state.resumeToken = token;
        state.resumeCode = "";
        saveState();
        clearResumeQueryParams();
        return "Saved application reopened.";
      }

      loadStoredState();
      if (state.applicationId && (state.draftToken || state.resumeToken)) {
        return "Restored your in-progress application.";
      }

      return "";
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

    function updateCountrySuggestions(query = "") {
      if (!countrySuggestions) {
        return;
      }

      const options = getCountryMatches(query).slice(0, COUNTRY_MATCH_LIMIT);
      countrySuggestions.innerHTML = options
        .map((country) => '<option value="' + country + '"></option>')
        .join("");
    }

    function updateCountrySearchFeedback() {
      if (!countrySearchFeedback) {
        return;
      }

      if (applicantTypeInput?.value === "local") {
        countrySearchFeedback.textContent = "Kenya is used automatically for local applications.";
        return;
      }

      const rawValue = String(countryOfIncorporationInput?.value || "").trim();
      if (!rawValue) {
        countrySearchFeedback.textContent = "Matching countries will appear as you type. Kenya is reserved for local applications.";
        return;
      }

      if (isBlockedInternationalCountry(rawValue)) {
        countrySearchFeedback.textContent = "Kenya is only available for local registrar applications.";
        return;
      }

      const resolvedCountry = resolveCountryOption(rawValue);
      if (resolvedCountry) {
        countrySearchFeedback.textContent = "Selected country: " + resolvedCountry + ".";
        return;
      }

      const matches = getCountryMatches(rawValue);
      if (matches.length === 0) {
        countrySearchFeedback.textContent = "No close country match found yet. Continue typing the full country name.";
        return;
      }

      const preview = matches.slice(0, COUNTRY_PREVIEW_LIMIT).join(", ");
      countrySearchFeedback.textContent =
        "Matching countries: "
        + preview
        + (matches.length > COUNTRY_PREVIEW_LIMIT ? ", ..." : ".");
    }

    function normalizeCountrySelection() {
      if (!countryOfIncorporationInput || applicantTypeInput?.value === "local") {
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

    function getApplicantTypeSummary(value) {
      return value === "international"
        ? "Choose a country of incorporation other than Kenya and continue with international guidance."
        : "Kenya is filled automatically and the local guidance is applied.";
    }

    function closeApplicantTypePalette() {
      if (applicantTypeTrigger) {
        applicantTypeTrigger.setAttribute("aria-expanded", "false");
      }

      if (!applicantTypeDialog?.open) {
        return;
      }

      applicantTypeDialog.close();
    }

    function syncApplicantTypePalette() {
      const value = applicantTypeInput?.value === "international" ? "international" : "local";

      if (applicantTypeDisplay) {
        applicantTypeDisplay.textContent = getApplicantTypeLabel(value);
      }

      if (applicantTypeSummary) {
        applicantTypeSummary.textContent = getApplicantTypeSummary(value);
      }

      if (applicantTypeTrigger) {
        applicantTypeTrigger.dataset.value = value;
        applicantTypeTrigger.disabled = Boolean(applicantTypeInput?.disabled);
      }

      applicantTypeOptionButtons.forEach((button) => {
        const selected = button.getAttribute("data-applicant-type-option") === value;
        button.dataset.selected = selected ? "true" : "false";
        button.setAttribute("aria-pressed", selected ? "true" : "false");
      });
    }

    function openApplicantTypePalette() {
      if (!applicantTypeDialog || !applicantTypeTrigger || applicantTypeTrigger.disabled) {
        return;
      }

      applicantTypeTrigger.setAttribute("aria-expanded", "true");

      if (typeof applicantTypeDialog.showModal === "function") {
        applicantTypeDialog.showModal();
        return;
      }

      applicantTypeDialog.setAttribute("open", "open");
    }

    function setApplicantTypeValue(value) {
      if (!applicantTypeInput) {
        return;
      }

      const nextValue = value === "international" ? "international" : "local";
      if (applicantTypeInput.value !== nextValue) {
        applicantTypeInput.value = nextValue;
        applicantTypeInput.dispatchEvent(new Event("change", { bubbles: true }));
      }

      syncApplicantTypePalette();
      closeApplicantTypePalette();
    }

    function updateApplicationProfileSummary() {
      if (applicationProfileApplicantType) {
        applicationProfileApplicantType.textContent = getApplicantTypeLabel(applicantTypeInput?.value);
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

      applicantTypeInput.disabled = lockIdentity;
      countryOfIncorporationInput.disabled = lockIdentity || isLocal;
      if (applicantTypeTrigger) {
        applicantTypeTrigger.disabled = lockIdentity;
      }

      if (applicantTypeHint) {
        applicantTypeHint.textContent = lockIdentity
          ? "Applicant type is fixed after the application starts."
          : isLocal
            ? "Soft local profile selected. Kenya is used automatically."
            : "International profile selected. Choose the country of incorporation.";
      }

      if (countryOfIncorporationHint) {
        countryOfIncorporationHint.textContent = lockIdentity
          ? "Country of incorporation is fixed for the current application."
          : isLocal
            ? "Local applications use Kenya."
            : "Type to search and select the country of incorporation. Kenya is reserved for local applications.";
      }

      updateCountrySuggestions(countryOfIncorporationInput.value);
      updateCountrySearchFeedback();
      refreshPhoneFieldDecorators();
      syncApplicantTypePalette();
      updateApplicationProfileSummary();
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
    }

    function syncSubmissionFeedback(bundle) {
      const status = bundle?.application?.status || "";

      if (status === "submitted" || status === "in_review") {
        setSubmissionFeedback("Application submitted successfully.", "success");
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

      setSubmissionFeedback("Complete the form below and submit when you are ready.", "info");
    }

    function updateActionButtons() {
      if (submitApplicationButton) {
        submitApplicationButton.disabled = !formsEnabled || savingApplication || submittingApplication;
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
      document.querySelectorAll("[data-section] input, [data-section] textarea, [data-section] select").forEach((field) => {
        field.disabled = !enabled;
      });
      updateActionButtons();
    }

    function setActivationState(nextState = "idle") {
      activationIndicator?.classList.remove("is-active", "is-busy");

      if (nextState === "activating") {
        activationIndicator?.classList.add("is-busy");
        if (activationIndicator) {
          activationIndicator.textContent = "…";
        }
        if (activationHint) {
          activationHint.textContent = "Preparing the application with the selected profile...";
        }
        return;
      }

      if (nextState === "active") {
        activationIndicator?.classList.add("is-active");
        if (activationIndicator) {
          activationIndicator.textContent = "2";
        }
        if (activationHint) {
          activationHint.textContent = "Profile locked. Continue filling Sections A to F below.";
        }
        return;
      }

      if (nextState === "readonly") {
        activationIndicator?.classList.add("is-active");
        if (activationIndicator) {
          activationIndicator.textContent = "3";
        }
        if (activationHint) {
          activationHint.textContent = "This submitted application is read-only in this view.";
        }
        return;
      }

      if (activationIndicator) {
        activationIndicator.textContent = "1";
      }
      if (activationHint) {
        activationHint.textContent = "Set the registrar type and country above, then continue below with Section A.";
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
      syncCountryFieldState(false);
    }

    function resetLockedPortal() {
      resetPortalStateForNewApplication();
      setFormsEnabled(true);
      setSavingState(false);
      setSubmittingState(false);
      setActivationState("idle");
      setFlowVisualState("active");
      syncCountryFieldState(false);
      syncSubmissionFeedback(getEmptyBundle());
    }

    function clearStoredApplicationState() {
      const currentApplicationId = state.applicationId;
      if (currentApplicationId) {
        clearLocalDraft(currentApplicationId);
      }

      state.applicationId = "";
      state.draftToken = "";
      state.resumeToken = "";
      state.resumeCode = "";

      try {
        localStorage.removeItem(stateKey);
      } catch {}

      clearResumeQueryParams();
      resetLockedPortal();
    }

    function setSectionStatus(sectionCode, tone, label) {
      const node = sectionStatusNodes[sectionCode];
      if (!node) return;
      node.className = "mini-pill section-status " + tone;
      node.textContent = label;
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
        panel.classList.add("is-targeted");
        panel.scrollIntoView({ behavior: "smooth", block: "start" });
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

      if (focusTarget && typeof focusTarget.focus === "function") {
        setTimeout(() => {
          try {
            focusTarget.focus({ preventScroll: true });
          } catch {
            focusTarget.focus();
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
          setSectionStatus(section.sectionCode, "pending", "In progress");
          return;
        }

        setSectionStatus(section.sectionCode, "pending", "Not started");
      });
    }

    function getReviewStatusMessage(status) {
      if (status === "submitted" || status === "in_review") {
        return "Application submitted successfully.";
      }

      if (status === "changes_requested") {
        return "We have reviewed your application and need a few updates before the next submission.";
      }

      return "";
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
    }

    function getFriendlyErrorMessage(error, fallback) {
      const message = error && error.message ? String(error.message) : "";
      const known = {
        APPLICATION_FORM_INVALID:
          "Please review the highlighted sections and try again.",
        APPLICATION_NOT_READY_FOR_SUBMISSION:
          "Please complete all required sections before submitting.",
        INVALID_APPLICATION_FORM_PAYLOAD:
          "We could not read the application form. Refresh the page and try again.",
        COUNTRY_OF_INCORPORATION_REQUIRED:
          "Select the country of incorporation before submitting an international application.",
        COUNTRY_OF_INCORPORATION_NOT_ALLOWED_FOR_INTERNATIONAL:
          "Kenya is only allowed for local registrar applications. Choose a different country for an international registrar.",
        COUNTRY_OF_INCORPORATION_TOO_LONG:
          "Country of incorporation is too long. Search and select a shorter country name.",
        APPLICATION_ALREADY_SUBMITTED:
          "This application has already been submitted and is now read-only.",
        DRAFT_OR_RESUME_TOKEN_REQUIRED:
          "Please start a new application or reopen your saved application first.",
        INVALID_OR_EXPIRED_DRAFT_TOKEN:
          "Your saved application session has expired. Start a new application to continue.",
      };

      if (message && known[message]) {
        return known[message];
      }
      if (message && !/^[A-Z0-9_]+$/.test(message)) {
        return message;
      }
      return fallback;
    }

    function getAuthHeaders() {
      if (state.draftToken) return { "x-draft-token": state.draftToken };
      if (state.resumeToken) return { "x-resume-token": state.resumeToken };
      return {};
    }

    async function request(path, options = {}) {
      const headers = new Headers(options.headers || {});
      const authHeaders = getAuthHeaders();
      Object.keys(authHeaders).forEach((key) => headers.set(key, authHeaders[key]));
      const response = await fetch(path, { ...options, headers });
      const contentType = response.headers.get("content-type") || "";
      const payload = contentType.includes("application/json") ? await response.json() : await response.text();
      if (!response.ok) {
        const error = new Error(
          (payload && payload.error && payload.error.message) || response.statusText || "Request failed"
        );
        error.details = payload && payload.error ? payload.error.details : undefined;
        error.statusCode = response.status;
        throw error;
      }
      return payload.data ?? payload;
    }

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
      const result = await request("/onboard/v1/public/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantType,
          countryOfIncorporation: country || null,
        }),
      });

      state.applicationId = result.application.id;
      state.draftToken = result.draftToken;
      state.resumeToken = result.resumeToken;
      state.resumeCode = result.resumeCode;
      saveState();
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
      setFlowVisualState("active");
      setFormsEnabled(true);
      setActivationState("active");
      persistLocalDraftNow();
      updateSectionStatuses(latestBundle);

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
            "pending",
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

    async function hydrate(flashMessage = "") {
      if (!state.applicationId) {
        resetLockedPortal();
        return;
      }

      const responseBundle = await request("/onboard/v1/public/applications/" + state.applicationId);
      const bundle = normalizeBundle(responseBundle);
      latestBundle = bundle;

      if (bundle.application?.applicantType && applicantTypeInput) {
        applicantTypeInput.value = bundle.application.applicantType;
      }

      if (typeof bundle.application?.countryOfIncorporation === "string" && countryOfIncorporationInput) {
        countryOfIncorporationInput.value = bundle.application.countryOfIncorporation;
        countryOfIncorporationInput.dataset.autoLocal =
          normalizeCountryName(bundle.application.countryOfIncorporation) === "kenya" ? "true" : "false";
      }

      syncCountryFieldState(true);
      resetSectionForms();
      bundle.sections.forEach((section) => fillSection(section.sectionCode, section.data));

      const isReadOnly = ["submitted", "in_review", "approved", "rejected"].includes(
        bundle.application?.status || ""
      );

      if (!isReadOnly) {
        const localDraft = loadLocalDraft(state.applicationId);
        if (localDraft && isRecord(localDraft.sections)) {
          Object.keys(localDraft.sections).forEach((sectionCode) => {
            fillSection(sectionCode, localDraft.sections[sectionCode]);
          });
        }
        persistLocalDraftNow();
      } else {
        clearLocalDraft(state.applicationId);
      }

      setFormsEnabled(!isReadOnly);
      setSavingState(false);
      setSubmittingState(false);
      setActivationState(isReadOnly ? "readonly" : "active");
      setFlowVisualState(isReadOnly ? "readonly" : "active");
      updateSectionStatuses(bundle);
      syncSubmissionFeedback(bundle);
      saveState();

      if (submitApplicationButton && isReadOnly) {
        submitApplicationButton.textContent =
          bundle.application?.status === "submitted" || bundle.application?.status === "in_review"
            ? "Submitted"
            : "Review Closed";
      }

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
        await request("/onboard/v1/public/applications/" + state.applicationId + "/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildApplicationPayload()),
        });
        clearLocalDraft(state.applicationId);
        await hydrate("Application submitted successfully.");
      } catch (error) {
        setSubmittingState(false);

        if (!state.applicationId) {
          setActivationState("idle");
        }

        if (error && error.message === "APPLICATION_ALREADY_SUBMITTED") {
          try {
            clearLocalDraft(state.applicationId);
            await hydrate();
          } catch {
            clearLocalDraft(state.applicationId);
            setFormsEnabled(false);
            setSavingState(false);
            setActivationState("readonly");
            setFlowVisualState("readonly");
            setFlash("Application submitted successfully.", "success");
            setSubmissionFeedback(
              "Application submitted successfully.",
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
      updateCountrySuggestions();
      applyFieldMaxLengths();
      bindInputNormalization();
      bindDraftTracking();

      applicantTypeTrigger?.addEventListener("click", () => {
        openApplicantTypePalette();
      });

      applicantTypeClose?.addEventListener("click", () => {
        closeApplicantTypePalette();
      });

      applicantTypeDialog?.addEventListener("close", () => {
        applicantTypeTrigger?.setAttribute("aria-expanded", "false");
      });

      applicantTypeDialog?.addEventListener("click", (event) => {
        if (event.target === applicantTypeDialog) {
          closeApplicantTypePalette();
        }
      });

      applicantTypeOptionButtons.forEach((button) => {
        button.addEventListener("click", () => {
          setApplicantTypeValue(button.getAttribute("data-applicant-type-option"));
        });
      });

      applicantTypeInput?.addEventListener("change", () => {
        syncCountryFieldState(Boolean(state.applicationId));
        scheduleLocalDraftSave();
      });

      countryOfIncorporationInput?.addEventListener("input", () => {
        updateCountrySuggestions(countryOfIncorporationInput.value);
        updateCountrySearchFeedback();
        refreshPhoneFieldDecorators();
        updateApplicationProfileSummary();
        scheduleLocalDraftSave();
      });

      countryOfIncorporationInput?.addEventListener("blur", () => {
        normalizeCountrySelection();
        scheduleLocalDraftSave();
      });

      phoneFieldDecorators.forEach((field) => {
        field.input?.addEventListener("blur", () => {
          normalizePhoneFieldsForCountry();
          scheduleLocalDraftSave();
        });
      });

      const restoreMessage = restoreSessionState();

      if (state.applicationId) {
        try {
          await hydrate(restoreMessage);
          return;
        } catch (error) {
          clearStoredApplicationState();
          setFlash(
            getFriendlyErrorMessage(
              error,
              "We could not restore the saved application. Please start again."
            ),
            true
          );
          return;
        }
      }

      resetLockedPortal();
      const pendingDraft = loadLocalDraft();
      if (pendingDraft && isRecord(pendingDraft.sections)) {
        if (isRecord(pendingDraft.profile)) {
          if (applicantTypeInput && typeof pendingDraft.profile.applicantType === "string") {
            applicantTypeInput.value =
              pendingDraft.profile.applicantType === "international" ? "international" : "local";
          }

          if (
            countryOfIncorporationInput
            && typeof pendingDraft.profile.countryOfIncorporation === "string"
          ) {
            countryOfIncorporationInput.value = pendingDraft.profile.countryOfIncorporation;
            countryOfIncorporationInput.dataset.autoLocal =
              normalizeCountryName(pendingDraft.profile.countryOfIncorporation) === "kenya"
                ? "true"
                : "false";
          }
        }

        syncCountryFieldState(false);
        Object.keys(pendingDraft.sections).forEach((sectionCode) => {
          fillSection(sectionCode, pendingDraft.sections[sectionCode]);
        });
        updateSectionStatuses(latestBundle);
        setFlash("Restored your saved in-progress draft.");
        return;
      }

      setFlash("Continue below with Section A: General Information.");
    }

    void initializePortal();
  `;

  return renderShell({
    eyebrow: "",
    title: "Welcome to KeNIC Accreditation Platform",
    titleHtml:
      'Welcome to <span class="hero-title-primary">KeNIC</span> <span class="hero-title-secondary">Accreditation Platform</span>',
    description:
      "Complete the registrar application from your phone.",
    body,
    scripts,
  });
};
