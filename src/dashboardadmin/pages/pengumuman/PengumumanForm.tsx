import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Pengumuman } from '../../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { compressImageFile } from '../../../utils/imageCompression';

const emptyPengumuman: Pengumuman = {
  _id: '',
  judul: '',
  foto: '',
  fotos: [],
  deskripsi: '',
  tanggal: '',
  lokasi: '',
  jenis: '',
  satminkal: '',
};

const PengumumanForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addPengumuman, updatePengumuman, getPengumumanById, operators } = useCampusData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<Pengumuman>(emptyPengumuman);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [localPreviews, setLocalPreviews] = useState<string[]>([]);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [satminkalOptions, setSatminkalOptions] = useState<string[]>([]);
  const [showSatminkalSuggestions, setShowSatminkalSuggestions] = useState(false);

  const isEditing = !!id;
  const isOperator = (user as { role?: string })?.role === 'operator';
  const operatorSatminkal = (user as { satminkal?: string })?.satminkal ?? '';

  useEffect(() => {
    if (isOperator) return;
    const fromOps = Array.from(
      new Set(
        (operators || [])
          .map((o: { satminkal?: string }) => (o?.satminkal || '').trim())
          .filter(Boolean)
      )
    ) as string[];
    setSatminkalOptions(fromOps.sort((a, b) => a.localeCompare(b)));
  }, [isOperator, operators]);

  useEffect(() => {
    if (isOperator && operatorSatminkal) {
      setData((prev) => ({ ...prev, satminkal: operatorSatminkal }));
    }
  }, [isOperator, operatorSatminkal]);

  useEffect(() => {
    const fetchData = async () => {
      if (isEditing && id) {
        try {
          const existing = await getPengumumanById(id);
          if (existing) {
            if (isOperator && operatorSatminkal && (existing.satminkal || '').trim() !== operatorSatminkal) {
              toast.error('Anda tidak memiliki akses untuk mengedit pengumuman ini.');
              navigate('/dashboard/pengumuman');
              return;
            }
            setData({
              ...existing,
              fotos: existing.fotos ?? [],
              satminkal: isOperator ? operatorSatminkal : (existing.satminkal ?? ''),
            });
            const firstFoto =
              (existing.fotos && existing.fotos.length > 0)
                ? existing.fotos[0]
                : existing.foto;
            if (firstFoto) {
              const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
              const src =
                firstFoto.startsWith('http') || firstFoto.startsWith('data:')
                  ? firstFoto
                  : `${baseUrl}/uploads/${firstFoto}`;
              setImagePreview(src);
            }
            const dateParts = existing.tanggal.split(' ');
            if (dateParts.length === 3) {
              const months: Record<string, number> = {
                Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
                Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
              };
              const day = parseInt(dateParts[0]);
              const month = months[dateParts[1]] ?? 0;
              const year = parseInt(dateParts[2]);
              setSelectedDate(new Date(year, month, day));
            }
          } else {
            navigate('/dashboard/pengumuman');
            toast.error('Pengumuman tidak ditemukan');
          }
        } catch (error) {
          console.error(error);
          toast.error('Gagal mengambil data pengumuman');
          navigate('/dashboard/pengumuman');
        }
      }
    };
    fetchData();
  }, [id, getPengumumanById, navigate, isEditing, isOperator, operatorSatminkal]);

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
    if (!data.judul.trim()) newErrors.judul = 'Judul pengumuman wajib diisi';
    if (!selectedDate) newErrors.tanggal = 'Tanggal wajib diisi';
    if (!data.deskripsi.trim()) newErrors.deskripsi = 'Deskripsi wajib diisi';
    if (!data.jenis.trim()) newErrors.jenis = 'Jenis pengumuman wajib diisi';

    const hasExistingPhotos = Array.isArray(data.fotos) ? data.fotos.length > 0 : !!(data.foto || '').trim();
    const hasNewPhotos = selectedFiles.length > 0;
    if (!hasExistingPhotos && !hasNewPhotos) {
      newErrors.foto = 'Foto pengumuman wajib diupload (minimal 1, maksimal 30)';
    }
    if (hasNewPhotos && selectedFiles.length > 30) {
      newErrors.foto = 'Maksimal 30 gambar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSatminkalInputChange = (value: string) => {
    setData(prev => ({ ...prev, satminkal: value }));
    setShowSatminkalSuggestions(true);
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) setData((prev) => ({ ...prev, tanggal: formatDate(date) }));
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
      formData.append('judul', data.judul);
      formData.append('tanggal', data.tanggal);
      formData.append('lokasi', data.lokasi ?? '');
      formData.append('jenis', data.jenis);
      formData.append('deskripsi', data.deskripsi);
      const sat = data.satminkal?.trim() ?? '';
      if (sat) formData.append('satminkal', sat);

      if (selectedFiles.length > 0) {
        selectedFiles.slice(0, 30).forEach((f) => {
          formData.append('foto', f);
        });
      }

      if (isEditing && id) {
        await updatePengumuman(id, formData);
        toast.success('Pengumuman berhasil diperbarui');
      } else {
        await addPengumuman(formData);
        toast.success('Pengumuman berhasil ditambahkan');
      }
      navigate('/dashboard/pengumuman');
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/dashboard/pengumuman" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <div className="flex items-center space-x-6">
                <div className="shrink-0">
                  <div className="relative h-48 w-48">
                    {imagePreview ? (
                      <img
                        className="h-48 w-48 rounded-lg object-cover"
                        src={imagePreview}
                        alt="Prakiraan foto pengumuman"
                      />
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-gray-200">
                        <Upload className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Foto Pengumuman <span className="text-red-500">*</span>
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
                  <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF hingga 5MB per file</p>
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
              <label htmlFor="satminkal" className="block text-sm font-medium text-gray-700">
                Satminkal (opsional) {isOperator ? <span className="text-gray-500">(tidak dapat diedit)</span> : null}
              </label>
              {isOperator ? (
                <input
                  type="text"
                  id="satminkal"
                  name="satminkal"
                  value={data.satminkal ?? ''}
                  readOnly
                  disabled
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                />
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    id="satminkal"
                    name="satminkal"
                    value={data.satminkal ?? ''}
                    onChange={(e) => handleSatminkalInputChange(e.target.value)}
                    onFocus={() => setShowSatminkalSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSatminkalSuggestions(false), 120)}
                    placeholder="Ketik untuk mencari SATMINKAL"
                    autoComplete="off"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />

                  {showSatminkalSuggestions && satminkalOptions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                      <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
                        {satminkalOptions
                          .filter((s) => {
                            const q = (data.satminkal || '').trim().toLowerCase();
                            if (!q) return true;
                            return s.toLowerCase().includes(q);
                          })
                          .slice(0, 20)
                          .map((s) => (
                            <li
                              key={s}
                              className="cursor-pointer px-3 py-2 hover:bg-indigo-50"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setData(prev => ({ ...prev, satminkal: s }));
                                setShowSatminkalSuggestions(false);
                              }}
                            >
                              {s}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="judul" className="block text-sm font-medium text-gray-700">Judul Pengumuman <span className="text-red-500">*</span></label>
              <input type="text" id="judul" name="judul" value={data.judul} onChange={handleChange} className={`mt-1 block w-full rounded-md border ${errors.judul ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`} />
              {errors.judul && <p className="mt-1 text-sm text-red-600">{errors.judul}</p>}
            </div>

            <div>
              <label htmlFor="jenis" className="block text-sm font-medium text-gray-700">Jenis Pengumuman <span className="text-red-500">*</span></label>
              <input type="text" id="jenis" name="jenis" value={data.jenis} onChange={handleChange} placeholder="Contoh: Informasi, Pengumuman Resmi, dll." className={`mt-1 block w-full rounded-md border ${errors.jenis ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`} />
              {errors.jenis && <p className="mt-1 text-sm text-red-600">{errors.jenis}</p>}
            </div>

            <div>
              <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">Tanggal <span className="text-red-500">*</span></label>
              <DatePicker selected={selectedDate} onChange={handleDateChange} dateFormat="d MMM yyyy" className={`mt-1 block w-full rounded-md border ${errors.tanggal ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`} placeholderText="Pilih tanggal" />
              {errors.tanggal && <p className="mt-1 text-sm text-red-600">{errors.tanggal}</p>}
            </div>

            <div>
              <label htmlFor="lokasi" className="block text-sm font-medium text-gray-700">Lokasi (opsional)</label>
              <input type="text" id="lokasi" name="lokasi" value={data.lokasi ?? ''} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
            </div>

            <div>
              <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">Deskripsi <span className="text-red-500">*</span></label>
              <textarea id="deskripsi" name="deskripsi" rows={4} value={data.deskripsi} onChange={handleChange} className={`mt-1 block w-full rounded-md border ${errors.deskripsi ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`} />
              {errors.deskripsi && <p className="mt-1 text-sm text-red-600">{errors.deskripsi}</p>}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
            <Link to="/dashboard/pengumuman" className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</Link>
            <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
              {isEditing ? 'Perbarui Pengumuman' : 'Simpan Pengumuman'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationDialog isOpen={showSaveConfirm} title="Konfirmasi Simpan" message={`Apakah Anda yakin ingin ${isEditing ? 'memperbarui' : 'menyimpan'} pengumuman ini?`} confirmLabel={isEditing ? 'Perbarui' : 'Simpan'} onConfirm={handleConfirmSave} onCancel={() => setShowSaveConfirm(false)} />
    </div>
  );
};

export default PengumumanForm;
