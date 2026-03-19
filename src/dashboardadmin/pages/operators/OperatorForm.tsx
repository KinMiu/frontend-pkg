import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCampusData } from '../../contexts/CampusDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface OperatorFormData {
  _id?: string;
  satminkal: string;
  npsn: string;
  email: string;
  password: string;
  latitude: string;
  longitude: string;
  linkGoogleMaps: string;
}

const emptyOperator: OperatorFormData = {
  satminkal: '',
  npsn: '',
  email: '',
  password: '',
  latitude: '',
  longitude: '',
  linkGoogleMaps: '',
};

const OperatorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addOperator, updateOperator, getOperatorById } = useCampusData();

  const [formData, setFormData] = useState<OperatorFormData>(emptyOperator);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!id;

  useEffect(() => {
    if (user?.role === 'operator') {
      navigate('/dashboard', { replace: true });
    }
  }, [user?.role, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (isEditing && id) {
        try {
          const existing = await getOperatorById(id);
          if (existing) {
            setFormData({
              _id: existing._id,
              satminkal: existing.satminkal || '',
              npsn: existing.npsn || '',
              email: (existing as { email?: string }).email || '',
              password: '',
              latitude: (existing as { latitude?: string }).latitude || '',
              longitude: (existing as { longitude?: string }).longitude || '',
              linkGoogleMaps: (existing as { linkGoogleMaps?: string }).linkGoogleMaps || '',
            });
          } else {
            navigate('/dashboard/operators');
            toast.error('Data operator tidak ditemukan');
          }
        } catch (error) {
          console.error('Error fetching operator:', error);
          toast.error('Gagal mengambil data operator');
          navigate('/dashboard/operators');
        }
      }
    };

    fetchData();
  }, [id, getOperatorById, navigate, isEditing]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.satminkal.trim()) newErrors.satminkal = 'SATMINKAL wajib diisi';
    if (!formData.npsn.trim()) newErrors.npsn = 'NPSN wajib diisi';
    if (!isEditing && !formData.email.trim()) newErrors.email = 'Email wajib diisi (untuk login operator)';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Format email tidak valid';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Periksa kembali inputan!');
      return;
    }

    try {
      const payload: Record<string, string> = {
        satminkal: formData.satminkal.trim(),
        npsn: formData.npsn.trim(),
        latitude: formData.latitude.trim(),
        longitude: formData.longitude.trim(),
        linkGoogleMaps: formData.linkGoogleMaps.trim(),
      };
      if (formData.email.trim()) payload.email = formData.email.trim().toLowerCase();
      if (isEditing && formData.password) payload.password = formData.password;

      if (isEditing && id) {
        await updateOperator(id, payload);
        toast.success('Data operator berhasil diperbarui');
      } else {
        await addOperator(payload);
        toast.success('Data operator berhasil ditambahkan. Password default: 12345678');
      }

      navigate('/dashboard/operators');
    } catch (err) {
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Link to="/dashboard/operators" className="mr-4 text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Data Operator' : 'Tambah Data Operator'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="satminkal" className="block text-sm font-medium text-gray-700">
                SATMINKAL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="satminkal"
                name="satminkal"
                value={formData.satminkal}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.satminkal ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="Nama SATMINKAL"
              />
              {errors.satminkal && <p className="mt-1 text-sm text-red-600">{errors.satminkal}</p>}
            </div>
            <div>
              <label htmlFor="npsn" className="block text-sm font-medium text-gray-700">
                NPSN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="npsn"
                name="npsn"
                value={formData.npsn}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.npsn ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="NPSN"
              />
              {errors.npsn && <p className="mt-1 text-sm text-red-600">{errors.npsn}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email (untuk login operator) {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                placeholder="operator@sekolah.sch.id"
              />
              {!isEditing && <p className="mt-1 text-xs text-gray-500">Password default: 12345678</p>}
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                Latitude (untuk peta)
              </label>
              <input
                type="text"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Contoh: -7.5624231"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                Longitude (untuk peta)
              </label>
              <input
                type="text"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Contoh: 111.4550711"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="linkGoogleMaps" className="block text-sm font-medium text-gray-700">
                Link Google Maps
              </label>
              <input
                type="url"
                id="linkGoogleMaps"
                name="linkGoogleMaps"
                value={formData.linkGoogleMaps}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>
            {isEditing && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password baru (kosongkan jika tidak ubah)
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  placeholder="Min. 6 karakter"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-end gap-4">
            <Link
              to="/dashboard/operators"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isEditing ? 'Perbarui Data' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OperatorForm;

