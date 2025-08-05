"use client";

import { useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Komponen untuk badge status baru
const StatusBadge = ({ status }) => {
  if (status === "Selesai") {
    return (
      <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full">
        Selesai
      </span>
    );
  }
  if (status === "Revisi") {
    return (
      <span className="px-2 py-1 font-semibold leading-tight text-yellow-800 bg-yellow-100 rounded-full">
        Revisi
      </span>
    );
  }
  return (
    <span className="px-2 py-1 font-semibold leading-tight text-gray-700 bg-gray-100 rounded-full">
      Belum Dinilai
    </span>
  );
};

// Komponen Utama Halaman
import { CheckCircle } from "phosphor-react";

export default function MyProgressPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressHistory, setProgressHistory] = useState([]);
  // Ambil enrollmentId siswa dari Supabase (user login)
  const fetchProgressHistory = useCallback(async () => {
    try {
      const supabase = await createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      // Ambil user_id
      const userId = session.user.id;
      // Ambil semua enrollment siswa ini
      const { data: enrollments, error: enrollErr } = await supabase
        .from("enrollments")
        .select("enrollment_id, courses(nama_course)")
        .eq("id_siswa", userId);
      if (enrollErr || !enrollments) return;
      // Ambil semua progress dari semua enrollment
      let allProgress = [];
      for (const enr of enrollments) {
        const res = await fetch(`/api/progress?enrollmentId=${enr.enrollment_id}`);
        const result = await res.json();
        if (result.data && Array.isArray(result.data)) {
          allProgress = allProgress.concat(
            result.data.map((rec) => ({
              ...rec,
              courseName: enr.courses?.nama_course || "",
            }))
          );
        }
      }
      // Urutkan terbaru dulu
      allProgress.sort((a, b) => new Date(b.record_date) - new Date(a.record_date));
      setProgressHistory(allProgress);
    } catch (e) {
      setProgressHistory([]);
    }
  }, []);

  const fetchMySubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/submissions/my-submissions");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Gagal mengambil data nilai");
      }
      setSubmissions(data.data || []);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMySubmissions();
    fetchProgressHistory();
  }, [fetchMySubmissions, fetchProgressHistory]);

  if (loading) return <div>Memuat data nilai dan progres...</div>;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">Nilai & Progres Saya</h2>
        <p className="text-gray-500 mt-1">Lihat rekapitulasi nilai tugas dan catatan progres dari semua kursus Anda.</p>
      </div>

      <div className="space-y-8">
        {/* Nilai Tugas */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Status Tugas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-slate-100">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">Nama Tugas</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Kursus</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Status</th>
                  <th scope="col" className="px-6 py-3 font-semibold">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length > 0 ? (
                  submissions.map((sub) => (
                    <tr
                      key={sub.submission_id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{sub.assignments.judul_tugas}</td>
                      <td className="px-6 py-4">{sub.assignments.courses.nama_course}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="px-6 py-4">{sub.feedback ?? '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      Anda belum mengumpulkan tugas apa pun.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Riwayat Progres Materi */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Progres Materi</h3>
          <div className="relative border-l-2 border-slate-200 ml-3">
            {progressHistory.length > 0 ? (
              progressHistory.map((item) => (
                <div key={item.record_id} className="mb-8 flex items-start relative">
                  <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-green-100 rounded-full ring-8 ring-white mt-1">
                    <CheckCircle className="ph-bold ph-check-circle text-green-600" size={20} />
                  </span>
                  <div className="ml-4 flex-1">
                    <h4 className="flex items-center mb-1 text-base font-semibold text-gray-900">
                      {item.note}
                      {item.courseName && (
                        <span className="ml-2 text-xs text-gray-500">di "{item.courseName}"</span>
                      )}
                    </h4>
                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400">
                      {item.record_date ? new Date(item.record_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                    </time>
                  </div>
                </div>
              ))
            ) : (
              <div className="ml-8 text-gray-400">Belum ada catatan progres materi.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
