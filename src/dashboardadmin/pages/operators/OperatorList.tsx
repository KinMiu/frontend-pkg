import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, Edit, Trash2, Users, Upload, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { operatorImportAPI } from '../../../services/api';
import * as XLSX from 'xlsx';

const OperatorList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { operators, deleteOperator, refreshData } = useCampusData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<{ _id: string; satminkal: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  useEffect(() => {
    if (user?.role === 'operator') {
      navigate('/dashboard', { replace: true });
    }
  }, [user?.role, navigate]);

  if (user?.role === 'operator') return null;

  const filteredOperators = operators.filter((op: any) => {
    const term = searchTerm.toLowerCase();
    return (
      (op.satminkal || '').toLowerCase().includes(term) ||
      (op.npsn || '').toLowerCase().includes(term) ||
      (op.email || '').toLowerCase().includes(term)
    );
  });

  const handleDeleteClick = (op: any) => {
    setSelectedOperator({ _id: op._id, satminkal: op.satminkal });
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedOperator) return;
    try {
      await deleteOperator(selectedOperator._id);
      toast.success('Data operator berhasil dihapus');
      setShowDeleteConfirm(false);
      setSelectedOperator(null);
    } catch (error) {
      console.error('Error deleting operator:', error);
      toast.error('Gagal menghapus data operator');
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

  const handleDownloadTemplate = () => {
    const url = operatorImportAPI.downloadTemplateUrl();
    window.open(url, '_blank');
  };

  const handleImportOperators = async () => {
    if (!selectedFile) {
      toast.error('Silakan pilih file Excel terlebih dahulu');
      return;
    }

    setImportSummary(null);

    try {
      setImporting(true);
      const data = await operatorImportAPI.importFromExcel(selectedFile);
      setImportSummary({
        totalRows: data.totalRows,
        created: data.created,
        skipped: data.skipped,
      });

      if (data.created > 0) {
        toast.success(`Berhasil mengimpor ${data.created} data operator`);
      }
      if (data.skipped > 0) {
        toast(
          `Ada ${data.skipped} baris yang dilewati. Periksa kembali file Excel jika diperlukan.`,
          { icon: 'ℹ️' }
        );
      }

      await refreshData();
    } catch (error: any) {
      console.error('Error importing operators:', error);
      toast.error(error?.message || 'Gagal mengimpor data operator');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Operator</h1>
        <div className="mt-4 flex flex-col gap-2 md:mt-0 md:flex-row">
          <button
            type="button"
            onClick={handleOpenImportModal}
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            <Upload size={16} className="mr-2" />
            Import Excel
          </button>
          <Link
            to="/dashboard/operators/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah Data Operator
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari SATMINKAL, NPSN, atau Email..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {importSummary && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <p className="font-semibold mb-1">Ringkasan Import Excel Operator</p>
          <p>Total baris dibaca: {importSummary.totalRows}</p>
          <p>Berhasil ditambahkan: {importSummary.created}</p>
          <p>Dilewati: {importSummary.skipped}</p>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Import Data Operator dari Excel</h2>
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
                  className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
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
                          <th className="px-3 py-2 text-left font-medium text-gray-600">SATMINKAL</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">NPSN</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Email</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Latitude</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Longitude</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Link Google Maps</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {previewRows.slice(0, 10).map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-3 py-1.5 text-gray-500">{index + 1}</td>
                            <td className="px-3 py-1.5">
                              {row['satminkal'] || row['SATMINKAL'] || row['Satminkal'] || '-'}
                            </td>
                            <td className="px-3 py-1.5">
                              {row['npsn'] || row['NPSN'] || row['Npsn'] || '-'}
                            </td>
                            <td className="px-3 py-1.5">
                              {row['email'] || row['Email'] || row['EMAIL'] || '-'}
                            </td>
                            <td className="px-3 py-1.5">
                              {row['latitude'] || row['Latitude'] || row['LATITUDE'] || '-'}
                            </td>
                            <td className="px-3 py-1.5">
                              {row['longitude'] || row['Longitude'] || row['LONGITUDE'] || '-'}
                            </td>
                            <td className="px-3 py-1.5">
                              {row['linkGoogleMaps'] ||
                                row['Link Google Maps'] ||
                                row['LINK_GOOGLE_MAPS'] ||
                                row['link_google_maps'] ||
                                '-'}
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
            <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-6 py-3">
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
                onClick={handleImportOperators}
                disabled={importing || !selectedFile}
                className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {importing ? 'Mengimpor...' : 'Import Operator'}
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredOperators.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SATMINKAL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NPSN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latitude
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Longitude
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link Google Maps
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOperators.map((op: any, index: number) => (
                <tr key={op._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {op.satminkal}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {op.npsn}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {op.email || '–'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{op.latitude || '–'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{op.longitude || '–'}</td>
                  <td className="px-6 py-4 text-sm">
                    {op.linkGoogleMaps ? (
                      <a href={op.linkGoogleMaps} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-[180px] inline-block">
                        Buka Peta
                      </a>
                    ) : (
                      '–'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/dashboard/operators/edit/${op._id}`}
                        className="rounded-md bg-blue-50 p-1.5 text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit Data Operator"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(op)}
                        className="rounded-md bg-red-50 p-1.5 text-red-600 hover:bg-red-100 transition-colors"
                        title="Hapus Data Operator"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <Users size={48} className="mx-auto mb-4 text-blue-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Belum ada data operator</h3>
          <p className="mb-4 text-gray-600">
            Tambahkan data SATMINKAL dan NPSN agar bisa digunakan saat input data guru.
          </p>
          <Link
            to="/dashboard/operators/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah Data Operator
          </Link>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus data operator untuk SATMINKAL "${selectedOperator?.satminkal}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default OperatorList;

