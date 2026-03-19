import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, Eye, Edit, Trash2, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const AchievementList: React.FC = () => {
  const { achievements, deleteAchievement } = useCampusData();
  const { user } = useAuth();
  const isOperator = (user as { role?: string })?.role === 'operator';
  const operatorSatminkal = (user as { satminkal?: string })?.satminkal || '';
  const achievementsForRole = isOperator && operatorSatminkal
    ? achievements.filter((a: { satminkal?: string }) => (a.satminkal || '').trim() === operatorSatminkal.trim())
    : achievements;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<{ _id: string; judul: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredAchievements = achievementsForRole.filter((achievement) => {
    const mahasiswaList = Array.isArray(achievement.mahasiswa)
      ? achievement.mahasiswa
      : typeof achievement.mahasiswa === 'string' && achievement.mahasiswa
        ? [achievement.mahasiswa]
        : [];

    return (
      achievement.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mahasiswaList.some(m => m.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const handleDeleteClick = (achievement: { _id: string; judul: string }) => {
    setSelectedAchievement(achievement);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAchievement) return;

    try {
      await deleteAchievement(selectedAchievement._id);
      toast.success('Prestasi berhasil dihapus');
      setShowDeleteConfirm(false);
      setSelectedAchievement(null);
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast.error('Gagal menghapus prestasi');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Prestasi Peserta Didik</h1>
        <Link
          to="/dashboard/achievements/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah Prestasi
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul, siswa, atau deskripsi..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement._id}
              className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div
                className="h-48 w-full bg-cover bg-center"
                style={{
                  backgroundImage: `url(${
                    achievement.foto
                      ? (achievement.foto.startsWith('http') || achievement.foto.startsWith('data:')
                        ? achievement.foto
                        : `${(import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '')}/uploads/${achievement.foto}`)
                      : 'https://via.placeholder.com/600x400?text=No+Image'
                  })`,
                }}
              />
              <div className="p-4">
                {(achievement as { satminkal?: string }).satminkal && (
                  <span className="mb-2 inline-block rounded bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-800">
                    {(achievement as { satminkal?: string }).satminkal}
                  </span>
                )}
                <h3 className="mb-2 text-lg font-medium text-gray-900 line-clamp-2">
                  {achievement.judul}
                </h3>

                <div className="mb-3">
                  <div className="flex items-start">
                    {(
                      Array.isArray(achievement.mahasiswa)
                        ? achievement.mahasiswa
                        : typeof achievement.mahasiswa === 'string' && achievement.mahasiswa
                          ? [achievement.mahasiswa]
                          : []
                    ).map((student, index, arr) => (
                      <span key={index} className="text-sm text-gray-600">
                        {student}
                        {index < arr.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                  {achievement.deskripsi}
                </p>

                <div className="flex justify-end space-x-2">
                  <Link
                    to={`/dashboard/achievements/${achievement._id}`}
                    className="rounded-md bg-indigo-50 p-2 text-indigo-600 hover:bg-indigo-100"
                    title="Lihat Detail"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    to={`/dashboard/achievements/edit/${achievement._id}`}
                    className="rounded-md bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(achievement)}
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
          <Award size={48} className="mx-auto mb-4 text-indigo-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Tidak ada prestasi</h3>
          <p className="mb-4 text-gray-600">
            Belum ada data prestasi mahasiswa yang tersedia atau sesuai dengan pencarian.
          </p>
          <Link
            to="/dashboard/achievements/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah Prestasi Baru
          </Link>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus prestasi "${selectedAchievement?.judul}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default AchievementList;