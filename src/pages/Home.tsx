import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { mainPrograms, testimonials, partners } from '../data/homeData';
import Hero from '../components/Hero';
import Statistics from '../components/home/Statistics';
import Programs from '../components/home/Programs';
import LecturerSlider from "../components/home/LecturerSlider";
import TestimonialSlider from '../components/home/TestimonialSlider';
import Partners from '../components/home/Partners';
import LatestAnnouncementsMarquee from '../components/home/LatestAnnouncementsMarquee';
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Calendar, MapPin, ChevronRight, FileText } from 'lucide-react';
import { usePublicCampusData } from '../contexts/PublicCampusDataContext';
import KegiatanDetail from '../components/KegiatanDetail';
import GreetingModal from '../components/GreetingModal';
import { greetingAPI } from '../services/api';
import type { Greeting } from '../types';
import 'swiper/css';
import 'swiper/css/pagination';

let hasShownGreetingModal = false;

// Custom Icon for Marker
const customIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
});

const Home = () => {
  const navigate = useNavigate();
  const { events, k3spEvents, statistics = [], pengumuman = [], perangkatAjar = [] } = usePublicCampusData();
  const statisticsForDisplay = (Array.isArray(statistics) ? statistics : []).map((s, i) => ({
    id: i + 1,
    name: s.name,
    value: s.value,
  }));
  const [selectedKegiatan, setSelectedKegiatan] = React.useState(null);
  const [selectedKegiatanK3sp, setSelectedKegiatanK3sp] = React.useState(null);
  const [greeting, setGreeting] = React.useState<Greeting | null>(null);
  const [greetingOpen, setGreetingOpen] = React.useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 500);
  }, []);

  React.useEffect(() => {
    const run = async () => {
      try {
        const latest = await greetingAPI.getLatest();
        if (!latest) return;

        setGreeting(latest);
        if (!hasShownGreetingModal) {
          hasShownGreetingModal = true;
          setGreetingOpen(true);
        }
      } catch (error) {
        console.error('Failed to load greeting:', error);
      }
    };
    run();
  }, []);

  // Get latest 6 events
  const latestEvents = events
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 6);

  const latestK3spEvents = (k3spEvents || [])
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 6);

  const latestPengumuman = (Array.isArray(pengumuman) ? [...pengumuman] : [])
    .sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())
    .slice(0, 10);

  const latestPerangkatAjar = (Array.isArray(perangkatAjar) ? [...perangkatAjar] : []).slice(0, 6);

  return (
    <div className="relative isolate overflow-hidden bg-white">
      {greeting && (
        <GreetingModal
          open={greetingOpen}
          greeting={greeting}
          onClose={() => setGreetingOpen(false)}
        />
      )}
      {/* Hero Section */}
      <Hero />

      {/* Statistics */}
      <Statistics statistics={statisticsForDisplay} />

      {/* Latest Announcements (minimal marquee) */}
      <LatestAnnouncementsMarquee items={latestPengumuman} className="mt-6" />

      {/* Perangkat Ajar Section */}
      {/* <div id="perangkat-ajar" className="py-10 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Perangkat Ajar
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Download Perangkat Ajar</h2>
            <p className="mt-3 text-lg text-gray-600">
              Materi yang diunggah admin dan dapat diunduh oleh pengunjung.
            </p>
          </div>

          {latestPerangkatAjar.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestPerangkatAjar.map((p) => (
                <div key={p._id} className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-700" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{p.judul}</h3>
                      <p className="text-sm text-gray-500 mt-1 truncate" title={p.originalName}>
                        {p.kategori ? `${p.kategori} • ` : ''}{p.originalName}
                      </p>
                      {p.deskripsi ? (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-3">{p.deskripsi}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <button
                      onClick={() => handleDownload(p.filePath, p.originalName || `PerangkatAjar_${p.judul}`)}
                      className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      Unduh
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-600">
              Belum ada perangkat ajar yang tersedia.
            </div>
          )}
        </div>
      </div> */}

      {/* Section Peta dan Deskripsi */}
      <div className="flex flex-col md:flex-row items-center gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:mt-10 mb-10">
        {/* Bagian Teks */}
        <div className="md:w-1/2 w-full text-center md:text-left">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Sekilas Tentang PKG Barat
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed text-justify">
            PKG Barat merupakan wadah strategis bagi para pendidik untuk meningkatkan kompetensi, profesionalisme, serta kualitas pembelajaran melalui kegiatan kolaborasi dan pengembangan bersama. Diharapkan tercipta sinergi antar pendidik dalam berbagi pengetahuan, pengalaman, dan inovasi guna meningkatkan mutu pendidikan.
          </p>
          <button
            onClick={() => navigate('/tentang')}
            className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white font-semibold shadow-sm hover:bg-blue-800 transition-colors">
            Pelajari Selengkapnya
          </button>
        </div>

        {/* Bagian Peta */}
        <div className="md:w-1/2 w-full">
          <MapContainer
            center={[-7.5624231,111.4550711]}
            zoom={15}
            className="h-[350px] w-full rounded-lg shadow-lg z-0"
            style={{ minHeight: '350px', overflow: 'hidden' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='Informatika - UBL'
            />
            <Marker position={[-7.5624231,111.4550711]} icon={customIcon}>
              <Popup>
                <b>PKG (Pusat Kegiatan Guru)</b>
                <br />
                Kecamatan Barat
                <br />
                <a 
                  href="https://maps.app.goo.gl/XhmyZn8y6xvPnSQP6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Buka di Google Maps
                </a>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </div>

      {/* Kegiatan K3SP Section */}
      <div className="py-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              Kegiatan K3SP Terbaru
            </span>
            <h2 className="text-3xl font-bold text-gray-900">Aktivitas K3SP Kecamatan Barat</h2>
            <p className="mt-4 text-lg text-gray-600">
              Berbagai kegiatan K3SP terbaru yang dilaksanakan di Kecamatan Barat
            </p>
          </div>

          <Swiper
            modules={[Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            autoplay={{ delay: 3200, disableOnInteraction: false }}
            loop={true}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12"
          >
            {latestK3spEvents.map((event) => (
              <SwiperSlide key={event._id}>
                <div
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
                  onClick={() => setSelectedKegiatanK3sp(event)}
                >
                  <div className="relative">
                    {(() => {
                      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
                      const foto = (event.fotos && event.fotos.length > 0) ? event.fotos[0] : event.foto;
                      const src =
                        foto && (foto.startsWith('http') || foto.startsWith('data:'))
                          ? foto
                          : foto
                            ? `${baseUrl}/uploads/${foto}`
                            : '';
                      if (!src) {
                        return <div className="w-full h-48 bg-gray-200" />;
                      }
                      return (
                        <img
                          src={src}
                          alt={event.nama}
                          className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform"
                        />
                      );
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                      <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                        {event.jenis || 'Kegiatan'}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      New
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {event.nama}
                    </h3>
                    {event.deskripsi ? (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{event.deskripsi}</p>
                    ) : null}
                    <div className="flex items-center text-gray-600 text-sm mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      {event.tanggal || 'Tanggal belum tersedia'}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.lokasi?.trim() ? event.lokasi : 'Lokasi belum tersedia'}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors">
                        Selengkapnya
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Latest Activities Section */}
      {/* Latest Activities Section */}
<div className="py-8 bg-gradient-to-b from-gray-50 to-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-6">
      <span className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
        Kegiatan Terbaru
      </span>
      <h2 className="text-3xl font-bold text-gray-900">Aktivitas PKG Kecamatan Barat</h2>
      <p className="mt-4 text-lg text-gray-600">
        Berbagai kegiatan terbaru yang dilaksanakan di PKG Barat
      </p>
    </div>

    <Swiper
      modules={[Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      autoplay={{ delay: 3000, disableOnInteraction: false }}
      loop={true}  // This makes the slider loop
      breakpoints={{
        640: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
      className="pb-12"
    >
      {latestEvents.map((event) => (
        <SwiperSlide key={event._id}>
          <div
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
            onClick={() => setSelectedKegiatan(event)}
          >
            <div className="relative">
              {(() => {
                const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '');
                const foto = (event.fotos && event.fotos.length > 0) ? event.fotos[0] : event.foto;
                const src =
                  foto && (foto.startsWith('http') || foto.startsWith('data:'))
                    ? foto
                    : foto
                      ? `${baseUrl}/uploads/${foto}`
                      : '';
                if (!src) {
                  return <div className="w-full h-48 bg-gray-200" />;
                }
                return (
                  <img
                    src={src}
                    alt={event.nama}
                    className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform"
                  />
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                  {event.jenis || "Workshop"}
                </span>
                {event.program && (
                  <span className="inline-block bg-emerald-600/90 text-white text-xs px-3 py-1 rounded-full">
                    {event.program}
                  </span>
                )}
                {event.satminkal && (
                  <span className="inline-block bg-blue-600/90 text-white text-xs px-3 py-1 rounded-full">
                    {event.satminkal}
                  </span>
                )}
              </div>
              {/* Add "New" label */}
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                New
              </div>
            </div>
            <div className="p-4 h-full flex flex-col justify-between">
              {event.satminkal && (
                <span className="inline-block text-blue-600 text-xs font-medium mb-1">{event.satminkal}</span>
              )}
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {event.nama}
              </h3>
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                {event.tanggal}
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <MapPin className="h-4 w-4 mr-2" />
                {event.lokasi}
              </div>
              <div className="mt-4 flex justify-end text-blue-600">Lihat Selengkapnya 
                <ChevronRight className="text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  </div>
</div>


      {/* Programs */}
      <Programs programs={mainPrograms} />

      {/* Lecturer Slider */}
      <LecturerSlider />

      {/* Partners */}
      <Partners partners={partners} />

      {/* Testimonials */}
      {/* <TestimonialSlider testimonials={testimonials} /> */}

      {/* Kegiatan Detail Modal */}
      {selectedKegiatan && (
        <KegiatanDetail
          kegiatan={selectedKegiatan}
          onClose={() => setSelectedKegiatan(null)}
        />
      )}

      {selectedKegiatanK3sp && (
        <KegiatanDetail
          kegiatan={selectedKegiatanK3sp}
          onClose={() => setSelectedKegiatanK3sp(null)}
        />
      )}
    </div>
  );
};

export default Home;