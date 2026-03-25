import React, { useEffect, useState } from 'react';
import { usePublicCampusData } from '../contexts/PublicCampusDataContext';
import { Calendar, MapPin, ChevronRight, Megaphone } from 'lucide-react';
import PengumumanDetailModal from '../components/PengumumanDetail';
import { useSearchParams } from 'react-router-dom';

const Pengumuman = () => {
  window.scrollTo(0, 0);
  const { pengumuman = [], loading, error } = usePublicCampusData();
  const [selectedItem, setSelectedItem] = useState<typeof pengumuman[0] | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const list = Array.isArray(pengumuman) ? pengumuman : [];
  const sortedPengumuman = [...list].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());

  const openId = searchParams.get('open');

  useEffect(() => {
    if (loading) return;
    if (!openId) return;
    if (selectedItem) return;

    const found = sortedPengumuman.find((p) => p._id === openId);
    if (found) setSelectedItem(found);
  }, [loading, openId, selectedItem, sortedPengumuman]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            Pengumuman
          </span>
          <h1 className="text-3xl font-bold text-gray-900">Pengumuman PKG Kecamatan Barat</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Informasi dan pengumuman terbaru seputar kegiatan serta program PKG Barat
          </p>
        </div>

        {sortedPengumuman.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedPengumuman.map((item) => {
              const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
              const thumb = (item.fotos && item.fotos[0]) || item.foto;
              const src =
                thumb && (thumb.startsWith('http') || thumb.startsWith('data:'))
                  ? thumb
                  : thumb
                    ? `${baseUrl}/uploads/${thumb}`
                    : '';
              return (
                <div
                  key={item._id}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
                >
                  <div className="relative">
                    {src ? (
                      <img
                        src={src}
                        alt={item.judul}
                        className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <Megaphone className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                      <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                        {item.jenis || 'Pengumuman'}
                      </span>
                      {item.satminkal && (
                        <span className="inline-block bg-blue-600/90 text-white text-xs px-3 py-1 rounded-full">
                          {item.satminkal}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    {item.satminkal && (
                      <span className="inline-block text-blue-600 text-xs font-medium mb-1">{item.satminkal}</span>
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {item.judul}
                    </h3>
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      {item.tanggal}
                    </div>
                    {item.lokasi && (
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="line-clamp-1">{item.lokasi}</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.deskripsi}</p>
                    <div className="mt-4 flex justify-end text-blue-600 text-sm font-medium">
                      Baca selengkapnya
                      <ChevronRight className="inline-block group-hover:translate-x-1 transition-transform" size={18} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Megaphone size={56} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">Belum ada pengumuman</h3>
            <p className="mt-2 text-gray-500">Pengumuman akan ditampilkan di sini.</p>
          </div>
        )}
      </div>

      {selectedItem && (
        <PengumumanDetailModal
          pengumuman={selectedItem}
          onClose={() => {
            setSelectedItem(null);
            if (openId) {
              const next = new URLSearchParams(searchParams);
              next.delete('open');
              setSearchParams(next, { replace: true });
            }
          }}
        />
      )}
    </div>
  );
};

export default Pengumuman;
