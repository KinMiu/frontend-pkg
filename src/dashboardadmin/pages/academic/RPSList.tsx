import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { Plus, Search, Edit, Trash2, ExternalLink, Download, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const RPSList: React.FC = () => {
  const { rps = [], deleteRPS } = useCampusData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const filteredRPS = rps.filter((item) =>
    item.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPdfUrl = (pdfFile: string) => {
    if (!pdfFile) return '';
    if (pdfFile.startsWith('data:') || pdfFile.startsWith('http://') || pdfFile.startsWith('https://')) {
      return pdfFile;
    }
    const baseUrl = (import.meta.env.VITE_API_URL || 'https://api-informatika.psti-ubl.id').replace(/\/$/, '');
    const cleanPath = pdfFile.startsWith('/') ? pdfFile : `/uploads/rps/${pdfFile}`;
    return `${baseUrl}${cleanPath}`;
  };

  const handleDelete = async (_id: string, courseName: string) => {
    if (window.confirm(`Anda yakin ingin menghapus RPS "${courseName}"?`)) {
      try {
        await deleteRPS(_id);
        toast.success('RPS berhasil dihapus');
      } catch (error) {
        console.error('Error deleting RPS:', error);
        toast.error('Gagal menghapus RPS');
      }
    }
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

    setIsDownloading(pdfFile);
    try {
      const response = url.startsWith('data:') ? await fetch(url) : await fetch(url, { mode: 'cors' });
      if (!response.ok) {
        throw new Error('File tidak ditemukan');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `RPS_${courseName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('File berhasil diunduh');
    } catch {
      toast.error('File PDF tidak tersedia di server');
      if (!url.startsWith('data:')) window.open(url, '_blank');
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kelola RPS Akademik</h1>
        <Link
          to="/dashboard/rps/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah RPS
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama mata kuliah..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredRPS.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Mata Kuliah</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRPS.map((item, index) => (
                <tr key={item._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.courseName}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => handleViewPdf(item.pdfFile)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        title="Lihat RPS"
                      >
                        <ExternalLink size={16} className="mr-1" />
                        Lihat
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(item.pdfFile, item.courseName)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                        title="Download RPS"
                      >
                        <Download size={16} className="mr-1" />
                        Unduh
                      </button>
                      <Link
                        to={`/dashboard/rps/edit/${item._id}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-amber-500 rounded-md hover:bg-amber-600"
                        title="Edit RPS"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id, item.courseName)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        title="Hapus RPS"
                      >
                        <Trash2 size={16} className="mr-1" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <BookOpen size={48} className="mx-auto mb-4 text-blue-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Tidak ada data RPS</h3>
          <p className="mb-4 text-gray-600">
            Belum ada data RPS yang tersedia atau sesuai dengan pencarian.
          </p>
          <Link
            to="/dashboard/rps/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah RPS Baru
          </Link>
        </div>
      )}

    </div>
  );
};

export default RPSList;
