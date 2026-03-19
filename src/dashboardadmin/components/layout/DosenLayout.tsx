import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import DosenDashboard from '../../pages/dosen/DosenDashboard';
import DosenProfile from '../../pages/dosen/DosenProfile';
import DosenEdit from '../../pages/dosen/DosenEdit';
import DosenChangePassword from '../../pages/dosen/DosenChangePassword';
import { ThemeProvider } from '../../contexts/ThemeContext';

const DosenLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Header toggleSidebar={toggleSidebar} />

          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
            <div className="w-full max-w-none">
              <Routes>
                {/* index: /dashboard/guru */}
                <Route index element={<DosenDashboard />} />
                <Route path="profil" element={<DosenProfile />} />
                <Route path="edit" element={<DosenEdit />} />
                <Route path="password" element={<DosenChangePassword />} />
                <Route path="*" element={<Navigate to="/dashboard/guru" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default DosenLayout;

