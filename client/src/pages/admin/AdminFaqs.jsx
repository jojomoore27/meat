import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('Ordering & Requests');
  const [sortOrder, setSortOrder] = useState('0');

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const res = await api.getFaqs();
      if (res.faqs) setFaqs(res.faqs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleOpenAdd = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setCategory('Ordering & Requests');
    setSortOrder('0');
    setModalOpen(true);
  };

  const handleOpenEdit = (f) => {
    setEditingFaq(f);
    setQuestion(f.question);
    setAnswer(f.answer);
    setCategory(f.category || 'Ordering & Requests');
    setSortOrder(String(f.sort_order || 0));
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { question, answer, category, sort_order: Number(sortOrder) };
      if (editingFaq) {
        await api.updateAdminFaq(editingFaq.id, payload);
      } else {
        await api.createAdminFaq(payload);
      }
      setModalOpen(false);
      loadFaqs();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete FAQ item?')) return;
    try {
      await api.deleteAdminFaq(id);
      setFaqs(faqs.filter(f => f.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-farm-forest dark:text-white">
            FAQ Management
          </h1>
          <p className="text-xs text-gray-500">Provide direct answers to customer questions on ordering, cuts, and wholesale.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold rounded-xl uppercase tracking-wider shadow"
        >
          <Plus className="w-4 h-4" /> Add FAQ
        </button>
      </div>

      <div className="bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-400">Loading FAQs...</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-semibold border-b border-gray-100 dark:border-white/10">
              <tr>
                <th className="p-4">Question</th>
                <th className="p-4">Category</th>
                <th className="p-4">Answer Snippet</th>
                <th className="p-4">Sort Order</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {faqs.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                  <td className="p-4 font-semibold text-farm-forest dark:text-white max-w-xs">{f.question}</td>
                  <td className="p-4 text-gray-500">{f.category}</td>
                  <td className="p-4 text-gray-600 dark:text-gray-300 max-w-md truncate">{f.answer}</td>
                  <td className="p-4">{f.sort_order}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleOpenEdit(f)} className="p-1.5 text-gray-500 hover:text-farm-forest">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(f.id)} className="p-1.5 text-gray-400 hover:text-red-600">
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
          <div className="bg-white dark:bg-[#151c17] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-lg font-display font-bold text-farm-forest dark:text-white">
                {editingFaq ? 'Edit FAQ Item' : 'New FAQ Item'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How do I order a quarter steer?"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Ordering, Beef Standards, Wholesale"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Answer *</label>
                <textarea
                  rows="4"
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Comprehensive, helpful answer for customers..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-farm-forest hover:bg-farm-grass text-white rounded-xl font-semibold shadow">
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
