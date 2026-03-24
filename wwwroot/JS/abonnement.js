// abonnement.js
// Handles Stripe integration for subscription upgrades

function getStripePublicKeyForSession(sessionId) {
    const configuredKey = (window.STRIPE_PUBLISHABLE_KEY || '').trim();
    const configuredLiveKey = (window.STRIPE_PUBLISHABLE_KEY_LIVE || '').trim();
    const isLiveSession = typeof sessionId === 'string' && sessionId.startsWith('cs_live_');
    const stripePublicKey = configuredLiveKey || configuredKey;

    if (!stripePublicKey) {
        throw new Error('Stripe publishable live key ontbreekt in de frontend-configuratie. Zet window.STRIPE_PUBLISHABLE_KEY_LIVE of window.STRIPE_PUBLISHABLE_KEY.');
    }

    if (stripePublicKey.startsWith('pk_test_')) {
        throw new Error('Frontend gebruikt nog een test Stripe publishable key (pk_test), terwijl alleen Stripe live gebruikt mag worden.');
    }

    if (!isLiveSession) {
        throw new Error('Er is geen Stripe live checkout sessie ontvangen. Controleer of de backend met live Stripe is verbonden.');
    }

    return stripePublicKey;
}

function startStripeCheckout(userId, planType = 'particulier') {
    const pt = (planType || 'particulier').toLowerCase();
    const normalizedPlanType = pt === 'enterprise' ? 'enterprise'
        : pt === 'jaarlijks' ? 'jaarlijks'
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
    .then(async res => {
        const rawText = await res.text();
        if (!res.ok) {
            throw new Error(rawText || `HTTP error! status: ${res.status}`);
        }

        try {
            return JSON.parse(rawText);
        } catch (error) {
            throw new Error('Ongeldige response van checkout-service.');
        }
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
        const errorMessage = err?.message || 'Er ging iets mis bij het starten van de checkout.';
        console.error("Error in startStripeCheckout:", errorMessage, err);
        alert('Error with Stripe: ' + errorMessage);
    });
}

window.startStripeCheckout = startStripeCheckout;

export { startStripeCheckout };