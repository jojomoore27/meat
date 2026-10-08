import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Package,
  FileText,
  Quote,
  Bell,
  Settings,
  ExternalLink,
  ArrowRight,
  ShoppingBag,
  Building2,
  CheckCircle2,
  Clock,
  Eye,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getDashboardStats();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-24">
        <div className="w-10 h-10 border-4 border-farm-grass border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-gray-500">Aggregating farm statistics...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const recentWholesale = data?.recentWholesale || [];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#151c17] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
        <div>
          <h1 className="font-display font-bold text-2xl text-farm-forest dark:text-white">
            Farm Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Central command for your beef products catalog, site content, reviews, and notification channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors shadow"
          >
            Manage Products
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 text-farm-charcoal dark:text-gray-200 text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors flex items-center gap-1.5"
          >
            <span>View Frontend Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Primary Modules KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Products Catalog Card */}
        <Link
          to="/admin/products"
          className="p-5 rounded-2xl bg-white dark:bg-[#151c17] border border-gray-200 dark:border-white/10 shadow-sm hover:border-farm-grass transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Products Catalog</span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-farm-forest dark:text-white">
                {stats.publishedProducts || 0}
              </span>
              <span className="text-xs text-gray-400">published / {stats.totalProducts || 0} total</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Manage cuts, pricing, inventory & photos</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-[11px] text-purple-600 font-semibold flex items-center gap-1">
            <span>Open Products Catalog</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* CMS & Site Content Card */}
        <Link
          to="/admin/cms"
          className="p-5 rounded-2xl bg-white dark:bg-[#151c17] border border-gray-200 dark:border-white/10 shadow-sm hover:border-farm-grass transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">CMS & Site Content</span>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-farm-forest dark:text-white">
                Homepage & Story
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Hero headlines, trust badges & ranch copy</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-[11px] text-blue-600 font-semibold flex items-center gap-1">
            <span>Edit Site Content</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Testimonials Card */}
        <Link
          to="/admin/testimonials"
          className="p-5 rounded-2xl bg-white dark:bg-[#151c17] border border-gray-200 dark:border-white/10 shadow-sm hover:border-farm-grass transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Testimonials</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Quote className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-farm-forest dark:text-white">
                {stats.totalTestimonials || 0}
              </span>
              <span className="text-xs text-gray-400">client reviews</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Customer quotes, culinary feedback & ratings</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-[11px] text-amber-600 font-semibold flex items-center gap-1">
            <span>Manage Testimonials</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Notification Channels Card */}
        <Link
          to="/admin/notifications"
          className="p-5 rounded-2xl bg-white dark:bg-[#151c17] border border-gray-200 dark:border-white/10 shadow-sm hover:border-farm-grass transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Notification Channels</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-farm-forest dark:text-white">
                WhatsApp & Email
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Instant order alerts & customer notification routing</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span>Configure Channels</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* Site Settings Card */}
        <Link
          to="/admin/settings"
          className="p-5 rounded-2xl bg-white dark:bg-[#151c17] border border-gray-200 dark:border-white/10 shadow-sm hover:border-farm-grass transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Site Settings</span>
              <div className="w-10 h-10 rounded-xl bg-stone-500/10 text-stone-600 dark:text-stone-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-farm-forest dark:text-white">
                Brand & Security
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Phone (+13052132655), email, hours & passwords</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-[11px] text-stone-600 dark:text-stone-300 font-semibold flex items-center gap-1">
            <span>Update Site Settings</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* View Frontend Site Card */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="p-5 rounded-2xl bg-white dark:bg-[#151c17] border border-gray-200 dark:border-white/10 shadow-sm hover:border-farm-grass transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Public Front</span>
              <div className="w-10 h-10 rounded-xl bg-farm-forest/10 text-farm-forest dark:text-farm-sand flex items-center justify-center group-hover:scale-110 transition-transform">
                <ExternalLink className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-display font-bold text-farm-forest dark:text-white">
                Live Farm Site
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Open public storefront and verify customer experience</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 text-[11px] text-farm-grass font-semibold flex items-center gap-1">
            <span>View Frontend Site</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </a>

      </div>

      {/* Recent Orders Section */}
      <div className="bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-farm-grass" />
            <h3 className="font-display font-bold text-base text-farm-forest dark:text-white">
              Recent Customer Order Requests
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-farm-cream dark:bg-white/10 text-farm-forest dark:text-farm-sand">
            {stats.totalOrders || 0} Total Requests
          </span>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No order requests received yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-semibold border-b border-gray-100 dark:border-white/10">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product Cut</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Contact Via</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-bold text-farm-forest dark:text-farm-sand">
                      #{ord.reference_no}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-farm-charcoal dark:text-white">{ord.customer_name}</div>
                      <div className="text-[11px] text-gray-400">{ord.email}</div>
                    </td>
                    <td className="p-4 font-medium text-farm-charcoal dark:text-gray-200">
                      {ord.product_name}
                    </td>
                    <td className="p-4">{ord.quantity}x</td>
                    <td className="p-4 uppercase text-[10px] font-bold text-gray-500">{ord.contact_preference}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        ord.status === 'new' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                        ord.status === 'contacted' ? 'bg-blue-100 text-blue-700' :
                        ord.status === 'confirmed' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder({ type: 'order', data: ord })}
                        className="px-3 py-1 bg-farm-cream dark:bg-white/10 text-farm-forest dark:text-white rounded-lg hover:bg-farm-grass hover:text-white transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Wholesale Section */}
      <div className="bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-display font-bold text-base text-farm-forest dark:text-white">
              Recent Wholesale B2B Inquiries
            </h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
            {stats.totalWholesale || 0} Total Inquiries
          </span>
        </div>

        {recentWholesale.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No wholesale inquiries received yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-semibold border-b border-gray-100 dark:border-white/10">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Products</th>
                  <th className="p-4">Volume</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {recentWholesale.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-mono font-bold text-blue-600">
                      #{w.reference_no}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-farm-charcoal dark:text-white">{w.company_name}</div>
                      <div className="text-[11px] text-gray-400 capitalize">{w.business_type}</div>
                    </td>
                    <td className="p-4">{w.full_name}</td>
                    <td className="p-4 font-medium text-farm-charcoal dark:text-gray-200">{w.products_interested}</td>
                    <td className="p-4">{w.estimated_quantity}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                        {w.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder({ type: 'wholesale', data: w })}
                        className="px-3 py-1 bg-farm-cream dark:bg-white/10 text-farm-forest dark:text-white rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedOrder && (
        <div className="fixed inset-y-0 inset-x-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#151c17] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div>
                <span className="text-[10px] font-mono font-bold text-farm-grass block">
                  #{selectedOrder.data.reference_no}
                </span>
                <h3 className="font-display font-bold text-lg text-farm-forest dark:text-white">
                  {selectedOrder.type === 'order' ? 'Customer Order Request' : 'Wholesale Lead'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedOrder.type === 'order' ? (
                <>
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Customer:</span>
                      <span className="font-bold text-farm-charcoal dark:text-white">{selectedOrder.data.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-mono text-farm-forest dark:text-farm-sand">{selectedOrder.data.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span>{selectedOrder.data.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Product Cut:</span>
                      <span className="font-bold text-farm-forest dark:text-farm-sand">{selectedOrder.data.product_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity:</span>
                      <span className="font-bold">{selectedOrder.data.quantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact Preference:</span>
                      <span className="uppercase font-semibold">{selectedOrder.data.contact_preference}</span>
                    </div>
                  </div>

                  {selectedOrder.data.notes && (
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                      <span className="text-gray-500 block mb-1">Customer Note:</span>
                      <p className="text-farm-charcoal dark:text-gray-300 italic">"{selectedOrder.data.notes}"</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Company:</span>
                      <span className="font-bold text-farm-charcoal dark:text-white">{selectedOrder.data.company_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Contact:</span>
                      <span>{selectedOrder.data.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-mono">{selectedOrder.data.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span>{selectedOrder.data.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Products Interested:</span>
                      <span className="font-bold">{selectedOrder.data.products_interested}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estimated Volume:</span>
                      <span>{selectedOrder.data.estimated_quantity}</span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-gray-500 font-medium">Update Status:</span>
                <div className="flex items-center gap-1.5">
                  {['new', 'contacted', 'confirmed'].map((st) => (
                    <button
                      key={st}
                      onClick={async () => {
                        try {
                          if (selectedOrder.type === 'order') {
                            await api.updateAdminOrder(selectedOrder.data.id, { status: st });
                            setData(prev => ({
                              ...prev,
                              recentOrders: prev.recentOrders.map(o => o.id === selectedOrder.data.id ? { ...o, status: st } : o)
                            }));
                          } else {
                            await api.updateAdminWholesale(selectedOrder.data.id, { status: st });
                            setData(prev => ({
                              ...prev,
                              recentWholesale: prev.recentWholesale.map(w => w.id === selectedOrder.data.id ? { ...w, status: st } : w)
                            }));
                          }
                          setSelectedOrder(prev => ({
                            ...prev,
                            data: { ...prev.data, status: st }
                          }));
                        } catch (err) {
                          alert(err.message);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                        selectedOrder.data.status === st
                          ? 'bg-farm-forest text-white shadow-sm'
                          : 'bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-farm-forest'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 text-farm-charcoal dark:text-gray-200 text-xs font-semibold rounded-xl"
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
