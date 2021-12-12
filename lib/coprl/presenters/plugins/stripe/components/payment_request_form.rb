# frozen_string_literal: true

module Coprl
  module Presenters
    module Plugins
      module Stripe
        module Components
          class PaymentRequestForm < DSL::Components::Base
            attr_reader :stripe_publishable_key,
                        :items,
                        :total,
                        :client_secret_url,
                        :configuration,
                        :shipping_options

            def initialize(stripe_publishable_key,
                           items:,
                           total:,
                           client_secret_url:,
                           shipping_options: [],
                           **attribs,
                           &block)
              @stripe_publishable_key = stripe_publishable_key
              @items = items
              @total = total
              @client_secret_url = client_secret_url
              @configuration = DEFAULT_OPTIONS.merge(attribs.slice(*DEFAULT_OPTIONS.keys))
              @shipping_options = validate_shipping_options(shipping_options)

              super(type: :stripe_payment_request_form, **attribs, &block)

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
              if @configuration[:request_shipping] && shipping_options.empty?
                raise Errors::ParameterValidation, 'request_shipping requires one or more shipping_options'
              end

              shipping_options.each do |so|
                validate_shipping_option(so.transform_keys(&:to_sym))
              end
            end

            def validate_shipping_option(shipping_option)
              raise 'missing key :id' unless shipping_option.key?(:id)
              raise 'missing key :label' unless shipping_option.key?(:label)
              raise 'missing key :detail' unless shipping_option.key?(:detail)
              raise 'missing key :amount' unless shipping_option.key?(:amount)
            end
          end
        end
      end
    end
  end
end
