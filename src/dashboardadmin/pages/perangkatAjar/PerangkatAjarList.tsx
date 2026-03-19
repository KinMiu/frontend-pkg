import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCampusData } from '../../contexts/CampusDataContext';

const PerangkatAjarList: React.FC = () => {
  const { perangkatAjar = [], deletePerangkatAjar } = useCampusData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return perangkatAjar;
    return perangkatAjar.filter((item) => {
      const judul = (item.judul || '').toLowerCase();
      const kategori = (item.kategori || '').toLowerCase();
      const original = (item.originalName || '').toLowerCase();
      return judul.includes(q) || kategori.includes(q) || original.includes(q);
    });
  }, [perangkatAjar, searchTerm]);

  const getFileUrl = (filePath: string) => {
    if (!filePath) return '';
    if (filePath.startsWith('data:') || filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
    const clean = filePath.replace(/^\/+/, '');
    return `${baseUrl}/uploads/${clean}`;
  };

  const handleDelete = async (_id: string, judul: string) => {
    if (window.confirm(`Anda yakin ingin menghapus perangkat ajar "${judul}"?`)) {
      try {
        await deletePerangkatAjar(_id);
        toast.success('Perangkat ajar berhasil dihapus');
      } catch (error) {
        console.error('Error deleting perangkat ajar:', error);
        toast.error('Gagal menghapus perangkat ajar');
      }
    }
  };

  const handleDownload = async (filePath: string, filename: string) => {
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
      toast.success('File berhasil diunduh');
    } catch {
      toast.error('File tidak tersedia di server');
      if (!url.startsWith('data:')) window.open(url, '_blank');
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Perangkat Ajar</h1>
        <Link
          to="/dashboard/perangkat-ajar/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah Perangkat Ajar
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari judul / kategori / nama file..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No.</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Judul</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kategori</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">File</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, index) => (
                <tr key={item._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.judul}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.kategori || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-[280px] truncate" title={item.originalName}>
                    {item.originalName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => handleDownload(item.filePath, item.originalName || `PerangkatAjar_${item.judul}`)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                        title="Download"
                        disabled={isDownloading === item.filePath}
                      >
                        <Download size={16} className="mr-1" />
                        {isDownloading === item.filePath ? 'Mengunduh...' : 'Unduh'}
                      </button>
                      <Link
                        to={`/dashboard/perangkat-ajar/edit/${item._id}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-amber-500 rounded-md hover:bg-amber-600"
                        title="Edit"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id, item.judul)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        title="Hapus"
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
          <FileText size={48} className="mx-auto mb-4 text-blue-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Tidak ada perangkat ajar</h3>
          <p className="mb-4 text-gray-600">Upload perangkat ajar agar bisa diunduh di landing page.</p>
          <Link
            to="/dashboard/perangkat-ajar/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah Perangkat Ajar
          </Link>
        </div>
      )}
    </div>
  );
};

export default PerangkatAjarList;

