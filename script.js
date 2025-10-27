// ========== LAVA Safeo - Quote Script ==========

// Run when DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {

  const quoteForm = document.getElementById("quoteForm");
  const quoteResult = document.getElementById("quoteResult");
  const quoteAmount = document.getElementById("quoteAmount");

  // Validate and calculate quote
  if (quoteForm) {
    quoteForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Collect values
      const fullName = document.getElementById("fullName").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const state = document.getElementById("state").value;
      const insuranceType = document.getElementById("insuranceType").value;
      const coverageAmount = parseFloat(document.getElementById("coverageAmount").value);

      // ====== Validation ======
      if (!fullName || !email || !phone || !state || !insuranceType || isNaN(coverageAmount)) {
        alert("⚠️ Please fill in all required fields before getting a quote.");
        return;
      }

      // ====== Quote Calculation ======
      let multiplier = 0.02;
      switch (insuranceType) {
        case "Auto Insurance": multiplier = 0.015; break;
        case "Home Insurance": multiplier = 0.012; break;
        case "Life Insurance": multiplier = 0.025; break;
        case "Health Insurance": multiplier = 0.02; break;
        case "Travel Insurance": multiplier = 0.01; break;
      }

      const quote = (coverageAmount * multiplier).toFixed(2);
      quoteAmount.textContent = quote;
      quoteResult.classList.remove("d-none");

      // ====== Save to Local Storage ======
      const newQuote = {
        name: fullName,
        email: email,
        phone: phone,
        state: state,
        type: insuranceType,
        coverage: coverageAmount,
        quote: quote,
        date: new Date().toLocaleString()
      };

      let savedQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
      savedQuotes.push(newQuote);
      localStorage.setItem("quotes", JSON.stringify(savedQuotes));

      // ====== Success Message ======
      alert(`✅ Quote generated successfully!\n\nEstimated Quote: $${quote}\nType: ${insuranceType}`);

      // ====== Reset Form ======
      quoteForm.reset();

      // Scroll to result smoothly
      window.scrollTo({
        top: quoteResult.offsetTop,
        behavior: "smooth"
      });
    });
  }

  // ====== Optional: Show Recent Quotes (if on dashboard.html) ======
  const quotesTable = document.getElementById("recentQuotesTable");
  if (quotesTable) {
    const savedQuotes = JSON.parse(localStorage.getItem("quotes")) || [];
    const tbody = quotesTable.querySelector("tbody");

    if (savedQuotes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No quotes generated yet.</td></tr>`;
    } else {
      tbody.innerHTML = savedQuotes
        .slice(-5)
        .reverse()
        .map(q => `
          <tr>
            <td>${q.name}</td>
            <td>${q.type}</td>
            <td>$${q.quote}</td>
            <td>${q.state}</td>
            <td>${q.date}</td>
          </tr>
        `)
        .join("");
    }
  }

});
