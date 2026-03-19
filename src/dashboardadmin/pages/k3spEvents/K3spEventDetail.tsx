import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { k3spEventAPI } from '../../../services/api';

const K3spEventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteK3spEvent } = useCampusData();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await k3spEventAPI.getById(id || '');
        setEvent(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching k3sp event:', err);
        setError('Gagal memuat data kegiatan');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Kegiatan tidak ditemukan</h2>
        <p className="mt-2 text-gray-600">{error || 'Data kegiatan dengan ID tersebut tidak ditemukan.'}</p>
        <Link to="/dashboard/k3sp-events" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke daftar kegiatan
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm(`Anda yakin ingin menghapus kegiatan "${event.nama}"?`)) {
      try {
        await deleteK3spEvent(event._id);
        toast.success('Kegiatan berhasil dihapus');
        navigate('/dashboard/k3sp-events');
      } catch (error) {
        console.error('Error deleting k3sp event:', error);
        toast.error('Gagal menghapus kegiatan');
      }
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/dashboard/k3sp-events" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Kegiatan K3SP</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/dashboard/k3sp-events/edit/${event._id}`}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Edit size={16} className="mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Trash2 size={16} className="mr-2" />
            Hapus
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="relative h-64 w-full">
          <img
            src={
              event.foto
                ? (event.foto.startsWith('http') || event.foto.startsWith('data:')
                  ? event.foto
                  : `${(import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '')}/uploads/${event.foto}`)
                : 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg'
            }
            alt={event.nama}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">{event.nama}</h2>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center">
              <Calendar size={20} className="mr-2 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Tanggal</p>
                <p className="text-gray-900">
                  {new Date(event.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <MapPin size={20} className="mr-2 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Lokasi</p>
                <p className="text-gray-900">{event.lokasi}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="mb-2 flex items-center">
              <FileText size={20} className="mr-2 text-indigo-600" />
              <p className="text-sm font-medium text-gray-500">Deskripsi</p>
            </div>
            <p className="whitespace-pre-line text-gray-700">{event.deskripsi}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default K3spEventDetail;

