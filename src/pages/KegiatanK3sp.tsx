import { useEffect, useMemo, useState } from 'react';
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { k3spEventAPI } from '../services/api';
import type { Event } from '../types';
import KegiatanDetail from '../components/KegiatanDetail';

const KegiatanK3sp = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Event | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        setLoading(true);
        const data = await k3spEventAPI.getAll();
        setEvents(Array.isArray(data) ? data : []);
        setError(null);
      } catch (e) {
        console.error(e);
        setError('Gagal memuat kegiatan K3SP');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(
    () => [...(events || [])].sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()),
    [events]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            Kegiatan K3SP
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Daftar Kegiatan K3SP</h1>
          <p className="mt-3 text-gray-600">Berbagai kegiatan K3SP terbaru yang dilaksanakan di Kecamatan Barat</p>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
            Belum ada kegiatan K3SP yang tersedia.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((event) => {
              const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
              const foto = (event.fotos && event.fotos.length > 0) ? event.fotos[0] : event.foto;
              const src =
                foto && (foto.startsWith('http') || foto.startsWith('data:'))
                  ? foto
                  : foto
                    ? `${baseUrl}/uploads/${foto}`
                    : '';

              return (
                <button
                  key={event._id}
                  type="button"
                  className="text-left bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
                  onClick={() => setSelected(event)}
                >
                  <div className="relative">
                    {src ? (
                      <img
                        src={src}
                        alt={event.nama}
                        className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                      <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                        {event.jenis || 'Kegiatan'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {event.nama}
                    </h3>
                    {event.deskripsi ? (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{event.deskripsi}</p>
                    ) : null}
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.tanggal || 'Tanggal belum tersedia'}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.lokasi?.trim() ? event.lokasi : 'Lokasi belum tersedia'}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors">
                        Selengkapnya
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selected && <KegiatanDetail kegiatan={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default KegiatanK3sp;

