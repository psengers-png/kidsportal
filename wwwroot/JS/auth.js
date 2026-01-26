
const msalConfig = {
    auth: {
        clientId: "efbb020d-f5a4-40c9-bb46-6e905953d2aa",
        authority: "https://kidsportal.ciamlogin.com/898919b0-789c-4ce6-959d-cc06e11bf15a",
        redirectUri: window.location.origin + "/home.html",
        knownAuthorities: ["kidsportal.ciamlogin.com"]
    },
    cache: { cacheLocation: "localStorage" }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);


document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const tileContainer = document.getElementById("tileContainer");
    const statusText = document.getElementById("statusText");

    // rest van je code hier
});


msalInstance.initialize().then(() => {
    msalInstance.handleRedirectPromise().then((response) => {
        if (response) {
            console.log("Login succesvol:", response);
            window.location.href = "/index.html"; // Automatisch naar startscherm
        } else {
            updateUI();
        }
    }).catch(err => console.error("Redirect error:", err));
});


    function updateUI() {
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
            if (statusText) statusText.textContent = `Welkom, ${accounts[0].username}`;
            if (loginBtn) loginBtn.style.display = "none";
            if (logoutBtn) logoutBtn.style.display = "inline-block";
        } else {
            if (statusText) statusText.textContent = "Log in om toegang te krijgen tot de portal.";
            if (loginBtn) loginBtn.style.display = "inline-block";
            if (logoutBtn) logoutBtn.style.display = "none";
        }
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            msalInstance.loginRedirect({ scopes: ["openid"] });
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            msalInstance.logoutRedirect();
        });
    }


