import { buildCssVariables } from "../config/theme.js";

const baseCss = `
${buildCssVariables()}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(0, 151, 57, 0.12), transparent 24%),
    radial-gradient(circle at top right, rgba(227, 6, 19, 0.1), transparent 20%),
    linear-gradient(180deg, #ffffff 0%, #f6f8f7 52%, #ffffff 100%);
  color: var(--dark);
}
a { color: var(--primary); text-decoration: none; }
.shell { max-width: 820px; margin: 0 auto; padding: 18px 14px 56px; }
.hero {
  display: grid;
  gap: 12px;
  margin-bottom: 14px;
  padding: 2px 0 10px;
}
.hero h1 {
  margin: 0;
  max-width: 12ch;
  font-size: clamp(1.95rem, 7vw, 3rem);
  line-height: 1;
  letter-spacing: -0.05em;
  font-weight: 750;
}
.hero p {
  margin: 0;
  max-width: 42ch;
  font-size: 14px;
  line-height: 1.75;
  color: var(--gray700);
}
.hero-eyebrow {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 700;
}
.hero-title-primary {
  color: var(--primary);
}
.hero-title-secondary {
  color: var(--secondary);
}
.hero-title-muted {
  color: var(--gray900);
}
.grid { display: grid; gap: 20px; }
.grid.two { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
.top-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1.4fr) minmax(300px, 0.8fr);
}
.portal-entry {
  display: grid;
  gap: 14px;
  padding: 2px 0 18px;
  transition: opacity 160ms ease, filter 160ms ease;
}
.portal-status-banner {
  display: grid;
  gap: 8px;
  margin-bottom: 18px;
  padding: 18px 20px;
  border-radius: 24px;
  border: 1px solid rgba(227,6,19,0.14);
  background:
    radial-gradient(circle at top right, rgba(227,6,19,0.08), transparent 36%),
    linear-gradient(180deg, rgba(255,248,247,0.98), rgba(255,252,251,0.98));
  box-shadow: 0 18px 38px rgba(108, 24, 24, 0.08);
}
.portal-status-banner[hidden] {
  display: none !important;
}
.portal-status-banner-kicker {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--secondary);
  font-weight: 800;
}
.portal-status-banner strong {
  font-size: 17px;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: var(--gray900);
}
.portal-status-banner p,
.portal-status-meta {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--gray700);
}
.portal-entry.is-compact {
  gap: 12px;
  padding-bottom: 18px;
}
.portal-entry.is-compact .portal-entry-hero,
.portal-entry.is-compact .portal-entry-grid,
.portal-entry.is-compact .portal-entry-actions {
  display: none;
}
.portal-entry-grid {
  display: grid;
  gap: 14px;
}
.portal-entry-card {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 24px;
  border: 1px solid rgba(52,58,64,0.08);
  background:
    radial-gradient(circle at top right, rgba(227,6,19,0.05), transparent 30%),
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,249,248,0.98));
  box-shadow: 0 20px 48px rgba(13,50,31,0.06);
}
.portal-entry-card-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.portal-entry-badge {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(0,151,57,0.1);
  color: var(--primary);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 800;
}
.portal-entry-badge.is-secondary {
  background: rgba(227,6,19,0.08);
  color: var(--secondary);
}
.portal-entry-meta {
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 700;
}
.portal-entry-list {
  display: grid;
  gap: 2px;
}
.portal-entry-item {
  display: grid;
  gap: 4px;
  padding: 12px 0;
  border-top: 1px solid rgba(52,58,64,0.08);
}
.portal-entry-item:first-child {
  padding-top: 0;
  border-top: 0;
}
.portal-entry-item-kicker {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 700;
}
.portal-entry-item strong {
  font-size: 15px;
  line-height: 1.35;
  letter-spacing: -0.015em;
  color: var(--gray900);
}
.portal-entry-item p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--gray700);
}
.portal-entry-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.portal-main-experience {
  display: grid;
  gap: 0;
  padding-top: 24px;
  transition: opacity 160ms ease, filter 160ms ease;
}
.portal-entry.is-inactive,
.portal-main-experience.is-inactive {
  opacity: 0.54;
  filter: saturate(0.72);
}
.start-panel {
  display: grid;
  gap: 18px;
  padding: 2px 0 26px;
  border-bottom: 1px solid rgba(52,58,64,0.08);
}
.start-intro {
  display: grid;
  gap: 10px;
}
.start-intro h2 {
  margin: 0;
  max-width: 14ch;
  font-size: clamp(1.45rem, 5vw, 2rem);
  line-height: 1.04;
  letter-spacing: -0.045em;
  font-weight: 750;
}
.start-intro p {
  margin: 0;
  max-width: 48ch;
  font-size: 14px;
  line-height: 1.72;
  color: var(--gray700);
}
.profile-setup-panel {
  display: grid;
  gap: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}
.profile-setup-panel.is-locked {
  background: transparent;
}
.portal-entry.is-compact .profile-setup-panel {
  gap: 8px;
  padding: 0;
}
.portal-entry.is-compact .profile-setup-main {
  display: none;
}
.profile-setup-main {
  display: grid;
  gap: 16px;
}
.profile-country-field {
  position: relative;
  align-self: start;
}
.country-search-shell {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 54px;
  border-radius: 18px;
  border: 1px solid rgba(52,58,64,0.12);
  background: rgba(255,255,255,0.92);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.72);
  transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
}
.country-search-shell:focus-within {
  border-color: rgba(0,151,57,0.42);
  background: rgba(255,255,255,0.98);
  box-shadow: 0 0 0 4px rgba(0,151,57,0.08);
}
.country-search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(52,58,64,0.38);
  border-radius: 999px;
  transform: translateY(-50%);
  pointer-events: none;
}
.country-search-icon::after {
  content: "";
  position: absolute;
  right: -5px;
  bottom: -3px;
  width: 7px;
  height: 2px;
  border-radius: 999px;
  background: rgba(52,58,64,0.38);
  transform: rotate(45deg);
  transform-origin: center;
}
.country-search-shell input {
  border: 0;
  padding: 14px 16px 14px 44px;
  background: transparent;
  box-shadow: none;
}
.country-search-shell input:focus {
  box-shadow: none;
}
.country-suggestion-list {
  display: grid;
  gap: 6px;
  margin-top: 10px;
  padding: 8px;
  border-radius: 20px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.98);
  box-shadow: 0 22px 44px rgba(13,50,31,0.08);
}
.country-suggestion-option,
button.country-suggestion-option,
.button.country-suggestion-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 0;
  background: transparent;
  color: var(--dark);
  text-align: left;
}
.country-suggestion-option:hover,
.country-suggestion-option:focus-visible,
.country-suggestion-option[data-active="true"] {
  background: rgba(0,151,57,0.08);
  color: var(--gray900);
}
.country-suggestion-copy {
  display: block;
}
.country-suggestion-copy strong {
  font-size: 14px;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: inherit;
}
.country-suggestion-empty {
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.55;
  color: var(--gray600);
}
.profile-selection-bar {
  display: grid;
  gap: 6px;
  padding: 0;
}
.profile-selection-kicker {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 800;
}
.profile-selection-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}
.profile-selection-summary strong {
  font-size: 15px;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--gray900);
}
.profile-selection-separator {
  width: 18px;
  height: 1px;
  border-radius: 999px;
  background: rgba(52,58,64,0.18);
}
.portal-entry.is-compact .profile-selection-bar {
  display: none;
}
.flow-profile-context {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 12px;
  margin-top: 2px;
  padding: 0;
  border: 0;
  background: transparent;
}
.flow-profile-context[hidden] {
  display: none !important;
}
.flow-profile-context-label {
  font-size: 12px;
  letter-spacing: 0;
  text-transform: none;
  color: var(--gray600);
  font-weight: 600;
}
.flow-profile-context strong {
  font-size: 12px;
  line-height: 1.4;
  letter-spacing: 0;
  color: var(--gray900);
}
.card {
  background: rgba(255,255,255,0.72);
  border: 1px solid rgba(52,58,64,0.08);
  border-radius: 20px;
  box-shadow: none;
  padding: 22px;
  backdrop-filter: blur(8px);
}
.card h2, .card h3 { margin: 0; }
.section-header {
  display: grid;
  gap: 8px;
}
.section-header h2,
.section-header h3 {
  margin: 0;
}
.section-header p {
  margin: 0;
}
.section-kicker {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 700;
}
.subtle { color: var(--gray700); }
.note-block {
  display: grid;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.82);
}
.note-block.note-block-compact {
  background: rgba(248,249,250,0.92);
}
.note-label {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 700;
}
.note-list {
  display: grid;
  gap: 6px;
}
.note-item {
  position: relative;
  padding-left: 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--gray800);
}
.note-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.62em;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--secondary);
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(227, 6, 19, 0.08);
  color: var(--primary);
  font-weight: 700;
  width: fit-content;
}
.status-ready { background: rgba(40,167,69,0.14); color: var(--success); }
.status-warn { background: rgba(255,193,7,0.18); color: #8a6500; }
.status-error { background: rgba(220,53,69,0.14); color: var(--error); }
.toolbar { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 4px; }
button, .button {
  appearance: none;
  border: 0;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
  background: var(--primary);
  color: var(--white);
}
button.secondary, .button.secondary {
  background: var(--secondary);
}
button.ghost, .button.ghost {
  background: var(--gray100);
  color: var(--dark);
  border: 1px solid var(--gray300);
}
button.warning {
  background: var(--warning);
  color: var(--dark);
}
button.danger {
  background: var(--error);
  color: var(--white);
}
form { display: grid; gap: 16px; }
.row {
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr;
}
label,
.field-block {
  display: grid;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray800);
}
label {
  margin: 0;
}
.required-mark {
  color: var(--primary);
  margin-left: 4px;
}
.visually-hidden-control {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.applicant-type-field {
  position: relative;
}
.field-label-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 14px;
}
.inline-choice-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
}
.inline-choice,
button.inline-choice,
.button.inline-choice {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 0;
  padding: 6px 0;
  border-radius: 0;
  border: 0;
  background: transparent;
  color: var(--gray800);
  text-align: left;
  box-shadow: none;
  transition: color 140ms ease, transform 140ms ease;
}
.inline-choice:hover,
.inline-choice:focus-visible {
  transform: none;
  color: var(--gray900);
  border-color: transparent;
  box-shadow: none;
}
.inline-choice:focus-visible .inline-choice-indicator {
  box-shadow: 0 0 0 4px rgba(0,151,57,0.12);
}
.inline-choice[data-selected="true"] {
  border-color: transparent;
  background: transparent;
  color: var(--gray900);
  box-shadow: none;
}
.inline-choice-indicator {
  position: relative;
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  border-radius: 999px;
  border: 1.5px solid rgba(52,58,64,0.22);
  background: transparent;
  transition: border-color 140ms ease, background 140ms ease, box-shadow 140ms ease;
}
.inline-choice[data-selected="true"] .inline-choice-indicator {
  border-color: #0b8f42;
  background: rgba(11,143,66,0.08);
}
.inline-choice[data-selected="true"] .inline-choice-indicator::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 4px;
  height: 8px;
  border: solid #0b8f42;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -58%) rotate(45deg);
}
.inline-choice-label {
  font-size: 14px;
  line-height: 1.3;
  font-weight: 700;
  color: inherit;
}
.setup-inline-summary {
  font-size: 12px;
  line-height: 1.7;
  color: var(--gray700);
}
.palette-trigger,
button.palette-trigger,
.button.palette-trigger {
  display: grid;
  gap: 8px;
  justify-items: start;
  width: 100%;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(52,58,64,0.08);
  background:
    radial-gradient(circle at top right, rgba(0,151,57,0.08), transparent 42%),
    linear-gradient(145deg, rgba(255,255,255,0.98), rgba(243,248,244,0.96));
  color: var(--dark);
  text-align: left;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.72);
  transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
}
.palette-trigger:hover,
.palette-trigger:focus-visible {
  transform: translateY(-1px);
  border-color: rgba(0,151,57,0.22);
  box-shadow: 0 14px 30px rgba(13,50,31,0.08);
}
.palette-trigger:disabled {
  transform: none;
  border-color: rgba(52,58,64,0.08);
  box-shadow: none;
}
.palette-trigger-kicker {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gray600);
}
.palette-trigger strong {
  font-size: 20px;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--gray900);
}
.palette-trigger-summary {
  font-size: 13px;
  line-height: 1.6;
  color: var(--gray700);
}
.palette-trigger-action {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(227,6,19,0.08);
  color: var(--primary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.palette-dialog {
  width: min(700px, calc(100vw - 24px));
  max-width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
}
.palette-dialog::backdrop {
  background: rgba(20,33,24,0.3);
  backdrop-filter: blur(10px);
}
.palette-dialog-shell {
  display: grid;
  gap: 18px;
  padding: 22px;
  border-radius: 28px;
  border: 1px solid rgba(52,58,64,0.08);
  background:
    radial-gradient(circle at top right, rgba(227,6,19,0.08), transparent 28%),
    radial-gradient(circle at top left, rgba(0,151,57,0.12), transparent 34%),
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(246,248,247,0.98));
  box-shadow: 0 28px 64px rgba(13,50,31,0.16);
}
.palette-dialog-header {
  display: grid;
  gap: 8px;
}
.palette-dialog-header h3 {
  margin: 0;
  font-size: clamp(1.45rem, 4vw, 2rem);
  line-height: 1.04;
  letter-spacing: -0.04em;
}
.palette-dialog-header p {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--gray700);
}
.palette-options {
  display: grid;
  gap: 12px;
}
.palette-option,
button.palette-option,
.button.palette-option {
  display: grid;
  align-content: start;
  gap: 8px;
  min-height: 148px;
  padding: 16px;
  border-radius: 22px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.84);
  color: var(--dark);
  text-align: left;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
  transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease, background 140ms ease;
}
.palette-option:hover,
.palette-option:focus-visible {
  transform: translateY(-2px);
  border-color: rgba(0,151,57,0.18);
  box-shadow: 0 16px 28px rgba(13,50,31,0.08);
}
.palette-option[data-selected="true"] {
  border-color: rgba(0,151,57,0.32);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(239,248,242,0.98));
  box-shadow: 0 18px 32px rgba(0,151,57,0.12);
}
.palette-option-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(0,151,57,0.1);
  color: var(--primary);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.palette-option strong {
  font-size: 20px;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--gray900);
}
.palette-option p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--gray700);
}
.palette-dialog-footer {
  display: flex;
  justify-content: flex-end;
}
input, textarea, select {
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(52,58,64,0.14);
  padding: 13px 14px;
  font: inherit;
  background: rgba(255,255,255,0.92);
  color: var(--dark);
  transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
}
input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: rgba(0,151,57,0.52);
  box-shadow: 0 0 0 4px rgba(0,151,57,0.08);
  background: var(--white);
}
input.is-invalid,
textarea.is-invalid,
select.is-invalid,
.input-with-prefix.is-invalid {
  border-color: rgba(198,40,40,0.56);
  box-shadow: 0 0 0 4px rgba(198,40,40,0.12);
  background: rgba(255,250,250,0.98);
}
.input-with-prefix.is-invalid input {
  background: transparent;
}
input:disabled,
textarea:disabled,
select:disabled {
  background: rgba(248,249,250,0.92);
  color: var(--gray700);
  cursor: not-allowed;
}
textarea { min-height: 120px; resize: vertical; }
.hint { font-size: 12px; color: var(--gray600); }
.input-with-prefix {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: stretch;
  border: 1px solid var(--gray300);
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255,255,255,0.92);
}
.input-with-prefix:focus-within {
  border-color: rgba(0,151,57,0.52);
  box-shadow: 0 0 0 4px rgba(0,151,57,0.08);
  background: var(--white);
}
.input-prefix {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  min-width: 108px;
  border-right: 1px solid var(--gray300);
  background: rgba(243,248,244,0.96);
  color: var(--gray800);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}
.input-with-prefix input {
  border: 0;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}
.input-with-prefix input:focus {
  box-shadow: none;
}
.stack { display: grid; gap: 18px; }
.list {
  display: grid;
  gap: 12px;
}
.document-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
.list-item {
  border: 1px solid var(--gray300);
  border-radius: 14px;
  padding: 14px;
  background: var(--white);
}
.info-box {
  border: 1px solid rgba(0, 151, 57, 0.12);
  border-radius: 16px;
  padding: 16px;
  background: rgba(0, 151, 57, 0.05);
}
.info-box.compact {
  background: rgba(227, 6, 19, 0.03);
  border-color: rgba(227, 6, 19, 0.1);
}
.info-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
.info-chip {
  position: relative;
  padding-left: 16px;
  background: transparent;
  color: var(--gray800);
  font-size: 14px;
  line-height: 1.5;
}
.info-chip::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--secondary);
}
.doc-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.doc-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.hidden-input { display: none; }
.start-card,
.summary-card {
  gap: 18px;
}
.summary-card {
  align-self: start;
  position: sticky;
  top: 20px;
}
.quick-list {
  display: grid;
  gap: 10px;
}
.quick-item {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(248,249,250,0.88);
}
.quick-item strong {
  font-size: 14px;
  color: var(--gray900);
}
.quick-item span {
  font-size: 13px;
  line-height: 1.6;
  color: var(--gray700);
}
.reference-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
}
.reference-item {
  display: grid;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(248,249,250,0.88);
}
.reference-item strong {
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}
.summary-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.summary-stat {
  display: grid;
  gap: 10px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(248,249,250,0.9);
}
.summary-stat span {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--gray600);
}
.summary-stat strong {
  font-size: 28px;
  line-height: 1;
}
.flow-header {
  display: grid;
  gap: 12px;
  margin-top: 12px;
  padding: 6px 0 0;
  border-radius: 0;
  border-left: 0;
  border-right: 0;
  border-bottom: 0;
  background: transparent;
}
.flow-header-copy {
  display: grid;
  gap: 6px;
}
.flow-header-copy h2 {
  margin: 0;
  font-size: clamp(1.35rem, 5vw, 1.85rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
  font-weight: 750;
}
.flow-header-copy p {
  margin: 0;
  font-size: 14px;
  line-height: 1.72;
  color: var(--gray700);
  max-width: 52ch;
}
.flow-header-meta {
  display: grid;
  gap: 8px;
}
.flow-step-counter {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--gray700);
  font-weight: 800;
}
.flow-progress-track {
  position: relative;
  height: 4px;
  border-radius: 999px;
  background: rgba(52,58,64,0.08);
  overflow: hidden;
}
.flow-progress-value {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--primary), #3aa564);
  transition: width 180ms ease;
}
.flow-step-tabs {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  overflow-x: auto;
  padding: 2px 0 0;
  scrollbar-width: none;
}
.flow-step-tabs::-webkit-scrollbar {
  display: none;
}
.flow-step-tab,
button.flow-step-tab,
.button.flow-step-tab {
  display: grid;
  align-items: start;
  gap: 8px;
  min-width: max-content;
  padding: 0 0 8px;
  border-radius: 0;
  border: 0;
  background: transparent;
  color: var(--dark);
  text-align: left;
  transition: color 140ms ease;
}
.flow-step-tab:hover,
.flow-step-tab:focus-visible {
  color: var(--gray900);
}
.flow-step-tab-indicator {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 56px;
  height: 12px;
  flex: 0 0 auto;
}
.flow-step-tab-indicator::before {
  content: "";
  width: 100%;
  height: 2px;
  border-radius: 999px;
  background: rgba(52,58,64,0.22);
}
.flow-step-tab.is-active .flow-step-tab-indicator::before {
  height: 3px;
  background: rgba(11,143,66,0.45);
}
.flow-step-tab.is-complete .flow-step-tab-indicator::before {
  background: rgba(11,143,66,0.18);
}
.flow-step-tab.is-complete .flow-step-tab-indicator::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  margin-top: 0;
  width: 6px;
  height: 10px;
  border: solid #0b8f42;
  border-width: 0 2px 2px 0;
  transform: translateY(-58%) rotate(45deg);
}
.flow-step-tab.is-active.is-complete .flow-step-tab-indicator::before {
  height: 3px;
  background: rgba(11,143,66,0.34);
}
.flow-step-tab.is-issue .flow-step-tab-indicator::before {
  background: rgba(198,40,40,0.28);
}
.flow-step-tab.is-issue .flow-step-tab-indicator::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #c62828;
  transform: translateY(-50%);
}
.flow-step-tab.is-active,
.flow-step-tab.is-active .flow-step-tab-label {
  color: var(--gray900);
}
.flow-step-tab-label {
  font-size: 12px;
  line-height: 1.4;
  color: var(--gray700);
  font-weight: 700;
  letter-spacing: 0.01em;
  white-space: nowrap;
}
.application-flow {
  display: grid;
  gap: 0;
  margin-top: 20px;
  transition: opacity 160ms ease, filter 160ms ease, transform 160ms ease;
}
.portal-main-experience[hidden] {
  display: none !important;
}
.application-flow.is-locked {
  opacity: 0.5;
  filter: saturate(0.8);
}
.application-flow.is-readonly {
  opacity: 0.78;
}
.application-flow.is-paged .application-section {
  display: none;
  padding-top: 0;
  border-top: 0;
}
.application-flow.is-paged .application-section.is-current {
  display: block;
  animation: flowSectionReveal 180ms ease;
}
.application-section {
  padding: 28px 0 0;
  border-top: 0;
  scroll-margin-top: 20px;
}
.application-section:first-child {
  padding-top: 0;
  border-top: 0;
}
.application-section.is-targeted .application-shell {
  padding-left: 0;
  border-left-color: transparent;
}
.application-shell {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  align-items: start;
  padding: 0;
  border-left: 0;
  background: transparent;
  box-shadow: none;
  transition: opacity 160ms ease;
}
.section-rail {
  display: grid;
  gap: 6px;
  align-self: start;
  position: static;
  padding-bottom: 2px;
  border-bottom: 0;
}
.section-step {
  display: none;
}
.section-rail h2 {
  margin: 0;
  font-size: clamp(1.35rem, 4.6vw, 1.7rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
  font-weight: 750;
}
.section-rail p {
  margin: 0;
  max-width: 54ch;
  font-size: 14px;
  line-height: 1.72;
  color: var(--gray700);
}
.section-main {
  display: grid;
  gap: 16px;
  max-width: 100%;
}
.section-navigation {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 12px;
  padding-top: 14px;
  border-top: 1px solid rgba(52,58,64,0.08);
}
.section-navigation > button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  min-width: 112px;
  padding: 10px 16px;
  border-radius: 999px;
}
.section-navigation.has-both-actions [data-flow-next],
.section-navigation.has-only-next [data-flow-next] {
  margin-left: auto;
}
.section-navigation.has-only-prev [data-flow-prev] {
  margin-right: auto;
}
.section-navigation.has-only-next [data-flow-next],
.section-navigation.has-only-prev [data-flow-prev] {
  min-width: 112px;
}
.section-navigation-meta {
  order: 3;
  flex-basis: 100%;
  font-size: 11px;
  line-height: 1.5;
  color: var(--gray600);
}
.section-navigation-meta:empty {
  display: none;
}
.section-main form {
  gap: 16px;
}
.section-group {
  display: grid;
  gap: 16px;
}
.section-group-title {
  margin: 0;
  font-size: 15px;
  line-height: 1.35;
  letter-spacing: -0.015em;
  text-transform: none;
  color: var(--gray900);
  font-weight: 750;
}
.section-status {
  width: fit-content;
  padding: 0;
  border-radius: 0;
  background: transparent;
  color: var(--gray700);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 10px;
}
.mini-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border-radius: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--gray700);
  background: transparent;
}
.mini-pill::before {
  content: "";
  width: 20px;
  height: 2px;
  border-radius: 999px;
  background: rgba(52,58,64,0.24);
}
.mini-pill.ready {
  color: var(--success);
}
.mini-pill.ready::before {
  display: none;
}
.mini-pill.ready::after {
  content: "";
  width: 6px;
  height: 10px;
  border: solid #0b8f42;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  margin-left: -18px;
  margin-right: 8px;
}
.mini-pill.pending {
  color: var(--gray600);
}
.mini-pill.pending::before {
  background: rgba(52,58,64,0.24);
}
.mini-pill.loading {
  color: #0b8f42;
}
.mini-pill.loading::before {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #0b8f42;
}
.mini-pill.error {
  color: var(--error);
}
.mini-pill.error::before {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--error);
}
.doc-card {
  gap: 14px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  scroll-margin-top: 20px;
}
.doc-card.is-targeted {
  margin: -6px;
  padding: 20px;
  border: 1px solid rgba(0,151,57,0.18);
  border-radius: 18px;
  background: rgba(0,151,57,0.05);
  box-shadow: 0 0 0 1px rgba(0,151,57,0.08);
}
.doc-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.doc-meta {
  display: grid;
  gap: 6px;
}
.doc-index {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 700;
}
.doc-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.doc-actions button,
.doc-actions .button {
  padding: 10px 12px;
  font-size: 13px;
}
.file-picker-button {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}
.file-picker-button input[type="file"] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.file-picker-button[aria-disabled="true"] {
  pointer-events: none;
}
.doc-note {
  font-size: 13px;
  line-height: 1.5;
  color: var(--gray700);
}
.doc-status {
  font-size: 13px;
  line-height: 1.5;
  color: var(--gray700);
}
.declaration-box {
  display: grid;
  gap: 14px;
  padding: 4px 0 4px 20px;
  border-radius: 0;
  border: 0;
  border-left: 2px solid rgba(0,151,57,0.18);
  background: transparent;
}
.declaration-item {
  font-size: 13px;
  line-height: 1.6;
  color: var(--gray800);
}
@keyframes flowSectionReveal {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.flash {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(23,162,184,0.12);
  color: var(--gray900);
  border: 1px solid rgba(23,162,184,0.18);
}
.flash:empty {
  display: none;
}
.profile-switch-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(20,33,24,0.18);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 1040;
  transition: opacity 180ms ease, visibility 180ms ease;
}
.profile-switch-overlay.is-active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
.profile-switch-dialog {
  width: min(440px, calc(100vw - 28px));
  display: grid;
  gap: 16px;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(52,58,64,0.08);
  background:
    radial-gradient(circle at top right, rgba(227,6,19,0.06), transparent 34%),
    radial-gradient(circle at top left, rgba(0,151,57,0.1), transparent 34%),
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(246,248,247,0.98));
  box-shadow: 0 28px 60px rgba(24,32,24,0.18);
  color: var(--gray900);
  transform: translateY(16px) scale(0.98);
  transition: transform 180ms ease, opacity 180ms ease;
}
.profile-switch-overlay.is-active .profile-switch-dialog {
  transform: translateY(0) scale(1);
}
.profile-switch-dialog-copy {
  display: grid;
  gap: 8px;
}
.profile-switch-dialog-copy h3 {
  margin: 0;
  font-size: clamp(1.25rem, 5vw, 1.65rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
}
.profile-switch-dialog-copy p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--gray700);
}
.profile-switch-compare {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 18px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.82);
}
.profile-switch-state {
  display: grid;
  gap: 4px;
}
.profile-switch-state span {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--gray600);
}
.profile-switch-state strong {
  font-size: 15px;
  line-height: 1.35;
  letter-spacing: -0.02em;
  color: var(--gray900);
}
.profile-switch-arrow {
  width: 18px;
  height: 1px;
  border-radius: 999px;
  background: rgba(52,58,64,0.22);
}
.profile-switch-note {
  font-size: 12px;
  line-height: 1.6;
  color: var(--gray600);
}
.profile-switch-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.profile-switch-actions > button {
  display: inline-flex;
  align-items: center;
  width: 100%;
  justify-content: center;
}
.flash-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 1000;
  transition: opacity 180ms ease, visibility 180ms ease;
}
.flash-overlay.is-active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}
.flash-toast {
  width: min(420px, calc(100vw - 32px));
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 24px;
  border: 1px solid rgba(198,40,40,0.18);
  background:
    radial-gradient(circle at top right, rgba(227,6,19,0.1), transparent 38%),
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,247,0.98));
  box-shadow: 0 28px 60px rgba(24,32,24,0.18);
  backdrop-filter: blur(12px);
  color: var(--gray900);
  transform: translateY(18px) scale(0.98);
  transition: transform 180ms ease, opacity 180ms ease;
}
.flash-overlay.is-active .flash-toast {
  transform: translateY(0) scale(1);
}
.flash-toast-label {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 800;
  color: var(--error);
}
.flash-toast-message {
  font-size: 15px;
  line-height: 1.6;
  font-weight: 600;
}
.flash-toast-close {
  justify-self: end;
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(52,58,64,0.08);
  border: 1px solid rgba(52,58,64,0.08);
  color: var(--gray900);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.flash-toast-close:hover,
.flash-toast-close:focus-visible {
  background: rgba(52,58,64,0.12);
}
.submission-box {
  display: grid;
  gap: 12px;
  padding: 18px 0 0;
  border-radius: 0;
  border: 0;
  border-top: 1px solid rgba(227,6,19,0.12);
  background: transparent;
}
.submission-feedback {
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(23,162,184,0.18);
  background: rgba(23,162,184,0.1);
  color: var(--gray900);
  font-size: 13px;
  line-height: 1.6;
}
.submission-feedback.info {
  border-color: rgba(23,162,184,0.18);
  background: rgba(23,162,184,0.1);
}
.submission-feedback.success {
  border-color: rgba(46,125,50,0.22);
  background: rgba(46,125,50,0.12);
}
.submission-feedback.error {
  border-color: rgba(198,40,40,0.22);
  background: rgba(198,40,40,0.1);
}
.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(52,58,64,0.12), transparent);
  margin: 24px 0;
}
button:disabled,
.button[aria-disabled="true"] {
  opacity: 0.65;
  cursor: not-allowed;
}
@media (min-width: 560px) {
  .shell {
    padding: 22px 18px 64px;
  }
  .portal-entry-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
  .row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .profile-setup-panel {
    grid-template-columns: 1fr;
  }
  .profile-setup-main {
    grid-template-columns: 1fr;
    max-width: 560px;
  }
  .palette-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .section-navigation {
    gap: 10px 12px;
  }
  .flow-header-meta {
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 14px;
  }
  .profile-switch-compare {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
  }
  .summary-grid,
  .reference-grid {
    grid-template-columns: 1fr;
  }
}
@media (min-width: 920px) {
  .top-grid {
    grid-template-columns: 1fr;
  }
  .summary-card {
    position: static;
  }
}
`;

