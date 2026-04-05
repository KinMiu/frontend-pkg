import React from 'react';
import { useCampusData } from '../contexts/CampusDataContext';
import { useAuth } from '../contexts/AuthContext';
import { Users, Award, Building, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { User } from '../types';
import { normalizeFacultyPosition } from '../../utils/facultyPosition';

const Dashboard: React.FC = () => {
  const { faculty, achievements, events, partners } = useCampusData();
  const { user } = useAuth();
  const isOperator = (user as { role?: string })?.role === 'operator';
  const operatorSatminkal = (user as { satminkal?: string })?.satminkal || '';
  const facultyForOperator = isOperator && operatorSatminkal
    ? faculty.filter(f => (f.satminkal || '').trim() === operatorSatminkal.trim())
    : faculty;
  const achievementsForOperator = isOperator && operatorSatminkal
    ? achievements.filter((a: { satminkal?: string }) => (a.satminkal || '').trim() === operatorSatminkal.trim())
    : achievements;

  const StatCard = ({ title, value, icon, bgColor, linkTo }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    bgColor: string;
    linkTo: string;
  }) => {
    return (
      <Link to={linkTo} className="block">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md p-3 ${bgColor}`}>
              {icon}
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if ((user as { role?: string })?.role === 'operator') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Operator</h1>
        <p className="text-gray-600 mb-6">SATMINKAL: <span className="font-medium text-gray-900">{operatorSatminkal || '-'}</span></p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link to="/dashboard/faculty" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md p-3 bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Data Guru (SATMINKAL Anda)</p>
                  <p className="text-2xl font-semibold text-gray-900">{facultyForOperator.length}</p>
                </div>
              </div>
            </div>
          </Link>
          <Link to="/dashboard/achievements" className="block">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-md p-3 bg-indigo-100">
                  <Award className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Prestasi Siswa (SATMINKAL Anda)</p>
                  <p className="text-2xl font-semibold text-gray-900">{achievementsForOperator.length}</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Guru di SATMINKAL Anda</h2>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-gray-200">
                {facultyForOperator.slice(0, 5).map((f) => (
                  <li key={f._id} className="py-3">
                    <Link to={`/dashboard/faculty/${f._id}`} className="flex items-center hover:bg-gray-50 -mx-4 px-4 py-2 rounded-md transition-colors">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {f.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{f.name}</p>
                        {((f as any).satminkal || '').trim() && (
                          <p className="text-xs text-gray-500">{(f as any).satminkal}</p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link to="/dashboard/faculty/new" className="text-sm font-medium text-blue-600 hover:text-blue-800">Tambah data guru</Link>
                {' · '}
                <Link to="/dashboard/faculty" className="text-sm font-medium text-blue-600 hover:text-blue-800">Lihat semua</Link>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Prestasi Siswa (SATMINKAL Anda)</h2>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-gray-200">
                {achievementsForOperator.slice(0, 5).map((a: { _id: string; judul?: string; tahun?: string }) => (
                  <li key={a._id} className="py-3">
                    <Link to={`/dashboard/achievements/${a._id}`} className="flex items-center hover:bg-gray-50 -mx-4 px-4 py-2 rounded-md transition-colors">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <Award className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{a.judul}</p>
                        <p className="text-xs text-gray-500">{a.tahun}{(a as { satminkal?: string }).satminkal ? ` · ${(a as { satminkal?: string }).satminkal}` : ''}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link to="/dashboard/achievements/new" className="text-sm font-medium text-blue-600 hover:text-blue-800">Tambah prestasi</Link>
                {' · '}
                <Link to="/dashboard/achievements" className="text-sm font-medium text-blue-600 hover:text-blue-800">Lihat semua</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role === 'dosen') {
    const pos = normalizeFacultyPosition((user as User).facultyPosition);
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Beranda</h1>
        <p className="text-sm text-gray-600 mb-6">{pos}</p>
        
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Data guru</h2>
            </div>
            <div className="p-4">
              <ul className="divide-y divide-gray-200">
                {faculty.map((f) => (
                  <li key={f._id} className="py-3">
                    <Link to={`/dashboard/faculty/${f._id}`} className="flex items-center hover:bg-gray-50 -mx-4 px-4 py-2 rounded-md transition-colors">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {f.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{f.name}</p>
                        {((f as any).satminkal || '').trim() && (
                          <p className="text-xs text-gray-500">
                            {(f as any).satminkal}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <Link to="/dashboard/faculty/new" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  Tambah data guru
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Admin</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Guru" 
          value={faculty.length} 
          icon={<Users className="h-6 w-6 text-blue-600" />} 
          bgColor="bg-blue-100" 
          linkTo="/dashboard/faculty" 
        />
        <StatCard 
          title="Total Prestasi" 
          value={achievements.length} 
          icon={<Award className="h-6 w-6 text-indigo-600" />} 
          bgColor="bg-indigo-100" 
          linkTo="/dashboard/achievements" 
        />
        <StatCard 
          title="Total Partner" 
          value={partners.length} 
          icon={<Building className="h-6 w-6 text-teal-600" />} 
          bgColor="bg-teal-100" 
          linkTo="/dashboard/partners" 
        />
        <StatCard 
          title="Total Kegiatan" 
          value={events.length} 
          icon={<Calendar className="h-6 w-6 text-purple-600" />} 
          bgColor="bg-purple-100" 
          linkTo="/dashboard/events" 
        />
      </div>

      {/* Recent data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Guru Terbaru</h2>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-200">
              {faculty.slice(0, 5).map((f) => (
                <li key={f._id} className="py-3">
                  <Link to={`/dashboard/faculty/${f._id}`} className="flex items-center hover:bg-gray-50 -mx-4 px-4 py-2 rounded-md transition-colors">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      {f.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{f.name}</p>
                      {((f as any).satminkal || '').trim() && (
                        <p className="text-xs text-gray-500">
                          {(f as any).satminkal}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Link to="/dashboard/faculty" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                Lihat semua guru
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Prestasi Terbaru</h2>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-200">
              {achievements.slice(0, 5).map((a) => (
                <li key={a._id} className="py-3">
                  <Link to={`/dashboard/achievements/${a._id}`} className="flex items-center hover:bg-gray-50 -mx-4 px-4 py-2 rounded-md transition-colors">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Award className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{a.judul}</p>
                      <p className="text-xs text-gray-500">{a.tahun}{(a as { satminkal?: string }).satminkal ? ` · ${(a as { satminkal?: string }).satminkal}` : ''}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Link to="/dashboard/achievements" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                Lihat semua prestasi
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;