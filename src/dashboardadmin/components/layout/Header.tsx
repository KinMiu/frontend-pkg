import React, { useEffect, useMemo, useState } from 'react';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../shared/ConfirmationDialog';
import { useTheme } from '../../contexts/ThemeContext';
import { facultyAPI, operatorAPI } from '../../../services/api';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { theme, headerTheme, headerTextColor, getBgClass } = useTheme();

  const baseUrl = useMemo(
    () => (import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, ''),
    []
  );

  const resolveUploadUrl = (value?: string | null) => {
    if (!value) return '';
    if (value.startsWith('http') || value.startsWith('data:')) return value;
    return `${baseUrl}/uploads/${value}`;
  };

  const roleLabel = (role?: string) => {
    if (role === 'admin') return 'Admin';
    if (role === 'pendaftaran') return 'Pendaftaran';
    if (role === 'operator') return 'Operator';
    return 'Guru';
  };

  const [avatarSrc, setAvatarSrc] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!user) {
        setAvatarSrc('');
        setDisplayName('');
        return;
      }

      try {
        if (user.role === 'dosen') {
          const facultyId = (user as { facultyId?: string }).facultyId;
          if (facultyId) {
            const faculty = await facultyAPI.getById(facultyId);
            if (cancelled) return;

            setDisplayName(faculty?.name || user.username);
            setAvatarSrc(resolveUploadUrl(faculty?.foto));
            return;
          }
        }

        if (user.role === 'operator') {
          const operatorId = (user as { operatorId?: string }).operatorId;
          if (operatorId) {
            const operator = await operatorAPI.getById(operatorId);
            if (cancelled) return;

            const name =
              (operator as { nama?: string; name?: string; satminkal?: string } | null)?.nama ||
              (operator as { nama?: string; name?: string; satminkal?: string } | null)?.name ||
              (operator as { nama?: string; name?: string; satminkal?: string } | null)?.satminkal ||
              user.username;

            setDisplayName(name);
            setAvatarSrc(resolveUploadUrl((operator as { foto?: string } | null)?.foto));
            return;
          }
        }

        // Fallback: hanya pakai username
        setDisplayName(user.username);
        setAvatarSrc('');
      } catch (e) {
        if (cancelled) return;
        setDisplayName(user.username);
        setAvatarSrc('');
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [user, baseUrl]);

  const handleLogout = () => {
    logout();
    toast.success('Berhasil logout');
    navigate('/dashboard/login');
  };

  return (
    <>
      <header
        className={`sticky top-0 z-10 flex h-16 items-center border-b ${theme.headerBorder} px-4 ${getBgClass(
          headerTheme
        )} ${headerTextColor === 'white' ? 'text-white' : 'text-gray-900'}`}
      >
        <button
          onClick={toggleSidebar}
          className="rounded p-1 text-current hover:bg-black/10 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="ml-auto flex items-center space-x-4">
          <button className="rounded p-1 text-current hover:bg-black/10">
            <Bell size={20} />
          </button>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-blue-500 flex items-center justify-center text-white">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={displayName || user?.username || 'Avatar'}
                    className="h-9 w-9 object-cover"
                    onError={() => setAvatarSrc('')}
                  />
                ) : (
                  <span className="text-sm font-semibold">
                    {(user?.username || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="ml-2 hidden sm:block">
                <p className="text-sm font-medium">
                  {displayName || roleLabel(user?.role)}
                </p>
                <p className="text-xs opacity-80">
                  {user?.role === 'operator'
                    ? (user as { satminkal?: string }).satminkal || user?.username
                    : user?.role === 'dosen'
                      ? (user as { nuptk?: string }).nuptk || user?.username
                      : user?.username}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="rounded p-1 text-current hover:bg-black/10"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <ConfirmationDialog
        isOpen={showLogoutConfirm}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari aplikasi?"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
};

export default Header;