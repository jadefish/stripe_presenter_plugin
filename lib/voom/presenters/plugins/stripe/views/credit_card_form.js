class StripeCreditCardForm {
  constructor(element) {
    console.log('\tStripeCreditCardForm');
    this.element = element;
    this.data = this.element.dataset;
    this.stripe = Stripe(this.data.stripePublishableKey);

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

    this.card = elements.create('card', {style: style});
    this.card.mount('#card-element');

    // Handle real-time validation errors from the card Element.
    this.card.on('change', function(event) {
      const displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });
  }

  changeLoadingState(isLoading) {
    if (isLoading) {
      document.querySelector("#spinner").classList.remove("hidden");
    } else {
      document.querySelector("#spinner").classList.add("hidden");
    }
  };
}

function tokenizeCreditCard(_options, params, _event, results) {
  return new Promise(function (resolve, reject) {
    const plugin = document.querySelector('.v-stripe_credit_card_form')?.vPlugin
    if (plugin) {
      plugin.changeLoadingState(true);
      plugin.stripe.createToken(plugin.card).then(function (response) {
        if (response.token) {
          const token = response.token;
          const result = {action: 'tokenize_credit_card', content: {token: token.id}, statusCode: 200};
          result.content = JSON.stringify(result.content);
          results.push(result);
          plugin.changeLoadingState(false);
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
          plugin.changeLoadingState(false);
          reject(results);
        }
      });
    } else {
      results.push({action: 'tokenize_credit_card', content: JSON.stringify({token: ''}), statusCode: 200})
      resolve(results);
    }
  });
}

