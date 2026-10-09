import React from 'react';
import { MapPin, Phone, Mail, MessageSquare } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="p-8 sm:p-10 rounded-3xl bg-earth-gradient text-white shadow-2xl space-y-6 border border-farm-grass/20">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          Direct Pasture Dispatch
        </h1>
        <p className="text-sm text-gray-200 leading-relaxed font-light">
          We operate on an authentic, direct-to-customer model. Your message is received immediately by our farm team.
        </p>

        <ul className="space-y-5 text-sm text-farm-sandLight">
          <li className="flex items-start gap-3.5">
            <MapPin className="w-5 h-5 text-farm-sand mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-white font-medium">Farm Location</strong>
              <span>2210 SE 21st St, Topeka, KS 66607</span>
            </div>
          </li>

          <li className="flex items-start gap-3.5">
            <Phone className="w-5 h-5 text-farm-sand mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-white font-medium">Telephone Inquiries</strong>
              <a href="tel:+13052132655" className="hover:text-white underline">
                +1 (305) 213-2655
              </a>
              <span className="block text-xs text-gray-300 mt-0.5">
                Monday–Saturday, 8:00 AM – 6:00 PM EST
              </span>
            </div>
          </li>

          <li className="flex items-start gap-3.5">
            <Mail className="w-5 h-5 text-farm-sand mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-white font-medium">Email Address</strong>
              <a href="mailto:grassfed@gmail.com" className="hover:text-white underline">
                grassfed@gmail.com
              </a>
            </div>
          </li>

          <li className="flex items-start gap-3.5">
            <MessageSquare className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-white font-medium">WhatsApp Chat</strong>
              <a
                href="https://wa.me/13052132655?text=Hello%20BestGrassFedCattle%2C%20I%20would%20like%20to%20inquire%20about%20ordering%20beef."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-farm-sand text-emerald-300 underline font-medium"
              >
                +1 (305) 213-2655 (Chat on WhatsApp)
              </a>
              <span className="block text-xs text-gray-300 mt-0.5">
                Instant direct messaging
              </span>
            </div>
          </li>
        </ul>

        <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Average response time: Under 2 business hours</span>
        </div>
      </div>
    </div>
  );
}
