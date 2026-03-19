import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { Plus, Search, Edit, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const GreetingList: React.FC = () => {
  const { greetings, deleteGreeting } = useCampusData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<{ _id: string; nama: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return greetings;
    return greetings.filter((g) =>
      g.nama.toLowerCase().includes(q) ||
      g.jabatan.toLowerCase().includes(q) ||
      g.kataSambutan.toLowerCase().includes(q)
    );
  }, [greetings, searchTerm]);

  const handleDeleteClick = (g: { _id: string; nama: string }) => {
    setSelected(g);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      await deleteGreeting(selected._id);
      toast.success('Kata pengantar berhasil dihapus');
    } catch (error) {
      console.error('Error deleting greeting:', error);
      toast.error('Gagal menghapus kata pengantar');
    } finally {
      setShowDeleteConfirm(false);
      setSelected(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kata Pengantar</h1>
          <p className="mt-1 text-sm text-gray-600">
            Konten ini akan tampil sebagai modal sambutan di landing page.
          </p>
        </div>
        <Link
          to="/dashboard/greetings/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah Kata Pengantar
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, jabatan, atau isi kata sambutan..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <div
              key={g._id}
              className="overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-indigo-100 flex items-center justify-center">
                    {g.foto ? (
                      <img
                        src={
                          g.foto.startsWith('http') || g.foto.startsWith('data:')
                            ? g.foto
                            : `${(import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '')}/uploads/${g.foto}`
                        }
                        alt={g.nama}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-gray-900">{g.nama}</h3>
                    <p className="truncate text-sm text-gray-600">{g.jabatan}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <p className="line-clamp-5 text-sm leading-relaxed text-gray-700">
                    {g.kataSambutan}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                    <FileText size={14} />
                    {g.createdAt ? new Date(g.createdAt).toLocaleDateString() : '—'}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Link
                      to={`/dashboard/greetings/edit/${g._id}`}
                      className="rounded-md bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick({ _id: g._id, nama: g.nama })}
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
          <FileText size={48} className="mx-auto mb-4 text-indigo-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Belum ada kata pengantar</h3>
          <p className="mb-4 text-gray-600">Silakan tambah kata pengantar untuk ditampilkan di landing page.</p>
          <Link
            to="/dashboard/greetings/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah Kata Pengantar
          </Link>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus kata pengantar dari "${selected?.nama}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default GreetingList;

