import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { useCampusData } from '../../contexts/CampusDataContext';

const StructuralList: React.FC = () => {
  const { structurals, deleteStructural } = useCampusData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<{ _id: string; nama: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return structurals;
    return structurals.filter((s) => {
      const nama = s.nama || '';
      const jabatan = s.jabatan || '';
      return nama.toLowerCase().includes(q) || jabatan.toLowerCase().includes(q);
    });
  }, [structurals, searchTerm]);

  const handleDeleteClick = (item: { _id: string; nama: string }) => {
    setSelected(item);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      await deleteStructural(selected._id);
      toast.success('Data struktural berhasil dihapus');
    } catch (error) {
      console.error('Error deleting structural:', error);
      toast.error('Gagal menghapus data struktural');
    } finally {
      setShowDeleteConfirm(false);
      setSelected(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Struktur Pimpinan</h1>
          <p className="mt-1 text-sm text-gray-600">
            Kelola data pimpinan dan jabatan.
          </p>
        </div>
        <Link
          to="/dashboard/structurals/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah Data Struktural
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau jabatan..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <div
              key={s._id}
              className="overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="h-40 w-full bg-gray-100">
                {(() => {
                  if (!s.foto) return null;
                  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
                  const src =
                    s.foto.startsWith('http') || s.foto.startsWith('data:')
                      ? s.foto
                      : `${baseUrl}/uploads/${s.foto}`;
                  return (
                    <img
                      src={src}
                      alt={s.nama}
                      className="h-40 w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  );
                })()}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Order: {s.order ?? 0}</p>
                    <h3 className="mt-1 text-lg font-semibold text-gray-900 truncate">{s.nama}</h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{s.jabatan}</p>
                  </div>
                  <div className="flex shrink-0 justify-end space-x-2">
                    <Link
                      to={`/dashboard/structurals/edit/${s._id}`}
                      className="rounded-md bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick({ _id: s._id, nama: s.nama })}
                      className="rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <Users size={48} className="mx-auto mb-4 text-indigo-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Belum ada data struktural</h3>
          <p className="mb-4 text-gray-600">
            Tambahkan data struktural jabatan untuk ditampilkan di halaman Tentang.
          </p>
          <Link
            to="/dashboard/structurals/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah Data Struktural
          </Link>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus data struktural "${selected?.nama || ''}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default StructuralList;

