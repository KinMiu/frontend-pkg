import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { Surat } from '../../types';
import { useCampusData } from '../../contexts/CampusDataContext';

const emptySurat: Surat = {
  _id: '',
  judul: '',
  tanggal: '',
  pdfFile: '',
};

const getPdfUrl = (pdfFile: string) => {
  if (!pdfFile) return '';
  if (pdfFile.startsWith('data:') || pdfFile.startsWith('http://') || pdfFile.startsWith('https://')) {
    return pdfFile;
  }
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
  const clean = pdfFile.replace(/^\/+/, '');
  return `${baseUrl}/uploads/${clean}`;
};

const SuratForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addSurat, updateSurat, getSuratById } = useCampusData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [surat, setSurat] = useState<Surat>(emptySurat);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      if (isEditing && id) {
        try {
          const existing = await getSuratById(id);
          if (existing) {
            setSurat(existing);
          } else {
            navigate('/dashboard/surat');
            toast.error('Surat tidak ditemukan');
          }
        } catch (error) {
          console.error('Error fetching surat:', error);
          toast.error('Gagal mengambil data surat');
          navigate('/dashboard/surat');
        }
      }
    };
    fetchData();
  }, [id, getSuratById, navigate, isEditing]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!surat.judul.trim()) newErrors.judul = 'Judul surat wajib diisi';
    if (!isEditing && !selectedFile) newErrors.pdfFile = 'File PDF wajib diunggah';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSurat((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
      formData.append('judul', surat.judul);
      if (surat.tanggal) formData.append('tanggal', surat.tanggal);
      if (selectedFile) formData.append('pdfFile', selectedFile);

      if (isEditing && id) {
        await updateSurat(id, formData);
        toast.success('Surat berhasil diperbarui');
      } else {
        await addSurat(formData);
        toast.success('Surat berhasil ditambahkan');
      }
      navigate('/dashboard/surat');
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
        <Link to="/dashboard/surat" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Surat' : 'Tambah Surat Baru'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="judul" className="block text-sm font-medium text-gray-700">
                Judul Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="judul"
                name="judul"
                value={surat.judul}
                onChange={handleChange}
                placeholder="Contoh: Surat Edaran Kegiatan"
                className={`mt-1 block w-full rounded-md border ${
                  errors.judul ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
              {errors.judul && <p className="mt-1 text-sm text-red-600">{errors.judul}</p>}
            </div>

            <div>
              <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">
                Tanggal (opsional)
              </label>
              <input
                type="date"
                id="tanggal"
                name="tanggal"
                value={surat.tanggal || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                File PDF Surat {!isEditing && <span className="text-red-500">*</span>}
              </label>

              {isEditing && surat.pdfFile && !selectedFile && (
                <div className="mt-2 mb-3 flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <FileText size={20} className="text-blue-600" />
                  <span className="text-sm text-blue-800 truncate">
                    File saat ini: {surat.pdfFile?.startsWith('data:') ? 'PDF tersimpan (base64)' : surat.pdfFile}
                  </span>
                  <a
                    href={getPdfUrl(surat.pdfFile)}
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
                  <p className="text-sm text-gray-600">Klik untuk memilih file PDF</p>
                  <p className="text-xs text-gray-500 mt-1">Maksimal 20MB</p>
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
              to="/dashboard/surat"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Menyimpan...' : isEditing ? 'Perbarui Surat' : 'Simpan Surat'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title="Konfirmasi Simpan"
        message={`Apakah Anda yakin ingin ${isEditing ? 'memperbarui' : 'menyimpan'} surat ini?`}
        confirmLabel={isEditing ? 'Perbarui' : 'Simpan'}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default SuratForm;

