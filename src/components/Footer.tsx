import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { programAPI } from '../services/api';
import type { Program } from '../types';

const Footer = () => {
  const [programs, setPrograms] = useState<Program[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await programAPI.getAll(true);
        setPrograms(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch programs for footer', e);
        setPrograms([]);
      }
    };
    load();
  }, []);

  const topPrograms = useMemo(() => {
    return programs
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .slice(0, 4);
  }, [programs]);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Informasi PKG Barat</h3>
            <p className="text-gray-400 mb-4">
              PKG Barat merupakan wadah bagi para pendidik untuk berkumpul, berdiskusi, dan mengembangkan kompetensi profesional dalam dunia pendidikan.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/tentang" className="text-gray-400 hover:text-white">Tentang Kami</Link>
              </li>
              <li>
                <Link to="/guru" className="text-gray-400 hover:text-white">Guru</Link>
              </li>
              <li>
                <Link to="/program" className="text-gray-400 hover:text-white">Program Kegiatan</Link>
              </li>
              <li>
                <Link to="/kegiatan/galeri" className="text-gray-400 hover:text-white">Galery Kegiatan</Link>
              </li>
              <li>
                <Link to="/prestasi" className="text-gray-400 hover:text-white">Prestasi</Link>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h3 className="text-xl font-bold mb-4">Program</h3>
            <ul className="space-y-2">
              {topPrograms.length > 0 ? (
                topPrograms.map((p) => (
                  <li key={p._id}>
                    <Link to="/program" className="text-gray-400 hover:text-white">
                      {p.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">Belum ada program</li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400">
                <MapPin size={20} className="mr-2" />
                Jln. Slamet Kelurahan Tebon Kecamatan Barat Kabupaten Magetan
              </li>
              <li className="flex items-center text-gray-400">
                <Phone size={20} className="mr-2" />
                081252387717
              </li>
              <li className="flex items-center text-gray-400">
                <Mail size={20} className="mr-2" />
                pkgkecbarat@gmail.com
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} By Ardian Rahma Prasetya. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;