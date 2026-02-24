console.log("auth.js geladen");

// ---------------- MSAL CONFIG ---------------------
const msalConfig = {
    auth: {
        clientId: "29dc0ff8-8b79-4291-b3bd-037f5f33c82f",
        authority: "https://kidsportal2.ciamlogin.com/4abbf94b-738e-4740-b4e7-e167dcc756ac",
        redirectUri: window.location.origin + "/home.html",
        knownAuthorities: ["kidsportal2.ciamlogin.com"]
    },
    cache: { cacheLocation: "localStorage" }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);
window.msalInstance = msalInstance;
let loginRedirectStarted = false;

function resetLoginRedirectState() {
    loginRedirectStarted = false;
}

function showCenteredLoginNotice(message) {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(0, 0, 0, 0.45)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "99999";

        const card = document.createElement("div");
        card.style.width = "min(92vw, 460px)";
        card.style.background = "#ffffff";
        card.style.borderRadius = "16px";
        card.style.padding = "22px 20px";
        card.style.boxShadow = "0 16px 36px rgba(0, 0, 0, 0.22)";
        card.style.textAlign = "center";
        card.style.fontFamily = "'Segoe UI', system-ui, -apple-system, sans-serif";

        const title = document.createElement("div");
        title.textContent = "🔐 Inloggen nodig";
        title.style.fontSize = "22px";
        title.style.fontWeight = "700";
        title.style.marginBottom = "8px";

        const body = document.createElement("div");
        body.textContent = message || "Je moet eerst inloggen om deze functie te gebruiken.";
        body.style.fontSize = "16px";
        body.style.lineHeight = "1.45";
        body.style.color = "#334155";

        const hint = document.createElement("div");
        hint.textContent = "Klik op de knop hieronder om verder te gaan naar inloggen.";
        hint.style.marginTop = "12px";
        hint.style.fontSize = "14px";
        hint.style.color = "#64748b";

        const actions = document.createElement("div");
        actions.style.marginTop = "16px";
        actions.style.display = "flex";
        actions.style.gap = "10px";
        actions.style.justifyContent = "center";

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Annuleren";
        cancelButton.style.padding = "10px 18px";
        cancelButton.style.border = "1px solid #cbd5e1";
        cancelButton.style.borderRadius = "10px";
        cancelButton.style.background = "#ffffff";
        cancelButton.style.color = "#334155";
        cancelButton.style.fontSize = "15px";
        cancelButton.style.fontWeight = "600";
        cancelButton.style.cursor = "pointer";

        const loginButton = document.createElement("button");
        loginButton.textContent = "Nu inloggen";
        loginButton.style.padding = "10px 18px";
        loginButton.style.border = "none";
        loginButton.style.borderRadius = "10px";
        loginButton.style.background = "#2563eb";
        loginButton.style.color = "#ffffff";
        loginButton.style.fontSize = "15px";
        loginButton.style.fontWeight = "600";
        loginButton.style.cursor = "pointer";

        cancelButton.addEventListener("click", () => {
            overlay.remove();
            resolve(false);
        });

        loginButton.addEventListener("click", () => {
            overlay.remove();
            resolve(true);
        });

        actions.appendChild(cancelButton);
        actions.appendChild(loginButton);

        card.appendChild(title);
        card.appendChild(body);
        card.appendChild(hint);
        card.appendChild(actions);
        overlay.appendChild(card);
        document.body.appendChild(overlay);
    });
}

