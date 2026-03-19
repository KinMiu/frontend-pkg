import React from 'react';
import { X, Quote } from 'lucide-react';
import type { Greeting } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  greeting: Greeting;
};

const GreetingModal: React.FC<Props> = ({ open, onClose, greeting }) => {
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    // Navbar is fixed with h-16 (64px) and z-50.
    // We render the modal UNDER the navbar area to avoid being overlapped.
    <div className="fixed inset-0 z-40">
      <div
        className="fixed inset-x-0 bottom-0 top-16 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto p-4 sm:p-8">
        <div className="min-h-full w-full flex items-center justify-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Kata pengantar"
            className="relative w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 h-[calc(100dvh-4rem-2rem)] sm:h-[calc(100dvh-4rem-4rem)]"
          >
            <div className="absolute right-4 top-4 z-20">
              <button
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-white"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex h-full min-h-0 flex-col md:flex-row">
              {/* Left panel */}
              <div className="relative md:w-2/5">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900" />
                <div className="relative flex h-full flex-col items-center justify-center px-6 py-10 text-white">
                  <div className="h-28 w-28 md:h-60 md:w-60 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20">
                    {(() => {
                      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
                      const src =
                        greeting.foto && (greeting.foto.startsWith('http') || greeting.foto.startsWith('data:'))
                          ? greeting.foto
                          : greeting.foto
                            ? `${baseUrl}/uploads/${greeting.foto}`
                            : '';
                      if (!src) {
                        return <div className="h-28 w-28 md:h-60 md:w-60 bg-white/10" />;
                      }
                      return (
                        <img
                          src={src}
                          alt={greeting.nama}
                          className="h-28 w-28 md:h-60 md:w-60 object-cover"
                        />
                      );
                    })()}
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-lg font-semibold tracking-tight">{greeting.nama}</div>
                    <div className="mt-1 text-sm text-white/80">{greeting.jabatan}</div>
                  </div>
                  <div className="mt-6 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white/90 ring-1 ring-white/15">
                    <Quote className="h-4 w-4" />
                    Sambutan & Pengantar
                  </div>
                </div>
              </div>

              {/* Right panel */}
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="px-6 pt-8 md:px-8">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-lg bg-indigo-50 p-2 text-indigo-700 ring-1 ring-indigo-100">
                      <Quote className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-slate-900">
                        Selamat Datang
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Terima kasih telah berkunjung. Berikut kata pengantar singkat dari kami.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-6 md:px-8">
                  <div className="rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-5">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
                      {greeting.kataSambutan}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur md:px-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      onClick={onClose}
                      className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      Mulai Jelajahi
                    </button>
                    <button
                      onClick={onClose}
                      className="inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreetingModal;

