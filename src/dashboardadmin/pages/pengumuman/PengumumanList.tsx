import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, Eye, Edit, Trash2, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const PengumumanList: React.FC = () => {
  const { user } = useAuth();
  const { pengumuman, deletePengumuman } = useCampusData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<{ _id: string; judul: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOperator = (user as { role?: string })?.role === 'operator';
  const operatorSatminkal = (user as { satminkal?: string })?.satminkal?.trim() || '';
  const listForRole = isOperator && operatorSatminkal
    ? pengumuman.filter((p) => (p.satminkal || '').trim() === operatorSatminkal)
    : pengumuman;

  const filteredList = listForRole.filter(
    (p) =>
      p.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.deskripsi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.lokasi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.jenis || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.satminkal || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (item: { _id: string; judul: string }) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await deletePengumuman(selectedItem._id);
      toast.success('Pengumuman berhasil dihapus');
      setShowDeleteConfirm(false);
      setSelectedItem(null);
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus pengumuman');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Pengumuman</h1>
        <Link
          to="/dashboard/pengumuman/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah Pengumuman
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari pengumuman..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredList.map((item) => (
            <div
              key={item._id}
              className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div
                className="h-48 w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${
                    item.foto
                      ? item.foto.startsWith('http') || item.foto.startsWith('data:')
                        ? item.foto
                        : `${(import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '')}/uploads/${item.foto}`
                      : 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg'
                  })`,
                }}
              />
              <div className="p-4">
                {item.satminkal && (
                  <span className="inline-block text-blue-600 text-xs font-medium mb-1">{item.satminkal}</span>
                )}
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{item.judul}</h3>
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                    {item.jenis}
                  </span>
                </div>
                <div className="mb-3 flex items-center text-sm text-gray-500">
                  <Megaphone size={16} className="mr-1" />
                  <span>{item.tanggal}</span>
                </div>
                <p className="mb-4 text-sm text-gray-600 line-clamp-2">{item.deskripsi}</p>
                <div className="flex justify-end space-x-2">
                  <Link
                    to={`/dashboard/pengumuman/${item._id}`}
                    className="rounded-md bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
                    title="Lihat Detail"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    to={`/dashboard/pengumuman/edit/${item._id}`}
                    className="rounded-md bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <Megaphone size={48} className="mx-auto mb-4 text-indigo-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Tidak ada pengumuman</h3>
          <p className="mb-4 text-gray-600">
            Belum ada data pengumuman atau tidak sesuai dengan pencarian.
          </p>
          <Link
            to="/dashboard/pengumuman/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah Pengumuman Baru
          </Link>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus pengumuman "${selectedItem?.judul}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default PengumumanList;
