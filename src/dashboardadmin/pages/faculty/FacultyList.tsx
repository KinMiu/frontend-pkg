import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Faculty } from '../../types';
import { Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight, Upload, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { facultyImportAPI } from '../../../services/api';
import * as XLSX from 'xlsx';

const FacultyList: React.FC = () => {
  const { faculty, deleteFaculty, refreshData, hideEmployeeDocsPublic, setHideEmployeeDocsPublic } = useCampusData();
  const { user } = useAuth();
  const isOperator = (user as { role?: string } | null)?.role === 'operator';
  const isAdmin = (user as { role?: string } | null)?.role === 'admin';
  const operatorSatminkal = (user as { satminkal?: string })?.satminkal || '';
  const facultyForRole = isOperator && operatorSatminkal
    ? faculty.filter(f => (f.satminkal || '').trim() === operatorSatminkal.trim())
    : faculty;
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: '',
    name: ''
  });
  const [importing, setImporting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<null | {
    totalRows: number;
    created: number;
    skipped: number;
  }>(null);
  const [satminkalFilter, setSatminkalFilter] = useState<string>('');
  const itemsPerPage = 10;

  const filteredFaculty = facultyForRole.filter(f => {
    const matchesSearch =
      searchTerm === '' ||
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.nuptk && f.nuptk.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.nip && f.nip.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSatminkal =
      !satminkalFilter ||
      (f.satminkal || '').trim().toLowerCase() === satminkalFilter.trim().toLowerCase();

    return matchesSearch && matchesSatminkal;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFaculty.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFaculty.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDownloadTemplate = () => {
    const url = facultyImportAPI.downloadTemplateUrl(isOperator ? 'operator' : 'admin');
    window.open(url, '_blank');
  };

  const handleDeleteClick = (_id: string, name: string) => {
    setDeleteConfirm({ show: true, id: _id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      setIsDeleting(true);
      await deleteFaculty(deleteConfirm.id);
      toast.success('Data guru berhasil dihapus');
      setDeleteConfirm({ show: false, id: '', name: '' });
    } catch (error) {
      console.error('Error deleting faculty:', error);
      toast.error('Gagal menghapus data guru');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreviewRows([]);
    setPreviewError(null);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) {
          setPreviewError('Gagal membaca file Excel');
          return;
        }
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        setPreviewRows(rows.slice(0, 50));
        if (rows.length === 0) {
          setPreviewError('File tidak berisi data');
        }
      } catch (err) {
        console.error('Error parsing Excel:', err);
        setPreviewError('Format file tidak valid. Pastikan menggunakan template yang disediakan.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
    setSelectedFile(null);
    setPreviewRows([]);
    setPreviewError(null);
    setImportSummary(null);
  };

  const handleCloseImportModal = () => {
    if (importing) return;
    setIsImportModalOpen(false);
  };

  const handleImportGuru = async () => {
    if (!selectedFile) {
      toast.error('Silakan pilih file Excel terlebih dahulu');
      return;
    }

    try {
      setImporting(true);
      const data = await facultyImportAPI.importFromExcel(selectedFile, {
        mode: isOperator ? 'operator' : 'admin',
        satminkal: isOperator ? operatorSatminkal : undefined,
      });
      setImportSummary({
        totalRows: data.totalRows,
        created: data.created,
        skipped: data.skipped,
      });

      if (data.created > 0) {
        toast.success(`Berhasil mengimpor ${data.created} data guru`);
      }
      if (data.skipped > 0) {
        toast(
          `Ada ${data.skipped} baris yang dilewati. Periksa kembali file Excel jika diperlukan.`,
          { icon: 'ℹ️' }
        );
      }

      await refreshData();
    } catch (error: any) {
      console.error('Error importing faculties:', error);
      toast.error(error?.message || 'Gagal mengimpor data guru');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Guru</h1>
        <div className="mt-4 flex flex-col gap-2 md:mt-0 md:flex-row">
          
          <button
            type="button"
            onClick={handleOpenImportModal}
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Upload size={16} className="mr-2" />
            Import Excel
          </button>
          <Link
            to="/dashboard/faculty/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={16} className="mr-2" />
            Tambah Guru
          </Link>
        </div>
      
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
          <div className={isAdmin ? 'md:col-span-6' : 'md:col-span-8'}>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Pencarian
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama, NUPTK/NIK, atau NIP..."
                className="h-10 w-full rounded-md border border-gray-300 pl-10 pr-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              SATMINKAL
            </label>
            <select
              value={satminkalFilter}
              onChange={(e) => setSatminkalFilter(e.target.value)}
              className="h-10 w-full rounded-md border border-gray-300 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Semua SATMINKAL</option>
              {Array.from(
                new Set(
                  facultyForRole
                    .map(f => (f.satminkal || '').trim())
                    .filter(v => v !== '')
                )
              ).map((sat) => (
                <option key={sat} value={sat}>
                  {sat}
                </option>
              ))}
            </select>
          </div>
          {isAdmin && (
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Sembunyikan
              </label>
              <div className="flex h-10 w-full items-center gap-2 rounded-md border border-gray-300 px-3 text-sm">
                <button
                  type="button"
                  onClick={() => setHideEmployeeDocsPublic(!hideEmployeeDocsPublic)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full border-2 transition-colors ${
                    hideEmployeeDocsPublic ? 'bg-red-500 border-red-500' : 'bg-gray-200 border-gray-300'
                  }`}
                  aria-pressed={hideEmployeeDocsPublic}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      hideEmployeeDocsPublic ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                  Dokumen Kepegawaian
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {importSummary && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="font-semibold mb-1">Ringkasan Import Excel</p>
          <p>Total baris dibaca: {importSummary.totalRows}</p>
          <p>Berhasil ditambahkan: {importSummary.created}</p>
          <p>Dilewati: {importSummary.skipped}</p>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Import Data Guru dari Excel</h2>
              <button
                type="button"
                onClick={handleCloseImportModal}
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-gray-600">
                  Gunakan template yang disediakan agar format kolom sesuai. Setelah memilih file, data akan ditampilkan sebagai pratinjau sebelum diimport.
                </p>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-xs font-medium text-white ring-1 ring-inset ring-gray-300 hover:bg-blue-700"
                >
                  <Download size={14} className="mr-1" />
                  Download Template
                </button>
              </div>

              <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-4">
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
                  <Upload size={24} className="text-gray-500" />
                  <div className="text-sm text-gray-700">
                    {selectedFile ? (
                      <>
                        <span className="font-medium">{selectedFile.name}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          ({Math.round(selectedFile.size / 1024)} KB)
                        </span>
                      </>
                    ) : (
                      <span>
                        <span className="font-medium text-blue-600">Pilih file Excel</span> atau seret ke sini
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">Format yang didukung: .xlsx, .xls</p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={importing}
                  />
                </label>
              </div>

              {previewError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {previewError}
                </div>
              )}

              {previewRows.length > 0 && (
                <div>
                  <p className="mb-2 text-xs text-gray-500">
                    Pratinjau {Math.min(previewRows.length, 10)} baris pertama dari file (maks. 50 baris ditampilkan).
                  </p>
                  <div className="max-h-64 overflow-auto rounded-md border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">#</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Nama Lengkap</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Jenis Kelamin</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">NUPTK/NIK</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">NIP</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">NRG</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">SATMINKAL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {previewRows.slice(0, 10).map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-1.5 text-gray-500">{index + 1}</td>
                            <td className="px-3 py-1.5">
                              {row['Nama Lengkap'] || row['Nama'] || row['nama'] || '-'}
                            </td>
                            <td className="px-3 py-1.5">
                              {row['Jenis Kelamin'] || row['jenis_kelamin'] || row['jenisKelamin'] || '-'}
                            </td>
                            <td className="px-3 py-1.5">
                              {row['NUPTK'] || row['nuptk'] || row['NIK'] || row['nik'] || '-'}
                            </td>
                            <td className="px-3 py-1.5">
                              {row['NIP'] || row['nip'] || '-'}
                            </td>
                            <td className="px-3 py-1.5">
                              {row['NRG'] || row['nrg'] || '-'}
                            </td>
                            <td className="px-3 py-1.5">
                              {row['SATMINKAL'] || row['satminkal'] || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importSummary && (
                <div className="rounded-md border border-green-200 bg-green-50 p-3 text-xs text-green-800">
                  <p className="font-semibold mb-1">Ringkasan Import</p>
                  <p>Total baris diproses: {importSummary.totalRows}</p>
                  <p>Berhasil ditambahkan: {importSummary.created}</p>
                  <p>Dilewati: {importSummary.skipped}</p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px  -6 py-3 mr-5">
              <button
                type="button"
                onClick={handleCloseImportModal}
                disabled={importing}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleImportGuru}
                disabled={importing || !selectedFile}
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {importing ? 'Mengimpor...' : 'Import Guru'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nama
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  NUPTK/NIK
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Posisi
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentItems.length > 0 ? (
                currentItems.map((faculty: Faculty) => (
                  <tr key={faculty._id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        {(() => {
                          const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
                          const fotoSrc = faculty.foto
                            ? (faculty.foto.startsWith('http') || faculty.foto.startsWith('data:')
                              ? faculty.foto
                              : `${baseUrl}/uploads/${faculty.foto}`)
                            : '';

                          if (!fotoSrc) {
                            return (
                              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white">
                                {faculty.name.charAt(0)}
                              </div>
                            );
                          }

                          return (
                            <img
                              src={fotoSrc}
                              alt={faculty.name}
                              className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'h-10 w-10 flex-shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white';
                                  fallback.textContent = faculty.name.charAt(0);
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          );
                        })()}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{faculty.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {faculty.nuptk || (faculty as { nik?: string }).nik || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{faculty.position || 'Guru'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                      <div className="flex justify-center space-x-3">
                        <Link to={`/dashboard/faculty/${faculty._id}`} className="text-blue-600 hover:text-blue-900" title="Lihat Detail">
                          <Eye size={18} />
                        </Link>
                        {user?.role === 'admin' && (
                          <>
                            <Link 
                              to={`/dashboard/faculty/edit/${faculty._id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(faculty._id, faculty.name)}
                              className={`text-red-600 hover:text-red-900 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                              disabled={isDeleting}
                              title="Hapus"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                    Tidak ada data guru yang ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredFaculty.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  currentPage === 1
                    ? 'cursor-not-allowed text-gray-400'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  currentPage === totalPages
                    ? 'cursor-not-allowed text-gray-400'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredFaculty.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredFaculty.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${
                      currentPage === 1
                        ? 'cursor-not-allowed'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-500 text-white focus:z-20'
                          : 'text-gray-900 hover:bg-gray-50 focus:z-20'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${
                      currentPage === totalPages
                        ? 'cursor-not-allowed'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={deleteConfirm.show}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus data guru ${deleteConfirm.name}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: '', name: '' })}
      />
    </div>
  );
};

export default FacultyList;