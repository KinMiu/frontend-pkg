import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { Plus, Search, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { settingsAPI } from '../../../services/api';

const BannerList: React.FC = () => {
  const { banners, deleteBanner } = useCampusData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<{ _id: string; nama?: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hideMainHero, setHideMainHero] = useState(false);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return banners;
    return banners.filter((b) => (b.nama || '').toLowerCase().includes(q));
  }, [banners, searchTerm]);

  const handleDeleteClick = (banner: { _id: string; nama?: string }) => {
    setSelected(banner);
    setShowDeleteConfirm(true);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await settingsAPI.getTheme();
        if (!mounted) return;
        setHideMainHero(!!data.hideMainHero);
      } catch (error) {
        console.error('Failed to load hero banner setting', error);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleToggleHideMainHero = async (next: boolean) => {
    setHideMainHero(next);
    try {
      await settingsAPI.updateTheme({ hideMainHero: next });
      toast.success(
        next
          ? 'Banner utama di halaman depan disembunyikan'
          : 'Banner utama di halaman depan ditampilkan kembali'
      );
    } catch (error) {
      console.error('Failed to update hero banner setting', error);
      setHideMainHero((prev) => !prev);
      toast.error('Gagal menyimpan pengaturan banner utama');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selected) return;
    try {
      await deleteBanner(selected._id);
      toast.success('Banner berhasil dihapus');
      setShowDeleteConfirm(false);
      setSelected(null);
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Gagal menghapus banner');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Banner</h1>
        <Link
          to="/dashboard/banners/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Upload Banner
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative md:flex-1">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari banner..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3">
          <span className="text-sm text-gray-700 whitespace-nowrap">
            Sembunyikan banner utama di home
          </span>
          <button
            type="button"
            onClick={() => handleToggleHideMainHero(!hideMainHero)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              hideMainHero ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
            aria-pressed={hideMainHero}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                hideMainHero ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((banner) => {
            const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
            const fotoSrc =
              banner.foto && (banner.foto.startsWith('http') || banner.foto.startsWith('data:'))
                ? banner.foto
                : banner.foto
                  ? `${baseUrl}/uploads/${banner.foto}`
                  : '';

            return (
            <div
              key={banner._id}
              className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="relative">
                <img
                  src={fotoSrc}
                  alt={banner.nama || 'Banner'}
                  className="h-44 w-full object-cover"
                />
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      banner.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {banner.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                    Order: {banner.order ?? 0}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                    {banner.nama?.trim() ? banner.nama : 'Banner'}
                  </h3>
                  <div className="flex shrink-0 justify-end space-x-2">
                    <Link
                      to={`/dashboard/banners/edit/${banner._id}`}
                      className="rounded-md bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(banner)}
                      className="rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ImageIcon size={16} />
                  <span className="truncate">{banner.foto?.startsWith('data:') ? 'Gambar tersimpan' : banner.foto}</span>
                </div>
              </div>
            </div>
          );})}
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <ImageIcon size={48} className="mx-auto mb-4 text-indigo-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Belum ada banner</h3>
          <p className="mb-4 text-gray-600">Upload banner untuk ditampilkan di Hero landing page.</p>
          <Link
            to="/dashboard/banners/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Upload Banner
          </Link>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus banner "${selected?.nama || 'Banner'}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default BannerList;

