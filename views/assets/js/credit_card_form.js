class StripeCreditCardForm {
  constructor(element) {
    console.debug('\tStripeCreditCardForm');
    this.element = element;
    this.data = this.element.dataset;
    this.stripe = Stripe(this.data.stripePublishableKey);
    this.formType = this.data.formType;

    const elements = this.stripe.elements();

    const style = {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    };

    if (this.formType === 'single_line') {
      this.cardNumber = elements.create('card', {style: style});
      this.cardNumber.mount('#card-element');
      // Handle real-time validation errors from the card Element.
      this.cardNumber.on('change', function(event) {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
          displayError.textContent = event.error.message;
        } else {
          displayError.textContent = '';
        }
      });
    }
    else {
      this.cardNumber = elements.create('cardNumber', {style: style, showIcon: true});
      this.cardNumber.mount('#card-number');

      this.cardExpiry = elements.create('cardExpiry', {style: style});
      this.cardExpiry.mount('#card-expiry');

      this.cardCvc = elements.create('cardCvc', {style: style});
      this.cardCvc.mount('#card-cvc');
    }
  }

  stripeTokenData() {
    let data = {currency: this.data.currency}
    if (this.data.addressConfig && this.formType !== 'single_line') {
      const config = JSON.parse(this.data.addressConfig);
      for (let field in config) {
        let value = config[field]
        if (Array.isArray(value)) {
          data[field] = value.map(elem_id =>
            document.getElementsByName(elem_id)[0] ? document.getElementsByName(elem_id)[0].value : ''
          ).join(' ');
        }
        else{
          data[field] = document.getElementsByName(value)[0] ? document.getElementsByName(value)[0].value : '';
        }
      }
    }
    return data;
  }

}

function tokenizeCreditCard(_options, params, _event, results) {
  return new Promise(function (resolve, reject) {
    let plugin = document.querySelector('.v-stripe_credit_card_form')
    const targetComponent = _event.currentTarget.vComponent
    if (plugin && plugin.vPlugin) {
      plugin = plugin.vPlugin
      targetComponent.disable();
      plugin.stripe.createToken(plugin.cardNumber, plugin.stripeTokenData()).then(function (response) {
        if (response.token) {
          const result = {action: 'tokenize_credit_card', content: {onetime_token: response.token.id}, statusCode: 200};
          result.content = JSON.stringify(result.content);
          results.push(result);
          resolve(results);
        } else {
          const message = response.error.message;
          const bad_result = {
            action: 'tokenize_credit_card',
            contentType: 'application/json',
            content: {errors: message},
            statusCode: 400
          };
          bad_result.content = JSON.stringify(bad_result.content);
          results.push(bad_result);
          targetComponent.enable();
          reject(results);
        }
      });
    } else {
      results.push({action: 'tokenize_credit_card', content: JSON.stringify({onetime_token: ''}), statusCode: 200})
      resolve(results);
    }
  });
}

