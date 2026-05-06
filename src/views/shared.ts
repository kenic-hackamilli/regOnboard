import { buildCssVariables } from "../config/theme.js";

const baseCss = `
${buildCssVariables()}
* { box-sizing: border-box; }
:root {
  --portal-default-ambient-image: url("/portal/assets/images/morning/elephant.webp");
  --portal-ambient-surface:
    radial-gradient(circle at 18% 18%, rgba(255, 255, 255, 0.18), transparent 10%),
    radial-gradient(circle at 78% 26%, rgba(227, 6, 19, 0.18), transparent 12%),
    radial-gradient(circle at 50% 78%, rgba(0, 151, 57, 0.18), transparent 14%),
    repeating-radial-gradient(
      circle at 18% 20%,
      rgba(255,255,255,0.14) 0 2px,
      transparent 2px 19px,
      rgba(255,255,255,0.05) 19px 21px,
      transparent 21px 44px
    ),
    repeating-radial-gradient(
      circle at 78% 28%,
      rgba(227,6,19,0.22) 0 1.5px,
      transparent 1.5px 18px,
      rgba(255,255,255,0.05) 18px 20px,
      transparent 20px 42px
    ),
    repeating-radial-gradient(
      circle at 50% 76%,
      rgba(0,151,57,0.22) 0 2px,
      transparent 2px 20px,
      rgba(255,255,255,0.04) 20px 22px,
      transparent 22px 46px
    ),
    linear-gradient(
      155deg,
      #020504 0%,
      #07100c 24%,
      #5a1119 50%,
      #0b4f26 76%,
      #031e11 100%
    );
  --portal-workspace-symbol-surface:
    radial-gradient(circle at 18% 20%, rgba(255,255,255,0.1), transparent 20%),
    radial-gradient(circle at 78% 28%, rgba(255,255,255,0.08), transparent 22%),
    radial-gradient(circle at 50% 76%, rgba(255,255,255,0.06), transparent 24%),
    repeating-radial-gradient(
      circle at 18% 20%,
      transparent 0 32px,
      rgba(255,255,255,0.08) 32px 34px,
      transparent 34px 68px
    ),
    repeating-radial-gradient(
      circle at 78% 28%,
      transparent 0 38px,
      rgba(255,255,255,0.06) 38px 40px,
      transparent 40px 80px
    ),
    repeating-radial-gradient(
      circle at 50% 76%,
      transparent 0 36px,
      rgba(255,255,255,0.05) 36px 38px,
      transparent 38px 76px
    ),
    linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.04) 28%, rgba(0,0,0,0.22) 100%);
  --portal-ambient-panel-surface:
    radial-gradient(circle at 16% 18%, rgba(255,255,255,0.1), transparent 12%),
    repeating-radial-gradient(
      circle at 16% 18%,
      rgba(255,255,255,0.1) 0 1.5px,
      transparent 1.5px 14px,
      rgba(255,255,255,0.06) 14px 16px,
      transparent 16px 34px
    ),
    repeating-radial-gradient(
      circle at 82% 18%,
      rgba(227,6,19,0.18) 0 1.5px,
      transparent 1.5px 16px,
      rgba(255,255,255,0.05) 16px 18px,
      transparent 18px 38px
    ),
    repeating-radial-gradient(
      circle at 28% 82%,
      rgba(0,151,57,0.18) 0 2px,
      transparent 2px 18px,
      rgba(255,255,255,0.05) 18px 20px,
      transparent 20px 42px
    ),
    linear-gradient(
      160deg,
      rgba(4,7,6,0.98) 0%,
      rgba(10,15,12,0.96) 28%,
      rgba(90,16,26,0.9) 52%,
      rgba(8,70,34,0.94) 76%,
      rgba(4,42,22,0.98) 100%
    );
}
body {
  margin: 0;
  min-height: 100vh;
  position: relative;
  isolation: isolate;
  font-family: "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(0, 151, 57, 0.12), transparent 24%),
    radial-gradient(circle at top right, rgba(227, 6, 19, 0.1), transparent 20%),
    linear-gradient(180deg, #ffffff 0%, #f6f8f7 52%, #ffffff 100%);
  color: var(--dark);
}
body.portal-body--workspace::before,
body.portal-body--workspace::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
}
body.portal-body--workspace::before {
  z-index: -2;
  opacity: 1;
  background: var(--portal-ambient-surface);
  filter: saturate(1.04);
  transform-origin: center;
  will-change: transform, opacity;
  animation: portalAmbientDrift 34s ease-in-out infinite alternate;
}
body.portal-body--workspace::after {
  z-index: -1;
  display: block;
  opacity: 0.72;
  background: var(--portal-workspace-symbol-surface);
  transform-origin: center;
  will-change: transform, opacity;
  animation: portalRipplePulse 26s ease-in-out infinite alternate-reverse;
}
@keyframes portalAmbientDrift {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.94;
  }
  50% {
    transform: translate3d(-1.4%, 1.2%, 0) scale(1.03);
    opacity: 1;
  }
  100% {
    transform: translate3d(1%, -1%, 0) scale(1.05);
    opacity: 0.96;
  }
}
@keyframes portalRipplePulse {
  0% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.58;
  }
  50% {
    transform: translate3d(1.2%, -1%, 0) scale(1.02);
    opacity: 0.78;
  }
  100% {
    transform: translate3d(-1%, 1.1%, 0) scale(1.04);
    opacity: 0.66;
  }
}
@media (prefers-reduced-motion: reduce) {
  body.portal-body--workspace::before,
  body.portal-body--workspace::after {
    animation: none;
  }
}
a { color: var(--primary); text-decoration: none; }
.shell {
  position: relative;
  z-index: 1;
  max-width: 820px;
  margin: 0 auto;
  padding: 18px 14px 56px;
}
.shell.portal-shell {
  max-width: 1240px;
  padding-top: 24px;
}
.hero {
  display: grid;
  gap: 18px;
  margin-bottom: 18px;
  padding: 2px 0 12px;
}
.hero-main {
  display: grid;
  gap: 12px;
  align-content: start;
}
.hero.has-aside {
  align-items: stretch;
}
.hero h1 {
  margin: 0;
  max-width: 12ch;
  font-size: clamp(1.95rem, 7vw, 3rem);
  line-height: 1;
  letter-spacing: -0.05em;
  font-weight: 750;
}
.hero p,
.hero-description p {
  margin: 0;
  max-width: 42ch;
  font-size: 14px;
  line-height: 1.75;
  color: var(--gray700);
}
.hero-description {
  display: grid;
  gap: 10px;
}
.hero-eyebrow {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 700;
}
.hero.portal-hero h1 {
  max-width: 11ch;
  font-size: clamp(2.4rem, 6vw, 4.5rem);
  line-height: 0.94;
}
.hero.portal-hero:not(.has-aside) {
  gap: 6px;
  margin-bottom: 10px;
  padding-bottom: 2px;
}
.hero.portal-hero:not(.has-aside) h1 {
  max-width: none;
  font-size: clamp(1.55rem, 4vw, 2.45rem);
  line-height: 1.02;
  letter-spacing: -0.035em;
}
.hero.portal-hero:not(.has-aside) .hero-description p {
  max-width: 56ch;
  font-size: 13px;
  line-height: 1.7;
}
.hero.portal-hero--walkthrough {
  gap: 4px;
  margin-bottom: 8px;
  padding-bottom: 0;
}
.hero.portal-hero--walkthrough .hero-main {
  gap: 4px;
}
.hero.portal-hero--walkthrough h1 {
  max-width: none;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  line-height: 1;
  letter-spacing: -0.03em;
}
.hero.portal-hero--walkthrough .hero-description p {
  max-width: none;
  font-size: 12px;
  line-height: 1.55;
  color: var(--gray600);
}
.hero.portal-hero .hero-description p {
  max-width: 60ch;
  font-size: 15px;
  line-height: 1.85;
}
.hero-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.hero-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(10px);
  color: var(--gray900);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 800;
}
.hero-feature-list {
  display: grid;
  gap: 12px;
}
.hero-feature-item {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.58);
  backdrop-filter: blur(10px);
}
.hero-feature-item strong {
  font-size: 14px;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--gray900);
}
.hero-feature-item span {
  font-size: 13px;
  line-height: 1.65;
  color: var(--gray700);
}
.hero-aside {
  display: grid;
  gap: 16px;
  align-content: start;
}
.hero-visual-shell {
  display: grid;
  gap: 16px;
}
.hero-status-card {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 26px;
  border: 1px solid rgba(52,58,64,0.08);
  background:
    radial-gradient(circle at top right, rgba(227,6,19,0.08), transparent 34%),
    linear-gradient(180deg, rgba(255,255,255,0.88), rgba(247,249,248,0.8));
  box-shadow: 0 18px 46px rgba(13,50,31,0.08);
  backdrop-filter: blur(12px);
}
.hero-status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.hero-status-label {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 800;
}
.hero-status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 92px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(52,58,64,0.08);
  color: var(--gray900);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 800;
}
.hero-status-indicator.is-busy {
  background: rgba(23,162,184,0.14);
  color: var(--info);
}
.hero-status-indicator.is-active {
  background: rgba(0,151,57,0.14);
  color: var(--secondary);
}
.hero-status-indicator.is-readonly {
  background: rgba(52,58,64,0.14);
  color: var(--gray900);
}
.hero-status-hint {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--gray700);
}
.hero-status-track {
  display: grid;
  gap: 8px;
}
.hero-status-progress {
  overflow: hidden;
  height: 10px;
  border-radius: 999px;
  background: rgba(52,58,64,0.08);
}
.hero-status-progress-value {
  display: block;
  height: 100%;
  width: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(0,151,57,0.92), rgba(227,6,19,0.92));
  transition: width 220ms ease;
}
.hero-status-progress-text {
  font-size: 12px;
  line-height: 1.5;
  color: var(--gray700);
  font-weight: 700;
}
.hero-visual-stage {
  position: relative;
  overflow: hidden;
  min-height: 360px;
  margin: 0;
  border-radius: 30px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(221,226,222,0.82);
  box-shadow: 0 28px 70px rgba(13,50,31,0.14);
}
.hero-visual-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.02);
}
.hero-visual-overlay {
  position: absolute;
  right: 18px;
  bottom: 18px;
  left: 18px;
  display: grid;
  gap: 6px;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(20,24,21,0.74));
  backdrop-filter: blur(10px);
}
.hero-visual-kicker {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.76);
  font-weight: 700;
}
.hero-visual-overlay strong {
  font-size: 18px;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--white);
}
.hero-visual-overlay p {
  margin: 0;
  max-width: none;
  color: rgba(255,255,255,0.84);
  font-size: 13px;
  line-height: 1.65;
}
.hero-metric-grid {
  display: grid;
  gap: 12px;
}
.hero-metric-card {
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  border-radius: 20px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.74);
  box-shadow: 0 12px 34px rgba(13,50,31,0.08);
  backdrop-filter: blur(10px);
}
.hero-metric-card span {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 800;
}
.hero-metric-card strong {
  font-size: 15px;
  line-height: 1.35;
  letter-spacing: -0.015em;
  color: var(--gray900);
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
  gap: 18px;
  padding: 4px 0 22px;
  transition: opacity 160ms ease, filter 160ms ease;
}
.portal-entry-intro {
  display: grid;
  gap: 14px;
}
.portal-intro-shell {
  display: grid;
  gap: 18px;
}
.portal-intro-header {
  display: grid;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 28px;
  border: 1px solid rgba(52,58,64,0.08);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.82), rgba(247,249,248,0.72));
  box-shadow: 0 18px 44px rgba(13,50,31,0.06);
  backdrop-filter: blur(16px);
}
.portal-intro-progress {
  display: grid;
  gap: 8px;
}
.portal-intro-progress strong {
  font-size: clamp(1.2rem, 3.4vw, 1.7rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--gray900);
}
.portal-intro-progress p {
  margin: 0;
  max-width: 62ch;
  font-size: 13px;
  line-height: 1.75;
  color: var(--gray700);
}
.portal-route-frame {
  display: grid;
  gap: 14px;
}
.portal-route-stage {
  display: grid;
  gap: 4px;
  padding: 16px 18px;
  border-radius: 22px;
  border: 1px solid rgba(52,58,64,0.08);
  background:
    radial-gradient(circle at top right, rgba(0,151,57,0.08), transparent 42%),
    rgba(255,255,255,0.74);
  box-shadow: 0 14px 32px rgba(13,50,31,0.05);
}
.portal-route-stage-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 800;
}
.portal-route-stage strong {
  font-size: 15px;
  line-height: 1.35;
  letter-spacing: -0.015em;
  color: var(--gray900);
}
.portal-route-stage span:last-child {
  font-size: 13px;
  line-height: 1.65;
  color: var(--gray700);
}
.portal-intro-step-list {
  display: grid;
  gap: 10px;
}
.portal-intro-step {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 20px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.62);
  box-shadow: 0 12px 30px rgba(13,50,31,0.04);
  color: var(--gray900);
  text-align: left;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
}
.portal-intro-step:hover,
.portal-intro-step:focus-visible {
  transform: translateY(-1px);
  border-color: rgba(0,151,57,0.18);
  background: rgba(255,255,255,0.82);
}
.portal-intro-step.is-current {
  border-color: rgba(0,151,57,0.22);
  background:
    radial-gradient(circle at top right, rgba(0,151,57,0.08), transparent 42%),
    linear-gradient(180deg, rgba(255,255,255,0.92), rgba(245,249,246,0.86));
  box-shadow: 0 16px 36px rgba(13,50,31,0.08);
}
.portal-intro-step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(52,58,64,0.08);
  color: var(--gray900);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 800;
}
.portal-intro-step.is-current .portal-intro-step-index {
  background: rgba(0,151,57,0.14);
  color: var(--secondary);
}
.portal-intro-step-copy {
  display: grid;
  gap: 2px;
}
.portal-intro-step-copy strong {
  font-size: 14px;
  line-height: 1.3;
  letter-spacing: -0.01em;
}
.portal-intro-step-copy span {
  font-size: 12px;
  line-height: 1.5;
  color: var(--gray600);
}
.portal-intro-panels {
  display: grid;
}
.portal-intro-panel {
  display: grid;
  gap: 14px;
  animation: fade-slide-up 220ms ease;
}
.portal-intro-panel[hidden] {
  display: none !important;
}
.portal-intro-marker-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.portal-intro-marker {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 999px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.74);
  color: var(--gray600);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 800;
}
.portal-intro-marker.is-current {
  border-color: rgba(0,151,57,0.2);
  background: rgba(0,151,57,0.1);
  color: var(--primary);
}
.portal-stage {
  display: grid;
  gap: 18px;
}
.portal-stage-kicker {
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.78);
  font-weight: 800;
}
.portal-stage-title {
  margin: 0;
  max-width: 16ch;
  font-size: clamp(2rem, 6vw, 3.35rem);
  line-height: 0.96;
  letter-spacing: -0.05em;
  color: var(--white);
}
.portal-stage-copy {
  margin: 0;
  max-width: 48ch;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(255,255,255,0.88);
}
.portal-stage-copyblock {
  display: grid;
  gap: 10px;
  max-width: 58ch;
}
.portal-stage-copyblock .portal-stage-kicker {
  color: #117f48;
  font-weight: 850;
}
.portal-stage-copyblock .portal-stage-title {
  max-width: 24ch;
  font-size: clamp(1.8rem, 5vw, 2.7rem);
  line-height: 0.98;
  color: var(--gray900);
}
.portal-stage-copyblock .portal-stage-copy {
  color: #102218;
  font-weight: 600;
}
.portal-stage-stack {
  display: grid;
  gap: 14px;
  align-content: end;
}
.portal-stage-card {
  display: grid;
  gap: 8px;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(52,58,64,0.08);
  background:
    radial-gradient(circle at top right, rgba(227,6,19,0.05), transparent 30%),
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,249,248,0.98));
  box-shadow: 0 18px 40px rgba(13,50,31,0.06);
}
.portal-stage-card--accent {
  background:
    radial-gradient(circle at top right, rgba(0,151,57,0.12), transparent 34%),
    linear-gradient(180deg, rgba(247,251,248,0.98), rgba(241,247,243,0.98));
}
.portal-stage-card-label {
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #117f48;
  font-weight: 850;
}
.portal-stage-card strong {
  font-size: 17px;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: var(--gray900);
}
.portal-stage-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: #102218;
  font-weight: 600;
}
.portal-stage-card em {
  font-style: normal;
  font-weight: 800;
  color: var(--primary);
}
.portal-pathway-choice-grid {
  display: grid;
  width: 100%;
  grid-template-columns: 1fr;
  gap: 14px;
}
.portal-pathway-choice,
button.portal-pathway-choice {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  justify-content: start;
  width: 100%;
  min-height: 78px;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.12);
  background: linear-gradient(180deg, rgba(18,34,24,0.96), rgba(11,31,21,0.98));
  box-shadow: 0 14px 28px rgba(7,20,13,0.18);
  color: #ffffff;
  text-align: left;
  transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
}
.portal-pathway-choice:hover,
.portal-pathway-choice:focus-visible {
  border-color: rgba(255,255,255,0.18);
  background: linear-gradient(180deg, rgba(22,42,30,0.98), rgba(12,33,22,1));
  box-shadow:
    0 14px 28px rgba(7,20,13,0.2),
    0 0 0 4px rgba(17,127,72,0.08);
}
.portal-pathway-choice[data-selected="true"] {
  border-color: rgba(116,217,162,0.34);
  background: linear-gradient(180deg, rgba(17,127,72,0.96), rgba(11,111,63,0.98));
  box-shadow: 0 16px 30px rgba(9,72,42,0.24);
}
.portal-pathway-choice-indicator {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 1.5px solid rgba(255,255,255,0.42);
  background: rgba(255,255,255,0.06);
}
.portal-pathway-choice-indicator::after {
  content: "";
  width: 6px;
  height: 10px;
  border: solid transparent;
  border-width: 0 2px 2px 0;
  opacity: 0;
  transform: rotate(45deg) translate(-1px, -1px);
  transition: opacity 160ms ease, border-color 160ms ease;
}
.portal-pathway-choice[data-selected="true"] .portal-pathway-choice-indicator {
  border-color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.14);
}
.portal-pathway-choice[data-selected="true"] .portal-pathway-choice-indicator::after {
  border-color: #ffffff;
  opacity: 1;
}
.portal-pathway-choice-copy {
  display: grid;
  gap: 4px;
  align-items: start;
}
.portal-pathway-choice-word {
  font-size: clamp(1.08rem, 2.4vw, 1.2rem);
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-weight: 800;
  color: #ffffff;
}
.portal-pathway-choice-meta {
  display: block;
  min-height: 0;
  padding: 0;
  border-radius: 0;
  background: transparent;
  font-size: 13px;
  line-height: 1.35;
  color: rgba(255,255,255,0.82);
  font-weight: 650;
  letter-spacing: 0;
  box-shadow: none;
}
.portal-pathway-choice[data-selected="true"] .portal-pathway-choice-meta {
  background: transparent;
  color: rgba(255,255,255,0.94);
}
.portal-inline-hint {
  display: block;
  max-width: 54ch;
}
.portal-country-field {
  display: grid;
  gap: 8px;
}
.portal-country-field.is-hidden {
  display: none;
}
.portal-selection-confirmation {
  gap: 8px;
  padding-top: 2px;
}
.portal-commitment-grid {
  display: grid;
  gap: 14px;
}
.portal-commitment-card {
  display: grid;
  gap: 8px;
  padding: 20px;
  border-radius: 24px;
  border: 1px solid rgba(52,58,64,0.08);
  background:
    radial-gradient(circle at top right, rgba(227,6,19,0.04), transparent 30%),
    rgba(255,255,255,0.94);
  box-shadow: 0 18px 40px rgba(13,50,31,0.06);
}
.portal-commitment-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 800;
}
.portal-commitment-card strong {
  font-size: 18px;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--gray900);
}
.portal-commitment-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--gray700);
}
.portal-commitment-documents {
  display: grid;
  gap: 2px;
}
.portal-commitment-documents .portal-entry-item {
  padding: 10px 0;
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
.portal-entry--application {
  padding-bottom: 14px;
}
.portal-entry.is-compact .portal-intro-header,
.portal-entry.is-compact .portal-entry-actions,
.portal-entry.is-compact [data-intro-step-panel="welcome"],
.portal-entry.is-compact [data-intro-step-panel="requirements"] {
  display: none !important;
}
.portal-entry.is-compact .portal-entry-intro {
  grid-template-columns: 1fr;
}
.portal-entry.is-compact .portal-entry-card--profile {
  gap: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
.portal-entry.is-compact .portal-entry-card--profile .portal-entry-card-head,
.portal-entry.is-compact .portal-entry-card--pathway-guide {
  display: none;
}
.portal-entry-grid {
  display: grid;
  gap: 14px;
}
.portal-entry-card {
  display: grid;
  gap: 14px;
  padding: 20px;
  border-radius: 28px;
  border: 1px solid rgba(52,58,64,0.08);
  background:
    radial-gradient(circle at top right, rgba(227,6,19,0.05), transparent 30%),
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,249,248,0.98));
  box-shadow: 0 20px 48px rgba(13,50,31,0.06);
}
.portal-entry-card--welcome {
  gap: 18px;
}
.portal-entry-card--welcome-copy {
  align-content: center;
}
.portal-entry-card--welcome-visual {
  align-content: start;
}
.portal-entry-card--profile {
  align-content: start;
}
.portal-entry-card--pathway-guide,
.portal-entry-card--journey,
.portal-entry-card--walkthrough {
  align-content: start;
}
.portal-workspace-banner {
  display: grid;
  gap: 16px;
}
.portal-workspace-banner-main {
  align-content: start;
}
.portal-workspace-banner-side {
  display: grid;
  gap: 14px;
  align-content: start;
}
.portal-workspace-actions {
  display: grid;
  gap: 10px;
  align-items: center;
}
.portal-workspace-note {
  font-size: 13px;
  line-height: 1.65;
  color: var(--gray700);
}
.portal-entry-welcome-copyblock {
  display: grid;
  gap: 8px;
}
.portal-entry-welcome-title {
  margin: 0;
  max-width: 18ch;
  font-size: clamp(1.6rem, 4.8vw, 2.45rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
  color: var(--gray900);
}
.portal-entry-welcome-copy {
  margin: 0;
  max-width: 56ch;
  font-size: 14px;
  line-height: 1.8;
  color: var(--gray700);
}
.portal-welcome-markers {
  display: grid;
  gap: 10px;
}
.portal-welcome-marker {
  display: grid;
  gap: 4px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.68);
  backdrop-filter: blur(10px);
}
.portal-welcome-marker strong {
  font-size: 14px;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--gray900);
}
.portal-welcome-marker span {
  font-size: 13px;
  line-height: 1.65;
  color: var(--gray700);
}
.portal-live-grid {
  display: grid;
  gap: 12px;
}
.portal-live-card {
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(10px);
}
.portal-live-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 800;
}
.portal-live-value {
  font-size: 15px;
  line-height: 1.35;
  letter-spacing: -0.015em;
  color: var(--gray900);
}
.portal-live-note {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--gray700);
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
.portal-walkthrough-list,
.portal-journey-grid {
  display: grid;
  gap: 12px;
}
.portal-walkthrough-item,
.portal-journey-step {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: start;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.72);
  backdrop-filter: blur(10px);
}
.portal-walkthrough-index,
.portal-journey-step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(227,6,19,0.1);
  color: var(--primary);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 800;
}
.portal-journey-step-index {
  background: rgba(0,151,57,0.12);
  color: var(--secondary);
}
.portal-walkthrough-copy,
.portal-journey-step-copy {
  display: grid;
  gap: 4px;
}
.portal-walkthrough-copy strong,
.portal-journey-step-copy strong {
  font-size: 14px;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--gray900);
}
.portal-walkthrough-copy p,
.portal-journey-step-copy p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: var(--gray700);
}
.portal-glass-band {
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(52,58,64,0.08);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.54), rgba(245,249,246,0.72));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.66);
  backdrop-filter: blur(12px);
}
.portal-glass-band strong {
  font-size: 14px;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--gray900);
}
.portal-glass-band span {
  font-size: 13px;
  line-height: 1.65;
  color: var(--gray700);
}
.portal-pathway-guide-grid {
  display: grid;
  gap: 12px;
}
.portal-pathway-guide-card {
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(10px);
  transition: border-color 160ms ease, transform 160ms ease, background 160ms ease;
}
.portal-pathway-guide-card[data-selected="true"] {
  border-color: rgba(0,151,57,0.24);
  background:
    radial-gradient(circle at top right, rgba(0,151,57,0.08), transparent 42%),
    rgba(255,255,255,0.84);
  transform: translateY(-1px);
}
.portal-pathway-guide-kicker {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--gray600);
  font-weight: 800;
}
.portal-pathway-guide-card strong {
  font-size: 14px;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--gray900);
}
.portal-pathway-guide-card p {
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
.portal-entry-actions button {
  min-width: 112px;
}
.portal-entry.is-loading-intro .portal-intro-step {
  pointer-events: none;
  opacity: 0.8;
}
.portal-entry-actions button.is-loading {
  position: relative;
  color: transparent;
  pointer-events: none;
}
.portal-entry-actions button.is-loading::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px;
  height: 18px;
  margin: -9px 0 0 -9px;
  border-radius: 999px;
  border: 2px solid rgba(255,255,255,0.45);
  border-top-color: rgba(255,255,255,0.95);
  animation: spin 720ms linear infinite;
}
.portal-entry-actions button.ghost.is-loading::after {
  border-color: rgba(52,58,64,0.18);
  border-top-color: rgba(52,58,64,0.86);
}
.portal-entry-action-copy {
  display: grid;
  gap: 4px;
  min-width: min(100%, 480px);
}
.portal-entry-action-copy strong {
  font-size: 15px;
  line-height: 1.35;
  letter-spacing: -0.015em;
  color: var(--gray900);
}
.portal-entry-action-copy span {
  font-size: 13px;
  line-height: 1.65;
  color: var(--gray700);
}
.portal-main-experience {
  display: grid;
  gap: 0;
  padding-top: 12px;
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
.country-suggestion-list[hidden] {
  display: none !important;
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
  display: grid;
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
  -webkit-tap-highlight-color: transparent;
  border: 0;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  cursor: pointer;
  background: var(--primary);
  color: var(--white);
}
button:focus,
.button:focus {
  outline: none;
}
button:focus-visible,
.button:focus-visible {
  outline: 2px solid rgba(17,127,72,0.34);
  outline-offset: 3px;
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
.inline-choice:disabled {
  opacity: 0.56;
  cursor: not-allowed;
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
.inline-choice-group.is-invalid .inline-choice-indicator {
  border-color: rgba(227,6,19,0.58);
  box-shadow: 0 0 0 4px rgba(227,6,19,0.1);
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
body.flow-section-drawer-open {
  overflow: hidden;
}
.flow-header {
  position: sticky;
  top: 12px;
  z-index: 24;
  display: grid;
  gap: 10px;
  width: 100%;
  margin-top: 0;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  overflow: visible;
}
.flow-header::before {
  content: none;
}
.flow-header-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  justify-items: start;
  gap: 10px;
}
.flow-header-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}
.flow-header-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.flow-current-step-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(7,18,12,0.05);
  color: var(--gray800);
  white-space: nowrap;
}
.flow-header-copy h2 {
  margin: 0;
  min-width: 0;
  font-size: clamp(1.12rem, 2.5vw, 1.42rem);
  line-height: 1.12;
  letter-spacing: -0.03em;
  font-weight: 750;
}
.flow-header-copy p {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
  color: var(--gray700);
  max-width: 48ch;
}
.flow-header-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.flow-summary-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.76);
  font-size: 12px;
  line-height: 1.2;
  color: var(--gray700);
}
.flow-summary-chip strong {
  color: var(--gray900);
  font-size: 12px;
}
.flow-profile-context-label,
.flow-section-menu-button-label,
.flow-drawer-step-kicker {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.flow-profile-context-label {
  color: var(--gray600);
}
.flow-step-counter {
  color: var(--gray800);
  font-weight: 800;
}
.flow-summary-chip--status {
  background: rgba(7,18,12,0.04);
}
.flow-summary-chip--status.is-pending {
  color: var(--gray800);
}
.flow-summary-chip--status.is-active {
  color: #0f6c3a;
  background: rgba(17,127,72,0.08);
  border-color: rgba(17,127,72,0.14);
}
.flow-summary-chip--status.is-complete {
  color: #0f6c3a;
  background: rgba(17,127,72,0.1);
  border-color: rgba(17,127,72,0.16);
}
.flow-summary-chip--status.is-issue {
  color: #a3261a;
  background: rgba(198,40,40,0.1);
  border-color: rgba(198,40,40,0.16);
}
.flow-section-menu-button {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  justify-self: start;
  width: min(100%, 420px);
  padding: 11px 12px;
  border-radius: 20px;
  border: 1px solid rgba(149,232,187,0.28);
  background: linear-gradient(135deg, #117f48, #17985a);
  color: #ffffff;
  text-align: left;
  box-shadow: 0 14px 30px rgba(9,55,31,0.16);
  transition: border-color 160ms ease, background 160ms ease, transform 160ms ease;
}
.flow-section-menu-button:hover,
.flow-section-menu-button:focus-visible {
  border-color: rgba(188,244,210,0.36);
  background: linear-gradient(135deg, #0f6f40, #168c54);
}
.flow-section-menu-button:active {
  transform: translateY(1px);
}
.flow-section-menu-button-icon {
  display: grid;
  gap: 4px;
  width: 20px;
  flex: 0 0 auto;
}
.flow-section-menu-button-bar {
  display: block;
  width: 20px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  transform-origin: center;
  transition: transform 160ms ease, opacity 160ms ease;
}
.flow-section-menu-button[aria-expanded="true"] .flow-section-menu-button-bar:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}
.flow-section-menu-button[aria-expanded="true"] .flow-section-menu-button-bar:nth-child(2) {
  opacity: 0;
}
.flow-section-menu-button[aria-expanded="true"] .flow-section-menu-button-bar:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}
.flow-section-menu-button-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}
.flow-section-menu-button-label {
  color: rgba(255,255,255,0.72);
}
.flow-section-menu-button strong {
  display: block;
  min-width: 0;
  font-size: 15px;
  line-height: 1.2;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.flow-section-menu-button-meta {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.14);
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}
.flow-progress-track {
  position: relative;
  justify-self: start;
  width: min(100%, 420px);
  height: 4px;
  border-radius: 999px;
  background: rgba(17,127,72,0.14);
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
  display: none;
}
.flow-step-tabs::-webkit-scrollbar {
  display: none;
}
.flow-step-tab,
button.flow-step-tab,
.button.flow-step-tab {
  display: grid;
  align-items: start;
  gap: 7px;
  min-width: max-content;
  padding: 10px 12px 8px;
  border-radius: 18px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.72);
  color: var(--dark);
  text-align: left;
  transition: color 140ms ease, border-color 140ms ease, background 140ms ease, transform 140ms ease;
}
.flow-step-tab:hover,
.flow-step-tab:focus-visible {
  color: var(--gray900);
  border-color: rgba(17,127,72,0.14);
  background: rgba(255,255,255,0.94);
}
.flow-step-tab-indicator {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 54px;
  height: 8px;
  flex: 0 0 auto;
}
.flow-step-tab-indicator::before {
  content: "";
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: rgba(52,58,64,0.22);
}
.flow-step-tab.is-active .flow-step-tab-indicator::before {
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
.flow-step-tab.is-active {
  border-color: rgba(17,127,72,0.16);
  background: rgba(17,127,72,0.08);
}
.flow-step-tab.is-complete {
  background: rgba(11,143,66,0.04);
}
.flow-step-tab.is-issue {
  background: rgba(198,40,40,0.04);
}
.flow-step-tab-label {
  font-size: 11px;
  line-height: 1.3;
  color: #31433a;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}
.flow-section-drawer-backdrop {
  display: block;
  position: fixed;
  inset: 0;
  z-index: 40;
  opacity: 0;
  pointer-events: none;
  background: rgba(4,12,8,0.36);
  transition: opacity 180ms ease;
}
.flow-section-drawer-backdrop[data-open="true"] {
  opacity: 1;
  pointer-events: auto;
}
.flow-section-drawer {
  position: absolute;
  inset: 0 auto 0 0;
  width: min(92vw, 360px);
  padding: 20px 18px 26px;
  display: grid;
  gap: 16px;
  background:
    radial-gradient(circle at top right, rgba(17,127,72,0.24), transparent 30%),
    radial-gradient(circle at bottom left, rgba(62,176,93,0.18), transparent 28%),
    linear-gradient(180deg, rgba(7,18,12,0.98), rgba(10,26,17,0.98));
  box-shadow: 0 24px 56px rgba(0,0,0,0.3);
  overflow-y: auto;
  transform: translateX(-104%);
  transition: transform 180ms ease;
}
.flow-section-drawer-backdrop[data-open="true"] .flow-section-drawer {
  transform: translateX(0);
}
.flow-section-drawer-header,
.flow-section-drawer-copy,
.flow-section-drawer-meta,
.flow-step-drawer-list {
  display: grid;
  gap: 10px;
}
.flow-section-drawer-header {
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 12px;
}
.flow-section-drawer-copy h3 {
  margin: 0;
  color: #ffffff;
  font-size: 1.15rem;
  line-height: 1.15;
  letter-spacing: -0.03em;
}
.flow-section-drawer-copy p,
.flow-drawer-step-title {
  margin: 0;
}
.flow-section-drawer-copy .section-kicker {
  color: rgba(255,255,255,0.62);
}
.flow-section-drawer-copy p {
  color: rgba(234,244,237,0.76);
  font-size: 13px;
  line-height: 1.55;
}
.flow-section-drawer-close {
  min-height: 36px;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid rgba(149,232,187,0.18);
  background: rgba(17,127,72,0.18);
  color: #ffffff;
}
.flow-section-drawer .flow-summary-chip {
  background: rgba(17,127,72,0.16);
  border-color: rgba(149,232,187,0.18);
  color: rgba(255,255,255,0.8);
}
.flow-section-drawer .flow-summary-chip strong {
  color: #ffffff;
}
.flow-section-drawer .flow-profile-context-label {
  color: rgba(255,255,255,0.62);
}
.flow-progress-track--drawer {
  background: rgba(149,232,187,0.16);
}
.flow-drawer-step,
button.flow-drawer-step {
  display: grid;
  gap: 10px;
  padding: 14px 14px 12px;
  border-radius: 20px;
  border: 1px solid rgba(149,232,187,0.16);
  background: linear-gradient(180deg, rgba(17,127,72,0.18), rgba(9,38,21,0.28));
  color: #ffffff;
  text-align: left;
  transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
}
.flow-drawer-step:hover,
.flow-drawer-step:focus-visible {
  border-color: rgba(188,244,210,0.28);
  background: linear-gradient(180deg, rgba(17,127,72,0.24), rgba(11,49,27,0.34));
}
.flow-drawer-step.is-active {
  border-color: rgba(188,244,210,0.36);
  background: linear-gradient(180deg, rgba(17,127,72,0.32), rgba(12,72,40,0.34));
}
.flow-drawer-step.is-complete {
  border-color: rgba(149,232,187,0.24);
  background: linear-gradient(180deg, rgba(17,127,72,0.24), rgba(9,38,21,0.32));
}
.flow-drawer-step.is-issue {
  border-color: rgba(194,224,135,0.24);
  background: linear-gradient(180deg, rgba(89,118,25,0.24), rgba(37,53,10,0.3));
}
.flow-drawer-step-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.flow-drawer-step-kicker {
  color: inherit;
}
.flow-drawer-step-status {
  font-size: 11px;
  font-weight: 700;
  color: rgba(234,244,237,0.82);
}
.flow-drawer-step.is-active .flow-drawer-step-status,
.flow-drawer-step.is-complete .flow-drawer-step-status {
  color: #d8ffe6;
}
.flow-drawer-step.is-issue .flow-drawer-step-status {
  color: #efffc9;
}
.flow-workspace-grid {
  display: block;
  gap: 18px;
}
.flow-section-rail {
  display: none !important;
}
.flow-rail-card {
  position: sticky;
  top: 18px;
  display: grid;
  gap: 14px;
  padding: 18px 16px;
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,0.14);
  background:
    linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04)),
    var(--portal-ambient-panel-surface);
  box-shadow: 0 24px 52px rgba(4,13,8,0.24);
  color: #ffffff;
  overflow: hidden;
}
.flow-rail-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(255,255,255,0.12), transparent 22%),
    linear-gradient(180deg, rgba(255,255,255,0.04), transparent 28%);
  pointer-events: none;
}
.flow-rail-card > * {
  position: relative;
  z-index: 1;
}
.flow-rail-kicker {
  color: rgba(255,255,255,0.62);
}
.flow-rail-title {
  margin: 0;
  font-size: clamp(1.16rem, 1.8vw, 1.34rem);
  line-height: 1.14;
  letter-spacing: -0.03em;
  color: #ffffff;
}
.flow-rail-copy {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: rgba(234,244,237,0.78);
}
.flow-rail-meta,
.flow-step-rail-list {
  display: grid;
  gap: 10px;
}
.flow-summary-chip--rail {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.8);
}
.flow-summary-chip--rail strong {
  color: #ffffff;
}
.flow-progress-track--rail {
  background: rgba(255,255,255,0.16);
}
.flow-rail-step,
button.flow-rail-step {
  display: grid;
  gap: 8px;
  padding: 13px 14px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  color: #ffffff;
  text-align: left;
  transition: border-color 150ms ease, background 150ms ease, transform 150ms ease;
}
.flow-rail-step:hover,
.flow-rail-step:focus-visible {
  border-color: rgba(149,232,187,0.24);
  background: rgba(255,255,255,0.1);
}
.flow-rail-step.is-active {
  border-color: rgba(149,232,187,0.34);
  background: rgba(17,127,72,0.18);
}
.flow-rail-step.is-complete {
  background: rgba(17,127,72,0.12);
}
.flow-rail-step.is-issue {
  border-color: rgba(255,111,97,0.22);
  background: rgba(198,40,40,0.16);
}
.flow-rail-step.is-complete .flow-rail-step-status {
  color: #d8ffe6;
}
.flow-rail-step.is-active .flow-rail-step-status {
  color: #d8ffe6;
}
.flow-rail-step.is-issue .flow-rail-step-status {
  color: #ffd9d6;
}
.flow-rail-step-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.flow-rail-step-kicker {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.64);
}
.flow-rail-step-status {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.74);
}
.flow-rail-step-title {
  font-size: 14px;
  line-height: 1.35;
  color: #ffffff;
}
.application-flow {
  display: grid;
  gap: 0;
  margin-top: 0;
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
  gap: 14px;
  max-width: 100%;
}
.section-main .row {
  gap: 12px;
  align-items: start;
}
.section-main .field-label-row span,
.section-main label,
.section-main .field-block {
  color: #102218;
  font-size: 13px;
  font-weight: 740;
  letter-spacing: -0.01em;
}
.section-main label {
  display: grid;
  gap: 8px;
  align-content: start;
}
.section-main .field-label-row {
  align-items: start;
  justify-content: flex-start;
}
.section-main .field-label-text,
.section-main .field-label-row > .field-label-text {
  display: inline-flex;
  align-items: baseline;
  flex-wrap: wrap;
  width: fit-content;
  max-width: 100%;
  line-height: 1.45;
}
.section-main .required-mark {
  margin-left: 0;
  white-space: nowrap;
}
.section-main .section-group,
.section-main form > label,
.section-main form > .field-block,
.section-main form > .row > label,
.section-main form > .row > .field-block {
  position: relative;
  padding: 12px 12px 11px;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.18);
  background: linear-gradient(180deg, rgba(255,255,255,0.78), rgba(244,249,245,0.66));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.76),
    0 10px 22px rgba(6,27,15,0.05);
}
.section-main .section-group > label,
.section-main .section-group > .field-block,
.section-main .section-group > .row > label,
.section-main .section-group > .row > .field-block {
  position: relative;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}
.section-main label:focus-within,
.section-main .field-block:focus-within {
  border-color: rgba(17,127,72,0.22);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.82),
    0 0 0 1px rgba(17,127,72,0.08),
    0 12px 24px rgba(6,27,15,0.08);
}
.section-main .section-group > label:focus-within,
.section-main .section-group > .field-block:focus-within,
.section-main .section-group > .row > label:focus-within,
.section-main .section-group > .row > .field-block:focus-within {
  border-color: transparent;
  box-shadow: none;
}
.section-main .section-group {
  gap: 14px;
  padding: 16px;
  border-radius: 22px;
  border-color: rgba(255,255,255,0.2);
  background: linear-gradient(180deg, rgba(255,255,255,0.74), rgba(241,247,243,0.62));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.76),
    0 14px 28px rgba(6,27,15,0.06);
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
  gap: 14px;
}
.section-group {
  display: grid;
  gap: 14px;
}
.section-group-title {
  margin: 0;
  font-size: 16px;
  line-height: 1.24;
  letter-spacing: -0.02em;
  text-transform: none;
  color: #102218;
  font-weight: 820;
}
.section-group-title::after {
  content: "";
  display: block;
  width: 42px;
  height: 3px;
  margin-top: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, #117f48 0%, rgba(17,127,72,0.14) 100%);
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
  width: 6px;
  height: 10px;
  border-radius: 0;
  background: transparent;
  border: solid #0b8f42;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
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
.section-main input,
.section-main textarea,
.section-main select {
  border-radius: 16px;
  border: 1px solid rgba(16,34,24,0.12);
  padding: 13px 14px;
  font-size: 14px;
  line-height: 1.5;
  font-weight: 600;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,249,245,0.96));
  color: #102218;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.84);
}
.section-main input::placeholder,
.section-main textarea::placeholder,
.section-main select::placeholder {
  color: rgba(16,34,24,0.48);
}
.section-main input:focus,
.section-main textarea:focus,
.section-main select:focus {
  border-color: rgba(17,127,72,0.44);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.88),
    0 0 0 4px rgba(17,127,72,0.12);
  background: rgba(255,255,255,0.99);
}
.section-main textarea {
  min-height: 122px;
}
.section-main .hint {
  font-size: 12px;
  line-height: 1.6;
  color: #174f31;
  font-weight: 650;
}
.section-main .input-with-prefix {
  border-color: rgba(16,34,24,0.12);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,249,245,0.96));
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.84);
}
.section-main .input-with-prefix:focus-within {
  border-color: rgba(17,127,72,0.44);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,0.88),
    0 0 0 4px rgba(17,127,72,0.12);
  background: rgba(255,255,255,0.99);
}
.section-main .input-prefix {
  border-right-color: rgba(16,34,24,0.1);
  background: rgba(237,246,240,0.96);
  color: #0e3a20;
  font-weight: 800;
}
.section-main .inline-choice-group {
  gap: 10px;
}
.section-main .inline-choice,
.section-main button.inline-choice,
.section-main .button.inline-choice {
  min-height: 40px;
  padding: 8px 12px;
  border-radius: 14px;
  border: 1px solid rgba(16,34,24,0.08);
  background: rgba(255,255,255,0.72);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.82);
}
.section-main .inline-choice:hover,
.section-main .inline-choice:focus-visible {
  border-color: rgba(17,127,72,0.16);
  background: rgba(255,255,255,0.94);
}
.section-main .inline-choice[data-selected="true"] {
  border-color: rgba(17,127,72,0.24);
  background: rgba(17,127,72,0.1);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.78);
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
.application-section[data-flow-section="SECTION_F_DECLARATION"] .declaration-box {
  background: rgba(7, 31, 22, 0.68);
  border-left-color: rgba(166, 234, 183, 0.58);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
}
.application-section[data-flow-section="SECTION_F_DECLARATION"] .declaration-item {
  color: rgba(255,255,255,0.96);
  font-weight: 500;
}
#documentUploadFeedback,
#submissionFeedback {
  color: rgba(255,255,255,0.97);
  font-weight: 500;
  background: rgba(8, 28, 20, 0.72);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
}
#documentUploadFeedback.info,
#submissionFeedback.info {
  border-color: rgba(123, 217, 232, 0.34);
  background: rgba(8, 28, 20, 0.72);
}
#documentUploadFeedback.success,
#submissionFeedback.success {
  border-color: rgba(143, 219, 154, 0.36);
  background: rgba(13, 48, 27, 0.76);
}
#documentUploadFeedback.error,
#submissionFeedback.error {
  border-color: rgba(255, 148, 148, 0.34);
  background: rgba(73, 26, 26, 0.76);
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
@keyframes fade-slide-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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
body.portal-body {
  background: transparent;
  color: var(--dark);
}
body.portal-body--workspace::before {
  opacity: 1;
  background: var(--portal-ambient-surface);
  filter: none;
}
body.portal-body--workspace::after {
  display: block;
  opacity: 0.72;
  background: var(--portal-workspace-symbol-surface);
}
.shell.portal-shell {
  max-width: none;
  min-height: 100vh;
  padding: 0;
}
.portal-status-banner {
  position: sticky;
  top: 18px;
  z-index: 5;
  margin: 18px 24px 0;
}
.portal-entry {
  min-height: 100vh;
  gap: 0;
  padding: 0;
}
.portal-entry--application {
  min-height: auto;
  gap: 0;
  padding: 0;
}
.portal-intro-shell {
  min-height: 100vh;
  padding: 24px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 18px;
  position: relative;
  isolation: isolate;
  overflow: hidden;
}
.portal-intro-shell--welcome {
  min-height: 100vh;
  padding: 0;
  grid-template-rows: 1fr;
  gap: 0;
}
.portal-intro-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.portal-intro-backdrop-image,
.portal-intro-backdrop-scrim {
  position: absolute;
  inset: 0;
}
.portal-intro-backdrop-image {
  background: var(--portal-ambient-surface);
  transform: none;
}
.portal-intro-backdrop-scrim {
  background:
    radial-gradient(circle at top left, rgba(105,216,139,0.12), transparent 26%),
    radial-gradient(circle at bottom right, rgba(227,6,19,0.12), transparent 24%),
    linear-gradient(180deg, rgba(7,16,11,0.28), rgba(7,16,11,0.42));
}
.portal-screen-header {
  display: grid;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(7,16,11,0.72);
  box-shadow: 0 24px 48px rgba(0,0,0,0.22);
  backdrop-filter: blur(20px);
}
.portal-screen-header--workspace {
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}
.portal-screen-header .portal-entry-badge {
  background: rgba(164,229,183,0.14);
  color: #ecfff2;
}
.portal-brand {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  color: var(--white);
}
.portal-brand-mark {
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 800;
}
.portal-brand-copy {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(235,245,238,0.72);
}
.portal-screen-progress {
  display: grid;
  justify-items: start;
}
.portal-screen-progress-meta[hidden] {
  display: none !important;
}
.portal-intro-panels,
.portal-intro-panel {
  min-height: 0;
}
.portal-intro-panels {
  position: relative;
  z-index: 1;
}
.portal-screen-canvas {
  display: grid;
  min-height: min(860px, calc(100vh - 246px));
}
.portal-screen-canvas--welcome {
  min-height: 100vh;
  width: 100%;
  padding: clamp(28px, 6vw, 84px);
  justify-items: center;
  align-content: center;
}
.portal-intro-shell--welcome .portal-intro-panels,
.portal-intro-shell--welcome .portal-intro-panel,
.portal-intro-shell--welcome .portal-screen-canvas--welcome {
  min-height: 100vh;
}
.portal-stage-copyblock--immersive {
  max-width: min(720px, 100%);
  gap: 16px;
}
.portal-stage-copyblock--landing {
  max-width: min(760px, 100%);
  gap: 18px;
  justify-items: center;
  text-align: center;
}
.portal-stage-copyblock--immersive .portal-stage-title {
  max-width: 9ch;
  font-size: clamp(3rem, 8vw, 5.8rem);
  line-height: 0.9;
}
.portal-stage-title--brand {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0 0.3ch;
}
.portal-stage-title--brand .portal-title-primary {
  color: #f5faf6;
}
.portal-stage-title--brand .portal-title-secondary {
  color: #8fddb0;
}
.portal-stage-title--landing {
  display: grid;
  gap: 8px;
  max-width: min(10.5ch, 100%);
  text-align: center;
  font-family: "Manrope", "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif;
  font-optical-sizing: auto;
  line-height: 0.94;
}
.portal-stage-title--landing .portal-title-primary,
.portal-stage-title--landing .portal-title-secondary {
  display: block;
}
.portal-stage-title--landing .portal-title-primary {
  font-size: clamp(2.35rem, 6vw, 4.3rem);
  line-height: 0.92;
  letter-spacing: -0.065em;
  font-weight: 650;
}
.portal-stage-title--landing .portal-title-secondary {
  font-size: clamp(1rem, 2.3vw, 1.5rem);
  line-height: 1.15;
  letter-spacing: 0.015em;
  font-weight: 520;
  color: rgba(201,240,214,0.92);
}
.portal-stage-copyblock--immersive .portal-stage-copy {
  max-width: 46ch;
  font-size: 15px;
  line-height: 1.8;
  color: rgba(245,250,246,0.82);
}
.portal-stage-cta {
  width: fit-content;
  min-width: 170px;
  padding: 14px 24px;
  border-radius: 999px;
  box-shadow: 0 18px 38px rgba(6, 27, 15, 0.3);
}
.portal-stage-story-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.portal-stage-story-card {
  display: grid;
  gap: 10px;
  padding: 18px 20px;
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(9,17,12,0.54);
  box-shadow: 0 24px 46px rgba(0,0,0,0.18);
  backdrop-filter: blur(16px);
}
.portal-stage-story-card--accent {
  background: linear-gradient(180deg, rgba(11,35,19,0.74), rgba(12,28,18,0.84));
}
.portal-stage-story-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(234,244,237,0.62);
  font-weight: 800;
}
.portal-stage-story-card strong {
  font-size: 18px;
  line-height: 1.25;
  color: var(--white);
}
.portal-stage-story-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: rgba(235,245,238,0.78);
}
.portal-stage-progress-track {
  overflow: hidden;
  height: 6px;
  border-radius: 999px;
  background: rgba(255,255,255,0.14);
}
.portal-stage-progress-value {
  display: block;
  width: 0;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #69d88b 0%, #c9f0d6 100%);
  transition: width 220ms ease;
}
.portal-screen-canvas--profile {
  gap: 20px;
  align-items: center;
  padding: 0;
  border-radius: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
}
.portal-intro-shell--profile {
  min-height: 100vh;
  padding: 24px;
  grid-template-rows: 1fr auto;
  gap: 18px;
}
.portal-intro-shell--requirements {
  min-height: 100vh;
  padding: clamp(28px, 5vw, 52px) clamp(20px, 4vw, 40px);
  grid-template-rows: 1fr;
  gap: 0;
}
.portal-screen-canvas--profile {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  justify-items: center;
  align-content: center;
}
.portal-screen-canvas--requirements {
  width: min(100%, 760px);
  min-height: min(720px, calc(100vh - 112px));
  margin: 0 auto;
  gap: 24px;
  padding: 0;
  justify-items: stretch;
  align-content: center;
}
.portal-profile-stage {
  display: grid;
  gap: 18px;
  width: min(100%, 560px);
  justify-items: center;
}
.portal-stage-copyblock--page {
  max-width: 60ch;
  gap: 12px;
}
.portal-stage-copyblock--profile {
  width: 100%;
  max-width: none;
  margin: 0;
  text-align: center;
  justify-items: center;
  gap: 6px;
}
.portal-stage-copyblock--profile .portal-stage-kicker {
  color: #117f48;
  font-weight: 850;
  font-size: 13px;
  letter-spacing: 0.14em;
}
.portal-stage-copyblock--profile .portal-stage-title,
.portal-stage-copyblock--profile .portal-stage-copy {
  max-width: none;
}
.portal-stage-copyblock--profile .portal-stage-title {
  max-width: 13ch;
  font-size: clamp(1.9rem, 4vw, 2.7rem);
  line-height: 0.98;
}
.portal-stage-copyblock--profile .portal-stage-copy {
  max-width: 42ch;
  font-size: 14px;
  line-height: 1.7;
}
.portal-stage-copyblock--requirements {
  max-width: 46ch;
}
.portal-stage-copyblock--page .portal-stage-kicker {
  color: #117f48;
  font-weight: 850;
}
.portal-stage-copyblock--page .portal-stage-title {
  max-width: 14ch;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  line-height: 0.95;
  color: #102218;
}
.portal-stage-copyblock--page .portal-stage-copy {
  color: #102218;
  font-weight: 600;
}
.portal-focus-card,
.portal-focus-summary,
.portal-profile-card,
.portal-commitment-card,
.portal-live-card,
.portal-workspace-summary-card {
  display: grid;
  gap: 10px;
  padding: 22px;
  border-radius: 24px;
  border: 1px solid rgba(52,58,64,0.08);
  background: rgba(255,255,255,0.88);
  box-shadow: 0 18px 40px rgba(13,50,31,0.08);
}
.portal-focus-card[data-selected="true"] {
  border-color: rgba(11,143,66,0.24);
  background: linear-gradient(180deg, rgba(246,251,248,0.98), rgba(237,246,240,0.98));
}
.portal-focus-card-label,
.portal-workspace-summary-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #117f48;
  font-weight: 850;
}
.portal-focus-card strong,
.portal-focus-summary strong {
  font-size: 18px;
  line-height: 1.25;
  color: var(--gray900);
}
.portal-focus-card p,
.portal-focus-summary p {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: #102218;
  font-weight: 600;
}
.portal-focus-summary {
  background: linear-gradient(180deg, rgba(245,250,246,0.98), rgba(235,244,238,0.98));
}
.portal-pathway-guide-grid {
  display: grid;
  gap: 14px;
}
.portal-profile-card {
  gap: 16px;
  padding: clamp(22px, 3vw, 28px);
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,248,246,0.96));
  border-color: rgba(16,34,24,0.08);
  box-shadow: 0 18px 42px rgba(13,50,31,0.1);
}
.portal-screen-canvas--profile .portal-profile-card {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}
.portal-profile-card--centered {
  width: min(100%, 470px);
  margin: 0 auto;
}
.portal-profile-card--centered .profile-setup-main {
  max-width: none;
}
.portal-profile-card .field-label-row span,
.portal-profile-card label {
  color: #102218;
  font-weight: 700;
}
.portal-profile-card .portal-inline-hint,
.portal-profile-card .hint {
  color: #174f31;
  font-weight: 700;
}
.portal-profile-card .profile-country-field {
  color: rgba(255,255,255,0.98);
  text-shadow: 0 8px 24px rgba(5,16,10,0.22);
}
.portal-profile-card .profile-country-field .hint {
  color: rgba(255,255,255,0.96);
  text-shadow: 0 8px 24px rgba(5,16,10,0.2);
}
.portal-profile-card .country-search-shell {
  background: rgba(255,255,255,0.96);
}
.portal-requirements-stage {
  display: grid;
  gap: 28px;
}
.portal-requirements-content {
  display: grid;
  gap: 22px;
}
.portal-requirements-block {
  display: grid;
  gap: 12px;
}
.portal-requirements-block + .portal-requirements-block {
  padding-top: 22px;
  border-top: 1px solid rgba(105,216,139,0.24);
}
.portal-stage-copyblock--requirements .portal-stage-kicker {
  color: #69d88b;
  font-size: 12px;
  letter-spacing: 0.18em;
  font-weight: 900;
  text-shadow: 0 8px 24px rgba(5,16,10,0.24);
}
.portal-stage-copyblock--requirements .portal-stage-copy {
  max-width: 54ch;
  font-size: clamp(1rem, 1.8vw, 1.15rem);
  line-height: 1.8;
  color: rgba(255,255,255,0.98);
  font-weight: 650;
  text-shadow: 0 8px 24px rgba(5,16,10,0.26);
}
.portal-requirements-label {
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #69d88b;
  font-weight: 900;
  text-shadow: 0 6px 18px rgba(5,16,10,0.22);
}
.portal-requirements-block strong {
  font-size: clamp(1.3rem, 2.5vw, 1.55rem);
  line-height: 1.28;
  letter-spacing: -0.02em;
  color: #ffffff;
  font-weight: 750;
  text-shadow: 0 8px 24px rgba(5,16,10,0.28);
}
.portal-requirements-block p {
  margin: 0;
  font-size: 15px;
  line-height: 1.8;
  color: rgba(255,255,255,0.94);
  font-weight: 600;
  text-shadow: 0 8px 24px rgba(5,16,10,0.24);
}
.portal-requirements-list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 4px 0 0 20px;
  color: rgba(255,255,255,0.96);
  font-weight: 650;
  text-shadow: 0 8px 24px rgba(5,16,10,0.24);
}
.portal-requirements-list li {
  font-size: 15px;
  line-height: 1.75;
}
.portal-requirements-documents-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 18px;
}
.portal-commitment-documents--compact {
  gap: 0;
}
.portal-commitment-documents--compact .portal-entry-item {
  border-top-color: rgba(105,216,139,0.24);
}
.portal-commitment-documents--compact .portal-entry-item strong {
  color: #69d88b;
  font-weight: 750;
  text-shadow: 0 8px 24px rgba(5,16,10,0.22);
}
.portal-commitment-documents--compact .portal-entry-item p {
  color: rgba(255,255,255,0.94);
  font-weight: 600;
  text-shadow: 0 8px 24px rgba(5,16,10,0.2);
}
.portal-stage-inline-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  padding-top: 8px;
}
.portal-stage-inline-actions--profile {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  max-width: 470px;
  margin: 0 auto;
  gap: 10px;
  padding-top: 2px;
}
.portal-stage-inline-actions--profile .ghost,
.portal-stage-inline-actions--profile .secondary {
  width: 100%;
  min-width: 0;
  min-height: 52px;
}
.portal-stage-inline-actions .ghost,
.portal-stage-inline-actions .secondary {
  min-width: 152px;
}
.portal-stage-inline-actions .secondary {
  box-shadow: 0 18px 34px rgba(17,127,72,0.18);
}
.portal-stage-inline-actions--requirements {
  justify-content: flex-start;
  padding-top: 0;
}
.portal-commitment-grid--stage {
  gap: 16px;
}
.portal-entry-actions {
  position: relative;
  z-index: 1;
  padding: 18px 20px;
  border-radius: 28px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(7,16,11,0.72);
  box-shadow: 0 24px 48px rgba(0,0,0,0.22);
  backdrop-filter: blur(20px);
}
.portal-entry-actions .ghost {
  background: rgba(255,255,255,0.92);
  border-color: rgba(255,255,255,0.1);
}
.portal-entry-actions .secondary {
  background: linear-gradient(135deg, #117f48, #29a35e);
}
.portal-entry-actions--minimal {
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}
.portal-entry-actions--minimal .ghost,
.portal-entry-actions--minimal .secondary {
  min-width: 152px;
}
.portal-entry-action-copy strong {
  color: var(--white);
}
.portal-entry-action-copy span {
  color: rgba(235,245,238,0.78);
}
.portal-workspace-banner {
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 22px;
  padding: clamp(24px, 3.4vw, 34px);
  border-radius: 34px;
  border: 1px solid rgba(255,255,255,0.12);
  background: transparent;
  box-shadow: 0 28px 72px rgba(4,13,8,0.28);
}
.portal-workspace-banner::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--portal-ambient-panel-surface);
  opacity: 1;
  transform: none;
}
.portal-workspace-banner > * {
  position: relative;
  z-index: 1;
}
.portal-workspace-hero,
.portal-workspace-meta {
  display: grid;
  gap: 20px;
}
.portal-workspace-copy {
  display: grid;
  gap: 14px;
}
.portal-workspace-copy .portal-stage-card-label {
  color: rgba(234,244,237,0.62);
}
.portal-workspace-title {
  margin: 0;
  max-width: 12ch;
  font-size: clamp(2.35rem, 6vw, 4rem);
  line-height: 0.94;
  letter-spacing: -0.05em;
  color: var(--white);
}
.portal-workspace-copytext {
  margin: 0;
  max-width: 54ch;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(234,244,237,0.8);
}
.portal-workspace-progress {
  display: grid;
  gap: 10px;
  max-width: 360px;
}
.portal-workspace-progress strong {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(241,247,242,0.86);
}
.portal-workspace-summary {
  display: grid;
  gap: 14px;
}
.portal-workspace-summary-card {
  background: rgba(8,18,13,0.58);
  border-color: rgba(255,255,255,0.08);
  box-shadow: none;
  backdrop-filter: blur(16px);
}
.portal-workspace-summary-card strong {
  font-size: 18px;
  line-height: 1.25;
  color: var(--white);
}
.portal-workspace-summary-card p,
.portal-workspace-note {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: rgba(234,244,237,0.76);
}
.portal-workspace-summary-label,
.portal-live-label {
  color: rgba(234,244,237,0.58);
}
.portal-workspace-meta .hero-status-card,
.portal-live-card {
  background: rgba(255,255,255,0.9);
}
.portal-workspace-actions {
  display: grid;
  gap: 12px;
  align-items: center;
}
.portal-workspace-actions .ghost {
  width: fit-content;
}
.portal-main-experience {
  gap: 12px;
  padding: 12px 20px 28px;
}
.flow-header {
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
  border-radius: 0;
  box-shadow: none;
}
.flow-header-bar {
  align-items: center;
}
.flow-step-tabs {
  gap: 10px;
}
.flow-workspace-grid {
  max-width: 960px;
  margin: 0 auto;
}
.application-flow {
  margin-top: 0;
}
.application-section {
  padding-top: 0;
}
.application-shell {
  gap: 20px;
  width: 100%;
  max-width: 920px;
  margin: 0 auto;
  justify-items: center;
  grid-template-columns: 1fr;
  padding: 0;
  border-radius: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}
.section-rail--hidden {
  display: none !important;
}
.section-rail {
  gap: 10px;
  padding-bottom: 0;
}
.section-step {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(11,143,66,0.08);
  color: var(--secondary);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 800;
}
.section-main {
  gap: 20px;
  width: min(100%, 860px);
  max-width: 860px;
  margin: 0 auto;
}
.section-navigation {
  padding-top: 20px;
}
.doc-card {
  padding: 18px 20px;
  border: 1px solid rgba(52,58,64,0.08);
  border-radius: 22px;
  background: rgba(248,250,249,0.92);
  box-shadow: 0 12px 28px rgba(13,50,31,0.04);
}
.declaration-box {
  padding: 18px 20px;
  border-left-width: 3px;
  border-radius: 20px;
  background: rgba(11,143,66,0.04);
}
@media (max-width: 919px), (pointer: coarse) {
  body.portal-body--workspace::before {
    position: absolute;
  }
  body.portal-body--workspace::after {
    display: block;
    opacity: 0.62;
    background: var(--portal-workspace-symbol-surface);
  }
  .portal-main-experience {
    gap: 6px;
    padding: calc(env(safe-area-inset-top, 0px) + 10px) 14px 20px;
  }
  .portal-stage-copyblock--profile {
    gap: 8px;
  }
  .portal-stage-copyblock--profile .portal-stage-kicker {
    font-size: 14px;
    letter-spacing: 0.12em;
  }
  .portal-pathway-choice-grid {
    gap: 12px;
  }
  .portal-pathway-choice,
  button.portal-pathway-choice {
    min-height: 82px;
    padding: 18px 16px;
    border-radius: 20px;
  }
  .portal-pathway-choice-word {
    font-size: 1.16rem;
  }
  .portal-pathway-choice-meta {
    font-size: 13px;
    line-height: 1.4;
  }
  .flow-header {
    top: 0;
    z-index: 24;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: none;
    box-shadow: none;
    backdrop-filter: none;
  }
  .flow-header::before {
    content: none;
  }
  .flow-header-bar {
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
  }
  .flow-summary-chip {
    min-height: 32px;
    padding: 6px 10px;
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.78);
  }
  .flow-summary-chip strong {
    color: #ffffff;
  }
  .flow-profile-context-label {
    color: rgba(255,255,255,0.62);
  }
  .flow-step-counter,
  .flow-summary-chip--status {
    font-size: 11px;
  }
  .flow-summary-chip--status.is-pending {
    color: rgba(255,255,255,0.82);
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.12);
  }
  .flow-summary-chip--status.is-active {
    color: #d8ffe6;
    background: rgba(17,127,72,0.26);
    border-color: rgba(149,232,187,0.24);
  }
  .flow-summary-chip--status.is-complete {
    color: #d8ffe6;
    background: rgba(17,127,72,0.3);
    border-color: rgba(149,232,187,0.28);
  }
  .flow-summary-chip--status.is-issue {
    color: #ffd9d6;
    background: rgba(198,40,40,0.24);
    border-color: rgba(255,111,97,0.2);
  }
  .flow-section-menu-button {
    min-width: 0;
    padding: 10px 12px;
    background: linear-gradient(135deg, #117f48, #17985a);
    border-color: rgba(188,244,210,0.26);
    color: #ffffff;
    box-shadow: 0 12px 24px rgba(4,28,14,0.24);
  }
  .flow-section-menu-button-label {
    color: rgba(255,255,255,0.68);
  }
  .flow-section-menu-button strong {
    color: #ffffff;
    font-size: 14px;
  }
  .flow-section-menu-button-meta {
    background: rgba(255,255,255,0.12);
    color: #ffffff;
  }
  .flow-section-menu-button-icon {
    color: #ffffff;
  }
  .flow-progress-track {
    height: 3px;
    background: rgba(17,127,72,0.24);
  }
  .flow-step-tabs {
    display: none;
  }
  .flow-section-drawer-backdrop {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 40;
    opacity: 0;
    pointer-events: none;
    background: rgba(4,12,8,0.36);
    transition: opacity 180ms ease;
  }
  .flow-section-drawer-backdrop[data-open="true"] {
    opacity: 1;
    pointer-events: auto;
  }
  .flow-section-drawer {
    width: min(88vw, 340px);
    padding: calc(env(safe-area-inset-top, 0px) + 16px) 16px 24px;
    background:
      radial-gradient(circle at top right, rgba(17,127,72,0.24), transparent 30%),
      radial-gradient(circle at bottom left, rgba(62,176,93,0.18), transparent 28%),
      linear-gradient(180deg, rgba(7,18,12,0.98), rgba(10,26,17,0.98));
    box-shadow: 0 24px 56px rgba(0,0,0,0.3);
    overflow-y: auto;
    transform: translateX(-104%);
    transition: transform 180ms ease;
  }
  .flow-section-drawer-backdrop[data-open="true"] .flow-section-drawer {
    transform: translateX(0);
  }
  .flow-section-drawer-header {
    gap: 8px;
  }
  .flow-step-drawer-list {
    gap: 10px;
    padding-top: 2px;
  }
  .flow-drawer-step,
  button.flow-drawer-step {
    padding: 14px 14px 12px;
    border-radius: 20px;
    border: 1px solid rgba(149,232,187,0.16);
    background: linear-gradient(180deg, rgba(17,127,72,0.18), rgba(9,38,21,0.28));
    color: #ffffff;
    text-align: left;
  }
  .flow-drawer-step-title {
    font-size: 15px;
    line-height: 1.35;
    color: #ffffff;
  }
  .flow-drawer-step-kicker {
    color: rgba(214,244,223,0.72);
  }
  .flow-drawer-step-status {
    color: rgba(234,244,237,0.82);
  }
  .flow-drawer-step.is-active {
    border-color: rgba(188,244,210,0.36);
    background: linear-gradient(180deg, rgba(17,127,72,0.32), rgba(12,72,40,0.34));
  }
  .flow-drawer-step.is-complete {
    border-color: rgba(149,232,187,0.24);
    background: linear-gradient(180deg, rgba(17,127,72,0.24), rgba(9,38,21,0.32));
  }
  .flow-drawer-step.is-issue {
    border-color: rgba(194,224,135,0.24);
    background: linear-gradient(180deg, rgba(89,118,25,0.24), rgba(37,53,10,0.3));
  }
  .flow-step-counter {
    display: none;
  }
  .application-flow {
    margin-top: 0;
    padding: 0;
  }
  .application-shell {
    gap: 16px;
    padding: 0;
    border-radius: 0;
    border: 0;
    background: transparent;
    box-shadow: none;
  }
  .section-main {
    gap: 16px;
    width: 100%;
  }
  .portal-intro-backdrop-image {
    transform: none;
  }
  .portal-screen-header,
  .hero-status-card,
  .portal-workspace-banner,
  .portal-workspace-summary-card,
  .portal-live-card,
  .profile-switch-dialog,
  .flash-toast {
    box-shadow: 0 12px 28px rgba(13,50,31,0.08);
    backdrop-filter: none;
  }
}
@media (min-width: 560px) {
  .shell {
    padding: 22px 18px 64px;
  }
  .shell.portal-shell {
    padding-top: 0;
  }
  .portal-screen-header {
    grid-template-columns: minmax(0, 1fr) minmax(280px, auto);
    align-items: start;
  }
  .portal-screen-progress {
    justify-items: end;
  }
  .portal-workspace-summary,
  .portal-live-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .portal-pathway-guide-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .portal-workspace-actions {
    grid-template-columns: auto minmax(0, 1fr);
  }
  .portal-intro-header {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }
  .hero-metric-grid,
  .portal-live-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .portal-intro-step-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .portal-pathway-guide-grid,
  .portal-journey-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .portal-stage-inline-actions--profile {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
  .portal-route-frame {
    grid-template-columns: minmax(0, 1.1fr) minmax(240px, 0.72fr);
    align-items: stretch;
  }
  .portal-workspace-actions {
    grid-template-columns: auto minmax(0, 1fr);
  }
}
@media (min-width: 920px) {
  .shell.portal-shell {
    padding-left: 0;
    padding-right: 0;
  }
  .portal-workspace-hero {
    grid-template-columns: minmax(0, 1.08fr) minmax(320px, 0.92fr);
    align-items: end;
  }
  .portal-workspace-meta {
    grid-template-columns: minmax(280px, 0.72fr) minmax(0, 1fr);
    align-items: start;
  }
  .portal-main-experience {
    padding-left: 20px;
    padding-right: 20px;
  }
  .flow-workspace-grid {
    display: block;
  }
  .flow-section-rail {
    display: none !important;
  }
  .flow-step-tabs {
    display: none;
  }
  .application-flow {
    min-width: 0;
  }
  .application-shell {
    grid-template-columns: 1fr;
    align-items: start;
    max-width: 920px;
    margin: 0 auto;
  }
  .section-rail {
    position: sticky;
    top: 18px;
  }
  .hero.has-aside {
    grid-template-columns: minmax(0, 1.06fr) minmax(360px, 0.94fr);
    gap: 24px;
  }
  .portal-entry-intro {
    grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.98fr);
    align-items: start;
  }
  .portal-entry-intro {
    gap: 18px;
  }
  .portal-stage--profile {
    grid-template-columns: minmax(0, 0.64fr) minmax(0, 0.96fr);
    align-items: start;
  }
  .portal-workspace-banner {
    grid-template-columns: minmax(0, 1.04fr) minmax(340px, 0.96fr);
    align-items: start;
  }
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
  descriptionHtml?: string;
  eyebrow?: string;
  eyebrowHtml?: string;
  body: string;
  heroBodyHtml?: string;
  heroAside?: string;
  hideHero?: boolean;
  bodyClassName?: string;
  heroClassName?: string;
  shellClassName?: string;
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
  <body${params.bodyClassName ? ` class="${params.bodyClassName}"` : ""}>
    <main class="shell${params.shellClassName ? ` ${params.shellClassName}` : ""}">
      ${params.hideHero
        ? ""
        : `<section class="hero${params.heroAside ? " has-aside" : ""}${params.heroClassName ? ` ${params.heroClassName}` : ""}">
        <div class="hero-main">
          ${params.eyebrowHtml
            ? `<div class="hero-eyebrow">${params.eyebrowHtml}</div>`
            : params.eyebrow
              ? `<div class="hero-eyebrow">${params.eyebrow}</div>`
              : ""}
          <h1>${params.titleHtml || params.title}</h1>
          <div class="hero-description">${params.descriptionHtml || `<p>${params.description}</p>`}</div>
          ${params.heroBodyHtml || ""}
        </div>
        ${params.heroAside ? `<div class="hero-aside">${params.heroAside}</div>` : ""}
      </section>`}
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
