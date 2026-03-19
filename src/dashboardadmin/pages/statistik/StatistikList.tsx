import React, { useState } from 'react';
import { useCampusData } from '../../contexts/CampusDataContext';
import { Plus, BarChart3, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const StatistikList: React.FC = () => {
  const { statistics, addStatistik, updateStatistik, deleteStatistik } = useCampusData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setFormName('');
    setFormValue('');
    setFormOrder(statistics.length);
  };

  const handleEdit = (id: string) => {
    const item = statistics.find((s) => s._id === id);
    if (item) {
      setEditingId(id);
      setFormName(item.name);
      setFormValue(item.value);
      setFormOrder(item.order ?? 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formValue.trim()) {
      toast.error('Nama dan nilai wajib diisi');
      return;
    }
    try {
      if (editingId) {
        await updateStatistik(editingId, { name: formName.trim(), value: formValue.trim(), order: formOrder });
        toast.success('Statistik berhasil diperbarui');
      } else {
        await addStatistik({ name: formName.trim(), value: formValue.trim(), order: formOrder });
        toast.success('Statistik berhasil ditambahkan');
      }
      resetForm();
    } catch {
      // error already toasted in context
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedId(id);
    setSelectedName(name);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteStatistik(selectedId);
      toast.success('Statistik berhasil dihapus');
      setShowDeleteConfirm(false);
      setSelectedId(null);
      setSelectedName('');
    } catch {
      // error already toasted
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Data Statistik</h1>
      <p className="text-gray-600 mb-6">
        Kelola data statistik yang ditampilkan di bagian Beranda (landing page). Urutan mengikuti kolom Order.
      </p>

      {/* Form Tambah / Edit */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Statistik' : 'Tambah Statistik Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:items-end">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama</label>
            <input
              type="text"
              id="name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Contoh: Data Guru"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700">Nilai</label>
            <input
              type="text"
              id="value"
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              placeholder="Contoh: 870+"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-gray-700">Urutan</label>
            <input
              type="number"
              id="order"
              min={0}
              value={formOrder}
              onChange={(e) => setFormOrder(parseInt(e.target.value, 10) || 0)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {editingId ? 'Perbarui' : 'Tambah'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Daftar Statistik */}
      {statistics.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urutan</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statistics.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.value}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.order ?? 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      type="button"
                      onClick={() => handleEdit(item._id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      title="Edit"
                    >
                      <Edit size={18} className="inline" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(item._id, item.name)}
                      className="text-red-600 hover:text-red-900"
                      title="Hapus"
                    >
                      <Trash2 size={18} className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <BarChart3 size={48} className="mx-auto mb-4 text-indigo-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Belum ada data statistik</h3>
          <p className="text-gray-600">Tambah statistik untuk ditampilkan di halaman Beranda.</p>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus statistik "${selectedName}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => { setShowDeleteConfirm(false); setSelectedId(null); setSelectedName(''); }}
      />
    </div>
  );
};

export default StatistikList;
