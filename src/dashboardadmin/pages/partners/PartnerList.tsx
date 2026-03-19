import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { Plus, Search, Edit, Trash2, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const PartnerList: React.FC = () => {
  const { partners, deletePartner } = useCampusData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<{ _id: string; name: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredPartners = partners.filter((partner) =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (partner: { _id: string; name: string }) => {
    setSelectedPartner(partner);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPartner) return;

    try {
      await deletePartner(selectedPartner._id);
      toast.success('Partner berhasil dihapus');
      setShowDeleteConfirm(false);
      setSelectedPartner(null);
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Gagal menghapus partner');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data partner</h1>
        <Link
          to="/dashboard/partners/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah partner
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari partner..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Partners Grid */}
      {filteredPartners.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => (
            <div
              key={partner._id}
              className="flex items-center bg-white rounded-lg shadow-sm p-4 transition-all hover:shadow-md"
            >
              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                <img
                  src={
                    partner.logo
                      ? (partner.logo.startsWith('http') || partner.logo.startsWith('data:')
                        ? partner.logo
                        : `${(import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '')}/uploads/${partner.logo}`)
                      : 'https://via.placeholder.com/200x100?text=Logo+Not+Found'
                  }
                  alt={partner.name}
                  className="max-h-14 max-w-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/200x100?text=Logo+Not+Found';
                  }}
                />
              </div>
              <div className="flex-grow px-4 min-w-0">
                <h3 className="text-base font-medium text-gray-900 truncate">{partner.name}</h3>
              </div>
              <div className="flex-shrink-0 flex gap-2">
                <Link
                  to={`/dashboard/partners/edit/${partner._id}`}
                  className="rounded-md bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </Link>
                <button
                  onClick={() => handleDeleteClick(partner)}
                  className="rounded-md bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <Building size={48} className="mx-auto mb-4 text-indigo-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Tidak ada partner</h3>
          <p className="mb-4 text-gray-600">
            Belum ada data partner yang tersedia atau sesuai dengan pencarian.
          </p>
          <Link
            to="/dashboard/partners/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah partner Baru
          </Link>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus partner "${selectedPartner?.name}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default PartnerList;