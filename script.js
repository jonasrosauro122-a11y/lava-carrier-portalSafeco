// =============================================================
// UNIVERSAL SCRIPT for dashboard.html and quote.html
// This script handles global utilities, local storage management, 
// and page-specific initialization logic.
// =============================================================

// --- CONSTANTS ---
const DRAFT_KEY = "quoteDraft";
const QUOTES_KEY = "quotes";

// --- GLOBAL UTILITIES ---

/** * Shows a Bootstrap-style toast notification. 
 * Requires Bootstrap CSS and the .toast-container element (can be dynamically created).
 * @param {string} message - The message content.
 * @param {string} type - 'success', 'danger', 'info', or 'warning'.
 */
function showToast(message, type = "success") {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container position-fixed top-0 end-0 p-3";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    // Use 'show' class and appropriate background color class
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

// --- LOCAL STORAGE HELPERS ---

/** Returns the product-specific draft key (e.g., "quoteDraft_Auto"). */
function getDraftKey(productType) {
    return `${DRAFT_KEY}_${productType}`;
}

/** Saves the current quote draft to localStorage. */
function saveDraft(draft, productType) {
    try {
        localStorage.setItem(getDraftKey(productType), JSON.stringify(draft || {}));
        console.log(`Draft for ${productType} saved.`);
    } catch (e) {
        console.error("Error saving draft to localStorage:", e);
    }
}

/** Loads the current quote draft from localStorage. */
function loadDraft(productType) {
    try {
        const raw = localStorage.getItem(getDraftKey(productType));
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        console.error("Error loading draft from localStorage:", e);
        return {};
    }
}

/** Clears a specific product draft from localStorage. */
function clearDraft(productType) {
    localStorage.removeItem(getDraftKey(productType));
    console.log(`Draft for ${productType} cleared.`);
}

/** Saves a finalized quote to the main quotes array in localStorage. */
function saveFinalQuote(quote) {
    try {
        const arr = JSON.parse(localStorage.getItem(QUOTES_KEY)) || [];
        arr.unshift(quote); // Add new quote to the beginning
        localStorage.setItem(QUOTES_KEY, JSON.stringify(arr));
        console.log("Final quote saved.");
    } catch (e) {
        console.error("Error saving final quote to localStorage:", e);
    }
}

/** Gets the value of an input element by ID. */
function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

/** Gets the value of a checked radio button by name. */
function getRadioVal(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : '';
}


// ============================================================
// PAGE INITIALIZATION AND DETECTION
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    const path = window.location.pathname;
    
    if (path.includes("dashboard.html")) {
        initDashboardPage();
    }
    else if (path.includes("quote.html")) {
        initQuotePage();
    }
});

// ============================================================
// DASHBOARD PAGE LOGIC
// ============================================================
function initDashboardPage() {
    const tableBody = document.querySelector("#recentQuotesTable tbody");
    const quotes = JSON.parse(localStorage.getItem(QUOTES_KEY)) || [];

    if (tableBody) {
        // Clear previous content
        tableBody.innerHTML = '';
        
        // Populate recent quotes table
        if (quotes.length === 0) {
             tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-3">No recent quotes found.</td></tr>`;
        } else {
            // Sort by createdAt descending
            quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
    }

    // Handle Start Quote button routing
    const startQuoteBtns = document.querySelectorAll(
        "#startQuoteBtn, #startQuoteCardBtn"
    );
    const quoteProductSelect = document.getElementById('quoteProductSelect');

    startQuoteBtns.forEach((btn) =>
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const selectedProduct = quoteProductSelect ? quoteProductSelect.value : 'Auto';
            
            if (selectedProduct === 'Auto' || selectedProduct === 'Home') {
                // Redirect and pass the selected product type via URL parameter
                window.location.href = `quote.html?product=${selectedProduct}`;
            } else {
                showToast(`Starting a new ${selectedProduct} quote... (Not yet implemented)`, "info");
            }
        })
    );
}

