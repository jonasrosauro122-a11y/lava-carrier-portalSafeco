// =========================
// Multi-tab Quote Script
// Saves draft to localStorage and final quotes to "quotes"
// Handles Next / Previous, Save per section, Summary, Issue
// =========================

/* ---------- Utility helpers ---------- */

const DRAFT_KEY = "quoteDraft";
const QUOTES_KEY = "quotes";

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

/* ---------- Tab navigation ---------- */

function showTabById(tabButtonId) {
  const btn = document.getElementById(tabButtonId);
  if (!btn) return;
  const tab = new bootstrap.Tab(btn);
  tab.show();
}

function nextTab(currentBtnElement) {
  const next = currentBtnElement.closest(".tab-pane").nextElementSibling;
  if (!next) return;
  const id = next.getAttribute("id");
  const btn = document.querySelector(`#quoteTabs button[data-bs-target="#${id}"]`);
  if (btn) {
    new bootstrap.Tab(btn).show();
  }
}

function prevTab(currentBtnElement) {
  const prev = currentBtnElement.closest(".tab-pane").previousElementSibling;
  if (!prev) return;
  const id = prev.getAttribute("id");
  const btn = document.querySelector(`#quoteTabs button[data-bs-target="#${id}"]`);
  if (btn) {
    new bootstrap.Tab(btn).show();
  }
}

/* ---------- Form population helpers ---------- */

function fillField(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.tagName === "SELECT" || el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.value = value ?? "";
  else el.textContent = value ?? "";
}

function readField(id) {
  const el = document.getElementById(id);
  if (!el) return undefined;
  return el.value;
}

/* ---------- Build / read draft from UI ---------- */

function readPolicyInfoIntoDraft(draft) {
  draft.policy = draft.policy || {};
  draft.policy.ratingState = readField("ratingState");
  draft.policy.quoteDate = readField("quoteDate");
  draft.policy.policyForm = readField("policyForm");
  draft.policy.effectiveDate = readField("effectiveDate");
  draft.policy.agentNumber = readField("agentNumber");
  draft.policy.quoteDescription = readField("quoteDescription");

  draft.applicant = draft.applicant || {};
  draft.applicant.firstName = readField("firstName");
  draft.applicant.middleName = readField("middleName");
  draft.applicant.lastName = readField("lastName");
  draft.applicant.birthDate = readField("birthDate");
  draft.applicant.maritalStatus = readField("maritalStatus");
  draft.applicant.emailAddress = readField("emailAddress");
}

function readAddressIntoDraft(draft) {
  draft.address = draft.address || {};
  draft.address.street = readField("addrStreet");
  draft.address.city = readField("addrCity");
  draft.address.state = readField("addrState");
  draft.address.zip = readField("addrZip");
  draft.address.residenceType = readField("residenceType");
  draft.address.yearBuilt = readField("yearBuilt");
}

function readDriverIntoDraft(draft) {
  const drivers = [];
  const driverRows = document.querySelectorAll(".driver-row");
  driverRows.forEach((row) => {
    const d = {
      firstName: row.querySelector(".drv-first").value,
      lastName: row.querySelector(".drv-last").value,
      birthDate: row.querySelector(".drv-bdate").value,
      license: row.querySelector(".drv-license").value
    };
    if (d.firstName || d.lastName) drivers.push(d);
  });
  draft.drivers = drivers;
}

function readVehicleIntoDraft(draft) {
  const vehicles = [];
  const vehicleRows = document.querySelectorAll(".vehicle-row");
  vehicleRows.forEach((row) => {
    const v = {
      year: row.querySelector(".veh-year").value,
      make: row.querySelector(".veh-make").value,
      model: row.querySelector(".veh-model").value,
      vin: row.querySelector(".veh-vin").value
    };
    if (v.make || v.model) vehicles.push(v);
  });
  draft.vehicles = vehicles;
}

function readUnderwritingIntoDraft(draft) {
  draft.underwriting = draft.underwriting || {};
  draft.underwriting.priorLosses = readField("priorLosses");
  draft.underwriting.creditScore = readField("creditScore");
}

