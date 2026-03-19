import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';
import { useCampusData } from '../../contexts/CampusDataContext';
import type { Program } from '../../types';

const emptyProgram: Program = {
  _id: '',
  title: '',
  description: '',
  isActive: true,
  order: 0,
};

const ProgramForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addProgram, updateProgram, getProgramById } = useCampusData();

  const [program, setProgram] = useState<Program>(emptyProgram);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const isEditing = !!id;

  useEffect(() => {
    const fetchData = async () => {
      if (!isEditing || !id) return;
      try {
        const existing = await getProgramById(id);
        if (!existing) {
          toast.error('Program tidak ditemukan');
          navigate('/dashboard/programs');
          return;
        }
        setProgram({
          ...emptyProgram,
          ...existing,
          title: existing.title || '',
          description: existing.description || '',
          isActive: existing.isActive ?? true,
          order: existing.order ?? 0,
        });
      } catch (error) {
        console.error('Error fetching program:', error);
        toast.error('Gagal mengambil data program');
        navigate('/dashboard/programs');
      }
    };
    fetchData();
  }, [id, isEditing, getProgramById, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProgram((prev) => ({ ...prev, [name]: checked }));
      return;
    }
    if (name === 'order') {
      const n = Number(value);
      setProgram((prev) => ({ ...prev, order: Number.isFinite(n) ? n : 0 }));
      return;
    }
    setProgram((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!program.title?.trim()) newErrors.title = 'Judul wajib diisi';
    if (!program.description?.trim()) newErrors.description = 'Deskripsi wajib diisi';
    if ((program.order ?? 0) < 0) newErrors.order = 'Order minimal 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Periksa kembali inputan!');
      return;
    }
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    try {
      const payload = {
        title: program.title.trim(),
        description: program.description.trim(),
        isActive: program.isActive ?? true,
        order: program.order ?? 0,
      };

      if (isEditing && id) {
        await updateProgram(id, payload);
        toast.success('Program berhasil diperbarui');
      } else {
        await addProgram(payload);
        toast.success('Program berhasil ditambahkan');
      }
      navigate('/dashboard/programs');
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan program');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/dashboard/programs" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Program' : 'Tambah Program'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={program.title}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
                placeholder="Contoh: Software Engineering"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deskripsi <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={program.description}
                onChange={handleChange}
                rows={4}
                className={`mt-1 block w-full rounded-md border ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
                placeholder="Deskripsi singkat program..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Order</label>
                <input
                  type="number"
                  name="order"
                  value={program.order ?? 0}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.order ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500`}
                  min={0}
                />
                {errors.order && <p className="mt-1 text-sm text-red-600">{errors.order}</p>}
              </div>

              <div className="flex items-end">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={program.isActive ?? true}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Aktif</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Link
              to="/dashboard/programs"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Save size={16} className="mr-2" />
              Simpan
            </button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title="Konfirmasi Simpan"
        message="Simpan perubahan program?"
        confirmLabel="Simpan"
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default ProgramForm;

