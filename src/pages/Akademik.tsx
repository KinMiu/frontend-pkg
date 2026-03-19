import React, { useState, useEffect } from 'react';
import { rpsAPI } from '../services/api';
import { RPS } from '../types';
import { FileText, Download, ExternalLink, BookOpen } from 'lucide-react';

const Akademik: React.FC = () => {
  const [rpsList, setRpsList] = useState<RPS[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await rpsAPI.getAll();
        setRpsList(data);
        setError(null);
      } catch (err) {
        setError('Gagal memuat data RPS');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPdfUrl = (pdfFile: string) => {
    if (!pdfFile) return '';
    if (pdfFile.startsWith('data:') || pdfFile.startsWith('http://') || pdfFile.startsWith('https://')) {
      return pdfFile;
    }
    const baseUrl = (import.meta.env.VITE_API_URL || 'https://api-informatika.psti-ubl.id').replace(/\/$/, '');
    const cleanPath = pdfFile.startsWith('/') ? pdfFile : `/uploads/rps/${pdfFile}`;
    return `${baseUrl}${cleanPath}`;
  };

  const handleViewPdf = async (pdfFile: string) => {
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

  const handleDownloadPdf = async (pdfFile: string, courseName: string) => {
    const url = getPdfUrl(pdfFile);
    if (!url) return;

    try {
      const response = url.startsWith('data:') ? await fetch(url) : await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('File tidak ditemukan');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `RPS_${courseName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      if (!url.startsWith('data:')) window.open(url, '_blank');
    }
  };

  const filteredRps = rpsList.filter((rps) =>
    rps.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <BookOpen size={48} />
            </div>
            <h1 className="text-4xl font-bold mb-4">Akademik</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Rencana Pembelajaran Semester (RPS) Program Studi Informatika
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Cari mata kuliah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredRps.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Tidak ada RPS yang sesuai dengan pencarian' : 'Belum ada data RPS'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider w-16">
                      No
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                      Mata Kuliah
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white uppercase tracking-wider w-48">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRps.map((rps, index) => (
                    <tr key={rps._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="text-blue-600 mr-3" size={20} />
                          <span className="text-sm font-medium text-gray-900">{rps.courseName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewPdf(rps.pdfFile)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink size={16} className="mr-1" />
                            Lihat
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(rps.pdfFile, rps.courseName)}
                            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Download size={16} className="mr-1" />
                            Unduh
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Akademik;
