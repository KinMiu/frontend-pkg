import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound, User2, Eye, EyeOff, Phone, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../../services/api';

const WA_NUMBER = '6281252387717'; // sama dengan WhatsAppSticky

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingModalOpen, setIsWaitingModalOpen] = useState(false);
  const [lastRequestIdentifier, setLastRequestIdentifier] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedIdentifier = identifier.trim();
    if (!normalizedIdentifier) {
      setError('Email / NUPTK / Username wajib diisi');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak sama');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authAPI.requestResetPassword(normalizedIdentifier, newPassword);
      setLastRequestIdentifier(res.identifier || normalizedIdentifier);
      setIsWaitingModalOpen(true);
      toast.success('Permintaan reset password terkirim. Menunggu persetujuan admin.');
    } catch (err: any) {
      const message =
        typeof err?.message === 'string' && err.message
          ? err.message
          : 'Gagal reset password. Pastikan identifier terdaftar.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const waText = `Halo Admin, saya ingin reset password.\n\nIdentifier: ${lastRequestIdentifier || identifier}\nKeperluan: Reset Password\nMohon persetujuan reset password.`;
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="h-20 w-20 bg-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <KeyRound size={40} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
            <p className="text-gray-600 mt-2">Masukkan email dan password baru.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg flex items-center text-red-700">
              <AlertCircle size={20} className="mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Email / NUPTK / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User2 size={20} className="text-gray-400" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="email / NUPTK / username"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Password baru
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Minimal 6 karakter"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showNewPassword ? 'Sembunyikan password baru' : 'Lihat password baru'}
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi password baru
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pr-10 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Lihat konfirmasi password'}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/dashboard/login')}
              className="text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      </div>

      {isWaitingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsWaitingModalOpen(false)} />
          <div className="relative z-50 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Menunggu Persetujuan Admin</h3>
              <button
                type="button"
                onClick={() => setIsWaitingModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-700">
              Permintaan reset password sudah terkirim dan <b>menunggu persetujuan oleh admin</b>.
              Jika perlu dipercepat, silakan hubungi admin melalui WhatsApp.
            </p>

            <div className="mt-5 flex flex-col gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                <Phone size={18} />
                Hubungi Admin via WhatsApp
              </a>
              <button
                type="button"
                onClick={() => navigate('/dashboard/login', { replace: true })}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Kembali ke Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPasswordPage;

