import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SUPABASE_MEDIA } from '../../constants/media';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-24">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-widest text-farm-grass dark:text-farm-sand">
          Our Story & Philosophy
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-farm-forest dark:text-white mt-2 mb-4">
          Grass-Fed Beef, Raised With Integrity
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-light">
          Founded on the principle that exceptional beef begins with healthy soil, pristine water, and cattle that spend their entire lives on open Kansas pastures.
        </p>
      </div>

      {/* Hero Visual Banner */}
      <div className="rounded-3xl overflow-hidden shadow-2xl border border-farm-sand/40 dark:border-white/5 aspect-[21/9]">
        <img
          src={SUPABASE_MEDIA.strip}
          alt="Artisanal New York strip steak cuts"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Three Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 rounded-2xl bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 shadow-premium space-y-3">
          <div className="w-10 h-10 rounded-xl bg-farm-grass/15 text-farm-grass flex items-center justify-center font-bold">
            01
          </div>
          <h3 className="font-display font-semibold text-xl text-farm-forest dark:text-white">
            100% Grass-Fed & Finished
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light">
            Our cattle are never sent to industrial feedlots and never fed corn, soy, grain concentrates, or animal byproducts. They thrive naturally on seasonal grasses.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 shadow-premium space-y-3">
          <div className="w-10 h-10 rounded-xl bg-farm-grass/15 text-farm-grass flex items-center justify-center font-bold">
            02
          </div>
          <h3 className="font-display font-semibold text-xl text-farm-forest dark:text-white">
            Regenerative Pasture Care
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light">
            Through high-density rotational grazing, our herd naturally aerates and fertilizes the soil, sequestering carbon and fostering biodiversity.
          </p>
        </div>

        <div className="p-8 rounded-2xl bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 shadow-premium space-y-3">
          <div className="w-10 h-10 rounded-xl bg-farm-grass/15 text-farm-grass flex items-center justify-center font-bold">
            03
          </div>
          <h3 className="font-display font-semibold text-xl text-farm-forest dark:text-white">
            Direct Personal Relationship
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light">
            We avoid anonymous grocery chains and impersonal checkout bots. We personally discuss every order with our customers to ensure complete satisfaction.
          </p>
        </div>
      </div>

      {/* Heritage Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-farm-cream dark:bg-farm-forest/10 p-8 sm:p-12 rounded-3xl border border-farm-sand/40 dark:border-white/5">
        <div className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-farm-grass dark:text-farm-sand">
            Authentic Agriculture
          </span>
          <h2 className="font-display text-3xl font-bold text-farm-forest dark:text-white leading-tight">
            Why Grass-Fed Beef Tastes Better & Feels Different
          </h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-light">
            When beef is raised on natural forage, the meat develops an authentic, clean flavor profile that reflects the terroir of Kansas grasslands. The fat is clean, delicate, and packed with fat-soluble vitamins, CLA (conjugated linoleic acid), and balanced Omega-3 to Omega-6 ratios.
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-farm-forest hover:bg-farm-grass text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              <span>Explore Our Cuts</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
          <img
            src={SUPABASE_MEDIA.roast}
            alt="Heritage pasture beef roast cuts"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

    </div>
  );
}
