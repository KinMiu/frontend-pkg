import React, { useState, useEffect } from 'react';
import { partnerAPI } from '../../services/api';
import { Partner } from '../../types';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function Partners() {
  const [partners, setPartners] = useState<Partner[]>([]);
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

      <div className="w-full max-w-6xl">
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={partners.length > 3}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-10"
        >
          {partners.map((partner) => {
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
          const cardClass = 'flex h-full min-h-[120px] items-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 w-full';
          return (
            <SwiperSlide key={partner._id}>
              <div className="h-full px-2">
                {link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${cardClass} cursor-pointer hover:ring-2 hover:ring-blue-500/50`}
                  >
                    {cardContent}
                  </a>
                ) : (
                  <div className={cardClass}>
                    {cardContent}
                  </div>
                )}
              </div>
            </SwiperSlide>
          );
        })}
        </Swiper>
      </div>
    </div>
  );
}
