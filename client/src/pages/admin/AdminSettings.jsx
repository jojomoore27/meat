import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../../utils/apiUrl';
import { api } from '../../services/api';
import { Settings, Lock, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteSettings, setSiteSettings] = useState({
    business_name: '',
    tagline: '',
    location: '',
    currency: 'USD ($)',
    contact_email: '',
    contact_phone: '',
    address: '',
    brand_description: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await api.getCms();
        if (res.settings) {
          setSiteSettings(res.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSaveSiteSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await api.updateSiteSettings(siteSettings);
      setFeedback({ type: 'success', message: 'Site details updated successfully!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('bgc_admin_token');
      const res = await fetch(getApiUrl('/api/auth/password'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password');
      }

      setFeedback({ type: 'success', message: 'Admin password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-farm-forest dark:text-white">
          General Site & Security Settings
        </h1>
        <p className="text-xs text-gray-500">Update business branding, public contact details, and admin security.</p>
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

      {/* Business Details Form */}
      <form onSubmit={handleSaveSiteSettings} className="bg-white dark:bg-[#151c17] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-base text-farm-forest dark:text-white pb-3 border-b border-gray-100 dark:border-white/10">
          Farm Business Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Business Name</label>
            <input
              type="text"
              value={siteSettings.business_name}
              onChange={(e) => setSiteSettings({ ...siteSettings, business_name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Tagline</label>
            <input
              type="text"
              value={siteSettings.tagline}
              onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Farm Location</label>
            <input
              type="text"
              value={siteSettings.location}
              onChange={(e) => setSiteSettings({ ...siteSettings, location: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Currency Symbol</label>
            <input
              type="text"
              value={siteSettings.currency}
              onChange={(e) => setSiteSettings({ ...siteSettings, currency: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Public Contact Email</label>
            <input
              type="email"
              value={siteSettings.contact_email}
              onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Public Contact Telephone</label>
            <input
              type="text"
              value={siteSettings.contact_phone}
              onChange={(e) => setSiteSettings({ ...siteSettings, contact_phone: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
            />
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors shadow"
          >
            Save Site Information
          </button>
        </div>
      </form>

      {/* Admin Password Change Form */}
      <form onSubmit={handlePasswordChange} className="bg-white dark:bg-[#151c17] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-base text-farm-forest dark:text-white pb-3 border-b border-gray-100 dark:border-white/10 flex items-center gap-2">
          <Lock className="w-4 h-4 text-farm-grass" />
          <span>Change Administrator Password</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">New Password (Min 8 chars) *</label>
            <input
              type="password"
              required
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              placeholder="••••••••••••"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
            />
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors shadow"
          >
            Update Password
          </button>
        </div>
      </form>

    </div>
  );
}
