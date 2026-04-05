/** Nilai posisi tersimpan di database & dipakai login (role tetap `dosen`). */
export const FACULTY_POSITION_OPTIONS = [
  'PENDIDIK',
  'KEPALA SATUAN PENDIDIKAN',
  'TENAGA PENDIDIKAN',
] as const;

export type FacultyPositionValue = (typeof FACULTY_POSITION_OPTIONS)[number];

export function normalizeFacultyPosition(raw?: string | null): FacultyPositionValue {
  const s = (raw || '').trim();
  return (FACULTY_POSITION_OPTIONS as readonly string[]).includes(s)
    ? (s as FacultyPositionValue)
    : 'PENDIDIK';
}

/** Teks tampilan di tabel/detail (data lama "Guru" dianggap PENDIDIK). */
export function formatFacultyPositionDisplay(raw?: string | null): string {
  return normalizeFacultyPosition(raw);
}
