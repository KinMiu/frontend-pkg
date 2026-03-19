import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { Plus, Search, Edit, Trash2, FileText, Users, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const HKIList: React.FC = () => {
  const { hki = [], deleteHKI } = useCampusData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHKI = hki.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (_id: string, title: string) => {
    if (window.confirm(`Anda yakin ingin menghapus HKI "${title}"?`)) {
      try {
        await deleteHKI(_id);
        toast.success('HKI berhasil dihapus');
      } catch (error) {
        console.error('Error deleting HKI:', error);
        toast.error('Gagal menghapus HKI');
      }
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data HKI</h1>
        <Link
          to="/dashboard/hki/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah HKI
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul, penulis, atau nomor..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* HKI Table */}
      {filteredHKI.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">No.</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Judul</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Nomor</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Penulis</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tanggal</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Akses</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredHKI.map((item, index) => (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-2 text-sm text-gray-900">{index + 1}</td> {/* Serial Number */}
                  <td className="px-4 py-2 text-sm text-gray-900">{item.title}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{item.number}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.authors.map((author, idx) => (
                      <div key={idx} className="flex items-start">
                        {/* Bullet Point before the author */}
                        <span className="mr-1 text-indigo-800 text-xs">
                          {/* Bullet point (•) */}
                          {'• '}
                          {author}
                        </span>
                        {idx < item.authors.length - 1 && <br />} {/* Adds a line break between authors */}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{item.date}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {item.driveUrl && (
                      <a
                        href={item.driveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-blue-600 text-white text-center px-4 py-2 rounded-md hover:bg-blue-700"
                        title="Lihat Dokumen"
                      >
                        Dokumen
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-2 justify-start">
                      <Link
                        to={`/hki/edit/${item._id}`}
                        className="text-blue-600 hover:bg-blue-100 rounded-md p-2"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        className="text-red-600 hover:bg-red-100 rounded-md p-2"
                        title="Hapus"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <FileText size={48} className="mx-auto mb-4 text-indigo-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Tidak ada data HKI</h3>
          <p className="mb-4 text-gray-600">
            Belum ada data HKI yang tersedia atau sesuai dengan pencarian.
          </p>
          <Link
            to="/dashboard/hki/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah HKI Baru
          </Link>
        </div>
      )}
    </div>
  );
};

export default HKIList;
