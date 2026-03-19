import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Award,
  Calendar,
  Megaphone,
  BarChart3,
  Layers,
  Building,
  Building2,
  Image as ImageIcon,
  FileText,
  KeyRound,
  X,
  Settings
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { authAPI } from '../../../services/api';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const { theme, sidebarTheme, sidebarTextColor, getBgClass } = useTheme();
  const [pendingResetCount, setPendingResetCount] = useState<number>(0);
  const navLinkClass = ({ isActive }: { isActive: boolean }) => {
    if (sidebarTextColor === 'white') {
      return `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-white/10 text-white'
          : 'text-gray-300 hover:bg-white/5 hover:text-white'
      }`;
    }

    return `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-500 text-white'
        : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
    }`;
  };

  const isDosen = user?.role === 'dosen';
  const isOperator = (user as { role?: string })?.role === 'operator';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    let alive = true;
    if (!isAdmin) return;

    const load = async () => {
      try {
        const data = await authAPI.listResetRequests('pending');
        if (!alive) return;
        setPendingResetCount(Array.isArray(data) ? data.length : 0);
      } catch {
        if (!alive) return;
        setPendingResetCount(0);
      }
    };

    void load();
    const interval = window.setInterval(load, 30000);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [isAdmin]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div
          className={`flex h-full flex-col border-r ${theme.sidebarBorder} ${getBgClass(sidebarTheme)} ${
            sidebarTextColor === 'white' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {/* Sidebar header */}
          <div className={`flex h-16 items-center justify-between px-4 border-b ${theme.sidebarBorder} flex-shrink-0`}>
            <div className="flex items-center space-x-2">
              <img
                src="https://i.imgur.com/0qeWABT.png"
                alt="Logo PKG Kec. Barat"
                className="h-9 w-auto"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-semibold tracking-[0.08em] uppercase">
                  PUSAT KEGIATAN GURU
                </span>
                <span className="text-[10px] font-medium opacity-80">
                  Kecamatan Barat
                </span>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="rounded p-1 text-inherit hover:bg-black/5 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {isDosen ? (
              <>
                <NavLink to="/dashboard/guru" className={navLinkClass} end>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/dashboard/guru/profil" className={navLinkClass}>
                  <Users size={20} />
                  <span>Detail Guru</span>
                </NavLink>
                <NavLink to="/dashboard/guru/edit" className={navLinkClass}>
                  <FileText size={20} />
                  <span>Edit Data</span>
                </NavLink>
                <NavLink to="/dashboard/guru/password" className={navLinkClass}>
                  <KeyRound size={20} />
                  <span>Ubah Password</span>
                </NavLink>
              </>
            ) : isOperator ? (
              <>
                <NavLink to="/dashboard" className={navLinkClass} end>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink to="/dashboard/faculty" className={navLinkClass}>
                  <Users size={20} />
                  <span>Data Guru</span>
                </NavLink>
                <NavLink to="/dashboard/events" className={navLinkClass}>
                  <Calendar size={20} />
                  <span>Data Kegiatan</span>
                </NavLink>
                <NavLink to="/dashboard/k3sp-events" className={navLinkClass}>
                  <Calendar size={20} />
                  <span>Kegiatan K3SP</span>
                </NavLink>
                <NavLink to="/dashboard/pengumuman" className={navLinkClass}>
                  <Megaphone size={20} />
                  <span>Pengumuman</span>
                </NavLink>
                <NavLink to="/dashboard/achievements" className={navLinkClass}>
                  <Award size={20} />
                  <span>Prestasi Siswa</span>
                </NavLink>
                <NavLink to="/dashboard/operator/password" className={navLinkClass}>
                  <KeyRound size={20} />
                  <span>Ubah Password</span>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/dashboard" className={navLinkClass} end>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </NavLink>

                <NavLink to="/dashboard/faculty" className={navLinkClass}>
                  <Users size={20} />
                  <span>Data Guru</span>
                </NavLink>
              </>
            )}
            
            {isAdmin && (
              <>
                <NavLink to="/dashboard/operators" className={navLinkClass}>
                  <Users size={20} />
                  <span>Data Operator</span>
                </NavLink>

                <NavLink to="/dashboard/statistik" className={navLinkClass}>
                  <BarChart3 size={20} />
                  <span>Data Statistik</span>
                </NavLink>

                <NavLink to="/dashboard/achievements" className={navLinkClass}>
                  <Award size={20} />
                  <span>Prestasi Siswa</span>
                </NavLink>
                
                <NavLink to="/dashboard/events" className={navLinkClass}>
                  <Calendar size={20} />
                  <span>Data Kegiatan</span>
                </NavLink>
                
                <NavLink to="/dashboard/k3sp-events" className={navLinkClass}>
                  <Calendar size={20} />
                  <span>Kegiatan K3SP</span>
                </NavLink>

                <NavLink to="/dashboard/pengumuman" className={navLinkClass}>
                  <Megaphone size={20} />
                  <span>Pengumuman</span>
                </NavLink>

                <NavLink to="/dashboard/surat" className={navLinkClass}>
                  <FileText size={20} />
                  <span>Data Surat</span>
                </NavLink>

                <NavLink to="/dashboard/perangkat-ajar" className={navLinkClass}>
                  <FileText size={20} />
                  <span>Perangkat Ajar</span>
                </NavLink>

                <NavLink to="/dashboard/facilities" className={navLinkClass}>
                  <Building2 size={20} />
                  <span>Data Fasilitas</span>
                </NavLink>

                <NavLink to="/dashboard/partners" className={navLinkClass}>
                  <Building size={20} />
                  <span>Link Partner</span>
                </NavLink>
                
                {/* <NavLink to="/dashboard/testimonials" className={navLinkClass}>
                  <MessageSquare size={20} />
                  <span>Data Testimoni</span>
                </NavLink> */}

                <NavLink to="/dashboard/greetings" className={navLinkClass}>
                  <FileText size={20} />
                  <span>Kata Pengantar</span>
                </NavLink>

                <NavLink to="/dashboard/banners" className={navLinkClass}>
                  <ImageIcon size={20} />
                  <span>Banner</span>
                </NavLink>

                <NavLink to="/dashboard/programs" className={navLinkClass}>
                  <Layers size={20} />
                  <span>Program </span>
                </NavLink>

                <NavLink to="/dashboard/structurals" className={navLinkClass}>
                  <Users size={20} />
                  <span>Struktur Jabatan</span>
                </NavLink>

                <div className="pt-4">
                  <h2 className="px-4 text-[10px] font-semibold uppercase tracking-wider opacity-70">
                    Pengaturan
                  </h2>
                  <div className="mt-2 space-y-1">
                    <NavLink to="/dashboard/settings/design" className={navLinkClass}>
                      <Settings size={20} />
                      <span>Setting Design</span>
                    </NavLink>
                    <NavLink to="/dashboard/settings/reset-password" className={navLinkClass}>
                      <KeyRound size={20} />
                      <span className="flex flex-1 items-center justify-between">
                        <span>Reset Password</span>
                        {pendingResetCount > 0 && (
                          <span
                            className={`ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              sidebarTextColor === 'white' ? 'bg-white/15 text-white' : 'bg-indigo-600 text-white'
                            }`}
                            aria-label={`${pendingResetCount} permintaan reset password menunggu persetujuan`}
                          >
                            {pendingResetCount}
                          </span>
                        )}
                      </span>
                    </NavLink>
                    <NavLink to="/dashboard/settings/password" className={navLinkClass}>
                      <KeyRound size={20} />
                      <span>Ubah Password</span>
                    </NavLink>
                  </div>
                </div>

                {/* Akademik Section */}
                {/* <div className="pt-4">
                  <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Akademik
                  </h2>

                  <div className="mt-2 space-y-1">
                    <NavLink to="/dashboard/kurikulums" className={navLinkClass}>
                      <GraduationCap size={20} />
                      <span>Data Kurikulum</span>
                    </NavLink>

                    <NavLink to="/dashboard/rps" className={navLinkClass}>
                      <BookOpen size={20} />
                      <span>Kelola RPS</span>
                    </NavLink>
                  </div>
                </div> */}
              </>
            )}
          </nav>

          {/* Footer */}
          <div className={`border-t ${theme.sidebarBorder} p-4 flex-shrink-0`}>
            <div className="text-xs opacity-60">
              &copy; {new Date().getFullYear()} Ardian Rahma Prasetya
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;