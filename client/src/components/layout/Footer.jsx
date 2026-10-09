import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ShieldCheck, HeartHandshake, MessageSquare } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-farm-forestDark text-gray-300 border-t border-farm-grass/20 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-12 border-b border-white/10 items-start justify-between">
          
          {/* Brand Column */}
          <div className="space-y-4 max-w-lg">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-farm-grass flex items-center justify-center text-white font-display font-bold text-lg shadow-md">
                B
              </div>
              <div>
                <span className="font-display font-bold text-xl text-white tracking-tight">
                  BestGrassFed<span className="text-farm-sand">Cattle</span>
                </span>
                <span className="block text-[10px] tracking-widest text-farm-sandLight uppercase font-medium">
                  Kansas • 100% Pasture Raised
                </span>
              </div>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              Dedicated to ethical, rotational pasture grazing in Kansas. Providing exceptional artisanal beef cuts directly to households, private clubs, and commercial culinary kitchens.
            </p>

            <div className="flex items-center gap-2 text-xs text-farm-sand bg-white/5 py-2 px-3 rounded-lg border border-white/10 w-fit">
              <HeartHandshake className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Direct Customer Relationship • Zero Online Payment Gateways</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="md:justify-self-end max-w-md w-full">
            <h4 className="text-white font-display font-semibold text-base mb-4 tracking-wide">
              Direct Dispatch
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-farm-sand mt-0.5 flex-shrink-0" />
                <span>2210 SE 21st St, Topeka, KS 66607</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-farm-sand flex-shrink-0" />
                <a href="tel:+13052132655" className="hover:text-white transition-colors">+1 (305) 213-2655</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-farm-sand flex-shrink-0" />
                <a href="mailto:grassfed@gmail.com" className="hover:text-white transition-colors">grassfed@gmail.com</a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href="https://wa.me/13052132655?text=Hello%20BestGrassFedCattle%2C%20I%20would%20like%20to%20inquire%20about%20ordering%20beef."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-300 text-emerald-400 transition-colors"
                >
                  WhatsApp: +1 (305) 213-2655
                </a>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Available for inquiries Mon–Sat</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-farm-grass" />
            <span>&copy; {currentYear} BestGrassFedCattle. All rights reserved. Topeka, Kansas, USA.</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/privacy-policy" className="hover:text-farm-sand transition-colors">Privacy Policy</Link>
            <Link to="/terms-conditions" className="hover:text-farm-sand transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
