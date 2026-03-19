import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { useCampusData } from '../../contexts/CampusDataContext';

const ProgramList: React.FC = () => {
  const { programs, deleteProgram } = useCampusData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<{ _id: string; title: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return programs;
    return programs.filter((p) => (p.title || '').toLowerCase().includes(q));
  }, [programs, searchTerm]);

  const handleDeleteClick = (program: { _id: string; title: string }) => {
    setSelected(program);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      await deleteProgram(selected._id);
      toast.success('Program berhasil dihapus');
      setShowDeleteConfirm(false);
      setSelected(null);
    } catch (error) {
      console.error('Error deleting program:', error);
      toast.error('Gagal menghapus program');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Program Pembelajaran</h1>
        <Link
          to="/dashboard/programs/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah Program
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari program..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filtered.map((p) => (
            <div
              key={p._id}
              className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                        Order: {p.order ?? 0}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900 line-clamp-2">
                      {p.title}
                    </h3>
                  </div>
                  <div className="flex shrink-0 justify-end space-x-2">
                    <Link
                      to={`/dashboard/programs/edit/${p._id}`}
                      className="rounded-md bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick({ _id: p._id, title: p.title })}
                      className="rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <Layers size={48} className="mx-auto mb-4 text-indigo-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Belum ada program</h3>
          <p className="mb-4 text-gray-600">Tambahkan program untuk ditampilkan di landing page.</p>
          <Link
            to="/dashboard/programs/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah Program
          </Link>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus program "${selected?.title || ''}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default ProgramList;

