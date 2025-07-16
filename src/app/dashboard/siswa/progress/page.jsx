"use client";

import { useEffect, useState, useCallback } from "react";

// Komponen untuk badge status
const StatusBadge = ({ submission }) => {
  if (submission.nilai !== null) {
    return (
      <span className="px-2 py-1 font-semibold leading-tight text-green-700 bg-green-100 rounded-full">
        Sudah Dinilai
      </span>
    );
  }
  return (
    <span className="px-2 py-1 font-semibold leading-tight text-yellow-700 bg-yellow-100 rounded-full">
      Menunggu Penilaian
    </span>
  );
};

// Komponen Utama Halaman
export default function MyProgressPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, [fetchMySubmissions]);

  if (loading) return <div>Memuat data nilai dan progres...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Nilai & Progres Saya</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">
          Rekapitulasi Nilai Tugas
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Nama Tugas
                </th>
                <th scope="col" className="px-6 py-3">
                  Kursus
                </th>
                <th scope="col" className="px-6 py-3">
                  Tanggal Kumpul
                </th>
                <th scope="col" className="px-6 py-3">
                  Status
                </th>
                <th scope="col" className="px-6 py-3">
                  Nilai
                </th>
                <th scope="col" className="px-6 py-3">
                  Feedback
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.length > 0 ? (
                submissions.map((sub) => (
                  <tr
                    key={sub.submission_id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                    >
                      {sub.assignments.judul_tugas}
                    </th>
                    <td className="px-6 py-4">
                      {sub.assignments.courses.nama_course}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge submission={sub} />
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {sub.nilai ?? "-"}
                    </td>
                    <td className="px-6 py-4">{sub.feedback ?? "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Anda belum mengumpulkan tugas apa pun.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
