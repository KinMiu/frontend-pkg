import React, { useMemo, useState } from 'react';
import { usePublicCampusData } from '../contexts/PublicCampusDataContext';
import { Download, FileText, Search } from 'lucide-react';
import { perangkatAjarAPI } from '../services/api';

const PerangkatAjarPage: React.FC = () => {
  const { perangkatAjar, loading, error } = usePublicCampusData();
  const [search, setSearch] = useState('');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<{ path: string; name: string } | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return perangkatAjar;
    return perangkatAjar.filter((p) => {
      const judul = (p.judul || '').toLowerCase();
      const kategori = (p.kategori || '').toLowerCase();
      const nama = (p.originalName || '').toLowerCase();
      return judul.includes(q) || kategori.includes(q) || nama.includes(q);
    });
  }, [search, perangkatAjar]);

  const getFileUrl = (filePath: string) => {
    if (!filePath) return '';
    if (filePath.startsWith('data:') || filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
    const clean = filePath.replace(/^\/+/, '');
    return `${baseUrl}/uploads/${clean}`;
  };

  const doDownload = async (filePath: string, filename: string) => {
    const url = getFileUrl(filePath);
    if (!url) return;

    setIsDownloading(filePath);
    try {
      const response = url.startsWith('data:') ? await fetch(url) : await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('File tidak ditemukan');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'perangkat-ajar';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } finally {
      setIsDownloading(null);
    }
  };

  const requestDownload = (filePath: string, filename: string) => {
    setPendingFile({ path: filePath, name: filename });
    setPassword('');
    setPasswordError('');
    setAuthError('');
  };

  const handleConfirmDownload = async () => {
    if (!password.trim()) {
      setPasswordError('Kata sandi wajib diisi');
      return;
    }
    if (!pendingFile) return;
    try {
      await perangkatAjarAPI.checkPassword(password.trim());

      await doDownload(pendingFile.path, pendingFile.name);
      setPendingFile(null);
      setPassword('');
      setPasswordError('');
      setAuthError('');
    } catch (err) {
      console.error('Password check failed before download perangkat ajar:', err);
      setAuthError('Kata sandi tidak cocok dengan akun admin/operator/guru manapun.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Perangkat Ajar</h1>
        <p className="mt-2 text-gray-600">Materi yang dapat dilihat dan diunduh.</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul / kategori / nama file..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <p className="text-gray-600">Memuat perangkat ajar...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <p className="text-red-600">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-white p-10 text-center shadow-sm">
          <FileText size={44} className="mx-auto mb-3 text-blue-300" />
          <h2 className="text-lg font-semibold text-gray-900">Belum ada perangkat ajar</h2>
          <p className="mt-1 text-sm text-gray-600">Silakan cek kembali nanti.</p>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="grid grid-cols-1 gap-4 sm:hidden">
            {filtered.map((item) => (
              <div key={item._id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{item.judul}</h3>
                    <p className="mt-1 text-sm text-gray-600">{item.kategori || '-'}</p>
                    <p className="mt-2 text-xs text-gray-500 truncate" title={item.originalName}>
                      {item.originalName}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => requestDownload(item.filePath, item.originalName || `PerangkatAjar_${item.judul}`)}
                    disabled={isDownloading === item.filePath || !!pendingFile}
                    className="w-full inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    title="Unduh"
                  >
                    <Download size={16} className="mr-2" />
                    {isDownloading === item.filePath ? 'Mengunduh...' : 'Unduh'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop/tablet: table */}
          <div className="hidden sm:block overflow-x-auto bg-white shadow-sm rounded-lg border border-gray-100">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Judul</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kategori</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">File</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.judul}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.kategori || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[360px] truncate" title={item.originalName}>
                      {item.originalName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => requestDownload(item.filePath, item.originalName || `PerangkatAjar_${item.judul}`)}
                          disabled={isDownloading === item.filePath || !!pendingFile}
                          className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          title="Unduh"
                        >
                          <Download size={16} className="mr-1" />
                          {isDownloading === item.filePath ? 'Mengunduh...' : 'Unduh'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {pendingFile && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Konfirmasi Unduh</h2>
            <p className="text-sm text-gray-600 mb-4">
              Masukkan kata sandi akun yang sedang login (admin / operator / guru) untuk mengunduh perangkat ajar.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
              <input
                // Pakai name & autoComplete custom untuk mencegah autofill browser
                name="perangkat-ajar-download-password"
                autoComplete="new-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                  if (authError) setAuthError('');
                }}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                  passwordError ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Masukkan kata sandi"
              />
              {passwordError && <p className="mt-1 text-xs text-red-600">{passwordError}</p>}
            </div>
            {authError && <p className="mb-3 text-xs text-red-600">{authError}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setPendingFile(null);
                  setPassword('');
                  setPasswordError('');
                  setAuthError('');
                }}
                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDownload}
                disabled={isDownloading === pendingFile.path}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerangkatAjarPage;

