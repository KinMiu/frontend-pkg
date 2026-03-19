import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { ArrowLeft, Upload, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { RPS } from '../../types';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const emptyRPS: RPS = {
  _id: '',
  courseName: '',
  pdfFile: '',
};

const getPdfUrl = (pdfFile: string) => {
  if (!pdfFile) return '';
  if (pdfFile.startsWith('data:') || pdfFile.startsWith('http://') || pdfFile.startsWith('https://')) {
    return pdfFile;
  }
  const baseUrl = (import.meta.env.VITE_API_URL || 'https://api-informatika.psti-ubl.id').replace(/\/$/, '');
  const cleanPath = pdfFile.startsWith('/') ? pdfFile : `/uploads/rps/${pdfFile}`;
  return `${baseUrl}${cleanPath}`;
};

const RPSForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addRPS, updateRPS, getRPSById } = useCampusData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rps, setRps] = useState<RPS>(emptyRPS);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      if (isEditing && id) {
        try {
          const existingRPS = await getRPSById(id);
          if (existingRPS) {
            setRps(existingRPS);
          } else {
            navigate('/dashboard/rps');
            toast.error('RPS tidak ditemukan');
          }
        } catch (error) {
          console.error('Error fetching RPS:', error);
          toast.error('Gagal mengambil data RPS');
          navigate('/dashboard/rps');
        }
      }
    };

    fetchData();
  }, [id, getRPSById, navigate, isEditing]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!rps.courseName.trim()) {
      newErrors.courseName = 'Nama mata kuliah wajib diisi';
    }

    if (!isEditing && !selectedFile) {
      newErrors.pdfFile = 'File PDF wajib diunggah';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRps((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Hanya file PDF yang diizinkan');
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 20MB');
        return;
      }
      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, pdfFile: '' }));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
      formData.append('courseName', rps.courseName);
      if (selectedFile) {
        formData.append('pdfFile', selectedFile);
      }

      if (isEditing && id) {
        await updateRPS(id, formData);
        toast.success('RPS berhasil diperbarui');
      } else {
        await addRPS(formData);
        toast.success('RPS berhasil ditambahkan');
      }
      navigate('/dashboard/rps');
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsLoading(false);
      setShowSaveConfirm(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/dashboard/rps" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit RPS' : 'Tambah RPS Baru'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="courseName" className="block text-sm font-medium text-gray-700">
                Nama Mata Kuliah <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="courseName"
                name="courseName"
                value={rps.courseName}
                onChange={handleChange}
                placeholder="Contoh: Algoritma dan Pemrograman"
                className={`mt-1 block w-full rounded-md border ${
                  errors.courseName ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              {errors.courseName && <p className="mt-1 text-sm text-red-600">{errors.courseName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                File PDF RPS {!isEditing && <span className="text-red-500">*</span>}
              </label>

              {isEditing && rps.pdfFile && !selectedFile && (
                <div className="mt-2 mb-3 flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <FileText size={20} className="text-blue-600" />
                  <span className="text-sm text-blue-800 truncate">
                    File saat ini: {rps.pdfFile?.startsWith('data:') ? 'PDF tersimpan (base64)' : rps.pdfFile}
                  </span>
                  <a
                    href={getPdfUrl(rps.pdfFile)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-sm text-blue-600 hover:underline"
                  >
                    Lihat
                  </a>
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
                    errors.pdfFile
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Klik untuk memilih file PDF
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Maksimal 20MB
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              {errors.pdfFile && <p className="mt-1 text-sm text-red-600">{errors.pdfFile}</p>}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
            <Link
              to="/dashboard/rps"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : isEditing ? 'Perbarui RPS' : 'Simpan RPS'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title="Konfirmasi Simpan"
        message={`Apakah Anda yakin ingin ${isEditing ? 'memperbarui' : 'menyimpan'} RPS ini?`}
        confirmLabel={isEditing ? 'Perbarui' : 'Simpan'}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default RPSForm;
