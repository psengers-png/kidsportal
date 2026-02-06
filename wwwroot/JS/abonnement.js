// abonnement.js
// Handles Stripe integration for subscription upgrades

function startStripeCheckout(userId) {
    console.log("Starting Stripe checkout for user:", userId);
    console.log("User ID passed to Stripe checkout:", userId); // Debugging log

    // Hardcoded FUNCTION_APP_KEY for debugging purposes
    const functionAppKey = "jwV7NqKLnbpD0kagadk2tuBl4UIV_OCJtCSaHehV9smYAzFulku5Eg=="; // Replace with the actual key

    fetch('https://sengfam2-gvfpf5hndacgbfcc.westeurope-01.azurewebsites.net/createCheckout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${functionAppKey}` // Replace FUNCTION_APP_KEY with the actual key securely injected during deployment
        },
        body: JSON.stringify({ userId })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then(data => {
        if (!data.id) throw new Error('Stripe session not created');
        const stripe = Stripe('pk_test_51SweYKQLay46C9bGO1fnol6hioP6nFku2OQmseFh2TTVFtLMJhzrvKuk3kwJ2PlEqzOH23CIWAx6tStYUphOuO6o00VazuHLPR');
        stripe.redirectToCheckout({ sessionId: data.id });
    })
    .catch(err => {
        alert('Error with Stripe: ' + err.message);
    });
}

export { startStripeCheckout };