import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import FacultyForm from '../faculty/FacultyForm';

const DosenEdit: React.FC = () => {
  const { user } = useAuth();

  if (!user?.facultyId) {
    return (
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h1 className="text-xl font-semibold text-gray-900">Data dosen tidak ditemukan</h1>
        <p className="mt-2 text-sm text-gray-600">
          Akun dosen ini belum terhubung ke data dosen di sistem.
        </p>
      </div>
    );
  }

  return <FacultyForm facultyIdOverride={user.facultyId} basePath="/dashboard/guru" />;
};

export default DosenEdit;

