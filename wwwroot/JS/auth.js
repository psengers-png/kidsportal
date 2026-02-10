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
        console.warn("No user logged in. Redirecting to login...");
        msalInstance.loginRedirect();
        return;
    }

    const userId = accounts[0].username || accounts[0].localAccountId || accounts[0].homeAccountId || "";
    localStorage.setItem("userId", userId);
    console.log("User ID saved to localStorage:", userId);

    const userStatus = await checkUserStatus(userId);
    if (userStatus && userStatus.isActive) { // Corrected property name
        console.log("User has unlimited access.");
        console.log("Attempting to update abonnementBtn. isActive:", userStatus.isActive);
        const abonnementBtn = document.getElementById("abonnementBtn");
        if (abonnementBtn) {
            console.log("abonnementBtn found. Updating text and style.");
            abonnementBtn.textContent = "Onbeperkte toegang";
            abonnementBtn.style.background = "#ef4444"; // Red for cancel
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
const upgradeBtn = document.getElementById("abonnementBtn");
if (upgradeBtn) {
    console.log("Upgrade button found. Adding dynamic click event listener.");
    upgradeBtn.onclick = async () => {
        console.log("abonnementBtn clicked.");
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length === 0) {
            console.error("No accounts found. User is not logged in.");
            alert("Je moet ingelogd zijn om een abonnement te beheren.");
            return;
        }

        const account = accounts[0];
        const userId = account.homeAccountId || "";
        if (!userId) {
            console.error("No valid userId found in account.");
            alert("Je moet ingelogd zijn om een abonnement te beheren.");
            return;
        }

        console.log("UserId found:", userId);

        if (upgradeBtn.textContent === "Upgrade naar onbeperkt") {
            console.log("Starting subscription process for user:", userId);
            const sanitizedUserId = userId.split('.')[0];
            startStripeCheckout(sanitizedUserId);
        } else if (upgradeBtn.textContent === "Onbeperkte toegang") {
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
                    upgradeBtn.textContent = "Upgrade naar onbeperkt";
                    upgradeBtn.style.background = "#10b981"; // Green for upgrade
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
    try {
        const response = await fetch(createUserUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "user-id": userId
            },
            body: JSON.stringify({ userId, email, name }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log("User registration result:", result);
        } else {
            console.error("Failed to register user. Status:", response.status);
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
    try {
        const response = await fetch("https://sengfam2-gvfpf5hndacgbfcc.westeurope-01.azurewebsites.net/createCheckout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "user-id": userId
            }
        });

        console.log("createCheckout API Response Status:", response.status);
        const responseText = await response.text();
        console.log("createCheckout API Response Text:", responseText);

        if (response.ok) {
            const data = JSON.parse(responseText);
            console.log("Redirecting to Stripe checkout URL:", data.url);
            window.location.href = data.url;
        } else {
            console.error("Failed to create checkout session. Status:", response.status);
            alert("Fout bij het starten van de checkout: " + response.status);
        }
    } catch (error) {
        console.error("Error in startStripeCheckout:", error);
        alert("Er ging iets mis bij het starten van de checkout.");
    }
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