function showSubscriptionManageModal() {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(0, 0, 0, 0.45)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "99999";

        const card = document.createElement("div");
        card.style.width = "min(92vw, 460px)";
        card.style.background = "#ffffff";
        card.style.borderRadius = "16px";
        card.style.padding = "22px 20px";
        card.style.boxShadow = "0 16px 36px rgba(0, 0, 0, 0.22)";
        card.style.textAlign = "center";
        card.style.fontFamily = "'Segoe UI', system-ui, -apple-system, sans-serif";

        const title = document.createElement("div");
        title.textContent = "Abonnement beheren";
        title.style.fontSize = "22px";
        title.style.fontWeight = "700";
        title.style.marginBottom = "8px";

        const body = document.createElement("div");
        body.textContent = "Je hebt onbeperkte toegang. Wil je je abonnement opzeggen?";
        body.style.fontSize = "16px";
        body.style.lineHeight = "1.45";
        body.style.color = "#334155";

        const hint = document.createElement("div");
        hint.textContent = "Je behoudt volledige toegang tot het einde van je huidige factuurperiode. Het abonnement stopt daarna automatisch.";
        hint.style.marginTop = "12px";
        hint.style.fontSize = "14px";
        hint.style.color = "#64748b";

        const actions = document.createElement("div");
        actions.style.marginTop = "16px";
        actions.style.display = "flex";
        actions.style.gap = "10px";
        actions.style.justifyContent = "center";

        const backButton = document.createElement("button");
        backButton.textContent = "Terug";
        backButton.style.padding = "10px 18px";
        backButton.style.border = "1px solid #cbd5e1";
        backButton.style.borderRadius = "10px";
        backButton.style.background = "#ffffff";
        backButton.style.color = "#334155";
        backButton.style.fontSize = "15px";
        backButton.style.fontWeight = "600";
        backButton.style.cursor = "pointer";

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Abonnement opzeggen";
        cancelButton.style.padding = "10px 18px";
        cancelButton.style.border = "none";
        cancelButton.style.borderRadius = "10px";
        cancelButton.style.background = "#dc2626";
        cancelButton.style.color = "#ffffff";
        cancelButton.style.fontSize = "15px";
        cancelButton.style.fontWeight = "600";
        cancelButton.style.cursor = "pointer";

        const closeWithResult = (value) => {
            overlay.remove();
            resolve(value);
        };

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                closeWithResult(false);
            }
        });

        backButton.addEventListener("click", () => closeWithResult(false));
        cancelButton.addEventListener("click", () => closeWithResult(true));

        actions.appendChild(backButton);
        actions.appendChild(cancelButton);

        card.appendChild(title);
        card.appendChild(body);
        card.appendChild(hint);
        card.appendChild(actions);
        overlay.appendChild(card);
        document.body.appendChild(overlay);
    });
}
window.showSubscriptionManageModal = showSubscriptionManageModal;

function showPlanTypeSelectionModal() {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(0, 0, 0, 0.45)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "99999";

        const card = document.createElement("div");
        card.style.width = "min(92vw, 520px)";
        card.style.background = "#ffffff";
        card.style.borderRadius = "16px";
        card.style.padding = "22px 20px";
        card.style.boxShadow = "0 16px 36px rgba(0, 0, 0, 0.22)";
        card.style.textAlign = "center";
        card.style.fontFamily = "'Segoe UI', system-ui, -apple-system, sans-serif";

        const title = document.createElement("div");
        title.textContent = "Kies je accounttype";
        title.style.fontSize = "22px";
        title.style.fontWeight = "700";
        title.style.marginBottom = "8px";

        const body = document.createElement("div");
        body.textContent = "Je kunt dit later altijd wijzigen bij abonnement kiezen.";
        body.style.fontSize = "16px";
        body.style.lineHeight = "1.45";
        body.style.color = "#334155";

        const actions = document.createElement("div");
        actions.style.marginTop = "16px";
        actions.style.display = "flex";
        actions.style.gap = "10px";
        actions.style.justifyContent = "center";
        actions.style.flexWrap = "wrap";

        const particulierButton = document.createElement("button");
        particulierButton.textContent = "Particulier (€4/mnd)";
        particulierButton.style.padding = "10px 18px";
        particulierButton.style.border = "1px solid #cbd5e1";
        particulierButton.style.borderRadius = "10px";
        particulierButton.style.background = "#ffffff";
        particulierButton.style.color = "#334155";
        particulierButton.style.fontSize = "15px";
        particulierButton.style.fontWeight = "600";
        particulierButton.style.cursor = "pointer";

        const enterpriseButton = document.createElement("button");
        enterpriseButton.textContent = "Enterprise (€30/mnd)";
        enterpriseButton.style.padding = "10px 18px";
        enterpriseButton.style.border = "none";
        enterpriseButton.style.borderRadius = "10px";
        enterpriseButton.style.background = "#2563eb";
        enterpriseButton.style.color = "#ffffff";
        enterpriseButton.style.fontSize = "15px";
        enterpriseButton.style.fontWeight = "600";
        enterpriseButton.style.cursor = "pointer";

        const closeWithSelection = (selectedPlanType) => {
            overlay.remove();
            resolve(selectedPlanType);
        };

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                closeWithSelection("particulier");
            }
        });

        particulierButton.addEventListener("click", () => closeWithSelection("particulier"));
        enterpriseButton.addEventListener("click", () => closeWithSelection("enterprise"));

        actions.appendChild(particulierButton);
        actions.appendChild(enterpriseButton);
        card.appendChild(title);
        card.appendChild(body);
        card.appendChild(actions);
        overlay.appendChild(card);
        document.body.appendChild(overlay);
    });
}
window.showPlanTypeSelectionModal = showPlanTypeSelectionModal;

