// abonnement.js
// Handles Stripe integration for subscription upgrades

function getStripePublicKeyForSession(sessionId) {
    const configuredKey = (window.STRIPE_PUBLISHABLE_KEY || '').trim();
    const fallbackTestKey = 'pk_test_51SweYKQLay46C9bGO1fnol6hioP6nFku2OQmseFh2TTVFtLMJhzrvKuk3kwJ2PlEqzOH23CIWAx6tStYUphOuO6o00VazuHLPR';
    const stripePublicKey = configuredKey || fallbackTestKey;

    if (!stripePublicKey) {
        throw new Error('Stripe publishable key ontbreekt in de frontend-configuratie.');
    }

    if (typeof sessionId === 'string' && sessionId.startsWith('cs_live_') && stripePublicKey.startsWith('pk_test_')) {
        throw new Error('Live checkout sessie ontvangen, maar frontend gebruikt nog een test Stripe publishable key (pk_test).');
    }

    return stripePublicKey;
}

function startStripeCheckout(userId, planType = 'particulier') {
    const normalizedPlanType = (planType || 'particulier').toLowerCase() === 'enterprise'
        ? 'enterprise'
        : 'particulier';

    console.log("Starting Stripe checkout for user:", userId, "planType:", normalizedPlanType);

    const functionAppKey = "jwV7NqKLnbpD0kagadk2tuBl4UIV_OCJtCSaHehV9smYAzFulku5Eg=="; // Replace with a secure method

    fetch('https://sengfam2-gvfpf5hndacgbfcc.westeurope-01.azurewebsites.net/createCheckout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${functionAppKey}`
        },
        body: JSON.stringify({ userId, planType: normalizedPlanType })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        console.log("Stripe session data received:", data);
        if (!data || (!data.id && !data.url)) throw new Error('Stripe session not created');

        if (data.url) {
            console.log("Redirecting to Stripe Checkout with session URL:", data.url);
            window.location.assign(data.url);
            return;
        }

        const stripePublicKey = getStripePublicKeyForSession(data.id);
        const stripe = Stripe(stripePublicKey);

        if (!stripe) {
            throw new Error('Failed to initialize Stripe. Check the publishable key.');
        }

        console.log("Redirecting to Stripe Checkout with session ID:", data.id);
        stripe.redirectToCheckout({ sessionId: data.id })
            .then(result => {
                if (result && result.error) {
                    console.error("Stripe redirection error:", result.error.message);
                    alert("Er ging iets mis bij het starten van de checkout.");
                }
            });
    })
    .catch(err => {
        console.error("Error in startStripeCheckout:", err);
        alert('Error with Stripe: ' + err.message);
    });
}

window.startStripeCheckout = startStripeCheckout;

export { startStripeCheckout };