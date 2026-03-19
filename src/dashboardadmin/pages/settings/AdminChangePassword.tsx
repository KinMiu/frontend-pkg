import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { KeyRound, User2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminChangePassword: React.FC = () => {
  const { user, changePassword, changeAdminUsername } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [currentPasswordUsername, setCurrentPasswordUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [isLoadingUsername, setIsLoadingUsername] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((user as { role?: string } | null)?.role !== 'admin') {
      toast.error('Hanya admin yang bisa mengubah password di menu ini');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password tidak sama');
      return;
    }

    setIsLoading(true);
    try {
      const ok = await changePassword(currentPassword, newPassword);
      if (!ok) {
        toast.error('Password saat ini salah atau gagal mengubah password');
        return;
      }
      toast.success('Password berhasil diubah');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((user as { role?: string } | null)?.role !== 'admin') {
      toast.error('Hanya admin yang bisa mengubah username di menu ini');
      return;
    }
    const nextUsername = newUsername.trim();
    if (!nextUsername) {
      toast.error('Username baru wajib diisi');
      return;
    }
    if (nextUsername === (user?.username || '').trim()) {
      toast.error('Username baru sama dengan username saat ini');
      return;
    }
    if (!currentPasswordUsername) {
      toast.error('Password saat ini wajib diisi');
      return;
    }

    setIsLoadingUsername(true);
    try {
      const ok = await changeAdminUsername(currentPasswordUsername, nextUsername);
      if (!ok) {
        toast.error('Password saat ini salah atau gagal mengubah username');
        return;
      }

      toast.success('Username admin berhasil diubah');
      setCurrentPasswordUsername('');
      setNewUsername('');
    } finally {
      setIsLoadingUsername(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <KeyRound size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Admin</h1>
            <p className="text-sm text-gray-600">Ubah password dan username admin.</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <div>
            <label className="block text-sm font-medium text-gray-700">Password saat ini</label>
            <input
              type="password"
              name="admin_current_password"
              autoComplete="new-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password baru</label>
            <input
              type="password"
              name="admin_new_password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Minimal 8 karakter.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Konfirmasi password baru</label>
            <input
              type="password"
              name="admin_confirm_new_password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 ${
              isLoading ? 'cursor-not-allowed opacity-75' : ''
            }`}
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Password'}
          </button>
        </form>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <form onSubmit={handleChangeUsername} className="space-y-4" autoComplete="off">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
              <User2 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ubah Username Admin</h2>
              <p className="text-sm text-gray-600">Admin login menggunakan username baru setelah tersimpan.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Username baru</label>
            <input
              type="text"
              name="admin_new_username"
              autoComplete="off"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password saat ini</label>
            <input
              type="password"
              name="admin_current_password_for_username_change"
              autoComplete="new-password"
              value={currentPasswordUsername}
              onChange={(e) => setCurrentPasswordUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoadingUsername}
            className={`inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 ${
              isLoadingUsername ? 'cursor-not-allowed opacity-75' : ''
            }`}
          >
            {isLoadingUsername ? 'Menyimpan...' : 'Simpan Username'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminChangePassword;

