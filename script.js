// =============================================================
// UNIVERSAL SCRIPT for dashboard.html and quote.html (New Version)
// Compatible with dynamic Auto + Home quote.html
// =============================================================

// --- CONSTANTS ---
const DRAFT_KEY = "quoteDraft";
const QUOTES_KEY = "quotes";

// =============================================================
// TOAST UTILITY
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
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-semibold">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

// =============================================================
// LOCAL STORAGE HELPERS
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

function clearDraft(type) {
  localStorage.removeItem(getDraftKey(type));
}

function saveFinalQuote(quote) {
  const arr = JSON.parse(localStorage.getItem(QUOTES_KEY)) || [];
  arr.unshift(quote);
  localStorage.setItem(QUOTES_KEY, JSON.stringify(arr));
  showToast("Quote saved successfully!", "success");
}

// =============================================================
// PAGE DETECTION
// =============================================================
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  if (path.includes("dashboard.html")) initDashboardPage();
  if (path.includes("quote.html")) initQuotePage();
});

// =============================================================
// DASHBOARD PAGE
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
// QUOTE PAGE (Dynamic Auto + Home Integration)
// =============================================================
function initQuotePage() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type")?.toLowerCase() || "auto";

  // Restore saved draft if exists
  const draft = loadDraft(type);
  restoreDraftData(draft);

  // Auto-save on input
  document.querySelectorAll("input, select").forEach((el) => {
    el.addEventListener("input", () => autoSaveDraft(type));
  });

  // Hook into quote generation
  window.generateAutoQuote = () => {
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
  };

  window.generateHomeQuote = () => {
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
      applicantName: "Homeowner",
      estimatedPremium: premium,
      quoteDate: new Date().toISOString().split("T")[0],
      createdAt: Date.now(),
    };
    saveFinalQuote(quote);
  };
}

// =============================================================
// QUOTE DRAFT LOGIC
// =============================================================
function autoSaveDraft(type) {
  const inputs = document.querySelectorAll("input, select");
  const data = {};
  inputs.forEach((el) => {
    if (el.id) data[el.id] = el.value;
  });
  saveDraft(data, type);
}

function restoreDraftData(draft) {
  Object.keys(draft).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = draft[id];
  });
}

// =============================================================
// SIMPLE QUOTE CALCULATORS
// =============================================================
function calcAutoPremium(age, year, mileage, homeowner, multiCar) {
  let rate = 700 + (2025 - year) * 5;
  if (age < 25) rate += 150;
  if (mileage > 15000) rate += 100;
  if (homeowner) rate -= 75;
  if (multiCar) rate -= 100;
  return rate.toFixed(2);
}

function calcHomePremium(yearBuilt, sqft, creditScore, stories) {
  let rate = 800 + (2025 - yearBuilt) * 2 + (sqft / 1000) * 50;
  if (creditScore > 750) rate -= 75;
  if (stories > 1) rate += 40;
  return rate.toFixed(2);
}

// =============================================================
// HOME COVERAGE-BASED PREMIUM CALCULATOR (Coverage A–E)
// =============================================================
function calculateHomePremium() {
  const a = Number(document.getElementById('coverageA')?.value || 0);
  const b = Number(document.getElementById('coverageB')?.value || 0);
  const c = Number(document.getElementById('coverageC')?.value || 0);
  const d = Number(document.getElementById('coverageD')?.value || 0);
  const e = Number(document.getElementById('coverageE')?.value || 0);
  const name = document.getElementById('applicantName')?.value.trim() || 'Applicant';

  if (!a || !b || !c || !d || !e) {
    alert('Please fill all coverage amounts first.');
    return;
  }

  // Simple sample formula for mock premium calculation
  const base = (a + b + c + d + e) / 1000;
  const premium = Math.round(base * 0.9 + 450); // add small base factor

  const result = document.getElementById('homeQuoteResult');
  result.classList.remove('hidden');
  result.innerHTML = `
    <strong>${name}</strong>, your estimated annual home premium is:<br>
    <span style="font-size:20px;font-weight:800;color:#0d6efd;">$${premium.toLocaleString()}</span>
  `;

  // Save the quote
  const quote = {
    quoteNumber: "H-" + Date.now().toString().slice(-6),
    productType: "Home",
    applicantName: name,
    estimatedPremium: premium,
    quoteDate: new Date().toISOString().split("T")[0],
    createdAt: Date.now(),
  };
  saveFinalQuote(quote);
}
