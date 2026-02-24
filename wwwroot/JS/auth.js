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
        hint.textContent = "Na opzeggen blijft je toegang actief tot het einde van je huidige factuurperiode.";
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
        await msalInstance.loginRedirect();
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
    const candidates = [
        claims.email,
        claims.preferred_username,
        Array.isArray(claims.emails) ? claims.emails[0] : null,
        claims.signInNames?.emailAddress,
        claims.signInName,
        account?.username
    ];

    for (const candidate of candidates) {
        if (isLikelyEmail(candidate)) {
            return candidate.trim();
        }
    }

    return "";
}

async function ensurePreferredPlanTypeSelection() {
    const existing = normalizePreferredPlanType(localStorage.getItem("preferredPlanType"));
    if (existing) {
        return existing;
    }

    const selected = await showPlanTypeSelectionModal();
    localStorage.setItem("preferredPlanType", selected);
    return selected;
}

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
    await msalReadyPromise;

    const accounts = msalInstance.getAllAccounts();
    console.log("Accounts gevonden door msalInstance:", accounts);
    if (accounts.length === 0) {
        localStorage.removeItem("userId");
        localStorage.removeItem("user-id");

        if (isPublicPage()) {
            console.log("No user logged in on public page. Skipping login redirect.");
            return;
        }

        console.warn("No user logged in on protected page. Redirecting to login...");
        startLoginRedirectWithNotice("Je moet eerst inloggen om deze functie te gebruiken. Je wordt nu doorgestuurd naar de inlogpagina.");
        return;
    }

    const account = accounts[0];
    const preferredFromQuery = normalizePreferredPlanType(getPreferredPlanTypeFromQuery());
    if (preferredFromQuery) {
        localStorage.setItem("preferredPlanType", preferredFromQuery);
    }

    const rawUserId = account.homeAccountId || account.localAccountId || account.username || "";
    const userId = normalizeUserId(rawUserId);
    localStorage.setItem("userId", userId);
    localStorage.setItem("user-id", userId);
    console.log("User ID saved to localStorage:", userId);

    const email = resolveAccountEmail(account);
    const name = account.name || account.idTokenClaims?.name || email || "Unknown";
    await ensurePreferredPlanTypeSelection();
    if (userId) {
        await registerUser(userId, email, name);
    }

    let userStatus = await checkUserStatus(userId);
    if (userStatus && userStatus.error === "User not found" && userId) {
        await registerUser(userId, email, name);
        userStatus = await checkUserStatus(userId);
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
            startStripeCheckout(userId);
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

    const safeEmail = (email || "").trim() || `${userId}@unknown.local`;
    const safeName = (name || "").trim() || "Unknown";
    const storedPreferred = (localStorage.getItem("preferredPlanType") || "").toLowerCase();
    const preferredPlanType = storedPreferred === "enterprise" ? "enterprise" : (storedPreferred === "particulier" ? "particulier" : null);

    try {
        const response = await fetch(createUserUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "user-id": userId
            },
            body: JSON.stringify({ userId, email: safeEmail, name: safeName, preferredPlanType }),
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
async function startStripeCheckout(userId) {
    console.log("startStripeCheckout called with userId:", userId);
    console.log("Preparing to send createCheckout API request...");

    try {
        const functionKey = "jwV7NqKLnbpD0kagadk2tuBl4UIV_OCJtCSaHehV9smYAzFulku5Eg=="; // Replace with a secure method
        const response = await fetch("https://sengfam2-gvfpf5hndacgbfcc.westeurope-01.azurewebsites.net/createCheckout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${functionKey}`
            },
            body: JSON.stringify({ userId })
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