import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { achievementAPI } from '../services/api';
import { Achievement } from '../types';

const Prestasi = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [fullImageSrc, setFullImageSrc] = useState<string | null>(null);

  const descriptionRef = useRef<HTMLParagraphElement | null>(null);

  // Tentukan berapa item per halaman berdasarkan ukuran layar
  const itemsPerPage = {
    mobile: 5,
    tablet: 6,
    desktop: 10
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      try {
        const data = await achievementAPI.getAll();
        setAchievements(data);
        setError(null);
      } catch (err) {
        setError('Gagal memuat data prestasi');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Memperbarui ukuran layar saat window diresize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Menghitung jumlah item yang ditampilkan per halaman berdasarkan ukuran layar
  const itemsToShow = windowWidth < 640 ? itemsPerPage.mobile : windowWidth < 1024 ? itemsPerPage.tablet : itemsPerPage.desktop;

  // Urutkan data berdasarkan tahun terbaru
  const sortedPrestasi = [...achievements].sort((a, b) => new Date(b.tahun).getTime() - new Date(a.tahun).getTime());

  // Menentukan start dan end index untuk item yang akan ditampilkan
  const indexOfLastItem = currentPage * itemsToShow;
  const indexOfFirstItem = indexOfLastItem - itemsToShow;
  const currentItems = sortedPrestasi.slice(indexOfFirstItem, indexOfLastItem);

  // Menghitung total halaman
  const totalPages = Math.ceil(sortedPrestasi.length / itemsToShow);

  // Fungsi untuk menangani perubahan halaman
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Fungsi untuk toggle deskripsi
  const toggleDescription = (id: string) => {
    setExpandedItems(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-20 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-extrabold text-gray-900">Prestasi Peserta Didik di Kecamatan Barat</h1>
        <p className="text-lg text-gray-600 mt-3">Pencapaian Membanggakan Peserta Didik di Kecamatan Barat.</p>
      </div>

      {/* Prestasi Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentItems.map((item) => {
            const isExpanded = expandedItems[item._id];
            const shortDescription = item.deskripsi.length > 100 ? item.deskripsi.substring(0, 200) + '...' : item.deskripsi;

            const mahasiswaList = Array.isArray(item.mahasiswa)
              ? item.mahasiswa
              : typeof item.mahasiswa === 'string' && item.mahasiswa
                ? [item.mahasiswa]
                : [];

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md cursor-pointer"
                style={{ willChange: 'transform, opacity' }}
                onClick={() => setSelectedAchievement(item)}
              >
                {/* Header ala Instagram: avatar + nama + tahun */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-400 p-[2px]">
                      <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-xs font-semibold text-gray-800">
                        {(item.satminkal || 'PKG Barat').charAt(0)}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        {item.satminkal || 'PKG Kecamatan Barat'}
                      </span>
                      <span className="text-xs text-gray-500">{item.tahun}</span>
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden">
                  {(() => {
                    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
                    const src =
                      item.foto && (item.foto.startsWith('http') || item.foto.startsWith('data:'))
                        ? item.foto
                        : item.foto
                          ? `${baseUrl}/uploads/${item.foto}`
                          : '';
                    if (!src) {
                      return <div className="w-full h-72 bg-gray-200" />;
                    }
                    return (
                      <motion.img
                        src={src}
                        alt={`Foto prestasi: ${item.judul}`}
                        className="w-full h-72 object-cover"
                        loading="lazy"
                      />
                    );
                  })()}
                </div>

                {/* Caption & info ala Instagram */}
                <div className="px-4 pt-3 pb-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 break-words">
                    {item.judul}
                  </h3>
                  <div className="flex flex-col">
                    <p
                      ref={descriptionRef}
                      id={item._id}
                      className={`text-gray-700 text-sm leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}
                    >
                      {isExpanded ? item.deskripsi : shortDescription}
                    </p>
                    {item.deskripsi.length > 200 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDescription(item._id);
                        }}
                        className="text-xs font-semibold text-gray-500 mt-1"
                      >
                        {isExpanded ? 'Sembunyikan' : 'Selengkapnya'}
                      </button>
                    )}
                  </div>
                  <div className="border-t pt-3 mt-2">
                    <p className="text-xs font-semibold text-gray-800 mb-1">Siswa</p>
                    <ul className="text-xs text-gray-600 list-none space-y-1">
                      {mahasiswaList.map((nama, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-blue-700 rounded-full"></span>
                          {nama}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="inline-flex rounded-md shadow-sm">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`${
                  currentPage === index + 1 ? 'bg-blue-700 text-white' : 'bg-white text-gray-900'
                } px-4 py-2 border border-gray-300 rounded-l-md hover:bg-blue-100 transition`}
              >
                {index + 1}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* CTA Section */}
      
      {/* Detail Modal */}
      {selectedAchievement && (() => {
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
        const src =
          selectedAchievement.foto && (selectedAchievement.foto.startsWith('http') || selectedAchievement.foto.startsWith('data:'))
            ? selectedAchievement.foto
            : selectedAchievement.foto
              ? `${baseUrl}/uploads/${selectedAchievement.foto}`
              : '';
        const mahasiswaList =
          Array.isArray(selectedAchievement.mahasiswa)
            ? selectedAchievement.mahasiswa
            : typeof selectedAchievement.mahasiswa === 'string' && selectedAchievement.mahasiswa
              ? [selectedAchievement.mahasiswa]
              : [];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="relative">
                {src ? (
                  <img
                    src={src}
                    alt={selectedAchievement.judul}
                    className="w-full h-64 object-cover cursor-pointer"
                    onClick={() => src && setFullImageSrc(src)}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200" />
                )}
                <button
                  onClick={() => setSelectedAchievement(null)}
                  className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
                  aria-label="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedAchievement.judul}
                  </h2>
                  <div className="flex gap-2">
                    <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-md">
                      {selectedAchievement.tahun}
                    </span>
                    {selectedAchievement.satminkal && (
                      <span className="text-sm font-medium text-teal-700 bg-teal-100 px-3 py-1 rounded-md">
                        {selectedAchievement.satminkal}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Siswa:</p>
                  <div className="flex flex-wrap gap-2">
                    {mahasiswaList.map((nama, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800"
                      >
                        {nama}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Deskripsi:</p>
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedAchievement.deskripsi}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Fullscreen image viewer for prestasi */}
      {fullImageSrc && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 px-4"
          onClick={() => setFullImageSrc(null)}
        >
          <button
            type="button"
            onClick={() => setFullImageSrc(null)}
            className="absolute top-4 right-4 rounded-full bg-white/90 p-2 shadow text-gray-700 hover:bg-white"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={fullImageSrc}
            alt={selectedAchievement?.judul || 'Prestasi'}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Prestasi;
