import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const KurikulumForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addKurikulum, updateKurikulum, getKurikulumById } = useCampusData();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    semester: 1,
    mataKuliah: ['']
  });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);

  useEffect(() => {
    const fetchKurikulum = async () => {
      if (id) {
        try {
          const kurikulum = await getKurikulumById(id);
          if (kurikulum) {
            setFormData({
              nama: kurikulum.nama,
              deskripsi: kurikulum.deskripsi,
              semester: kurikulum.semester,
              mataKuliah: kurikulum.mataKuliah?.length > 0 ? kurikulum.mataKuliah : ['']
            });
          }
        } catch (error) {
          console.error('Error fetching kurikulum:', error);
          toast.error('Gagal memuat data kurikulum');
        } finally {
          setLoadingData(false);
        }
      }
    };

    fetchKurikulum();
  }, [id, getKurikulumById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'semester' ? parseInt(value, 10) : value
    }));
  };

  const handleMataKuliahChange = (index: number, value: string) => {
    const newMataKuliah = [...formData.mataKuliah];
    newMataKuliah[index] = value;
    setFormData(prev => ({
      ...prev,
      mataKuliah: newMataKuliah
    }));
  };

  const addMataKuliah = () => {
    setFormData(prev => ({
      ...prev,
      mataKuliah: [...prev.mataKuliah, '']
    }));
  };

  const removeMataKuliah = (index: number) => {
    if (formData.mataKuliah.length > 1) {
      const newMataKuliah = formData.mataKuliah.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        mataKuliah: newMataKuliah
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nama.trim()) {
      toast.error('Nama kurikulum harus diisi');
      return;
    }

    if (!formData.deskripsi.trim()) {
      toast.error('Deskripsi harus diisi');
      return;
    }

    const filteredMataKuliah = formData.mataKuliah.filter(mk => mk.trim() !== '');
    if (filteredMataKuliah.length === 0) {
      toast.error('Minimal satu mata kuliah harus diisi');
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        ...formData,
        mataKuliah: filteredMataKuliah
      };

      if (isEditing && id) {
        await updateKurikulum(id, dataToSubmit);
        toast.success('Kurikulum berhasil diperbarui');
      } else {
        await addKurikulum(dataToSubmit);
        toast.success('Kurikulum berhasil ditambahkan');
      }
      navigate('/dashboard/kurikulums');
    } catch (error) {
      console.error('Error saving kurikulum:', error);
      toast.error(isEditing ? 'Gagal memperbarui kurikulum' : 'Gagal menambahkan kurikulum');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/kurikulums')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} className="mr-1" />
          Kembali ke Daftar Kurikulum
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit Kurikulum' : 'Tambah Kurikulum Baru'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kurikulum <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="nama"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Contoh: Pemrograman Web"
            />
          </div>

          <div>
            <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              id="deskripsi"
              name="deskripsi"
              value={formData.deskripsi}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Deskripsi kurikulum..."
            />
          </div>

          

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Mata Kuliah <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addMataKuliah}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Plus size={16} className="mr-1" />
                Tambah Mata Kuliah
              </button>
            </div>
            <div className="space-y-3">
              {formData.mataKuliah.map((mk, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={mk}
                    onChange={(e) => handleMataKuliahChange(index, e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder={`Mata kuliah ${index + 1}`}
                  />
                  {formData.mataKuliah.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMataKuliah(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate('/dashboard/kurikulums')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {isEditing ? 'Perbarui' : 'Simpan'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KurikulumForm;
