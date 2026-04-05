import React, { useState } from 'react';
import { useCampusData } from '../../contexts/CampusDataContext';
import { Youtube, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { getYouTubeVideoId } from '../../../utils/youtube';

const FeaturedVideoList: React.FC = () => {
  const { featuredVideos, addFeaturedVideo, updateFeaturedVideo, deleteFeaturedVideo } = useCampusData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState('');

  const resetForm = () => {
    setEditingId(null);
    setFormTitle('');
    setFormUrl('');
    setFormOrder(featuredVideos.length);
  };

  const handleEdit = (id: string) => {
    const item = featuredVideos.find((v) => v._id === id);
    if (item) {
      setEditingId(id);
      setFormTitle(item.title);
      setFormUrl(item.youtubeUrl);
      setFormOrder(item.order ?? 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Judul wajib diisi');
      return;
    }
    if (!formUrl.trim()) {
      toast.error('Link YouTube wajib diisi');
      return;
    }
    if (!getYouTubeVideoId(formUrl)) {
      toast.error('Link YouTube tidak valid (contoh: https://www.youtube.com/watch?v=... atau youtu.be/...)');
      return;
    }
    try {
      if (editingId) {
        await updateFeaturedVideo(editingId, {
          title: formTitle.trim(),
          youtubeUrl: formUrl.trim(),
          order: formOrder,
        });
        toast.success('Video berhasil diperbarui');
      } else {
        await addFeaturedVideo({
          title: formTitle.trim(),
          youtubeUrl: formUrl.trim(),
          order: formOrder,
        });
        toast.success('Video berhasil ditambahkan');
      }
      resetForm();
    } catch {
      // error sudah di-context
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setSelectedId(id);
    setSelectedTitle(title);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedId) return;
    try {
      await deleteFeaturedVideo(selectedId);
      toast.success('Video berhasil dihapus');
      setShowDeleteConfirm(false);
      setSelectedId(null);
      setSelectedTitle('');
    } catch {
      // error sudah di-context
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Link Video YouTube</h1>
      <p className="text-gray-600 mb-6">
        Kelola video yang ditampilkan di halaman Beranda, tepat di atas bagian Kolaborasi. Urutan mengikuti
        kolom Urutan.
      </p>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Video' : 'Tambah Video Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-12 xl:items-end">
          <div className="xl:col-span-3">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Judul
            </label>
            <input
              type="text"
              id="title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Contoh: Profil PKG Barat"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="xl:col-span-5">
            <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
              Link YouTube
            </label>
            <input
              type="url"
              id="youtubeUrl"
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="xl:col-span-2">
            <label htmlFor="order" className="block text-sm font-medium text-gray-700">
              Urutan
            </label>
            <input
              type="number"
              id="order"
              min={0}
              value={formOrder}
              onChange={(e) => setFormOrder(parseInt(e.target.value, 10) || 0)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2 xl:col-span-2">
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

      {featuredVideos.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Judul
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urutan
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {featuredVideos.map((item, index) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[200px] truncate">
                    {item.title}
                  </td>
                  <td className="px-6 py-4 text-sm text-blue-600 max-w-xs truncate">
                    <a href={item.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {item.youtubeUrl}
                    </a>
                  </td>
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
                      onClick={() => handleDeleteClick(item._id, item.title)}
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
          <Youtube size={48} className="mx-auto mb-4 text-red-400" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Belum ada video</h3>
          <p className="text-gray-600">Tambah link YouTube untuk ditampilkan di halaman Beranda.</p>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus video "${selectedTitle}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedId(null);
          setSelectedTitle('');
        }}
      />
    </div>
  );
};

export default FeaturedVideoList;
