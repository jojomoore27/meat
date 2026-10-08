import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  ShoppingBag,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  X,
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react';

export default function AdminOrderRequests() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined
      });
      if (res.orders) setOrders(res.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOrders();
  };

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setAdminNotes(order.admin_notes || '');
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await api.updateAdminOrder(selectedOrder.id, {
        status: newStatus,
        admin_notes: adminNotes
      });
      if (res.order) {
        setSelectedOrder(res.order);
        setOrders(orders.map(o => o.id === res.order.id ? res.order : o));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const res = await api.updateAdminOrder(selectedOrder.id, {
        admin_notes: adminNotes
      });
      if (res.order) {
        setSelectedOrder(res.order);
        setOrders(orders.map(o => o.id === res.order.id ? res.order : o));
        alert('Admin notes saved successfully.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order request?')) return;
    try {
      await api.deleteAdminOrder(id);
      setOrders(orders.filter(o => o.id !== id));
      if (selectedOrder?.id === id) setSelectedOrder(null);
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
            Customer Order Requests
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Review individual customer beef requests, update statuses, and log farm notes.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-[#151c17] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300"
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
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, reference #BGC-XXXXX, email, or cut..."
          className="w-full pl-10 pr-24 py-2.5 bg-white dark:bg-[#151c17] border border-gray-200 dark:border-white/10 rounded-xl text-xs sm:text-sm text-farm-charcoal dark:text-white"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-farm-forest text-white text-xs font-semibold rounded-lg hover:bg-farm-grass transition-colors"
        >
          Search
        </button>
      </form>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading requests...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No order requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-semibold border-b border-gray-100 dark:border-white/10">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Product & Specs</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-bold text-farm-forest dark:text-farm-sand">
                      #{ord.reference_no}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-farm-forest dark:text-white">{ord.customer_name}</div>
                      <div className="text-[11px] text-gray-400">{ord.email} • {ord.phone}</div>
                      <div className="text-[10px] text-farm-grass font-semibold uppercase mt-0.5">
                        Prefers: {ord.contact_preference}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-farm-charcoal dark:text-gray-200">{ord.product_name}</div>
                      {ord.cut_preference && (
                        <div className="text-[11px] text-gray-400">Cut: {ord.cut_preference}</div>
                      )}
                    </td>
                    <td className="p-4 font-bold">{ord.quantity}x</td>
                    <td className="p-4 text-gray-400 text-[11px]">
                      {new Date(ord.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        ord.status === 'new' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                        ord.status === 'reviewing' ? 'bg-amber-100 text-amber-700' :
                        ord.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                        ord.status === 'confirmed' ? 'bg-purple-100 text-purple-700' :
                        ord.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenDetail(ord)}
                        className="px-3 py-1 bg-farm-cream dark:bg-white/10 text-farm-forest dark:text-white rounded-lg hover:bg-farm-grass hover:text-white transition-colors"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleDelete(ord.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
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

      {/* Order Detail Modal Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#151c17] rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-white/10 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
              <div>
                <span className="text-xs font-mono text-farm-grass font-bold">#{selectedOrder.reference_no}</span>
                <h3 className="text-xl font-display font-bold text-farm-forest dark:text-white">
                  Order Request Detail
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="py-5 space-y-5 text-xs sm:text-sm">
              
              {/* Customer Info Box */}
              <div className="p-4 rounded-xl bg-farm-cream dark:bg-white/5 border border-farm-sand/40 space-y-2">
                <h4 className="font-display font-semibold text-sm text-farm-forest dark:text-white">
                  Customer Contact Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div><strong>Name:</strong> {selectedOrder.customer_name}</div>
                  <div><strong>Preferred Channel:</strong> <span className="uppercase text-farm-grass font-bold">{selectedOrder.contact_preference}</span></div>
                  <div><strong>Email:</strong> <a href={`mailto:${selectedOrder.email}`} className="text-blue-600 underline">{selectedOrder.email}</a></div>
                  <div><strong>Phone:</strong> <a href={`tel:${selectedOrder.phone}`} className="text-blue-600 underline">{selectedOrder.phone}</a></div>
                </div>

                {/* Quick action buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-white/10">
                  <a
                    href={`mailto:${selectedOrder.email}?subject=BestGrassFedCattle Order Request #${selectedOrder.reference_no}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-farm-forest text-white rounded-lg text-xs"
                  >
                    <Mail className="w-3.5 h-3.5" /> Email Customer
                  </a>
                  <a
                    href={`tel:${selectedOrder.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-farm-grass text-white rounded-lg text-xs"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Customer
                  </a>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 space-y-2">
                <h4 className="font-display font-semibold text-sm text-farm-forest dark:text-white">
                  Requested Cut
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div><strong>Product:</strong> {selectedOrder.product_name}</div>
                  <div><strong>Quantity:</strong> {selectedOrder.quantity} unit(s)</div>
                  <div><strong>Cut Preference:</strong> {selectedOrder.cut_preference || 'Standard'}</div>
                  <div><strong>Date Submitted:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                </div>

                {selectedOrder.special_instructions && (
                  <div className="pt-2 text-xs">
                    <strong>Special Instructions:</strong>
                    <p className="mt-1 p-2 bg-white dark:bg-black/20 rounded border border-gray-200 dark:border-white/10">
                      {selectedOrder.special_instructions}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Update Buttons */}
              <div>
                <label className="block text-xs font-semibold mb-2">Update Request Status</label>
                <div className="flex flex-wrap gap-2">
                  {['new', 'reviewing', 'contacted', 'confirmed', 'completed', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={updating}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                        selectedOrder.status === st
                          ? 'bg-farm-forest text-white shadow'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-xs font-semibold mb-1">Internal Admin Notes (Private)</label>
                <textarea
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record customer communication notes, freezer bag batch #, custom harvest notes..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-farm-charcoal dark:text-white focus:outline-none focus:ring-2 focus:ring-farm-grass"
                ></textarea>
                <button
                  type="button"
                  disabled={updating}
                  onClick={handleSaveNotes}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 bg-farm-forest hover:bg-farm-grass text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Save Admin Notes
                </button>
              </div>

            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-white/10 text-right">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
