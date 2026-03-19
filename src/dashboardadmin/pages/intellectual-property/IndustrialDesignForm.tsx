import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { IndustrialDesign } from '../../types';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import ConfirmationDialog from '../../components/shared/ConfirmationDialog';

const emptyDesign: IndustrialDesign = {
  _id: '',
  title: '',
  date: '',
  number: '',
  authors: [],
  driveUrl: '',
};

const IndustrialDesignForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addIndustrialDesign, updateIndustrialDesign, getIndustrialDesignById } = useCampusData();
  
  const [design, setDesign] = useState<IndustrialDesign>(emptyDesign);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newAuthor, setNewAuthor] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  
  const isEditing = !!id;
  
  useEffect(() => {
    const fetchData = async () => {
      if (isEditing && id) {
        try {
          const existingDesign = await getIndustrialDesignById(id);
          if (existingDesign) {
            setDesign(existingDesign);
            setSelectedDate(new Date(existingDesign.date));
          } else {
            navigate('/dashboard/industrial-designs');
            toast.error('Desain industri tidak ditemukan');
          }
        } catch (error) {
          console.error('Error fetching industrial design:', error);
          toast.error('Gagal mengambil data desain industri');
          navigate('/dashboard/industrial-designs');
        }
      }
    };

    fetchData();
  }, [id, getIndustrialDesignById, navigate, isEditing]);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!design.title.trim()) newErrors.title = 'Judul desain industri wajib diisi';
    if (!selectedDate) newErrors.date = 'Tanggal wajib diisi';
    if (!design.number.trim()) newErrors.number = 'Nomor desain industri wajib diisi';
    if (design.authors.length === 0) newErrors.authors = 'Minimal satu penulis wajib diisi';
    if (!design.driveUrl.trim()) newErrors.driveUrl= 'URL wajib diisi';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDesign((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      setDesign(prev => ({
        ...prev,
        date: formatDate(date)
      }));
    }
  };

  const handleAddAuthor = () => {
    if (newAuthor.trim() !== '') {
      setDesign((prev) => ({
        ...prev,
        authors: [...prev.authors, newAuthor.trim()]
      }));
      setNewAuthor('');
      setErrors(prev => ({ ...prev, authors: undefined }));
    }
  };

  const handleRemoveAuthor = (index: number) => {
    setDesign((prev) => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
    }));
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
      if (isEditing && id) {
        await updateIndustrialDesign(id, design);
        toast.success('Desain industri berhasil diperbarui');
      } else {
        await addIndustrialDesign(design);
        toast.success('Desain industri berhasil ditambahkan');
      }
      navigate('/dashboard/industrial-designs');
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/dashboard/industrial-designs" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Desain Industri' : 'Tambah Desain Industri Baru'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Judul Desain Industri <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={design.title}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                dateFormat="yyyy-MM-dd"
                className={`mt-1 block w-full rounded-md border ${
                  errors.date ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                placeholderText="Pilih tanggal"
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>

            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700">
                Nomor Desain Industri <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="number"
                name="number"
                value={design.number}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.number ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              />
              {errors.number && <p className="mt-1 text-sm text-red-600">{errors.number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Penulis <span className="text-red-500">*</span>
              </label>
              
              {design.authors.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {design.authors.map((author, index) => (
                    <div key={index} className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1">
                      <span className="text-sm font-medium text-indigo-800">{author}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAuthor(index)}
                        className="ml-1 rounded-full p-1 text-indigo-700 hover:bg-indigo-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex">
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddAuthor();
                    }
                  }}
                  placeholder="Nama penulis"
                  className={`block w-full rounded-l-md border ${
                    errors.authors ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                />
                <button
                  type="button"
                  onClick={handleAddAuthor}
                  className="inline-flex items-center rounded-r-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  <Plus size={16} className="mr-2" />
                  Tambah
                </button>
              </div>
              {errors.authors && <p className="mt-1 text-sm text-red-600">{errors.authors}</p>}
            </div>

            <div>
              <label htmlFor="driveUrl" className="block text-sm font-medium text-gray-700">
                Link Google Drive <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                id="driveUrl"
                name="driveUrl"
                value={design.driveUrl || ''}
                
                onChange={handleChange}
                placeholder="https://drive.google.com/..."
                className={`mt-1 block w-full rounded-md border ${
                  errors.driveUrl ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              />
              {errors.driveUrl && <p className="mt-1 text-sm text-red-600">{errors.driveUrl}</p>}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
            <Link
              to="/dashboard/industrial-designs"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isEditing ? 'Perbarui Desain Industri' : 'Simpan Desain Industri'}
            </button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        isOpen={showSaveConfirm}
        title="Konfirmasi Simpan"
        message={`Apakah Anda yakin ingin ${isEditing ? 'memperbarui' : 'menyimpan'} desain industri ini?`}
        confirmLabel={isEditing ? 'Perbarui' : 'Simpan'}
        onConfirm={handleConfirmSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
};

export default IndustrialDesignForm;

