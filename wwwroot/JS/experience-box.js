const EXPERIENCE_API_BASE_URL = 'https://sengfam2-gvfpf5hndacgbfcc.westeurope-01.azurewebsites.net';

function resolveAccountId() {
    return (
        localStorage.getItem('userId')
        || localStorage.getItem('ciamUserId')
        || ''
    ).trim();
}

async function startExperienceBoxCheckout(sourcePage, email) {
    const payload = {
        sourcePage: (sourcePage || 'unknown').toString(),
        email: (email || '').toString().trim().toLowerCase(),
        quantity: 1
    };

    const response = await fetch(`${EXPERIENCE_API_BASE_URL}/createBoxCheckout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.error || `Checkout starten mislukt (${response.status}).`);
    }

    if (data.url) {
        window.location.assign(data.url);
        return;
    }

    throw new Error('Geen checkout URL ontvangen van de server.');
}

async function redeemExperienceCode(activationCode) {
    const accountId = resolveAccountId();
    if (!accountId) {
        throw new Error('Geen account-id gevonden. Log eerst in.');
    }

    const response = await fetch(`${EXPERIENCE_API_BASE_URL}/redeemActivationCode`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'user-id': accountId
        },
        body: JSON.stringify({
            activationCode,
            userId: accountId
        })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.error || 'Activatie mislukt.');
    }

    return data;
}

async function fetchExperienceStatus() {
    const accountId = resolveAccountId();
    if (!accountId) {
        return { activated: false, creditsBalance: 0, missingAccount: true };
    }

    const response = await fetch(`${EXPERIENCE_API_BASE_URL}/getExperienceStatus`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'user-id': accountId
        }
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data?.error || 'Status ophalen mislukt.');
    }

    return data;
}

window.startExperienceBoxCheckout = startExperienceBoxCheckout;
window.redeemExperienceCode = redeemExperienceCode;
window.fetchExperienceStatus = fetchExperienceStatus;
