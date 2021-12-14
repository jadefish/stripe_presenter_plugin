class PaymentRequestForm {
  constructor(element) {
    console.debug('\tPaymentRequestForm');
    this.element = element;
    this.data = this.element.dataset;
    this.stripe = Stripe(this.data.stripePublishableKey);
    this.paymentIntentPath = this.data.paymentIntentPath;
    this.params = {};

    const amount = parseInt(this.data.itemTotal, 10); // currency subunit (e.g. cents)
    const paymentRequest = this.createPaymentRequest({
      country: this.data.country,
      currency: this.data.currency,
      requestPayerName: this.data.requestName == 'true',
      requestPayerEmail: this.data.requestEmail == 'true',
      requestShipping: this.data.requestShipping == 'true',
      shippingOptions: JSON.parse(this.data.shippingOptions),
      total: {label: this.data.itemLabel, amount: amount}
    });

    paymentRequest.canMakePayment().then(result => {
      if (result) {
        this.stripe.elements()
          .create('paymentRequestButton', {paymentRequest: paymentRequest})
          .mount(this.element);
        this.element.dispatchEvent(new Event('init_succeeded', {bubbles: true}));
      } else {
        console.warn('PaymentRequestForm: not allowed to make payment')
        this.element.dispatchEvent(new Event('init_failed', {bubbles: true}));
      }
    });

    paymentRequest.on('paymentmethod', e => {
        fetch(this.paymentIntentPath, {method: 'POST'})
          .then(r => r.json())
          .then(r => {
            const paymentIntent = r.data;

            if (!(paymentIntent && paymentIntent.client_secret)) {
              e.complete('fail');
              throw new Error('missing payment intent');
            }

            const secret = paymentIntent.client_secret;

            // Confirm the PaymentIntent without handling potential next actions
            // (yet).
            this.stripe.confirmCardPayment(secret,
              {payment_method: e.paymentMethod.id},
              {handleActions: false}
            ).then(confirmResult => {
              if (confirmResult.error) {
                // Report to the browser that the payment failed, prompting it to
                // re-show the payment interface, or show an error message and close
                // the payment interface.
                console.error('payment failed: ', e, confirmResult);
                this.element.dispatchEvent(new Event('payment_failed'));
                e.complete('fail');
              } else {
                // Report to the browser that the confirmation was successful,
                // prompting it to close the browser payment method collection
                // interface.
                console.log('payment succeeded: ', e);

                // this plugin's parameters will be sent up in the request body
                // as a multipart form payload (notably, nested values are not
                // supported) instead of JSON. So, send up a JSON string that
                // can be parsed on the server. Not great, but it works for now.
                this.params['stripe_payment_data'] = JSON.stringify(e);

                e.complete('success');

                // Check if the PaymentIntent requires any actions and if so let
                // Stripe.js handle the flow.
                if (confirmResult.paymentIntent.status === 'requires_action') {
                  // Let Stripe.js handle the rest of the payment flow.
                  this.stripe.confirmCardPayment(secret).then(result => {
                    if (result.error) {
                      // The payment failed -- ask your customer for a new payment
                      // method.
                      console.log('payment failed: ', e);
                      this.element.dispatchEvent(new Event('payment_failed'));
                    } else {
                      // The payment has succeeded.
                      this.element.dispatchEvent(new Event('payment_succeeded'));
                    }
                  });
                } else {
                  // The payment has succeeded.
                  this.element.dispatchEvent(new Event('payment_succeeded'));
                }
              }
            }).catch(err => {
              console.error(err);
              e.complete('fail');
            });
          })
          .catch(err => {
            console.error(err);
            e.complete('fail');
          });
    });

    paymentRequest.on('cancel', e => {
      this.element.dispatchEvent(new Event('payment_cancelled', {bubbles: true}));
    });
  }

  createPaymentRequest(options) {
    return this.stripe.paymentRequest(Object.assign({
      requestPayerName: true,
      requestPayerEmail: true,
      requestShipping: false
    }, options));
  }

  prepareSubmit(params) {
    for (const pair of Object.entries(this.params)) {
      params.push(pair);
    }
  }
}
