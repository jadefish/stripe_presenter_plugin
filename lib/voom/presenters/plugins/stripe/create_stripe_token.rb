module Voom
  module Presenters
    module Plugins
      module Stripe
        class CreateStripeToken < DSL::Components::Actions::Base
          def initialize(**attribs_, &block)
            super(type: :create_stripe_token, **attribs_, &block)
          end
        end
      end
    end
  end
end