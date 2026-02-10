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
        const abonnementBtn = document.getElementById("abonnementBtn");
        if (abonnementBtn) {
            abonnementBtn.textContent = "Onbeperkte toegang";
            abonnementBtn.style.background = "#ef4444"; // Red for cancel
        } else {
            console.error("Subscription button not found on the page.");
        }
    }
}

async function checkUserStatus(userId) {
    console.log("Checking subscription status for user:", userId);

    try {
        const response = await fetch('https://sengfam2-gvfpf5hndacgbfcc.westeurope-01.azurewebsites.net/getUserStatus', {
            method: 'GET',
            headers: { 'user-id': userId },
        });

        if (!response.ok) {
            console.error("Failed to fetch user status. Status:", response.status);
            return null;
        }

        const data = await response.json();
        console.log("User subscription status:", data);
        return data;
    } catch (error) {
        console.error("Error fetching user status:", error);
        return null;
    }
}

// Debugging: Verify upgrade button existence and event listener attachment
const upgradeBtn = document.getElementById("abonnementBtn");
if (upgradeBtn) {
    console.log("Upgrade button found. Adding click event listener.");
    upgradeBtn.onclick = async () => {
        console.log("Upgrade button clicked.");
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length === 0 || !accounts[0].username) {
            console.error("No user logged in or username is undefined.");
            alert("Je moet ingelogd zijn om een abonnement te controleren.");
            return;
        }

        const username = accounts[0].username || accounts[0].preferred_username || "";
        console.log("Upgrade button clicked. Username:", userId);

        try {
            console.log(`Calling API with username: ${userId}`);
            const response = await fetch("https://sengfam1.azurewebsites.net/checkSubscription", {
                method: "GET",
                headers: {
                    "user-id": userId
                }
            });
            console.log("API Response Status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("API Response Data:", data);

                if (data.hasSubscription) {
                    alert("Je hebt al een abonnement!");
                } else {
                    startStripeCheckout(username);
                }
            } else {
                alert("Fout bij het controleren van abonnement: " + response.status);
            }
        } catch (error) {
            console.error("Error checking subscription status:", error);
            alert("Er ging iets mis bij het controleren van je abonnement.");
        }
    };
} else {
    console.error("Upgrade button not found on the page.");
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

import { startStripeCheckout } from './abonnement.js';

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