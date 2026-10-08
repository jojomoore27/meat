import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function MessageUsWidget() {
  const whatsappNumber = '13052132655';
  const defaultMessage = encodeURIComponent(
    'Hello BestGrassFedCattle, I would like to inquire about ordering your pasture-raised grass-fed beef cuts.'
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 py-3 bg-farm-forest hover:bg-farm-grass text-white rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 border border-farm-sand/30 group"
        aria-label="Direct message farm team on WhatsApp"
        title="Chat with our farm on WhatsApp (+1 305 213 2655)"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
        <MessageSquare className="w-5 h-5 text-farm-sand group-hover:scale-110 transition-transform" />
        <span className="font-medium text-sm hidden sm:inline">Message Our Farm</span>
      </a>
    </div>
  );
}
