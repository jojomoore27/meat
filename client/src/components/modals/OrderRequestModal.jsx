import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { resolveImageUrl } from '../../utils/apiUrl';

export default function OrderRequestModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    contact_preference: 'email',
    quantity: 1,
    cut_preference: '',
    special_instructions: '',
    additional_notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        product_id: product.id,
        product_name: product.name,
      };

      const res = await api.submitOrderRequest(payload);
      setSuccessResult(res);
    } catch (err) {
      setError(err.message || 'We could not submit your request. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccessResult(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#151c17] rounded-2xl shadow-2xl border border-farm-sand/40 dark:border-farm-forest/60 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10 bg-farm-cream/60 dark:bg-farm-forest/20">
          <div>
            <span className="text-xs font-semibold tracking-wider text-farm-grass uppercase">Direct Farm Order Request</span>
            <h3 className="text-xl font-display font-semibold text-farm-forest dark:text-farm-sand">
              {successResult ? 'Order Request Confirmed' : `Request: ${product.name}`}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {successResult ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="text-center py-6 px-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="inline-block px-3 py-1 bg-farm-grass/10 text-farm-grass dark:text-farm-sandLight text-xs font-semibold rounded-full mb-3 uppercase tracking-wider">
                Status: New Request Received
              </span>
              <h4 className="text-2xl font-display font-bold text-farm-forest dark:text-white mb-2">
                Thank You for Your Order Request
              </h4>
              <p className="text-farm-charcoal/80 dark:text-gray-300 text-sm max-w-lg mx-auto mb-6">
                Your request has been successfully received by <span className="font-semibold text-farm-forest dark:text-farm-sand">BestGrassFedCattle</span>. Our farm team will review fresh stock availability and contact you directly to finalize your order.
              </p>

              {/* Reference Badge */}
              <div className="bg-farm-cream dark:bg-farm-forest/30 border border-farm-sand/40 dark:border-farm-forest rounded-xl p-4 max-w-md mx-auto mb-6 text-left">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Reference Number:</span>
                  <span className="font-mono font-bold text-lg text-farm-grass dark:text-farm-sand">
                    #{successResult.reference_no}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-gray-200 dark:border-white/10">
                  <span className="text-gray-500 dark:text-gray-400">Product:</span>
                  <span className="font-medium text-farm-forest dark:text-white">{product.name}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-500 dark:text-gray-400">Quantity / Preferred Cut:</span>
                  <span className="font-medium text-farm-forest dark:text-white">
                    {formData.quantity}x ({formData.cut_preference || 'Standard Cut'})
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 mb-6">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-farm-grass" />
                No online payment was processed. We coordinate directly with you.
              </div>

              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-8 py-3 bg-farm-forest hover:bg-farm-grass text-white font-medium rounded-xl transition-all shadow-md"
              >
                Close & Continue Browsing
              </button>
            </div>
          ) : (
            /* ORDER FORM */
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Product Summary Header Card */}
              <div className="flex items-center gap-4 p-3 bg-farm-cream dark:bg-farm-forest/20 rounded-xl border border-farm-sand/30">
                <img
                  src={resolveImageUrl(product.main_image) || '/images/artisanal_ribeye_steak.jpg'}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/artisanal_ribeye_steak.jpg';
                  }}
                  className="w-16 h-16 object-cover rounded-lg shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-farm-grass font-semibold">{product.sku}</div>
                  <h4 className="font-display font-semibold text-farm-forest dark:text-white truncate">
                    {product.name}
                  </h4>
                  <div className="text-sm font-bold text-farm-earth">
                    ${Number(product.price).toFixed(2)}
                    <span className="text-xs text-gray-500 font-normal"> / unit</span>
                  </div>
                </div>
              </div>

              {/* Notice Banner */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>Direct Farm Request:</strong> There is no online payment or automated checkout. We personally contact you via your preferred method to confirm fresh availability, answer questions, and arrange fulfillment.
                </span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-farm-charcoal dark:text-gray-200 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={handleChange}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-grass text-farm-charcoal dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-farm-charcoal dark:text-gray-200 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-grass text-farm-charcoal dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-farm-charcoal dark:text-gray-200 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-grass text-farm-charcoal dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-farm-charcoal dark:text-gray-200 mb-1">
                    Preferred Contact Method
                  </label>
                  <select
                    name="contact_preference"
                    value={formData.contact_preference}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-grass text-farm-charcoal dark:text-white"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Phone Call</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="telegram">Telegram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-farm-charcoal dark:text-gray-200 mb-1">
                    Quantity / Requested Amount
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    max="100"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-grass text-farm-charcoal dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-farm-charcoal dark:text-gray-200 mb-1">
                    Specific Cut Preference (Optional)
                  </label>
                  <input
                    type="text"
                    name="cut_preference"
                    value={formData.cut_preference}
                    onChange={handleChange}
                    placeholder="e.g. Bone-in, special request"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-grass text-farm-charcoal dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-farm-charcoal dark:text-gray-200 mb-1">
                  Special Instructions or Preparation Notes
                </label>
                <textarea
                  name="special_instructions"
                  rows="2"
                  value={formData.special_instructions}
                  onChange={handleChange}
                  placeholder="e.g. Preferred aging, freezer packaging, holiday date..."
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-farm-grass text-farm-charcoal dark:text-white resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-2.5 bg-farm-forest hover:bg-farm-grass text-white font-medium rounded-xl text-sm transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    'Submit Order Request'
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
