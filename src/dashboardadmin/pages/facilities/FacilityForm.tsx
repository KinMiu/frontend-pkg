import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Facility } from '../../types';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { compressImageFile } from '../../../utils/imageCompression';

const emptyFacility: Facility = {
  _id: '',
  nama: '',
  deskripsi: '',
  foto: '',
};

const FacilityForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addFacility, updateFacility, getFacilityById } = useCampusData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [facility, setFacility] = useState<Facility>(emptyFacility);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      if (isEditing && id) {
        try {
          const existingFacility = await getFacilityById(id);
          if (existingFacility) {
            setFacility(existingFacility);

            if (existingFacility.foto) {
              const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
              const src =
                existingFacility.foto.startsWith('http') ||
                existingFacility.foto.startsWith('data:')
                  ? existingFacility.foto
                  : `${baseUrl}/uploads/${existingFacility.foto}`;
              setImagePreview(src);
            }
          } else {
            navigate('/dashboard/facilities');
            toast.error('Fasilitas tidak ditemukan');
          }
        } catch (error) {
          console.error('Error fetching facility:', error);
          toast.error('Gagal mengambil data fasilitas');
          navigate('/dashboard/facilities');
        }
      }
    };

    fetchData();
  }, [id, getFacilityById, navigate, isEditing]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.8,
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

    if (!facility.nama.trim()) newErrors.nama = 'Nama fasilitas wajib diisi';
    if (!facility.deskripsi.trim()) newErrors.deskripsi = 'Deskripsi fasilitas wajib diisi';
    if (!facility.foto && !selectedFile && !isEditing) newErrors.foto = 'Gambar fasilitas wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFacility((prev) => ({ ...prev, [name]: value }));
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
      formData.append('nama', facility.nama);
      formData.append('deskripsi', facility.deskripsi);

      if (selectedFile) {
        formData.append('foto', selectedFile);
      }

      if (isEditing && id) {
        await updateFacility(id, formData);
        toast.success('Fasilitas berhasil diperbarui');
      } else {
        await addFacility(formData);
        toast.success('Fasilitas berhasil ditambahkan');
      }
      navigate('/dashboard/facilities');
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/dashboard/facilities" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Fasilitas' : 'Tambah Fasilitas Baru'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                <div className="shrink-0 mb-4 md:mb-0">
                  <div className="relative h-48 w-full md:w-72">
                    {imagePreview ? (
                      <img
                        className="h-48 w-full md:w-72 object-cover rounded-lg"
                        src={imagePreview}
                        alt="Facility preview"
                      />
                    ) : (
                      <div className="h-48 w-full md:w-72 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Gambar Fasilitas</label>
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
                  <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  {errors.foto && <p className="mt-1 text-sm text-red-600">{errors.foto}</p>}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                Nama Fasilitas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={facility.nama}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.nama ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Masukkan nama fasilitas"
              />
              {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
            </div>

            <div>
              <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                rows={4}
                value={facility.deskripsi}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.deskripsi ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Masukkan deskripsi fasilitas"
              />
              {errors.deskripsi && <p className="mt-1 text-sm text-red-600">{errors.deskripsi}</p>}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
            <Link
              to="/dashboard/facilities"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isEditing ? 'Perbarui Fasilitas' : 'Simpan Fasilitas'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title="Konfirmasi Simpan"
        message={`Apakah Anda yakin ingin ${isEditing ? 'memperbarui' : 'menyimpan'} fasilitas ini?`}
        confirmLabel={isEditing ? 'Perbarui' : 'Simpan'}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default FacilityForm;
