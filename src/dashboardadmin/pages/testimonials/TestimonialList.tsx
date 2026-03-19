import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { Plus, Search, Edit, Trash2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const TestimonialList: React.FC = () => {
  const { testimonials, deleteTestimonial } = useCampusData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTestimonial, setSelectedTestimonial] = useState<{ _id: string; name: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filteredTestimonials = testimonials.filter((testimonial) =>
    testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.pekerjaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.perusahaan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (testimonial: { _id: string; name: string }) => {
    setSelectedTestimonial(testimonial);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTestimonial) return;

    try {
      await deleteTestimonial(selectedTestimonial._id);
      toast.success('Testimoni berhasil dihapus');
      setShowDeleteConfirm(false);
      setSelectedTestimonial(null);
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Gagal menghapus testimoni');
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Testimoni</h1>
        <Link
          to="/dashboard/testimonials/new"
          className="mt-4 md:mt-0 inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} className="mr-2" />
          Tambah Testimoni
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama, pekerjaan, atau perusahaan..."
            className="w-full rounded-md border border-gray-300 pl-10 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Testimonials Grid */}
      {filteredTestimonials.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTestimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                    <img
                      src={
                        testimonial.image
                          ? (testimonial.image.startsWith('http') || testimonial.image.startsWith('data:')
                            ? testimonial.image
                            : `${(import.meta.env.VITE_API_URL || 'http://localhost:3008').replace(/\/+$/, '')}/uploads/${testimonial.image}`)
                          : ''
                      }
                      alt={testimonial.name}
                      className="h-12 w-12 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white text-lg font-semibold';
                          fallback.textContent = testimonial.name.charAt(0);
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">Lulusan {testimonial.tahunlulus}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-900">{testimonial.pekerjaan}</p>
                  <p className="text-sm text-gray-600">{testimonial.perusahaan}</p>
                </div>

                <blockquote className="mb-4 border-l-4 border-indigo-500 pl-4 italic text-gray-700">
                  "{testimonial.testimoni}"
                </blockquote>

                <div className="flex justify-end space-x-2">
                  <Link
                    to={`/dashboard/testimonials/edit/${testimonial._id}`}
                    className="rounded-md bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(testimonial)}
                    className="rounded-md bg-red-50 p-2 text-red-600 hover:bg-red-100"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center shadow-md">
          <MessageSquare size={48} className="mx-auto mb-4 text-indigo-300" />
          <h3 className="mb-2 text-xl font-medium text-gray-900">Tidak ada testimoni</h3>
          <p className="mb-4 text-gray-600">
            Belum ada data testimoni yang tersedia atau sesuai dengan pencarian.
          </p>
          <Link
            to="/dashboard/testimonials/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus size={16} className="mr-2" />
            Tambah Testimoni Baru
          </Link>
        </div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus testimoni dari "${selectedTestimonial?.name}"?`}
        confirmLabel="Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default TestimonialList;