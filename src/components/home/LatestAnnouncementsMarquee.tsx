import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Pengumuman } from '../../types';
import { Megaphone } from 'lucide-react';

type Props = {
  items: Pengumuman[];
  className?: string;
};

const buildImageSrc = (foto?: string) => {
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
  if (!foto) return '';
  if (foto.startsWith('http') || foto.startsWith('data:')) return foto;
  return `${baseUrl}/uploads/${foto}`;
};

export default function LatestAnnouncementsMarquee({ items, className }: Props) {
  const navigate = useNavigate();

  const safeItems = Array.isArray(items) ? items : [];
  if (safeItems.length === 0) return null;

  // Ensure the marquee content is long enough to avoid visible "gaps"
  // on wide screens (when items count is small).
  const MIN_CARDS = 10;
  const expandedItems: Pengumuman[] = [];
  while (expandedItems.length < MIN_CARDS) {
    expandedItems.push(...safeItems);
    if (safeItems.length === 0) break;
  }
  const marqueeItems = expandedItems.slice(0, Math.max(MIN_CARDS, safeItems.length));

  // Bigger duration = slower scrolling
  const durationSeconds = Math.max(35, marqueeItems.length * 4.5);

  const cards = marqueeItems.map((item, idx) => {
    const src = buildImageSrc(item.foto);
    return (
      <button
        key={`${item._id}-${idx}`}
        type="button"
        onClick={() => navigate(`/pengumuman?open=${encodeURIComponent(item._id)}`)}
        className="group flex w-[280px] shrink-0 items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-gray-300 hover:shadow"
      >
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {src ? (
            <img
              src={src}
              alt={item.judul}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Megaphone className="h-5 w-5 text-gray-400" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-700">
            {item.judul}
          </div>
          <div className="mt-0.5 text-xs text-gray-500">{item.tanggal}</div>
        </div>
      </button>
    );
  });

  return (
    <section className={className}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-sm font-semibold tracking-wide text-blue-700">Pengumuman Terbaru</div>
            <div className="mt-1 text-xs text-gray-500">Informasi relevan terbaru dari PKG Kecamatan Barat.</div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/pengumuman')}
            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            Lihat semua
          </button>
        </div>

        <div className="marquee rounded-2xl border border-gray-200 bg-white/60 p-3 shadow-sm backdrop-blur">
          <div
            className="marquee__track"
            style={{ ['--marquee-duration' as any]: `${durationSeconds}s` } as React.CSSProperties}
          >
            <div className="marquee__group">{cards}</div>
            <div className="marquee__group" aria-hidden="true">
              {cards}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

