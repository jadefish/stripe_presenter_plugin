require_relative 'stripe/components/stripe_js'
require_relative 'stripe/components/credit_card_form'
require_relative 'stripe/components/payment_request_form'
require_relative 'stripe/components/actions/create_stripe_bank_account_token'
require_relative 'stripe/components/actions/tokenize_credit_card'

module Coprl
  module Presenters
    module Plugins
      module Stripe
        module DSLComponents
          def stripe_js(**attributes, &block)
            self << Stripe::Components::StripeJs.new(parent: self, **attributes, &block)
          end

          def stripe_bank_account_form_fields(prefill_data: {}, **attributes, &block)
            select name: :country do
              label "Country"
              option do
                value 'US'
                text 'United States'
              end
            end
            select name: :currency do
              label "Currency"
              option do
                value 'usd'
                text 'USD'
              end
            end
            text_field name: :account_holder_name, auto_complete: false do
              label "Name on Account"
              value prefill_data[:account_holder_name] if prefill_data[:account_holder_name]
            end
            text_field name: :routing_number, auto_complete: false do
              label "Routing Number"
              value prefill_data[:routing_number] if prefill_data[:routing_number]
            end
            text_field name: :account_number, auto_complete: false do
              label "Account Number"
            end
          end

          def stripe_bank_account_form_button(text = "Submit", url:, stripe_publishable_key:, **attributes, &block)
            button text, id: 'stripe-bank-account-form-submit', name: :stripe_bank_account_form_submit, **attributes do
              event :click do
                create_stripe_bank_account_token stripe_publishable_key: stripe_publishable_key
                posts url, onetime_token: last_response.token, input_tag: :none, **attributes[:extra_post_data]
                yield_to(&block)
              end
            end
          end

          def stripe_credit_card_form(stripe_publishable_key:, **attributes, &block)
            self << Stripe::Components::CreditCardForm.new(stripe_publishable_key,parent: self, **attributes, &block)
          end

          def stripe_payment_request_form(stripe_publishable_key:,
                                          items:,
                                          total:,
                                          client_secret_url:,
                                          **attributes,
                                          &block)
            self << Stripe::Components::PaymentRequestForm.new(stripe_publishable_key,
                                                               items: items,
                                                               total: total,
                                                               client_secret_url: client_secret_url,
                                                               parent: self,
                                                               **attributes,
                                                               &block)
          end
        end

        module DSLEventActions
          def create_stripe_bank_account_token(**attributes, &block)
            self << Stripe::Components::Actions::CreateStripeBankAccountToken.new(parent: self, **attributes, &block)
          end

          def tokenize_credit_card(**attributes, &block)
            self << Stripe::Components::Actions::TokenizeCreditCard.new(parent: self, **attributes, &block)
          end
        end

        module WebClientComponents
          def view_dir_stripe(_pom)
            File.join(__dir__, '../../../..', 'views', 'components')
          end

          def render_stripe_js(comp,
                             render:,
                             components:,
                             index:)
            render.call :erb, :stripe_js, views: view_dir_stripe(comp),
                        locals: {comp: comp,
                                 components: components, index: index}
          end

          def render_header_stripe(pom, render:)
            render.call :erb, :stripe_header, views: view_dir_stripe(pom)
          end

          def render_stripe_credit_card_form(comp,
                                             render:,
                                             components:,
                                             index:)
            render.call :erb, :credit_card_form, views: view_dir_stripe(comp),
                        locals: {comp: comp,
                                 components: components,
                                 index: index}
          end

          def render_stripe_payment_request_form(comp, render:, components:, index:)
            render.call :erb, :payment_request_form,
                        views: view_dir_stripe(comp),
                        locals: {comp: comp, components: components, index: index}
          end
        end

        module WebClientActions
          def action_data_create_stripe_bank_account_token(action, _parent_id, *)
            # Type, URL, Options, Params (passed into javascript event/action classes)
            ['createStripeBankAccountToken', action.url, action.options.to_h, action.attributes.to_h]
          end

          def action_data_tokenize_credit_card(action, _parent_id, *)
            ['tokenizeCreditCard', nil, action.options.to_h, {}]
          end
        end
      end
    end
  end
end


