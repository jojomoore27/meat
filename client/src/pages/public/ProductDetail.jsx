import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, ShieldCheck, CheckCircle2, Share2, Flame, Award } from 'lucide-react';
import { api } from '../../services/api';
import { getWhatsAppOrderUrl } from '../../utils/whatsapp';
import { resolveImageUrl } from '../../utils/apiUrl';
import { DEFAULT_PRODUCT_IMAGE } from '../../constants/media';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState('');
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await api.getProduct(slug);
        if (res.product) {
          setProduct(res.product);
          setActiveImage(res.product.main_image);
        }
      } catch (err) {
        setError('Product cut not found or unavailable.');
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-4 border-farm-grass border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading product cut details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-display font-bold text-farm-forest dark:text-white mb-3">
          Cut Not Found
        </h2>
        <p className="text-gray-500 mb-6">{error || 'This beef cut is not currently available.'}</p>
        <Link
          to="/products"
          className="px-6 py-3 bg-farm-forest hover:bg-farm-grass text-white font-medium rounded-xl text-sm"
        >
          Return to All Cuts
        </Link>
      </div>
    );
  }

  const allImages = [product.main_image, ...(product.additional_images || [])].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Breadcrumb / Back Link */}
      <div className="mb-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-farm-forest dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Beef Cuts</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* Gallery / Images Column */}
        <div className="space-y-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 shadow-2xl">
            <img
              src={resolveImageUrl(activeImage) || DEFAULT_PRODUCT_IMAGE}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
              }}
              className="w-full h-full object-cover transition-all duration-300"
            />
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === img ? 'border-farm-grass scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={resolveImageUrl(img)}
                    alt={`Angle ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Column */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-farm-forest/10 dark:bg-farm-grass/20 text-farm-forest dark:text-farm-sand text-xs font-semibold rounded-lg uppercase tracking-wider">
                {product.category_name || 'Artisanal Beef'}
              </span>
              <span className="text-xs font-mono text-gray-400">SKU: {product.sku}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl font-bold text-farm-forest dark:text-white">
              {product.name}
            </h1>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-farm-earth">
                ${Number(product.price).toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 font-normal">USD / unit estimate</span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-light">
            {product.full_description || product.short_description}
          </p>

          {/* ORDER THIS ITEM BUTTON - Direct to WhatsApp */}
          <div className="pt-4 space-y-3">
            <a
              href={getWhatsAppOrderUrl(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 bg-farm-forest hover:bg-farm-grass text-white font-semibold rounded-xl text-base uppercase tracking-wider transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 transform active:scale-98"
            >
              <ShoppingBag className="w-5 h-5 text-farm-sand" />
              <span>Order This Item</span>
            </a>

            {/* Direct Farm Notice */}
            <div className="p-3.5 bg-farm-cream dark:bg-farm-forest/20 rounded-xl border border-farm-sand/40 dark:border-farm-forest flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-300">
              <ShieldCheck className="w-4 h-4 text-farm-grass flex-shrink-0 mt-0.5" />
              <span>
                <strong>Direct WhatsApp Ordering:</strong> BestGrassFedCattle coordinates all fulfillment directly via WhatsApp (+1 305 213 2655). Clicking "Order This Item" immediately connects you with our farm team to confirm current cut availability and delivery details.
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Detail View End */}

    </div>
  );
}
