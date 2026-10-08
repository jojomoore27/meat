import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-farm-grass/10 text-farm-grass text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Farm Terms & Agreement
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-farm-forest dark:text-white">
          Terms & Conditions
        </h1>
        <p className="text-xs text-gray-500 mt-1">Last Updated: October 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
        <section>
          <h2 className="text-lg font-display font-semibold text-farm-forest dark:text-white">1. Nature of the Service</h2>
          <p>
            BestGrassFedCattle operates an inquiry and order-request platform. Submitting an "Order Request" or "Wholesale Request" does not constitute an automatically binding sale or confirmed order. All submissions represent customer purchase requests subject to livestock availability, butcher harvest scheduling, and direct personal confirmation by our farm management.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-display font-semibold text-farm-forest dark:text-white">2. Direct Customer Confirmation</h2>
          <p>
            An order is considered finalized only after a representative of BestGrassFedCattle contacts you directly (via phone, email, WhatsApp, or Telegram) to verify specifications, unit quantities, cut thicknesses, and payment arrangements.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-display font-semibold text-farm-forest dark:text-white">3. Pricing and Weights</h2>
          <p>
            All listed prices are denominated in United States Dollars (USD). Because individual artisanal cattle cuts vary naturally in weight and fat marbling, final unit weights and balances are determined during butchering and confirmed directly with the purchaser prior to order completion.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-display font-semibold text-farm-forest dark:text-white">4. No Online Payment / No Automatic Delivery</h2>
          <p>
            This website does not accept credit card numbers or process automated electronic payments. We do not provide an automated delivery fee calculator or automated courier tracking. All fulfillment logistics are coordinated directly between the customer and our New York farm team.
          </p>
        </section>
      </div>
    </div>
  );
}
