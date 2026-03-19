import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookOpen, GraduationCap, User, File as FileIcon, ChevronDown, ChevronUp, ExternalLink, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Faculty } from '../types';
import { useCampusData } from '../dashboardadmin/contexts/CampusDataContext';

interface DosenDetailProps {
  dosen: Faculty;
  onClose: () => void;
}

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

interface ImageViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, onClose }) => (
  <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000] p-4" onClick={onClose}>
    <button onClick={onClose} className="absolute top-4 right-4 text-white">
      <X className="h-6 w-6" />
    </button>
    <img src={src} alt={alt} className="max-h-[90vh] max-w-[90vw] object-contain" onClick={e => e.stopPropagation()} />
  </div>
);

const DosenDetail = ({ dosen, onClose }: DosenDetailProps) => {
  const [openEmployeeSections, setOpenEmployeeSections] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { hideEmployeeDocsPublic } = useCampusData();
  const lastEdu = dosen.education && dosen.education.length > 0 ? dosen.education[dosen.education.length - 1] : null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center mt-16 p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg"
      >
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-2xl font-semibold text-gray-900">Profil Guru</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6 mb-6 items-center md:items-start text-white">
              <div className="relative w-24 md:w-36 aspect-[3/4] rounded-2xl shadow-lg border-4 border-white/20 overflow-hidden">
                {dosen.foto ? (
                  <img
                    src={
                      dosen.foto.startsWith('http') || dosen.foto.startsWith('data:')
                        ? dosen.foto
                        : `${(import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '')}/uploads/${dosen.foto}`
                    }
                    alt={dosen.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => setSelectedImage(dosen.foto || '')}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-blue-500/40">
                    <User className="h-10 w-10 md:h-12 md:w-12 text-white" />
                    <span className="mt-2 text-xs md:text-sm font-medium text-white/90 text-center">
                      Foto belum diunggah
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3 mb-2 justify-center md:justify-start">
                  <h3 className="text-2xl md:text-3xl font-bold text-center md:text-left">{dosen.name}</h3>
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium">Guru</span>
                </div>
                 {dosen.jenisKelamin && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 opacity-80" />
                    <span>{dosen.jenisKelamin}</span>
                  </div>
                )}
                {/*{dosen.nuptk && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileIcon className="h-4 w-4 opacity-80" />
                    <span className="font-medium">NUPTK: {dosen.nuptk}</span>
                  </div>
                )}
                {dosen.nip && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileIcon className="h-4 w-4 opacity-80" />
                    <span>NIP: {dosen.nip}</span>
                  </div>
                )}
                {dosen.nrg && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileIcon className="h-4 w-4 opacity-80" />
                    <span>NRG: {dosen.nrg}</span>
                  </div>
                )} */}
                {dosen.satminkal && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 opacity-80" />
                    <span>SATMINKAL: {dosen.satminkal}</span>
                  </div>
                )}
                {lastEdu && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 opacity-80" />
                    <span>{lastEdu.degree}{lastEdu.institution ? ` ${lastEdu.institution}` : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Riwayat Pendidikan */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              Riwayat Pendidikan
            </h4>
            <div className="space-y-3">
              {dosen.education && dosen.education.length > 0 ? (
                dosen.education.map((edu, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-800">{edu.degree}{edu.institution ? ` - ${edu.institution}` : ''}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">Tidak ada data pendidikan</div>
              )}
            </div>
          </div>

          {/* Mengajar */}
          {dosen.courses && dosen.courses.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Mengajar
              </h4>
              <div className="space-y-3">
                {dosen.courses.map((course, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-800">{course}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dokumen Kepegawaian */}
          {!hideEmployeeDocsPublic && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileIcon className="h-5 w-5 text-blue-600" />
                Dokumen Kepegawaian
              </h4>
              <div className="space-y-3">
                {EMPLOYEE_DOC_CATEGORIES.map(({ key, label }) => {
                  const list = Array.isArray((dosen as any)[key]) ? (dosen as any)[key] : [];
                  const isOpen = openEmployeeSections[key] ?? false;
                  return (
                    <div key={key} className="rounded-xl border border-gray-100 bg-white shadow-sm">
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
                                <li key={doc._id || index} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                                  <span className="truncate flex-1 mr-2" title={doc.namaDokumen}>{doc.namaDokumen}</span>
                                  {doc.fileData && (
                                    <button
                                      type="button"
                                      onClick={() => openDocumentUrl(doc.fileData)}
                                      className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-blue-600 hover:bg-blue-100 transition-colors"
                                    >
                                      Lihat <ExternalLink className="h-4 w-4" />
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
          )}
        </div>
      </motion.div>

      {selectedImage && (
        <ImageViewer src={selectedImage} alt="Preview" onClose={() => setSelectedImage(null)} />
      )}
    </div>,
    document.body
  );
};

export default DosenDetail;
