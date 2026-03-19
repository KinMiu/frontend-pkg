import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow, Autoplay } from 'swiper/modules';
import { BookOpen, Users, Trophy, Heart, Search, GraduationCap, Book, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import KegiatanDetail from '../components/KegiatanDetail';
import { eventAPI, facilityAPI, kurikulumAPI, programAPI } from '../services/api';
import { Event, Facility, Kurikulum, Program as ProgramType } from '../types';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

const Program = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKurikulum, setSelectedKurikulum] = useState('');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({});
  const [showAllKegiatan, setShowAllKegiatan] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState<Event | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(null);
  const [kegiatan, setKegiatan] = useState<Event[]>([]);
  const [fasilitas, setFasilitas] = useState<Facility[]>([]);
  const [kurikulumData, setKurikulumData] = useState<Kurikulum[]>([]);
  const [programs, setPrograms] = useState<ProgramType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFacilityDesc, setExpandedFacilityDesc] = useState<Set<string>>(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const [eventData, facilityData, kurikulumResult, programResult] = await Promise.all([
          eventAPI.getAll(),
          facilityAPI.getAll(),
          kurikulumAPI.getAll(),
          programAPI.getAll(true),
        ]);
        setKegiatan(eventData);
        setFasilitas(facilityData);
        setKurikulumData(kurikulumResult);
        setPrograms(Array.isArray(programResult) ? programResult : []);
        setError(null);
      } catch (err) {
        setError('Gagal memuat data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const displayedKegiatan = showAllKegiatan ? kegiatan : kegiatan.slice(0, 6);

  const toggleFacilityDesc = (id: string) => {
    setExpandedFacilityDesc(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isFacilityDescLong = (text: string) => text.length > 80;

  // Toggle expanded state for a specific curriculum
  const toggleCourseExpansion = (itemId: string) => {
    setExpandedCourses(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Filter kurikulum based on search and selection
  const filteredKurikulum = kurikulumData.filter(item =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedKurikulum === '' || item.nama === selectedKurikulum)
  );

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
    <div className="py-24 sm:py-32">
      {/* Programs Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-800">PROGRAM UNGGULAN</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Program Pengembangan Peserta Didik di Kecamatan Barat
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Berbagai program yang dirancang untuk mengembangkan potensi dan kemampuan peserta didik di Kecamatan Barat.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-16">
            {programs.length > 0 ? (
              programs
                .slice()
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((program) => {
                  const icons = [BookOpen, Users, Trophy, Heart, GraduationCap, Book];
                  const RandomIcon = icons[Math.floor(Math.random() * icons.length)];
                  return (
                    <motion.button
                      type="button"
                      key={program._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="flex w-full flex-col rounded-xl bg-white p-8 text-left shadow-lg hover:shadow-xl hover:-translate-y-1 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() => setSelectedProgram(program)}
                    >
                      <dt className="flex items-center gap-x-3 text-lg font-semibold text-gray-900">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <RandomIcon className="h-5 w-5" />
                        </span>
                        <span>{program.title}</span>
                      </dt>
                      <dd className="mt-4 text-base text-gray-600 leading-relaxed line-clamp-3">
                        {program.description}
                      </dd>
                    </motion.button>
                  );
                })
            ) : (
              <div className="col-span-full text-center text-gray-500">
                Belum ada data program di PKG Kecamatan Barat.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kurikulum Section with Search & Filter */}

      

      {/* Fasilitas Section with 3D Carousel */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Fasilitas </h2>
            <p className="mt-4 text-lg text-gray-600">
              Fasilitas modern untuk mendukung pembelajaran dan praktikum di sekolah di bawah naungan PKG Kecamatan Barat.
            </p>
          </div>

          {fasilitas.length > 0 ? (
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              pagination={{ clickable: true }}
              modules={[EffectCoverflow, Pagination, Autoplay]}
              className="w-full py-12"
            >
              {fasilitas.map((item) => (
                <SwiperSlide
                  key={item._id}
                  className="w-[300px] sm:w-[350px] bg-white rounded-xl overflow-hidden shadow-lg"
                >
                  {(() => {
                    const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
                    const src =
                      item.foto && (item.foto.startsWith('http') || item.foto.startsWith('data:'))
                        ? item.foto
                        : item.foto
                          ? `${baseUrl}/uploads/${item.foto}`
                          : '';
                    if (!src) {
                      return <div className="w-full h-[250px] bg-gray-200" />;
                    }
                    return (
                      <img
                        src={src}
                        alt={item.nama}
                        className="w-full h-[250px] object-cover"
                      />
                    );
                  })()}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.nama}
                    </h3>
                    <p className="text-gray-600">
                      {expandedFacilityDesc.has(item._id) ? (
                        <>
                          {item.deskripsi}
                          <button
                            onClick={() => toggleFacilityDesc(item._id)}
                            className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Sembunyikan
                          </button>
                        </>
                      ) : (
                        <>
                          {isFacilityDescLong(item.deskripsi)
                            ? `${item.deskripsi.substring(0, 80)}...`
                            : item.deskripsi}
                          {isFacilityDescLong(item.deskripsi) && (
                            <button
                              onClick={() => toggleFacilityDesc(item._id)}
                              className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Lihat selengkapnya
                            </button>
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Belum ada data fasilitas</p>
            </div>
          )}
        </div>
      </div>

      {/* Kegiatan Section */}
<div className="bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
        Program Unggulan
      </span>
      <h2 className="text-3xl font-bold text-gray-900">Kegiatan Akademik</h2>
      <p className="mt-4 text-lg text-gray-600">
        Berbagai kegiatan untuk mengembangkan soft skill dan hard skill peserta didik.
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayedKegiatan.map((item) => (
        <motion.div
                key={item._id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl flex flex-col"
        >
          {/* Gambar Kegiatan dengan Overlay */}
          <div className="relative overflow-hidden">
            {(() => {
              const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
              const foto = (item.fotos && item.fotos.length > 0) ? item.fotos[0] : item.foto;
              const src =
                foto && (foto.startsWith('http') || foto.startsWith('data:'))
                  ? foto
                  : foto
                    ? `${baseUrl}/uploads/${foto}`
                    : '';
              if (!src) {
                return <div className="w-full h-64 bg-gray-200" />;
              }
              return (
                <img
                  src={src}
                  alt={item.nama}
                  className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform"
                />
              );
            })()}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Badge Tanggal */}
            <div className="absolute top-4 right-4 bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg flex items-center justify-center">
              {item.tanggal}
            </div>

            {/* Label Kategori & Satminkal */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                {item.jenis || "Workshop"}
              </span>
              {item.satminkal && (
                <span className="inline-block bg-blue-600/90 text-white text-xs px-3 py-1 rounded-full">
                  {item.satminkal}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-grow">
            {item.satminkal && (
              <span className="inline-block text-blue-600 text-[11px] font-medium mb-1">{item.satminkal}</span>
            )}
            
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
              {item.nama}
            </h3>
            <p className="mt-1 text-sm text-gray-600 line-clamp-3 flex-grow leading-relaxed">
              {item.deskripsi}
            </p>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                📍 {item.lokasi || "PKG Kecamatan Barat"}
              </div>

              <button
                onClick={() => setSelectedKegiatan(item)}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Selengkapnya
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Tombol Lihat Semua */}
    {kegiatan.length > 6 && (
      <div className="text-center mt-10">
        <button
          onClick={() => setShowAllKegiatan(!showAllKegiatan)}
          className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
        >
          {showAllKegiatan ? 'Sembunyikan Kegiatan' : 'Lihat Semua Kegiatan'}
          {showAllKegiatan ? (
            <ChevronUp className="ml-2 h-5 w-5" />
          ) : (
            <ChevronDown className="ml-2 h-5 w-5" />
          )}
        </button>
      </div>
    )}
  </div>
</div>

      {/* Kegiatan Detail Modal */}
      {selectedKegiatan && (
        <KegiatanDetail
          kegiatan={selectedKegiatan}
          onClose={() => setSelectedKegiatan(null)}
        />
      )}

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-w-lg w-full rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Detail Program</h3>
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <h4 className="text-xl font-bold text-gray-900">{selectedProgram.title}</h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedProgram.description}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Program;