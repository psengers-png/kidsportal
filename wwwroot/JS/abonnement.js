// abonnement.js
// Handles Stripe integration for subscription upgrades

function startStripeCheckout(userId) {
    console.log("Starting Stripe checkout for user:", userId);

    const functionAppKey = "jwV7NqKLnbpD0kagadk2tuBl4UIV_OCJtCSaHehV9smYAzFulku5Eg=="; // Replace with a secure method

    fetch('https://sengfam2-gvfpf5hndacgbfcc.westeurope-01.azurewebsites.net/createCheckout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${functionAppKey}`
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
        console.log("Stripe session data received:", data);
        if (!data.id) throw new Error('Stripe session not created');

        // Fetch the public key dynamically
        const stripePublicKey = 'pk_test_51SweYKQLay46C9bGO1fnol6hioP6nFku2OQmseFh2TTVFtLMJhzrvKuk3kwJ2PlEqzOH23CIWAx6tStYUphOuO6o00VazuHLPR'; // Replace with dynamic injection if possible
        const stripe = Stripe(stripePublicKey);

        if (!stripe) {
            throw new Error('Failed to initialize Stripe. Check the publishable key.');
        }

        console.log("Redirecting to Stripe Checkout with session ID:", data.id);
        stripe.redirectToCheckout({ sessionId: data.id })
            .then(result => {
                if (result.error) {
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

export { startStripeCheckout };