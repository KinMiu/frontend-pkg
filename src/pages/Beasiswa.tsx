import React from "react";
import { FaGraduationCap, FaEnvelope, FaPhone, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const scholarships = [
  {
    title: "Beasiswa KIP Kuliah",
    description:
      "Beasiswa KIP Kuliah diberikan kepada mahasiswa berprestasi dari keluarga kurang mampu untuk mendapatkan pendidikan tinggi tanpa biaya.",
    requirements: [
      "Warga Negara Indonesia",
      "Lulusan SMA/SMK sederajat",
      "Memiliki Kartu Indonesia Pintar (KIP) atau terdaftar dalam DTKS",
      "Lulus seleksi masuk di Universitas Bandar Lampung",
    ],
  },
  {
    title: "Beasiswa Reka Inovasi",
    description:
      "Beasiswa Reka Inovasi ditujukan bagi mahasiswa yang memiliki inovasi unggulan di bidang teknologi dan sains.",
    requirements: [
      "Mahasiswa aktif Universitas Bandar Lampung",
      "Memiliki karya inovatif di bidang teknologi",
      "Lulus seleksi proposal inovasi",
    ],
  },
  {
    title: "Beasiswa Fakultas",
    description:
      "Beasiswa Fakultas diberikan kepada mahasiswa berprestasi akademik dan non-akademik di Fakultas Ilmu Komputer.",
    requirements: [
      "IPK minimal 3.5",
      "Aktif dalam organisasi atau kegiatan akademik",
      "Rekomendasi dari dosen pembimbing",
    ],
  },
  {
    title: "Beasiswa Yayasan",
    description:
      "Beasiswa Yayasan diberikan oleh Yayasan Universitas Bandar Lampung untuk mahasiswa yang membutuhkan bantuan finansial.",
    requirements: [
      "Mahasiswa aktif Universitas Bandar Lampung",
      "Surat keterangan tidak mampu",
      "Lulus wawancara seleksi beasiswa",
    ],
  },
];

export default function Beasiswa() {
  return (
    <div className="mt-24 container mx-auto px-4 sm:px-8 lg:px-12 pb-16">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900 text-center flex items-center justify-center gap-3">
        <FaGraduationCap className="text-4xl sm:text-5xl mt-2" /> Informasi Beasiswa
      </h1>
      <p className="mt-2 mb-8 text-base sm:text-lg leading-7 text-gray-600 text-center">
        Prodi Informatika memberikan kesempatan bagi siswa prestasi untuk kuliah dengan jalur Beasiswa.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        {scholarships.map((scholarship, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-xl shadow-lg bg-white p-5 sm:p-6 border border-blue-300"
          >
            <h2 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-blue-800">{scholarship.title}</h2>
            <p className="text-sm sm:text-base text-gray-700">{scholarship.description}</p>
            <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-semibold text-blue-900">Persyaratan:</h3>
            <ul className="mt-2 space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-700">
              {scholarship.requirements.map((req, i) => (
                <li key={i} className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" /> {req}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      <div className="mt-12 sm:mt-16 p-6 sm:p-10 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-lg text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Kontak Kami</h2>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg">
          Jika Anda memiliki pertanyaan lebih lanjut mengenai beasiswa, silakan hubungi kami:
        </p>
        <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3 text-sm sm:text-lg">
          <p className="flex justify-center items-center gap-3">
            <FaEnvelope className="text-yellow-300" />
            <a href="mailto:beasiswa@ubl.ac.id" className="hover:underline">
              beasiswa@ubl.ac.id
            </a>
          </p>
          <p className="flex justify-center items-center gap-3">
            <FaPhone className="text-yellow-300" /> (0721) 123456
          </p>
        </div>
      </div>
    </div>
  );
}
