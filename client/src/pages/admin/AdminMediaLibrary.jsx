import React, { useState, useEffect } from 'react';
import { getApiUrl, resolveImageUrl } from '../../utils/apiUrl';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/media';
import { api } from '../../services/api';
import { Upload, Trash2, Copy, Check, FileImage, Loader2 } from 'lucide-react';

export default function AdminMediaLibrary() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const res = await api.getMediaLibrary();
      if (res.media) setMedia(res.media);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('bgc_admin_token');
      const response = await fetch(getApiUrl('/api/media/upload'), {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        loadMedia();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = (url, id) => {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete image asset?')) return;
    try {
      await api.deleteMedia(id);
      setMedia(media.filter(m => m.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-farm-forest dark:text-white">
            Media Asset Library
          </h1>
          <p className="text-xs text-gray-500">Upload high-res cut photography and copy URLs for products and CMS.</p>
        </div>

        <div>
          <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer transition-colors shadow-md">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading File...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> Upload New Image
              </>
            )}
            <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-[#151c17] p-6 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading media library...</div>
        ) : media.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">
            <FileImage className="w-10 h-10 text-farm-sand mx-auto mb-2" />
            No uploaded media yet. Upload your first photograph above.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((item) => (
              <div key={item.id} className="group relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 aspect-square bg-gray-50 dark:bg-black/20">
                <img
                  src={resolveImageUrl(item.file_url)}
                  alt={item.file_name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 bg-red-600/90 text-white rounded hover:bg-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <span className="text-[10px] text-white block truncate mb-1">{item.file_name}</span>
                    <button
                      onClick={() => handleCopyUrl(resolveImageUrl(item.file_url), item.id)}
                      className="w-full py-1 bg-white/20 hover:bg-white/40 text-white rounded text-[10px] font-semibold flex items-center justify-center gap-1"
                    >
                      {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === item.id ? 'Copied URL!' : 'Copy URL'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
