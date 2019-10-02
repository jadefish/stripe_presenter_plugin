require_relative 'stripe/stripe_js_component'
require_relative 'stripe/create_stripe_bank_account_token'

module Voom
  module Presenters
    module Plugins
      module Stripe
        module DSLComponents
          def stripe_js(**attributes, &block)
            self << Stripe::StripeJsComponent.new(parent: self, **attributes, &block)
          end

          def stripe_bank_account_form(url:, stripe_publishable_key:, prefill_data: {}, **attributes, &block)
            select id: 'stripe-bank-account-country', name: 'country' do
              label "Country"
              option do
                value 'US'
                text 'United States'
              end
            end
            select id: 'stripe-bank-account-currency', name: 'currency' do
              label "Currency"
              option do
                value 'usd'
                text 'USD'
              end
            end
            text_field id: 'stripe-bank-account-holder-name', name: 'account_holder_name', auto_complete: false do
              label "Name on Account"
              value prefill_data[:account_holder_name] if prefill_data[:account_holder_name]
            end
            text_field id: 'stripe-bank-account-routing-number', name: 'routing_number', auto_complete: false do
              label "Routing Number"
              value prefill_data[:routing_number] if prefill_data[:routing_number]
            end
            text_field id: 'stripe-bank-account-number', name: 'account_number', auto_complete: false do
              label "Account Number"
            end

            button text: "Submit", id: 'stripe-bank-account-form-submit', name: 'stripe_bank_account_form_submit' do
              event :click do
                create_stripe_bank_account_token stripe_publishable_key: stripe_publishable_key
                posts url, onetime_token: last_response.token, **attributes[:extra_post_data]
                yield_to(&block)
              end
            end
          end
        end

        module DSLEventActions
          def create_stripe_bank_account_token(**attributes, &block)
            self << Stripe::CreateStripeBankAccountToken.new(parent: self, **attributes, &block)
          end
        end

        module WebClientComponents
          def render_stripe_js(comp,
                             render:,
                             components:,
                             index:)
            view_dir = File.join(__dir__, 'stripe')
            render.call :erb, :stripe_js, views: view_dir,
                        locals: {comp: comp,
                                 components: components, index: index}
          end
        end

        module WebClientActions
          def action_data_create_stripe_bank_account_token(action, _parent_id, *)
            # Type, URL, Options, Params (passed into javascript event/action classes)
            ['createStripeBankAccountToken', action.url, action.options.to_h, action.attributes.to_h]
          end
        end
      end
    end
  end
end


