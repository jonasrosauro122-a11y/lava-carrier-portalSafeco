// =============================================================
// UNIVERSAL SCRIPT for dashboard.html and quote.html
// =============================================================

const DRAFT_KEY = "quoteDraft";
const QUOTES_KEY = "quotes";

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (path.includes("dashboard.html")) initDashboardPage();
  if (path.includes("quote.html")) initQuotePage();
});

// =============================================================
// TOAST
// =============================================================
function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container position-fixed top-0 end-0 p-3";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 show shadow mb-2`;
  toast.innerHTML = `<div class="d-flex">
      <div class="toast-body fw-semibold">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// =============================================================
// DASHBOARD
// =============================================================
function initDashboardPage() {
  const quotes = JSON.parse(localStorage.getItem(QUOTES_KEY)) || [];
  const tbody = document.querySelector("#recentQuotesTable tbody");

  if (tbody) {
    tbody.innerHTML = "";
    if (quotes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No quotes found.</td></tr>`;
      return;
    }

    quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    quotes.forEach((q) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${q.applicantName || "—"}</td>
        <td>${q.productType}</td>
        <td>${q.estimatedPremium ? `$${q.estimatedPremium}` : "—"}</td>
        <td>${q.quoteDate || "—"}</td>
        <td>${new Date(q.createdAt).toLocaleDateString()}</td>`;
      tbody.appendChild(row);
    });
  }

  const startBtn = document.getElementById("startQuoteBtn");
  const select = document.getElementById("quoteProductSelect");
  if (startBtn && select) {
    startBtn.addEventListener("click", () => {
      const product = select.value.toLowerCase();
      window.location.href = `quote.html?type=${product}`;
    });
  }
}

// =============================================================
// QUOTE PAGE HANDLER
// =============================================================
function initQuotePage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type")?.toLowerCase() || "";

  const btnAuto = document.getElementById("chooseAuto");
  const btnHome = document.getElementById("chooseHome");
  const backBtns = document.querySelectorAll("#backBtn");

  if (type === "auto" || type === "home") startFlow(type);

  if (btnAuto) btnAuto.addEventListener("click", () => startFlow("auto"));
  if (btnHome) btnHome.addEventListener("click", () => startFlow("home"));
  backBtns.forEach((btn) => btn.addEventListener("click", () => (window.location.href = "dashboard.html")));
}

// =============================================================
// FLOW CONTROLLER
// =============================================================
function startFlow(type) {
  const selectCard = document.getElementById("selectCard");
  const autoSection = document.getElementById("autoQuoteSection");
  const homeSection = document.getElementById("homeQuoteSection");

  if (selectCard) selectCard.classList.add("hidden");
  if (type === "auto" && autoSection) {
    autoSection.classList.remove("hidden");
    homeSection?.classList.add("hidden");
  } else if (type === "home" && homeSection) {
    homeSection.classList.remove("hidden");
    autoSection?.classList.add("hidden");
  }

  const draft = loadDraft(type);
  restoreDraftData(draft);
  document.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", () => autoSaveDraft(type));
  });

  console.log(`✅ Started ${type.toUpperCase()} flow`);
}

// =============================================================
// STORAGE HELPERS
// =============================================================
function getDraftKey(type) {
  return `${DRAFT_KEY}_${type}`;
}
function saveDraft(data, type) {
  localStorage.setItem(getDraftKey(type), JSON.stringify(data));
}
function loadDraft(type) {
  const raw = localStorage.getItem(getDraftKey(type));
  return raw ? JSON.parse(raw) : {};
}
function restoreDraftData(draft) {
  Object.keys(draft).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = draft[id];
  });
}
function autoSaveDraft(type) {
  const inputs = document.querySelectorAll("input, select");
  const data = {};
  inputs.forEach((el) => {
    if (el.id) data[el.id] = el.value;
  });
  saveDraft(data, type);
}
function saveFinalQuote(quote) {
  const arr = JSON.parse(localStorage.getItem(QUOTES_KEY)) || [];
  arr.unshift(quote);
  localStorage.setItem(QUOTES_KEY, JSON.stringify(arr));
  showToast("Quote saved successfully!", "success");
}

// =============================================================
// CALCULATORS
// =============================================================
function generateAutoQuote() {
  const age = parseInt(document.getElementById("driverAge").value) || 30;
  const year = parseInt(document.getElementById("vehicleYear").value) || 2020;
  const mileage = parseInt(document.getElementById("annualMileage").value) || 12000;
  const homeowner = document.getElementById("homeowner")?.value === "Yes";
  const multiCar = document.getElementById("multiCar")?.value === "Yes";
  const premium = calcAutoPremium(age, year, mileage, homeowner, multiCar);

  document.getElementById("autoQuoteResult").innerHTML = `
    <h6>Estimated Auto Premium:</h6>
    <p><strong>$${premium}</strong> / 6-month policy</p>`;

  const quote = {
    productType: "Auto",
    applicantName: "Driver",
    estimatedPremium: premium,
    quoteDate: new Date().toISOString().split("T")[0],
    createdAt: Date.now(),
  };
  saveFinalQuote(quote);
}

function generateHomeQuote() {
  const name = document.getElementById("applicantName")?.value || "Applicant";
  const yearBuilt = parseInt(document.getElementById("yearBuilt").value) || 2000;
  const sqft = parseInt(document.getElementById("sqft").value) || 1500;
  const creditScore = parseInt(document.getElementById("creditScore").value) || 700;
  const stories = parseInt(document.getElementById("stories").value) || 1;
  const premium = calcHomePremium(yearBuilt, sqft, creditScore, stories);

  document.getElementById("homeQuoteResult").innerHTML = `
    <h6>Estimated Home Premium:</h6>
    <p><strong>$${premium}</strong> / annual policy</p>`;

  const quote = {
    productType: "Home",
    applicantName: name,
    estimatedPremium: premium,
    quoteDate: new Date().toISOString().split("T")[0],
    createdAt: Date.now(),
  };
  saveFinalQuote(quote);
}

function calcAutoPremium(age, year, mileage, homeowne
