import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import stripe

app = Flask(__name__)
# Enable CORS configuration permissions so your standalone HTML works smoothly locally
CORS(app)

# Load secret token securely out of backend configuration variables
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "your_stripe_secret_key_here")

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        data = request.get_json()
        donation_amount = float(data.get('amount', 25))
        
        # Stripe operates entirely on base-unit integer systems (e.g. Cents)
        amount_in_cents = int(donation_amount * 100)

        # Build dynamic instance variables for the secure offsite checkout portal
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'Donation to Impact Foundation',
                            'description': '100% of public gifts go directly to field programs.',
                        },
                        'unit_amount': amount_in_cents,
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url='https://yourwebsite.com/success.html',
            cancel_url='https://yourwebsite.com/index.html',
        )

        return jsonify({'url': checkout_session.url})

    except Exception as e:
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    # Local execution configuration for pipeline sanity testing
    app.run(port=5000, debug=True)
