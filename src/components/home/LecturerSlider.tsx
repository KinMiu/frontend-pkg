import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { BookOpen, GraduationCap, MapPin, UserCircle } from 'lucide-react';
import { usePublicCampusData } from '../../contexts/PublicCampusDataContext';
import { Faculty } from '../../types';
import { formatFacultyPositionDisplay } from '../../utils/facultyPosition';
import DosenDetail from '../DosenDetail';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const LecturerAvatar: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className="w-32 h-32 rounded-full flex items-center justify-center text-white border-4 border-white shadow-md"
        style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 100%)' }}
      >
        <UserCircle className="h-20 w-20 text-white/95" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-gray-100"
    />
  );
};

const LecturerSlider: React.FC = () => {
  const { faculty, loading, error } = usePublicCampusData();
  const [filteredFaculty, setFilteredFaculty] = useState<Faculty[]>(faculty);
  const [selectedDosen, setSelectedDosen] = useState<Faculty | null>(null);

  useEffect(() => {
    setFilteredFaculty(faculty);
  }, [faculty]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div className="mt-20 px-4 md:px-16 lg:px-32 ">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Data Guru di Kecamatan Barat</h2>
      <p className="text-center text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
        Tenaga pengajar dari lulusan Universitas terkemuka yang ahli di bidangnya.
      </p>
      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        pagination={{ clickable: true }}
        speed={400}
        autoplay={{ delay: 2500, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="py-10 pb-12"
      >
        {filteredFaculty.map((lecturer) => {
          const lastEdu = lecturer.education && lecturer.education.length > 0 ? lecturer.education[lecturer.education.length - 1] : null;
          const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
          const fotoSrc = lecturer.foto
            ? (lecturer.foto.startsWith('http') || lecturer.foto.startsWith('data:')
              ? lecturer.foto
              : `${baseUrl}/uploads/${lecturer.foto}`)
            : undefined;

          return (
            <SwiperSlide key={lecturer._id}>
              <div
                className="relative flex flex-col items-center bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all max-w-sm mx-auto border border-gray-100 px-6 pt-16 pb-6 min-h-[370px] hover:-translate-y-1 duration-200 cursor-pointer group"
                onClick={() => setSelectedDosen(lecturer)}
                title="Lihat detail guru"
              >
                {/* Foto bulat floating atau avatar inisial, lebih besar dan lebih dekat ke nama */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10">
                  <LecturerAvatar src={fotoSrc} alt={lecturer.name} />
                </div>
                {/* Konten utama */}
                <div className="flex flex-col items-center mt-12 w-full">
                  <h3 className="text-xl font-extrabold text-gray-900 text-center mb-1 group-hover:text-blue-700 transition-colors">{lecturer.name}</h3>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-2">
                    <BookOpen size={16} className="text-blue-500" />
                    {formatFacultyPositionDisplay(lecturer.position)}
                  </span>
                  <div className="w-12 border-b-2 border-blue-100 mb-2" />
                  <div className="w-full flex flex-col divide-y divide-gray-100 bg-gray-50 rounded-xl shadow-sm mt-2">
                    <div className="flex items-center gap-2 px-4 py-2">
                      <GraduationCap size={18} className="text-gray-600" />
                      <span className="truncate">
                        {lastEdu ? `${lastEdu.degree}${lastEdu.institution ? ' - ' + lastEdu.institution : ''}` : <span className='bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full text-xs'>Belum Ada Data</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2">
                      <BookOpen size={18} className="text-gray-600" />
                      <span className="text-xs font-medium text-gray-500 shrink-0">Mengajar</span>
                      <span className="truncate">
                        {Array.isArray(lecturer.courses) && lecturer.courses.length > 0 ? (
                          lecturer.courses.slice(0, 3).join(', ')
                        ) : (
                          <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full text-xs">Belum Ada Data</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2">
                      <MapPin size={18} className="text-gray-600" />
                      <span className="text-xs font-medium text-gray-500 shrink-0">Satminkal</span>
                      <span className="truncate">
                        {lecturer.satminkal ? (
                          lecturer.satminkal
                        ) : (
                          <span className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full text-xs">Belum Ada Data</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      {/* Modal detail dosen */}
      {selectedDosen && (
        <DosenDetail dosen={selectedDosen} onClose={() => setSelectedDosen(null)} />
      )}
    </div>
  );
};

export default LecturerSlider;
