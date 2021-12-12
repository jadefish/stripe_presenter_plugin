// TODO: transpile and use async/await + fetch
class PaymentRequestForm {
  constructor(element) {
    console.debug('\tPaymentRequestForm');
    this.element = element;
    this.data = this.element.dataset;
    this.stripe = Stripe(this.data.stripePublishableKey);
    this.params = {};

    const total = parseInt(this.data.total, 10); // currency subunit (e.g. cents)

    if (total < 0) {
      throw new Error('total cannot be negative');
    }

    const items = JSON.parse(this.data.items);

    if (!Array.isArray(items) || items.length < 1) {
      throw new Error('items cannot be empty');
    }

    const paymentRequest = this.createPaymentRequest({
      country: this.data.country,
      currency: this.data.currency,
      requestPayerName: this.data.requestName == 'true',
      requestPayerEmail: this.data.requestEmail == 'true',
      requestShipping: this.data.requestShipping == 'true',
      displayItems: items,
      total: {label: 'Total', amount: total}
    });

    paymentRequest.canMakePayment().then(result => {
      if (result) {
        this.stripe.elements()
          .create('paymentRequestButton', {paymentRequest: paymentRequest})
          .mount(this.element);
        this.dispatchEvent('init_succeeded');
      } else {
        console.warn('PaymentRequestForm: not allowed to make payment')
        this.dispatchEvent('init_failed');
      }
    });

    paymentRequest.on('paymentmethod', e => {
      this.fetchClientSecret().then(clientSecret => {
        return this.stripe.confirmCardPayment(
          clientSecret,
          {payment_method: e.paymentMethod.id},
          {handleActions: false}
        );
      }).then(confirmResult => {
        if (!confirmResult || confirmResult.error) {
          throw new Error('payment failed');
        }

        // this plugin's parameters will be sent up in the request body as a
        // multipart form payload (notably, nested values are not supported)
        // instead of JSON. So, send up a JSON string that can be parsed on the
        // server. Not ideal, but it works for now.
        this.params['stripe_payment_data'] = JSON.stringify(e);

        // Check if the PaymentIntent requires any actions and if so let
        // Stripe.js handle the flow.
        if (confirmResult.paymentIntent.status === 'requires_action') {
          this.stripe.confirmCardPayment(clientSecret).then(result => {
            if (result.error) {
              throw new Error('payment failed');
            }
          });
        }
      }).then(() => {
        // Payment succeeded. Tell the browser to close the payment method
        // collection interface:
        e.complete('success');
        console.debug('payment succeeded: ', e);
        this.dispatchEvent('payment_succeeded');
      }).catch(err => {
        // Payment failed. Report to the browser that the payment failed,
        // prompting it to re-show the payment interface, or show an error
        // message and close the payment interface.
        e.complete('fail');
        console.error('payment failed: ', err);
        this.dispatchEvent('payment_failed');

        throw err;
      });
    });

    paymentRequest.on('cancel', e => {
      this.dispatchEvent('payment_cancelled');
    });
  }

  fetchClientSecret() {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open('GET', this.data.clientSecretUrl);
      request.setRequestHeader('Accept', 'application/json,text/html;q=0.9,*/*;q=0.1');
      request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');

      request.addEventListener('load', () => {
        if (request.status >= 200 && request.status < 300) {
          const json = JSON.parse(request.response);
          resolve(json['data']);
        }
        else {
          reject({status: request.status, error: request.statusText});
        }
      });
      request.addEventListener('error', () => {
        reject({status: request.status, error: request.statusText});
      });

      request.send();
    });
  }

  createPaymentRequest(options) {
    return this.stripe.paymentRequest(Object.assign({
      requestPayerName: true,
      requestPayerEmail: true
    }, options));
  }

  prepareSubmit(params) {
    for (const pair of Object.entries(this.params)) {
      params.push(pair);
    }
  }

  dispatchEvent(name) {
    this.element.dispatchEvent(new Event(name), {bubbles: true});
  }
}