// ============================================================
// QUOTE PAGE LOGIC
// ============================================================
function initQuotePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productType = urlParams.get('product') || 'Auto';
    
    document.getElementById('quoteTypeDisplay').textContent = `${productType} Quote`;
    
    // --- Setup Tabs and Content Based on Product Type ---
    const autoTabs = document.querySelectorAll('.tab-auto-only');
    const homeTabs = document.querySelectorAll('.tab-home-only');
    const underwritingHome = document.getElementById('underwriting-home-questions');
    const underwritingAuto = document.getElementById('underwriting-auto-questions');
    
    // Determine the first content tab and the previous tab for Underwriting
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

    // Ensure initial tab is Policy Info using Bootstrap Tab API
    const policyInfoTabElement = document.getElementById('tab-policyInfo');
    if (policyInfoTabElement) {
        const policyInfoTab = new bootstrap.Tab(policyInfoTabElement);
        policyInfoTab.show();
    }


    // --- Form Field Mapping and Draft Loading/Saving ---

    // Define all fields and their group name for drafting
    const allFields = {
        // Policy Info (Shared)
        ratingState: 'policy', policyForm: 'policy', agentNumber: 'policy', producerOtherId: 'policy',
        quoteDate: 'policy', effectiveDate: 'policy', originalQuoteDate: 'policy', agencyId: 'policy',
        quoteDescription: 'policy', additionalPolicyInfo: 'policy', reasonForPolicy: 'policy',
        
        // Address (Shared structure, Home fields)
        addrStreet: 'address', addrLine2: 'address', addrCity: 'address', addrState: 'address', 
        addrZip: 'address', timeYrs: 'address', timeMos: 'address',

        // Applicant (Home) / Driver (Auto, if those fields were included)
        applicantFirstName: 'applicant', applicantLastName: 'applicant', applicantBirthDate: 'applicant', 
        applicantMaritalStatus: 'applicant', applicantSSN: 'applicant',
        
        // Vehicle (Auto, if those fields were included)
        // vehicleYear: 'vehicle', vehicleMake: 'vehicle', // etc. 

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

    // Restore draft data & set up auto-save listeners
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

    // Handle radio button draft restore/save
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

    /** Collects all form data and saves it as a draft to localStorage. */
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
        showToast("Draft saved...", "info");
    }


    // --- Navigation Flow (Next/Previous Buttons) ---
    
    /** Shows the target tab pane using Bootstrap's API. */
    function navigateToTab(targetId) {
        // targetId will be like '#address' or '#costGuide'
        const targetTabElement = document.getElementById(`tab-${targetId.replace('#', '')}`);
        if (targetTabElement) {
            const tab = new bootstrap.Tab(targetTabElement);
            tab.show();
        }
    }

    // Set custom next/previous targets for all steps
    const navMap = {
        'policyContinue': '#address',
        'policyBack': 'dashboard.html',
        'addressBack': '#policyInfo',
        'addressContinue': firstContentTabId,
        
        // Auto Flow (Driver, Vehicle) - Assumes these tabs exist
        'driverBack': '#address',
        'driverContinue': '#vehicle',
        'vehicleBack': '#driver',
        'vehicleContinue': '#underwriting',

        // Home Flow (Applicant, Dwelling, Cost Guide)
        'applicantBack': '#address',
        'applicantContinue': '#dwellingInfo',
        'dwellingInfoBack': '#applicant',
        'dwellingInfoContinue': '#costGuide',
        'costGuideBack': '#dwellingInfo',
        'costGuideContinue': '#underwriting',
        
        // Shared Flow
        'underPrev': prevUnderwritingTarget, // Dynamically set above
        'underNext': '#coverages',
        'coverPrev': '#underwriting',
        'coverNext': '#summary',
        'summaryPrev': '#coverages',
        'summaryNext': '#orderReports',
        'orderPrev': '#summary',
        'orderNext': '#billing',
        'billingPrev': '#orderReports',
        'billingNext': '#issue',
        'issuePrev': '#billing',
    };

    Object.keys(navMap).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const target = navMap[btnId];
                
                if (btnId === 'policyBack') {
                     window.location.href = target;
                } else if (target.startsWith('#')) {
                    // Save draft on navigating forward before switching tabs
                    if (btnId.includes('Continue') || btnId.includes('Next')) {
                       saveCurrentDraft();
                    }
                    navigateToTab(target);
                }
            });
        }
    });

    // --- Final Quote Save and Issue Logic ---

    // Bind saveCurrentDraft to all individual save buttons
    ['policySave', 'addressSave', 'applicantSave', 'dwellingInfoSave', 'costGuideSave', 'underSave', 'coverSave', 'orderSave', 'billingSave', 'issueSave'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', saveCurrentDraft);
    });


    // Save Full Quote (Finalize)
    document.getElementById('saveFullQuote').addEventListener('click', () => {
        // Collect ALL data from the draft and radios
        const finalDraft = loadDraft(productType);
        
        // Simple validation check (e.g., must have a state and applicant name)
        if (!finalDraft.policy || !finalDraft.policy.ratingState || 
            !finalDraft.applicant || (!finalDraft.applicant.applicantFirstName && !finalDraft.applicant.firstName)) 
        {
            showToast("Please complete Policy and Applicant/Driver Information before saving the full quote.", "danger");
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
            createdAt: Date.now() // Use timestamp for sorting
        };

        saveFinalQuote(quote);
        clearDraft(productType);
        showToast("✅ Quote saved successfully!", "success");

        // Navigate to the next step (Order Reports)
        navigateToTab('#orderReports');
    });

    // Issue Policy Logic
    document.getElementById('issuePolicy').addEventListener('click', () => {
        showToast("Policy Issued! Redirecting to Dashboard...", "success");
        // Wait briefly for the toast to display, then redirect
        setTimeout(() => (window.location.href = "dashboard.html"), 1000);
    });
}
