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
        .then((response) => {
            if (response) {
                console.log("Login succesvol:", response);
            }
        })
        .catch(err => console.error("Redirect error:", err))
        .finally(updateUI);
});


// ---------------- UI & BUTTON LOGIC ---------------------

function updateUI() {
    const accounts = msalInstance.getAllAccounts();

    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const tileContainer = document.getElementById("tileContainer");
    const statusText = document.getElementById("statusText");

    if (accounts.length > 0) {
        statusText.textContent = `Welkom, ${accounts[0].username}`;
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        tileContainer.style.display = "flex";
    } else {
        statusText.textContent = "Log in om toegang te krijgen tot de portal.";
        loginBtn.style.display = "inline-block";
        logoutBtn.style.display = "none";
        tileContainer.style.display = "none";
    }

    loginBtn.onclick = () => msalInstance.loginRedirect();
    logoutBtn.onclick = () => msalInstance.logoutRedirect();
}