import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, X } from 'lucide-react';
import { eventAPI } from '../services/api';
import type { Event } from '../types';

type EventGallery = {
  id: string;
  title: string;
  subtitle?: string;
  program?: string;
  images: string[]; // resolved URLs
};

const GaleryKegiatan = () => {
  const [kegiatan, setKegiatan] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeEvent, setActiveEvent] = useState<EventGallery | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [selectedProgram, setSelectedProgram] = useState<string>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
    const load = async () => {
      try {
        setLoading(true);
        const data = await eventAPI.getAll();
        setKegiatan(Array.isArray(data) ? data : []);
        setError(null);
      } catch (e) {
        console.error(e);
        setError('Gagal memuat galeri kegiatan');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const eventsForGallery = useMemo<EventGallery[]>(() => {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
    return (kegiatan || [])
      .map((k) => {
        const rawFotos = Array.isArray(k.fotos) && k.fotos.length > 0 ? k.fotos : k.foto ? [k.foto] : [];
        const images = rawFotos
          .map((foto) =>
            foto && (foto.startsWith('http') || foto.startsWith('data:'))
              ? foto
              : foto
                ? `${baseUrl}/uploads/${foto}`
                : ''
          )
          .filter(Boolean);
        if (images.length === 0) return null;
        return {
          id: k._id,
          title: k.nama,
          program: k.program,
          subtitle: [k.program, k.tanggal, k.satminkal].filter(Boolean).join(' • ') || undefined,
          images,
        };
      })
      .filter((x): x is EventGallery => Boolean(x));
  }, [kegiatan]);

  const programTabs = useMemo(() => {
    const set = new Set<string>();
    kegiatan.forEach((k) => {
      if (k.program && k.program.trim()) {
        set.add(k.program.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [kegiatan]);

  const filteredEvents = useMemo(
    () =>
      selectedProgram === 'all'
        ? eventsForGallery
        : eventsForGallery.filter((it) => (it.program || '').trim() === selectedProgram),
    [eventsForGallery, selectedProgram]
  );

  useEffect(() => {
    if (!activeEvent) return;
    setActiveIndex(0);
  }, [activeEvent?.id]);

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
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Galery Kegiatan</h1>
          <p className="mt-3 text-gray-600">Menampilkan semua foto kegiatan yang tersedia.</p>
        </div>

        {eventsForGallery.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Belum ada foto kegiatan untuk ditampilkan.</p>
          </div>
        ) : (
          <>
            {/* Program Filter Tabs */}
            {programTabs.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setSelectedProgram('all')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                    selectedProgram === 'all'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Semua Program
                </button>
                {programTabs.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSelectedProgram(p)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                      selectedProgram === p
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredEvents.map((ev) => {
                const cover = ev.images[0];
                const count = ev.images.length;
                return (
                  <motion.button
                    type="button"
                    key={ev.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => setActiveEvent(ev)}
                    className="group relative overflow-hidden rounded-xl bg-gray-100 aspect-square shadow-sm hover:shadow-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Buka galeri: ${ev.title}`}
                  >
                    {/* fake stacked cards behind cover when multiple images */}
                    {count > 1 && (
                      <>
                        <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-xl bg-black/10" />
                        <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-xl bg-black/5" />
                      </>
                    )}

                    <img
                      src={cover}
                      alt={ev.title}
                      className="relative h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                    {count > 1 && (
                      <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur">
                        <Layers className="h-3.5 w-3.5" />
                        <span>{count}</span>
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                      <div className="text-white text-sm font-semibold line-clamp-2">{ev.title}</div>
                      {ev.subtitle && <div className="text-white/80 text-xs mt-1 line-clamp-1">{ev.subtitle}</div>}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {activeEvent && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4"
          onClick={() => setActiveEvent(null)}
        >
          <div
            className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="min-w-0">
                <div className="text-base sm:text-lg font-semibold text-gray-900 truncate">{activeEvent.title}</div>
                {activeEvent.subtitle ? (
                  <div className="text-xs sm:text-sm text-gray-500 truncate">{activeEvent.subtitle}</div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setActiveEvent(null)}
                className="rounded-full bg-gray-100 p-2 text-gray-700 hover:bg-gray-200"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="bg-black">
              <img
                src={activeEvent.images[activeIndex]}
                alt={`${activeEvent.title} ${activeIndex + 1}`}
                className="w-full max-h-[70vh] object-contain"
              />
            </div>

            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-gray-600">
                  Foto <span className="font-medium">{activeIndex + 1}</span> / {activeEvent.images.length}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                    disabled={activeIndex === 0}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((i) => Math.min(activeEvent.images.length - 1, i + 1))}
                    disabled={activeIndex === activeEvent.images.length - 1}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {activeEvent.images.slice(0, 30).map((u, idx) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`aspect-square overflow-hidden rounded-md border ${
                      idx === activeIndex ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    aria-label={`Pilih foto ${idx + 1}`}
                  >
                    <img src={u} alt={`${activeEvent.title} thumb ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleryKegiatan;