function readCoveragesIntoDraft(draft) {
  draft.coverages = draft.coverages || {};
  draft.coverages.dwellingLimit = readField("dwellingLimit");
  draft.coverages.deductible = readField("deductible");
}

function readOrderReportsIntoDraft(draft) {
  const sel = document.getElementById("reportsToOrder");
  draft.reports = [];
  if (sel) {
    Array.from(sel.selectedOptions).forEach(opt => draft.reports.push(opt.value));
  }
}

function readBillingIntoDraft(draft) {
  draft.billing = draft.billing || {};
  draft.billing.paymentPlan = readField("paymentPlan");
  draft.billing.billingAccount = readField("billingAccount");
}

function readIssueIntoDraft(draft) {
  draft.issue = draft.issue || {};
  draft.issue.finalNotes = readField("finalNotes");
}

/* ---------- Populate UI from draft ---------- */

function populatePolicyInfoFromDraft(d) {
  if (!d) return;
  fillField("ratingState", d.policy?.ratingState);
  fillField("quoteDate", d.policy?.quoteDate);
  fillField("policyForm", d.policy?.policyForm);
  fillField("effectiveDate", d.policy?.effectiveDate);
  fillField("agentNumber", d.policy?.agentNumber);
  fillField("quoteDescription", d.policy?.quoteDescription);

  fillField("firstName", d.applicant?.firstName);
  fillField("middleName", d.applicant?.middleName);
  fillField("lastName", d.applicant?.lastName);
  fillField("birthDate", d.applicant?.birthDate);
  fillField("maritalStatus", d.applicant?.maritalStatus);
  fillField("emailAddress", d.applicant?.emailAddress);
}

function populateAddressFromDraft(d) {
  fillField("addrStreet", d.address?.street);
  fillField("addrCity", d.address?.city);
  fillField("addrState", d.address?.state);
  fillField("addrZip", d.address?.zip);
  fillField("residenceType", d.address?.residenceType);
  fillField("yearBuilt", d.address?.yearBuilt);
}

function populateDriversFromDraft(d) {
  const list = document.getElementById("driverList");
  list.innerHTML = "";
  const drivers = d.drivers || [];
  if (drivers.length === 0) {
    // show an empty single driver row
    addDriverRow();
    return;
  }
  drivers.forEach(dr => addDriverRow(dr));
}

function addDriverRow(data = {}) {
  const container = document.getElementById("driverList");
  const idx = container.children.length;
  const row = document.createElement("div");
  row.className = "driver-row border rounded p-3 mb-2";
  row.innerHTML = `
    <div class="row g-2">
      <div class="col-md-3"><input class="form-control drv-first" placeholder="First name" value="${data.firstName ?? ""}"></div>
      <div class="col-md-3"><input class="form-control drv-last" placeholder="Last name" value="${data.lastName ?? ""}"></div>
      <div class="col-md-3"><input type="date" class="form-control drv-bdate" value="${data.birthDate ?? ""}"></div>
      <div class="col-md-2"><input class="form-control drv-license" placeholder="License #" value="${data.license ?? ""}"></div>
      <div class="col-md-1 d-flex align-items-center">
        <button type="button" class="btn btn-sm btn-danger ms-auto remove-driver">✕</button>
      </div>
    </div>
  `;
  container.appendChild(row);

  row.querySelector(".remove-driver").addEventListener("click", () => {
    row.remove();
  });
}

function populateVehiclesFromDraft(d) {
  const list = document.getElementById("vehicleList");
  list.innerHTML = "";
  const vehicles = d.vehicles || [];
  if (vehicles.length === 0) {
    addVehicleRow();
    return;
  }
  vehicles.forEach(v => addVehicleRow(v));
}

