
const msalConfig = {
    auth: {
        clientId: "29dc0ff8-8b79-4291-b3bd-037f5f33c82f",
        authority: "https://kidsportal2.ciamlogin.com/4abbf94b-738e-4740-b4e7-e167dcc756ac",
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


