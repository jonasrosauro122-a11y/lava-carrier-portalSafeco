// =========================
// GLOBAL UTILITIES
// =========================

// Save quotes to localStorage
function saveQuote(quoteData) {
  const quotes = JSON.parse(localStorage.getItem("quotes")) || [];
  quotes.unshift(quoteData); // newest first
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Load quotes into dashboard table
function loadQuotes() {
  const tableBody = document.querySelector("#recentQuotesTable tbody");
  if (!tableBody) return;

  const quotes = JSON.parse(localStorage.getItem("quotes")) || [];
  tableBody.innerHTML = quotes.length
    ? ""
    : `<tr><td colspan="5" class="text-center text-muted py-3">No recent quotes found.</td></tr>`;

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
// DASHBOARD BUTTON LOGIC
// =========================
document.addEventListener("DOMContentLoaded", () => {
  // Load quotes if dashboard table exists
  loadQuotes();

  // Detect all "Start Quote" buttons
  const startQuoteButtons = document.querySelectorAll(
    "#startQuoteBtn, #startQuoteCardBtn, .startQuoteBtn"
  );

  startQuoteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      // Redirect to quote.html
      window.location.href = "quote.html";
    });
  });
});

// =========================
// QUOTE FORM HANDLER
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const quoteForm = document.getElementById("quoteForm");
  if (!quoteForm) return;

  quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const ratingState = document.getElementById("ratingState").value;
    const policyForm = document.getElementById("policyForm").value;
    const quoteDate =
      document.getElementById("quoteDate").value ||
      new Date().toISOString().split("T")[0];
    const quoteDescription =
      document.getElementById("quoteDescription").value || "";
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();

    if (!firstName || !lastName || !ratingState || !policyForm) {
      showToast("Please complete all required fields.", "danger");
      return;
    }

    const quoteData = {
      name: `${firstName} ${lastName}`,
      policyType: policyForm,
      quoteDescription,
      state: ratingState,
      date: quoteDate,
    };

    saveQuote(quoteData);
    showToast("Quote saved successfully!", "success");

    // Redirect back to dashboard after short delay
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1200);
  });
});

// =========================
// TOAST NOTIFICATIONS
// =========================
function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container position-fixed top-0 end-0 p-3";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${type} border-0 show shadow-lg mb-2`;
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body fw-semibold">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
