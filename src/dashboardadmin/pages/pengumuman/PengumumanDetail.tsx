import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Edit, Trash2, Megaphone, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { pengumumanAPI } from '../../../services/api';

const PengumumanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { deletePengumuman } = useCampusData();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOperator = (user as { role?: string })?.role === 'operator';
  const operatorSatminkal = (user as { satminkal?: string })?.satminkal?.trim() || '';

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await pengumumanAPI.getById(id || '');
        if (isOperator && operatorSatminkal && (data?.satminkal || '').trim() !== operatorSatminkal) {
          setError('Anda tidak memiliki akses ke pengumuman ini.');
          setItem(null);
          return;
        }
        setItem(data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data pengumuman');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id, isOperator, operatorSatminkal]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Pengumuman tidak ditemukan</h2>
        <p className="mt-2 text-gray-600">{error || 'Data pengumuman dengan ID tersebut tidak ditemukan.'}</p>
        <Link to="/dashboard/pengumuman" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke daftar pengumuman
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm(`Anda yakin ingin menghapus pengumuman "${item.judul}"?`)) {
      try {
        await deletePengumuman(item._id);
        toast.success('Pengumuman berhasil dihapus');
        navigate('/dashboard/pengumuman');
      } catch (err) {
        console.error(err);
        toast.error('Gagal menghapus pengumuman');
      }
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/dashboard/pengumuman" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Pengumuman</h1>
        </div>
        <div className="flex space-x-2">
          <Link to={`/dashboard/pengumuman/edit/${item._id}`} className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Edit size={16} className="mr-2" />
            Edit
          </Link>
          <button onClick={handleDelete} className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            <Trash2 size={16} className="mr-2" />
            Hapus
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="relative h-64 w-full">
          <img
            src={
              item.foto
                ? item.foto.startsWith('http') || item.foto.startsWith('data:')
                  ? item.foto
                  : `${(import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '')}/uploads/${item.foto}`
                : 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg'
            }
            alt={item.judul}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-6">
          {item.satminkal && <p className="text-sm text-blue-600 font-medium mb-2">Satminkal: {item.satminkal}</p>}
          <h2 className="mb-4 text-2xl font-bold text-gray-900">{item.judul}</h2>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center">
              <Megaphone size={20} className="mr-2 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Tanggal</p>
                <p className="text-gray-900">{new Date(item.tanggal).toLocaleDateString ? new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : item.tanggal}</p>
              </div>
            </div>
            {item.lokasi && (
              <div className="flex items-center">
                <MapPin size={20} className="mr-2 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Lokasi</p>
                  <p className="text-gray-900">{item.lokasi}</p>
                </div>
              </div>
            )}
          </div>
          <div className="mb-6">
            <div className="mb-2 flex items-center">
              <FileText size={20} className="mr-2 text-indigo-600" />
              <p className="text-sm font-medium text-gray-500">Deskripsi</p>
            </div>
            <p className="whitespace-pre-line text-gray-700">{item.deskripsi}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PengumumanDetail;
