module Voom
  module Presenters
    module Plugins
      module Stripe
        module Components
          module Actions
            class TokenizeCreditCard < DSL::Components::Actions::Base
              def initialize(**attribs_, &block)
                super(type: :tokenize_credit_card, **attribs_, &block)
              end
            end
          end
        end
      end
    end
  end
end