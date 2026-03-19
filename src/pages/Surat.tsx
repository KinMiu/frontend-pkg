import React, { useMemo, useState } from 'react';
import { usePublicCampusData } from '../contexts/PublicCampusDataContext';
import { Download, FileText, Search, Calendar, ExternalLink } from 'lucide-react';

const SuratPage: React.FC = () => {
  const { surat, loading, error } = usePublicCampusData();
  const [search, setSearch] = useState('');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return surat;
    return surat.filter((s) => (s.judul || '').toLowerCase().includes(q));
  }, [search, surat]);

  const getPdfUrl = (pdfFile: string) => {
    if (!pdfFile) return '';
    if (pdfFile.startsWith('data:') || pdfFile.startsWith('http://') || pdfFile.startsWith('https://')) {
      return pdfFile;
    }
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
    const clean = pdfFile.replace(/^\/+/, '');
    return `${baseUrl}/uploads/${clean}`;
  };

  const handleView = async (pdfFile: string) => {
    const url = getPdfUrl(pdfFile);
    if (!url) return;
    if (url.startsWith('data:')) {
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch {
        window.open(url, '_blank');
      }
      return;
    }
    window.open(url, '_blank');
  };

  const handleDownload = async (pdfFile: string, judul: string) => {
    const url = getPdfUrl(pdfFile);
    if (!url) return;

    setIsDownloading(pdfFile);
    try {
      const response = url.startsWith('data:') ? await fetch(url) : await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('File tidak ditemukan');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `DokumenSurat_${(judul || 'dokumen').replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dokumen Surat</h1>
        <p className="mt-2 text-gray-600">Dokumen surat yang dapat dilihat dan diunduh.</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul surat..."
            className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <p className="text-gray-600">Memuat data surat...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <p className="text-red-600">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg bg-white p-10 text-center shadow-sm">
          <FileText size={44} className="mx-auto mb-3 text-blue-300" />
          <h2 className="text-lg font-semibold text-gray-900">Belum ada surat</h2>
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
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{item.tanggal || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleView(item.pdfFile)}
                      className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      title="Lihat"
                    >
                      <ExternalLink size={16} className="mr-2" />
                      Lihat
                    </button>
                    <button
                      onClick={() => handleDownload(item.pdfFile, item.judul)}
                      disabled={isDownloading === item.pdfFile}
                      className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      title="Unduh"
                    >
                      <Download size={16} className="mr-2" />
                      {isDownloading === item.pdfFile ? 'Mengunduh...' : 'Unduh'}
                    </button>
                  </div>
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.judul}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.tanggal || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleView(item.pdfFile)}
                          className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                          title="Lihat"
                        >
                          <ExternalLink size={16} className="mr-1" />
                          Lihat
                        </button>
                        <button
                          onClick={() => handleDownload(item.pdfFile, item.judul)}
                          disabled={isDownloading === item.pdfFile}
                          className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                          title="Unduh"
                        >
                          <Download size={16} className="mr-1" />
                          {isDownloading === item.pdfFile ? 'Mengunduh...' : 'Unduh'}
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
    </div>
  );
};

export default SuratPage;

