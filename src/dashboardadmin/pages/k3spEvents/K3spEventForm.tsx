import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Event } from '../../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { compressImageFile } from '../../../utils/imageCompression';

const emptyEvent: Event = {
  _id: '',
  nama: '',
  foto: '',
  fotos: [],
  deskripsi: '',
  tanggal: '',
  lokasi: '',
  jenis: '',
};

const K3spEventForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addK3spEvent, updateK3spEvent, getK3spEventById } = useCampusData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [event, setEvent] = useState<Event>(emptyEvent);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [localPreviews, setLocalPreviews] = useState<string[]>([]);

  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      if (isEditing && id) {
        try {
          const existingEvent = await getK3spEventById(id);
          if (existingEvent) {
            setEvent(existingEvent);

            const firstFoto = (existingEvent.fotos && existingEvent.fotos.length > 0)
              ? existingEvent.fotos[0]
              : existingEvent.foto;
            if (firstFoto) {
              const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
              const src =
                firstFoto.startsWith('http') || firstFoto.startsWith('data:')
                  ? firstFoto
                  : `${baseUrl}/uploads/${firstFoto}`;
              setImagePreview(src);
            }

            const dateParts = existingEvent.tanggal.split(' ');
            if (dateParts.length === 3) {
              const months: Record<string, number> = {
                Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
              };
              const day = parseInt(dateParts[0]);
              const month = months[dateParts[1]];
              const year = parseInt(dateParts[2]);
              if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
                setSelectedDate(new Date(year, month, day));
              }
            }
          } else {
            navigate('/dashboard/k3sp-events');
            toast.error('Kegiatan tidak ditemukan');
          }
        } catch (error) {
          console.error('Error fetching k3sp event:', error);
          toast.error('Gagal mengambil data kegiatan');
          navigate('/dashboard/k3sp-events');
        }
      }
    };

    fetchData();
  }, [id, getK3spEventById, navigate, isEditing]);

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length > 30) {
      toast.error('Maksimal 30 gambar');
      e.target.value = '';
      return;
    }

    for (const f of files) {
      if (!f.type.startsWith('image/')) {
        toast.error('Semua file harus berupa gambar');
        e.target.value = '';
        return;
      }
    }

    try {
      const compressedFiles: File[] = [];
      for (const f of files) {
        try {
          const compressed = await compressImageFile(f, {
            maxWidth: 1600,
            maxHeight: 1600,
            quality: 0.8,
          });
          compressedFiles.push(compressed);
        } catch {
          compressedFiles.push(f);
        }
      }
      const previews = compressedFiles.map((f) => URL.createObjectURL(f));
      setSelectedFiles(compressedFiles);
      setLocalPreviews(previews);
      setImagePreview(previews[0] || '');
      setErrors((prev) => {
        const n = { ...prev };
        delete n.foto;
        return n;
      });
    } finally {
      e.target.value = '';
    }
  };

  useEffect(() => {
    return () => {
      localPreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [localPreviews]);

  const formatDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!event.nama.trim()) newErrors.nama = 'Nama kegiatan wajib diisi';
    if (!selectedDate) newErrors.tanggal = 'Tanggal kegiatan wajib diisi';
    if (!event.lokasi.trim()) newErrors.lokasi = 'Lokasi kegiatan wajib diisi';
    if (!event.deskripsi.trim()) newErrors.deskripsi = 'Deskripsi kegiatan wajib diisi';
    if (!event.jenis.trim()) newErrors.jenis = 'Jenis kegiatan wajib diisi';

    const hasExistingPhotos = Array.isArray(event.fotos) ? event.fotos.length > 0 : !!(event.foto || '').trim();
    const hasNewPhotos = selectedFiles.length > 0;
    if (!hasExistingPhotos && !hasNewPhotos) {
      newErrors.foto = 'Foto kegiatan wajib diupload (minimal 1, maksimal 30)';
    }
    if (hasNewPhotos && selectedFiles.length > 30) {
      newErrors.foto = 'Maksimal 30 gambar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setEvent((prev) => ({ ...prev, tanggal: formatDate(date) }));
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
    try {
      const formData = new FormData();
      formData.append('nama', event.nama);
      formData.append('tanggal', event.tanggal);
      formData.append('lokasi', event.lokasi);
      formData.append('jenis', event.jenis);
      formData.append('deskripsi', event.deskripsi);

      if (selectedFiles.length > 0) {
        selectedFiles.slice(0, 30).forEach((f) => {
          formData.append('foto', f);
        });
      }

      if (isEditing && id) {
        await updateK3spEvent(id, formData);
        toast.success('Kegiatan K3SP berhasil diperbarui');
      } else {
        await addK3spEvent(formData);
        toast.success('Kegiatan K3SP berhasil ditambahkan');
      }
      navigate('/dashboard/k3sp-events');
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/dashboard/k3sp-events" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEditing ? 'Edit Kegiatan K3SP' : 'Tambah Kegiatan K3SP'}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  <div className="relative h-48 w-48">
                    {imagePreview ? (
                      <img className="h-48 w-48 object-cover rounded-lg" src={imagePreview} alt="Event preview" />
                    ) : (
                      <div className="h-48 w-48 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Foto Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImagesChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      Pilih Foto (maks 30)
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 5MB per file</p>
                  {errors.foto && <p className="mt-1 text-sm text-red-600">{errors.foto}</p>}
                  {selectedFiles.length > 0 && (
                    <p className="mt-1 text-xs text-gray-600">
                      Dipilih: <span className="font-medium">{selectedFiles.length}</span> gambar
                    </p>
                  )}
                </div>
              </div>

              {localPreviews.length > 1 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {localPreviews.slice(0, 30).map((src, idx) => (
                    <button
                      key={src}
                      type="button"
                      className="relative aspect-square overflow-hidden rounded-md border border-gray-200 hover:border-indigo-400"
                      onClick={() => setImagePreview(src)}
                      title={`Foto ${idx + 1}`}
                    >
                      <img src={src} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                Nama Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={event.nama}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.nama ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              />
              {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
            </div>

            <div>
              <label htmlFor="jenis" className="block text-sm font-medium text-gray-700">
                Jenis Kegiatan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="jenis"
                name="jenis"
                value={event.jenis}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.jenis ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                placeholder="Contoh: Seminar, Workshop, Rapat Koordinasi, dll."
              />
              {errors.jenis && <p className="mt-1 text-sm text-red-600">{errors.jenis}</p>}
            </div>

            <div>
              <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="d MMM yyyy"
                className={`mt-1 block w-full rounded-md border ${errors.tanggal ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                placeholderText="Pilih tanggal"
              />
              {errors.tanggal && <p className="mt-1 text-sm text-red-600">{errors.tanggal}</p>}
            </div>

            <div>
              <label htmlFor="lokasi" className="block text-sm font-medium text-gray-700">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lokasi"
                name="lokasi"
                value={event.lokasi}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.lokasi ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              />
              {errors.lokasi && <p className="mt-1 text-sm text-red-600">{errors.lokasi}</p>}
            </div>

            <div>
              <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                rows={4}
                value={event.deskripsi}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${errors.deskripsi ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              />
              {errors.deskripsi && <p className="mt-1 text-sm text-red-600">{errors.deskripsi}</p>}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
            <Link to="/dashboard/k3sp-events" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Batal
            </Link>
            <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              {isEditing ? 'Perbarui Kegiatan' : 'Simpan Kegiatan'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title="Konfirmasi Simpan"
        message={`Apakah Anda yakin ingin ${isEditing ? 'memperbarui' : 'menyimpan'} kegiatan ini?`}
        confirmLabel={isEditing ? 'Perbarui' : 'Simpan'}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default K3spEventForm;

