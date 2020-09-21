require 'voom/presenters/dsl/components/event_base'

module Voom
  module Presenters
    module Plugins
      module Stripe
        module Components
          class CreditCardForm < DSL::Components::EventBase

            attr_reader :stripe_publishable_key, :address_config, :currency

            def initialize(stripe_publishable_key, **attribs, &block)
              @stripe_publishable_key = stripe_publishable_key
              @address_config = attribs.delete(:address_config){ {} }
              @currency = attribs.delete(:currency){ 'usd' }
              super(type: :stripe_credit_card_form, **attribs, &block)
              expand!
            end
          end
        end
      end
    end
  end
end