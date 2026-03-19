import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const DesignSettings: React.FC = () => {
  const {
    sidebarTheme,
    headerTheme,
    setPalette,
    availablePalettes,
    sidebarTextColor,
    headerTextColor,
    setTextColor,
    loading,
  } = useTheme();
  const [paletteFor, setPaletteFor] = useState<'sidebar' | 'header' | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Pengaturan Tampilan Dashboard</h1>
        <p className="text-sm text-gray-600">
          Pilih warna berbeda untuk sidebar dan header. Pengaturan ini akan diterapkan ke seluruh
          halaman dashboard (admin, operator, dan guru).
        </p>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">Memuat pengaturan tampilan dari server...</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sidebar */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">Warna Sidebar</h2>
          {/* Hanya tampilkan warna terpilih */}
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs">
            {availablePalettes
              .filter((p) => p.id === sidebarTheme)
              .map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className={`inline-block h-6 w-6 rounded ${p.bgClass}`} />
                  <span className="text-[11px] text-gray-700">{p.name}</span>
                </div>
              ))}
            <button
              type="button"
              onClick={() => setPaletteFor('sidebar')}
              className="ml-auto inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
            >
              Pilih warna
            </button>
          </div>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-gray-700">
            <span className="font-semibold">Warna teks:</span>
            <button
              type="button"
              onClick={() => setTextColor('sidebar', 'black')}
              className={`px-2 py-1 rounded border text-[11px] ${
                sidebarTextColor === 'black'
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 bg-white text-black hover:border-blue-300'
              }`}
            >
              Hitam
            </button>
            <button
              type="button"
              onClick={() => setTextColor('sidebar', 'white')}
              className={`px-2 py-1 rounded border text-[11px] ${
                sidebarTextColor === 'white'
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-white bg-white text-black hover:border-blue-300'
              }`}
            >
              Putih
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">Warna Header</h2>
          {/* Hanya tampilkan warna terpilih */}
          <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs">
            {availablePalettes
              .filter((p) => p.id === headerTheme)
              .map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className={`inline-block h-6 w-6 rounded ${p.bgClass}`} />
                  <span className="text-[11px] text-gray-700">{p.name}</span>
                </div>
              ))}
            <button
              type="button"
              onClick={() => setPaletteFor('header')}
              className="ml-auto inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
            >
              Pilih warna
            </button>
          </div>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-gray-700">
            <span className="font-semibold">Warna teks:</span>
            <button
              type="button"
              onClick={() => setTextColor('header', 'black')}
              className={`px-2 py-1 rounded border text-[11px] ${
                headerTextColor === 'black'
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 bg-white text-black hover:border-blue-300'
              }`}
            >
              Hitam
            </button>
            <button
              type="button"
              onClick={() => setTextColor('header', 'white')}
              className={`px-2 py-1 rounded border text-[11px] ${
                headerTextColor === 'white'
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-white bg-white text-black hover:border-blue-300'
              }`}
            >
              Putih
            </button>
          </div>
        </div>
      </div>

      {/* Modal palet warna */}
      {paletteFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="max-h-[80vh] w-full max-w-3xl rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">
                Pilih warna untuk {paletteFor === 'sidebar' ? 'Sidebar' : 'Header'}
              </h2>
              <button
                type="button"
                onClick={() => setPaletteFor(null)}
                className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
              >
                Tutup
              </button>
            </div>
            <div className="grid max-h-[60vh] grid-cols-6 gap-3 overflow-y-auto pb-1 pr-1">
              {availablePalettes.map((p) => {
                const isActive =
                  paletteFor === 'sidebar' ? p.id === sidebarTheme : p.id === headerTheme;
                return (
                  <button
                    key={p.id + '-modal-' + paletteFor}
                    type="button"
                    onClick={() => {
                      setPalette(paletteFor, p.id);
                      setPaletteFor(null);
                    }}
                    className={`flex flex-col items-center rounded-lg border p-2 text-center text-[10px] transition ${
                      isActive ? 'border-blue-500 ring-1 ring-blue-300' : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className={`mb-1 inline-block h-8 w-full rounded ${p.bgClass}`} />
                    <span className="line-clamp-2 text-gray-700">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignSettings;

