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
  createdAt?: string;
  updatedAt?: string;
}

export interface Education {
  _id?: string;
  degree: string;
  institution: string;
  year: string;
  field?: string;
}

export interface Publication {
  _id?: string;
  title: string;
  link?: string;
  year?: string;
}

export interface Achievement {
  _id: string;
  judul: string;
  tahun: string;
  mahasiswa: string[];
  deskripsi: string;
  foto: string;
  satminkal?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  _id: string;
  nama: string;
  foto: string;
  /** Daftar foto kegiatan (maks 30). Jika ada, `foto` biasanya = foto pertama */
  fotos?: string[];
  deskripsi: string;
  tanggal: string;
  lokasi: string;
  jenis: string;
  /** Nama program kegiatan (diisi dari data Program) */
  program?: string;
  satminkal?: string;
  /** Detail tambahan untuk modal kegiatan (opsional) */
  detailContent?: {
    overview?: string;
    sessions?: string[];
    equipment?: string[];
  };
  /** Link pendaftaran/tautan terkait kegiatan (opsional) */
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface Partner {
  _id: string;
  name: string;
  logo: string;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Statistik {
  _id: string;
  name: string;
  value: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeaturedVideo {
  _id: string;
  title: string;
  youtubeUrl: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

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

export interface Greeting {
  _id: string;
  nama: string;
  jabatan: string;
  kataSambutan: string;
  foto: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Certification {
  _id: string;
  title: string;
  date: string;
  number: string;
  authors: string[];
  driveUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

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
  /** Posisi crop di hero: nilai CSS object-position */
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

export interface Program {
  _id: string;
  title: string;
  description: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Structural {
  _id: string;
  nama: string;
  jabatan: string;
  foto: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

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