// -------- User Types --------
export interface User {
  username: string;
  role: 'admin' | 'dosen' | 'pendaftaran' | 'operator';
  /** Role login tetap dosen; ini label posisi dari data guru (PENDIDIK, dll). */
  facultyPosition?: string;
  facultyId?: string;
  nuptk?: string;
  name?: string;
  operatorId?: string;
  satminkal?: string;
}
// -------- Faculty Related Types --------

export interface EmployeeDocument {
  _id?: string;
  namaDokumen: string;
  fileData: string;
  fileType: string;
}

export interface Faculty {
  _id: string;
  name: string;
  jenisKelamin?: string;
  nuptk?: string;
  nip?: string;
  nrg?: string;
  satminkal?: string;
  position: string;
  foto?: string;
  education?: Education[];
  courses?: string[];

  // Employee document categories
  identitasPegawai?: EmployeeDocument[];
  skCpns?: EmployeeDocument[];
  skPns?: EmployeeDocument[];
  skPppk?: EmployeeDocument[];
  riwayatPangkat?: EmployeeDocument[];
  riwayatJabatan?: EmployeeDocument[];
  riwayatGaji?: EmployeeDocument[];
  pendidikanUmum?: EmployeeDocument[];
  diklat?: EmployeeDocument[];
  suamiIstri?: EmployeeDocument[];
  aktaAnak?: EmployeeDocument[];
  penilaianPrestasi?: EmployeeDocument[];
  penetapanAngkaKredit?: EmployeeDocument[];
  dokumenTambahan?: EmployeeDocument[];

  createdAt?: string;
  updatedAt?: string;
}

export interface Education {
  _id?: string;
  degree: string;         // e.g., "S1", "S2", "PhD"
  institution: string;    // e.g., "Universitas ABC"
  year: string;           // e.g., "2020"
  field?: string;         // optional: "Computer Science"
}

export interface Publication {
  _id?: string;
  title: string;
  year: string;
  link?: string;
}

export interface CommunityService {
  _id?: string;
  judulPengabdian: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  deskripsi: string;
  gambarPengabdian: string[];
}

// -------- Achievement Type --------

export interface Achievement {
  _id: string;
  judul: string;
  tahun: string;
  mahasiswa: string[];     // array of names
  deskripsi: string;
  foto: string;
  satminkal?: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Event Type --------

export interface Event {
  _id: string;
  nama: string;
  foto: string;
  /** Daftar foto kegiatan (maks 30). Jika ada, `foto` biasanya = foto pertama */
  fotos?: string[];
  deskripsi: string;
  tanggal: string;
  lokasi: string;
  jenis: string;           // e.g., "Seminar", "Workshop"
  /** Nama program kegiatan (diisi dari data Program) */
  program?: string;
  satminkal?: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Pengumuman Type --------
export interface Pengumuman {
  _id: string;
  judul: string;
  foto: string;
  fotos?: string[];
  deskripsi: string;
  tanggal: string;
  lokasi?: string;
  jenis: string;
  satminkal?: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Partner Type --------

export interface Partner {
  _id: string;
  name: string;
  logo: string;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Statistik Type --------
export interface Statistik {
  _id: string;
  name: string;
  value: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Featured video (YouTube) --------
export interface FeaturedVideo {
  _id: string;
  title: string;
  youtubeUrl: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Testimonial Type --------

export interface Testimonial {
  _id: string;
  name: string;
  tahunlulus: string;
  pekerjaan: string;
  perusahaan: string;
  image: string;
  testimoni: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Greeting (Kata Pengantar) Type --------
export interface Greeting {
  _id: string;
  nama: string;
  jabatan: string;
  kataSambutan: string;
  foto: string;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Intellectual Property Types --------

export interface IntellectualProperty {
  _id: string;
  title: string;
  date: string;
  number: string;
  authors: string[];
  driveUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** HKI (Hak Kekayaan Intelektual) - Indonesian form fields */
export interface HKI {
  _id?: string;
  judulHKI: string;
  tanggalHKI: string;
  nomorHKI: string;
  linkDriveHKI?: string;
}
export interface Patent extends IntellectualProperty {}
export interface IndustrialDesign extends IntellectualProperty {}

// -------- RPS Type --------

export interface RPS {
  _id: string;
  courseName: string;
  pdfFile: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Surat {
  _id: string;
  judul: string;
  tanggal?: string;
  pdfFile: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Facility {
  _id: string;
  nama: string;
  deskripsi: string;
  foto: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Banner {
  _id: string;
  nama?: string;
  foto: string;
  isActive?: boolean;
  order?: number;
  /** Posisi crop di hero: nilai CSS object-position (mis. "50% 50%") */
  imagePosition?: string;
  /** Zoom gambar di hero (1 = 100%) */
  imageScale?: number;
  /** Sembunyikan teks hero saat banner ini aktif */
  hideHeroText?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Kurikulum {
  _id: string;
  nama: string;
  deskripsi: string;
  semester: number;
  mataKuliah: string[];
  createdAt?: string;
  updatedAt?: string;
}

// -------- Program Pembelajaran Type --------
export interface Program {
  _id: string;
  title: string;
  description: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Struktur Jabatan Type --------
export interface Structural {
  _id: string;
  nama: string;
  jabatan: string;
  foto: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

// -------- Perangkat Ajar Type --------
export interface PerangkatAjar {
  _id: string;
  judul: string;
  deskripsi?: string;
  kategori?: string;
  filePath: string;
  originalName: string;
  mimeType?: string;
  fileSize?: number;
  createdAt?: string;
  updatedAt?: string;
}