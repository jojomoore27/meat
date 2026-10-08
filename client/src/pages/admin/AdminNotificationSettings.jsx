import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Bell,
  Send,
  Mail,
  MessageSquare,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Radio,
  Clock,
  History
} from 'lucide-react';

export default function AdminNotificationSettings() {
  const [settings, setSettings] = useState({
    admin_dashboard_enabled: true,
    email_enabled: false,
    email_recipient: 'grassfed@gmail.com',
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_secure: false,
    telegram_enabled: false,
    telegram_bot_token: '',
    telegram_chat_id: '',
    whatsapp_enabled: false,
    whatsapp_phone_id: '',
    whatsapp_access_token: '',
    whatsapp_recipient_phone: '',
    livechat_enabled: false,
    livechat_webhook_url: '',
  });

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingChannel, setTestingChannel] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [setRes, logRes] = await Promise.all([
        api.getNotificationSettings(),
        api.getNotificationLogs()
      ]);
      if (setRes.settings) setSettings(setRes.settings);
      if (logRes.logs) setLogs(logRes.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await api.updateNotificationSettings(settings);
      if (res.settings) setSettings(res.settings);
      setFeedback({ type: 'success', message: 'Notification settings saved successfully!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestChannel = async (channel) => {
    setTestingChannel(channel);
    setFeedback(null);
    try {
      const res = await api.testNotification(channel);
      setFeedback({ type: 'success', message: res.message || `Test message dispatched to ${channel}!` });
      // Reload logs
      const logRes = await api.getNotificationLogs();
      if (logRes.logs) setLogs(logRes.logs);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || `Test failed for ${channel}` });
    } finally {
      setTestingChannel(null);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-400">Loading communication settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-farm-forest dark:text-white">
          Multi-Channel Communication & Notifications
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Configure where customer order requests and wholesale inquiries are instantly dispatched.
        </p>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300'
            : 'bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-700 dark:text-red-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* 1. Dashboard Notifications */}
        <div className="p-6 bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-farm-forest/10 text-farm-forest dark:text-farm-sand flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-farm-forest dark:text-white">
                  Admin Dashboard Notifications
                </h3>
                <p className="text-xs text-gray-500">Record in-app bell counter and dashboard alerts for new requests.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.admin_dashboard_enabled}
                onChange={(e) => setSettings({ ...settings, admin_dashboard_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-farm-forest"></div>
            </label>
          </div>
        </div>

        {/* 2. Telegram Bot Notifications */}
        <div className="p-6 bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-farm-forest dark:text-white">
                  Telegram Bot Channel
                </h3>
                <p className="text-xs text-gray-500">Receive instant push notifications with cut details on Telegram.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.telegram_enabled}
                onChange={(e) => setSettings({ ...settings, telegram_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.telegram_enabled && (
            <div className="pt-3 border-t border-gray-100 dark:border-white/5 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Telegram Bot Token</label>
                  <input
                    type="password"
                    value={settings.telegram_bot_token || ''}
                    onChange={(e) => setSettings({ ...settings, telegram_bot_token: e.target.value })}
                    placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Telegram Chat ID</label>
                  <input
                    type="text"
                    value={settings.telegram_chat_id || ''}
                    onChange={(e) => setSettings({ ...settings, telegram_chat_id: e.target.value })}
                    placeholder="e.g. 987654321 or -100123456789"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={testingChannel === 'telegram'}
                  onClick={() => handleTestChannel('telegram')}
                  className="px-3.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {testingChannel === 'telegram' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Test Telegram Ping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. SMTP Email Notifications */}
        <div className="p-6 bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-farm-grass/10 text-farm-grass flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-farm-forest dark:text-white">
                  SMTP Email Notifications
                </h3>
                <p className="text-xs text-gray-500">Dispatch formatted HTML emails directly to your farm inbox.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.email_enabled}
                onChange={(e) => setSettings({ ...settings, email_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-farm-grass"></div>
            </label>
          </div>

          {settings.email_enabled && (
            <div className="pt-3 border-t border-gray-100 dark:border-white/5 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Recipient Email</label>
                  <input
                    type="email"
                    value={settings.email_recipient || ''}
                    onChange={(e) => setSettings({ ...settings, email_recipient: e.target.value })}
                    placeholder="grassfed@gmail.com"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.smtp_host || ''}
                    onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                    placeholder="smtp.example.com"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">SMTP Port</label>
                  <input
                    type="number"
                    value={settings.smtp_port || 587}
                    onChange={(e) => setSettings({ ...settings, smtp_port: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">SMTP User / Username</label>
                  <input
                    type="text"
                    value={settings.smtp_user || ''}
                    onChange={(e) => setSettings({ ...settings, smtp_user: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">SMTP Password</label>
                  <input
                    type="password"
                    value={settings.smtp_password || ''}
                    onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={testingChannel === 'email'}
                  onClick={() => handleTestChannel('email')}
                  className="px-3.5 py-1.5 bg-farm-cream text-farm-forest hover:bg-farm-grass hover:text-white dark:bg-white/10 dark:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {testingChannel === 'email' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  Test Email Dispatch
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. WhatsApp Integration */}
        <div className="p-6 bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-farm-forest dark:text-white">
                  WhatsApp Cloud API
                </h3>
                <p className="text-xs text-gray-500">Connect official WhatsApp Business Cloud API to receive order alerts.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.whatsapp_enabled}
                onChange={(e) => setSettings({ ...settings, whatsapp_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {settings.whatsapp_enabled && (
            <div className="pt-3 border-t border-gray-100 dark:border-white/5 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Phone Number ID</label>
                  <input
                    type="text"
                    value={settings.whatsapp_phone_id || ''}
                    onChange={(e) => setSettings({ ...settings, whatsapp_phone_id: e.target.value })}
                    placeholder="Meta Phone Number ID"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Recipient Phone (+1...)</label>
                  <input
                    type="text"
                    value={settings.whatsapp_recipient_phone || ''}
                    onChange={(e) => setSettings({ ...settings, whatsapp_recipient_phone: e.target.value })}
                    placeholder="+1 (305) 213-2655"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">System Access Token</label>
                  <input
                    type="password"
                    value={settings.whatsapp_access_token || ''}
                    onChange={(e) => setSettings({ ...settings, whatsapp_access_token: e.target.value })}
                    placeholder="Meta Graph Token"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={testingChannel === 'whatsapp'}
                  onClick={() => handleTestChannel('whatsapp')}
                  className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {testingChannel === 'whatsapp' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MessageSquare className="w-3.5 h-3.5" />}
                  Test WhatsApp Ping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. LiveChat / Outgoing Webhook */}
        <div className="p-6 bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-farm-forest dark:text-white">
                  Live Chat / Outgoing Webhook
                </h3>
                <p className="text-xs text-gray-500">Forward JSON payloads to your CRM or custom chat webhook.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.livechat_enabled}
                onChange={(e) => setSettings({ ...settings, livechat_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {settings.livechat_enabled && (
            <div className="pt-3 border-t border-gray-100 dark:border-white/5 text-xs">
              <label className="block font-semibold mb-1">Webhook Endpoint URL</label>
              <input
                type="url"
                value={settings.livechat_webhook_url || ''}
                onChange={(e) => setSettings({ ...settings, livechat_webhook_url: e.target.value })}
                placeholder="https://your-crm-or-chat.com/webhook"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono"
              />
            </div>
          )}
        </div>

        {/* Save Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-farm-forest hover:bg-farm-grass text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Notification Settings
          </button>
        </div>

      </form>

      {/* Delivery Audit Logs */}
      <div className="bg-white dark:bg-[#151c17] rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden mt-8">
        <div className="p-5 border-b border-gray-100 dark:border-white/10 flex items-center gap-2">
          <History className="w-4 h-4 text-farm-grass" />
          <h3 className="font-display font-bold text-sm text-farm-forest dark:text-white">
            Recent Multi-Channel Delivery Audit Logs
          </h3>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">No delivery logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 font-semibold border-b border-gray-100 dark:border-white/10">
                <tr>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Event</th>
                  <th className="p-3.5">Reference</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Log Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {logs.slice(0, 15).map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-3.5 text-gray-400 font-mono text-[11px]">
                      {new Date(l.created_at).toLocaleTimeString()}
                    </td>
                    <td className="p-3.5 capitalize font-medium">{l.event_type.replace('_', ' ')}</td>
                    <td className="p-3.5 font-mono text-farm-forest dark:text-farm-sand">{l.reference_no || '—'}</td>
                    <td className="p-3.5 uppercase font-semibold text-[10px]">{l.channel}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        l.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                        l.status === 'skipped' ? 'bg-gray-100 text-gray-600' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-500 max-w-xs truncate text-[11px]">
                      {l.error_message || 'Delivered successfully to adapter.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
