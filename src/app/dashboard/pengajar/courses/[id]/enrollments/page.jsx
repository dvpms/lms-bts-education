"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";

// Komponen untuk Form Tambah Peserta
const AddEnrollmentForm = ({ courseId, onEnrollmentAdded }) => {
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Ambil daftar semua siswa yang ada di sistem
  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      const res = await fetch("/api/users?role=siswa");
      const data = await res.json();
      setAllStudents(data.data || []);
      setLoadingStudents(false);
    };
    fetchStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert("Silakan pilih siswa untuk didaftarkan.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_course: courseId,
          id_siswa: selectedStudent,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal mendaftarkan siswa");
      }
      alert("Siswa berhasil didaftarkan!");
      onEnrollmentAdded();
      setSelectedStudent("");
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border-t">
      <h4 className="font-semibold mb-2">Tambah Peserta Baru</h4>
      <div className="flex gap-2 items-end">
        <div className="flex-grow">
          <label className="block text-sm font-medium">Pilih Siswa:</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="w-full p-2 border rounded mt-1"
            disabled={loadingStudents}
          >
            <option value="">{loadingStudents ? "Memuat siswa..." : "-- Pilih Siswa --"}</option>
            {!loadingStudents && allStudents.map((s) => (
              <option key={s.user_id} value={s.user_id}>
                {s.nama_lengkap} ({s.email})
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 h-10"
        >
          {submitting ? "Mendaftarkan..." : "Daftarkan"}
        </button>
      </div>
    </form>
  );
};

// Komponen Utama Halaman
export default function ManageEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const { id: courseId } = params;

  const fetchEnrollments = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/enrollments?courseId=${courseId}`);
      const data = await res.json();
      setEnrollments(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Kelola Peserta Kursus</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold">Daftar Siswa Terdaftar</h3>
        {loading ? (
          <p>Memuat...</p>
        ) : (
          <div className="mt-4 space-y-3">
            {enrollments.length > 0 ? (
              enrollments.map((e) => (
                <div
                  key={e.enrollment_id}
                  className="p-3 bg-slate-100 rounded-md flex justify-between items-center"
                >
                  <p>{e.users.nama_lengkap}</p>
                  <button className="text-red-500 text-sm hover:underline">
                    Keluarkan
                  </button>
                </div>
              ))
            ) : (
              <p>Belum ada siswa yang terdaftar di kursus ini.</p>
            )}
          </div>
        )}
        {/* Hanya render form jika courseId sudah valid */}
        {courseId ? (
          <AddEnrollmentForm
            courseId={courseId}
            onEnrollmentAdded={fetchEnrollments}
          />
        ) : (
          <p className="text-red-500 mt-4">courseId tidak ditemukan, silakan akses halaman dengan URL yang benar.</p>
        )}
      </div>
    </div>
  );
}
