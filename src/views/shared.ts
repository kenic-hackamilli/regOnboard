import { buildCssVariables } from "../config/theme.js";

const baseCss = `
${buildCssVariables()}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(0, 151, 57, 0.12), transparent 24%),
    radial-gradient(circle at top right, rgba(227, 6, 19, 0.1), transparent 20%),
    linear-gradient(180deg, #ffffff 0%, #f6f8f7 52%, #ffffff 100%);
  color: var(--dark);
}
a { color: var(--primary); text-decoration: none; }
.shell { max-width: 760px; margin: 0 auto; padding: 18px 14px 56px; }
.hero {
  display: grid;
  gap: 10px;
  margin-bottom: 18px;
  padding: 8px 0 18px;
  border-bottom: 1px solid rgba(52,58,64,0.08);
}
.hero h1 {
  margin: 0;
  font-size: clamp(1.85rem, 7vw, 2.85rem);
  line-height: 1.08;
  letter-spacing: -0.04em;
  max-width: 100%;
}
.hero p {
  margin: 0;
  max-width: 100%;
  font-size: 15px;
  line-height: 1.65;
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
.start-panel {
  display: grid;
  gap: 16px;
  padding: 4px 0 24px;
  border-bottom: 1px solid rgba(52,58,64,0.08);
}
.start-intro {
  display: grid;
  gap: 8px;
}
.start-intro h2 {
  margin: 0;
  font-size: clamp(1.35rem, 5vw, 1.8rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
}
.start-intro p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--gray700);
}
.activation-panel {
  display: grid;
  gap: 16px;
  align-items: start;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid rgba(52,58,64,0.08);
  background:
    radial-gradient(circle at top right, rgba(0,151,57,0.14), transparent 32%),
    linear-gradient(135deg, rgba(255,255,255,0.98), rgba(243,248,244,0.96));
  grid-template-columns: 1fr;
}
.activation-copy {
  display: grid;
  gap: 12px;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
}
.activation-copy-body {
  display: grid;
  gap: 6px;
}
.activation-copy h2 {
  margin: 0;
  font-size: clamp(1.35rem, 5vw, 1.85rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
}
.activation-copy p {
  margin: 0;
  max-width: 100%;
  font-size: 14px;
  line-height: 1.6;
  color: var(--gray700);
}
.activation-badge {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  margin-top: 2px;
  border-radius: 14px;
  background: rgba(255,255,255,0.96);
  border: 1px solid rgba(0,151,57,0.18);
  color: var(--primary);
  font-size: 18px;
  font-weight: 800;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
  transition: transform 140ms ease, background 140ms ease, color 140ms ease, box-shadow 140ms ease;
}
.activation-badge.is-active {
  background: #0b8f42;
  color: var(--white);
  box-shadow: 0 10px 20px rgba(0,151,57,0.18);
}
.activation-badge.is-busy {
  transform: translateY(-1px);
  box-shadow: 0 0 0 6px rgba(0,151,57,0.08);
}
.activation-actions {
  display: grid;
  gap: 10px;
  width: 100%;
  justify-items: start;
}
button.activation-start,
.button.activation-start {
  min-width: 108px;
  padding: 12px 18px;
  border-radius: 14px;
  background: var(--secondary);
  box-shadow: none;
}
button.activation-start.is-active,
.button.activation-start.is-active {
  background: #0b8f42;
}
button.activation-start.is-busy,
.button.activation-start.is-busy {
  opacity: 0.88;
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
  font-size: 14px;
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
  gap: 10px;
  min-height: 188px;
  padding: 18px;
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
  border-radius: 12px;
  border: 1px solid var(--gray300);
  padding: 12px 14px;
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
.application-flow {
  display: grid;
  gap: 0;
  margin-top: 32px;
  transition: opacity 160ms ease, filter 160ms ease, transform 160ms ease;
}
.application-flow.is-locked {
  opacity: 0.5;
  filter: saturate(0.8);
}
.application-flow.is-readonly {
  opacity: 0.78;
}
.application-section {
  padding: 32px 0 0;
  border-top: 1px solid rgba(52,58,64,0.08);
  scroll-margin-top: 20px;
}
.application-section:first-child {
  padding-top: 0;
  border-top: 0;
}
.application-section.is-targeted .application-shell {
  margin: 0 -6px;
  padding: 14px 12px;
  border-radius: 20px;
  background: rgba(227,6,19,0.04);
  box-shadow: 0 0 0 1px rgba(227,6,19,0.1);
}
.application-shell {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  align-items: start;
  transition: background 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}
.section-rail {
  display: grid;
  gap: 10px;
  align-self: start;
  position: static;
}
.section-step {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-weight: 800;
  color: var(--primary);
}
.section-rail h2 {
  margin: 0;
  font-size: 22px;
  line-height: 1.12;
  letter-spacing: -0.03em;
}
.section-rail p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--gray700);
}
.section-main {
  display: grid;
  gap: 18px;
  max-width: 100%;
}
.profile-summary-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
.profile-summary-card {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(52,58,64,0.08);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,249,250,0.94));
}
.profile-summary-card span {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 700;
}
.profile-summary-card strong {
  font-size: 20px;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--gray900);
}
.profile-summary-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--gray700);
}
.section-main form {
  gap: 18px;
}
.section-group {
  display: grid;
  gap: 18px;
}
.section-group-title {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 700;
}
.section-status {
  width: fit-content;
}
.mini-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: var(--gray100);
  color: var(--gray800);
}
.mini-pill.ready {
  background: rgba(40,167,69,0.14);
  color: var(--success);
}
.mini-pill.pending {
  background: rgba(255,193,7,0.18);
  color: #8a6500;
}
.mini-pill.loading {
  background: rgba(23,162,184,0.12);
  color: #0b7285;
}
.mini-pill.error {
  background: rgba(220,53,69,0.14);
  color: var(--error);
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
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.flash {
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(23,162,184,0.12);
  color: var(--gray900);
  border: 1px solid rgba(23,162,184,0.18);
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
  .row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .palette-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .activation-panel {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
  .activation-actions {
    width: auto;
    justify-items: start;
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
  scripts: string;
}) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${params.title}</title>
    <style>${baseCss}</style>
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
    <script type="module">
      ${params.scripts}
    </script>
  </body>
</html>`;
