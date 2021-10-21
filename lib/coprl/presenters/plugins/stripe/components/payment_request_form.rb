require 'coprl/presenters/dsl/components/event_base'

module Coprl
  module Presenters
    module Plugins
      module Stripe
        module Components
          class PaymentRequestForm < DSL::Components::EventBase
            attr_reader :stripe_publishable_key,
                        :country,
                        :currency,
                        :description,
                        :total,
                        :request_name,
                        :request_email,
                        :payment_intent_path

            def initialize(stripe_publishable_key, description:, total:, payment_intent_path:, **attribs, &block)
              @stripe_publishable_key = stripe_publishable_key
              @description = description
              @total = total
              @country = attribs.delete(:country) { :US }
              @currency = attribs.delete(:currency) { :usd }
              @request_name = attribs.delete(:request_name) { true }
              @request_email = attribs.delete(:request_email) { true }
              @payment_intent_path = payment_intent_path

              super(type: :stripe_payment_request_form, **attribs, &block)

              expand!
            end
          end
        end
      end
    end
  end
end
