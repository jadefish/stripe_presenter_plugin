module Voom
  module Presenters
    module Plugins
      module Stripe
        class CreateStripeBankAccountToken < DSL::Components::Actions::Base
          def initialize(**attribs_, &block)
            super(type: :create_stripe_bank_account_token, **attribs_, &block)
          end
        end
      end
    end
  end
end