function showEmailInputModal() {
    return new Promise((resolve) => {
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.background = "rgba(0, 0, 0, 0.45)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "99999";

        const card = document.createElement("div");
        card.style.width = "min(92vw, 460px)";
        card.style.background = "#ffffff";
        card.style.borderRadius = "16px";
        card.style.padding = "22px 20px";
        card.style.boxShadow = "0 16px 36px rgba(0, 0, 0, 0.22)";
        card.style.fontFamily = "'Segoe UI', system-ui, -apple-system, sans-serif";

        const title = document.createElement("div");
        title.textContent = "Wat is je e-mailadres?";
        title.style.fontSize = "22px";
        title.style.fontWeight = "700";
        title.style.marginBottom = "12px";
        title.style.textAlign = "center";

        const body = document.createElement("div");
        body.textContent = "We hebben je e-mailadres nodig om je account aan te maken.";
        body.style.fontSize = "15px";
        body.style.color = "#666";
        body.style.marginBottom = "16px";
        body.style.textAlign = "center";

        const input = document.createElement("input");
        input.type = "email";
        input.placeholder = "jouw@email.com";
        input.style.width = "100%";
        input.style.padding = "10px 12px";
        input.style.fontSize = "15px";
        input.style.border = "1px solid #cbd5e1";
        input.style.borderRadius = "8px";
        input.style.boxSizing = "border-box";
        input.style.marginBottom = "16px";
        input.focus();

        const actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "10px";
        actions.style.justifyContent = "center";

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Annuleren";
        cancelButton.style.padding = "10px 18px";
        cancelButton.style.border = "1px solid #cbd5e1";
        cancelButton.style.borderRadius = "8px";
        cancelButton.style.background = "#ffffff";
        cancelButton.style.color = "#334155";
        cancelButton.style.fontSize = "15px";
        cancelButton.style.fontWeight = "600";
        cancelButton.style.cursor = "pointer";

        const submitButton = document.createElement("button");
        submitButton.textContent = "Doorgaan";
        submitButton.style.padding = "10px 18px";
        submitButton.style.border = "none";
        submitButton.style.borderRadius = "8px";
        submitButton.style.background = "#2563eb";
        submitButton.style.color = "#ffffff";
        submitButton.style.fontSize = "15px";
        submitButton.style.fontWeight = "600";
        submitButton.style.cursor = "pointer";

        const closeWithResult = (email) => {
            overlay.remove();
            resolve(email);
        };

        overlay.addEventListener("click", (event) => {
            if (event.target === overlay) {
                closeWithResult("");
            }
        });

        cancelButton.addEventListener("click", () => closeWithResult(""));
        submitButton.addEventListener("click", () => {
            if (input.value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                closeWithResult(input.value.trim());
            } else {
                alert("Voer alstublieft een geldig e-mailadres in.");
            }
        });

        input.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                submitButton.click();
            }
        });

        actions.appendChild(cancelButton);
        actions.appendChild(submitButton);
        card.appendChild(title);
        card.appendChild(body);
        card.appendChild(input);
        card.appendChild(actions);
        overlay.appendChild(card);
        document.body.appendChild(overlay);
    });
}
window.showEmailInputModal = showEmailInputModal;