function addVehicleRow(data = {}) {
  const container = document.getElementById("vehicleList");
  const row = document.createElement("div");
  row.className = "vehicle-row border rounded p-3 mb-2";
  row.innerHTML = `
    <div class="row g-2">
      <div class="col-md-2"><input class="form-control veh-year" placeholder="Year" value="${data.year ?? ""}"></div>
      <div class="col-md-3"><input class="form-control veh-make" placeholder="Make" value="${data.make ?? ""}"></div>
      <div class="col-md-3"><input class="form-control veh-model" placeholder="Model" value="${data.model ?? ""}"></div>
      <div class="col-md-3"><input class="form-control veh-vin" placeholder="VIN" value="${data.vin ?? ""}"></div>
      <div class="col-md-1 d-flex align-items-center">
        <button type="button" class="btn btn-sm btn-danger ms-auto remove-vehicle">✕</button>
      </div>
    </div>
  `;
  container.appendChild(row);
  row.querySelector(".remove-vehicle").addEventListener("click", () => row.remove());
}

function populateUnderwritingFromDraft(d) {
  fillField("priorLosses", d.underwriting?.priorLosses);
  fillField("creditScore", d.underwriting?.creditScore);
}

function populateCoveragesFromDraft(d) {
  fillField("dwellingLimit", d.coverages?.dwellingLimit);
  fillField("deductible", d.coverages?.deductible);
}

function populateOrderReportsFromDraft(d) {
  const sel = document.getElementById("reportsToOrder");
  if (!sel) return;
  Array.from(sel.options).forEach(opt => opt.selected = (d.reports || []).includes(opt.value));
}

function populateBillingFromDraft(d) {
  fillField("paymentPlan", d.billing?.paymentPlan);
  fillField("billingAccount", d.billing?.billingAccount);
}

function populateIssueFromDraft(d) {
  fillField("finalNotes", d.issue?.finalNotes);
}

/* ---------- Summary rendering ---------- */

function renderSummary(draft) {
  const out = document.getElementById("summaryPreview");
  if (!out) return;
  const p = draft || {};
  const applicant = p.applicant || {};
  const policy = p.policy || {};
  const address = p.address || {};
  const drivers = p.drivers || [];
  const vehicles = p.vehicles || [];
  const coverages = p.coverages || {};

  out.innerHTML = `
    <h5>Policy</h5>
    <p><strong>State:</strong> ${policy.ratingState ?? "—"} &nbsp; <strong>Form:</strong> ${policy.policyForm ?? "—"} &nbsp; <strong>Effective:</strong> ${policy.effectiveDate ?? "—"}</p>

    <h5>Applicant</h5>
    <p>${applicant.firstName ?? ""} ${applicant.lastName ?? ""} — ${applicant.emailAddress ?? ""}</p>

    <h5>Address</h5>
    <p>${address.street ?? "—"}, ${address.city ?? ""} ${address.state ?? ""} ${address.zip ?? ""}</p>

    <h5>Drivers (${drivers.length})</h5>
    <ul>${drivers.map(d => `<li>${d.firstName ?? ""} ${d.lastName ?? ""} — ${d.license ?? ""}</li>`).join("")}</ul>

    <h5>Vehicles (${vehicles.length})</h5>
    <ul>${vehicles.map(v => `<li>${v.year ?? ""} ${v.make ?? ""} ${v.model ?? ""} — ${v.vin ?? ""}</li>`).join("")}</ul>

    <h5>Coverages</h5>
    <p><strong>Dwelling:</strong> ${coverages.dwellingLimit ?? "—"} &nbsp; <strong>Deductible:</strong> ${coverages.deductible ?? "—"}</p>
  `;
}

/* ---------- Validation helpers ---------- */

function validateRequiredFields(formElement) {
  if (!formElement) return true;
  const requiredFields = formElement.querySelectorAll("[required]");
  for (let el of requiredFields) {
    if (!el.value || el.value.trim() === "") {
      el.focus();
      return false;
    }
  }
  return true;
}

/* ---------- Wire up events on DOM ready ---------- */

