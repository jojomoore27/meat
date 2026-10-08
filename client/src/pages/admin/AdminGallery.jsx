import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import ImageUploadField from '../../components/ui/ImageUploadField';

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('farm');
  const [imageUrl, setImageUrl] = useState('');

  const loadGallery = async () => {
    setLoading(true);
    try {
      const res = await api.getGallery();
      if (res.images) setImages(res.images);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.createAdminGallery({ title, category, image_url: imageUrl });
      setModalOpen(false);
      setTitle('');
      setImageUrl('');
      loadGallery();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove photo from gallery?')) return;
    try {
      await api.deleteAdminGallery(id);
      setImages(images.filter(img => img.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-farm-forest dark:text-white">
            Photo Gallery Assets
          </h1>
          <p className="text-xs text-gray-500">Manage high-resolution imagery showcasing our pastures, cattle, and cuts.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold rounded-xl uppercase tracking-wider shadow"
        >
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading gallery...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="bg-white dark:bg-[#151c17] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-sm group">
              <div className="aspect-[4/3] overflow-hidden relative">
                <img src={img.image_url} alt={img.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider">
                  {img.category}
                </span>
                <button
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 text-white transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3">
                <h4 className="font-semibold text-xs text-farm-forest dark:text-white truncate">{img.title}</h4>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#151c17] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/10">
              <h3 className="text-lg font-display font-bold text-farm-forest dark:text-white">Add Photo to Gallery</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Angus Herd Grazing at Dawn"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl"
                >
                  <option value="cattle">Cattle</option>
                  <option value="grassland">Grassland</option>
                  <option value="beef">Beef & Cuts</option>
                  <option value="farm">Farm Pastures</option>
                  <option value="behind_scenes">Behind the Scenes</option>
                </select>
              </div>

              <ImageUploadField
                label="Gallery Picture *"
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                required={true}
                helperText="Upload a picture directly from your device or enter an image URL."
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-100 dark:bg-white/10 rounded-xl font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-farm-forest hover:bg-farm-grass text-white rounded-xl font-semibold shadow">
                  Upload Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
