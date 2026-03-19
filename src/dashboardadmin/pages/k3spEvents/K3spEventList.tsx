import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { Plus, Search, Eye, Edit, Trash2, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const K3spEventList: React.FC = () => {
  const { k3spEvents, deleteK3spEvent } = useCampusData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<{ _id: string; nama: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredEvents = (k3spEvents || []).filter((event) =>
    event.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.lokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.jenis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (event: { _id: string; nama: string }) => {
    setSelectedEvent(event);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      await deleteK3spEvent(selectedEvent._id);
      toast.success('Kegiatan K3SP berhasil dihapus');
      setShowDeleteConfirm(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error deleting k3sp event:', error);
      toast.error('Gagal menghapus kegiatan K3SP');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kegiatan K3SP</h1>
        <Link
          to="/dashboard/k3sp-events/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah Kegiatan K3SP
        </Link>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kegiatan K3SP..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <div key={event._id} className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg">
              <div className="relative h-48 w-full">
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${
                      event.foto
                        ? (event.foto.startsWith('http') || event.foto.startsWith('data:')
                          ? event.foto
                          : `${(import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '')}/uploads/${event.foto}`)
                        : 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg'
                    })`,
                  }}
                />

                <div className="absolute top-2 left-2 flex flex-wrap gap-2">
                  {event.jenis && (
                    <span className="bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow">
                      {event.jenis}
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{event.nama}</h3>
                <div className="mb-3 flex items-center text-sm text-gray-500">
                  <Calendar size={16} className="mr-1" />
                  <span>{event.tanggal}</span>
                </div>
                <p className="mb-4 text-sm text-gray-600 line-clamp-2">{event.deskripsi}</p>

                <div className="flex justify-end space-x-2">
                  <Link
                    to={`/dashboard/k3sp-events/${event._id}`}
                    className="rounded-md bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
                    title="Lihat Detail"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    to={`/dashboard/k3sp-events/edit/${event._id}`}
                    className="rounded-md bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(event)}
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
          <Calendar size={48} className="mx-auto mb-4 text-indigo-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Tidak ada kegiatan K3SP</h3>
          <p className="mb-4 text-gray-600">Belum ada data kegiatan K3SP yang tersedia atau sesuai dengan pencarian.</p>
          <Link
            to="/dashboard/k3sp-events/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah Kegiatan K3SP
          </Link>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus kegiatan K3SP "${selectedEvent?.nama}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default K3spEventList;

