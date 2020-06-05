require 'voom/presenters/dsl/components/base'

module Voom
  module Presenters
    module Plugins
      module Stripe
        module Components
          class CreditCardForm < DSL::Components::Base

            attr_reader :stripe_publishable_key, :client_secret, :payment_intent_id

            def initialize(stripe_publishable_key, client_secret, payment_intent_id, **attribs_, &block)
              @stripe_publishable_key = stripe_publishable_key
              @client_secret = client_secret
              @payment_intent_id = payment_intent_id
              super(type: :stripe_credit_card_form, **attribs_, &block)
              expand!
            end
          end
        end
      end
    end
  end
end