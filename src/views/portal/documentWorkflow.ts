export const documentWorkflowClientScript = `
    function setDocumentUploadFeedback(message, tone = "info") {
      if (!documentUploadFeedback) {
        return;
      }

      documentUploadFeedback.textContent = message;
      documentUploadFeedback.className = "submission-feedback " + tone;
      syncFlowNavigationState();
    }

    function getChecklistDocuments(bundle = latestBundle) {
      const documents = Array.isArray(bundle?.checklist?.documents)
        ? bundle.checklist.documents.slice()
        : [];

      return documents.sort((left, right) => {
        const leftOrder = Number(left?.displayOrder ?? 9999);
        const rightOrder = Number(right?.displayOrder ?? 9999);
        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return String(left?.requirementCode || "").localeCompare(String(right?.requirementCode || ""));
      });
    }

    function getUploadedDocumentMap(bundle = latestBundle) {
      const map = new Map();
      const documents = Array.isArray(bundle?.documents) ? bundle.documents : [];
      documents.forEach((document) => {
        if (document && typeof document.requirementCode === "string") {
          map.set(document.requirementCode, document);
        }
      });
      return map;
    }

    function getRequirementByCode(requirementCode, bundle = latestBundle) {
      return getChecklistDocuments(bundle).find((document) => document.requirementCode === requirementCode) || null;
    }

    function formatFileSize(sizeBytes) {
      const bytes = Number(sizeBytes);
      if (!Number.isFinite(bytes) || bytes <= 0) {
        return "";
      }

      if (bytes < 1024) {
        return bytes + " B";
      }

      if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + " KB";
      }

      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    function requirementAllowsImages(requirement) {
      return Array.isArray(requirement?.allowedMimeTypes)
        && requirement.allowedMimeTypes.some((mimeType) => String(mimeType).startsWith("image/"));
    }

    function requirementAllowsPdf(requirement) {
      return Array.isArray(requirement?.allowedMimeTypes)
        && requirement.allowedMimeTypes.includes("application/pdf");
    }

    function buildFileAcceptAttribute(requirement, source = "upload") {
      if (source === "camera") {
        return requirementAllowsImages(requirement) ? "image/*" : "";
      }

      if (source === "pdf") {
        return requirementAllowsPdf(requirement) ? "application/pdf" : "";
      }

      if (source === "image") {
        return requirementAllowsImages(requirement) ? "image/*" : "";
      }

      const acceptedTypes = [];
      if (requirementAllowsPdf(requirement)) {
        acceptedTypes.push("application/pdf");
      }
      if (requirementAllowsImages(requirement)) {
        acceptedTypes.push("image/*");
      }

      return acceptedTypes.join(",") || "*/*";
    }

    function createDocumentPickerControl(requirement, options) {
      const control = document.createElement("label");
      control.className = "button file-picker-button " + (options.variantClass || "");
      control.setAttribute("data-document-action-source", options.config.source);

      if (options.disabled) {
        control.setAttribute("aria-disabled", "true");
      }

      const labelText = document.createElement("span");
      labelText.textContent = options.label;
      control.appendChild(labelText);

      const input = document.createElement("input");
      input.type = "file";
      input.accept = buildFileAcceptAttribute(requirement, options.acceptMode);
      input.disabled = Boolean(options.disabled);

      if (options.captureMode) {
        input.setAttribute("capture", options.captureMode);
      }

      input.addEventListener("click", () => {
        rememberPortalViewport({
          sectionCode: DOCUMENT_SECTION_CODE,
          requirementCode: options.config.requirementCode,
          actionSource: options.config.source,
          awaitingDocumentReturn: true,
        });
      });

      input.addEventListener("change", () => {
        void handleDocumentInputChange(input, options.config);
      });

      control.appendChild(input);
      return control;
    }

    function buildDocumentDownloadUrl(documentId) {
      if (!state.applicationId || !documentId) {
        return "";
      }

      return resolvePortalPath(
        "/onboard/v1/public/applications/" + state.applicationId + "/documents/" + documentId + "/download"
      );
    }

    function replaceFilenameExtension(filename, nextExtension) {
      const normalizedFilename = String(filename || "document").trim() || "document";
      const stem = normalizedFilename.replace(/\\.[^.]+$/, "") || "document";
      return stem + "." + nextExtension;
    }

    function loadImageFromFile(file) {
      return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(image);
        };
        image.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to load image."));
        };
        image.src = objectUrl;
      });
    }

    async function normalizeImageFile(file) {
      if (!file || !String(file.type || "").startsWith("image/")) {
        return file;
      }

      const image = await loadImageFromFile(file);
      const width = Number(image.naturalWidth || image.width || 0);
      const height = Number(image.naturalHeight || image.height || 0);
      const longestSide = Math.max(width, height);

      if (!longestSide) {
        return file;
      }

      const scale = longestSide > IMAGE_UPLOAD_MAX_DIMENSION
        ? IMAGE_UPLOAD_MAX_DIMENSION / longestSide
        : 1;
      const targetWidth = Math.max(1, Math.round(width * scale));
      const targetHeight = Math.max(1, Math.round(height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        return file;
      }

      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise((resolve) => {
        canvas.toBlob((value) => resolve(value), "image/jpeg", IMAGE_UPLOAD_QUALITY);
      });

      if (!blob) {
        return file;
      }

      if (blob.size >= file.size && scale === 1 && file.type === "image/jpeg") {
        return file;
      }

      return new File(
        [blob],
        replaceFilenameExtension(file.name, "jpg"),
        { type: "image/jpeg", lastModified: Date.now() }
      );
    }

    async function prepareDocumentFileForUpload(file) {
      if (!file) {
        throw new Error("FILE_REQUIRED");
      }

      if (String(file.type || "").startsWith("image/")) {
        return normalizeImageFile(file);
      }

      return file;
    }

    function getDocumentStatusTone(requirementCode, uploadedDocument) {
      if (pendingDocumentUploads.has(requirementCode)) {
        return "loading";
      }

      if (uploadedDocument) {
        return "ready";
      }

      return "pending";
    }

    function getDocumentStatusLabel(requirementCode, uploadedDocument) {
      if (pendingDocumentUploads.has(requirementCode)) {
        return "Uploading";
      }

      if (uploadedDocument) {
        return "Received";
      }

      return "Required";
    }

    function buildDocumentIssue(requirementCode) {
      const requirement = getRequirementByCode(requirementCode);
      return {
        requirementCode,
        message: "Please upload " + (requirement?.label || requirementCode) + " before continuing.",
      };
    }

    function getBlockingDocumentIssueFromDetails(documentDetails) {
      if (!Array.isArray(documentDetails) || documentDetails.length === 0) {
        return null;
      }

      const firstRequirementCode = typeof documentDetails[0] === "string"
        ? documentDetails[0]
        : "";
      return firstRequirementCode ? buildDocumentIssue(firstRequirementCode) : null;
    }

    function guideUserToDocumentIssue(issue) {
      if (!issue?.requirementCode) {
        return false;
      }

      const sectionPanel = documentRequirementsList?.closest(".application-section") || null;
      const documentCard = document.querySelector(
        '[data-document-requirement="' + issue.requirementCode + '"]'
      );

      setFlash(issue.message, "error");
      setDocumentUploadFeedback(issue.message, "error");

      document.querySelectorAll(".application-section.is-targeted").forEach((node) => {
        node.classList.remove("is-targeted");
      });

      if (sectionPanel) {
        revealFlowSection(DOCUMENT_SECTION_CODE, { requirementCode: issue.requirementCode });
        sectionPanel.classList.add("is-targeted");
        sectionPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        rememberPortalViewport({
          sectionCode: DOCUMENT_SECTION_CODE,
          requirementCode: issue.requirementCode,
        });
      }

      if (sectionHighlightTimer) {
        clearTimeout(sectionHighlightTimer);
      }

      sectionHighlightTimer = setTimeout(() => {
        sectionPanel?.classList.remove("is-targeted");
      }, 2600);

      const focusTarget = documentCard?.querySelector("button:not([disabled]), a.button") || null;
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

    function syncDocumentUploadFeedback(bundle = latestBundle) {
      const checklistDocuments = getChecklistDocuments(bundle);
      const applicationStatus = bundle?.application?.status || "";
      const isReadOnly = ["submitted", "in_review", "approved", "rejected"].includes(applicationStatus);

      if (!state.applicationId) {
        if (isPortalInactive()) {
          setDocumentUploadFeedback(getPortalInactiveMessage(), "info");
          return;
        }

        setDocumentUploadFeedback(
          "Save your application profile first to unlock document uploads.",
          "info"
        );
        return;
      }

      if (!checklistDocuments.length) {
        setDocumentUploadFeedback("Preparing your required documents.", "info");
        return;
      }

      if (isReadOnly) {
        setDocumentUploadFeedback("This application is read-only. Documents can no longer be changed here.", "info");
        return;
      }

      const missingRequiredDocuments = checklistDocuments.filter((document) =>
        document.isRequired && !document.uploaded
      );

      if (missingRequiredDocuments.length > 0) {
        setDocumentUploadFeedback(
          "Upload all required documents before final submission.",
          "info"
        );
        return;
      }

      setDocumentUploadFeedback(
        "All required documents have been received. You can continue reviewing the form before submission.",
        "success"
      );
    }

    function renderDocumentRequirements(bundle = latestBundle) {
      if (!documentRequirementsList) {
        return;
      }

      const checklistDocuments = getChecklistDocuments(bundle);
      const uploadedDocumentMap = getUploadedDocumentMap(bundle);
      const isReadOnly = ["submitted", "in_review", "approved", "rejected"].includes(
        bundle?.application?.status || ""
      );

      documentRequirementsList.replaceChildren();

      if (!checklistDocuments.length) {
        const node = document.createElement("div");
        node.className = "list-item stack";

        const title = document.createElement("strong");
        title.textContent = "Prepare the document checklist";

        const description = document.createElement("div");
        description.className = "subtle";
        description.textContent = "The checklist appears once the application is prepared.";

        node.appendChild(title);
        node.appendChild(description);

        if (!state.applicationId) {
          const toolbar = document.createElement("div");
          toolbar.className = "toolbar";
          const button = document.createElement("button");
          button.type = "button";
          button.className = "secondary";
          button.textContent = "Continue to checklist";
          button.disabled = isPortalInactive();
          button.addEventListener("click", async () => {
            try {
              await ensureApplicationStarted();
              renderDocumentRequirements(latestBundle);
              syncDocumentUploadFeedback(latestBundle);
            } catch (error) {
              setFlash(
                getFriendlyErrorMessage(
                  error,
                  "We could not prepare the document checklist. Try again."
                ),
                true
              );
            }
          });
          toolbar.appendChild(button);
          node.appendChild(toolbar);
        }

        documentRequirementsList.appendChild(node);
        syncFlowNavigationState();
        return;
      }

      checklistDocuments.forEach((requirement, index) => {
        const uploadedDocument = uploadedDocumentMap.get(requirement.requirementCode) || null;
        const node = document.createElement("div");
        node.className = "list-item stack doc-card";
        node.setAttribute("data-document-requirement", requirement.requirementCode);

        const header = document.createElement("div");
        header.className = "doc-header";

        const meta = document.createElement("div");
        meta.className = "doc-meta";

        const requirementIndex = document.createElement("div");
        requirementIndex.className = "doc-index";
        requirementIndex.textContent = "Requirement " + (index + 1);

        const requirementLabel = document.createElement("strong");
        requirementLabel.textContent = requirement.label;

        meta.appendChild(requirementIndex);
        meta.appendChild(requirementLabel);

        if (requirement.equivalentLabel) {
          const equivalentLabel = document.createElement("div");
          equivalentLabel.className = "hint";
          equivalentLabel.textContent = requirement.equivalentLabel;
          meta.appendChild(equivalentLabel);
        }

        const badge = document.createElement("div");
        badge.className = "mini-pill " + getDocumentStatusTone(requirement.requirementCode, uploadedDocument);
        badge.textContent = getDocumentStatusLabel(requirement.requirementCode, uploadedDocument);

        header.appendChild(meta);
        header.appendChild(badge);
        node.appendChild(header);

        if (requirement.description) {
          const description = document.createElement("div");
          description.className = "doc-note";
          description.textContent = requirement.description;
          node.appendChild(description);
        }

        const status = document.createElement("div");
        status.className = "doc-status";
        status.textContent = uploadedDocument
          ? "Uploaded as " + (uploadedDocument.originalName || "document")
            + (uploadedDocument.sizeBytes ? " • " + formatFileSize(uploadedDocument.sizeBytes) : "")
          : "Not uploaded yet";
        node.appendChild(status);

        const actions = document.createElement("div");
        actions.className = "doc-actions";
        const isActionDisabled =
          isReadOnly
          || isPortalInactive()
          || pendingDocumentUploads.has(requirement.requirementCode);

        const uploadButton = (requirementAllowsPdf(requirement) || requirementAllowsImages(requirement))
          ? createDocumentPickerControl(requirement, {
              label: uploadedDocument
                ? "Replace file"
                : "Upload file",
              variantClass: uploadedDocument ? "ghost" : "secondary",
              acceptMode: requirementAllowsPdf(requirement)
                ? (requirementAllowsImages(requirement) ? "upload" : "pdf")
                : "image",
              disabled: isActionDisabled,
              config: {
                requirementCode: requirement.requirementCode,
                source: "upload",
              },
            })
          : null;

        if (uploadButton) {
          actions.appendChild(uploadButton);
        }

        node.appendChild(actions);
        documentRequirementsList.appendChild(node);
      });

      syncFlowNavigationState();
    }

    async function request(path, options = {}) {
      const headers = new Headers(options.headers || {});
      const response = await fetch(resolvePortalPath(path), {
        ...options,
        credentials: "same-origin",
        headers,
      });
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

    function buildDocumentUploadPath() {
      return resolvePortalPath("/onboard/v1/public/applications/" + state.applicationId + "/documents");
    }

    function shouldRetryDocumentUploadWithBase64(error) {
      const statusCode = Number(error && error.statusCode);
      if (Number.isFinite(statusCode) && statusCode > 0) {
        return false;
      }

      const message = error && error.message ? String(error.message).toLowerCase() : "";
      return (
        !message
        || message === "request failed"
        || message === "failed to fetch"
        || message === "network request failed"
        || message.includes("network")
        || message.includes("fetch")
      );
    }

    function readFileAsDataUrl(file) {
      if (typeof FileReader !== "function") {
        return Promise.reject(new Error("FILE_READER_UNAVAILABLE"));
      }

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string" && reader.result) {
            resolve(reader.result);
            return;
          }

          reject(new Error("FAILED_TO_READ_FILE"));
        };
        reader.onerror = () => {
          reject(new Error("FAILED_TO_READ_FILE"));
        };
        reader.readAsDataURL(file);
      });
    }

    async function uploadDocumentWithMultipart(file, config) {
      const formData = new FormData();
      formData.append("requirementCode", config.requirementCode);
      formData.append("source", config.source);
      formData.append("file", file, file.name);

      await request(buildDocumentUploadPath(), {
        method: "POST",
        body: formData,
      });
    }

    async function uploadDocumentWithBase64(file, config) {
      const dataUrl = await readFileAsDataUrl(file);
      const contentBase64 = String(dataUrl).replace(/^data:[^,]+,/, "");
      if (!contentBase64) {
        throw new Error("FAILED_TO_READ_FILE");
      }

      await request(buildDocumentUploadPath(), {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          requirementCode: config.requirementCode,
          source: config.source,
          filename: file.name || "document.bin",
          mimeType: file.type || "application/octet-stream",
          contentBase64,
        }),
      });
    }

    async function uploadDocumentForRequirement(file, config) {
      if (!config?.requirementCode || !config?.source) {
        throw new Error("INVALID_REQUIREMENT_CODE");
      }

      rememberPortalViewport({
        sectionCode: DOCUMENT_SECTION_CODE,
        requirementCode: config.requirementCode,
        actionSource: config.source,
        awaitingDocumentReturn: false,
      });

      if (!state.applicationId) {
        await ensureApplicationStarted();
      }

      const requirement = getRequirementByCode(config.requirementCode);
      const requirementLabel = requirement?.label || config.requirementCode;
      const preparedFile = await prepareDocumentFileForUpload(file);

      pendingDocumentUploads.add(config.requirementCode);
      renderDocumentRequirements(latestBundle);
      setDocumentUploadFeedback("Uploading " + requirementLabel + "...", "info");

      try {
        try {
          await uploadDocumentWithMultipart(preparedFile, config);
        } catch (error) {
          if (!shouldRetryDocumentUploadWithBase64(error)) {
            throw error;
          }

          setDocumentUploadFeedback(
            "Retrying " + requirementLabel + " with mobile-safe upload...",
            "info"
          );
          await uploadDocumentWithBase64(preparedFile, config);
        }

        pendingDocumentUploads.delete(config.requirementCode);
        await hydrate(requirementLabel + " uploaded successfully.");
      } catch (error) {
        pendingDocumentUploads.delete(config.requirementCode);
        renderDocumentRequirements(latestBundle);
        syncDocumentUploadFeedback(latestBundle);
        throw error;
      }
    }

    async function handleDocumentInputChange(input, config) {
      const selectedFile = input?.files?.[0] || null;
      const uiState = loadPortalUiState();

      if (input) {
        input.value = "";
      }

      if (!selectedFile || !config) {
        schedulePortalViewportRestore({
          sectionCode: DOCUMENT_SECTION_CODE,
          requirementCode: config?.requirementCode || uiState.activeRequirementCode,
          actionSource: config?.source || uiState.activeActionSource,
          focusTarget: true,
          delay: 80,
        });
        return;
      }

      try {
        await uploadDocumentForRequirement(selectedFile, config);
        schedulePortalViewportRestore({
          sectionCode: DOCUMENT_SECTION_CODE,
          requirementCode: config.requirementCode,
          actionSource: config.source,
          focusTarget: true,
        });
      } catch (error) {
        const friendlyMessage = getFriendlyErrorMessage(
          error,
          "We could not upload the selected document. Try again."
        );
        setFlash(friendlyMessage, true);
        setDocumentUploadFeedback(friendlyMessage, "error");
        schedulePortalViewportRestore({
          sectionCode: DOCUMENT_SECTION_CODE,
          requirementCode: config.requirementCode,
          actionSource: config.source,
          focusTarget: true,
          delay: 80,
        });
      }
    }
`;
