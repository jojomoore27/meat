import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Save, CheckCircle2, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react';
import ImageUploadField from '../../components/ui/ImageUploadField';

export default function AdminCms() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroData, setHeroData] = useState({
    headline: '',
    subheadline: '',
    ctaPrimaryText: '',
    ctaSecondaryText: '',
    heroImage: ''
  });
  const [trustData, setTrustData] = useState({
    badge1_title: '',
    badge1_desc: '',
    badge2_title: '',
    badge2_desc: '',
    badge3_title: '',
    badge3_desc: '',
    badge4_title: '',
    badge4_desc: ''
  });
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    async function loadCms() {
      setLoading(true);
      try {
        const res = await api.getCms();
        if (res.sections?.home_hero) {
          setHeroData(res.sections.home_hero);
        }
        if (res.sections?.home_trust) {
          setTrustData(res.sections.home_trust);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCms();
  }, []);

  const handleSaveHero = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await api.updateCmsSection({
        sectionId: 'home_hero',
        pageKey: 'home',
        sectionKey: 'hero',
        content: heroData
      });
      setSuccessMsg('Homepage Hero updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTrust = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await api.updateCmsSection({
        sectionId: 'home_trust',
        pageKey: 'home',
        sectionKey: 'trust',
        content: trustData
      });
      setSuccessMsg('Trust badges updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-gray-400">Loading CMS content...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-farm-forest dark:text-white">
          CMS & Page Content Manager
        </h1>
        <p className="text-xs text-gray-500">
          Modify live website headlines, promotional copy, and trust pillars without altering source code.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Hero Editor */}
      <form onSubmit={handleSaveHero} className="bg-white dark:bg-[#151c17] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
          <h3 className="font-display font-bold text-base text-farm-forest dark:text-white">
            Homepage Hero Section
          </h3>
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Section: home_hero</span>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Primary Headline</label>
          <input
            type="text"
            required
            value={heroData.headline}
            onChange={(e) => setHeroData({ ...heroData, headline: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Subheadline Description</label>
          <textarea
            rows="2"
            value={heroData.subheadline}
            onChange={(e) => setHeroData({ ...heroData, subheadline: e.target.value })}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-sm resize-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Primary Button Label</label>
            <input
              type="text"
              value={heroData.ctaPrimaryText}
              onChange={(e) => setHeroData({ ...heroData, ctaPrimaryText: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Secondary Button Label</label>
            <input
              type="text"
              value={heroData.ctaSecondaryText}
              onChange={(e) => setHeroData({ ...heroData, ctaSecondaryText: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs"
            />
          </div>
        </div>

        <ImageUploadField
          label="Homepage Hero Picture"
          value={heroData.heroImage}
          onChange={(url) => setHeroData({ ...heroData, heroImage: url })}
          helperText="Upload a pasture or farm picture directly from your device, or enter an image URL."
        />

        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors shadow"
          >
            Save Hero Copy
          </button>
        </div>
      </form>

      {/* Trust Badges Editor */}
      <form onSubmit={handleSaveTrust} className="bg-white dark:bg-[#151c17] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
          <h3 className="font-display font-bold text-base text-farm-forest dark:text-white">
            Trust Pillars & Guarantees
          </h3>
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Section: home_trust</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 space-y-2">
            <span className="text-xs font-bold text-farm-grass">Pillar 1</span>
            <input
              type="text"
              value={trustData.badge1_title}
              onChange={(e) => setTrustData({ ...trustData, badge1_title: e.target.value })}
              placeholder="Title"
              className="w-full px-2.5 py-1.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-xs"
            />
            <textarea
              rows="2"
              value={trustData.badge1_desc}
              onChange={(e) => setTrustData({ ...trustData, badge1_desc: e.target.value })}
              placeholder="Description"
              className="w-full px-2.5 py-1.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-xs resize-none"
            ></textarea>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 space-y-2">
            <span className="text-xs font-bold text-farm-grass">Pillar 2</span>
            <input
              type="text"
              value={trustData.badge2_title}
              onChange={(e) => setTrustData({ ...trustData, badge2_title: e.target.value })}
              placeholder="Title"
              className="w-full px-2.5 py-1.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-xs"
            />
            <textarea
              rows="2"
              value={trustData.badge2_desc}
              onChange={(e) => setTrustData({ ...trustData, badge2_desc: e.target.value })}
              placeholder="Description"
              className="w-full px-2.5 py-1.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-xs resize-none"
            ></textarea>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 space-y-2">
            <span className="text-xs font-bold text-farm-grass">Pillar 3</span>
            <input
              type="text"
              value={trustData.badge3_title}
              onChange={(e) => setTrustData({ ...trustData, badge3_title: e.target.value })}
              placeholder="Title"
              className="w-full px-2.5 py-1.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-xs"
            />
            <textarea
              rows="2"
              value={trustData.badge3_desc}
              onChange={(e) => setTrustData({ ...trustData, badge3_desc: e.target.value })}
              placeholder="Description"
              className="w-full px-2.5 py-1.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-xs resize-none"
            ></textarea>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 space-y-2">
            <span className="text-xs font-bold text-farm-grass">Pillar 4</span>
            <input
              type="text"
              value={trustData.badge4_title}
              onChange={(e) => setTrustData({ ...trustData, badge4_title: e.target.value })}
              placeholder="Title"
              className="w-full px-2.5 py-1.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-xs"
            />
            <textarea
              rows="2"
              value={trustData.badge4_desc}
              onChange={(e) => setTrustData({ ...trustData, badge4_desc: e.target.value })}
              placeholder="Description"
              className="w-full px-2.5 py-1.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg text-xs resize-none"
            ></textarea>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors shadow"
          >
            Save Trust Pillars
          </button>
        </div>
      </form>
    </div>
  );
}
