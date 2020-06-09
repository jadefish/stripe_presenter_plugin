class StripeCreditCardForm {
  constructor(element) {
    console.log('\tStripeCreditCardForm');
    this.element = element;
    this.data = this.element.dataset;
    this.clientSecret = this.data.clientSecret;
    this.stripe = Stripe(this.data.stripePublishableKey);

    const elements = this.stripe.elements();

    // Custom styling can be passed to options when creating an Element.
    // (Note that this demo uses a wider set of styles than the guide below.)
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

    const card = elements.create('card', {style: style});
    card.mount('#card-element');

    // Handle real-time validation errors from the card Element.
    card.on('change', function(event) {
      const displayError = document.getElementById('card-errors');
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = '';
      }
    });

    // TODO: Move this to `validate` and `prepareSubmit` to insert into the events chain of the checkout payment form
    let button = document.getElementById('validate');
    let payCallback = this.createPaymentCallback(card);
    button.addEventListener('click', function(event) {
      event.preventDefault();
      payCallback();
    });
  }

  prepareSubmit(params) {
    console.log('Run prepareSubmit!');
  }

  validate(formData) {
    console.log('Run validation');
  }

  createPaymentCallback(card) {
    return ()=> {
      this.changeLoadingState(true);

      this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: card
        }
      }).then((result) => {
        if (result.error) {
          this.showError(result.error.message);
        } else {
          this.orderComplete(this.clientSecret);
        }
      });
    }
  };

  /* Shows a success / error message when the payment is complete - temp, for debugging */
  orderComplete(clientSecret) {
    // Just for the purpose of the sample, show the PaymentIntent response object
    this.stripe.retrievePaymentIntent(clientSecret).then((result) => {
      const paymentIntent = result.paymentIntent;
      const paymentIntentJson = JSON.stringify(paymentIntent, null, 2);

      document.querySelector(".sr-payment-form").classList.add("hidden");
      document.querySelector("pre").textContent = paymentIntentJson;

      document.querySelector(".sr-result").classList.remove("hidden");
      setTimeout(function() {
        document.querySelector(".sr-result").classList.add("expand");
      }, 200);

      this.changeLoadingState(false);
    });
  };

  showError(errorMsgText) {
    this.changeLoadingState(false);
    const errorMsg = document.querySelector(".sr-field-error");
    errorMsg.textContent = errorMsgText;
    setTimeout(function() {
      errorMsg.textContent = "";
    }, 4000);
  };

  changeLoadingState(isLoading) {
    if (isLoading) {
      document.querySelector("button").disabled = true;
      document.querySelector("#spinner").classList.remove("hidden");
      document.querySelector("#button-text").classList.add("hidden");
    } else {
      document.querySelector("button").disabled = false;
      document.querySelector("#spinner").classList.add("hidden");
      document.querySelector("#button-text").classList.remove("hidden");
    }
  };
}
