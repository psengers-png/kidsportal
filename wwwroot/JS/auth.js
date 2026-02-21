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

async function startLoginRedirectWithNotice(message) {
    if (loginRedirectStarted) {
        return;
    }

    loginRedirectStarted = true;
    const confirmed = await showCenteredLoginNotice(message || "Je moet eerst inloggen om deze functie te gebruiken.");
    if (!confirmed) {
        loginRedirectStarted = false;
        if (!isPublicPage()) {
            window.location.href = "/home.html";
        }
        return;
    }
    msalInstance.loginRedirect();
}

window.startLoginRedirectWithNotice = startLoginRedirectWithNotice;

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

// ---------------- REDIRECT HANDLING ---------------------
msalInstance.initialize().then(() => {
    console.log("MSAL initialized.");
    msalInstance.handleRedirectPromise()
        .then(response => {
            console.log("Redirect response:", response);
            if (response) {
                console.log("Redirect successful. Account added:", msalInstance.getAllAccounts());
            }
            updateUI();
        })
        .catch(error => {
            console.error("Redirect error:", error);
            updateUI();
        });
});

// Debugging: Log accounts on every page load
console.log("Accounts on page load:", msalInstance.getAllAccounts());

// Debugging: Ensure updateUI is called on every page load
window.onload = () => {
    console.log("Page loaded. Calling updateUI.");
    updateUI();
};

// ---------------- UI LOGICA ---------------------
async function updateUI() {
    console.log("updateUI aangeroepen");

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
    const rawUserId = account.homeAccountId || account.localAccountId || account.username || "";
    const userId = normalizeUserId(rawUserId);
    localStorage.setItem("userId", userId);
    localStorage.setItem("user-id", userId);
    console.log("User ID saved to localStorage:", userId);

    const email = account.username || account.idTokenClaims?.email || account.idTokenClaims?.preferred_username || "";
    const name = account.name || account.idTokenClaims?.name || email || "Unknown";
    if (userId) {
        await registerUser(userId, email, name);
    }

    let userStatus = await checkUserStatus(userId);
    if (userStatus && userStatus.error === "User not found" && userId) {
        await registerUser(userId, email, name);
        userStatus = await checkUserStatus(userId);
    }
    if (userStatus && userStatus.isActive) { // Corrected property name
        console.log("User has unlimited access.");
        console.log("Attempting to update abonnementBtn. isActive:", userStatus.isActive);
        const abonnementBtn = document.getElementById("abonnementBtn");
        if (abonnementBtn) {
            console.log("abonnementBtn found. Updating text and style.");
            abonnementBtn.textContent = "Onbeperkte toegang";
            abonnementBtn.style.background = "#22c55e"; // Green for unlimited
        } else {
            console.error("abonnementBtn not found on the page.");
        }
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
        if (abonnementBtn.textContent.trim() === "Upgrade naar onbeperkt") {
            console.log("Preparing to call startStripeCheckout for user:", userId);
            startStripeCheckout(userId);
        } else if (abonnementBtn.textContent.trim() === "Onbeperkte toegang") {
            console.log("Cancelling subscription for user:", userId);
            try {
                console.log("Sending cancelSubscription API request...");
                const response = await fetch("https://sengfam2-gvfpf5hndacgbfcc.westeurope-01.azurewebsites.net/cancelSubscription?code=xHxQtcLBynLbEZlkWbVM5Nbg6VFGxwIdJIT9K8vGg31SAzFumpa0Cw==", {
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

// Ensure logout button has a proper event listener
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    console.log("Logout button found. Adding click event listener.");
    logoutBtn.onclick = () => {
        console.log("Logout button clicked. Logging out user.");
        msalInstance.logout();
    };
} else {
    console.error("Logout button not found on the page.");
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

    try {
        const response = await fetch(createUserUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "user-id": userId
            },
            body: JSON.stringify({ userId, email: safeEmail, name: safeName }),
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

// Voorbeeldgebruik: lijst met bestaande gebruikers
const existingUsers = [
    { userId: "c5f50565-94e5-46d4-9bbe-70483f2ffb6b", email: "user1@example.com", name: "User One" },
    
];

// Roep de functie aan om bestaande gebruikers te registreren
registerExistingUsers(existingUsers);

// Fake change to trigger a push

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