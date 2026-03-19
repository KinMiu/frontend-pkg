import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import Layout from '../components/layout/Layout';
import DosenLayout from '../components/layout/DosenLayout';
import Dashboard from '../pages/Dashboard';
import FacultyList from '../pages/faculty/FacultyList';
import FacultyDetail from '../pages/faculty/FacultyDetail';
import FacultyForm from '../pages/faculty/FacultyForm';
import AchievementList from '../pages/achievements/AchievementList';
import AchievementDetail from '../pages/achievements/AchievementDetail';
import AchievementForm from '../pages/achievements/AchievementForm';
import EventList from '../pages/events/EventList';
import EventDetail from '../pages/events/EventDetail';
import EventForm from '../pages/events/EventForm';
import K3spEventList from '../pages/k3spEvents/K3spEventList';
import K3spEventDetail from '../pages/k3spEvents/K3spEventDetail';
import K3spEventForm from '../pages/k3spEvents/K3spEventForm';
import PengumumanList from '../pages/pengumuman/PengumumanList';
import PengumumanDetail from '../pages/pengumuman/PengumumanDetail';
import PengumumanForm from '../pages/pengumuman/PengumumanForm';
import PartnerList from '../pages/partners/PartnerList';
import PartnerForm from '../pages/partners/PartnerForm';
import TestimonialList from '../pages/testimonials/TestimonialList';
import TestimonialForm from '../pages/testimonials/TestimonialForm';
import RPSList from '../pages/academic/RPSList';
import RPSForm from '../pages/academic/RPSForm';
import FacilityList from '../pages/facilities/FacilityList';
import FacilityForm from '../pages/facilities/FacilityForm';
import KurikulumList from '../pages/kurikulum/KurikulumList';
import KurikulumForm from '../pages/kurikulum/KurikulumForm';
import BannerList from '../pages/banners/BannerList';
import BannerForm from '../pages/banners/BannerForm';
import ProgramList from '../pages/program/ProgramList';
import ProgramForm from '../pages/program/ProgramForm';
import StructuralList from '../pages/structurals/StructuralList';
import StructuralForm from '../pages/structurals/StructuralForm';
import OperatorList from '../pages/operators/OperatorList';
import OperatorForm from '../pages/operators/OperatorForm';
import SuratList from '../pages/surat/SuratList';
import SuratForm from '../pages/surat/SuratForm';
import PerangkatAjarList from '../pages/perangkatAjar/PerangkatAjarList';
import PerangkatAjarForm from '../pages/perangkatAjar/PerangkatAjarForm';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/dashboard/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  // If user is logged in, redirect from login page to appropriate page
  if (user && (window.location.pathname === '/dashboard/login' || window.location.pathname === '/login')) {
    const targetPath = user.role === 'dosen' ? '/dashboard/guru' : '/dashboard';
    return <Navigate to={targetPath} replace />;
  }

  return (
    <Routes>
      {/* Backward compatibility: old /login URL */}
      <Route path="/login" element={<Navigate to="/dashboard/login" replace />} />
      <Route path="/reset-password" element={<Navigate to="/dashboard/reset-password" replace />} />

      <Route path="/dashboard/login" element={<LoginPage />} />
      <Route path="/dashboard/reset-password" element={<ResetPasswordPage />} />

      {/* Guru (dosen) routes */}
      <Route
        path="/dashboard/guru/*"
        element={
          <ProtectedRoute allowedRoles={['dosen']}>
            <DosenLayout />
          </ProtectedRoute>
        }
      />

      {/* Admin / pendaftaran routes */}
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        
        <Route path="faculty">
          <Route index element={<FacultyList />} />
          <Route path="new" element={<FacultyForm />} />
          <Route path=":id" element={<FacultyDetail />} />
          <Route path="edit/:id" element={<FacultyForm />} />
        </Route>
        
        <Route path="achievements">
          <Route index element={<AchievementList />} />
          <Route path="new" element={<AchievementForm />} />
          <Route path=":id" element={<AchievementDetail />} />
          <Route path="edit/:id" element={<AchievementForm />} />
        </Route>
        
        <Route path="events">
          <Route index element={<EventList />} />
          <Route path="new" element={<EventForm />} />
          <Route path=":id" element={<EventDetail />} />
          <Route path="edit/:id" element={<EventForm />} />
        </Route>

        <Route path="k3sp-events">
          <Route index element={<K3spEventList />} />
          <Route path="new" element={<K3spEventForm />} />
          <Route path=":id" element={<K3spEventDetail />} />
          <Route path="edit/:id" element={<K3spEventForm />} />
        </Route>

        <Route path="pengumuman">
          <Route index element={<PengumumanList />} />
          <Route path="new" element={<PengumumanForm />} />
          <Route path=":id" element={<PengumumanDetail />} />
          <Route path="edit/:id" element={<PengumumanForm />} />
        </Route>

        <Route path="facilities">
          <Route index element={<FacilityList />} />
          <Route path="new" element={<FacilityForm />} />
          <Route path="edit/:id" element={<FacilityForm />} />
        </Route>

        <Route path="kurikulums">
          <Route index element={<KurikulumList />} />
          <Route path="new" element={<KurikulumForm />} />
          <Route path="edit/:id" element={<KurikulumForm />} />
        </Route>

        <Route path="partners">
          <Route index element={<PartnerList />} />
          <Route path="new" element={<PartnerForm />} />
          <Route path="edit/:id" element={<PartnerForm />} />
        </Route>
        
        <Route path="testimonials">
          <Route index element={<TestimonialList />} />
          <Route path="new" element={<TestimonialForm />} />
          <Route path="edit/:id" element={<TestimonialForm />} />
        </Route>

        <Route path="rps">
          <Route index element={<RPSList />} />
          <Route path="new" element={<RPSForm />} />
          <Route path="edit/:id" element={<RPSForm />} />
        </Route>

        <Route path="surat">
          <Route index element={<SuratList />} />
          <Route path="new" element={<SuratForm />} />
          <Route path="edit/:id" element={<SuratForm />} />
        </Route>

        <Route path="perangkat-ajar">
          <Route index element={<PerangkatAjarList />} />
          <Route path="new" element={<PerangkatAjarForm />} />
          <Route path="edit/:id" element={<PerangkatAjarForm />} />
        </Route>

        <Route path="banners">
          <Route index element={<BannerList />} />
          <Route path="new" element={<BannerForm />} />
          <Route path="edit/:id" element={<BannerForm />} />
        </Route>

        <Route path="programs">
          <Route index element={<ProgramList />} />
          <Route path="new" element={<ProgramForm />} />
          <Route path="edit/:id" element={<ProgramForm />} />
        </Route>

        <Route path="structurals">
          <Route index element={<StructuralList />} />
          <Route path="new" element={<StructuralForm />} />
          <Route path="edit/:id" element={<StructuralForm />} />
        </Route>

        <Route path="operators">
          <Route index element={<OperatorList />} />
          <Route path="new" element={<OperatorForm />} />
          <Route path="edit/:id" element={<OperatorForm />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;