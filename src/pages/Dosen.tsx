import React, { useState, useEffect } from 'react';
import { facultyAPI } from '../services/api';
import { Faculty } from '../types';
import DosenDetail from '../components/DosenDetail';
import { BookOpen, GraduationCap, UserCircle } from 'lucide-react';

const ProfileCover: React.FC<{ src?: string; alt: string }> = ({ src, alt }) => {
  const [error, setError] = useState(false);

  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
  const resolvedSrc =
    src && (src.startsWith('http') || src.startsWith('data:'))
      ? src
      : src
        ? `${baseUrl}/uploads/${src}`
        : '';

  if (!resolvedSrc || error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-400 to-gray-200">
        <UserCircle className="h-24 w-24 text-white/90 drop-shadow" />
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      onError={() => setError(true)}
      className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full object-cover object-top opacity-70"
      style={{ zIndex: 1 }}
    />
  );
};

const Dosen: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDosen, setSelectedDosen] = useState<Faculty | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      try {
        const data = await facultyAPI.getAll();
        setFaculty(data);
        setError(null);
      } catch (err) {
        setError('Gagal memuat data guru');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFaculty = faculty.filter((f) => {
    return searchTerm === '' ||
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.nuptk && f.nuptk.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ((f as any).nik && (f as any).nik.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.nip && f.nip.toLowerCase().includes(searchTerm.toLowerCase()));
  });

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
    <div className="bg-gray-50 min-h-screen pt-16 pb-16 ">
      {/* Header Besar */}
      <div className="text-center pt-12 pb-6 mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Data Guru di Kecamatan Barat</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Tenaga pengajar dari lulusan Universitas terkemuka yang ahli di bidangnya.</p>
      </div>

      {/* Search and Filter */}
      <div className="px-5 mb-8 max-w-4xl mx-auto flex flex-col md:flex-row gap-4 justify-center items-center">
        <input
          type="text"
          placeholder="Cari nama, NUPTK/NIK, NIP..."
          className="border border-gray-300 rounded px-4 py-2 w-full md:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List Dosen */}
      <div className="max-w-7xl mx-auto grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-4">
        {filteredFaculty.map((dosen) => {
          // Ambil pendidikan terakhir (jika ada)
          const lastEdu = dosen.education && dosen.education.length > 0 ? dosen.education[dosen.education.length - 1] : null;
          // Ambil 2 mata kuliah pertama (jika ada)
          const firstCourses = dosen.courses ? dosen.courses.slice(0, 2) : [];
          const moreCourses = dosen.courses && dosen.courses.length > 2 ? dosen.courses.length - 2 : 0;
          return (
            <div
              key={dosen._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
            >
              {/* Foto dan Nama di atas dengan gradient */}
              <div className="relative h-56 bg-gradient-to-b from-gray-400 to-gray-200 flex items-end justify-center">
                <ProfileCover src={dosen.foto} alt={dosen.name} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-white/0" style={{zIndex:2}} />
                <div className="relative z-10 p-6 w-full">
                  <div className="font-bold text-2xl text-white drop-shadow mb-1">{dosen.name}</div>
                  <div className="text-white/90 text-base font-medium flex items-center gap-2 mb-1">
                    <GraduationCap className="h-5 w-5 inline-block text-white/80" />
                    {lastEdu ? `${lastEdu.degree}${lastEdu.institution ? ' ' + lastEdu.institution : ''}` : dosen.position || '-'}
                  </div>
                </div>
              </div>
              {/* Konten Utama */}
              <div className="p-6 flex flex-col gap-2 flex-1">
                {/* Mengajar */}
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <BookOpen className="h-4 w-4 text-blue-700" />
                  {firstCourses.length > 0 ? firstCourses.join(', ') : '-'}
                </div>
                {moreCourses > 0 && (
                  <div className="text-xs text-gray-500 ml-6">+{moreCourses} mata pelajaran lainnya</div>
                )}
                <button
                  className="mt-4 w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
                  onClick={() => setSelectedDosen(dosen)}
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          );
        })}
        {filteredFaculty.length === 0 && (
          <p className="text-center text-gray-500 col-span-full">Tidak ada guru ditemukan.</p>
        )}
      </div>

      {/* Dosen Detail Modal */}
      {selectedDosen && (
        <DosenDetail
          dosen={selectedDosen}
          onClose={() => setSelectedDosen(null)}
        />
      )}
    </div>
  );
};

export default Dosen;