document.addEventListener("DOMContentLoaded", () => {
  // Load draft into UI
  const draft = loadDraft();
  populatePolicyInfoFromDraft(draft);
  populateAddressFromDraft(draft);
  populateDriversFromDraft(draft);
  populateVehiclesFromDraft(draft);
  populateUnderwritingFromDraft(draft);
  populateCoveragesFromDraft(draft);
  populateOrderReportsFromDraft(draft);
  populateBillingFromDraft(draft);
  populateIssueFromDraft(draft);
  renderSummary(draft);

  // Add core controls
  // Policy: Save & Next
  document.getElementById("policySave").addEventListener("click", () => {
    const f = document.getElementById("form-policyInfo");
    if (!validateRequiredFields(f)) { showToast("Please complete required fields.", "danger"); return; }
    const d = loadDraft();
    readPolicyInfoIntoDraft(d);
    saveDraft(d);
    showToast("Policy information saved.", "success");
    renderSummary(d);
  });
  document.getElementById("policyNext").addEventListener("click", () => {
    const f = document.getElementById("form-policyInfo");
    if (!validateRequiredFields(f)) { showToast("Please complete required fields.", "danger"); return; }
    const d = loadDraft();
    readPolicyInfoIntoDraft(d);
    saveDraft(d);
    renderSummary(d);
    showTabById("tab-address");
  });

  // Address: Prev Save Next
  document.getElementById("addressPrev").addEventListener("click", (e) => prevTab(e.target));
  document.getElementById("addressSave").addEventListener("click", () => {
    const f = document.getElementById("form-address");
    if (!validateRequiredFields(f)) { showToast("Please complete required fields.", "danger"); return; }
    const d = loadDraft(); readAddressIntoDraft(d); saveDraft(d);
    showToast("Address saved.", "success"); renderSummary(d);
  });
  document.getElementById("addressNext").addEventListener("click", (e) => {
    const f = document.getElementById("form-address");
    if (!validateRequiredFields(f)) { showToast("Please complete required fields.", "danger"); return; }
    const d = loadDraft(); readAddressIntoDraft(d); saveDraft(d); renderSummary(d); showTabById("tab-driver");
  });

  // Driver: add, save, prev, next
  document.getElementById("addDriverBtn").addEventListener("click", () => addDriverRow());
  document.getElementById("driverPrev").addEventListener("click", (e) => prevTab(e.target));
  document.getElementById("driverSave").addEventListener("click", () => {
    const d = loadDraft(); readDriverIntoDraft(d); saveDraft(d); showToast("Driver(s) saved.", "success"); renderSummary(d);
  });
  document.getElementById("driverNext").addEventListener("click", (e) => {
    const d = loadDraft(); readDriverIntoDraft(d); saveDraft(d); renderSummary(d); showTabById("tab-vehicle");
  });

  // Vehicle: add, save, prev, next
  document.getElementById("addVehicleBtn").addEventListener("click", () => addVehicleRow());
  document.getElementById("vehiclePrev").addEventListener("click", (e) => prevTab(e.target));
  document.getElementById("vehicleSave").addEventListener("click", () => {
    const d = loadDraft(); readVehicleIntoDraft(d); saveDraft(d); showToast("Vehicle(s) saved.", "success"); renderSummary(d);
  });
  document.getElementById("vehicleNext").addEventListener("click", (e) => {
    const d = loadDraft(); readVehicleIntoDraft(d); saveDraft(d); renderSummary(d); showTabById("tab-underwriting");
  });

  // Underwriting
  document.getElementById("underPrev").addEventListener("click", (e) => prevTab(e.target));
  document.getElementById("underSave").addEventListener("click", () => {
    const d = loadDraft(); readUnderwritingIntoDraft(d); saveDraft(d); showToast("Underwriting saved.", "success"); renderSummary(d);
  });
  document.getElementById("underNext").addEventListener("click", (e) => {
    const d = loadDraft(); readUnderwritingIntoDraft(d); saveDraft(d); renderSummary(d); showTabById("tab-coverages");
  });

  // Coverages
  document.getElementById("coverPrev").addEventListener("click", (e) => prevTab(e.target));
  document.getElementById("coverSave").addEventListener("click", () => {
    const d = loadDraft(); readCoveragesIntoDraft(d); saveDraft(d); showToast("Coverages saved.", "success"); renderSummary(d);
  });
  document.getElementById("coverNext").addEventListener("click", (e) => {
    const d = loadDraft(); readCoveragesIntoDraft(d); saveDraft(d); renderSummary(d); showTabById("tab-summary");
  });

  // Summary
  document.getElementById("summaryPrev").addEventListener("click", (e) => prevTab(e.target));
  document.getElementById("saveAsDraft").addEventListener("click", () => {
    const d = loadDraft(); // already saved in previous steps
    showToast("Draft saved.", "success");
  });
  document.getElementById("saveFullQuote").addEventListener("click", () => {
    // validate minimum required before saving full quote
    const d = loadDraft();
    readPolicyInfoIntoDraft(d);
    readAddressIntoDraft(d);
    readDriverIntoDraft(d);
    readVehicleIntoDraft(d);
    readUnderwritingIntoDraft(d);
    readCoveragesIntoDraft(d);
    readOrderReportsIntoDraft(d);
    readBillingIntoDraft(d);
    readIssueIntoDraft(d);

    // minimal validation
    if (!d.applicant?.firstName || !d.applicant?.lastName || !d.policy?.ratingState || !d.policy?.policyForm) {
      showToast("Please complete required policy and applicant information before saving quote.", "danger");
      showTabById("tab-policyInfo");
      return;
    }

    // finalize and save
    const final = {
      ...d,
      id: "Q-" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "Saved"
    };
    saveFinalQuote(final);
    clearDraft();
    showToast("Quote saved successfully!", "success");
    setTimeout(() => window.location.href = "dashboard.html", 900);
  });

  // Order Reports
  document.getElementById("orderPrev").addEventListener("click", (e) => prevTab(e.target));
  document.getElementById("orderSave").addEventListener("click", () => {
    const d = loadDraft(); readOrderReportsIntoDraft(d); saveDraft(d); showToast("Order reports saved.", "success"); renderSummary(d);
  });
  document.getElementById("orderNext").addEventListener("click", (e) => {
    const d = loadDraft(); readOrderReportsIntoDraft(d); saveDraft(d); renderSummary(d); showTabById("tab-billing");
  });

  // Billing
  document.getElementById("billingPrev").addEventListener("click", (e) => prevTab(e.target));
  document.getElementById("billingSave").addEventListener("click", () => {
    const d = loadDraft(); readBillingIntoDraft(d); saveDraft(d); showToast("Billing saved.", "success"); renderSummary(d);
  });
  document.getElementById("billingNext").addEventListener("click", (e) => {
    const d = loadDraft(); readBillingIntoDraft(d); saveDraft(d); renderSummary(d); showTabById("tab-issue");
  });

  // Issue
  document.getElementById("issuePrev").addEventListener("click", (e) => prevTab(e.target));
  document.getElementById("issueSave").addEventListener("click", () => {
    const d = loadDraft(); readIssueIntoDraft(d); saveDraft(d); showToast("Issue notes saved.", "success"); renderSummary(d);
  });
  document.getElementById("issuePolicy").addEventListener("click", () => {
    const d = loadDraft();
    readPolicyInfoIntoDraft(d);
    readAddressIntoDraft(d);
    readDriverIntoDraft(d);
    readVehicleIntoDraft(d);
    readUnderwritingIntoDraft(d);
    readCoveragesIntoDraft(d);
    readOrderReportsIntoDraft(d);
    readBillingIntoDraft(d);
    readIssueIntoDraft(d);

    // final validation
    if (!d.applicant?.firstName || !d.policy?.policyForm) {
      showToast("Complete required fields before issuing.", "danger");
      showTabById("tab-policyInfo");
      return;
    }

    const final = {
      ...d,
      id: "Q-" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "Issued"
    };
    saveFinalQuote(final);
    clearDraft();
    showToast("Policy issued successfully!", "success");
    setTimeout(() => window.location.href = "dashboard.html", 900);
  });

  // when summary tab is shown, re-render summary
  const summaryTabBtn = document.getElementById("tab-summary");
  summaryTabBtn && summaryTabBtn.addEventListener("shown.bs.tab", () => renderSummary(loadDraft()));

  // expose add driver/vehicle remove buttons already done in functions
});

/* EOF */
