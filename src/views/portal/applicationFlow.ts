export const renderApplicationFlow = (options: { hidden?: boolean } = {}) => `
  <div id="portalMainExperience" class="portal-main-experience"${options.hidden === false ? "" : " hidden"}>
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
          <div class="section-rail section-rail--hidden">
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
          <div class="section-rail section-rail--hidden">
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
          <div class="section-rail section-rail--hidden">
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
          <div class="section-rail section-rail--hidden">
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
          <div class="section-rail section-rail--hidden">
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
          <div class="section-rail section-rail--hidden">
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
          <div class="section-rail section-rail--hidden">
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
          <div class="section-rail section-rail--hidden">
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
`;
