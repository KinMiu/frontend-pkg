import React, { useState } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Certification } from '../types';

interface CertificationTableProps {
  data: Certification[];
  title: string;
}

const CertificationTable: React.FC<CertificationTableProps> = ({ data, title }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-[95%] lg:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Daftar {title} yang telah diperoleh oleh Dosen Informatika UBL
          </p>
        </div>

        <div className="mt-8 flow-root">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-blue-800">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6 whitespace-nowrap">
                          No
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white whitespace-nowrap">
                          Judul
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white whitespace-nowrap">
                          Tanggal
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white whitespace-nowrap">
                          Nomor
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white whitespace-nowrap">
                          Nama Dosen
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white whitespace-nowrap">
                          Dokumen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {currentData.map((item, index) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {startIndex + index + 1}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            <div className="max-w-md break-words">{item.title}</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {new Date(item.date).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {item.number}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-500">
                            <ul className="list-disc list-inside">
                              {item.authors.map((author, idx) => (
                                <li key={idx}>{author}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <a
                              href={item.driveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              Lihat <ExternalLink size={16} />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationTable;