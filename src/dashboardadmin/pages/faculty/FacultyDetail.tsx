import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, GraduationCap, Book, ChevronDown, ChevronUp, Link as LinkIcon, FileIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { facultyAPI } from '../../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useCampusData } from '../../contexts/CampusDataContext';

const EMPLOYEE_DOC_CATEGORIES: { key: string; label: string }[] = [
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

const openDocumentUrl = (fileData: string) => {
  if (!fileData) return;
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
  let urlToOpen = fileData;
  if (!fileData.startsWith('http')) {
    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
    urlToOpen = `${baseUrl}/uploads/${fileData}`;
  }
  window.open(urlToOpen, '_blank');
};

interface FacultyDetailProps {
  facultyIdOverride?: string;
  basePath?: string;
}

const FacultyDetail: React.FC<FacultyDetailProps> = ({ facultyIdOverride, basePath = '/dashboard/faculty' }) => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { deleteFaculty } = useCampusData();
  const [faculty, setFaculty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEmployeeSections, setOpenEmployeeSections] = useState<Record<string, boolean>>({});

  const facultyId = facultyIdOverride || id || '';
  const isDosenSelf = user?.role === 'dosen';
  const canManage = user?.role === 'admin';
  const userFacultyId = (user as { facultyId?: string })?.facultyId;

  useEffect(() => {
    if (isDosenSelf && userFacultyId && facultyId && facultyId !== userFacultyId) {
      navigate('/dashboard/guru', { replace: true });
      return;
    }
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const data = await facultyAPI.getById(facultyId);
        setFaculty(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching faculty:', err);
        setError('Gagal memuat data guru');
      } finally {
        setLoading(false);
      }
    };
    if (facultyId) fetchFaculty();
  }, [facultyId, isDosenSelf, navigate, userFacultyId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (error || !faculty) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Data guru tidak ditemukan</h2>
        <p className="mt-2 text-gray-600">{error || 'Data guru dengan ID tersebut tidak ditemukan.'}</p>
        <Link to={basePath} className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft size={16} className="mr-2" />
          Kembali
        </Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (window.confirm(`Anda yakin ingin menghapus data guru ${faculty.name}?`)) {
      try {
        await deleteFaculty(faculty._id);
        toast.success('Data guru berhasil dihapus');
        navigate('/dashboard/faculty');
      } catch (error) {
        console.error('Error deleting faculty:', error);
        toast.error('Gagal menghapus data guru');
      }
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to={basePath} className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Detail Guru</h1>
        </div>
        {canManage && (
          <div className="flex space-x-2">
        <Link
          to={`/dashboard/faculty/edit/${faculty._id}`}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Edit size={16} className="mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              <Trash2 size={16} className="mr-2" />
              Hapus
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-lg bg-white shadow-md">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Informasi Guru</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                {(() => {
                  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
                  const fotoSrc = faculty.foto
                    ? (faculty.foto.startsWith('http') || faculty.foto.startsWith('data:')
                        ? faculty.foto
                        : `${baseUrl}/uploads/${faculty.foto}`)
                    : '';
                  if (!fotoSrc) {
                    return (
                      <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                        {faculty.name.charAt(0)}
                      </div>
                    );
                  }
                  return (
                    <img
                      src={fotoSrc}
                      alt={faculty.name}
                      className="h-16 w-16 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold';
                          fallback.textContent = faculty.name.charAt(0);
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  );
                })()}
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">{faculty.name}</h3>
                  <p className="text-sm text-gray-600">{faculty.position || 'Guru'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {faculty.jenisKelamin && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Jenis Kelamin</p>
                    <p className="text-gray-900">{faculty.jenisKelamin}</p>
                  </div>
                )}
                {(faculty.nuptk || (faculty as { nik?: string }).nik) && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">NUPTK/NIK</p>
                    <p className="text-gray-900">{faculty.nuptk || (faculty as { nik?: string }).nik}</p>
                  </div>
                )}
                {faculty.nip && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">NIP</p>
                    <p className="text-gray-900">{faculty.nip}</p>
                  </div>
                )}
                {faculty.nrg && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">NRG</p>
                    <p className="text-gray-900">{faculty.nrg}</p>
                  </div>
                )}
                {faculty.satminkal && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">SATMINKAL</p>
                    <p className="text-gray-900">{faculty.satminkal}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Posisi</p>
                  <p className="text-gray-900">{faculty.position || 'Guru'}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pendidikan</h3>
                {faculty.education && faculty.education.length > 0 ? (
                  <div className="space-y-4">
                    {faculty.education.map((edu: any, index: number) => (
                      <div key={index} className="rounded-md bg-gray-50 p-4">
                        <div className="flex items-center">
                          <GraduationCap className="h-5 w-5 text-blue-600" />
                          <span className="ml-2 font-medium text-gray-900">{edu.degree}</span>
                          <span className="ml-2 text-sm text-gray-600">({edu.year})</span>
                        </div>
                        <p className="mt-1 text-gray-700">{edu.institution}</p>
                        {edu.field && <p className="text-sm text-gray-600">{edu.field}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Tidak ada data pendidikan</p>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mengajar</h3>
                {faculty.courses && faculty.courses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {faculty.courses.map((course: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                      >
                        <Book className="mr-1 h-4 w-4" />
                        {course}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Tidak ada data mengajar</p>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileIcon className="h-5 w-5 text-indigo-600" />
                  Dokumen Kepegawaian
                </h3>
                <div className="space-y-3">
                  {EMPLOYEE_DOC_CATEGORIES.map(({ key, label }) => {
                    const list = Array.isArray((faculty as any)[key]) ? (faculty as any)[key] : [];
                    const isOpen = openEmployeeSections[key] ?? false;
                    return (
                      <div key={key} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenEmployeeSections(prev => ({ ...prev, [key]: !isOpen }))
                          }
                          className="flex w-full items-center justify-between px-4 py-3"
                        >
                          <span className="font-medium text-gray-900">{label}</span>
                          <span className="flex items-center gap-2 text-sm text-gray-500">
                            {list.length > 0 && <span>{list.length} dokumen</span>}
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </span>
                        </button>
                        {isOpen && (
                          <div className="border-t border-gray-200 px-4 py-3">
                            {list.length > 0 ? (
                              <ul className="space-y-2">
                                {list.map((doc: any, index: number) => (
                                  <li
                                    key={doc._id || index}
                                    className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-sm"
                                  >
                                    <span className="truncate flex-1 mr-2" title={doc.namaDokumen}>
                                      {doc.namaDokumen}
                                    </span>
                                    {doc.fileData && (
                                      <button
                                        type="button"
                                        onClick={() => openDocumentUrl(doc.fileData)}
                                        className="inline-flex shrink-0 items-center text-indigo-600 hover:text-indigo-800"
                                      >
                                        <LinkIcon size={14} className="mr-1" />
                                        Lihat
                                      </button>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">Tidak ada dokumen</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDetail;
