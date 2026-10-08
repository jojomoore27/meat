import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Mail, CheckCircle2, Trash2, X, MessageSquare, Phone } from 'lucide-react';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminMessages();
      if (res.messages) setMessages(res.messages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleOpen = async (msg) => {
    setSelectedMsg(msg);
    if (!msg.is_read) {
      try {
        await api.updateAdminMessage(msg.id, { is_read: true });
        setMessages(messages.map(m => m.id === msg.id ? { ...m, is_read: 1 } : m));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.deleteAdminMessage(id);
      setMessages(messages.filter(m => m.id !== id));
      if (selectedMsg?.id === id) setSelectedMsg(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-farm-forest dark:text-white">
          Customer Messages Inbox
        </h1>
        <p className="text-xs text-gray-500">Inquiries submitted through the public Contact page.</p>
      </div>

      <div className="bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading inbox...</div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">No messages in inbox.</div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-semibold border-b border-gray-100 dark:border-white/10">
              <tr>
                <th className="p-4">Sender</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Message Snippet</th>
                <th className="p-4">Date</th>
                <th className="p-4">Read</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {messages.map((m) => (
                <tr key={m.id} className={`hover:bg-gray-50/50 dark:hover:bg-white/[0.02] ${!m.is_read ? 'font-semibold bg-farm-cream/30' : ''}`}>
                  <td className="p-4">
                    <div className="text-farm-forest dark:text-white">{m.name}</div>
                    <div className="text-[11px] text-gray-400 font-normal">{m.email}</div>
                  </td>
                  <td className="p-4 text-farm-charcoal dark:text-gray-200">{m.subject}</td>
                  <td className="p-4 text-gray-500 max-w-xs truncate">{m.message}</td>
                  <td className="p-4 text-gray-400">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    {m.is_read ? (
                      <span className="text-gray-400 text-[10px]">Read</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">New</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpen(m)}
                      className="px-3 py-1 bg-farm-cream dark:bg-white/10 rounded-lg hover:bg-farm-forest hover:text-white transition-colors"
                    >
                      Read
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedMsg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#151c17] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-lg font-display font-bold text-farm-forest dark:text-white">Message Details</h3>
              <button onClick={() => setSelectedMsg(null)} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div><strong>From:</strong> {selectedMsg.name} (<a href={`mailto:${selectedMsg.email}`} className="text-blue-600 underline">{selectedMsg.email}</a>)</div>
              {selectedMsg.phone && <div><strong>Phone:</strong> {selectedMsg.phone}</div>}
              <div><strong>Subject:</strong> {selectedMsg.subject}</div>
              <div><strong>Received:</strong> {new Date(selectedMsg.created_at).toLocaleString()}</div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs leading-relaxed whitespace-pre-wrap">
                {selectedMsg.message}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-white/10">
              <a
                href={`mailto:${selectedMsg.email}?subject=Re: ${selectedMsg.subject}`}
                className="px-4 py-2 bg-farm-forest text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" /> Reply Via Email
              </a>
              <button
                onClick={() => setSelectedMsg(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-xl text-xs font-semibold"
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
