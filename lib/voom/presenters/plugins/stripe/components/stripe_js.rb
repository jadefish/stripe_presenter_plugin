require 'voom/presenters/dsl/components/base'

module Voom
  module Presenters
    module Plugins
      module Stripe
        module Components
          class StripeJs < DSL::Components::Base
            def initialize(**attribs_, &block)
              super(type: :stripe_js, **attribs_, &block)
            end
          end
        end
      end
    end
  end
end
