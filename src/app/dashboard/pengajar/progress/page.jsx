"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";

// Dummy data for demo
const dummyCourses = [
  { course_id: "python", nama_course: "Dasar Pemrograman Python" },
  { course_id: "react", nama_course: "Web Lanjutan dengan React" },
];
const dummyEnrollments = {
  python: [
    { enrollment_id: "e1", users: { nama_lengkap: "Budi Santoso" } },
    { enrollment_id: "e2", users: { nama_lengkap: "Siti Aminah" } },
  ],
  react: [{ enrollment_id: "e3", users: { nama_lengkap: "Rizky Pratama" } }],
};
const dummyProgress = {
  e1: [
    {
      record_id: "r1",
      note: "Selesai Unit 3: Looping dan Kondisi. Pemahaman sudah baik.",
      record_date: "2025-07-14",
    },
  ],
  e2: [],
  e3: [
    {
      record_id: "r2",
      note: "Selesai Unit 1: Pengenalan React.",
      record_date: "2025-07-10",
    },
  ],
};

export default function ProgressReportPage() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrollments, setEnrollments] = useState([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState("");
  const [progressRecords, setProgressRecords] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newDate, setNewDate] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Fetch courses from API and merge with dummy
  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await fetch("/api/courses");
        const data = await res.json();
        let dbCourses = data.data || [];
        // Gabungkan dummy dan db, hindari duplikat berdasarkan course_id
        const allCourses = [
          ...dbCourses,
          ...dummyCourses.filter(
            (d) => !dbCourses.some((c) => c.course_id === d.course_id)
          ),
        ];
        setCourses(allCourses);
      } catch {
        setCourses(dummyCourses);
      }
      setLoadingCourses(false);
    };
    fetchCourses();
  }, []);

  // Handle course change: fetch enrollments dari API dan gabungkan dummy
  const handleCourseChange = async (courseId) => {
    setSelectedCourse(courseId);
    setSelectedEnrollment("");
    setProgressRecords([]);
    setLoadingEnrollments(true);
    try {
      const res = await fetch(`/api/enrollments?courseId=${courseId}`);
      const data = await res.json();
      let dbEnrollments = data.data || [];
      // Gabungkan dummy dan db, hindari duplikat berdasarkan enrollment_id
      const dummy = dummyEnrollments[courseId] || [];
      const allEnrollments = [
        ...dbEnrollments,
        ...dummy.filter(
          (d) => !dbEnrollments.some((e) => e.enrollment_id === d.enrollment_id)
        ),
      ];
      setEnrollments(allEnrollments);
    } catch {
      setEnrollments(dummyEnrollments[courseId] || []);
    }
    setLoadingEnrollments(false);
  };

  // Handle student change: fetch progress dari API dan gabungkan dummy
  const handleStudentChange = async (enrollmentId) => {
    setSelectedEnrollment(enrollmentId);
    if (!enrollmentId) {
      setProgressRecords([]);
      return;
    }
    setLoadingProgress(true);
    try {
      const res = await fetch(`/api/progress?enrollmentId=${enrollmentId}`);
      const data = await res.json();
      let dbProgress = data.data || [];
      console.log("DB Progress:", dbProgress);
      const dummy = dummyProgress[enrollmentId] || [];
      // Gabungkan dummy dan db, hindari duplikat berdasarkan record_id
      const allProgress = [
        ...dbProgress,
        ...dummy.filter(
          (d) => !dbProgress.some((p) => p.record_id === d.record_id)
        ),
      ];
      setProgressRecords(allProgress);
    } catch {
      setProgressRecords(dummyProgress[enrollmentId] || []);
    }
    setLoadingProgress(false);
  };

  // Edit mode
  const handleEdit = (rec) => {
    setEditingId(rec.record_id);
    setEditNote(rec.note);
  };
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditNote("");
  };
  // Edit (PATCH ke API) dengan SweetAlert2
  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      const rec = progressRecords.find((r) => r.record_id === editingId);
      const res = await fetch("/api/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          record_id: editingId,
          note: editNote,
          record_date: rec?.record_date,
        }),
      });
      if (!res.ok) throw new Error("Gagal update catatan progres");
      const { data } = await res.json();
      setProgressRecords((prev) =>
        prev.map((r) =>
          r.record_id === editingId ? { ...r, note: data.note } : r
        )
      );
      Swal.fire({ icon: "success", title: "Berhasil", text: "Catatan progres berhasil diupdate!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal update catatan progres!" });
    }
    setEditingId(null);
    setEditNote("");
  };
  // Delete (DELETE ke API) dengan SweetAlert2
  const handleDelete = async (id) => {
    if (!id) return;
    const confirm = await Swal.fire({
      title: "Hapus catatan progres?",
      text: "Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      reverseButtons: true,
    });
    if (!confirm.isConfirmed) return;
    try {
      const res = await fetch("/api/progress", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ record_id: id }),
      });
      if (!res.ok) throw new Error("Gagal hapus catatan progres");
      setProgressRecords((prev) => prev.filter((r) => r.record_id !== id));
      Swal.fire({ icon: "success", title: "Berhasil", text: "Catatan progres berhasil dihapus!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal hapus catatan progres!" });
    }
  };
  // Add new (POST ke API) dengan SweetAlert2
  const handleAddProgress = async (e) => {
    e.preventDefault();
    if (!newNote || !newDate || !selectedEnrollment) return;
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollment_id: selectedEnrollment,
          note: newNote,
          record_date: newDate,
        }),
      });
      if (!res.ok) throw new Error("Gagal menambah catatan progres");
      const { data } = await res.json();
      setProgressRecords((prev) => [data, ...prev]);
      setNewNote("");
      setNewDate("");
      Swal.fire({ icon: "success", title: "Berhasil", text: "Catatan progres berhasil ditambahkan!", timer: 1500, showConfirmButton: false });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Gagal", text: "Gagal menambah catatan progres!" });
    }
  };

  // Get selected student name
  const studentName =
    selectedCourse && selectedEnrollment
      ? enrollments.find((e) => e.enrollment_id === selectedEnrollment)?.users
          ?.nama_lengkap || ""
      : "";

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Laporan Progres Siswa
          </h2>
          <p className="text-gray-500 mt-1">
            Pilih kursus dan siswa untuk melihat dan menambah catatan progres.
          </p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        {/* Filter Dropdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="course-select"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Pilih Kursus
            </label>
            <select
              id="course-select"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              value={selectedCourse}
              onChange={(e) => handleCourseChange(e.target.value)}
              disabled={loadingCourses}
            >
              <option value="">
                {loadingCourses ? "Memuat kursus..." : "-- Pilih Kursus --"}
              </option>
              {!loadingCourses &&
                courses.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.nama_course}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="student-select"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Pilih Siswa
            </label>
            <select
              id="student-select"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              value={selectedEnrollment}
              onChange={(e) => handleStudentChange(e.target.value)}
              disabled={!selectedCourse || loadingEnrollments}
            >
              <option value="">
                {loadingEnrollments ? "Memuat siswa..." : "-- Pilih Siswa --"}
              </option>
              {!loadingEnrollments &&
                enrollments.map((e) => (
                  <option key={e.enrollment_id} value={e.enrollment_id}>
                    {e.users?.nama_lengkap}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Tampilan Riwayat Progres */}
        {selectedEnrollment && (
          <div id="progress-view" className="mt-8 border-t pt-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Riwayat Progres untuk{" "}
              <span className="text-green-600">{studentName}</span>
            </h3>
            {loadingProgress ? (
              <div className="flex items-center gap-2 text-gray-500 mb-4">
                <svg
                  className="animate-spin h-5 w-5 text-gray-400"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Memuat progres...
              </div>
            ) : (
              <>
                <div id="progress-list" className="space-y-4">
                  {progressRecords.length > 0 ? (
                    progressRecords.map((rec) => (
                      <div
                        key={rec.record_id}
                        className="progress-item p-4 bg-slate-100 rounded-lg group"
                      >
                        {editingId === rec.record_id ? (
                          <div className="edit-mode">
                            <textarea
                              className="edit-note-input w-full p-2 border rounded"
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                className="cancel-edit-btn text-sm px-3 py-1 bg-gray-200 rounded-md"
                                onClick={handleCancelEdit}
                              >
                                Batal
                              </button>
                              <button
                                className="save-edit-btn text-sm px-3 py-1 bg-green-600 text-white rounded-md"
                                onClick={handleSaveEdit}
                              >
                                Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="view-mode flex justify-between items-start">
                            <div>
                              <p className="note-text text-gray-800">
                                {rec.note}
                              </p>
                              <p className="date-text text-xs text-gray-500 mt-1">
                                Dicatat pada:{" "}
                                {new Date(rec.record_date).toLocaleDateString(
                                  "id-ID",
                                  {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                className="edit-btn p-1 text-blue-600 rounded-full"
                                onClick={() => handleEdit(rec)}
                                title="Edit"
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                className="delete-btn p-1 text-red-600 rounded-full"
                                onClick={() => handleDelete(rec.record_id)}
                                title="Hapus"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>Belum ada catatan progres untuk siswa ini.</p>
                  )}
                </div>
                {/* Form Tambah Catatan Baru */}
                <form
                  id="progress-form"
                  className="mt-6"
                  onSubmit={handleAddProgress}
                >
                  <h4 className="text-lg font-bold text-gray-800 mb-2">
                    Tambah Catatan Progres Baru
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="progress-note"
                        className="block text-sm font-semibold text-gray-700 mb-1"
                      >
                        Catatan Progres
                      </label>
                      <textarea
                        id="progress-note"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        placeholder="Contoh: Selesai Unit 5, perlu latihan di bagian rekursif."
                        required
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      ></textarea>
                    </div>
                    <div>
                      <label
                        htmlFor="progress-date"
                        className="block text-sm font-semibold text-gray-700 mb-1"
                      >
                        Tanggal Progres
                      </label>
                      <input
                        type="date"
                        id="progress-date"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                    >
                      Simpan Catatan
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
  // ...end of file (remove extra closing brace)
}
