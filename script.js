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
    // Use 'show' class to display immediately
    toast.className = `toast align-items-center text-bg-${type} border-0 show shadow mb-2`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body fw-semibold">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    container.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => toast.remove(), 3000);
}

/* ---------- LocalStorage Helpers ---------- */
function getDraftKey(productType) {
    return `${DRAFT_KEY}_${productType}`;
}

function saveDraft(draft, productType) {
    localStorage.setItem(getDraftKey(productType), JSON.stringify(draft || {}));
}

function loadDraft(productType) {
    const raw = localStorage.getItem(getDraftKey(productType));
    return raw ? JSON.parse(raw) : {};
}

function clearDraft(productType) {
    localStorage.removeItem(getDraftKey(productType));
}

function saveFinalQuote(quote) {
    const arr = JSON.parse(localStorage.getItem(QUOTES_KEY)) || [];
    arr.unshift(quote);
    localStorage.setItem(QUOTES_KEY, JSON.stringify(arr));
}

/* ---------- Helper to get field value ---------- */
function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

/* ---------- Helper to get checked radio value ---------- */
function getRadioVal(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : '';
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
        // Populate recent quotes table
        tableBody.innerHTML = quotes.length
            ? ""
            : `<tr><td colspan="5" class="text-center text-muted py-3">No recent quotes found.</td></tr>`;

        quotes.forEach((q) => {
            const name = q.applicant?.firstName || q.applicant?.applicantFirstName || '';
            const lastName = q.applicant?.lastName || q.applicant?.applicantLastName || '';
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${name} ${lastName}</td>
                <td>${q.productType ?? "—"}</td>
                <td>${q.policy?.quoteDescription ?? "—"}</td>
                <td>${q.policy?.ratingState ?? "—"}</td>
                <td>${new Date(q.createdAt).toLocaleDateString()}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Handle Start Quote button routing
    const startQuoteBtns = document.querySelectorAll(
        "#startQuoteBtn, #startQuoteCardBtn"
    );
    const quoteProductSelect = document.getElementById('quoteProductSelect');

    startQuoteBtns.forEach((btn) =>
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const selectedProduct = quoteProductSelect.value;
            
            if (selectedProduct === 'Auto' || selectedProduct === 'Home') {
                window.location.href = `quote.html?product=${selectedProduct}`;
            } else {
                showToast(`Starting a new ${selectedProduct} quote... (Not yet implemented)`, "info");
            }
        })
    );
}

/* ============================================================
    QUOTE PAGE
    ============================================================ */
function initQuotePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productType = urlParams.get('product') || 'Auto';
    
    document.getElementById('quoteTypeDisplay').textContent = `${productType} Quote`;
    
    // --- Setup Tabs and Content Based on Product Type ---
    
    const autoTabs = document.querySelectorAll('.tab-auto-only');
    const homeTabs = document.querySelectorAll('.tab-home-only');
    const underwritingHome = document.getElementById('underwriting-home-questions');
    const underwritingAuto = document.getElementById('underwriting-auto-questions');
    
    let firstContentTabId = productType === 'Home' ? '#applicant' : '#driver';
    let prevUnderwritingTarget = productType === 'Home' ? '#costGuide' : '#vehicle';

    if (productType === 'Home') {
        autoTabs.forEach(tab => tab.style.display = 'none');
        homeTabs.forEach(tab => tab.style.display = 'block');
        if (underwritingHome) underwritingHome.style.display = 'block';
        if (underwritingAuto) underwritingAuto.style.display = 'none';
    } else { // Auto
        autoTabs.forEach(tab => tab.style.display = 'block');
        homeTabs.forEach(tab => tab.style.display = 'none');
        if (underwritingHome) underwritingHome.style.display = 'none';
        if (underwritingAuto) underwritingAuto.style.display = 'block';
    }

    // Ensure initial tab is Policy Info
    const policyInfoTab = new bootstrap.Tab(document.getElementById('tab-policyInfo'));
    policyInfoTab.show();


    // --- Form Field Mapping and Draft Loading ---

    const allFields = {
        // Policy Info (Shared)
        ratingState: 'policy', policyForm: 'policy', agentNumber: 'policy', producerOtherId: 'policy',
        quoteDate: 'policy', effectiveDate: 'policy', originalQuoteDate: 'policy', agencyId: 'policy',
        quoteDescription: 'policy', additionalPolicyInfo: 'policy', reasonForPolicy: 'policy',
        
        // Address (Shared structure, Home fields)
        addrStreet: 'address', addrLine2: 'address', addrCity: 'address', addrState: 'address', 
        addrZip: 'address', timeYrs: 'address', timeMos: 'address',

        // Applicant (Home)
        applicantFirstName: 'applicant', applicantLastName: 'applicant', applicantBirthDate: 'applicant', 
        applicantMaritalStatus: 'applicant', applicantSSN: 'applicant',

        // Dwelling (Home)
        numStories: 'dwelling', protectionClass: 'dwelling', totalLivingArea: 'dwelling', 
        yearBuilt: 'dwelling', maintenanceCondition: 'dwelling', constructionStyle: 'dwelling', 
        inspectionDate: 'dwelling', dwellingType: 'dwelling', dwellingLocatedIn: 'dwelling', 
        roofMaterial: 'dwelling', roofRenovation: 'dwelling', heating: 'dwelling', 
        exteriorWalls: 'dwelling', foundationType: 'dwelling', fullBaths: 'dwelling', 
        partialBaths: 'dwelling', fireProtectionDistrict: 'dwelling',

        // Coverages (Example)
        dwellingLimit: 'coverages', deductible: 'coverages', liabilityLimits: 'coverages', collisionDeductible: 'coverages',
    };
    
    const draft = loadDraft(productType);

    // Restore draft data & set up auto-save
    Object.keys(allFields).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Restore draft value
            const group = allFields[id];
            if (draft[group] && draft[group][id]) {
                el.value = draft[group][id];
            }
            // Set up auto-save listener
            el.addEventListener("input", saveCurrentDraft);
        }
    });

    // Handle radio button draft restore/save (Mailing Address, Secondary Dwelling)
    ['sameAddress', 'secondaryDwelling', 'bypassCostGuide'].forEach(name => {
        const value = draft.radios ? draft.radios[name] : null;
        if (value) {
            const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
            if (radio) radio.checked = true;
        }
        document.querySelectorAll(`input[name="${name}"]`).forEach(radio => 
            radio.addEventListener("change", saveCurrentDraft)
        );
    });

    function saveCurrentDraft() {
        const newDraft = { policy: {}, address: {}, applicant: {}, dwelling: {}, coverages: {}, radios: {} };
        
        // Save field values
        Object.keys(allFields).forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                const group = allFields[id];
                newDraft[group][id] = el.value;
            }
        });

        // Save radio button values
        ['sameAddress', 'secondaryDwelling', 'bypassCostGuide'].forEach(name => {
            newDraft.radios[name] = getRadioVal(name);
        });

        saveDraft(newDraft, productType);
    }


    // --- Navigation Flow (Next/Previous Buttons) ---
    
    function navigateToTab(targetId) {
        const targetTabElement = document.getElementById(`tab-${targetId.replace('#', '')}`);
        if (targetTabElement) {
            const tab = new bootstrap.Tab(targetTabElement);
            tab.show();
        }
    }

    // Set custom next/previous targets
    document.getElementById('policyContinue').addEventListener('click', () => navigateToTab('#address'));
    document.getElementById('policyBack').addEventListener('click', () => window.location.href = 'dashboard.html');

    document.getElementById('addressBack').addEventListener('click', () => navigateToTab('#policyInfo'));
    document.getElementById('addressContinue').addEventListener('click', () => navigateToTab(firstContentTabId));
    
    // Auto flow nav - driver/vehicle
    if (productType === 'Auto') {
        document.getElementById('driverBack').addEventListener('click', () => navigateToTab('#address'));
        document.getElementById('driverContinue').addEventListener('click', () => navigateToTab('#vehicle'));
        document.getElementById('vehicleBack').addEventListener('click', () => navigateToTab('#driver'));
        document.getElementById('vehicleContinue').addEventListener('click', () => navigateToTab('#underwriting'));
    }

    // Home flow nav - applicant/dwelling/costGuide
    if (productType === 'Home') {
        document.getElementById('applicantBack').addEventListener('click', () => navigateToTab('#address'));
        document.getElementById('applicantContinue').addEventListener('click', () => navigateToTab('#dwellingInfo'));
        document.getElementById('dwellingInfoBack').addEventListener('click', () => navigateToTab('#applicant'));
        document.getElementById('dwellingInfoContinue').addEventListener('click', () => navigateToTab('#costGuide'));
        document.getElementById('costGuideBack').addEventListener('click', () => navigateToTab('#dwellingInfo'));
        document.getElementById('costGuideContinue').addEventListener('click', () => navigateToTab('#underwriting'));
    }

    // Shared flow nav - Underwriting
    document.getElementById('underPrev').addEventListener('click', () => navigateToTab(prevUnderwritingTarget));
    document.getElementById('underNext').addEventListener('click', () => navigateToTab('#coverages'));
    
    // Shared flow nav - Coverages to Issue
    document.getElementById('coverPrev').addEventListener('click', () => navigateToTab('#underwriting'));
    document.getElementById('coverNext').addEventListener('click', () => navigateToTab('#summary'));
    document.getElementById('summaryPrev').addEventListener('click', () => navigateToTab('#coverages'));
    document.getElementById('summaryNext').addEventListener('click', () => navigateToTab('#orderReports'));
    document.getElementById('orderPrev').addEventListener('click', () => navigateToTab('#summary'));
    document.getElementById('orderNext').addEventListener('click', () => navigateToTab('#billing'));
    document.getElementById('billingPrev').addEventListener('click', () => navigateToTab('#orderReports'));
    document.getElementById('billingNext').addEventListener('click', () => navigateToTab('#issue'));
    document.getElementById('issuePrev').addEventListener('click', () => navigateToTab('#billing'));


    // --- Final Quote Save and Issue Logic ---

    document.getElementById('policySave').addEventListener('click', saveCurrentDraft);
    document.getElementById('addressSave').addEventListener('click', saveCurrentDraft);
    document.getElementById('applicantSave').addEventListener('click', saveCurrentDraft);
    document.getElementById('dwellingInfoSave').addEventListener('click', saveCurrentDraft);
    document.getElementById('costGuideSave').addEventListener('click', saveCurrentDraft);
    document.getElementById('underSave').addEventListener('click', saveCurrentDraft);
    document.getElementById('coverSave').addEventListener('click', saveCurrentDraft);
    document.getElementById('orderSave').addEventListener('click', saveCurrentDraft);
    document.getElementById('billingSave').addEventListener('click', saveCurrentDraft);
    document.getElementById('issueSave').addEventListener('click', saveCurrentDraft);

    document.getElementById('saveFullQuote').addEventListener('click', () => {
        // Collect ALL data from the draft and radios
        const finalDraft = loadDraft(productType);
        
        // Simple validation check (can be expanded)
        if (!finalDraft.policy || !finalDraft.policy.ratingState) {
            showToast("Please complete Policy Information before saving the full quote.", "danger");
            return;
        }

        const quote = {
            productType: productType,
            policy: finalDraft.policy,
            address: finalDraft.address,
            applicant: finalDraft.applicant,
            dwelling: finalDraft.dwelling,
            coverages: finalDraft.coverages,
            underwritingRadios: finalDraft.radios,
            createdAt: new Date().toISOString()
        };

        saveFinalQuote(quote);
        clearDraft(productType);
        showToast("✅ Quote saved successfully!", "success");

        // Navigate to next step automatically
        navigateToTab('#orderReports');
    });

    document.getElementById('issuePolicy').addEventListener('click', () => {
        showToast("Policy Issued! Redirecting to Dashboard...", "success");
        setTimeout(() => (window.location.href = "dashboard.html"), 1000);
    });
}