async function startLoginRedirectWithNotice(message) {
    if (loginRedirectStarted) {
        return;
    }

    loginRedirectStarted = true;
    const confirmed = await showCenteredLoginNotice(message || "Je moet eerst inloggen om deze functie te gebruiken.");
    if (!confirmed) {
        resetLoginRedirectState();
        if (!isPublicPage()) {
            window.location.href = "/home.html";
        }
        return;
    }

    try {
        window.location.href = "/login.html";
    } catch (error) {
        console.error("Login redirect error:", error);
        resetLoginRedirectState();
    }
}

window.startLoginRedirectWithNotice = startLoginRedirectWithNotice;

function applySubscriptionButtonState(abonnementBtn, isActive) {
    if (!abonnementBtn) {
        return;
    }

    if (isActive) {
        abonnementBtn.textContent = "Abonnement beheren";
        abonnementBtn.style.background = "#22c55e";
        abonnementBtn.style.color = "#ffffff";
    } else {
        abonnementBtn.textContent = "Upgrade naar onbeperkt";
        abonnementBtn.style.background = "#ef4444";
        abonnementBtn.style.color = "#ffffff";
    }
}

function isPublicPage() {
    const path = (window.location.pathname || "").toLowerCase();
    return path === "/" || path.endsWith("/home.html") || path.endsWith("/index.html");
}

function normalizeUserId(rawUserId) {
    if (!rawUserId) {
        return "";
    }
    return rawUserId.split('.')[0];
}

function getPreferredPlanTypeFromQuery() {
    const params = new URLSearchParams(window.location.search || "");
    const fromPlanType = (params.get("planType") || "").toLowerCase();
    const fromAccountType = (params.get("accountType") || "").toLowerCase();
    const candidate = fromPlanType || fromAccountType;
    if (candidate === "enterprise") {
        return "enterprise";
    }
    if (candidate === "particulier") {
        return "particulier";
    }
    return null;
}

function normalizePreferredPlanType(value) {
    const normalized = (value || "").toLowerCase();
    if (normalized === "enterprise") {
        return "enterprise";
    }
    if (normalized === "particulier") {
        return "particulier";
    }
    return null;
}

