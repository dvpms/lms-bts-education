"use client";

import { useEffect, useState, useCallback } from "react";

// Komponen untuk Form Tambah Catatan
const ProgressForm = ({ enrollmentId, onProgressAdded }) => {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollment_id: enrollmentId, note }),
      });
      if (!response.ok) throw new Error("Gagal menyimpan catatan");
      alert("Catatan progres berhasil disimpan!");
      onProgressAdded();
      setNote("");
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border-t">
      <h4 className="font-semibold mb-2">Tambah Catatan Progres Baru</h4>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows="3"
        className="w-full p-2 border rounded"
        placeholder="Contoh: Selesai Unit 5, perlu latihan di bagian rekursif."
        required
      ></textarea>
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {submitting ? "Menyimpan..." : "Simpan Catatan"}
      </button>
    </form>
  );
};

// Komponen Utama Halaman
export default function ProgressReportPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState("");
  const [progressRecords, setProgressRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Ambil daftar kursus milik pengajar
  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses(data.data || []);
    };
    fetchCourses();
  }, []);

  // 2. Ambil daftar siswa yang terdaftar saat kursus dipilih
  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedEnrollment("");
    setEnrollments([]);
    setProgressRecords([]);
    if (!courseId) return;

    // API ini perlu kita buat untuk mengambil pendaftaran (enrollment)
    const res = await fetch(`/api/enrollments?courseId=${courseId}`);
    const data = await res.json();
    setEnrollments(data.data || []);
  };

  // 3. Ambil catatan progres saat siswa dipilih
  const handleStudentChange = async (enrollmentId) => {
    setSelectedEnrollment(enrollmentId);
    setProgressRecords([]);
    if (!enrollmentId) return;

    setLoading(true);
    const res = await fetch(`/api/progress?enrollmentId=${enrollmentId}`);
    const data = await res.json();
    setProgressRecords(data.data || []);
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Laporan Progres Siswa</h1>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        {/* Filter Dropdown */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium">Pilih Kursus:</label>
            <select
              onChange={(e) => handleCourseChange(e.target.value)}
              value={selectedCourse}
              className="w-full p-2 border rounded mt-1"
            >
              <option value="">-- Pilih Kursus --</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.nama_course}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">Pilih Siswa:</label>
            <select
              onChange={(e) => handleStudentChange(e.target.value)}
              value={selectedEnrollment}
              className="w-full p-2 border rounded mt-1"
              disabled={!selectedCourse}
            >
              <option value="">-- Pilih Siswa --</option>
              {enrollments.map((e) => (
                <option key={e.enrollment_id} value={e.enrollment_id}>
                  {e.users.nama_lengkap}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tampilan Riwayat Progres */}
        {selectedEnrollment && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold">Riwayat Progres</h3>
            {loading ? (
              <p>Memuat...</p>
            ) : (
              <div className="mt-4 space-y-3">
                {progressRecords.length > 0 ? (
                  progressRecords.map((rec) => (
                    <div
                      key={rec.record_id}
                      className="p-3 bg-slate-100 rounded-md"
                    >
                      <p className="text-gray-800">{rec.note}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Dicatat pada:{" "}
                        {new Date(rec.record_date).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>Belum ada catatan progres untuk siswa ini.</p>
                )}
              </div>
            )}
            <ProgressForm
              enrollmentId={selectedEnrollment}
              onProgressAdded={() => handleStudentChange(selectedEnrollment)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
