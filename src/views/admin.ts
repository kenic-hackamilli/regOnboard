import { renderShell } from "./shared.js";

export const renderAdminPage = (options: { nonce?: string } = {}) => {
  const body = `
    <div class="grid two">
      <section class="card stack">
        <h2>Admin Access</h2>
        <p class="subtle">Sign in once with the admin token. The admin browser then uses a short-lived secure session cookie for review actions.</p>
        <label>Admin Token<input id="adminToken" type="password" placeholder="ADMIN_API_TOKEN" autocomplete="current-password" /></label>
        <div class="row">
          <label>
            Status Filter
            <select id="statusFilter">
              <option value="">All</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>
        </div>
        <div class="toolbar">
          <button id="signInButton" class="secondary">Sign In</button>
          <button id="signOutButton" class="ghost">Sign Out</button>
          <button id="loadApplicationsButton">Load Applications</button>
        </div>
        <div id="adminSessionStatus" class="hint">Sign in to review applications.</div>
        <div id="adminFlash" class="flash">Admin review console ready.</div>
      </section>

      <section class="card stack">
        <h2>Review Actions</h2>
        <label>Assigned Reviewer<input id="assignedTo" placeholder="admin@dotke.local" /></label>
        <label>Reviewer Notes<textarea id="reviewerNotes"></textarea></label>
        <div class="toolbar">
          <button id="markInReviewButton" class="ghost">Mark In Review</button>
          <button id="requestChangesButton" class="warning">Request Changes</button>
          <button id="approveButton" class="secondary">Approve</button>
          <button id="rejectButton" class="danger">Reject</button>
        </div>
      </section>
    </div>

    <section class="card stack">
      <h2>Applications</h2>
      <div id="applicationsList" class="list"></div>
    </section>

    <section class="card stack">
      <h2>Selected Application Detail</h2>
      <div id="selectedApplication" class="mono">No application selected.</div>
      <div id="selectedDocuments" class="list"></div>
    </section>
  `;

  const scripts = `
    const state = { authenticated: false, selectedApplicationId: "" };
    const adminToken = document.getElementById("adminToken");
    const signInButton = document.getElementById("signInButton");
    const signOutButton = document.getElementById("signOutButton");
    const statusFilter = document.getElementById("statusFilter");
    const adminSessionStatus = document.getElementById("adminSessionStatus");
    const adminFlash = document.getElementById("adminFlash");
    const applicationsList = document.getElementById("applicationsList");
    const selectedApplication = document.getElementById("selectedApplication");
    const selectedDocuments = document.getElementById("selectedDocuments");

    function setFlash(message, isError = false) {
      adminFlash.textContent = message;
      adminFlash.style.background = isError ? "rgba(220,53,69,0.12)" : "rgba(23,162,184,0.12)";
    }

    function updateAdminSessionUi() {
      adminSessionStatus.textContent = state.authenticated
        ? "Signed in. Review requests are using a secure admin session."
        : "Sign in to review applications.";
      signInButton.disabled = state.authenticated;
      signOutButton.disabled = !state.authenticated;
    }

    async function readAdminResponse(response) {
      const contentType = response.headers.get("content-type") || "";
      return contentType.includes("application/json") ? await response.json() : await response.text();
    }

    async function refreshAdminSession() {
      const response = await fetch("/onboard/v1/admin/session", {
        credentials: "same-origin",
      });
      const payload = await readAdminResponse(response);
      state.authenticated = Boolean(payload && payload.data && payload.data.authenticated);
      updateAdminSessionUi();
    }

    async function signInAdmin() {
      const token = adminToken.value.trim();
      if (!token) {
        throw new Error("Admin token is required to start a session.");
      }

      const response = await fetch("/onboard/v1/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ token }),
      });
      const payload = await readAdminResponse(response);
      if (!response.ok) {
        throw new Error((payload && payload.error && payload.error.message) || response.statusText || "Request failed");
      }

      state.authenticated = true;
      adminToken.value = "";
      updateAdminSessionUi();
      setFlash("Admin session ready.");
      return payload.data ?? payload;
    }

    async function signOutAdmin() {
      await fetch("/onboard/v1/admin/session/clear", {
        method: "POST",
        credentials: "same-origin",
      });
      state.authenticated = false;
      updateAdminSessionUi();
      setFlash("Signed out.");
    }

    async function ensureAdminSession() {
      if (state.authenticated) {
        return;
      }

      await signInAdmin();
    }

    async function adminRequest(path, options = {}) {
      await ensureAdminSession();
      const headers = new Headers(options.headers || {});
      const response = await fetch(path, {
        ...options,
        headers,
        credentials: "same-origin",
      });
      const payload = await readAdminResponse(response);
      if (response.status === 401 || response.status === 403) {
        state.authenticated = false;
        updateAdminSessionUi();
      }
      if (!response.ok) {
        throw new Error((payload && payload.error && payload.error.message) || response.statusText || "Request failed");
      }
      return payload.data ?? payload;
    }

    function renderApplications(items) {
      applicationsList.innerHTML = "";
      items.forEach((item) => {
        const node = document.createElement("div");
        node.className = "list-item stack";
        node.innerHTML =
          "<strong>" + (item.companyName || "Untitled applicant") + "</strong>" +
          "<div class='hint'>" + item.id + "</div>" +
          "<div>Status: " + item.status + "</div>" +
          "<div>Progress: " + item.progressPercent + "%</div>";
        const toolbar = document.createElement("div");
        toolbar.className = "toolbar";
        const openButton = document.createElement("button");
        openButton.className = "ghost";
        openButton.textContent = "Open";
        openButton.addEventListener("click", () => loadApplication(item.id));
        toolbar.appendChild(openButton);
        node.appendChild(toolbar);
        applicationsList.appendChild(node);
      });
    }

    function renderDetail(detail) {
      selectedApplication.textContent = JSON.stringify(detail.application, null, 2);
      selectedDocuments.innerHTML = "";
      (detail.documents || []).forEach((document) => {
        const scan = document.validation_results && typeof document.validation_results === "object"
          ? document.validation_results.scan || null
          : null;
        const scanStatus = scan && typeof scan.status === "string" ? scan.status : "not_recorded";
        const findings = Array.isArray(scan && scan.findings) ? scan.findings : [];
        const node = document.createElement("div");
        node.className = "list-item stack";
        node.innerHTML =
          "<strong>" + document.requirement_code + "</strong>" +
          "<div class='hint'>" + (document.original_name || "Unnamed document") + "</div>" +
          "<div>Status: " + document.document_status + "</div>" +
          "<div>Security scan: " + scanStatus + "</div>";
        if (findings.length) {
          const findingsNode = document.createElement("div");
          findingsNode.className = "hint";
          findingsNode.textContent = "Findings: " + findings.map((item) =>
            typeof item === "string"
              ? item
              : (item && typeof item.message === "string" ? item.message : "")
          ).filter(Boolean).join(" | ");
          node.appendChild(findingsNode);
        }
        const link = document.createElement("a");
        link.className = "button ghost";
        link.textContent = "Download";
        link.target = "_blank";
        link.href = "/onboard/v1/admin/documents/" + document.id + "/download";
        node.appendChild(link);
        selectedDocuments.appendChild(node);
      });
    }

    async function loadApplications() {
      const filter = statusFilter.value ? "?status=" + encodeURIComponent(statusFilter.value) : "";
      const items = await adminRequest("/onboard/v1/admin/applications" + filter);
      renderApplications(items);
      setFlash("Applications loaded.");
    }

    async function loadApplication(id) {
      state.selectedApplicationId = id;
      const detail = await adminRequest("/onboard/v1/admin/applications/" + id);
      renderDetail(detail);
      setFlash("Application loaded.");
    }

    async function applyReview(nextStatus) {
      if (!state.selectedApplicationId) {
        setFlash("Select an application first.", true);
        return;
      }
      await adminRequest("/onboard/v1/admin/applications/" + state.selectedApplicationId + "/review", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nextStatus,
          assignedTo: document.getElementById("assignedTo").value || null,
          reviewerNotes: document.getElementById("reviewerNotes").value || null,
        }),
      });
      setFlash("Application updated to " + nextStatus + ".");
      await loadApplication(state.selectedApplicationId);
      await loadApplications();
    }

    document.getElementById("loadApplicationsButton").addEventListener("click", () => {
      loadApplications().catch((error) => setFlash(error.message || "Failed to load applications.", true));
    });
    signInButton.addEventListener("click", () => {
      signInAdmin().catch((error) => setFlash(error.message || "Failed to sign in.", true));
    });
    signOutButton.addEventListener("click", () => {
      signOutAdmin().catch((error) => setFlash(error.message || "Failed to sign out.", true));
    });
    document.getElementById("markInReviewButton").addEventListener("click", () => {
      applyReview("in_review").catch((error) => setFlash(error.message || "Failed to update review.", true));
    });
    document.getElementById("requestChangesButton").addEventListener("click", () => {
      applyReview("changes_requested").catch((error) => setFlash(error.message || "Failed to request changes.", true));
    });
    document.getElementById("approveButton").addEventListener("click", () => {
      applyReview("approved").catch((error) => setFlash(error.message || "Failed to approve application.", true));
    });
    document.getElementById("rejectButton").addEventListener("click", () => {
      applyReview("rejected").catch((error) => setFlash(error.message || "Failed to reject application.", true));
    });
    refreshAdminSession().catch(() => {
      state.authenticated = false;
      updateAdminSessionUi();
    });
  `;

  return renderShell({
    eyebrow: "dotKE internal review",
    title: "Onboard Admin",
    description:
      "Review registrar submissions, download PostgreSQL-backed documents, and move applications through the accreditation workflow.",
    body,
    scripts,
    ...(options.nonce ? { nonce: options.nonce } : {}),
  });
};
