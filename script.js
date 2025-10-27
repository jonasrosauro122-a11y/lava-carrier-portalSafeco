// =============================================================
// UNIVERSAL SCRIPT for dashboard.html and quote.html
// =============================================================

const DRAFT_KEY = "quoteDraft";
const QUOTES_KEY = "quotes";

/* ---------- Toast Helper ---------- */
function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container position-fixed top-0 end-0 p-3";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 show shadow mb-2`;
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-semibold">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ---------- LocalStorage Helpers ---------- */
function saveDraft(draft) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft || {}));
}
function loadDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  return raw ? JSON.parse(raw) : {};
}
function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}
function saveFinalQuote(quote) {
  const arr = JSON.parse(localStorage.getItem(QUOTES_KEY)) || [];
  arr.unshift(quote);
  localStorage.setItem(QUOTES_KEY, JSON.stringify(arr));
}

/* ============================================================
   PAGE DETECTION
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (path.includes("dashboard.html")) initDashboardPage();
  else if (path.includes("quote.html")) initQuotePage();
});

/* ============================================================
   DASHBOARD PAGE
   ============================================================ */
function initDashboardPage() {
  const tableBody = document.querySelector("#recentQuotesTable tbody");
  const quotes = JSON.parse(localStorage.getItem(QUOTES_KEY)) || [];

  if (tableBody) {
    tableBody.innerHTML = quotes.length
      ? ""
      : `<tr><td colspan="5" class="text-center text-muted py-3">No recent quotes found.</td></tr>`;

    quotes.forEach((q) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${q.applicant?.firstName ?? ""} ${q.applicant?.lastName ?? ""}</td>
        <td>${q.policy?.policyForm ?? "—"}</td>
        <td>${q.policy?.quoteDescription ?? "—"}</td>
        <td>${q.policy?.ratingState ?? "—"}</td>
        <td>${new Date(q.createdAt).toLocaleDateString()}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Start Quote buttons
  const startQuoteBtns = document.querySelectorAll(
    "#startQuoteBtn, #startQuoteCardBtn, .startQuoteBtn"
  );
  startQuoteBtns.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "quote.html";
    })
  );
}

/* ============================================================
   QUOTE PAGE
   ============================================================ */
function initQuotePage() {
  const quoteForm = document.getElementById("quoteForm");
  if (!quoteForm) return;

  const fields = [
    "firstName", "middleName", "lastName", "birthDate", "maritalStatus", "emailAddress",
    "ratingState", "policyForm", "quoteDate", "effectiveDate", "agentNumber", "quoteDescription"
  ];

  // Restore any draft data
  const draft = loadDraft();
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el && draft[f]) el.value = draft[f];
  });

  // Auto-save on input change
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el) el.addEventListener("input", () => {
      const newDraft = {};
      fields.forEach(f2 => {
        const el2 = document.getElementById(f2);
        if (el2) newDraft[f2] = el2.value;
      });
      saveDraft(newDraft);
    });
  });

  // Handle Save Quote
  quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const policy = {
      ratingState: getVal("ratingState"),
      policyForm: getVal("policyForm"),
      quoteDate: getVal("quoteDate") || new Date().toISOString().split("T")[0],
      effectiveDate: getVal("effectiveDate"),
      agentNumber: getVal("agentNumber"),
      quoteDescription: getVal("quoteDescription"),
    };

    const applicant = {
      firstName: getVal("firstName"),
      middleName: getVal("middleName"),
      lastName: getVal("lastName"),
      birthDate: getVal("birthDate"),
      maritalStatus: getVal("maritalStatus"),
      emailAddress: getVal("emailAddress"),
    };

    if (!applicant.firstName || !applicant.lastName || !policy.policyForm || !policy.ratingState) {
      showToast("Please complete all required fields.", "danger");
      return;
    }

    const quote = { policy, applicant, createdAt: new Date().toISOString() };
    saveFinalQuote(quote);
    clearDraft();
    showToast("✅ Quote saved successfully!", "success");

    setTimeout(() => (window.location.href = "dashboard.html"), 1000);
  });

  // Helper to get field value
  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  /* ---------- TAB NAVIGATION ---------- */
  document.querySelectorAll(".next-tab").forEach(btn =>
    btn.addEventListener("click", (e) => {
      const current = e.target.closest(".tab-pane");
      const next = current?.nextElementSibling;
      if (next) {
        const tabTrigger = document.querySelector(`[data-bs-target="#${next.id}"]`);
        if (tabTrigger) new bootstrap.Tab(tabTrigger).show();
      }
    })
  );

  document.querySelectorAll(".prev-tab").forEach(btn =>
    btn.addEventListener("click", (e) => {
      const current = e.target.closest(".tab-pane");
      const prev = current?.previousElementSibling;
      if (prev) {
        const tabTrigger = document.querySelector(`[data-bs-target="#${prev.id}"]`);
        if (tabTrigger) new bootstrap.Tab(tabTrigger).show();
      }
    })
  );
}
