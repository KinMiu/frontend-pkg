import React, { useState, useEffect } from 'react';
import { partnerAPI } from '../../services/api';
import { Partner } from '../../types';

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await partnerAPI.getAll();
        setPartners(data);
        setError(null);
      } catch (err) {
        setError('Failed to load partners');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Tampilkan hanya 4 pertama jika tidak dalam mode "show all"
  const visiblePartners = showAll ? partners : partners.slice(0, 4);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-12 flex flex-col items-center max-w-6xl mx-auto px-6  pb-16 sm:pb-20">
      {/* Heading yang responsif */}
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 text-center mb-4 leading-tight sm:whitespace-nowrap">
        Kolaborasi Link Terkait
      </h2>
      <p className="text-center text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
        PKG Kecamatan Barat  telah melakukan kerjasama dengan berbagai instansi terkait
      </p>

      {/* Grid untuk menampilkan partner */}
      <div className="w-full max-w-5xl flex flex-wrap justify-center gap-8">
        {visiblePartners.map((partner) => {
          const link = partner.link?.trim();
          const cardContent = (
            <>
              {/* Logo partner */}
              {(() => {
                const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
                const src =
                  partner.logo && (partner.logo.startsWith('http') || partner.logo.startsWith('data:'))
                    ? partner.logo
                    : partner.logo
                      ? `${baseUrl}/uploads/${partner.logo}`
                      : '';
                if (!src) {
                  return <div className="h-16 w-16 mr-4 bg-gray-200 rounded" />;
                }
                return (
                  <img
                    src={src}
                    alt={partner.name}
                    className="h-16 w-16 object-contain mr-4"
                  />
                );
              })()}
              {/* Nama partner */}
              <span className="text-gray-900 font-medium text-lg">
                {partner.name}
              </span>
            </>
          );
          const cardClass = 'flex items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 w-full max-w-[300px]';
          return link ? (
            <a
              key={partner._id}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className={`${cardClass} cursor-pointer hover:ring-2 hover:ring-blue-500/50`}
            >
              {cardContent}
            </a>
          ) : (
            <div key={partner._id} className={cardClass}>
              {cardContent}
            </div>
          );
        })}
      </div>

      {/* Tombol "Lihat Selengkapnya" */}
      {partners.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          {showAll ? 'Tampilkan Lebih Sedikit' : 'Lihat Selengkapnya'}
        </button>
      )}
    </div>
  );
}
