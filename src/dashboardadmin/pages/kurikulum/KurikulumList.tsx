import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { Plus, Search, Edit, Trash2, Eye, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const KurikulumList: React.FC = () => {
  const { kurikulums, deleteKurikulum } = useCampusData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKurikulum, setSelectedKurikulum] = useState<{ _id: string; nama: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewKurikulum, setViewKurikulum] = useState<typeof kurikulums[0] | null>(null);

  const filteredKurikulums = kurikulums.filter((kurikulum) =>
    kurikulum.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (kurikulum: { _id: string; nama: string }) => {
    setSelectedKurikulum(kurikulum);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedKurikulum) return;

    try {
      await deleteKurikulum(selectedKurikulum._id);
      toast.success('Kurikulum berhasil dihapus');
      setShowDeleteConfirm(false);
      setSelectedKurikulum(null);
    } catch (error) {
      console.error('Error deleting kurikulum:', error);
      toast.error('Gagal menghapus kurikulum');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Kurikulum</h1>
        <Link
          to="/dashboard/kurikulums/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah Kurikulum
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kurikulum..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredKurikulums.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Kurikulum
                </th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah Mata Kuliah
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKurikulums.map((kurikulum, index) => (
                <tr key={kurikulum._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{kurikulum.nama}</div>
                    <div className="text-sm text-gray-500 max-w-md truncate">
                      {kurikulum.deskripsi}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {kurikulum.mataKuliah?.length || 0} mata kuliah
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setViewKurikulum(kurikulum)}
                        className="rounded-md bg-green-50 p-1.5 text-green-600 hover:bg-green-100 transition-colors"
                        title="Lihat Kurikulum"
                      >
                        <Eye size={16} />
                      </button>
                      <Link
                        to={`/dashboard/kurikulums/edit/${kurikulum._id}`}
                        className="rounded-md bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit Kurikulum"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(kurikulum)}
                        className="rounded-md bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                        title="Hapus Kurikulum"
                      >
                        <Trash2 size={16} />
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
          <h3 className="mb-2 text-xl font-medium text-gray-900">Tidak ada kurikulum</h3>
          <p className="mb-4 text-gray-600">
            Belum ada data kurikulum yang tersedia atau sesuai dengan pencarian.
          </p>
          <Link
            to="/dashboard/kurikulums/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah Kurikulum Baru
          </Link>
        </div>
      )}

      {viewKurikulum && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{viewKurikulum.nama}</h2>
                <button
                  onClick={() => setViewKurikulum(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">{viewKurikulum.deskripsi}</p>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mata Kuliah:</h3>
                <ul className="space-y-2">
                  {viewKurikulum.mataKuliah?.map((mk, index) => (
                    <li key={index} className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-2">
                      <div className="h-2 w-2 bg-blue-600 rounded-full mr-3" />
                      {mk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus kurikulum "${selectedKurikulum?.nama}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default KurikulumList;
