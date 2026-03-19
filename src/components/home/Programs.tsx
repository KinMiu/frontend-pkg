import React, { useEffect, useMemo, useState } from "react";
import { programAPI } from "../../services/api";
import type { Program } from "../../types";
import {
  BookOpen,
  Users,
  Trophy,
  Heart,
  GraduationCap,
  Book,
} from "lucide-react";

const Programs = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await programAPI.getAll(true);
        setPrograms(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch programs", e);
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sorted = useMemo(() => {
    return [...programs].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [programs]);

  const iconChoices = useMemo(
    () => [BookOpen, Users, Trophy, Heart, GraduationCap, Book],
    []
  );

  return (
    <div className="mt-1 max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
        Kelompok Kerja Guru
      </h2>
      <p className="text-center text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
        Kelompok Kerja Guru yang ada di PKG Kecamatan Barat
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-500">
            Memuat program...
          </div>
        ) : sorted.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            Belum ada program yang ditampilkan.
          </div>
        ) : (
          sorted.map((program) => {
            const IconComponent =
              iconChoices[Math.floor(Math.random() * iconChoices.length)];
            return (
              <button
                type="button"
                key={program._id}
                onClick={() => setSelectedProgram(program)}
                className="flex flex-col p-6 bg-white rounded-xl shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <IconComponent className="h-5 w-5" />
                  </span>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {program.title}
                  </h3>
                </div>
                <p className="mt-3 text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {program.description}
                </p>
              </button>
            );
          })
        )}
      </div>

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
          <div className="max-w-lg w-full rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Detail Program
              </h3>
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <h4 className="text-xl font-bold text-gray-900">
                {selectedProgram.title}
              </h4>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {selectedProgram.description}
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProgram(null)}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Programs;