function isLikelyEmail(value) {
    if (!value || typeof value !== "string") {
        return false;
    }
    const trimmed = value.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function resolveAccountEmail(account) {
    const claims = account?.idTokenClaims || {};
    console.log("Resolving email from account claims:", JSON.stringify(claims, null, 2));
    
    // Priority 1: Real email claims (most reliable)
    const emailCandidates = [
        claims.email,
        claims.emailAddress,
        claims.mail
    ];

    if (Array.isArray(claims.emails)) {
        emailCandidates.push(...claims.emails);
    }

    console.log("Email candidates (priority 1 - real email fields):", emailCandidates);
    for (const candidate of emailCandidates) {
        if (isLikelyEmail(candidate)) {
            const trimmed = (candidate || "").trim().toLowerCase();
            // Prefer real domains over onmicrosoft.com
            if (!trimmed.includes("onmicrosoft.com") && !trimmed.includes("@unknown.local")) {
                console.log("Found real email address:", candidate);
                return candidate.trim();
            }
        }
    }

    // Priority 2: Sign-in names (could be email or UPN)
    const signInNameCandidates = [];
    
    if (Array.isArray(claims.signInNames)) {
        for (const signInName of claims.signInNames) {
            if (typeof signInName === "string") {
                signInNameCandidates.push(signInName);
            } else if (signInName && typeof signInName === "object") {
                signInNameCandidates.push(signInName.emailAddress, signInName.value);
            }
        }
    } else {
        signInNameCandidates.push(claims.signInNames?.emailAddress, claims.signInNames?.value);
    }

    console.log("SignIn name candidates (priority 2):", signInNameCandidates);
    for (const candidate of signInNameCandidates) {
        if (isLikelyEmail(candidate)) {
            const trimmed = (candidate || "").trim().toLowerCase();
            if (!trimmed.includes("onmicrosoft.com") && !trimmed.includes("@unknown.local")) {
                console.log("Found email in signIn names:", candidate);
                return candidate.trim();
            }
        }
    }

    // Priority 3: Fallback to UPN/username only if it looks like email
    const fallbackCandidates = [
        claims.preferred_username,
        claims.upn,
        account?.username
    ];

    console.log("Fallback candidates (priority 3 - UPN/username):", fallbackCandidates);
    for (const candidate of fallbackCandidates) {
        if (isLikelyEmail(candidate)) {
            const trimmed = (candidate || "").trim().toLowerCase();
            // Only use real domain names, not onmicrosoft.com
            if (!trimmed.includes("onmicrosoft.com") && !trimmed.includes("@unknown.local")) {
                console.log("Found email in fallback (real domain):", candidate);
                return candidate.trim();
            }
        }
    }

    // Deep search as last resort
    const stack = [claims];
    while (stack.length > 0) {
        const current = stack.pop();
        if (!current) {
            continue;
        }

        if (typeof current === "string") {
            if (isLikelyEmail(current)) {
                const trimmed = current.trim().toLowerCase();
                if (!trimmed.includes("onmicrosoft.com") && !trimmed.includes("@unknown.local")) {
                    console.log("Found email in recursive search:", current);
                    return current.trim();
                }
            }
            continue;
        }

        if (Array.isArray(current)) {
            for (const item of current) {
                stack.push(item);
            }
            continue;
        }

        if (typeof current === "object") {
            for (const value of Object.values(current)) {
                stack.push(value);
            }
        }
    }

    console.log("No real email found in MSAL claims, returning empty string");
    return "";
}

async function ensurePreferredPlanTypeSelection(forcePrompt = false) {
    const existing = normalizePreferredPlanType(localStorage.getItem("preferredPlanType"));
    if (existing && !forcePrompt) {
        return existing;
    }

    const selected = await showPlanTypeSelectionModal();
    localStorage.setItem("preferredPlanType", selected);
    return selected;
}
window.ensurePreferredPlanTypeSelection = ensurePreferredPlanTypeSelection;

// ---------------- REDIRECT HANDLING ---------------------
const msalReadyPromise = msalInstance.initialize()
    .then(async () => {
        console.log("MSAL initialized.");
        const response = await msalInstance.handleRedirectPromise();
        console.log("Redirect response:", response);
        if (response) {
            console.log("Redirect successful. Account added:", msalInstance.getAllAccounts());
        }
        resetLoginRedirectState();
        return response;
    })
    .catch(error => {
        console.error("MSAL init/redirect error:", error);
        resetLoginRedirectState();
        return null;
    });
window.msalReadyPromise = msalReadyPromise;

window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
        resetLoginRedirectState();
    }
});

window.addEventListener("load", () => {
    console.log("Page loaded. Calling updateUI.");
    updateUI();
});

