import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Testimonial } from '../../types';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { compressImageFile } from '../../../utils/imageCompression';

const emptyTestimonial: Testimonial = {
  _id: '',
  name: '',
  tahunlulus: '',
  pekerjaan: '',
  perusahaan: '',
  image: '',
  testimoni: '',
};

const TestimonialForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addTestimonial, updateTestimonial, getTestimonialById } = useCampusData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [testimonial, setTestimonial] = useState<Testimonial>(emptyTestimonial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const isEditing = !!id;
  
  useEffect(() => {
    const fetchData = async () => {
      if (isEditing && id) {
        try {
          const existingTestimonial = await getTestimonialById(id);
          if (existingTestimonial) {
            setTestimonial(existingTestimonial);

            if (existingTestimonial.image) {
              const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
              const src =
                existingTestimonial.image.startsWith('http') ||
                existingTestimonial.image.startsWith('data:')
                  ? existingTestimonial.image
                  : `${baseUrl}/uploads/${existingTestimonial.image}`;
              setImagePreview(src);
            }
          } else {
            navigate('/dashboard/testimonials');
            toast.error('Testimoni tidak ditemukan');
          }
        } catch (error) {
          console.error('Error fetching testimonial:', error);
          toast.error('Gagal mengambil data testimoni');
          navigate('/dashboard/testimonials');
        }
      }
    };

    fetchData();
  }, [id, getTestimonialById, navigate, isEditing]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 600,
        maxHeight: 600,
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
    
    if (!testimonial.name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!testimonial.tahunlulus.trim()) newErrors.tahunlulus = 'Tahun lulus wajib diisi';
    if (!testimonial.pekerjaan.trim()) newErrors.pekerjaan = 'Pekerjaan wajib diisi';
    if (!testimonial.perusahaan.trim()) newErrors.perusahaan = 'Perusahaan wajib diisi';
    if (!testimonial.testimoni.trim()) newErrors.testimoni = 'Testimoni wajib diisi';
    if (!testimonial.image && !selectedFile && !isEditing) newErrors.image = 'Foto wajib diisi';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTestimonial((prev) => ({ ...prev, [name]: value }));
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
      formData.append('name', testimonial.name);
      formData.append('tahunlulus', testimonial.tahunlulus);
      formData.append('pekerjaan', testimonial.pekerjaan);
      formData.append('perusahaan', testimonial.perusahaan);
      formData.append('testimoni', testimonial.testimoni);

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      if (isEditing && id) {
        await updateTestimonial(id, formData);
        toast.success('Testimoni berhasil diperbarui');
      } else {
        await addTestimonial(formData);
        toast.success('Testimoni berhasil ditambahkan');
      }
      navigate('/dashboard/testimonials');
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/dashboard/testimonials" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Testimoni' : 'Tambah Testimoni Baru'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Profile Image */}
            <div>
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  <div className="relative h-32 w-32">
                    {imagePreview ? (
                      <img
                        className="h-32 w-32 object-cover rounded-full"
                        src={imagePreview}
                        alt="Profile preview"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Foto Profil</label>
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
                      Pilih Foto
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={testimonial.name}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="tahunlulus" className="block text-sm font-medium text-gray-700">
                  Tahun Lulus <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="tahunlulus"
                  name="tahunlulus"
                  value={testimonial.tahunlulus}
                  onChange={handleChange}
                  placeholder="Contoh: 2018"
                  className={`mt-1 block w-full rounded-md border ${
                    errors.tahunlulus ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                />
                {errors.tahunlulus && <p className="mt-1 text-sm text-red-600">{errors.tahunlulus}</p>}
              </div>

              <div>
                <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700">
                  Pekerjaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="pekerjaan"
                  name="pekerjaan"
                  value={testimonial.pekerjaan}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.pekerjaan ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                />
                {errors.pekerjaan && <p className="mt-1 text-sm text-red-600">{errors.pekerjaan}</p>}
              </div>

              <div>
                <label htmlFor="perusahaan" className="block text-sm font-medium text-gray-700">
                  Perusahaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="perusahaan"
                  name="perusahaan"
                  value={testimonial.perusahaan}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.perusahaan ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                />
                {errors.perusahaan && <p className="mt-1 text-sm text-red-600">{errors.perusahaan}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="testimoni" className="block text-sm font-medium text-gray-700">
                Testimoni <span className="text-red-500">*</span>
              </label>
              <textarea
                id="testimoni"
                name="testimoni"
                rows={4}
                value={testimonial.testimoni}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.testimoni ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              />
              {errors.testimoni && <p className="mt-1 text-sm text-red-600">{errors.testimoni}</p>}
            </div>
          </div>

          {/* Submit buttons */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <Link
              to="/dashboard/testimonials"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isEditing ? 'Perbarui Testimoni' : 'Simpan Testimoni'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title="Konfirmasi Simpan"
        message={`Apakah Anda yakin ingin ${isEditing ? 'memperbarui' : 'menyimpan'} testimoni ini?`}
        confirmLabel={isEditing ? 'Perbarui' : 'Simpan'}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default TestimonialForm;