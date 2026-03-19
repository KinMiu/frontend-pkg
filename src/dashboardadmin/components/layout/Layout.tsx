import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from '../../pages/Dashboard';
import FacultyList from '../../pages/faculty/FacultyList';
import FacultyDetail from '../../pages/faculty/FacultyDetail';
import FacultyForm from '../../pages/faculty/FacultyForm';
import AchievementList from '../../pages/achievements/AchievementList';
import AchievementDetail from '../../pages/achievements/AchievementDetail';
import AchievementForm from '../../pages/achievements/AchievementForm';
import EventList from '../../pages/events/EventList';
import EventDetail from '../../pages/events/EventDetail';
import EventForm from '../../pages/events/EventForm';
import K3spEventList from '../../pages/k3spEvents/K3spEventList';
import K3spEventDetail from '../../pages/k3spEvents/K3spEventDetail';
import K3spEventForm from '../../pages/k3spEvents/K3spEventForm';
import PengumumanList from '../../pages/pengumuman/PengumumanList';
import PengumumanDetail from '../../pages/pengumuman/PengumumanDetail';
import PengumumanForm from '../../pages/pengumuman/PengumumanForm';
import StatistikList from '../../pages/statistik/StatistikList';
import PartnerList from '../../pages/partners/PartnerList';
import PartnerForm from '../../pages/partners/PartnerForm';
import TestimonialList from '../../pages/testimonials/TestimonialList';
import TestimonialForm from '../../pages/testimonials/TestimonialForm';
import GreetingList from '../../pages/greetings/GreetingList';
import GreetingForm from '../../pages/greetings/GreetingForm';
import RPSList from '../../pages/academic/RPSList';
import RPSForm from '../../pages/academic/RPSForm';
import SuratList from '../../pages/surat/SuratList';
import SuratForm from '../../pages/surat/SuratForm';
import PerangkatAjarList from '../../pages/perangkatAjar/PerangkatAjarList';
import PerangkatAjarForm from '../../pages/perangkatAjar/PerangkatAjarForm';
import FacilityList from '../../pages/facilities/FacilityList';
import FacilityForm from '../../pages/facilities/FacilityForm';
import KurikulumList from '../../pages/kurikulum/KurikulumList';
import KurikulumForm from '../../pages/kurikulum/KurikulumForm';
import BannerList from '../../pages/banners/BannerList';
import BannerForm from '../../pages/banners/BannerForm';
import ProgramList from '../../pages/program/ProgramList';
import ProgramForm from '../../pages/program/ProgramForm';
import StructuralList from '../../pages/structurals/StructuralList';
import StructuralForm from '../../pages/structurals/StructuralForm';
import OperatorList from '../../pages/operators/OperatorList';
import OperatorForm from '../../pages/operators/OperatorForm';
import OperatorPassword from '../../pages/operator/OperatorPassword';
import { ThemeProvider } from '../../contexts/ThemeContext';
import DesignSettings from '../../pages/settings/DesignSettings';
import AdminChangePassword from '../../pages/settings/AdminChangePassword';
import ResetPasswordApprovals from '../../pages/settings/ResetPasswordApprovals';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header toggleSidebar={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
            <div className="w-full max-w-none">
            <Routes>
              {/* index: /dashboard */}
              <Route index element={<Dashboard />} />
              
              {/* Faculty Routes: /dashboard/faculty/... */}
              <Route path="faculty" element={<FacultyList />} />
              <Route path="faculty/new" element={<FacultyForm />} />
              <Route path="faculty/:id" element={<FacultyDetail />} />
              <Route path="faculty/edit/:id" element={<FacultyForm />} />
              
              {/* Achievement Routes: /dashboard/achievements/... */}
              <Route path="achievements" element={<AchievementList />} />
              <Route path="achievements/new" element={<AchievementForm />} />
              <Route path="achievements/:id" element={<AchievementDetail />} />
              <Route path="achievements/edit/:id" element={<AchievementForm />} />

              {/* Event Routes: /dashboard/events/... */}
              <Route path="events" element={<EventList />} />
              <Route path="events/new" element={<EventForm />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="events/edit/:id" element={<EventForm />} />

              {/* Kegiatan K3SP Routes: /dashboard/k3sp-events/... */}
              <Route path="k3sp-events" element={<K3spEventList />} />
              <Route path="k3sp-events/new" element={<K3spEventForm />} />
              <Route path="k3sp-events/:id" element={<K3spEventDetail />} />
              <Route path="k3sp-events/edit/:id" element={<K3spEventForm />} />

              {/* Pengumuman Routes: /dashboard/pengumuman/... */}
              <Route path="pengumuman" element={<PengumumanList />} />
              <Route path="pengumuman/new" element={<PengumumanForm />} />
              <Route path="pengumuman/:id" element={<PengumumanDetail />} />
              <Route path="pengumuman/edit/:id" element={<PengumumanForm />} />

              {/* Data Statistik: /dashboard/statistik (admin only) */}
              <Route path="statistik" element={<StatistikList />} />

              {/* Facility Routes: /dashboard/facilities/... */}
              <Route path="facilities" element={<FacilityList />} />
              <Route path="facilities/new" element={<FacilityForm />} />
              <Route path="facilities/edit/:id" element={<FacilityForm />} />

              {/* Partner Routes: /dashboard/partners/... */}
              <Route path="partners" element={<PartnerList />} />
              <Route path="partners/new" element={<PartnerForm />} />
              <Route path="partners/edit/:id" element={<PartnerForm />} />

              {/* Testimonial Routes: /dashboard/testimonials/... */}
              <Route path="testimonials" element={<TestimonialList />} />
              <Route path="testimonials/new" element={<TestimonialForm />} />
              <Route path="testimonials/edit/:id" element={<TestimonialForm />} />

              {/* Greeting Routes: /dashboard/greetings/... */}
              <Route path="greetings" element={<GreetingList />} />
              <Route path="greetings/new" element={<GreetingForm />} />
              <Route path="greetings/edit/:id" element={<GreetingForm />} />

              {/* RPS Routes: /dashboard/rps/... */}
              <Route path="rps" element={<RPSList />} />
              <Route path="rps/new" element={<RPSForm />} />
              <Route path="rps/edit/:id" element={<RPSForm />} />

              {/* Surat Routes: /dashboard/surat/... */}
              <Route path="surat" element={<SuratList />} />
              <Route path="surat/new" element={<SuratForm />} />
              <Route path="surat/edit/:id" element={<SuratForm />} />

              {/* Perangkat Ajar Routes: /dashboard/perangkat-ajar/... */}
              <Route path="perangkat-ajar" element={<PerangkatAjarList />} />
              <Route path="perangkat-ajar/new" element={<PerangkatAjarForm />} />
              <Route path="perangkat-ajar/edit/:id" element={<PerangkatAjarForm />} />

              {/* Kurikulum Routes: /dashboard/kurikulums/... */}
              <Route path="kurikulums" element={<KurikulumList />} />
              <Route path="kurikulums/new" element={<KurikulumForm />} />
              <Route path="kurikulums/edit/:id" element={<KurikulumForm />} />

              {/* Banner Routes: /dashboard/banners/... */}
              <Route path="banners" element={<BannerList />} />
              <Route path="banners/new" element={<BannerForm />} />
              <Route path="banners/edit/:id" element={<BannerForm />} />

              {/* Program Pembelajaran Routes: /dashboard/programs/... */}
              <Route path="programs" element={<ProgramList />} />
              <Route path="programs/new" element={<ProgramForm />} />
              <Route path="programs/edit/:id" element={<ProgramForm />} />

              {/* Struktur Prodi Routes: /dashboard/structurals/... */}
              <Route path="structurals" element={<StructuralList />} />
              <Route path="structurals/new" element={<StructuralForm />} />
              <Route path="structurals/edit/:id" element={<StructuralForm />} />

              {/* Data Operator Routes: /dashboard/operators/... */}
              <Route path="operators" element={<OperatorList />} />
              <Route path="operators/new" element={<OperatorForm />} />
              <Route path="operators/edit/:id" element={<OperatorForm />} />

                {/* Operator Ubah Password: /dashboard/operator/password */}
                <Route path="operator/password" element={<OperatorPassword />} />

                {/* Settings: /dashboard/settings/design */}
                <Route path="settings/design" element={<DesignSettings />} />
                <Route path="settings/password" element={<AdminChangePassword />} />
                <Route path="settings/reset-password" element={<ResetPasswordApprovals />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Layout;