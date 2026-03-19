import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { useCampusData } from '../../contexts/CampusDataContext';
import { compressImageFile } from '../../../utils/imageCompression';
import type { Structural } from '../../types';

const emptyStructural: Structural = {
  _id: '',
  nama: '',
  jabatan: '',
  foto: '',
  order: 0,
};

const StructuralForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addStructural, updateStructural, getStructuralById } = useCampusData();

  const [structural, setStructural] = useState<Structural>(emptyStructural);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!isEditing || !id) return;
      try {
        const existing = await getStructuralById(id);
        if (!existing) {
          toast.error('Data struktural tidak ditemukan');
          navigate('/dashboard/structurals');
          return;
        }
        setStructural({
          ...emptyStructural,
          ...existing,
          nama: existing.nama || '',
          jabatan: existing.jabatan || '',
          foto: existing.foto || '',
          order: existing.order ?? 0,
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
        console.error('Error fetching structural:', error);
        toast.error('Gagal mengambil data struktural');
        navigate('/dashboard/structurals');
      }
    };
    fetchData();
  }, [id, isEditing, getStructuralById, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'order') {
      const n = Number(value);
      setStructural((prev) => ({ ...prev, order: Number.isFinite(n) ? n : 0 }));
      return;
    }
    setStructural((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
      });
      setSelectedFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } catch {
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!structural.nama.trim()) newErrors.nama = 'Nama wajib diisi';
    if (!structural.jabatan.trim()) newErrors.jabatan = 'Jabatan wajib diisi';
    if (!structural.foto && !selectedFile && !isEditing) newErrors.foto = 'Foto wajib diisi';
    if ((structural.order ?? 0) < 0) newErrors.order = 'Order minimal 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
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
      formData.append('nama', structural.nama.trim());
      formData.append('jabatan', structural.jabatan.trim());
      formData.append('order', String(structural.order ?? 0));

      if (selectedFile) {
        formData.append('foto', selectedFile);
      }

      if (isEditing && id) {
        await updateStructural(id, formData);
        toast.success('Data struktural berhasil diperbarui');
      } else {
        await addStructural(formData);
        toast.success('Data struktural berhasil ditambahkan');
      }
      navigate('/dashboard/structurals');
    } catch (error) {
      console.error('Error saving structural:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setShowSaveConfirm(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/dashboard/structurals" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Data Struktural' : 'Tambah Data Struktural'}
        </h1>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5">
              <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
                <div className="shrink-0">
                  <div className="relative h-32 w-32">
                    {imagePreview ? (
                      <img
                        className="h-32 w-32 rounded-2xl object-cover shadow-sm ring-1 ring-gray-200"
                        src={imagePreview}
                        alt="Preview foto"
                      />
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gray-200">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-800">Upload Foto</label>
                  <p className="mt-1 text-xs text-gray-500">
                    Digunakan sebagai foto struktur pada halaman Tentang. PNG/JPG/WebP maksimal 5MB.
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Pilih Foto
                    </button>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setStructural((prev) => ({ ...prev, foto: '' }));
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-100"
                      >
                        Hapus Foto
                      </button>
                    )}
                  </div>
                  {errors.foto && <p className="mt-2 text-sm text-red-600">{errors.foto}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  value={structural.nama}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.nama ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                />
                {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
              </div>

              <div>
                <label htmlFor="jabatan" className="block text-sm font-medium text-gray-700">
                  Jabatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="jabatan"
                  name="jabatan"
                  value={structural.jabatan}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.jabatan ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                />
                {errors.jabatan && <p className="mt-1 text-sm text-red-600">{errors.jabatan}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                Order Tampil
              </label>
              <input
                type="number"
                id="order"
                name="order"
                value={structural.order ?? 0}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.order ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                min={0}
              />
              {errors.order && <p className="mt-1 text-sm text-red-600">{errors.order}</p>}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
            <Link
              to="/dashboard/structurals"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title="Konfirmasi Simpan"
        message={`Apakah Anda yakin ingin ${isEditing ? 'memperbarui' : 'menyimpan'} data struktural ini?`}
        confirmLabel={isEditing ? 'Perbarui' : 'Simpan'}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default StructuralForm;

