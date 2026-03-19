import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './Header';
import FacultyForm from '../../pages/faculty/FacultyForm';

const PendaftaranLayout: React.FC = () => {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header toggleSidebar={() => {}} />

      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
        <div className="w-full max-w-none">
          <Routes>
            <Route path="/" element={<FacultyForm basePath="/pendaftaran" />} />
            <Route path="*" element={<Navigate to="/pendaftaran" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default PendaftaranLayout;

