require 'voom/presenters/dsl/components/event_base'

module Voom
  module Presenters
    module Plugins
      module Stripe
        module Components
          class CreditCardForm < DSL::Components::EventBase

            attr_reader :stripe_publishable_key, :client_secret, :payment_intent_id

            def initialize(stripe_publishable_key, client_secret, payment_intent_id, **attribs_, &block)
              super(type: :stripe_credit_card_form, **attribs_, &block)
              @stripe_publishable_key = stripe_publishable_key
              @client_secret = client_secret
              @payment_intent_id = payment_intent_id
              expand!
            end
          end
        end
      end
    end
  end
end