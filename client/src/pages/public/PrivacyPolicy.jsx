import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-farm-grass/10 text-farm-grass text-xs font-semibold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Transparency & Security
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-farm-forest dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-500 mt-1">Last Updated: October 2026</p>
      </div>

      <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 space-y-6 leading-relaxed">
        <section>
          <h2 className="text-lg font-display font-semibold text-farm-forest dark:text-white">1. Direct Relationship Model</h2>
          <p>
            BestGrassFedCattle ("we", "our", "us") values your privacy. We operate an order-request and inquiry business model based in Kansas, United States. We do not operate an automated online checkout, and we do not collect, store, or process credit card numbers or financial account information on this website.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-display font-semibold text-farm-forest dark:text-white">2. Information We Collect</h2>
          <p>When you submit an Order Request, Wholesale Inquiry, or Contact Message, we collect:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your full name and company/organization name (if applicable)</li>
            <li>Your email address and telephone number</li>
            <li>Your preferred contact channel (email, phone, WhatsApp, or Telegram)</li>
            <li>Your cut preferences, quantities, and culinary or special instructions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-display font-semibold text-farm-forest dark:text-white">3. How We Use Your Information</h2>
          <p>We use your submitted details exclusively to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Review stock availability for requested beef cuts</li>
            <li>Contact you directly to finalize your arrangements and specifications</li>
            <li>Notify our farm administration team of new inquiries</li>
            <li>Maintain customer relationship records for wholesale and quarter-share requests</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-display font-semibold text-farm-forest dark:text-white">4. No Sale of Personal Data</h2>
          <p>
            We do not sell, rent, monetize, or disclose your contact information to external marketing agencies or data brokers.
          </p>
        </section>
      </div>
    </div>
  );
}
