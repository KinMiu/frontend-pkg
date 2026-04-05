import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { useCampusData } from '../../contexts/CampusDataContext';
import { compressImageFile } from '../../../utils/imageCompression';
import type { Banner } from '../../types';

const emptyBanner: Banner = {
  _id: '',
  nama: '',
  foto: '',
  isActive: true,
  order: 0,
  imagePosition: '50% 50%',
  imageScale: 1,
  hideHeroText: false,
};

function parsePosition(pos: string): { x: number; y: number } {
  const parts = (pos || '50% 50%').trim().split(/\s+/);
  const x = Math.min(100, Math.max(0, parseFloat(String(parts[0]).replace('%', '')) || 50));
  const y = Math.min(100, Math.max(0, parseFloat(String(parts[1] || parts[0]).replace('%', '')) || 50));
  return { x, y };
}

function formatPosition(x: number, y: number): string {
  return `${Math.round(x)}% ${Math.round(y)}%`;
}

const BannerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addBanner, updateBanner, getBannerById } = useCampusData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroFrameRef = useRef<HTMLDivElement>(null);

  const [banner, setBanner] = useState<Banner>(emptyBanner);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [dragState, setDragState] = useState<{ startX: number; startY: number; startPos: { x: number; y: number } } | null>(null);
  const [zoomInput, setZoomInput] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      if (!isEditing || !id) return;
      try {
        const existing = await getBannerById(id);
        if (!existing) {
          toast.error('Banner tidak ditemukan');
          navigate('/dashboard/banners');
          return;
        }
        setBanner({
          ...emptyBanner,
          ...existing,
          nama: existing.nama || '',
          order: existing.order ?? 0,
          isActive: existing.isActive ?? true,
          imagePosition: existing.imagePosition ?? '50% 50%',
          imageScale: existing.imageScale ?? 1,
          hideHeroText: existing.hideHeroText ?? false,
        });

        if (existing.foto) {
          const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
          const src =
            existing.foto.startsWith('http') || existing.foto.startsWith('data:')
              ? existing.foto
              : `${baseUrl}/uploads/${existing.foto}`;
          setImagePreview(src);
        }
      } catch (error) {
        console.error('Error fetching banner:', error);
        toast.error('Gagal mengambil data banner');
        navigate('/dashboard/banners');
      }
    };

    fetchData();
  }, [id, isEditing, getBannerById, navigate]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9,
      });
      setSelectedFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } catch {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setBanner((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (name === 'order') {
      const n = Number(value);
      setBanner((prev) => ({ ...prev, order: Number.isFinite(n) ? n : 0 }));
      return;
    }
    setBanner((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!banner.foto && !selectedFile && !isEditing) newErrors.foto = 'Foto banner wajib diisi';
    if (typeof banner.order === 'number' && banner.order < 0) newErrors.order = 'Order minimal 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Periksa kembali inputan!');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    try {
      const formData = new FormData();
      formData.append('nama', banner.nama || '');
      formData.append('order', String(banner.order ?? 0));
      formData.append('isActive', String(!!banner.isActive));
      formData.append('imagePosition', banner.imagePosition || '50% 50%');
      formData.append('imageScale', String(banner.imageScale ?? 1));
      formData.append('hideHeroText', String(!!banner.hideHeroText));

      if (selectedFile) {
        formData.append('foto', selectedFile);
      }

      if (isEditing && id) {
        await updateBanner(id, formData);
        toast.success('Banner berhasil diperbarui');
      } else {
        await addBanner(formData);
        toast.success('Banner berhasil ditambahkan');
      }
      navigate('/dashboard/banners');
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan banner');
    } finally {
      setShowSaveConfirm(false);
    }
  };

  const pos = parsePosition(banner.imagePosition || '50% 50%');
  const scale = Math.min(3, Math.max(0.5, banner.imageScale ?? 1));

  const handleHeroFrameMouseDown = (e: React.MouseEvent) => {
    if (!imagePreview || !heroFrameRef.current) return;
    e.preventDefault();
    setDragState({
      startX: e.clientX,
      startY: e.clientY,
      startPos: { ...pos },
    });
  };

  useEffect(() => {
    if (!dragState) return;
    const onMove = (e: MouseEvent) => {
      if (!heroFrameRef.current) return;
      const rect = heroFrameRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;
      const percentPerPixelX = 100 / rect.width;
      const percentPerPixelY = 100 / rect.height;
      const newX = Math.min(100, Math.max(0, dragState.startPos.x + deltaX * percentPerPixelX));
      const newY = Math.min(100, Math.max(0, dragState.startPos.y + deltaY * percentPerPixelY));
      setBanner((prev) => ({ ...prev, imagePosition: formatPosition(newX, newY) }));
    };
    const onUp = () => setDragState(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragState]);

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/dashboard/banners" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Banner' : 'Upload Banner'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <div className="flex flex-col md:flex-row md:items-start md:space-x-6 gap-4">
                <div className="shrink-0">
                  <div className="relative h-40 w-full md:w-72">
                    {imagePreview ? (
                      <img
                        className="h-40 w-full md:w-72 object-cover rounded-lg"
                        src={imagePreview}
                        alt="Banner preview"
                      />
                    ) : (
                      <div className="h-40 w-full md:w-72 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {errors.foto && <p className="mt-2 text-sm text-red-600">{errors.foto}</p>}
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Gambar Banner</label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Pilih Gambar
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF, WebP up to 5MB</p>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                        Nama Banner (opsional)
                      </label>
                      <input
                        type="text"
                        id="nama"
                        name="nama"
                        value={banner.nama || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Mis. PMB 2026"
                      />
                    </div>

                    <div>
                      <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                        Urutan
                      </label>
                      <input
                        type="number"
                        id="order"
                        name="order"
                        value={banner.order ?? 0}
                        onChange={handleChange}
                        min={0}
                        className={`mt-1 block w-full rounded-md border ${
                          errors.order ? 'border-red-300' : 'border-gray-300'
                        } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                      />
                      {errors.order && <p className="mt-1 text-sm text-red-600">{errors.order}</p>}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={!!banner.isActive}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="isActive" className="text-sm text-gray-700">
                        Tampilkan banner di landing page
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        id="hideHeroText"
                        name="hideHeroText"
                        type="checkbox"
                        checked={!!banner.hideHeroText}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor="hideHeroText" className="text-sm text-gray-700">
                        Sembunyikan teks di Hero
                      </label>
                    </div>
                  </div>

                  {/* Frame ukuran Hero: geser gambar & skala */}
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Posisi & skala gambar di Hero
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Bingkai di bawah adalah ukuran hero di landing. Geser gambar untuk mengatur posisi, lalu atur zoom dengan slider.
                    </p>
                    {imagePreview ? (
                      <div className="space-y-4 max-w-2xl">
                        {/* Hero frame: border ungu + handle di sudut */}
                        <div
                          ref={heroFrameRef}
                          className="relative rounded-lg bg-gray-100 select-none cursor-move overflow-hidden"
                          style={{ aspectRatio: '16/9' }}
                          onMouseDown={handleHeroFrameMouseDown}
                        >
                          <div className="absolute inset-0 overflow-hidden rounded-lg ring-4 ring-violet-500/80 ring-inset">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-full w-full object-cover pointer-events-none"
                              style={{
                                objectPosition: banner.imagePosition || '50% 50%',
                                transform: `scale(${scale})`,
                                transformOrigin: banner.imagePosition || '50% 50%',
                              }}
                              draggable={false}
                            />
                          </div>
                          {/* Corner handles (lingkaran putih seperti frame crop) */}
                          <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-white border-2 border-violet-500 shadow" />
                          <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-white border-2 border-violet-500 shadow" />
                          <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-white border-2 border-violet-500 shadow" />
                          <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-white border-2 border-violet-500 shadow" />
                          {dragState && (
                            <div className="absolute inset-0 bg-violet-400/10 pointer-events-none flex items-center justify-center">
                              <span className="text-sm font-medium text-violet-700 bg-white/90 px-3 py-1 rounded">Geser untuk mengatur posisi</span>
                            </div>
                          )}
                        </div>
                        {/* Slider skala + input persen */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm text-gray-600 shrink-0">Zoom:</span>
                          <input
                            type="range"
                            min={50}
                            max={300}
                            value={Math.round((scale ?? 1) * 100)}
                            onChange={(e) => {
                              const v = Number(e.target.value) / 100;
                              setBanner((prev) => ({ ...prev, imageScale: v }));
                              setZoomInput('');
                            }}
                            className="flex-1 min-w-[120px] h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-violet-600"
                          />
                          <div className="flex items-center gap-1 shrink-0">
                            <input
                              type="text"
                              inputMode="numeric"
                              min={50}
                              max={300}
                              value={zoomInput !== '' ? zoomInput : Math.round((scale ?? 1) * 100)}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^0-9]/g, '');
                                setZoomInput(raw);
                                const n = raw === '' ? undefined : parseInt(raw, 10);
                                if (n !== undefined && !isNaN(n) && n >= 50 && n <= 300) {
                                  setBanner((prev) => ({ ...prev, imageScale: n / 100 }));
                                }
                              }}
                              onFocus={() => setZoomInput(String(Math.round((scale ?? 1) * 100)))}
                              onBlur={() => setZoomInput('')}
                              placeholder="50–300"
                              className="w-14 rounded border border-gray-300 px-2 py-1 text-sm text-right font-medium text-gray-700"
                            />
                            <span className="text-sm font-medium text-gray-700">%</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Upload gambar terlebih dahulu untuk mengatur posisi dan skala.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
            <Link
              to="/dashboard/banners"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isEditing ? 'Perbarui Banner' : 'Simpan Banner'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title="Konfirmasi Simpan"
        message={`Apakah Anda yakin ingin ${isEditing ? 'memperbarui' : 'menyimpan'} banner ini?`}
        confirmLabel={isEditing ? 'Perbarui' : 'Simpan'}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default BannerForm;

