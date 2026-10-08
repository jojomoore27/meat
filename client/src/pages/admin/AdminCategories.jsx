import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState('0');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      if (res.categories) setCategories(res.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setDescription('');
    setSortOrder('0');
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCat(c);
    setName(c.name);
    setDescription(c.description || '');
    setSortOrder(String(c.sort_order || 0));
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, description, sort_order: Number(sortOrder) };
      if (editingCat) {
        await api.updateAdminCategory(editingCat.id, payload);
      } else {
        await api.createAdminCategory(payload);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete category?')) return;
    try {
      await api.deleteAdminCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-farm-forest dark:text-white">
            Product Cut Categories
          </h1>
          <p className="text-xs text-gray-500">Organize your cuts for browsing & customer navigation.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold rounded-xl uppercase tracking-wider shadow"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading categories...</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-semibold border-b border-gray-100 dark:border-white/10">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4">Cuts Count</th>
                <th className="p-4">Sort Order</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                  <td className="p-4 font-semibold text-farm-forest dark:text-white text-sm">{c.name}</td>
                  <td className="p-4 font-mono text-gray-400">{c.slug}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">{c.description}</td>
                  <td className="p-4 font-bold">{c.product_count || 0}</td>
                  <td className="p-4">{c.sort_order}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(c)} className="p-1.5 text-gray-500 hover:text-farm-forest">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#151c17] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-lg font-display font-bold text-farm-forest dark:text-white">
                {editingCat ? 'Edit Category' : 'New Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Premium Steaks"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Appears in category descriptions..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold mb-1">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-farm-forest hover:bg-farm-grass text-white rounded-xl font-semibold shadow">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
