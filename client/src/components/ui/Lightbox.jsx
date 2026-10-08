import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Lightbox({ images, currentIndex, isOpen, onClose, onPrev, onNext }) {
  if (!isOpen || !images || images.length === 0) return null;

  const current = images[currentIndex] || images[0];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev button */}
      {images.length > 1 && (
        <button
          onClick={onPrev}
          className="absolute left-6 p-3 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Main Image Container */}
      <div className="max-w-5xl max-h-[85vh] flex flex-col items-center">
        <img
          src={current.image_url || current.url || '/images/hero_cattle_pasture.jpg'}
          alt={current.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/images/hero_cattle_pasture.jpg';
          }}
          className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl"
        />
        <div className="mt-4 text-center">
          <h4 className="text-white font-display text-lg font-medium">{current.title}</h4>
          <span className="text-xs uppercase tracking-widest text-farm-sand mt-1 inline-block">
            {current.category} • {currentIndex + 1} of {images.length}
          </span>
        </div>
      </div>

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-6 p-3 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all z-10"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
