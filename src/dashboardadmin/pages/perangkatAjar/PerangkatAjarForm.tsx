import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import type { PerangkatAjar } from '../../types';
import { useCampusData } from '../../contexts/CampusDataContext';

const emptyPerangkatAjar: PerangkatAjar = {
  _id: '',
  judul: '',
  deskripsi: '',
  kategori: '',
  filePath: '',
  originalName: '',
};

const ACCEPTED_EXT = ['.pdf', '.zip', '.rar', '.doc', '.docx', '.ppt', '.pptx'];

const PerangkatAjarForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addPerangkatAjar, updatePerangkatAjar, getPerangkatAjarById } = useCampusData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [item, setItem] = useState<PerangkatAjar>(emptyPerangkatAjar);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      if (isEditing && id) {
        try {
          const existing = await getPerangkatAjarById(id);
          if (existing) {
            setItem({ ...emptyPerangkatAjar, ...existing });
          } else {
            navigate('/dashboard/perangkat-ajar');
            toast.error('Perangkat ajar tidak ditemukan');
          }
        } catch (error) {
          console.error('Error fetching perangkat ajar:', error);
          toast.error('Gagal mengambil data perangkat ajar');
          navigate('/dashboard/perangkat-ajar');
        }
      }
    };
    fetchData();
  }, [id, getPerangkatAjarById, navigate, isEditing]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!item.judul.trim()) newErrors.judul = 'Judul wajib diisi';
    if (!isEditing && !selectedFile) newErrors.file = 'File wajib diunggah';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItem((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const hasAllowedExt = ACCEPTED_EXT.some((ext) => lowerName.endsWith(ext));
    if (!hasAllowedExt) {
      toast.error(`Format file harus ${ACCEPTED_EXT.join(', ')}`);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 50MB');
      return;
    }

    setSelectedFile(file);
    setErrors((prev) => ({ ...prev, file: '' }));
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('judul', item.judul);
      if (item.deskripsi) formData.append('deskripsi', item.deskripsi);
      if (item.kategori) formData.append('kategori', item.kategori);
      if (selectedFile) formData.append('file', selectedFile);

      if (isEditing && id) {
        await updatePerangkatAjar(id, formData);
        toast.success('Perangkat ajar berhasil diperbarui');
      } else {
        await addPerangkatAjar(formData);
        toast.success('Perangkat ajar berhasil ditambahkan');
      }
      navigate('/dashboard/perangkat-ajar');
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsLoading(false);
      setShowSaveConfirm(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/dashboard/perangkat-ajar" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Perangkat Ajar' : 'Tambah Perangkat Ajar'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="judul" className="block text-sm font-medium text-gray-700">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="judul"
                name="judul"
                value={item.judul}
                onChange={handleChange}
                placeholder="Contoh: Modul Pembelajaran Matematika"
                className={`mt-1 block w-full rounded-md border ${
                  errors.judul ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              {errors.judul && <p className="mt-1 text-sm text-red-600">{errors.judul}</p>}
            </div>

            <div>
              <label htmlFor="kategori" className="block text-sm font-medium text-gray-700">
                Kategori (opsional)
              </label>
              <input
                type="text"
                id="kategori"
                name="kategori"
                value={item.kategori || ''}
                onChange={handleChange}
                placeholder="Contoh: SD / SMP / Workshop"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">
                Deskripsi (opsional)
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                value={item.deskripsi || ''}
                onChange={handleChange}
                rows={4}
                placeholder="Deskripsi singkat perangkat ajar..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                File Perangkat Ajar {!isEditing && <span className="text-red-500">*</span>}
              </label>

              {isEditing && item.filePath && !selectedFile && (
                <div className="mt-2 mb-3 flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <FileText size={20} className="text-blue-600" />
                  <span className="text-sm text-blue-800 truncate">
                    File saat ini: {item.originalName || item.filePath}
                  </span>
                </div>
              )}

              {selectedFile ? (
                <div className="mt-2 flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <FileText size={20} className="text-green-600" />
                  <span className="text-sm text-green-800 flex-1">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 hover:bg-green-100 rounded-full"
                  >
                    <X size={16} className="text-green-600" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                    errors.file ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Klik untuk memilih file</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Format: {ACCEPTED_EXT.join(', ')}. Maksimal 50MB.
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXT.join(',')}
                className="hidden"
                onChange={handleFileChange}
              />
              {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link
                to="/dashboard/perangkat-ajar"
                className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </Link>
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={isLoading}
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title="Konfirmasi Simpan"
        message="Apakah Anda yakin ingin menyimpan perangkat ajar ini?"
        confirmLabel={isEditing ? 'Simpan Perubahan' : 'Simpan'}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default PerangkatAjarForm;

