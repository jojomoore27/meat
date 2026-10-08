import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, X, Star, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import ImageUploadField from '../../components/ui/ImageUploadField';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    price: '',
    short_description: '',
    full_description: '',
    main_image: '',
    status: 'published',
    is_featured: false,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getAdminProducts(),
        api.getCategories()
      ]);
      if (prodRes.products) setProducts(prodRes.products);
      if (catRes.categories) setCategories(catRes.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `BGC-${Math.floor(1000 + Math.random() * 9000)}`,
      category_id: categories[0]?.id || '',
      price: '28.00',
      short_description: '',
      full_description: '',
      main_image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80',
      status: 'published',
      is_featured: false,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category_id: p.category_id || '',
      price: String(p.price),
      short_description: p.short_description || '',
      full_description: p.full_description || '',
      main_image: p.main_image,
      status: p.status || 'published',
      is_featured: Boolean(p.is_featured),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.main_image) {
      alert('Please select or upload a main picture for this product.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        category_id: formData.category_id || null,
        price: Number(formData.price),
        short_description: formData.short_description,
        full_description: formData.full_description,
        main_image: formData.main_image,
        status: formData.status,
        is_featured: formData.is_featured ? 1 : 0,
        cut_options: [],
        specifications: {},
      };

      if (editingProduct) {
        await api.updateAdminProduct(editingProduct.id, payload);
      } else {
        await api.createAdminProduct(payload);
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product from catalog?')) return;
    try {
      await api.deleteAdminProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-farm-forest dark:text-white">
            Artisanal Beef Cuts Catalog
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Add cuts, manage categories, update pricing, and toggle farm favorites.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" /> Add New Cut
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-semibold border-b border-gray-100 dark:border-white/10">
                <tr>
                  <th className="p-4">Cut Image</th>
                  <th className="p-4">Cut Name & SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Featured</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-4">
                      <img src={p.main_image} alt={p.name} className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-farm-forest dark:text-white text-sm">{p.name}</div>
                      <div className="text-gray-400 font-mono text-[11px]">{p.sku}</div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {p.category_name || 'General Beef'}
                    </td>
                    <td className="p-4 font-bold text-farm-earth">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {Boolean(p.is_featured) && (
                        <span className="text-amber-500 flex items-center gap-1 font-semibold text-[11px]">
                          <Star className="w-3.5 h-3.5 fill-current" /> Featured
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-gray-500 hover:text-farm-forest dark:hover:text-white rounded-lg hover:bg-gray-100"
                        title="Edit cut"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                        title="Delete cut"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#151c17] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-xl font-display font-bold text-farm-forest dark:text-white">
                {editingProduct ? 'Edit Beef Cut' : 'Add New Beef Cut'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Product Cut Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dry Aged Bone-In Ribeye"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
                  >
                    <option value="">Select Cut Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="34.50"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
                  />
                </div>
              </div>

              <ImageUploadField
                label="Product Main Picture *"
                value={formData.main_image}
                onChange={(url) => setFormData({ ...formData, main_image: url })}
                required={true}
                helperText="Upload a picture directly from your device or enter an image URL."
              />

              <div>
                <label className="block text-xs font-semibold mb-1">Short Description *</label>
                <input
                  type="text"
                  required
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Appears on product card in catalog..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Full Detailed Narrative</label>
                <textarea
                  rows="3"
                  value={formData.full_description}
                  onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                  placeholder="Butcher notes, recommended culinary preparations..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl resize-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded text-farm-grass"
                  />
                  <span className="text-xs font-semibold">Mark as Featured on Homepage</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">Status:</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="px-2 py-1 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-lg text-xs"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Hidden)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-farm-forest hover:bg-farm-grass text-white rounded-xl text-xs font-semibold shadow flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Saving...' : 'Save Cut'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
