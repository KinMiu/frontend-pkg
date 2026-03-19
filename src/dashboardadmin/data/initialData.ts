import { Faculty, Achievement, Event } from '../types';

export const initialFacultyData: Faculty[] = [
  {
    id: '1',
    name: 'Dr. Ahmad Saputra',
    nidn: '0123456789',
    fields: ['Teknik Informatika', 'Artificial Intelligence'],
    position: 'Kepala Departemen',
    email: 'ahmad.saputra@university.ac.id',
    phone: '081234567890',
    address: 'Jl. Kampus No. 1, Kota Universitas',
    education: [
      {
        degree: 'S3',
        institution: 'Universitas Negeri Jakarta',
        year: '2015',
        field: 'Computer Science'
      },
      {
        degree: 'S2',
        institution: 'Institut Teknologi Bandung',
        year: '2010',
        field: 'Information Systems'
      }
    ],
    courses: ['Algoritma Pemrograman', 'Artificial Intelligence', 'Machine Learning'],
    publications: [
      {
        title: 'Implementation of Deep Learning in Agricultural IoT',
        link: 'https://example.org/publication/1',
        year: '2022'
      },
      {
        title: 'Smart Campus Design Using IoT',
        link: 'https://example.org/publication/2',
        year: '2021'
      }
    ]
  },
  {
    id: '2',
    name: 'Dr. Siti Rahayu',
    nidn: '0123456788',
    fields: ['Sistem Informasi', 'Data Science'],
    position: 'Dosen Tetap',
    email: 'siti.rahayu@university.ac.id',
    phone: '081234567891',
    address: 'Jl. Kampus No. 2, Kota Universitas',
    education: [
      {
        degree: 'S3',
        institution: 'Universitas Indonesia',
        year: '2018',
        field: 'Information Systems'
      }
    ],
    courses: ['Manajemen Sistem Informasi', 'Database Management', 'Business Intelligence'],
    publications: [
      {
        title: 'Data Mining for Student Performance Analysis',
        link: 'https://example.org/publication/3',
        year: '2023'
      }
    ]
  },
  {
    id: '3',
    name: 'Prof. Budi Santoso',
    nidn: '0123456787',
    fields: ['Teknik Elektro', 'Robotika'],
    position: 'Guru Besar',
    email: 'budi.santoso@university.ac.id',
    phone: '081234567892',
    address: 'Jl. Kampus No. 3, Kota Universitas',
    education: [
      {
        degree: 'S3',
        institution: 'Massachusetts Institute of Technology',
        year: '2005',
        field: 'Electrical Engineering'
      }
    ],
    courses: ['Elektronika Dasar', 'Teori Rangkaian', 'Robotika'],
    publications: [
      {
        title: 'Power Management in Smart Grids',
        link: 'https://example.org/publication/4',
        year: '2020'
      },
      {
        title: 'Robotics for Education',
        link: 'https://example.org/publication/5',
        year: '2019'
      }
    ]
  }
];

export const initialAchievementData: Achievement[] = [
  {
    id: '1',
    judul: 'Juara 1 Hackathon Nasional',
    tahun: '8 Maret 2023',
    mahasiswa: ['John Doe', 'Jane Smith'],
    deskripsi: 'Mengembangkan solusi AI untuk pertanian dengan menggunakan teknologi IoT dan machine learning untuk meningkatkan hasil panen dan penggunaan air yang efisien.',
    foto: 'https://images.pexels.com/photos/7103/writing-notes-idea-conference.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '2',
    judul: 'Medali Emas Olimpiade Matematika',
    tahun: '15 Juni 2023',
    mahasiswa: ['Muhammad Rizki'],
    deskripsi: 'Menjadi perwakilan Indonesia pada International Mathematics Olympiad dan berhasil meraih medali emas untuk kategori persamaan diferensial.',
    foto: 'https://images.pexels.com/photos/6238297/pexels-photo-6238297.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '3',
    judul: 'Best Paper Award pada Konferensi Internasional',
    tahun: '22 September 2023',
    mahasiswa: ['Dewi Anggraini', 'Budi Pratama', 'Anisa Widodo'],
    deskripsi: 'Paper dengan judul "Sustainable Urban Planning Using Machine Learning" mendapatkan penghargaan Best Paper pada International Conference on Smart Cities.',
    foto: 'https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
];

export const initialEventData: Event[] = [
  {
    id: '1',
    nama: 'Cybersecurity Workshop',
    foto: 'https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg',
    deskripsi: 'Workshop keamanan siber dengan praktisi keamanan profesional.',
    tanggal: '10 Jul 2024',
    lokasi: 'Lab Network',
    jenis: 'Workshop'
  },
  {
    id: '2',
    nama: 'Seminar Artificial Intelligence',
    foto: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg',
    deskripsi: 'Seminar tentang perkembangan terbaru di bidang AI dan implementasinya.',
    tanggal: '15 Aug 2024',
    lokasi: 'Aula Utama',
    jenis: 'Seminar'
  },
  {
    id: '3',
    nama: 'Workshop Mobile Development',
    foto: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
    deskripsi: 'Pelatihan pengembangan aplikasi mobile dengan React Native.',
    tanggal: '20 Sep 2024',
    lokasi: 'Lab Mobile Computing',
    jenis: 'Workshop'
  }
];