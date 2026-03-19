import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { Plus, Search, Edit, Trash2, Eye, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const FacilityList: React.FC = () => {
  const { facilities, deleteFacility } = useCampusData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<{ _id: string; nama: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewFacility, setViewFacility] = useState<typeof facilities[0] | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isDescriptionLong = (text: string) => text.length > 100;

  const filteredFacilities = facilities.filter((facility) =>
    facility.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (facility: { _id: string; nama: string }) => {
    setSelectedFacility(facility);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedFacility) return;

    try {
      await deleteFacility(selectedFacility._id);
      toast.success('Fasilitas berhasil dihapus');
      setShowDeleteConfirm(false);
      setSelectedFacility(null);
    } catch (error) {
      console.error('Error deleting facility:', error);
      toast.error('Gagal menghapus fasilitas');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Fasilitas</h1>
        <Link
          to="/dashboard/facilities/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah Fasilitas
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari fasilitas..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredFacilities.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Fasilitas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gambar
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFacilities.map((facility, index) => (
                <tr key={facility._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{facility.nama}</div>
                    <div className="text-sm text-gray-500 max-w-md">
                      {expandedDescriptions.has(facility._id) ? (
                        <>
                          {facility.deskripsi}
                          <button
                            onClick={() => toggleDescription(facility._id)}
                            className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Sembunyikan
                          </button>
                        </>
                      ) : (
                        <>
                          {isDescriptionLong(facility.deskripsi)
                            ? `${facility.deskripsi.substring(0, 100)}...`
                            : facility.deskripsi}
                          {isDescriptionLong(facility.deskripsi) && (
                            <button
                              onClick={() => toggleDescription(facility._id)}
                              className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Lihat selengkapnya
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={
                        facility.foto
                          ? (facility.foto.startsWith('http') || facility.foto.startsWith('data:')
                            ? facility.foto
                            : `${(import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '')}/uploads/${facility.foto}`)
                          : 'https://via.placeholder.com/80x48?text=No+Image'
                      }
                      alt={facility.nama}
                      className="h-12 w-20 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/80x48?text=No+Image';
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setViewFacility(facility)}
                        className="rounded-md bg-green-50 p-1.5 text-green-600 hover:bg-green-100 transition-colors"
                        title="Lihat Fasilitas"
                      >
                        <Eye size={16} />
                      </button>
                      <Link
                        to={`/dashboard/facilities/edit/${facility._id}`}
                        className="rounded-md bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit Fasilitas"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(facility)}
                        className="rounded-md bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                        title="Hapus Fasilitas"
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
          <Building2 size={48} className="mx-auto mb-4 text-blue-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Tidak ada fasilitas</h3>
          <p className="mb-4 text-gray-600">
            Belum ada data fasilitas yang tersedia atau sesuai dengan pencarian.
          </p>
          <Link
            to="/dashboard/facilities/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah Fasilitas Baru
          </Link>
        </div>
      )}

      {viewFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">{viewFacility.nama}</h2>
                <button
                  onClick={() => setViewFacility(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <img
                src={
                  viewFacility.foto
                    ? (viewFacility.foto.startsWith('http') || viewFacility.foto.startsWith('data:')
                      ? viewFacility.foto
                      : `${(import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '')}/uploads/${viewFacility.foto}`)
                    : 'https://via.placeholder.com/600x400?text=No+Image'
                }
                alt={viewFacility.nama}
                className="w-full h-64 object-cover rounded-lg mb-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                }}
              />
              <p className="text-gray-600">{viewFacility.deskripsi}</p>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus fasilitas "${selectedFacility?.nama}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default FacilityList;
