class StripeCreditCardForm {
  constructor(element) {
    console.log('\tStripeCreditCardForm');
    this.element = element;
    this.data = this.element.dataset;
    this.clientSecret = this.data.client_secret

    // Create a Stripe client.
    const stripe = Stripe(this.data.stripe_publishable_key);

    // Create an instance of Elements.
    const elements = stripe.elements();

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

    // Create an instance of the card Element.
    const card = elements.create('card', {style: style});

    // Add an instance of the card Element into the `card-element` <div>.
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

    // Handle form submission.
    // TODO: Need to figure out how to insert this into the events chain of the checkout payment form
    let form = document.getElementById('payment-form');
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      this.pay(card);
    });
  }

  /*
 * Calls stripe.confirmCardPayment which creates a pop-up modal to
 * prompt the user to enter extra authentication details without leaving your page
 */
  pay(card) {
    this.changeLoadingState(true);

    // Initiate the payment.
    // If authentication is required, confirmCardPayment will automatically display a modal
    this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: card
        }
      })
      .then(function(result) {
        if (result.error) {
          // Show error to your customer
          this.showError(result.error.message);
        } else {
          // The payment has been processed!
          console.log('Payment processed!');
          console.dir(result);
        }
      });
  };

  showError(errorMsgText) {
    changeLoadingState(false);
    const errorMsg = document.querySelector(".sr-field-error");
    errorMsg.textContent = errorMsgText;
    setTimeout(function() {
      errorMsg.textContent = "";
    }, 4000);
  };

  // Show a spinner on payment submission
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
