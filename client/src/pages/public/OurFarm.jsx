import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Sun, Droplets, Mountain, ArrowRight } from 'lucide-react';
import { SUPABASE_MEDIA } from '../../constants/media';

export default function OurFarm() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 sm:space-y-24">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-widest text-farm-grass dark:text-farm-sand">
          Kansas Pastures
        </span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-farm-forest dark:text-white mt-2 mb-4">
          Our Farm & Land Stewardship
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed font-light">
          Rooted in the fertile rolling pastures of Kansas. We manage our pastures with a holistic dedication to biological soil fertility, native flora, and low-stress cattle handling.
        </p>
      </div>

      {/* Feature Narrative Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="p-8 rounded-3xl bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 shadow-premium space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Sun className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-farm-forest dark:text-white">
            Daily Rotational Grazing
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light">
            Our cattle are moved daily to fresh paddocks. This mimics natural wild herbivore movements, allowing grasses to recover their root reserves while cattle feed on the sweetest top third of the forage.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 shadow-premium space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Droplets className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-farm-forest dark:text-white">
            Spring-Fed Water Systems
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light">
            Pristine hydration is critical for cattle vitality. Our herd drinks from gravity-fed natural springs and fresh aquifer troughs protected from agricultural runoff.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-[#151c17] border border-farm-sand/40 dark:border-white/5 shadow-premium space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Mountain className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-farm-forest dark:text-white">
            Low-Stress Herd Welfare
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-light">
            Calm, unhurried livestock produce naturally tender beef with optimal glycogen retention. Our low-stress handling protocols ensure animal contentment throughout their lives.
          </p>
        </div>

      </div>

      {/* Visual Showcase Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
          <img
            src={SUPABASE_MEDIA.tbone}
            alt="Prime T-Bone and Porterhouse cuts from Kansas pastures"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
          <img
            src={SUPABASE_MEDIA.roast}
            alt="Heritage grass-fed marbled beef cuts"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Direct Order CTA */}
      <div className="text-center bg-farm-cream dark:bg-farm-forest/10 p-10 rounded-3xl border border-farm-sand/40 dark:border-white/5 max-w-3xl mx-auto space-y-4">
        <h3 className="font-display font-bold text-2xl text-farm-forest dark:text-white">
          Taste the Result of True Stewardship
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xl mx-auto font-light">
          We invite you to experience real American pasture beef. Browse our cuts and submit an order request today.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-farm-forest hover:bg-farm-grass text-white font-semibold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
          >
            <span>Browse Available Cuts</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
