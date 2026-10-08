import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Award,
  ChevronDown,
  Quote,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { api } from '../../services/api';
import { getWhatsAppOrderUrl } from '../../utils/whatsapp';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [cmsData, setCmsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [prodRes, faqRes, testRes, cmsRes] = await Promise.allSettled([
          api.getProducts({ featured: 'true' }),
          api.getFaqs(),
          api.getTestimonials(),
          api.getCms()
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value.products) {
          setProducts(prodRes.value.products);
        }
        if (faqRes.status === 'fulfilled' && faqRes.value.faqs) {
          setFaqs(faqRes.value.faqs);
        }
        if (testRes.status === 'fulfilled' && testRes.value.testimonials) {
          setTestimonials(testRes.value.testimonials);
        }
        if (cmsRes.status === 'fulfilled') {
          setCmsData(cmsRes.value);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, []);

  const handleOpenOrder = (product) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
  };

  const heroContent = cmsData?.sections?.home_hero || {
    headline: 'Premium Grass-Fed Beef, Raised With Purpose.',
    subheadline: 'Quality beef from carefully raised cattle in New York, presented with the care and standards customers expect from a premium American beef brand.',
    ctaPrimaryText: 'Explore Our Beef',
    ctaSecondaryText: 'Order Beef',
    heroImage: '/images/hero_cattle_pasture.jpg'
  };

  const trustContent = cmsData?.sections?.home_trust || {
    badge1_title: '100% Grass-Fed Focus',
    badge1_desc: 'Rotational grazing on pristine New York clover and rye pastures.',
    badge2_title: 'Carefully Selected Beef',
    badge2_desc: 'Meticulously dry-aged and hand-trimmed artisanal cuts.',
    badge3_title: 'Direct Farm Relationship',
    badge3_desc: 'Zero retail middlemen; personal consultation on every cut.',
    badge4_title: 'Pasture Raised & Honest',
    badge4_desc: 'Rotational heritage grazing with full cut traceability.'
  };

  return (
    <div className="space-y-24 sm:space-y-32">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Warm Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroContent.heroImage || '/images/hero_cattle_pasture.jpg'}
            alt="Cattle grazing in New York pastures"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/hero_cattle_pasture.jpg';
            }}
            className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.05] transform scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-farm-forestDark via-farm-forestDark/40 to-transparent"></div>
          <div className="absolute inset-0 bg-black/25"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-farm-sand text-xs sm:text-sm font-semibold tracking-wider uppercase mb-6 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-farm-sand" />
            Ethically Raised in New York, United States
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-md">
            {heroContent.headline}
          </h1>

          <p className="text-base sm:text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light drop-shadow">
            {heroContent.subheadline}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-4 bg-farm-grass hover:bg-farm-grassLight text-white font-semibold rounded-xl text-sm sm:text-base uppercase tracking-wider transition-all duration-200 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 group"
            >
              <span>{heroContent.ctaPrimaryText}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold rounded-xl text-sm sm:text-base uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-farm-sand" />
              <span>{heroContent.ctaSecondaryText}</span>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-farm-sandLight">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Grass-Fed & Finished</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Grain or Feedlots</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Direct Farm Relationship</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 shadow-premium hover:border-farm-grass/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-farm-forest/10 dark:bg-farm-grass/20 text-farm-grass dark:text-farm-sand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg text-farm-forest dark:text-white mb-2">
              {trustContent.badge1_title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {trustContent.badge1_desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 shadow-premium hover:border-farm-grass/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-farm-forest/10 dark:bg-farm-grass/20 text-farm-grass dark:text-farm-sand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg text-farm-forest dark:text-white mb-2">
              {trustContent.badge2_title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {trustContent.badge2_desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 shadow-premium hover:border-farm-grass/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-farm-forest/10 dark:bg-farm-grass/20 text-farm-grass dark:text-farm-sand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg text-farm-forest dark:text-white mb-2">
              {trustContent.badge3_title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {trustContent.badge3_desc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 shadow-premium hover:border-farm-grass/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-farm-forest/10 dark:bg-farm-grass/20 text-farm-grass dark:text-farm-sand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-display font-semibold text-lg text-farm-forest dark:text-white mb-2">
              {trustContent.badge4_title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {trustContent.badge4_desc}
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-farm-grass dark:text-farm-sand">
              Authentic American Cattle
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-farm-forest dark:text-white mt-1">
              Featured Beef Cuts
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2 max-w-xl">
              Hand-trimmed, dry-aged pasture cuts. Browse our current stock and submit an order request directly to our butcher.
            </p>
          </div>

          <Link
            to="/products"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-farm-grass dark:text-farm-sand font-semibold hover:underline"
          >
            <span>View All Cuts & Packages</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-[#151c17] rounded-2xl border border-farm-sand/40 dark:border-white/5 overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col group"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-black/20">
                <img
                  src={product.main_image || '/images/artisanal_ribeye_steak.jpg'}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/artisanal_ribeye_steak.jpg';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="px-2.5 py-1 bg-farm-forest/90 backdrop-blur-md text-white text-[11px] font-semibold rounded-lg uppercase tracking-wider">
                    {product.category_name || 'Premium Beef'}
                  </span>
                  {Boolean(product.is_featured) && (
                    <span className="px-2.5 py-1 bg-farm-grass/90 backdrop-blur-md text-farm-sand text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      ★ Farm Favorite
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/95 dark:bg-black/90 backdrop-blur-md rounded-lg shadow-sm">
                  <span className="text-sm font-bold text-farm-forest dark:text-farm-sand font-display">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-gray-500 font-normal"> / unit</span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-mono text-farm-grass mb-1">{product.sku}</div>
                  <h3 className="font-display font-semibold text-lg text-farm-forest dark:text-white line-clamp-1 group-hover:text-farm-grass transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {product.short_description}
                  </p>
                </div>

                {/* ORDER THIS ITEM BUTTON - Direct to WhatsApp */}
                <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5 space-y-2">
                  <a
                    href={getWhatsAppOrderUrl(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold rounded-xl uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 transform active:scale-98"
                  >
                    <ShoppingBag className="w-4 h-4 text-farm-sand" />
                    <span>Order This Item</span>
                  </a>

                  <Link
                    to={`/products/${product.slug}`}
                    className="block text-center text-xs text-gray-500 hover:text-farm-forest dark:hover:text-white transition-colors"
                  >
                    View Details &rarr;
                  </Link>
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. THE GRASS-FED DIFFERENCE STORY */}
      <section className="bg-farm-cream dark:bg-farm-forest/10 py-20 border-y border-farm-sand/30 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-farm-grass dark:text-farm-sand">
                The Heritage Difference
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-farm-forest dark:text-white leading-tight">
                Raised on New York Pastures, As Nature Intended.
              </h2>
              <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-light">
                Industrial beef is fattened quickly on feedlots with grain, corn silage, and growth accelerators. At BestGrassFedCattle, our cattle roam freely on lush Upstate New York grasslands, grazing a diverse rotational diet of clover, orchard grass, and timothy.
              </p>
              
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-farm-grass/15 text-farm-grass flex items-center justify-center mt-0.5 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-farm-forest dark:text-white text-sm">Natural Nutritional Profile:</strong>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">Significantly higher in Omega-3 fatty acids, CLA, and Vitamin E.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-farm-grass/15 text-farm-grass flex items-center justify-center mt-0.5 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-farm-forest dark:text-white text-sm">Traditional Dry Aging:</strong>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">Aged 14 to 21 days for intensified umami and supreme tenderness.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-farm-grass/15 text-farm-grass flex items-center justify-center mt-0.5 flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-farm-forest dark:text-white text-sm">Direct From Our Pastures:</strong>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">No grocery middlemen or industrialized cold-chain delays.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/our-farm"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-farm-forest hover:bg-farm-grass text-white font-medium rounded-xl text-sm transition-all shadow-md"
                >
                  <span>Learn About Our Farm & Grazing</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Collage Showcase */}
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#151c17]">
                <img
                  src="/images/farmer_cattle_field.jpg"
                  alt="American cattle farmer with grazing herd in New York"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/hero_cattle_pasture.jpg';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block absolute -bottom-8 -left-8 w-48 h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-[#151c17]">
                <img
                  src="/images/artisanal_ribeye_steak.jpg"
                  alt="Artisanal dry aged ribeye"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/images/farmer_cattle_field.jpg';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold uppercase tracking-widest text-farm-grass dark:text-farm-sand">
              Verified Feedback
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-farm-forest dark:text-white mt-1">
              Words From Chefs & Household Tables
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-8 rounded-2xl bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 shadow-premium flex flex-col justify-between relative overflow-hidden"
              >
                <Quote className="w-12 h-12 text-farm-grass/10 absolute top-4 right-4 pointer-events-none" />
                <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed italic mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                  {t.photo_url ? (
                    <img
                      src={t.photo_url}
                      alt={t.customer_name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="w-11 h-11 rounded-full object-cover shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-farm-grass/20 text-farm-grass flex items-center justify-center font-bold">
                      {t.customer_name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-display font-semibold text-sm text-farm-forest dark:text-white">
                      {t.customer_name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t.customer_role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. DIRECT FARM INQUIRIES & SPECIAL CUTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-earth-gradient text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="px-3.5 py-1 bg-white/10 rounded-full text-xs font-semibold text-farm-sand tracking-wider uppercase inline-block">
              Direct Farm Relationship
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              Have Questions or Special Cut Requests?
            </h2>
            <p className="text-gray-200 text-sm sm:text-base leading-relaxed font-light">
              We work directly with families, private chefs, and culinary enthusiasts. Request custom specifications or connect with our farm staff directly for personalized guidance.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="px-8 py-3.5 bg-white text-farm-forest font-semibold rounded-xl text-sm uppercase tracking-wider hover:bg-farm-cream transition-all shadow-md text-center"
              >
                Explore Beef Cuts
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-xl text-sm uppercase tracking-wider transition-all text-center"
              >
                Speak With Our Farm Staff
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQS ACCORDION */}
      {faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-farm-grass dark:text-farm-sand">
              Frequently Asked Questions
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-farm-forest dark:text-white mt-1">
              Common Questions About Ordering
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-display font-semibold text-base sm:text-lg text-farm-forest dark:text-white"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-farm-grass transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-white/5">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* End of Featured Cuts */}

    </div>
  );
}
