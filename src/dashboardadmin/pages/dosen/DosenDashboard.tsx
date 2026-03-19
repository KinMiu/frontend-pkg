import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User2, Pencil, LayoutDashboard } from 'lucide-react';

const DosenDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <LayoutDashboard size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Guru</h1>
            <p className="text-sm text-gray-600">
              Login sebagai <span className="font-medium">{(user as any)?.nuptk || user?.username}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          to="/dashboard/guru/profil"
          className="group rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-100">
              <User2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Detail Guru</h2>
              <p className="mt-1 text-sm text-gray-600">
                Lihat data profil Guru Anda.
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/guru/edit"
          className="group rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100">
              <Pencil size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Edit Data</h2>
              <p className="mt-1 text-sm text-gray-600">
                Ubah data guru Anda sendiri.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default DosenDashboard;

