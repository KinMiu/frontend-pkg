import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { ArrowLeft, Plus, Trash2, Upload, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { Faculty, EmployeeDocument, Education } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { compressImageFile } from '../../../utils/imageCompression';
import { FACULTY_POSITION_OPTIONS, normalizeFacultyPosition } from '../../../utils/facultyPosition';

const emptyFaculty: Faculty = {
  _id: '',
  name: '',
  jenisKelamin: '',
  nuptk: '',
  nip: '',
  nrg: '',
  satminkal: '',
  position: 'PENDIDIK',
  foto: '',
  education: [],
  courses: [],
  identitasPegawai: [],
  skCpns: [],
  skPns: [],
  skPppk: [],
  riwayatPangkat: [],
  riwayatJabatan: [],
  riwayatGaji: [],
  pendidikanUmum: [],
  diklat: [],
  suamiIstri: [],
  aktaAnak: [],
  penilaianPrestasi: [],
  penetapanAngkaKredit: [],
  dokumenTambahan: [],
};

const emptyEmployeeDocument: EmployeeDocument = {
  namaDokumen: '',
  fileData: '',
  fileType: ''
};

/** Buka dokumen: jika path relatif, bangun URL /uploads; jika data URL, ubah ke blob URL agar tidak error "Not allowed to navigate top frame to data URL" */
const openDocumentUrl = (fileData: string) => {
  if (!fileData) return;

  let urlToOpen = fileData;

  if (fileData.startsWith('data:')) {
    fetch(fileData)
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      })
      .catch(() => {});
    return;
  }

  if (!fileData.startsWith('http')) {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
    urlToOpen = `${baseUrl}/uploads/${fileData}`;
  }

  window.open(urlToOpen, '_blank');
};

const EMPLOYEE_DOC_CATEGORIES: { key: keyof Faculty; label: string }[] = [
  { key: 'identitasPegawai', label: 'Identitas Pegawai' },
  { key: 'skCpns', label: 'SK CPNS' },
  { key: 'skPns', label: 'SK PNS' },
  { key: 'skPppk', label: 'SK PPPK' },
  { key: 'riwayatPangkat', label: 'Riwayat Pangkat' },
  { key: 'riwayatJabatan', label: 'Riwayat Jabatan' },
  { key: 'riwayatGaji', label: 'Riwayat Gaji' },
  { key: 'pendidikanUmum', label: 'Pendidikan Umum' },
  { key: 'diklat', label: 'Diklat' },
  { key: 'suamiIstri', label: 'Suami/Istri' },
  { key: 'aktaAnak', label: 'Akta Anak' },
  { key: 'penilaianPrestasi', label: 'Penilaian Prestasi' },
  { key: 'penetapanAngkaKredit', label: 'Penetapan Angka Kredit' },
  { key: 'dokumenTambahan', label: 'Dokumen Tambahan' },
];

interface FacultyFormProps {
  facultyIdOverride?: string;
  /** Base path used for back/navigation (default: /faculty) */
  basePath?: string;
}

const FacultyForm: React.FC<FacultyFormProps> = ({ facultyIdOverride, basePath = '/dashboard/faculty' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addFaculty, updateFaculty, getFacultyById, faculty, operators } = useCampusData();
  const { user, patchUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [facultyData, setFacultyData] = useState<Faculty>(emptyFaculty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newCourse, setNewCourse] = useState('');
  const [tempEducation, setTempEducation] = useState<Education>({ degree: '', institution: '', year: '' });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showCourseSuggestions, setShowCourseSuggestions] = useState(false);
  const [satminkalOptions, setSatminkalOptions] = useState<string[]>([]);
  const [showSatminkalSuggestions, setShowSatminkalSuggestions] = useState(false);

  // Draft dokumen per kategori (supaya input di satu card tidak mempengaruhi card lain)
  const [employeeDocDrafts, setEmployeeDocDrafts] = useState<Record<string, EmployeeDocument>>({});
  const [employeeDocFiles, setEmployeeDocFiles] = useState<Record<string, File | null>>({});
  const [editingEmployeeDocIndex, setEditingEmployeeDocIndex] = useState<Record<string, number | null>>({});
  const [openEmployeeSections, setOpenEmployeeSections] = useState<Record<string, boolean>>({});
  
  const existingCourses = Array.from(new Set(faculty.flatMap(f => f.courses || [])));
  const filteredCourses = existingCourses.filter(course =>
    course.toLowerCase().includes(newCourse.toLowerCase()) &&
    !facultyData.courses?.includes(course)
  );

  const effectiveId = facultyIdOverride || id;
  const isDosenSelf = user?.role === 'dosen';
  const isOperator = (user as { role?: string } | null)?.role === 'operator';
  const operatorSatminkal = (user as { satminkal?: string })?.satminkal || '';
  const isEditing = !!effectiveId;
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const userFacultyId = (user as { facultyId?: string })?.facultyId;

  useEffect(() => {
    const fromOps = Array.from(
      new Set(
        (operators || [])
          .map((o: { satminkal?: string }) => (o?.satminkal || '').trim())
          .filter(Boolean)
      )
    ) as string[];
    setSatminkalOptions(fromOps.sort((a, b) => a.localeCompare(b)));
  }, [operators]);

  useEffect(() => {
    if (isOperator && operatorSatminkal && !isEditing) {
      setFacultyData(prev => ({ ...prev, satminkal: operatorSatminkal }));
    }
  }, [isOperator, operatorSatminkal, isEditing]);

  useEffect(() => {
    const fetchFacultyData = async () => {
      if (isDosenSelf && userFacultyId && effectiveId && effectiveId !== userFacultyId) {
        navigate('/dashboard/guru', { replace: true });
        return;
      }

      if (isEditing && effectiveId) {
        try {
          const existingFaculty = await getFacultyById(effectiveId);
          if (existingFaculty) {
            if (isOperator && (existingFaculty.satminkal || '').trim() !== (operatorSatminkal || '').trim()) {
              toast.error('Anda hanya dapat mengedit data guru dengan SATMINKAL Anda.');
              navigate(basePath);
              return;
            }
            setFacultyData({
              ...existingFaculty,
              position: normalizeFacultyPosition(existingFaculty.position),
            });
            if (existingFaculty.foto) {
              const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
              const src =
                existingFaculty.foto.startsWith('http') ||
                existingFaculty.foto.startsWith('data:')
                  ? existingFaculty.foto
                  : `${baseUrl}/uploads/${existingFaculty.foto}`;
              setImagePreview(src);
            }
          } else {
            navigate(basePath);
            toast.error('Data guru tidak ditemukan');
          }
        } catch (error) {
          console.error('Error fetching faculty:', error);
          toast.error('Gagal memuat data guru');
        }
      }
    };

    fetchFacultyData();
  }, [basePath, effectiveId, getFacultyById, isDosenSelf, isOperator, operatorSatminkal, isEditing, navigate, userFacultyId]);

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
      setPhotoFile(compressed);
      setImagePreview(URL.createObjectURL(compressed));
    } catch {
      setPhotoFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddCourse = (course: string = newCourse.trim()) => {
    if (course && !facultyData.courses?.includes(course)) {
      setFacultyData(prev => ({
        ...prev,
        courses: [...(prev.courses || []), course]
      }));
      setNewCourse('');
      setShowCourseSuggestions(false);
      setErrors(prev => { const n = { ...prev }; delete n.courses; return n; });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!facultyData.name.trim()) newErrors.name = 'Nama wajib diisi';
    if (!facultyData.nuptk?.trim()) newErrors.nuptk = 'NUPTK/NIK wajib diisi';

    if (!(facultyData.satminkal || '').trim()) {
      newErrors.satminkal = 'SATMINKAL wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFacultyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSatminkalInputChange = (value: string) => {
    setFacultyData(prev => ({ ...prev, satminkal: value }));
    setShowSatminkalSuggestions(true);
  };

  const handleRemoveCourse = (index: number) => {
    setFacultyData((prev) => ({
      ...prev,
      courses: prev.courses?.filter((_, i) => i !== index)
    }));
  };

  const handleAddEducation = () => {
    if (tempEducation.degree.trim() !== '' && tempEducation.institution.trim() !== '') {
      setFacultyData((prev) => ({
        ...prev,
        education: [...(prev.education || []), { ...tempEducation }]
      }));
      setTempEducation({ degree: '', institution: '', year: '', field: '' });
      setErrors(prev => { const n = { ...prev }; delete n.education; return n; });
    }
  };

  const handleRemoveEducation = (index: number) => {
    setFacultyData((prev) => ({
      ...prev,
      education: prev.education?.filter((_, i) => i !== index)
    }));
  };

  const handleEmployeeDocNameChange = (category: string, value: string) => {
    setEmployeeDocDrafts(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || emptyEmployeeDocument),
        namaDokumen: value,
      },
    }));
  };

  const handleEmployeeDocFileChange = (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('File harus berupa PDF atau gambar (JPG, JPEG, PNG)');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 20MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setEmployeeDocDrafts(prev => ({
        ...prev,
        [category]: {
          ...(prev[category] || emptyEmployeeDocument),
          fileData: base64String,
          fileType: file.type,
        },
      }));
      setEmployeeDocFiles(prev => ({ ...prev, [category]: file }));
    };
    reader.readAsDataURL(file);
  };

  const resetEmployeeDocDraft = (category: string) => {
    setEmployeeDocDrafts(prev => ({ ...prev, [category]: emptyEmployeeDocument }));
    setEmployeeDocFiles(prev => ({ ...prev, [category]: null }));
    setEditingEmployeeDocIndex(prev => ({ ...prev, [category]: null }));
  };

  const handleAddEmployeeDocument = (category: keyof Faculty) => {
    const key = category as string;
    const draft = employeeDocDrafts[key];

    if (!draft || !draft.namaDokumen.trim() || !draft.fileData) {
      toast.error('Nama dokumen dan file wajib diisi');
      return;
    }

    setFacultyData(prev => {
      const existing = (prev[category] as EmployeeDocument[] | undefined) || [];
      const editIndex = editingEmployeeDocIndex[key];

      const updated =
        typeof editIndex === 'number'
          ? existing.map((doc, i) => (i === editIndex ? { ...draft } : doc))
          : [...existing, { ...draft }];

      return {
        ...prev,
        [category]: updated,
      };
    });

    resetEmployeeDocDraft(key);
  };

  const handleEditEmployeeDocument = (category: string, index: number, doc: EmployeeDocument) => {
    setEmployeeDocDrafts(prev => ({ ...prev, [category]: doc }));
    setEmployeeDocFiles(prev => ({ ...prev, [category]: null }));
    setEditingEmployeeDocIndex(prev => ({ ...prev, [category]: index }));
  };

  const handleCancelEditEmployeeDocument = (category: string) => {
    resetEmployeeDocDraft(category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validate()) {
      toast.error('Harap perbaiki semua error pada form');
      return;
    }
  
    const submittedData = {
      ...facultyData,
      position: normalizeFacultyPosition(facultyData.position),
    };
    if (isOperator && operatorSatminkal) {
      submittedData.satminkal = operatorSatminkal;
    }
    const formData = new FormData();

    formData.append('name', submittedData.name);
    formData.append('nuptk', submittedData.nuptk || '');
    formData.append('nip', submittedData.nip || '');
    formData.append('nrg', submittedData.nrg || '');
    formData.append('satminkal', submittedData.satminkal || '');
    formData.append('jenis_kelamin', submittedData.jenisKelamin || '');
    formData.append('position', submittedData.position);
    formData.append('isResearchPublic', 'true');

    formData.append('education', JSON.stringify(submittedData.education || []));
    formData.append('courses', JSON.stringify(submittedData.courses || []));
    formData.append('publications', JSON.stringify([]));
    formData.append('hki', JSON.stringify([]));
    formData.append('pengabdian', JSON.stringify([]));

    formData.append('identitasPegawai', JSON.stringify(submittedData.identitasPegawai || []));
    formData.append('skCpns', JSON.stringify(submittedData.skCpns || []));
    formData.append('skPns', JSON.stringify(submittedData.skPns || []));
    formData.append('skPppk', JSON.stringify(submittedData.skPppk || []));
    formData.append('riwayatPangkat', JSON.stringify(submittedData.riwayatPangkat || []));
    formData.append('riwayatJabatan', JSON.stringify(submittedData.riwayatJabatan || []));
    formData.append('riwayatGaji', JSON.stringify(submittedData.riwayatGaji || []));
    formData.append('pendidikanUmum', JSON.stringify(submittedData.pendidikanUmum || []));
    formData.append('diklat', JSON.stringify(submittedData.diklat || []));
    formData.append('suamiIstri', JSON.stringify(submittedData.suamiIstri || []));
    formData.append('aktaAnak', JSON.stringify(submittedData.aktaAnak || []));
    formData.append('penilaianPrestasi', JSON.stringify(submittedData.penilaianPrestasi || []));
    formData.append('penetapanAngkaKredit', JSON.stringify(submittedData.penetapanAngkaKredit || []));
    formData.append('dokumenTambahan', JSON.stringify(submittedData.dokumenTambahan || []));

    if (photoFile) {
      formData.append('foto', photoFile);
    }
  
    try {
      if (isEditing && effectiveId) {
        await updateFaculty(effectiveId, formData);
        toast.success('Data guru berhasil diperbarui');
        if (isDosenSelf) {
          patchUser({
            facultyPosition: submittedData.position,
            name: submittedData.name,
          });
        }
      } else {
        if (isDosenSelf) {
          toast.error('Akun guru tidak diizinkan menambahkan data guru baru');
          return;
        }
        await addFaculty(formData);
        toast.success('Data guru berhasil ditambahkan');
      }
      if (isDosenSelf) navigate('/dashboard/guru/profil');
      else navigate(basePath);
    } catch (error) {
      console.error('Error saving faculty:', error);
      toast.error('Gagal menyimpan data guru');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to={isDosenSelf ? '/dashboard/guru/profil' : basePath} className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Data Guru' : 'Tambah Guru Baru'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Profile Image */}
            <div className="md:col-span-2">
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
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Informasi Pribadi</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={facultyData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700">
                    Jenis Kelamin
                  </label>
                  <select
                    id="jenisKelamin"
                    name="jenisKelamin"
                    value={facultyData.jenisKelamin || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Pilih</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="nuptk" className="block text-sm font-medium text-gray-700">
                    NUPTK/NIK <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="nuptk"
                    name="nuptk"
                    value={facultyData.nuptk || ''}
                    onChange={handleChange}
                    readOnly={isDosenSelf}
                    disabled={isDosenSelf}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.nuptk ? 'border-red-300' : 'border-gray-300'
                    } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${isDosenSelf ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {errors.nuptk && <p className="mt-1 text-sm text-red-600">{errors.nuptk}</p>}
                </div>
                <div>
                  <label htmlFor="nip" className="block text-sm font-medium text-gray-700">
                    NIP
                  </label>
                  <input
                    type="text"
                    id="nip"
                    name="nip"
                    value={facultyData.nip || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="nrg" className="block text-sm font-medium text-gray-700">
                    NRG
                  </label>
                    <input
                      type="text"
                    id="nrg"
                    name="nrg"
                    value={facultyData.nrg || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                      </div>
                <div>
                  <label htmlFor="satminkal" className="block text-sm font-medium text-gray-700">
                    SATMINKAL {isOperator || isDosenSelf ? <span className="text-gray-500">(tidak dapat diedit)</span> : null}
                  </label>
                  {isOperator || isDosenSelf ? (
                    <input
                      type="text"
                      id="satminkal"
                      name="satminkal"
                      value={facultyData.satminkal || ''}
                      onChange={handleChange}
                      readOnly
                      disabled
                      className={`mt-1 block w-full rounded-md border ${
                        errors.satminkal ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-100 cursor-not-allowed text-gray-600`}
                    />
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        id="satminkal"
                        name="satminkal"
                        value={facultyData.satminkal || ''}
                        onChange={(e) => handleSatminkalInputChange(e.target.value)}
                        onFocus={() => setShowSatminkalSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSatminkalSuggestions(false), 120)}
                        placeholder="Ketik untuk mencari SATMINKAL"
                        autoComplete="off"
                        className={`mt-1 block w-full rounded-md border ${
                          errors.satminkal ? 'border-red-300' : 'border-gray-300'
                        } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      />

                      {showSatminkalSuggestions && satminkalOptions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                          <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
                            {satminkalOptions
                              .filter((s) => {
                                const q = (facultyData.satminkal || '').trim().toLowerCase();
                                if (!q) return true;
                                return s.toLowerCase().includes(q);
                              })
                              .slice(0, 20)
                              .map((s) => (
                                <li
                                  key={s}
                                  className="cursor-pointer px-3 py-2 hover:bg-blue-50"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setFacultyData(prev => ({ ...prev, satminkal: s }));
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
                  {errors.satminkal && <p className="mt-1 text-sm text-red-600">{errors.satminkal}</p>}
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                    Posisi <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="position"
                    name="position"
                    value={normalizeFacultyPosition(facultyData.position)}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {FACULTY_POSITION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Login akun tetap memakai NUPTK/NIK; label di dashboard mengikuti posisi ini.
                  </p>
                </div>
              </div>
            </div>

            {/* Mengajar (opsional) */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-1">Mengajar</h2>
              <p className="mb-3 text-xs text-gray-500">Boleh dikosongkan. Anda dapat menambah data mengajar kapan saja.</p>
              <div className="mb-4">
                {facultyData.courses && facultyData.courses.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {facultyData.courses.map((course, index) => (
                      <div key={index} className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1">
                        <span className="text-sm font-medium text-blue-800">{course}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCourse(index)}
                          className="ml-1 rounded-full p-1 text-blue-700 hover:bg-blue-200"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="relative flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newCourse}
                      onChange={(e) => {
                        setNewCourse(e.target.value);
                        setShowCourseSuggestions(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCourse();
                        }
                      }}
                      placeholder="Ketik mata pelajaran yang diajar"
                      className={`block w-full rounded-md border ${
                        errors.courses ? 'border-red-300' : 'border-gray-300'
                      } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                    
                    {showCourseSuggestions && newCourse && filteredCourses.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
                        <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
                          {filteredCourses.map((course, index) => (
                            <li
                              key={index}
                              className="cursor-pointer px-3 py-2 hover:bg-blue-50"
                              onClick={() => handleAddCourse(course)}
                            >
                              {course}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleAddCourse()}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus size={16} className="mr-2" />
                    Tambah
                  </button>
                </div>
                {errors.courses && <p className="mt-1 text-sm text-red-600">{errors.courses}</p>}
              </div>
            </div>

            {/* Education (opsional) */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-1">Pendidikan</h2>
              <p className="mb-3 text-xs text-gray-500">Boleh dikosongkan. Tambahkan riwayat pendidikan jika sudah siap.</p>
              <div className="mb-4">
                {facultyData.education && facultyData.education.length > 0 && (
                  <div className="mb-4 space-y-3">
                    {facultyData.education.map((edu, index) => (
                      <div key={index} className="flex items-center justify-between rounded-md bg-gray-50 p-3">
                        <div>
                          <p className="font-medium">{edu.degree}</p>
                          <p className="text-sm text-gray-600">{edu.institution} ({edu.year})</p>
                          {edu.field && <p className="text-sm text-gray-500">{edu.field}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(index)}
                          className="rounded-full p-1 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="rounded-md border border-gray-300 p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="educationDegree" className="block text-sm font-medium text-gray-700">
                        Gelar <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="educationDegree"
                        name="educationDegree"
                        value={tempEducation.degree}
                        onChange={(e) =>
                          setTempEducation((prev) => ({ ...prev, degree: e.target.value }))
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Pilih Jenjang</option>
                        <option value="S1">S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="educationInstitution" className="block text-sm font-medium text-gray-700">
                        Institusi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="educationInstitution"
                        value={tempEducation.institution}
                        onChange={(e) => setTempEducation({ ...tempEducation, institution: e.target.value })}
                        placeholder="Nama universitas"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="educationYear" className="block text-sm font-medium text-gray-700">
                        Tahun <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="educationYear"
                        value={tempEducation.year}
                        onChange={(e) => setTempEducation({ ...tempEducation, year: e.target.value })}
                        placeholder="Tahun lulus"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="educationField" className="block text-sm font-medium text-gray-700">
                        Program Studi<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="educationField"
                        value={tempEducation.field || ''}
                        onChange={(e) => setTempEducation({ ...tempEducation, field: e.target.value })}
                        placeholder="Bidang studi"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200"
                    >
                      <Plus size={16} className="mr-2" />
                      Tambah Pendidikan
                    </button>
                  </div>
                </div>
                {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
              </div>
            </div>

            {/* Dokumen Kepegawaian */}
            <div className="mt-10">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Dokumen Kepegawaian</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {EMPLOYEE_DOC_CATEGORIES.map(({ key, label }) => {
                      const categoryKey = key as string;
                      const docs = (facultyData as any)[key] as EmployeeDocument[] | undefined;
                      const list = Array.isArray(docs) ? docs : [];
                      const draft = employeeDocDrafts[categoryKey] || emptyEmployeeDocument;
                      const file = employeeDocFiles[categoryKey] || null;
                      const editIndex = editingEmployeeDocIndex[categoryKey];
                      const isEditingDoc = typeof editIndex === 'number';
                      const isOpen = openEmployeeSections[categoryKey] ?? false;

                      return (
                        <div
                          key={categoryKey}
                          className="rounded-lg border border-gray-200 bg-white shadow-sm flex flex-col"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenEmployeeSections(prev => ({
                                ...prev,
                                [categoryKey]: !isOpen,
                              }))
                            }
                            className="flex items-center justify-between px-4 py-3 border-b border-gray-100 text-left"
                          >
                            <span className="font-medium text-gray-900">{label}</span>
                            <span className="flex items-center gap-2 text-xs text-gray-500">
                              {list.length > 0 && <span>{list.length} dokumen</span>}
                              {isOpen ? (
                                <span>▲</span>
                              ) : (
                                <span>▼</span>
                              )}
                            </span>
                          </button>
                          {isOpen && (
                          <div className="px-4 py-3 space-y-3 flex-1">
                            {list.length > 0 && (
                              <ul className="space-y-2">
                                {list.map((doc: EmployeeDocument, index: number) => (
                                  <li
                                    key={doc._id || index}
                                    className="flex items-center justify-between rounded bg-gray-50 px-2 py-1.5 text-sm"
                                  >
                                    <span className="truncate flex-1 mr-2" title={doc.namaDokumen}>
                                      {doc.namaDokumen}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {doc.fileData && (
                                        <button
                                          type="button"
                                          onClick={() => openDocumentUrl(doc.fileData)}
                                          className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                                        >
                                          Lihat
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => handleEditEmployeeDocument(categoryKey, index, doc)}
                                        className="rounded-full p-0.5 text-blue-600 hover:bg-blue-100"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setFacultyData(prev => {
                                            const current = ((prev as any)[key] as EmployeeDocument[]) || [];
                                            return {
                                              ...prev,
                                              [key]: current.filter((_, i) => i !== index),
                                            } as Faculty;
                                          })
                                        }
                                        className="rounded-full p-0.5 text-red-600 hover:bg-red-100"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <div className="rounded border border-gray-200 bg-gray-50/50 p-3">
                              <input
                                type="text"
                                placeholder="Nama dokumen"
                                value={draft.namaDokumen}
                                onChange={e => handleEmployeeDocNameChange(categoryKey, e.target.value)}
                                className="mb-2 block w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                              />
                              <input
                                type="file"
                                accept=".pdf,image/jpeg,image/jpg,image/png"
                                onChange={e => handleEmployeeDocFileChange(categoryKey, e)}
                                className="mb-2 block w-full text-xs text-gray-500 file:rounded file:border-0 file:bg-indigo-50 file:px-2 file:py-1 file:text-xs file:text-indigo-700"
                              />
                              {file && (
                                <p className="mb-1 text-xs text-gray-600 truncate">
                                  File baru: <span className="font-medium">{file.name}</span>
                                </p>
                              )}
                              {!file && draft.fileData && (
                                <p className="mb-1 text-xs text-gray-600">
                                  File tersimpan: <span className="font-medium">{draft.fileType || 'terisi'}</span>
                                </p>
                              )}
                              <div className="mt-2 flex justify-end gap-2">
                                {isEditingDoc && (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelEditEmployeeDocument(categoryKey)}
                                    className="inline-flex items-center rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                  >
                                    Batal Edit
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleAddEmployeeDocument(key)}
                                  className="inline-flex items-center rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                                >
                                  {isEditingDoc ? (
                                    <>
                                      <Edit size={14} className="inline mr-1" />
                                      Simpan Perubahan
                                    </>
                                  ) : (
                                    <>
                                      <Plus size={14} className="inline mr-1" />
                                      Tambah
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                          )}
                        </div>
                      );
                    })}
              </div>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="mt-8 flex items-center justify-end gap-4">
            <Link
              to={isDosenSelf ? '/dashboard/guru/profil' : basePath}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isEditing ? 'Perbarui Data' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyForm;