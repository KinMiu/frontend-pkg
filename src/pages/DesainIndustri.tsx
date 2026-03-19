import React, { useState, useEffect } from 'react';
import CertificationTable from '../components/CertificationTable';
import { industrialDesignAPI } from '../services/api';
import { Certification } from '../types';

const DesainIndustri = () => {
  const [data, setData] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await industrialDesignAPI.getAll();
        setData(response);
        setError(null);
      } catch (err) {
        setError('Failed to load industrial design data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return <CertificationTable data={data} title="Desain Industri" />;
};

export default DesainIndustri