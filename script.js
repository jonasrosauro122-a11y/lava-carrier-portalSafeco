// =========================
// GLOBAL UTILITIES
// =========================

// Save quotes to localStorage
function saveQuote(quoteData) {
  const quotes = JSON.parse(localStorage.getItem("quotes")) || [];
  quotes.push(quoteData);
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load quotes into dashboard table
function loadQuotes() {
  const tableBody = document.querySelector("#recentQuotesTable tbody");
  if (!tableBody) return; // Only run on dashboard

  const quotes = JSON.parse(localStorage.getItem("quotes")) || [];
  tableBody.innerHTML = "";

  quotes.forEach((quote) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${quote.name}</td>
      <td>${quote.policyType}</td>
      <td>${quote.quoteDescription || "—"}</td>
      <td>${quote.state}</td>
      <td>${quote.date}</td>
    `;
    tableBody.appendChild(row);
  });
}

// =========================
// QUOTE FORM HANDLER
// =========================
document.addEventListener("DOMContentLoaded", function () {
  loadQuotes(); // Load on dashboard if table exists

  const quoteForm = document.getElementById("quoteForm");
  if (!quoteForm) return; // Only continue if on quote.html

  quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Collect input values
    const ratingState = document.getElementById("ratingState").value;
    const policyForm = document.getElementById("policyForm").value;
    const agentNumber = document.getElementById("agentNumber").value;
    const quoteDate =
      document.getElementById("quoteDate").value ||
      new Date().toISOString().split("T")[0];
    const effectiveDate = document.getElementById("effectiveDate").value;
    const quoteDescription =
      document.getElementById("quoteDescription").value || "";

    const firstName = document.getElementById("firstName").value;
    const middleName = document.getElementById("middleName").value;
    const lastName = document.getElementById("lastName").value;
    const birthDate = document.getElementById("birthDate").value;
    const maritalStatus = document.getElementById("maritalStatus").value;
    const emailAddress = document.getElementById("emailAddress").value;

    // Basic validation
    if (!firstName || !lastName || !ratingState || !policyForm) {
      showToast("Please complete all required fields.", "danger");
      return;
    }

    // Build quote data object
    const quoteData = {
      name: `${firstName} ${lastName}`,
      policyType: policyForm,
      quoteDescription: quoteDescription,
      state: ratingState,
      date: quoteDate,
      agentNumber,
      effectiveDate,
      birthDate,
      maritalStatus,
      emailAddress,
    };

    // Save to localStorage
    saveQuote(quoteData);

    // Show success notification
    showToast("Quote saved successfully!", "success");

    // Redirect to dashboard after short delay
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1500);
  });
});

// =========================
// TOAST NOTIFICATION SYSTEM
// =========================
function showToast(message, type = "success") {
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className =
      "toast-container position-fixed top-0 end-0 p-3";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 show`;
  toast.role = "alert";
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-semibold">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
