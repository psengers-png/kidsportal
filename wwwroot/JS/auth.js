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
            if (response && window.location.pathname === "/home.html") {
                window.location.href = "/home.html";
            }
        })
        .finally(updateUI);
});


// ---------------- UI LOGICA ---------------------
function updateUI() {

    // HTML-elementen ophalen
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const statusText = document.getElementById("statusText");

    const accounts = msalInstance.getAllAccounts();

    // Niet ingelogd
    if (accounts.length === 0) {
        if (window.location.pathname !== "/home.html") {
            window.location.href = "/home.html";
            return;
        }

        if (loginBtn) loginBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
        if (statusText) statusText.textContent = "Log in om verder te gaan.";

        return;
    }

    // Wel ingelogd
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";
    if (statusText) statusText.textContent = `Welkom, ${accounts[0].username}`;

    // Logout correct koppelen
    if (logoutBtn) {
        logoutBtn.onclick = () => msalInstance.logoutRedirect();
    }
}