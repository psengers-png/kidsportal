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
    msalInstance.handleRedirectPromise()
        .then(response => {
            console.log("Redirect response:", response);
            updateUI();
        })
        .catch(error => {
            console.error("Redirect error:", error);
            updateUI();
        });
});

// ---------------- UI LOGICA ---------------------
function updateUI() {
    console.log("updateUI aangeroepen");

    // HTML-elementen ophalen
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const statusText = document.getElementById("statusText");
    const loginScreen = document.getElementById("loginScreen");
    const optionsScreen = document.getElementById("optionsScreen");
    const welcomeText = document.getElementById("welcomeText");

    const accounts = msalInstance.getAllAccounts();
    console.log("Accounts:", accounts);

    // Debugging: Check if the user is logged in
    console.log("Checking login status...");
    console.log("Accounts found:", accounts);

    if (accounts.length === 0) {
        console.warn("No user logged in. Redirecting to login...");
        alert("Je bent niet ingelogd. Log in om verder te gaan.");
        msalInstance.loginRedirect();
        return;
    }

    // Niet ingelogd
    if (accounts.length === 0) {
        console.log("Gebruiker niet ingelogd");
        if (loginScreen) loginScreen.style.display = "block";
        if (optionsScreen) optionsScreen.style.display = "none";
        if (statusText) statusText.textContent = "Log in om verder te gaan.";

        // Login knop event-listener koppelen
        if (loginBtn) {
            loginBtn.onclick = () => {
                console.log("Login knop geklikt");
                msalInstance.loginRedirect();
            };
        }
        return;
    }

    // Wel ingelogd
    console.log("Gebruiker ingelogd als:", accounts[0].username);
    if (loginScreen) loginScreen.style.display = "none";
    if (optionsScreen) optionsScreen.style.display = "block";
    if (welcomeText) welcomeText.textContent = `Welkom, ${accounts[0].username}!`;

    // Logout knop event-listener koppelen
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            console.log("Logout knop geklikt");
            msalInstance.logoutRedirect();
        };
    }

        // Debugging: Log accounts and username
        console.log("Accounts:", accounts);
        if (accounts.length === 0 || !accounts[0].username) {
            console.error("No user logged in or username is undefined.");
            alert("Je moet ingelogd zijn om een abonnement te controleren.");
            return;
        }

        const username = accounts[0].username;
        console.log("Username:", username);

        // Debugging: Log the username before making the API call
        console.log("Preparing to check subscription for user:", username);

        // Upgrade knop event-listener koppelen (alleen als ingelogd)
        const upgradeBtn = document.getElementById("abonnementBtn");
        if (upgradeBtn) {
            upgradeBtn.onclick = async () => {
                // Check subscription status before proceeding
                try {
                    const response = await fetch(`https://sengfam1.azurewebsites.net/checkSubscription?user=${username}`);
                    if (response.ok) {
                        const data = await response.json();
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
        }
}

// Fake change to trigger a push