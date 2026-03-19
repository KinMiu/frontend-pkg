import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { KeyRound, RefreshCw } from 'lucide-react';
import { authAPI } from '../../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

type ResetRequest = {
  id: string;
  role: 'operator' | 'dosen';
  identifier: string;
  targetId: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  decidedAt?: string | null;
  decidedBy?: string | null;
};

const roleLabel = (r: ResetRequest['role']) => (r === 'dosen' ? 'Guru' : 'Operator');

const ResetPasswordApprovals: React.FC = () => {
  const { user } = useAuth();
  const decidedBy = useMemo(() => (user?.role === 'admin' ? user.username : undefined), [user]);

  const [items, setItems] = useState<ResetRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [confirm, setConfirm] = useState<{
    open: boolean;
    mode: 'approve' | 'reject';
    item: ResetRequest | null;
  }>({ open: false, mode: 'approve', item: null });

  const load = async () => {
    setIsLoading(true);
    try {
      const data = (await authAPI.listResetRequests('pending')) as unknown as ResetRequest[];
      setItems(data);
    } catch (e: any) {
      toast.error(e?.message || 'Gagal memuat permintaan reset password');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onApprove = async (id: string) => {
    try {
      await authAPI.approveResetRequest(id, decidedBy);
      toast.success('Permintaan disetujui. Password sudah diperbarui.');
      await load();
    } catch (e: any) {
      toast.error(e?.message || 'Gagal menyetujui permintaan');
    }
  };

  const onReject = async (id: string) => {
    try {
      await authAPI.rejectResetRequest(id, decidedBy);
      toast.success('Permintaan ditolak.');
      await load();
    } catch (e: any) {
      toast.error(e?.message || 'Gagal menolak permintaan');
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <KeyRound size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Persetujuan Reset Password</h1>
              <p className="text-sm text-gray-600">
                Setujui atau tolak permintaan reset password dari Guru dan Operator.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        {items.length === 0 ? (
          <p className="text-sm text-gray-600">Tidak ada permintaan reset password yang menunggu persetujuan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Identifier</th>
                  <th className="py-3 pr-4">Waktu Request</th>
                  <th className="py-3 pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((it) => (
                  <tr key={it.id} className="text-sm text-gray-700">
                    <td className="py-3 pr-4 font-medium">{roleLabel(it.role)}</td>
                    <td className="py-3 pr-4">{it.identifier}</td>
                    <td className="py-3 pr-4">
                      {new Date(it.requestedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setConfirm({ open: true, mode: 'approve', item: it })}
                          className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                        >
                          Setujui
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirm({ open: true, mode: 'reject', item: it })}
                          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Tolak
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={confirm.open}
        title={confirm.mode === 'approve' ? 'Setujui Reset Password?' : 'Tolak Reset Password?'}
        message={
          confirm.item
            ? `${confirm.mode === 'approve' ? 'Setujui' : 'Tolak'} permintaan reset password untuk ${
                roleLabel(confirm.item.role)
              } dengan identifier "${confirm.item.identifier}"?`
            : ''
        }
        confirmLabel={confirm.mode === 'approve' ? 'Setujui' : 'Tolak'}
        cancelLabel="Batal"
        onCancel={() => setConfirm({ open: false, mode: 'approve', item: null })}
        onConfirm={() => {
          const item = confirm.item;
          setConfirm({ open: false, mode: 'approve', item: null });
          if (!item) return;
          if (confirm.mode === 'approve') void onApprove(item.id);
          else void onReject(item.id);
        }}
      />
    </div>
  );
};

export default ResetPasswordApprovals;