// ---------------- UI LOGICA ---------------------
async function updateUI() {
    console.log("updateUI aangeroepen");

    // Always initialize MSAL first so CIAM-authenticated accounts take precedence
    await msalReadyPromise;

    const accounts = msalInstance.getAllAccounts();
    console.log("Accounts gevonden door msalInstance:", accounts);
    let userId = "";
    let userStatus = null;

    if (accounts.length > 0) {
        const account = accounts[0];
        const preferredFromQuery = normalizePreferredPlanType(getPreferredPlanTypeFromQuery());
        if (preferredFromQuery) {
            localStorage.setItem("preferredPlanType", preferredFromQuery);
        }

        const rawUserId = account.homeAccountId || account.localAccountId || account.username || "";
        userId = normalizeUserId(rawUserId);
        localStorage.setItem("userId", userId);
        localStorage.setItem("user-id", userId);
        localStorage.removeItem("requiresCiamSignup");
        console.log("User ID saved to localStorage:", userId);

        const emailFromClaims = resolveAccountEmail(account);
        const pendingSignupEmail = (localStorage.getItem("pendingSignupEmail") || "").trim();
        const email = emailFromClaims || pendingSignupEmail;
        console.log("Resolved email from claims:", email || "(none)");
        const name = account.name || account.idTokenClaims?.name || email || "Unknown";
        userStatus = await checkUserStatus(userId);
        if (userStatus && userStatus.error === "User not found" && userId) {
            await registerUser(userId, email, name);
            userStatus = await checkUserStatus(userId);
        }

        if (email && pendingSignupEmail && email.toLowerCase() === pendingSignupEmail.toLowerCase()) {
            localStorage.removeItem("pendingSignupEmail");
        }
    } else {
        const requiresCiamSignup = localStorage.getItem("requiresCiamSignup") === "1";
        if (requiresCiamSignup) {
            console.warn("CIAM signup not completed yet. Redirecting to login.");
            window.location.href = "/login.html?ciamRequired=1";
            return;
        }

        userId = localStorage.getItem("userId") || localStorage.getItem("user-id") || "";
        if (!userId) {
            if (isPublicPage()) {
                console.log("No user logged in on public page. Skipping login redirect.");
                return;
            }

            console.warn("No user logged in on protected page. Redirecting to login...");
            window.location.href = "/login.html";
            return;
        }

        console.log("Using local session userId:", userId);
        userStatus = await checkUserStatus(userId);
    }

    const preferredFromStatus = normalizePreferredPlanType(userStatus?.preferredPlanType);
    if (preferredFromStatus) {
        localStorage.setItem("preferredPlanType", preferredFromStatus);
    }
    const abonnementBtn = document.getElementById("abonnementBtn");
    if (abonnementBtn) {
        const isActive = Boolean(userStatus && userStatus.isActive);
        applySubscriptionButtonState(abonnementBtn, isActive);
        console.log("abonnementBtn state updated. isActive:", isActive);
    } else {
        console.error("abonnementBtn not found on the page.");
    }
}

async function checkUserStatus(userId) {
    console.log("Checking subscription status for user:", userId);

    console.log("Sending API request to getUserStatus with headers:", {
        'user-id': userId
    });

    const response = await fetch('https://sengfam2-gvfpf5hndacgbfcc.westeurope-01.azurewebsites.net/getUserStatus', {
        method: 'GET',
        headers: { 'user-id': userId },
    });

    console.log("API response status:", response.status);
    const rawText = await response.text();
    console.log("Raw response text:", rawText);

    try {
        const data = JSON.parse(rawText);
        console.log("Parsed JSON response:", data);
        if (data.isActive) {
            console.log("isActive is true. Updating UI.");
        } else {
            console.log("isActive is false or undefined.");
        }
        return data;
    } catch (error) {
        console.error("Error parsing JSON response:", error);
        return null;
    }
}

