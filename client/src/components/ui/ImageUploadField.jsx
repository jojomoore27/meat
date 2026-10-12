import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle2, AlertCircle, Link2 } from 'lucide-react';
import { api } from '../../services/api';
import { resolveImageUrl } from '../../utils/apiUrl';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/media';

export default function ImageUploadField({
  label = 'Main Image *',
  value = '',
  onChange,
  required = false,
  helperText = 'Upload a direct picture from your device (PNG, JPG, WebP) or paste an image URL.',
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    // Validate size (15MB max for modern phone cameras)
    if (file.size > 15 * 1024 * 1024) {
      setError('Selected image is too large. Maximum allowed size is 15MB.');
      return;
    }

    // Validate type (by mime or extension, supporting mobile cameras and HEIC)
    const isImage = (file.type && file.type.startsWith('image/')) ||
      /\.(jpe?g|png|webp|gif|avif|heic|heif|bmp|svg)$/i.test(file.name);
    if (!isImage) {
      setError('Please select a valid image file (JPEG, PNG, WebP, GIF, AVIF, HEIC).');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const res = await api.uploadMedia(file);
      if (res.success && res.url) {
        onChange(res.url);
      } else {
        throw new Error(res.error || 'Failed to upload image.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = async () => {
    const urlToDelete = value;
    onChange('');
    if (urlToDelete && (urlToDelete.includes('/uploads/') || urlToDelete.includes('/storage/v1/object/public/media/'))) {
      try {
        await api.deleteMediaByUrl(urlToDelete);
      } catch (err) {
        console.warn('Could not permanently remove media file:', err);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-farm-forest dark:text-white">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-farm-grass hover:text-farm-forest dark:hover:text-farm-sand flex items-center gap-1 font-medium transition-colors"
        >
          <Link2 className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL field' : 'Enter image URL manually'}</span>
        </button>
      </div>

      {/* Hidden file input supporting mobile camera, gallery, and desktop */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,image/png,image/jpeg,image/jpg,image/webp,image/gif,image/avif,image/heic,image/heif"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {/* Preview Box & Upload Controls */}
      {value ? (
        <div className="p-3 bg-gray-50 dark:bg-[#1a221d] rounded-2xl border border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center gap-4">
          {/* Image Thumbnail */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-200 dark:bg-black/30 border border-farm-sand/30 shadow-sm flex-shrink-0 group">
            <img
              src={resolveImageUrl(value)}
              alt="Uploaded Preview"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          {/* Info & Action Buttons */}
          <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                {value.includes('supabase.co') ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-300 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Supabase Cloud Storage (CDN)
                  </span>
                ) : value.includes('/uploads/') ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-semibold border border-amber-300 dark:border-amber-800">
                    Local Storage (Create 'media' bucket in Supabase)
                  </span>
                ) : (
                  <span className="text-xs font-medium text-farm-forest dark:text-white">Custom Image URL</span>
                )}
              </div>
              <div className="text-[11px] text-gray-500 font-mono truncate max-w-xs sm:max-w-md mt-1">
                {value}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-farm-forest hover:bg-farm-grass text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change Picture</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Drag & Drop Area */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-2 ${
            dragActive
              ? 'border-farm-grass bg-farm-grass/10 scale-[0.99]'
              : 'border-gray-300 dark:border-white/15 bg-gray-50/70 dark:bg-[#1a221d]/70 hover:border-farm-grass hover:bg-farm-cream/40 dark:hover:bg-white/5'
          }`}
        >
          {uploading ? (
            <div className="py-4 space-y-2">
              <Loader2 className="w-8 h-8 text-farm-grass animate-spin mx-auto" />
              <p className="text-xs font-semibold text-farm-forest dark:text-white">
                Uploading picture from your device...
              </p>
              <p className="text-[11px] text-gray-500">Please wait a moment</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-farm-grass/15 text-farm-grass flex items-center justify-center mb-1 shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-farm-forest dark:text-white">
                Click to upload picture from device <span className="text-gray-400 font-normal">or drag & drop</span>
              </p>
              <p className="text-[11px] text-gray-500">
                Supports PNG, JPG, JPEG, WebP, GIF (Max 10MB)
              </p>
            </>
          )}
        </div>
      )}

      {/* Manual URL Input Option */}
      {showUrlInput && (
        <div className="pt-1">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or enter direct image URL: https://... or /uploads/..."
            className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1a221d] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 pt-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper Text */}
      {!error && helperText && !value && (
        <p className="text-[11px] text-gray-500 leading-normal">
          {helperText}
        </p>
      )}

      {/* Hidden input to satisfy form required check if needed */}
      {required && (
        <input
          type="text"
          value={value}
          required
          onChange={() => {}}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
