import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { ChevronDown, Search, HelpCircle, PhoneCall, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Faqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openIdx, setOpenIdx] = useState(null);

  useEffect(() => {
    async function loadFaqs() {
      setLoading(true);
      try {
        const res = await api.getFaqs();
        if (res.faqs) setFaqs(res.faqs);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFaqs();
  }, []);

  const filteredFaqs = faqs.filter(f =>
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase()) ||
    (f.category && f.category.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-semibold uppercase tracking-widest text-farm-grass dark:text-farm-sand">
          Knowledge & Customer Support
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-farm-forest dark:text-white mt-2 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-light">
          Everything you need to know about our order request system, pasture standards, wholesale requirements, and direct farm communication.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative mb-10">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search question keywords (e.g. order, grass-fed, wholesale, shipping)..."
          className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-grass text-farm-charcoal dark:text-white shadow-premium"
        />
      </div>

      {/* Accordion */}
      {loading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 border-4 border-farm-grass border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading FAQs...</p>
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-[#151c17] rounded-2xl border border-farm-sand/40 p-6">
          <HelpCircle className="w-10 h-10 text-farm-sand mx-auto mb-2" />
          <p className="text-sm text-gray-500">No questions match your search terms.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={faq.id}
                className="rounded-2xl bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-display font-semibold text-base sm:text-lg text-farm-forest dark:text-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-farm-grass"></span>
                    <span>{faq.question}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-farm-grass flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-white/5 pl-10">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Still have questions */}
      <div className="mt-16 text-center bg-farm-cream dark:bg-farm-forest/10 p-8 rounded-2xl border border-farm-sand/40 dark:border-white/5 space-y-3">
        <h3 className="font-display font-bold text-xl text-farm-forest dark:text-white">
          Still Have a Specific Question?
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto">
          Our Kansas farm team is always ready to talk beef cuts, aging, or order arrangements directly with you.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <Link
            to="/contact"
            className="px-6 py-2.5 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            Contact Farm Team
          </Link>
        </div>
      </div>

    </div>
  );
}