// Debugging: Verify upgrade button existence and event listener attachment
const abonnementBtn = document.getElementById("abonnementBtn");
if (abonnementBtn) {
    console.log("abonnementBtn found. Adding dynamic click event listener.");
    abonnementBtn.onclick = async () => {
        console.log("abonnementBtn clicked.");
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length === 0) {
            console.error("No accounts found. User is not logged in.");
            alert("Je moet ingelogd zijn om een abonnement te beheren.");
            return;
        }

        const account = accounts[0];
        const rawUserId = account.homeAccountId || account.localAccountId || account.username || "";
        const userId = normalizeUserId(rawUserId);
        if (!userId) {
            console.error("No valid userId found in account.");
            alert("Je moet ingelogd zijn om een abonnement te beheren.");
            return;
        }

        console.log("Sanitized UserId:", userId);

        console.log("Current abonnementBtn textContent:", abonnementBtn.textContent);
        const buttonLabel = abonnementBtn.textContent.trim();
        if (buttonLabel === "Upgrade naar onbeperkt" || buttonLabel === "Upgrade") {
            console.log("Preparing to call startStripeCheckout for user:", userId);
            const selectedPlanType = await ensurePreferredPlanTypeSelection(true);
            localStorage.setItem("preferredPlanType", selectedPlanType);
            startStripeCheckout(userId, selectedPlanType);
        } else if (buttonLabel === "Abonnement beheren" || buttonLabel === "Onbeperkte toegang") {
            const shouldCancel = await showSubscriptionManageModal();
            if (!shouldCancel) {
                return;
            }

            console.log("Cancelling subscription for user:", userId);
            try {
                console.log("Sending cancelSubscription API request...");
                const response = await fetch("https://sengfam2-gvfpf5hndacgbfcc.westeurope-01.azurewebsites.net/cancelSubscription?code=REDACTED_FUNCTION_KEY==", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "user-id": userId
                    }
                });

                console.log("API Response Status:", response.status);
                const responseText = await response.text();
                console.log("API Response Text:", responseText);

                if (response.ok) {
                    console.log("Subscription cancelled successfully.");
                    alert("Je abonnement is succesvol opgezegd.");
                    abonnementBtn.textContent = "Upgrade naar onbeperkt";
                    abonnementBtn.style.background = "#ef4444"; // Red for upgrade
                    window.location.href = "/abonnement-cancel.html";
                } else {
                    console.error("Failed to cancel subscription. Status:", response.status);
                    alert("Fout bij het opzeggen van je abonnement.");
                }
            } catch (error) {
                console.error("Error cancelling subscription:", error);
                alert("Er ging iets mis bij het opzeggen van je abonnement.");
            }
        }
    };
} else {
    console.error("abonnementBtn not found on the page.");
}

// Voeg de URL van de createUser-functie toe
const createUserUrl = "https://sengfam2-gvfpf5hndacgbfcc.westeurope-01.azurewebsites.net/createUser";

async function registerUser(userId, email, name) {
    if (!userId) {
        console.error("registerUser called without userId");
        return;
    }

    let safeEmail = (email || "").trim();
    const safeName = (name || "").trim() || "Unknown";
    const storedPreferred = (localStorage.getItem("preferredPlanType") || "").toLowerCase();
    const preferredPlanType = storedPreferred === "enterprise" ? "enterprise" : (storedPreferred === "particulier" ? "particulier" : null);

    // If no email from MSAL claims, ask user directly
    if (!safeEmail || safeEmail.includes("@unknown.local")) {
        console.log("Email not found in claims, asking user to enter email address...");
        safeEmail = await showEmailInputModal();
        
        if (!safeEmail) {
            console.log("User cancelled email input modal");
            return;
        }
    }

    const finalEmail = safeEmail;

    try {
        // Try to get access token to send with registration
        let authorizationHeader = "";
        try {
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length > 0) {
                const account = accounts[0];
                const tokenRequest = {
                    scopes: ["https://graph.microsoft.com/.default"],
                    account: account,
                    forceRefresh: false
                };
                const response = await msalInstance.acquireTokenSilent(tokenRequest);
                authorizationHeader = `Bearer ${response.accessToken}`;
                console.log("Access token acquired for createUser request");
            }
        } catch (tokenError) {
            console.warn("Could not acquire token for createUser:", tokenError.message);
            // Continue without token
        }

        const headers = {
            "Content-Type": "application/json",
            "user-id": userId
        };
        
        if (authorizationHeader) {
            headers["authorization"] = authorizationHeader;
        }

        const response = await fetch(createUserUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ userId, email: finalEmail, name: safeName, preferredPlanType, ciamLinked: true, loginMethod: "password" }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log("User registration result:", result);
        } else {
            const errorText = await response.text();
            console.error("Failed to register user. Status:", response.status, "Body:", errorText);
        }
    } catch (error) {
        console.error("Error registering user:", error);
    }
}

