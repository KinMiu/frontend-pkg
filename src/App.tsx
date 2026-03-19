import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PublicCampusDataProvider } from './contexts/PublicCampusDataContext';
import { AuthProvider } from './dashboardadmin/contexts/AuthContext';
import { CampusDataProvider } from './dashboardadmin/contexts/CampusDataContext';
import AppRoutes from './dashboardadmin/routes';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppSticky from './components/WhatsAppSticky';
import Home from './pages/Home';
import About from './pages/About';
import Dosen from './pages/Dosen';
import Program from './pages/Program';
import Prestasi from './pages/Prestasi';
import Pengumuman from './pages/Pengumuman';
import Beasiswa from './pages/Beasiswa';
import HKI from './pages/HKI';
import Paten from './pages/Paten';
import DesainIndustri from './pages/DesainIndustri';
import Akademik from './pages/Akademik';
import GaleryKegiatan from './pages/GaleryKegiatan';
import KegiatanK3sp from './pages/KegiatanK3sp';
import Surat from './pages/Surat';
import PerangkatAjar from './pages/PerangkatAjar';

function AppContent() {
  const location = useLocation();
  const isDashboardApp = location.pathname.startsWith('/dashboard');

  if (isDashboardApp) {
    return <AppRoutes />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tentang" element={<About />} />
          <Route path="/guru" element={<Dosen />} />
          <Route path="/program" element={<Program />} />
          <Route path="/kegiatan/galeri" element={<GaleryKegiatan />} />
          <Route path="/kegiatan/k3sp" element={<KegiatanK3sp />} />
          <Route path="/pengumuman" element={<Pengumuman />} />
          <Route path="/surat" element={<Surat />} />
          <Route path="/perangkat-ajar" element={<PerangkatAjar />} />
          <Route path="/prestasi" element={<Prestasi />} />
          <Route path="/beasiswa" element={<Beasiswa />} />
          <Route path="/hki" element={<HKI />} />
          <Route path="/paten" element={<Paten />} />
          <Route path="/desainindustri" element={<DesainIndustri />} />
          <Route path="/akademik" element={<Akademik />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppSticky />
    </div>
  );
}

function App() {
  return (
    <PublicCampusDataProvider>
      <AuthProvider>
        <CampusDataProvider>
          <Router>
            <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
            <AppContent />
          </Router>
        </CampusDataProvider>
      </AuthProvider>
    </PublicCampusDataProvider>
  );
}

export default App;
