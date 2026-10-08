import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Building2, Search, Mail, Phone, X, Trash2, Save } from 'lucide-react';

export default function AdminWholesaleRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminWholesale({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined
      });
      if (res.requests) setRequests(res.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadRequests();
  };

  const handleOpenDetail = (req) => {
    setSelectedReq(req);
    setAdminNotes(req.admin_notes || '');
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedReq) return;
    setUpdating(true);
    try {
      const res = await api.updateAdminWholesale(selectedReq.id, {
        status: newStatus,
        admin_notes: adminNotes
      });
      if (res.request) {
        setSelectedReq(res.request);
        setRequests(requests.map(r => r.id === res.request.id ? res.request : r));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedReq) return;
    setUpdating(true);
    try {
      const res = await api.updateAdminWholesale(selectedReq.id, {
        admin_notes: adminNotes
      });
      if (res.request) {
        setSelectedReq(res.request);
        setRequests(requests.map(r => r.id === res.request.id ? res.request : r));
        alert('Notes updated.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this wholesale lead?')) return;
    try {
      await api.deleteAdminWholesale(id);
      setRequests(requests.filter(r => r.id !== id));
      if (selectedReq?.id === id) setSelectedReq(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-farm-forest dark:text-white">
            Wholesale & B2B Commercial Leads
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage volume requirements for restaurants, hotels, catering, and butcher shops.
          </p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-[#151c17] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="reviewing">Reviewing</option>
          <option value="contacted">Contacted</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company name, contact, reference #BGC-WXXXXX..."
          className="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-[#151c17] border border-gray-200 dark:border-white/10 rounded-xl text-xs sm:text-sm"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-farm-forest text-white text-xs font-semibold rounded-lg hover:bg-farm-grass"
        >
          Search
        </button>
      </form>

      <div className="bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading leads...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No wholesale leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-semibold border-b border-gray-100 dark:border-white/10">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Products / Volume</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-600">#{r.reference_no}</td>
                    <td className="p-4">
                      <div className="font-semibold text-farm-forest dark:text-white">{r.company_name}</div>
                      <span className="text-[10px] text-gray-400 capitalize">{r.business_type}</span>
                    </td>
                    <td className="p-4">
                      <div>{r.full_name}</div>
                      <div className="text-[11px] text-gray-400">{r.email} • {r.phone}</div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">{r.location}</td>
                    <td className="p-4">
                      <div className="font-medium text-farm-forest dark:text-white">{r.products_interested}</div>
                      <div className="text-[11px] text-gray-400">{r.estimated_quantity} ({r.purchase_frequency})</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenDetail(r)}
                        className="px-3 py-1 bg-farm-cream dark:bg-white/10 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#151c17] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
              <div>
                <span className="text-xs font-mono text-blue-600 font-bold">#{selectedReq.reference_no}</span>
                <h3 className="text-xl font-display font-bold text-farm-forest dark:text-white">
                  Wholesale Lead: {selectedReq.company_name}
                </h3>
              </div>
              <button onClick={() => setSelectedReq(null)} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-white/5 border border-blue-200/40 space-y-2">
                <h4 className="font-display font-semibold text-sm text-farm-forest dark:text-white">
                  Commercial Contact
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div><strong>Company:</strong> {selectedReq.company_name} ({selectedReq.business_type})</div>
                  <div><strong>Contact Person:</strong> {selectedReq.full_name}</div>
                  <div><strong>Email:</strong> <a href={`mailto:${selectedReq.email}`} className="text-blue-600 underline">{selectedReq.email}</a></div>
                  <div><strong>Phone:</strong> <a href={`tel:${selectedReq.phone}`} className="text-blue-600 underline">{selectedReq.phone}</a></div>
                  <div><strong>Location:</strong> {selectedReq.location}</div>
                  <div><strong>Frequency:</strong> {selectedReq.purchase_frequency}</div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-white/10">
                  <a href={`mailto:${selectedReq.email}?subject=BestGrassFedCattle Wholesale Inquiry #${selectedReq.reference_no}`} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email Contact
                  </a>
                  <a href={`tel:${selectedReq.phone}`} className="px-3 py-1.5 bg-farm-grass text-white rounded-lg text-xs flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-2 text-xs">
                <div><strong>Products Interested In:</strong> {selectedReq.products_interested}</div>
                <div><strong>Estimated Quantity:</strong> {selectedReq.estimated_quantity}</div>
                {selectedReq.preferred_cuts && <div><strong>Preferred Cuts:</strong> {selectedReq.preferred_cuts}</div>}
                {selectedReq.message && (
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-white/10">
                    <strong>Culinary / Kitchen Message:</strong>
                    <p className="mt-1 p-2 bg-white dark:bg-black/20 rounded border border-gray-200 dark:border-white/10">{selectedReq.message}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">Update Lead Status</label>
                <div className="flex flex-wrap gap-2">
                  {['new', 'reviewing', 'contacted', 'confirmed', 'completed', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updating}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase ${
                        selectedReq.status === st ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Wholesale Accounts Notes</label>
                <textarea
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record wholesale terms, pricing sheets sent, custom harvest date..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs"
                ></textarea>
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleSaveNotes}
                  className="mt-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Lead Notes
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-white/10 text-right">
              <button onClick={() => setSelectedReq(null)} className="px-5 py-2 bg-gray-100 dark:bg-white/10 rounded-xl text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