// Voeg een functie toe om bestaande gebruikers te registreren
async function registerExistingUsers(users) {
    for (const user of users) {
        const { userId, email, name } = user;
        console.log(`Registering user: ${userId}`);
        await registerUser(userId, email, name);
    }
}

// Voorbeeldgebruik verwijderd om onnodige API-calls tijdens pagina-load te voorkomen

// Ensure startStripeCheckout remains defined and accessible for home.html
async function startStripeCheckout(userId, planType = "particulier") {
    const normalizedPlanType = (planType || "particulier").toLowerCase() === "enterprise"
        ? "enterprise"
        : "particulier";

    console.log("startStripeCheckout called with userId:", userId, "planType:", normalizedPlanType);
    console.log("Preparing to send createCheckout API request...");

    try {
        const functionKey = "jwV7NqKLnbpD0kagadk2tuBl4UIV_OCJtCSaHehV9smYAzFulku5Eg=="; // Replace with a secure method
        const response = await fetch("https://sengfam2-gvfpf5hndacgbfcc.westeurope-01.azurewebsites.net/createCheckout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${functionKey}`
            },
            body: JSON.stringify({ userId, planType: normalizedPlanType })
        });

        console.log("createCheckout API Response Status:", response.status);
        const responseText = await response.text();
        console.log("createCheckout API Response Text:", responseText);

        if (response.ok) {
            try {
                const { id } = JSON.parse(responseText);
                if (!id) {
                    throw new Error("Missing session ID in API response.");
                }

                const stripePublicKey = "pk_test_51SweYKQLay46C9bGO1fnol6hioP6nFku2OQmseFh2TTVFtLMJhzrvKuk3kwJ2PlEqzOH23CIWAx6tStYUphOuO6o00VazuHLPR";
                const stripe = Stripe(stripePublicKey);

                if (!stripe) {
                    throw new Error("Failed to initialize Stripe. Check the publishable key.");
                }

                console.log("Redirecting to Stripe Checkout with session ID:", id);
                const result = await stripe.redirectToCheckout({ sessionId: id });
                if (result.error) {
                    console.error("Stripe redirection error:", result.error.message);
                    alert("Er ging iets mis bij het starten van de checkout.");
                }
            } catch (parseError) {
                console.error("Error parsing API response JSON:", parseError);
                alert("Fout bij het verwerken van de API-reactie.");
            }
        } else {
            console.error("Failed to create checkout session. Status:", response.status);
            alert("Fout bij het aanmaken van een checkout sessie.");
        }
    } catch (error) {
        console.error("Error in startStripeCheckout:", error);
        alert("Er ging iets mis bij het starten van de checkout.");
    }
    console.log("startStripeCheckout execution completed.");
}

export { msalInstance };

// Voeg een functie toe om de status "Onbeperkt" te tonen na terugkomst van Stripe
function updateSubscriptionStatus() {
    const statusField = document.getElementById("subscriptionStatus");
    if (statusField) {
        statusField.textContent = "Onbeperkt";
        statusField.style.color = "#22c55e"; // Groene kleur voor status
    }
}

// Controleer of de gebruiker terugkomt van Stripe
if (window.location.search.includes("stripeSuccess=true")) {
    // Update de status en navigeer naar home.html
    updateSubscriptionStatus();

    // Controleer of de sessie geldig is
    const userId = localStorage.getItem("userId");
    if (userId) {
        console.log("Sessie actief voor gebruiker:", userId);
        window.location.href = "/home.html";
    } else {
        console.error("Geen actieve sessie gevonden. Gebruiker moet opnieuw inloggen.");
        window.location.href = "/login.html";
    }
}

// Expose for non-module scripts (e.g., inline handlers in home.html)
window.startStripeCheckout = startStripeCheckout;