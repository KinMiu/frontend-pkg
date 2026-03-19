import React, { useEffect, useState } from 'react';
import { ArrowUp, Phone } from 'lucide-react';

const WA_NUMBER = '6281252387717'; // 081252387717 dengan kode negara 62
const SHOW_SCROLL_TOP_AFTER_PX = 250;

const WhatsAppSticky = () => {
  const waUrl = `https://wa.me/${WA_NUMBER}`;
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > SHOW_SCROLL_TOP_AFTER_PX);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 text-white shadow-lg transition-all hover:bg-gray-900 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
          aria-label="Kembali ke atas"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-white shadow-lg transition-all hover:bg-green-600 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
        aria-label="Hubungi Kami via WhatsApp"
      >
        <Phone className="h-5 w-5 shrink-0" />
        <span className="text-sm font-semibold whitespace-nowrap">Hubungi Kami</span>
      </a>
    </div>
  );
};

export default WhatsAppSticky;
