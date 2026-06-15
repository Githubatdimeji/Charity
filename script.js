document.addEventListener('DOMContentLoaded', () => {
    const amtButtons = document.querySelectorAll('.amt-btn');
    const customInput = document.getElementById('custom-amount');
    const donationForm = document.getElementById('donation-form');

    // Handle Quick-Select Donation Buttons
    amtButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active status style from all selection choices
            amtButtons.forEach(btn => btn.classList.remove('active'));
            
            // Apply active class to current targeted option
            button.classList.add('active');
            
            // Sync target numeric values directly into value tracking input
            const amount = button.getAttribute('data-amount');
            customInput.value = amount;
        });
    });

    // Clear background highlights on helper buttons if user enters a custom numeric amount
    customInput.addEventListener('input', () => {
        amtButtons.forEach(btn => btn.classList.remove('active'));
    });

    // Process secure token handoff logic to backend Python pipeline
    donationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const finalAmount = parseFloat(customInput.value);
        
        if (isNaN(finalAmount) || finalAmount <= 0) {
            alert('Please enter a valid donation amount.');
            return;
        }

        try {
            // Forward payload securely to internal endpoints
            const response = await fetch('http://127.0.0.1:5000/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: finalAmount }),
            });

            const session = await response.json();

            if (session.url) {
                // Instantly hand off user lifecycle over onto encrypted Stripe systems
                window.location.href = session.url;
            } else {
                alert('Error creating checkout session. Please try again.');
            }
        } catch (error) {
            console.error('Network Connection Error:', error);
            alert('Could not connect to the processing payment server.');
        }
    });
});
