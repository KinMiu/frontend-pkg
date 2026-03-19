import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { ArrowLeft, Edit, Trash2, Calendar, Users, FileText, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { achievementAPI } from '../../../services/api';
import { Achievement } from '../../types';

const AchievementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteAchievement } = useCampusData();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        setLoading(true);
        const data = await achievementAPI.getById(id || '');
        setAchievement(data ?? null);
        setError(null);
      } catch (err) {
        console.error('Error fetching achievement:', err);
        setError('Gagal memuat data prestasi');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAchievement();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (error || !achievement) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Prestasi tidak ditemukan</h2>
        <p className="mt-2 text-gray-600">{error || 'Data prestasi dengan ID tersebut tidak ditemukan.'}</p>
        <Link to="/dashboard/achievements" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeft size={16} className="mr-2" />
          Kembali ke daftar prestasi
        </Link>
      </div>
    );
  }

  const mahasiswaList = Array.isArray(achievement.mahasiswa)
    ? achievement.mahasiswa
    : typeof achievement.mahasiswa === 'string' && achievement.mahasiswa
      ? [achievement.mahasiswa]
      : [];

  const handleDelete = async () => {
    if (window.confirm(`Anda yakin ingin menghapus prestasi "${achievement.judul}"?`)) {
      try {
        await deleteAchievement(achievement._id);
        toast.success('Prestasi berhasil dihapus');
        navigate('/dashboard/achievements');
      } catch (error) {
        console.error('Error deleting achievement:', error);
        toast.error('Gagal menghapus prestasi');
      }
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/dashboard/achievements" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Prestasi</h1>
        </div>
        <div className="flex space-x-2">
          <Link
            to={`/dashboard/achievements/edit/${achievement._id}`}
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
          {(() => {
            const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
            const src =
              achievement.foto && (achievement.foto.startsWith('http') || achievement.foto.startsWith('data:'))
                ? achievement.foto
                : achievement.foto
                  ? `${baseUrl}/uploads/${achievement.foto}`
                  : '';
            if (!src) {
              return <div className="h-full w-full bg-gray-200" />;
            }
            return (
              <img 
                src={src} 
                alt={achievement.judul} 
                className="h-full w-full object-cover"
              />
            );
          })()}
        </div>
        
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">{achievement.judul}</h2>
          
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center">
              <Calendar size={20} className="mr-2 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Tanggal</p>
                <p className="text-gray-900">{achievement.tahun}</p>
              </div>
            </div>
            {achievement.satminkal && (
              <div className="flex items-center">
                <Building2 size={20} className="mr-2 text-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">SATMINKAL</p>
                  <p className="text-gray-900">{achievement.satminkal}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start">
              <Users size={20} className="mr-2 mt-1 flex-shrink-0 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Mahasiswa</p>
                <div className="flex flex-wrap gap-1">
                  {mahasiswaList.map((student: string, index: number) => (
                    <span 
                      key={index}
                      className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800"
                    >
                      {student}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="mb-2 flex items-center">
              <FileText size={20} className="mr-2 text-indigo-600" />
              <p className="text-sm font-medium text-gray-500">Deskripsi</p>
            </div>
            <p className="whitespace-pre-line text-gray-700">{achievement.deskripsi}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementDetail;