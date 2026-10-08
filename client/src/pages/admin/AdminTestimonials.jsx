import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2, X, Quote } from 'lucide-react';
import ImageUploadField from '../../components/ui/ImageUploadField';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerRole, setCustomerRole] = useState('');
  const [quote, setQuote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getTestimonials();
      if (res.testimonials) setTestimonials(res.testimonials);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.createAdminTestimonial({
        customer_name: customerName,
        customer_role: customerRole,
        quote,
        photo_url: photoUrl
      });
      setModalOpen(false);
      setCustomerName('');
      setCustomerRole('');
      setQuote('');
      setPhotoUrl('');
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete testimonial?')) return;
    try {
      await api.deleteAdminTestimonial(id);
      setTestimonials(testimonials.filter(t => t.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-farm-forest dark:text-white">
            Customer & Chef Testimonials
          </h1>
          <p className="text-xs text-gray-500">Manage real customer feedback showcased on the website.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold rounded-xl uppercase tracking-wider shadow"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      <div className="bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading testimonials...</div>
        ) : testimonials.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No testimonials added yet.</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {testimonials.map((t) => (
              <div key={t.id} className="p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.customer_name} className="w-12 h-12 rounded-full object-cover shadow" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-farm-grass/20 text-farm-grass flex items-center justify-center font-bold">
                      {t.customer_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-display font-bold text-sm text-farm-forest dark:text-white">{t.customer_name}</h4>
                    <p className="text-xs text-gray-400">{t.customer_role}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 italic max-w-xl">"{t.quote}"</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#151c17] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-lg font-display font-bold text-farm-forest dark:text-white">Add Testimonial</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Customer / Chef Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Chef Marcus Vance"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Role / Establishment</label>
                <input
                  type="text"
                  value={customerRole}
                  onChange={(e) => setCustomerRole(e.target.value)}
                  placeholder="e.g. Executive Chef, Manhattan Bistro"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Testimonial Quote *</label>
                <textarea
                  rows="3"
                  required
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="Customer experience quote..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl resize-none"
                ></textarea>
              </div>

              <ImageUploadField
                label="Customer Photo (Optional)"
                value={photoUrl}
                onChange={(url) => setPhotoUrl(url)}
                helperText="Upload a customer photo from your device or paste an image URL."
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-farm-forest hover:bg-farm-grass text-white rounded-xl font-semibold shadow">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
