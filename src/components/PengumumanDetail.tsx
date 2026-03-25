import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, MapPin, Megaphone } from 'lucide-react';
import { Pengumuman } from '../types';

interface PengumumanDetailProps {
  pengumuman: Pengumuman;
  onClose: () => void;
}

interface ImageViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, onClose }) => (
  <div
    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[1000] p-4"
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className="absolute top-4 right-4 rounded-full bg-white/90 p-2 shadow text-gray-700 hover:bg-white"
    >
      <X className="h-5 w-5" />
    </button>
    <img
      src={src}
      alt={alt}
      className="max-h-[90vh] max-w-[90vw] object-contain"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
);

const PengumumanDetailModal: React.FC<PengumumanDetailProps> = ({ pengumuman, onClose }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
  const thumb = (pengumuman.fotos && pengumuman.fotos[0]) || pengumuman.foto;
  const src =
    thumb && (thumb.startsWith('http') || thumb.startsWith('data:'))
      ? thumb
      : thumb
        ? `${baseUrl}/uploads/${thumb}`
        : '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-lg"
      >
        <div className="relative h-60">
          {src ? (
            <img
              src={src}
              alt={pengumuman.judul}
              className="w-full h-full object-cover rounded-t-2xl cursor-pointer"
              onClick={() => setImageSrc(src)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-t-2xl" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>

          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {pengumuman.jenis && (
              <span className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold">
                {pengumuman.jenis}
              </span>
            )}
            {pengumuman.satminkal && (
              <span className="px-4 py-2 bg-blue-800/90 text-white rounded-full text-sm font-semibold">
                {pengumuman.satminkal}
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4">
            <h2 className="text-2xl font-bold text-white">{pengumuman.judul}</h2>
            <div className="flex flex-wrap gap-4 text-white/90 text-sm mt-2">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {pengumuman.tanggal}
              </div>
              {pengumuman.lokasi && (
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  {pengumuman.lokasi}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {pengumuman.satminkal && (
            <p className="text-sm text-blue-600 font-medium mb-4">Satminkal: {pengumuman.satminkal}</p>
          )}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Deskripsi</h3>
            <p className="text-gray-600">{pengumuman.deskripsi}</p>
          </div>
        </div>
      </motion.div>
      {imageSrc && (
        <ImageViewer src={imageSrc} alt={pengumuman.judul} onClose={() => setImageSrc(null)} />
      )}
    </div>
  );
};

export default PengumumanDetailModal;
