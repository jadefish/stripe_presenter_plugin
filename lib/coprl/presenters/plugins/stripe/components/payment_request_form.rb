require 'coprl/presenters/dsl/components/event_base'

module Coprl
  module Presenters
    module Plugins
      module Stripe
        module Components
          class PaymentRequestForm < DSL::Components::EventBase
            attr_reader :stripe_publishable_key,
                        :description,
                        :total,
                        :payment_intent_path,
                        :options,
                        :shipping_options

            def initialize(stripe_publishable_key,
                           description:,
                           total:,
                           payment_intent_path:,
                           shipping_options: [],
                           **attributes,
                           &block)
              @stripe_publishable_key = stripe_publishable_key
              @description = description
              @total = total
              @payment_intent_path = payment_intent_path
              @options = DEFAULT_OPTIONS.merge(attributes.slice(*DEFAULT_OPTIONS.keys))
              @shipping_options =
                if @options[:request_shipping]
                  validate_shipping_options(shipping_options)
                else
                  # Google Pay raises a JS error if shipping options are provided but not required.
                  []
                end

              super(type: :stripe_payment_request_form, **attributes, &block)

              expand!
            end

            private

            DEFAULT_OPTIONS = {
              country: 'US',
              currency: 'usd',
              request_name: true,
              request_email: true,
              request_shipping: false
            }.freeze

            def validate_shipping_options(shipping_options)
              if @options[:request_shipping] && shipping_options.empty?
                raise Errors::ParameterValidation, 'request_shipping requires at least one shipping option'
              end

              shipping_options.map { |it| validate_shipping_option(it) }
            end

            def validate_shipping_option(shipping_option)
              id = require_key_or_method(shipping_option, :id).to_s
              label = require_key_or_method(shipping_option, :label).to_s
              detail = require_key_or_method(shipping_option, :detail).to_s
              amount = require_key_or_method(shipping_option, :amount).to_i

              if amount < 0
                raise ArgumentError, 'shipping option amount must be a nonnegative integer'
              end

              {id: id, label: label, detail: detail, amount: amount}
            end

            def require_key_or_method(thing, name)
              if thing.respond_to?(:key?) && thing.key?(name)
                return thing[name]
              elsif thing.respond_to?(name)
                return thing.public_send(name)
              end

              raise ArgumentError, "missing required key or method #{name}"
            end
          end
        end
      end
    end
  end
end
