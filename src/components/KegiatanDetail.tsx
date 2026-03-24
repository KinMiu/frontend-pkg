import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Event } from '../types';
import { createPortal } from 'react-dom';

interface KegiatanDetailProps {
  kegiatan: Event;
  onClose: () => void;
}

interface ImageViewerProps {
  src: string;
  alt: string;
  hasMultiple: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, hasMultiple, onPrev, onNext, onClose }) => (
  <div
    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1100] p-4"
    onClick={onClose}
  >
    {hasMultiple && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow text-gray-700 hover:bg-white"
        aria-label="Gambar sebelumnya"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
    )}
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="absolute top-4 right-4 rounded-full bg-white/90 p-2 shadow text-gray-700 hover:bg-white"
      aria-label="Tutup viewer"
    >
      <X className="h-5 w-5" />
    </button>
    {hasMultiple && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow text-gray-700 hover:bg-white"
        aria-label="Gambar berikutnya"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    )}
    <img
      src={src}
      alt={alt}
      className="max-h-[90vh] max-w-[90vw] object-contain"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const KegiatanDetail: React.FC<KegiatanDetailProps> = ({ kegiatan, onClose }) => {
  const [imageIndex, setImageIndex] = useState<number | null>(null);

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
  const fotos = (Array.isArray(kegiatan.fotos) && kegiatan.fotos.length > 0)
    ? kegiatan.fotos
    : (kegiatan.foto ? [kegiatan.foto] : []);
  const resolvedFotos = fotos
    .map((f) =>
      f && (f.startsWith('http') || f.startsWith('data:')) ? f : f ? `${baseUrl}/uploads/${f}` : ''
    )
    .filter(Boolean);
  const src = resolvedFotos[0] || '';
  const viewerSrc = imageIndex !== null ? resolvedFotos[imageIndex] : null;

  const showPrevImage = () => {
    if (resolvedFotos.length <= 1 || imageIndex === null) return;
    setImageIndex((prev) => {
      if (prev === null) return 0;
      return (prev - 1 + resolvedFotos.length) % resolvedFotos.length;
    });
  };

  const showNextImage = () => {
    if (resolvedFotos.length <= 1 || imageIndex === null) return;
    setImageIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % resolvedFotos.length;
    });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[1050]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-lg"
      >
        {/* Header */}
        <div className="relative h-60">
          {src ? (
            <img
              src={src}
              alt={kegiatan.nama}
              className="w-full h-full object-cover rounded-t-2xl cursor-pointer"
              onClick={() => setImageIndex(0)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-t-2xl" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>

          {/* Kategori & Satminkal Badge */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {kegiatan.jenis && (
              <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">
                {kegiatan.jenis}
              </span>
            )}
            {kegiatan.program && (
              <span className="px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-semibold">
                {kegiatan.program}
              </span>
            )}
            {kegiatan.satminkal && (
              <span className="px-4 py-2 bg-blue-800/90 text-white rounded-full text-sm font-semibold">
                {kegiatan.satminkal}
              </span>
            )}
          </div>

          {/* Judul & Info Dasar */}
          <div className="absolute bottom-4 left-4">
            <h2 className="text-2xl font-bold text-white">{kegiatan.nama}</h2>
            <div className="flex flex-wrap gap-4 text-white/90 text-sm mt-2">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {kegiatan.tanggal}
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {kegiatan.lokasi}
              </div>
            </div>
          </div>
        </div>

        {/* Konten */}
        <div className="p-6">
          
          {kegiatan.satminkal && (
            <p className="text-sm text-blue-600 font-medium mb-4">Satminkal: {kegiatan.satminkal}</p>
          )}

          {resolvedFotos.length > 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Galeri Foto</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {resolvedFotos.slice(0, 30).map((u, idx) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setImageIndex(idx)}
                    className="aspect-square overflow-hidden rounded-md border border-gray-200 hover:border-blue-400"
                    aria-label={`Buka foto ${idx + 1}`}
                  >
                    <img src={u} alt={`${kegiatan.nama} ${idx + 1}`} className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Deskripsi */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Deskripsi</h3>
            <p className="text-gray-600">{kegiatan.deskripsi}</p>
          </div>

          {/* Overview (Jika Ada) */}
          {kegiatan.detailContent?.overview && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Overview</h3>
              <p className="text-gray-600">{kegiatan.detailContent.overview}</p>
            </div>
          )}

          {/* Sesi (Jika Ada) */}
          {kegiatan.detailContent?.sessions && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sesi</h3>
              <ul className="space-y-2 text-gray-600">
                {kegiatan.detailContent.sessions.map((session: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mr-3" />
                    {session}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Equipment (Jika Ada) */}
          {kegiatan.detailContent?.equipment && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Peralatan</h3>
              <ul className="space-y-2 text-gray-600">
                {kegiatan.detailContent.equipment.map((item: string, index: number) => (
                  <li key={index} className="flex items-center">
                    <div className="h-2 w-2 bg-blue-600 rounded-full mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Link Pendaftaran */}
          {kegiatan.link && (
            <div className="mt-6 text-center">
              <a
                href={kegiatan.link}
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Daftar Sekarang
              </a>
            </div>
          )}
        </div>
      </motion.div>
      {viewerSrc && (
        <ImageViewer
          src={viewerSrc}
          alt={kegiatan.nama}
          hasMultiple={resolvedFotos.length > 1}
          onPrev={showPrevImage}
          onNext={showNextImage}
          onClose={() => setImageIndex(null)}
        />
      )}
    </div>,
    document.body
  );
};

export default KegiatanDetail;
