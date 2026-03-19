import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Partner } from '../../types';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { compressImageFile } from '../../../utils/imageCompression';

const emptyPartner: Partner = {
  _id: '',
  name: '',
  logo: '',
  link: '',
};

const PartnerForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addPartner, updatePartner, getPartnerById } = useCampusData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [partner, setPartner] = useState<Partner>(emptyPartner);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const isEditing = !!id;
  
  useEffect(() => {
    const fetchData = async () => {
      if (isEditing && id) {
        try {
          const existingPartner = await getPartnerById(id);
          if (existingPartner) {
            setPartner(existingPartner);

            if (existingPartner.logo) {
              const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
              const src =
                existingPartner.logo.startsWith('http') ||
                existingPartner.logo.startsWith('data:')
                  ? existingPartner.logo
                  : `${baseUrl}/uploads/${existingPartner.logo}`;
              setImagePreview(src);
            }
          } else {
            navigate('/dashboard/partners');
            toast.error('partner tidak ditemukan');
          }
        } catch (error) {
          console.error('Error fetching partner:', error);
          toast.error('Gagal mengambil data partner');
          navigate('/dashboard/partners');
        }
      }
    };

    fetchData();
  }, [id, getPartnerById, navigate, isEditing]);

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
    
    if (!partner.name.trim()) newErrors.name = 'Nama partner wajib diisi';
    if (!partner.logo && !selectedFile && !isEditing) newErrors.logo = 'Logo partner wajib diisi';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPartner((prev) => ({ ...prev, [name]: value }));
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
      formData.append('name', partner.name);
      if (partner.link?.trim()) formData.append('link', partner.link.trim());
      if (selectedFile) {
        formData.append('logo', selectedFile);
      }

      if (isEditing && id) {
        await updatePartner(id, formData);
        toast.success('partner berhasil diperbarui');
      } else {
        await addPartner(formData);
        toast.success('partner berhasil ditambahkan');
      }
      navigate('/dashboard/partners');
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/dashboard/partners" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit partner' : 'Tambah partner Baru'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Partner Logo */}
            <div>
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  <div className="relative h-48 w-48">
                    {imagePreview ? (
                      <img
                        className="h-48 w-48 object-contain rounded-lg"
                        src={imagePreview}
                        alt="Partner logo preview"
                      />
                    ) : (
                      <div className="h-48 w-48 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Logo partner</label>
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
                      Pilih Logo
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  {errors.logo && <p className="mt-1 text-sm text-red-600">{errors.logo}</p>}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nama partner <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={partner.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700">
                Link partner
              </label>
              <input
                type="url"
                id="link"
                name="link"
                value={partner.link ?? ''}
                onChange={handleChange}
                placeholder="https://..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">URL yang akan dibuka saat card partner diklik di landing page (kosongkan jika tidak ada link)</p>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <Link
              to="/dashboard/partners"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isEditing ? 'Perbarui partner' : 'Simpan partner'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title="Konfirmasi Simpan"
        message={`Apakah Anda yakin ingin ${isEditing ? 'memperbarui' : 'menyimpan'} partner ini?`}
        confirmLabel={isEditing ? 'Perbarui' : 'Simpan'}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default PartnerForm;