export const renderShell = (params: {
  title: string;
  titleHtml?: string;
  description: string;
  eyebrow?: string;
  body: string;
  scripts?: string;
  scriptSrc?: string;
  nonce?: string;
}) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${params.title}</title>
    <style${params.nonce ? ` nonce="${params.nonce}"` : ""}>${baseCss}</style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        ${params.eyebrow ? `<div class="hero-eyebrow">${params.eyebrow}</div>` : ""}
        <h1>${params.titleHtml || params.title}</h1>
        <p>${params.description}</p>
      </section>
      ${params.body}
    </main>
    <div id="flashOverlay" class="flash-overlay" aria-hidden="true">
      <div id="flashToast" class="flash-toast" role="alert" aria-live="assertive">
        <div id="flashToastLabel" class="flash-toast-label">Needs attention</div>
        <div id="flashToastMessage" class="flash-toast-message"></div>
        <button id="flashToastClose" type="button" class="flash-toast-close">Close</button>
      </div>
    </div>
    ${params.scriptSrc
      ? `<script src="${params.scriptSrc}"${params.nonce ? ` nonce="${params.nonce}"` : ""}></script>`
      : `<script${params.nonce ? ` nonce="${params.nonce}"` : ""}>
      ${params.scripts || ""}
    </script>`}
  </body>
</html>`;
